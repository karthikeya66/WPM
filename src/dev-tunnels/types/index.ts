/**
 * Core TypeScript interfaces for Dev Tunnels integration
 */

export interface TunnelInfo {
  id: string;
  port: number;
  publicUrl: string;
  status: 'active' | 'inactive' | 'connecting' | 'error';
  createdAt: Date;
  lastHealthCheck?: Date;
}

export interface TunnelOptions {
  name?: string;
  allowAnonymous?: boolean;
  accessControl?: 'public' | 'authenticated';
  protocol?: 'http' | 'https';
}

export interface AuthInfo {
  isAuthenticated: boolean;
  accountEmail?: string;
  tokenExpiry?: Date;
  lastAuthCheck: Date;
}

export interface ProcessInfo {
  id: string;
  pid: number;
  command: string;
  status: 'running' | 'stopped' | 'error';
  startTime: Date;
  output: string[];
}

export interface TunnelStatus {
  tunnelId: string;
  port: number;
  publicUrl: string;
  status: 'active' | 'inactive' | 'connecting' | 'error';
  connectionState: 'connected' | 'disconnected' | 'reconnecting';
  lastHealthCheck?: Date;
  reconnectAttempts: number;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  accountEmail?: string;
  error?: string;
}

export interface PortScanResult {
  port: number;
  isActive: boolean;
  isHttpService: boolean;
  error?: string;
}