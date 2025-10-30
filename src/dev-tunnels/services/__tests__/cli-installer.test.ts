/**
 * Unit tests for CLIInstaller
 */

// Mock child_process exec
const mockExecAsync = jest.fn();
const mockExec = jest.fn();

jest.mock('child_process', () => ({
  exec: mockExec
}));

jest.mock('util', () => ({
  promisify: jest.fn(() => mockExecAsync)
}));

import { CLIInstaller } from '../cli-installer';

describe('CLIInstaller', () => {
  let installer: CLIInstaller;

  beforeEach(() => {
    jest.clearAllMocks();
    installer = new CLIInstaller();
  });

  describe('verifyInstallation', () => {
    it('should return true for valid installation', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'devtunnel 1.0.0', stderr: '' });

      const result = await installer.verifyInstallation();

      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith('devtunnel --version', { timeout: 10000 });
    });

    it('should return false for invalid installation', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'invalid output', stderr: 'error occurred' });

      const result = await installer.verifyInstallation();

      expect(result).toBe(false);
    });

    it('should return false when command fails', async () => {
      mockExecAsync.mockRejectedValue(new Error('Command not found'));

      const result = await installer.verifyInstallation();

      expect(result).toBe(false);
    });
  });

  describe('getManualInstallationInstructions', () => {
    it('should return installation instructions', () => {
      const instructions = installer.getManualInstallationInstructions();

      expect(instructions).toContain('Manual installation options');
      expect(instructions).toContain('npm install -g @microsoft/dev-tunnels-cli');
      expect(instructions).toContain('Direct download');
      expect(instructions).toContain('devtunnel --version');
    });
  });

  describe('checkPrerequisites', () => {
    it('should check npm availability', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'npm 8.0.0', stderr: '' });

      const result = await installer.checkPrerequisites();

      expect(result.npm).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith('npm --version');
    });

    it('should handle missing npm', async () => {
      mockExecAsync.mockRejectedValue(new Error('Command not found'));

      const result = await installer.checkPrerequisites();

      expect(result.npm).toBe(false);
    });
  });
});