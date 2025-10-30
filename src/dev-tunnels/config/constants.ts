/**
 * Configuration constants for Dev Tunnels integration
 */

export const DEV_TUNNELS_CONFIG = {
  // Common development ports to scan
  COMMON_PORTS: [3000, 4000, 5000, 8000, 8080, 9000],
  
  // CLI installation and configuration
  CLI_NAME: 'devtunnel',
  CLI_INSTALL_COMMAND: 'npm install -g @microsoft/dev-tunnels-cli',
  CLI_VERSION_COMMAND: 'devtunnel --version',
  
  // Tunnel monitoring settings
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_BACKOFF_BASE: 1000, // 1 second base delay
  
  // Authentication settings
  AUTH_TIMEOUT: 60000, // 1 minute
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
  
  // Process management
  PROCESS_TIMEOUT: 30000, // 30 seconds
  CLEANUP_TIMEOUT: 5000, // 5 seconds
  
  // Tunnel configuration defaults
  DEFAULT_TUNNEL_OPTIONS: {
    protocol: 'https' as const,
    accessControl: 'public' as const,
    allowAnonymous: true
  },
  
  // Error messages
  ERRORS: {
    CLI_NOT_FOUND: 'Microsoft Dev Tunnels CLI not found. Installing automatically...',
    INSTALLATION_FAILED: 'Failed to install Dev Tunnels CLI. Please install manually.',
    AUTH_REQUIRED: 'Microsoft account authentication required. Please run authentication.',
    AUTH_FAILED: 'Authentication failed. Please check your Microsoft account credentials.',
    PORT_NOT_FOUND: 'No active web servers found on common ports.',
    TUNNEL_CREATION_FAILED: 'Failed to create tunnel. Please check your configuration.',
    CONNECTION_LOST: 'Tunnel connection lost. Attempting to reconnect...',
    MAX_RETRIES_EXCEEDED: 'Maximum reconnection attempts exceeded. Manual intervention required.'
  },
  
  // Success messages
  SUCCESS: {
    CLI_INSTALLED: '✅ Microsoft Dev Tunnels CLI installed successfully',
    AUTH_SUCCESS: '✅ Successfully authenticated with Microsoft account',
    TUNNEL_CREATED: '✅ Your app is live at',
    TUNNEL_STOPPED: '✅ Tunnel stopped successfully',
    RECONNECTED: '✅ Tunnel reconnected successfully'
  }
} as const;

export const TUNNEL_STATES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive', 
  CONNECTING: 'connecting',
  ERROR: 'error'
} as const;

export const CONNECTION_STATES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
} as const;

export const PROCESS_STATES = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;