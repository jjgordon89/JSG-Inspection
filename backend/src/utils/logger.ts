import winston from 'winston';
import { config } from '@config/config';

/**
 * Winston Logger Configuration
 * Provides structured logging with different levels and formats
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = config.server.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
    level: level(),
  }),
];

// Add file transports in production or when specified
if (config.logging.enableFileLogging) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.errorLogPath,
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.combinedLogPath,
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Enhanced logger with additional methods
class EnhancedLogger {
  private winston: winston.Logger;

  constructor(winstonLogger: winston.Logger) {
    this.winston = winstonLogger;
  }

  // Standard logging methods
  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  http(message: string, meta?: any): void {
    this.winston.http(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // Enhanced methods for specific use cases
  database(message: string, meta?: any): void {
    this.winston.info(`[DATABASE] ${message}`, meta);
  }

  auth(message: string, meta?: any): void {
    this.winston.info(`[AUTH] ${message}`, meta);
  }

  api(message: string, meta?: any): void {
    this.winston.info(`[API] ${message}`, meta);
  }

  security(message: string, meta?: any): void {
    this.winston.warn(`[SECURITY] ${message}`, meta);
  }

  performance(message: string, meta?: any): void {
    this.winston.info(`[PERFORMANCE] ${message}`, meta);
  }

  ai(message: string, meta?: any): void {
    this.winston.info(`[AI] ${message}`, meta);
  }

  sync(message: string, meta?: any): void {
    this.winston.info(`[SYNC] ${message}`, meta);
  }

  // Request logging with correlation ID
  request(correlationId: string, method: string, url: string, statusCode?: number, duration?: number): void {
    const message = `${method} ${url}`;
    const meta = {
      correlationId,
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    };
    
    if (statusCode && statusCode >= 400) {
      this.winston.error(`[REQUEST] ${message}`, meta);
    } else {
      this.winston.http(`[REQUEST] ${message}`, meta);
    }
  }

  // Error logging with stack trace
  errorWithStack(message: string, error: Error, meta?: any): void {
    this.winston.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...meta,
    });
  }

  // Audit logging for security events
  audit(action: string, userId: string, resource: string, meta?: any): void {
    this.winston.info(`[AUDIT] ${action}`, {
      action,
      userId,
      resource,
      timestamp: new Date().toISOString(),
      ...meta,
    });
  }

  // Business logic logging
  business(event: string, data?: any): void {
    this.winston.info(`[BUSINESS] ${event}`, {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Metrics logging
  metric(name: string, value: number, unit?: string, tags?: Record<string, string>): void {
    this.winston.info(`[METRIC] ${name}: ${value}${unit || ''}`, {
      metric: {
        name,
        value,
        unit,
        tags,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Timer utility
  timer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.performance(`${label} completed in ${duration}ms`);
    };
  }

  // Child logger with additional context
  child(context: Record<string, any>): EnhancedLogger {
    const childLogger = this.winston.child(context);
    return new EnhancedLogger(childLogger);
  }
}

// Create enhanced logger instance
const enhancedLogger = new EnhancedLogger(logger);

// Export logger and stream
export { enhancedLogger as logger, stream };

// Export types for TypeScript
export interface LogContext {
  correlationId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

// Utility function to create correlation ID
export const createCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Middleware helper for request logging
export const createRequestLogger = (correlationId: string) => {
  return enhancedLogger.child({ correlationId });
};

export default enhancedLogger;