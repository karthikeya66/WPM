/**
 * Unit tests for DevTunnelsCLIWrapper
 */

// Mock child_process
const mockSpawn = jest.fn();
const mockExec = jest.fn();
const mockExecAsync = jest.fn();

jest.mock('child_process', () => ({
  spawn: mockSpawn,
  exec: mockExec
}));

jest.mock('util', () => ({
  promisify: jest.fn(() => mockExecAsync)
}));

// Mock CLIInstaller
jest.mock('../cli-installer');

import { DevTunnelsCLIWrapper } from '../cli-wrapper';
import { CLIInstaller } from '../cli-installer';
import { CLIError, ERROR_CODES } from '../../utils/errors';
import { EventEmitter } from 'events';

const MockCLIInstaller = CLIInstaller as jest.MockedClass<typeof CLIInstaller>;

// Mock process for creating child process mock
class MockChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = jest.fn();
}

describe('DevTunnelsCLIWrapper', () => {
  let cliWrapper: DevTunnelsCLIWrapper;
  let mockInstaller: jest.Mocked<CLIInstaller>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock installer instance
    mockInstaller = {
      install: jest.fn(),
      verifyInstallation: jest.fn(),
      getManualInstallationInstructions: jest.fn(),
      uninstall: jest.fn(),
      checkPrerequisites: jest.fn()
    } as any;

    MockCLIInstaller.mockImplementation(() => mockInstaller);
    
    cliWrapper = new DevTunnelsCLIWrapper();
  });

  describe('isInstalled', () => {
    it('should return true when CLI is installed', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      // Start the command execution
      const promise = cliWrapper.isInstalled();

      // Simulate successful command execution
      setTimeout(() => {
        mockChild.stdout.emit('data', 'devtunnel version 1.0.0');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
    });

    it('should return false when CLI is not installed', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.isInstalled();

      // Simulate command failure
      setTimeout(() => {
        mockChild.emit('error', new Error('Command not found'));
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
    });

    it('should return false when version command fails', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.isInstalled();

      // Simulate command failure with non-zero exit code
      setTimeout(() => {
        mockChild.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('install', () => {
    it('should install CLI successfully', async () => {
      mockInstaller.install.mockResolvedValue({
        success: true,
        method: 'npm',
        version: '1.0.0'
      });
      mockInstaller.verifyInstallation.mockResolvedValue(true);

      await expect(cliWrapper.install()).resolves.not.toThrow();
      
      expect(mockInstaller.install).toHaveBeenCalled();
      expect(mockInstaller.verifyInstallation).toHaveBeenCalled();
    });

    it('should throw error when installation fails', async () => {
      mockInstaller.install.mockResolvedValue({
        success: false,
        method: 'npm',
        error: 'Installation failed'
      });

      await expect(cliWrapper.install()).rejects.toThrow(CLIError);
      expect(mockInstaller.install).toHaveBeenCalled();
    });

    it('should throw error when verification fails', async () => {
      mockInstaller.install.mockResolvedValue({
        success: true,
        method: 'npm',
        version: '1.0.0'
      });
      mockInstaller.verifyInstallation.mockResolvedValue(false);

      await expect(cliWrapper.install()).rejects.toThrow(CLIError);
    });
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.authenticate();

      // Simulate successful authentication
      setTimeout(() => {
        mockChild.stdout.emit('data', 'Signed in as user@example.com');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      
      expect(result.isAuthenticated).toBe(true);
      expect(result.accountEmail).toBe('user@example.com');
    });

    it('should handle authentication failure', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.authenticate();

      // Simulate authentication failure
      setTimeout(() => {
        mockChild.stderr.emit('data', 'Authentication failed');
        mockChild.emit('close', 1);
      }, 10);

      await expect(promise).rejects.toThrow(CLIError);
    });
  });

  describe('getAuthStatus', () => {
    it('should return authentication status', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.getAuthStatus();

      // Simulate successful status check
      setTimeout(() => {
        mockChild.stdout.emit('data', 'User: user@example.com');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      
      expect(result.isAuthenticated).toBe(true);
      expect(result.accountEmail).toBe('user@example.com');
    });

    it('should handle unauthenticated status', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.getAuthStatus();

      // Simulate unauthenticated status
      setTimeout(() => {
        mockChild.stderr.emit('data', 'Not authenticated');
        mockChild.emit('close', 1);
      }, 10);

      const result = await promise;
      
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('createTunnel', () => {
    it('should create tunnel successfully', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.createTunnel(3000);

      // Simulate successful tunnel creation
      setTimeout(() => {
        mockChild.stdout.emit('data', 'Tunnel created: https://abc123.devtunnels.ms');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      
      expect(result).toBe('https://abc123.devtunnels.ms');
    });

    it('should create tunnel with options', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const options = {
        name: 'mytunnel',
        allowAnonymous: true,
        accessControl: 'public' as const
      };

      const promise = cliWrapper.createTunnel(3000, options);

      // Simulate successful tunnel creation
      setTimeout(() => {
        mockChild.stdout.emit('data', 'Tunnel created: https://mytunnel.devtunnels.ms');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      
      expect(result).toBe('https://mytunnel.devtunnels.ms');
      expect(mockSpawn).toHaveBeenCalledWith(
        'devtunnel',
        ['host', '-p', '3000', '--name', 'mytunnel', '--allow-anonymous'],
        expect.any(Object)
      );
    });

    it('should handle tunnel creation failure', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.createTunnel(3000);

      // Simulate tunnel creation failure
      setTimeout(() => {
        mockChild.stderr.emit('data', 'Tunnel creation failed');
        mockChild.emit('close', 1);
      }, 10);

      await expect(promise).rejects.toThrow(CLIError);
    });
  });

  describe('deleteTunnel', () => {
    it('should delete tunnel successfully', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.deleteTunnel('tunnel123');

      // Simulate successful tunnel deletion
      setTimeout(() => {
        mockChild.emit('close', 0);
      }, 10);

      await expect(promise).resolves.not.toThrow();
    });

    it('should handle tunnel deletion failure', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.deleteTunnel('tunnel123');

      // Simulate tunnel deletion failure
      setTimeout(() => {
        mockChild.stderr.emit('data', 'Tunnel not found');
        mockChild.emit('close', 1);
      }, 10);

      await expect(promise).rejects.toThrow(CLIError);
    });
  });

  describe('listTunnels', () => {
    it('should list tunnels successfully', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.listTunnels();

      // Simulate successful tunnel listing
      setTimeout(() => {
        mockChild.stdout.emit('data', 'tunnel1    active    https://tunnel1.devtunnels.ms\ntunnel2    active    https://tunnel2.devtunnels.ms');
        mockChild.emit('close', 0);
      }, 10);

      const result = await promise;
      
      expect(result).toEqual(['tunnel1', 'tunnel2']);
    });

    it('should return empty array on list failure', async () => {
      const mockChild = new MockChildProcess();
      mockSpawn.mockReturnValue(mockChild);

      const promise = cliWrapper.listTunnels();

      // Simulate list failure
      setTimeout(() => {
        mockChild.emit('close', 1);
      }, 10);

      const result = await promise;
      
      expect(result).toEqual([]);
    });
  });
});