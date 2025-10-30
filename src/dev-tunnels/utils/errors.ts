/**
 * Custom error classes for Dev Tunnels integration
 */

export class DevTunnelsError extends Error {
  constructor(
    message: string,
    public code: string,
    public component: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DevTunnelsError';
  }
}

export class CLIError extends DevTunnelsError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, 'CLI', originalError);
    this.name = 'CLIError';
  }
}

export class AuthenticationError extends DevTunnelsError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, 'Authentication', originalError);
    this.name = 'AuthenticationError';
  }
}

export class TunnelError extends DevTunnelsError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, 'Tunnel', originalError);
    this.name = 'TunnelError';
  }
}

export class PortScanError extends DevTunnelsError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, 'PortScanner', originalError);
    this.name = 'PortScanError';
  }
}

export class ProcessError extends DevTunnelsError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, 'Process', originalError);
    this.name = 'ProcessError';
  }
}

// Error codes
export const ERROR_CODES = {
  // CLI errors
  CLI_NOT_FOUND: 'CLI_NOT_FOUND',
  CLI_INSTALL_FAILED: 'CLI_INSTALL_FAILED',
  CLI_COMMAND_FAILED: 'CLI_COMMAND_FAILED',
  CLI_PARSE_ERROR: 'CLI_PARSE_ERROR',

  // Authentication errors
  AUTH_NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',

  // Tunnel errors
  TUNNEL_CREATE_FAILED: 'TUNNEL_CREATE_FAILED',
  TUNNEL_DELETE_FAILED: 'TUNNEL_DELETE_FAILED',
  TUNNEL_NOT_FOUND: 'TUNNEL_NOT_FOUND',
  TUNNEL_CONNECTION_LOST: 'TUNNEL_CONNECTION_LOST',

  // Port scanning errors
  PORT_NOT_ACCESSIBLE: 'PORT_NOT_ACCESSIBLE',
  PORT_NO_HTTP_SERVICE: 'PORT_NO_HTTP_SERVICE',
  PORT_SCAN_FAILED: 'PORT_SCAN_FAILED',

  // Process errors
  PROCESS_START_FAILED: 'PROCESS_START_FAILED',
  PROCESS_STOP_FAILED: 'PROCESS_STOP_FAILED',
  PROCESS_NOT_FOUND: 'PROCESS_NOT_FOUND',
  PROCESS_TIMEOUT: 'PROCESS_TIMEOUT'
} as const;