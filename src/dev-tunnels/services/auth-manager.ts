/**
 * Authentication Manager for Microsoft Dev Tunnels
 * Handles Microsoft account authentication and secure token storage
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../utils/logger';
import { AuthenticationError, ERROR_CODES } from '../utils/errors';
import { DEV_TUNNELS_CONFIG } from '../config/constants';
import { AuthInfo, AuthStatus } from '../types';
import { DevTunnelsCLIWrapper } from './cli-wrapper';

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  accountEmail: string;
  tokenType: string;
}

export class AuthenticationManager {
  private readonly cliWrapper: DevTunnelsCLIWrapper;
  private readonly tokenCacheDir: string;
  private readonly tokenCacheFile: string;
  private cachedAuthInfo: AuthInfo | null = null;

  constructor(cliWrapper: DevTunnelsCLIWrapper) {
    this.cliWrapper = cliWrapper;
    this.tokenCacheDir = path.join(os.homedir(), '.kiro', 'dev-tunnels');
    this.tokenCacheFile = path.join(this.tokenCacheDir, 'auth-cache.json');
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      logger.debug('AuthManager', 'Checking authentication status');
      
      // First check cached status
      if (this.cachedAuthInfo && this.isAuthInfoValid(this.cachedAuthInfo)) {
        logger.debug('AuthManager', 'Using cached authentication status');
        return this.cachedAuthInfo.isAuthenticated;
      }

      // Check with CLI
      const authStatus = await this.cliWrapper.getAuthStatus();
      
      // Update cache
      this.cachedAuthInfo = {
        isAuthenticated: authStatus.isAuthenticated,
        accountEmail: authStatus.accountEmail,
        lastAuthCheck: new Date()
      };

      // If authenticated, try to load token info
      if (authStatus.isAuthenticated) {
        try {
          const tokenInfo = await this.loadTokenInfo();
          if (tokenInfo) {
            this.cachedAuthInfo.tokenExpiry = tokenInfo.expiresAt;
          }
        } catch (error) {
          logger.debug('AuthManager', 'Could not load token info', error);
        }
      }

      return authStatus.isAuthenticated;
    } catch (error) {
      logger.error('AuthManager', 'Error checking authentication status', error);
      return false;
    }
  }

  /**
   * Authenticate with Microsoft account
   */
  async authenticate(): Promise<AuthInfo> {
    try {
      logger.info('AuthManager', 'Starting Microsoft account authentication...');
      
      // Use CLI wrapper to authenticate
      const authStatus = await this.cliWrapper.authenticate();
      
      if (!authStatus.isAuthenticated) {
        throw new AuthenticationError(
          authStatus.error || 'Authentication failed',
          ERROR_CODES.AUTH_LOGIN_FAILED
        );
      }

      // Create auth info
      const authInfo: AuthInfo = {
        isAuthenticated: true,
        accountEmail: authStatus.accountEmail,
        lastAuthCheck: new Date()
      };

      // Try to extract and cache token information
      try {
        await this.cacheAuthInfo(authInfo);
      } catch (error) {
        logger.warn('AuthManager', 'Could not cache authentication info', error);
      }

      // Update cached info
      this.cachedAuthInfo = authInfo;
      
      logger.info('AuthManager', `Successfully authenticated as ${authStatus.accountEmail}`);
      return authInfo;
    } catch (error) {
      logger.error('AuthManager', 'Authentication failed', error);
      throw error instanceof AuthenticationError ? error : new AuthenticationError(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.AUTH_LOGIN_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Refresh authentication token if needed
   */
  async refreshToken(): Promise<void> {
    try {
      logger.debug('AuthManager', 'Checking if token refresh is needed');
      
      const tokenInfo = await this.loadTokenInfo();
      if (!tokenInfo) {
        logger.debug('AuthManager', 'No token info found, skipping refresh');
        return;
      }

      // Check if token is close to expiry
      const now = new Date();
      const timeUntilExpiry = tokenInfo.expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry > DEV_TUNNELS_CONFIG.TOKEN_REFRESH_THRESHOLD) {
        logger.debug('AuthManager', 'Token is still valid, no refresh needed');
        return;
      }

      logger.info('AuthManager', 'Token is close to expiry, refreshing...');
      
      // For Dev Tunnels CLI, we need to re-authenticate
      // The CLI handles token refresh internally
      const authStatus = await this.cliWrapper.getAuthStatus();
      
      if (!authStatus.isAuthenticated) {
        logger.warn('AuthManager', 'Token refresh failed, re-authentication required');
        throw new AuthenticationError(
          'Token expired and refresh failed',
          ERROR_CODES.AUTH_TOKEN_EXPIRED
        );
      }

      logger.info('AuthManager', 'Token refresh completed successfully');
    } catch (error) {
      logger.error('AuthManager', 'Token refresh failed', error);
      throw error instanceof AuthenticationError ? error : new AuthenticationError(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.AUTH_TOKEN_EXPIRED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get current authentication information
   */
  async getAuthStatus(): Promise<AuthInfo> {
    try {
      // Check if we have valid cached info
      if (this.cachedAuthInfo && this.isAuthInfoValid(this.cachedAuthInfo)) {
        return this.cachedAuthInfo;
      }

      // Get fresh status from CLI
      const authStatus = await this.cliWrapper.getAuthStatus();
      
      const authInfo: AuthInfo = {
        isAuthenticated: authStatus.isAuthenticated,
        accountEmail: authStatus.accountEmail,
        lastAuthCheck: new Date()
      };

      // Try to load token expiry info
      if (authStatus.isAuthenticated) {
        try {
          const tokenInfo = await this.loadTokenInfo();
          if (tokenInfo) {
            authInfo.tokenExpiry = tokenInfo.expiresAt;
          }
        } catch (error) {
          logger.debug('AuthManager', 'Could not load token expiry info', error);
        }
      }

      // Update cache
      this.cachedAuthInfo = authInfo;
      
      return authInfo;
    } catch (error) {
      logger.error('AuthManager', 'Error getting auth status', error);
      return {
        isAuthenticated: false,
        lastAuthCheck: new Date()
      };
    }
  }

  /**
   * Sign out and clear cached authentication
   */
  async signOut(): Promise<void> {
    try {
      logger.info('AuthManager', 'Signing out...');
      
      // Clear cached info
      this.cachedAuthInfo = null;
      
      // Clear cached token file
      try {
        await this.clearTokenCache();
      } catch (error) {
        logger.debug('AuthManager', 'Could not clear token cache', error);
      }

      // Note: Dev Tunnels CLI doesn't have a logout command
      // Users need to sign out manually or tokens will expire
      
      logger.info('AuthManager', 'Sign out completed');
    } catch (error) {
      logger.error('AuthManager', 'Error during sign out', error);
      throw new AuthenticationError(
        `Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ERROR_CODES.AUTH_LOGIN_FAILED,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate authentication before tunnel operations
   */
  async validateAuthentication(): Promise<void> {
    const isAuth = await this.isAuthenticated();
    
    if (!isAuth) {
      throw new AuthenticationError(
        'Authentication required. Please run authentication first.',
        ERROR_CODES.AUTH_NOT_AUTHENTICATED
      );
    }

    // Check if token needs refresh
    try {
      await this.refreshToken();
    } catch (error) {
      if (error instanceof AuthenticationError && 
          error.code === ERROR_CODES.AUTH_TOKEN_EXPIRED) {
        throw new AuthenticationError(
          'Authentication expired. Please re-authenticate.',
          ERROR_CODES.AUTH_TOKEN_EXPIRED,
          error
        );
      }
      // Other refresh errors are not critical
      logger.warn('AuthManager', 'Token refresh failed but continuing', error);
    }
  }

  /**
   * Check if cached auth info is still valid
   */
  private isAuthInfoValid(authInfo: AuthInfo): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - authInfo.lastAuthCheck.getTime();
    
    // Cache is valid for 5 minutes
    return cacheAge < 300000;
  }

  /**
   * Cache authentication information securely
   */
  private async cacheAuthInfo(authInfo: AuthInfo): Promise<void> {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.tokenCacheDir, { recursive: true });
      
      // Create cache data (without sensitive tokens)
      const cacheData = {
        isAuthenticated: authInfo.isAuthenticated,
        accountEmail: authInfo.accountEmail,
        lastAuthCheck: authInfo.lastAuthCheck.toISOString(),
        tokenExpiry: authInfo.tokenExpiry?.toISOString()
      };

      // Write to cache file with restricted permissions
      await fs.writeFile(
        this.tokenCacheFile, 
        JSON.stringify(cacheData, null, 2),
        { mode: 0o600 } // Read/write for owner only
      );
      
      logger.debug('AuthManager', 'Authentication info cached successfully');
    } catch (error) {
      logger.warn('AuthManager', 'Could not cache authentication info', error);
      // Don't throw - caching is not critical
    }
  }

  /**
   * Load token information from cache
   */
  private async loadTokenInfo(): Promise<TokenInfo | null> {
    try {
      const cacheData = await fs.readFile(this.tokenCacheFile, 'utf8');
      const parsed = JSON.parse(cacheData);
      
      if (!parsed.tokenExpiry) {
        return null;
      }

      return {
        accessToken: '', // Not stored in cache for security
        expiresAt: new Date(parsed.tokenExpiry),
        accountEmail: parsed.accountEmail || '',
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.debug('AuthManager', 'Could not load token info from cache', error);
      return null;
    }
  }

  /**
   * Clear token cache
   */
  private async clearTokenCache(): Promise<void> {
    try {
      await fs.unlink(this.tokenCacheFile);
      logger.debug('AuthManager', 'Token cache cleared');
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        logger.debug('AuthManager', 'Error clearing token cache', error);
      }
    }
  }
}