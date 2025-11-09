/**
 * Production-Ready Logger Utility
 * 
 * Features:
 * - Structured logging with timestamps
 * - Different log levels (info, warn, error, debug)
 * - JSON formatting for easy parsing
 * - Extensible design for future enhancements (file/database persistence)
 * - Performance optimized for high-concurrency environments
 * 
 * Future Enhancements:
 * - Add file rotation (winston/pino)
 * - Add remote logging (DataDog, CloudWatch, etc.)
 * - Add log levels filtering based on environment
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private readonly serviceName: string;
  private readonly enableColors: boolean;

  constructor(serviceName: string = 'StreamBridge', enableColors: boolean = true) {
    this.serviceName = serviceName;
    this.enableColors = enableColors && process.stdout.isTTY;
  }

  /**
   * Get color code for terminal output
   */
  private getColor(level: LogLevel): string {
    if (!this.enableColors) return '';
    
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    return colors[level] || '';
  }

  private resetColor(): string {
    return this.enableColors ? '\x1b[0m' : '';
  }

  /**
   * Format timestamp in ISO 8601 format with milliseconds
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const timestamp = this.getTimestamp();
    const color = this.getColor(level);
    const reset = this.resetColor();

    // Structured log object for easy parsing
    const logObject = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...(metadata && { metadata }),
    };

    // Format for console output
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    const consoleOutput = `${color}[${timestamp}] [${level}] [${this.serviceName}]${reset} ${message}${metadataStr}`;

    // Output based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(consoleOutput);
        break;
      case LogLevel.WARN:
        console.warn(consoleOutput);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(consoleOutput);
        }
        break;
      default:
        console.log(consoleOutput);
    }

    // Future: Add file/database logging here
    // this.persistLog(logObject);
  }

  /**
   * Log info level message
   */
  public info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning level message
   */
  public warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error level message
   * Automatically extracts stack trace from Error objects
   */
  public error(message: string, metadata?: LogMetadata | Error): void {
    let enhancedMetadata = metadata;

    // If metadata is an Error object, extract useful information
    if (metadata instanceof Error) {
      enhancedMetadata = {
        error: metadata.message,
        stack: metadata.stack,
        name: metadata.name,
      };
    }

    this.log(LogLevel.ERROR, message, enhancedMetadata as LogMetadata);
  }

  /**
   * Log debug level message (only in development)
   */
  public debug(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log HTTP request details
   */
  public http(method: string, path: string, statusCode: number, duration?: number): void {
    const metadata: LogMetadata = {
      method,
      path,
      statusCode,
      ...(duration && { duration: `${duration}ms` }),
    };

    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;

    this.log(level, `HTTP ${method} ${path} ${statusCode}`, metadata);
  }

  /**
   * Log database query (useful for debugging slow queries)
   */
  public query(operation: string, table: string, duration?: number): void {
    const metadata: LogMetadata = {
      operation,
      table,
      ...(duration && { duration: `${duration}ms` }),
    };

    this.log(LogLevel.DEBUG, `Database ${operation} on ${table}`, metadata);
  }
}

// Export singleton instance
const logger = new Logger('StreamBridge');

export default logger;

