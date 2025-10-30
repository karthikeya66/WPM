/**
 * Logging utility for Dev Tunnels integration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private log(level: LogLevel, component: string, message: string, data?: any): void {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data
    };

    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console with appropriate level
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[level];
    const logMessage = `[${timestamp}] [${levelStr}] [${component}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }

  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  error(component: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data);
  }

  getLogs(component?: string, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();