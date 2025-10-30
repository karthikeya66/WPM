/**
 * CLI Installer for Microsoft Dev Tunnels CLI
 * Handles automatic installation with multiple fallback methods
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import { logger } from '../utils/logger';
import { CLIError, ERROR_CODES } from '../utils/errors';
import { DEV_TUNNELS_CONFIG } from '../config/constants';

const execAsync = promisify(exec);

export interface InstallationResult {
  success: boolean;
  method: string;
  version?: string;
  error?: string;
}

export class CLIInstaller {
  private readonly platform = os.platform();
  private readonly arch = os.arch();

  /**
   * Install Dev Tunnels CLI with automatic method detection
   */
  async install(): Promise<InstallationResult> {
    logger.info('CLIInstaller', 'Starting Dev Tunnels CLI installation...');
    
    // Try installation methods in order of preference
    const methods = [
      () => this.installViaWinget(),
      () => this.installViaNpm(),
      () => this.installViaDirectDownload()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result.success) {
          logger.info('CLIInstaller', `Installation successful via ${result.method}`);
          return result;
        }
      } catch (error) {
        logger.debug('CLIInstaller', `Installation method failed`, error);
        continue;
      }
    }

    const errorMessage = 'All installation methods failed';
    logger.error('CLIInstaller', errorMessage);
    throw new CLIError(errorMessage, ERROR_CODES.CLI_INSTALL_FAILED);
  }

  /**
   * Install via Windows Package Manager (winget) - Windows only
   */
  private async installViaWinget(): Promise<InstallationResult> {
    if (this.platform !== 'win32') {
      throw new Error('Winget is only available on Windows');
    }

    logger.debug('CLIInstaller', 'Attempting installation via winget...');

    try {
      // Check if winget is available
      await execAsync('winget --version');
      
      // Install Dev Tunnels CLI
      const { stdout, stderr } = await execAsync(
        'winget install Microsoft.DevTunnels',
        { timeout: 120000 }
      );

      if (stderr && stderr.includes('error')) {
        throw new Error(`Winget installation failed: ${stderr}`);
      }

      // Verify installation
      const version = await this.getInstalledVersion();
      
      return {
        success: true,
        method: 'winget',
        version
      };
    } catch (error) {
      logger.debug('CLIInstaller', 'Winget installation failed', error);
      throw error;
    }
  }

  /**
   * Install via npm
   */
  private async installViaNpm(): Promise<InstallationResult> {
    logger.debug('CLIInstaller', 'Attempting installation via npm...');

    try {
      // Check if npm is available
      await execAsync('npm --version');
      
      // Install Dev Tunnels CLI globally
      const { stdout, stderr } = await execAsync(
        'npm install -g @microsoft/dev-tunnels-cli',
        { timeout: 120000 }
      );

      if (stderr && stderr.includes('error') && !stderr.includes('warn')) {
        throw new Error(`npm installation failed: ${stderr}`);
      }

      // Verify installation
      const version = await this.getInstalledVersion();
      
      return {
        success: true,
        method: 'npm',
        version
      };
    } catch (error) {
      logger.debug('CLIInstaller', 'npm installation failed', error);
      throw error;
    }
  }

  /**
   * Install via direct download - fallback method
   */
  private async installViaDirectDownload(): Promise<InstallationResult> {
    logger.debug('CLIInstaller', 'Attempting installation via direct download...');

    try {
      // This is a placeholder for direct download implementation
      // In a real implementation, you would:
      // 1. Determine the correct download URL for the platform/arch
      // 2. Download the binary
      // 3. Extract if needed
      // 4. Place in appropriate location
      // 5. Make executable (on Unix systems)
      
      const downloadUrl = this.getDownloadUrl();
      logger.info('CLIInstaller', `Would download from: ${downloadUrl}`);
      
      // For now, throw an error to indicate this method is not implemented
      throw new Error('Direct download method not yet implemented');
      
    } catch (error) {
      logger.debug('CLIInstaller', 'Direct download installation failed', error);
      throw error;
    }
  }

  /**
   * Get the appropriate download URL for the current platform
   */
  private getDownloadUrl(): string {
    const baseUrl = 'https://github.com/microsoft/dev-tunnels/releases/latest/download';
    
    switch (this.platform) {
      case 'win32':
        return `${baseUrl}/devtunnel-windows-${this.arch === 'x64' ? 'x64' : 'x86'}.exe`;
      case 'darwin':
        return `${baseUrl}/devtunnel-osx-${this.arch === 'arm64' ? 'arm64' : 'x64'}`;
      case 'linux':
        return `${baseUrl}/devtunnel-linux-${this.arch === 'arm64' ? 'arm64' : 'x64'}`;
      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Get the installed version of Dev Tunnels CLI
   */
  private async getInstalledVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('devtunnel --version', { timeout: 10000 });
      const versionMatch = stdout.match(/(\d+\.\d+\.\d+)/);
      return versionMatch ? versionMatch[1] : 'unknown';
    } catch (error) {
      logger.debug('CLIInstaller', 'Could not determine version', error);
      return 'unknown';
    }
  }

  /**
   * Verify that the CLI is properly installed and functional
   */
  async verifyInstallation(): Promise<boolean> {
    try {
      logger.debug('CLIInstaller', 'Verifying CLI installation...');
      
      // Try to run the version command
      const { stdout, stderr } = await execAsync('devtunnel --version', { timeout: 10000 });
      
      if (stderr && stderr.includes('error')) {
        logger.warn('CLIInstaller', 'CLI verification failed', stderr);
        return false;
      }

      const isValid = stdout.includes('devtunnel') || !!stdout.match(/\d+\.\d+\.\d+/);
      logger.debug('CLIInstaller', `CLI verification result: ${isValid}`);
      
      return isValid;
    } catch (error) {
      logger.debug('CLIInstaller', 'CLI verification failed', error);
      return false;
    }
  }

  /**
   * Get installation instructions for manual installation
   */
  getManualInstallationInstructions(): string {
    const instructions = [];
    
    instructions.push('Manual installation options:');
    instructions.push('');
    
    if (this.platform === 'win32') {
      instructions.push('Option 1: Using winget (recommended)');
      instructions.push('  winget install Microsoft.DevTunnels');
      instructions.push('');
    }
    
    instructions.push('Option 2: Using npm');
    instructions.push('  npm install -g @microsoft/dev-tunnels-cli');
    instructions.push('');
    
    instructions.push('Option 3: Direct download');
    instructions.push(`  Download from: ${this.getDownloadUrl()}`);
    instructions.push('  Extract and add to your PATH');
    instructions.push('');
    
    instructions.push('After installation, verify with: devtunnel --version');
    
    return instructions.join('\n');
  }

  /**
   * Check system prerequisites for installation
   */
  async checkPrerequisites(): Promise<{ [key: string]: boolean }> {
    const prerequisites: { [key: string]: boolean } = {};
    
    // Check for npm
    try {
      await execAsync('npm --version');
      prerequisites.npm = true;
    } catch {
      prerequisites.npm = false;
    }
    
    // Check for winget (Windows only)
    if (this.platform === 'win32') {
      try {
        await execAsync('winget --version');
        prerequisites.winget = true;
      } catch {
        prerequisites.winget = false;
      }
    }
    
    // Check for curl (for direct download)
    try {
      await execAsync('curl --version');
      prerequisites.curl = true;
    } catch {
      prerequisites.curl = false;
    }
    
    logger.debug('CLIInstaller', 'Prerequisites check completed', prerequisites);
    return prerequisites;
  }

  /**
   * Uninstall Dev Tunnels CLI
   */
  async uninstall(): Promise<boolean> {
    logger.info('CLIInstaller', 'Uninstalling Dev Tunnels CLI...');
    
    try {
      // Try npm uninstall first
      try {
        await execAsync('npm uninstall -g @microsoft/dev-tunnels-cli', { timeout: 60000 });
        logger.info('CLIInstaller', 'Successfully uninstalled via npm');
        return true;
      } catch (npmError) {
        logger.debug('CLIInstaller', 'npm uninstall failed', npmError);
      }
      
      // Try winget uninstall on Windows
      if (this.platform === 'win32') {
        try {
          await execAsync('winget uninstall Microsoft.DevTunnels', { timeout: 60000 });
          logger.info('CLIInstaller', 'Successfully uninstalled via winget');
          return true;
        } catch (wingetError) {
          logger.debug('CLIInstaller', 'winget uninstall failed', wingetError);
        }
      }
      
      logger.warn('CLIInstaller', 'Could not uninstall automatically. Manual removal may be required.');
      return false;
    } catch (error) {
      logger.error('CLIInstaller', 'Uninstallation failed', error);
      return false;
    }
  }
}