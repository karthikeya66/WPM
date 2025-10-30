/**
 * CLI Wrapper for Microsoft Dev Tunnels CLI
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import { CLIError, ERROR_CODES } from '../utils/errors';
import { DEV_TUNNELS_CONFIG } from '../config/constants';
import { AuthStatus, TunnelOptions } from '../types';
import { CLIInstaller } from './cli-installer';

const execAsync = promisify(exec);

export interface CLICommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class DevTunnelsCLIWrapper {
  private readonly cliName = DEV_TUNNELS_CONFIG.CLI_NAME;
  private readonly installCommand = DEV_TUNNELS_CONFIG.CLI_INSTALL_COMMAND;
  private readonly versionCommand = DEV_TUNNELS_CONFIG.CLI_VERSION_COMMAND;
  private readonly installer = new CLIInstaller();

  /**
   * Check if Dev Tunnels CLI is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      logger.debug('CLIWrapper', 'Checking if Dev Tunnels CLI is installed');
      
      const result = await this.executeCommand(this.versionCommand, [], { timeout: 10000 });
      const isInstalled = result.exitCode === 0 && result.stdout.includes('devtunnel');
      
      logger.info('CLIWrapper', `CLI installation status: ${isInstalled ? 'installed' : 'not installed'}`);
      return isInstalled;
    } catch (error) {
      logger.debug('CLIWrapper', 'CLI not found or error checking version', error);
      return false;
    }
  }

  /**
   * Install Dev Tunnels CLI using the installer service
   */
  async install(): Promise<void> {
    try {
      logger.info('CLIWrapper', 'Installing Microsoft Dev Tunnels CLI...');
      
      const result = await this.installer.install();
      
      if (!result.success) {
        throw new CLIError(
          result.error || 'Installation failed',
          ERROR_CODES.CLI_INSTALL_FAILED
        );
      }

      // Verify installation
      const isInstalled = await this.installer.verifyInstallation();
      if (!isInstalled) {
        throw new CLIError(
          'Installation completed but CLI verification failed',
          ERROR_CODES.CLI_INSTALL_FAILED
        );
      }

      logger.info('CLIWrapper', `${DEV_TUNNELS_CONFIG.SUCCESS.CLI_INSTALLED} (${result.method})`);
    } catch (error) {
      logger.error('CLIWrapper', 'Failed to install Dev Tunnels CLI', error);
      
      // Provide manual installation instructions
      const instructions = this.installer.getManualInstallationInstructions();
      logger.info('CLIWrapper', 'Manual installation instructions:', instructions);
      
      throw error instanceof CLIError ? error : new CLIError(
        `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.CLI_INSTALL_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Authenticate with Microsoft account
   */
  async authenticate(): Promise<AuthStatus> {
    try {
      logger.info('CLIWrapper', 'Starting Microsoft account authentication...');
      
      const result = await this.executeCommand(this.cliName, ['user', 'login'], {
        timeout: DEV_TUNNELS_CONFIG.AUTH_TIMEOUT
      });

      if (result.exitCode !== 0) {
        throw new CLIError(
          `Authentication failed: ${result.stderr}`,
          ERROR_CODES.AUTH_LOGIN_FAILED
        );
      }

      // Parse authentication result
      const authStatus = this.parseAuthenticationResult(result.stdout);
      
      if (authStatus.isAuthenticated) {
        logger.info('CLIWrapper', DEV_TUNNELS_CONFIG.SUCCESS.AUTH_SUCCESS);
      }

      return authStatus;
    } catch (error) {
      logger.error('CLIWrapper', 'Authentication failed', error);
      throw error instanceof CLIError ? error : new CLIError(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.AUTH_LOGIN_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check authentication status
   */
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      logger.debug('CLIWrapper', 'Checking authentication status');
      
      const result = await this.executeCommand(this.cliName, ['user', 'show'], {
        timeout: 10000
      });

      if (result.exitCode !== 0) {
        return { isAuthenticated: false, error: result.stderr };
      }

      return this.parseAuthenticationResult(result.stdout);
    } catch (error) {
      logger.debug('CLIWrapper', 'Error checking auth status', error);
      return { 
        isAuthenticated: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create a new tunnel
   */
  async createTunnel(port: number, options: TunnelOptions = {}): Promise<string> {
    try {
      logger.info('CLIWrapper', `Creating tunnel for port ${port}`, options);
      
      const args = ['host', '-p', port.toString()];
      
      // Add optional parameters
      if (options.name) {
        args.push('--name', options.name);
      }
      
      if (options.allowAnonymous) {
        args.push('--allow-anonymous');
      }

      if (options.accessControl === 'authenticated') {
        args.push('--access-control', 'authenticated');
      }

      const result = await this.executeCommand(this.cliName, args, {
        timeout: 30000
      });

      if (result.exitCode !== 0) {
        throw new CLIError(
          `Tunnel creation failed: ${result.stderr}`,
          ERROR_CODES.TUNNEL_CREATE_FAILED
        );
      }

      // Parse tunnel URL from output
      const tunnelUrl = this.parseTunnelUrl(result.stdout);
      
      logger.info('CLIWrapper', `Tunnel created successfully: ${tunnelUrl}`);
      return tunnelUrl;
    } catch (error) {
      logger.error('CLIWrapper', 'Failed to create tunnel', error);
      throw error instanceof CLIError ? error : new CLIError(
        `Tunnel creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.TUNNEL_CREATE_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a tunnel
   */
  async deleteTunnel(tunnelId: string): Promise<void> {
    try {
      logger.info('CLIWrapper', `Deleting tunnel: ${tunnelId}`);
      
      const result = await this.executeCommand(this.cliName, ['delete', tunnelId], {
        timeout: 15000
      });

      if (result.exitCode !== 0) {
        throw new CLIError(
          `Tunnel deletion failed: ${result.stderr}`,
          ERROR_CODES.TUNNEL_DELETE_FAILED
        );
      }

      logger.info('CLIWrapper', `Tunnel deleted successfully: ${tunnelId}`);
    } catch (error) {
      logger.error('CLIWrapper', 'Failed to delete tunnel', error);
      throw error instanceof CLIError ? error : new CLIError(
        `Tunnel deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.TUNNEL_DELETE_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * List active tunnels
   */
  async listTunnels(): Promise<string[]> {
    try {
      logger.debug('CLIWrapper', 'Listing active tunnels');
      
      const result = await this.executeCommand(this.cliName, ['list'], {
        timeout: 10000
      });

      if (result.exitCode !== 0) {
        logger.warn('CLIWrapper', 'Failed to list tunnels', result.stderr);
        return [];
      }

      return this.parseTunnelList(result.stdout);
    } catch (error) {
      logger.error('CLIWrapper', 'Error listing tunnels', error);
      return [];
    }
  }

  /**
   * Execute a CLI command with proper error handling
   */
  private async executeCommand(
    command: string, 
    args: string[] = [], 
    options: { timeout?: number } = {}
  ): Promise<CLICommandResult> {
    return new Promise((resolve, reject) => {
      const { timeout = DEV_TUNNELS_CONFIG.PROCESS_TIMEOUT } = options;
      
      logger.debug('CLIWrapper', `Executing command: ${command} ${args.join(' ')}`);
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new CLIError(
            `Command timed out after ${timeout}ms`,
            ERROR_CODES.CLI_COMMAND_FAILED
          ));
        }, timeout);
      }

      // Collect output
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle completion
      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        const result: CLICommandResult = {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0
        };

        logger.debug('CLIWrapper', `Command completed with exit code: ${code}`, {
          stdout: result.stdout,
          stderr: result.stderr
        });

        resolve(result);
      });

      // Handle errors
      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new CLIError(
          `Command execution failed: ${error.message}`,
          ERROR_CODES.CLI_COMMAND_FAILED,
          error
        ));
      });
    });
  }

  /**
   * Parse authentication result from CLI output
   */
  private parseAuthenticationResult(output: string): AuthStatus {
    try {
      // Look for authentication indicators in output
      const isAuthenticated = output.includes('Signed in') || 
                             output.includes('authenticated') ||
                             output.includes('@');
      
      let accountEmail: string | undefined;
      
      // Try to extract email from output
      const emailMatch = output.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        accountEmail = emailMatch[1];
      }

      return {
        isAuthenticated,
        accountEmail
      };
    } catch (error) {
      logger.warn('CLIWrapper', 'Failed to parse authentication result', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Parse tunnel URL from CLI output
   */
  private parseTunnelUrl(output: string): string {
    try {
      // Look for HTTPS URLs in the output
      const urlMatch = output.match(/(https:\/\/[^\s]+)/);
      if (urlMatch) {
        return urlMatch[1];
      }

      // Fallback: look for any URL-like pattern
      const fallbackMatch = output.match(/(https?:\/\/[^\s]+)/);
      if (fallbackMatch) {
        return fallbackMatch[1];
      }

      throw new CLIError(
        'Could not parse tunnel URL from CLI output',
        ERROR_CODES.CLI_PARSE_ERROR
      );
    } catch (error) {
      logger.error('CLIWrapper', 'Failed to parse tunnel URL', { output, error });
      throw error instanceof CLIError ? error : new CLIError(
        'Failed to parse tunnel URL',
        ERROR_CODES.CLI_PARSE_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Parse tunnel list from CLI output
   */
  private parseTunnelList(output: string): string[] {
    try {
      const tunnels: string[] = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        // Look for tunnel IDs or URLs in each line
        const tunnelMatch = line.match(/([a-zA-Z0-9-]+)\s+.*https:\/\/[^\s]+/);
        if (tunnelMatch) {
          tunnels.push(tunnelMatch[1]);
        }
      }

      return tunnels;
    } catch (error) {
      logger.warn('CLIWrapper', 'Failed to parse tunnel list', error);
      return [];
    }
  }
}