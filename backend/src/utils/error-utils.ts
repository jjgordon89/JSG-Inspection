/**
 * Error Utilities
 * Helper functions for error handling, formatting, and management
 */

import { logger } from './logger';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  resource?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
  stackTrace?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Structured error interface
export interface StructuredError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  originalError?: Error;
  isOperational: boolean;
  statusCode?: number;
  details?: Record<string, any>;
}

// Error handler options
export interface ErrorHandlerOptions {
  logError?: boolean;
  includeStackTrace?: boolean;
  sanitizeMessage?: boolean;
  notifyAdmins?: boolean;
  retryable?: boolean;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context?: ErrorContext;
  public readonly isOperational: boolean;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    statusCode: number = 500,
    context?: ErrorContext,
    details?: Record<string, any>
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = context;
    this.isOperational = true;
    this.statusCode = statusCode;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): StructuredError {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      category: this.category,
      context: this.context,
      isOperational: this.isOperational,
      statusCode: this.statusCode,
      details: this.details
    };
  }

  /**
   * Create user-friendly error message
   */
  getUserMessage(): string {
    // Return sanitized message for users
    switch (this.category) {
      case ErrorCategory.VALIDATION:
        return this.message; // Validation messages are usually safe
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorCategory.DATABASE:
        return 'A database error occurred. Please try again later.';
      case ErrorCategory.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case ErrorCategory.FILE_SYSTEM:
        return 'File operation failed. Please try again.';
      case ErrorCategory.EXTERNAL_SERVICE:
        return 'External service is temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }
}

/**
 * Create structured error from unknown error
 */
export function createStructuredError(
  error: unknown,
  context?: ErrorContext,
  options: ErrorHandlerOptions = {}
): StructuredError {
  const {
    logError = true,
    includeStackTrace = false,
    sanitizeMessage = true
  } = options;

  let structuredError: StructuredError;

  if (error instanceof AppError) {
    structuredError = error.toJSON();
  } else if (error instanceof Error) {
    structuredError = {
      code: 'UNKNOWN_ERROR',
      message: sanitizeMessage ? 'An unexpected error occurred' : error.message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      context,
      originalError: error,
      isOperational: false,
      statusCode: 500
    };
  } else {
    structuredError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      context,
      isOperational: false,
      statusCode: 500,
      details: { originalError: error }
    };
  }

  // Add stack trace if requested
  if (includeStackTrace && error instanceof Error) {
    structuredError.context = {
      ...structuredError.context,
      stackTrace: error.stack
    };
  }

  // Log error if requested
  if (logError) {
    logStructuredError(structuredError);
  }

  return structuredError;
}

/**
 * Log structured error with appropriate level
 */
export function logStructuredError(error: StructuredError): void {
  const logData = {
    code: error.code,
    message: error.message,
    severity: error.severity,
    category: error.category,
    context: error.context,
    details: error.details
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error('Critical error occurred', logData);
      break;
    case ErrorSeverity.HIGH:
      logger.error('High severity error occurred', logData);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn('Medium severity error occurred', logData);
      break;
    case ErrorSeverity.LOW:
      logger.info('Low severity error occurred', logData);
      break;
    default:
      logger.error('Unknown severity error occurred', logData);
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(
  error: unknown,
  retryableErrors: string[] = []
): boolean {
  if (error instanceof AppError) {
    // Check if error code is in retryable list
    if (retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Network and external service errors are usually retryable
    return error.category === ErrorCategory.NETWORK ||
           error.category === ErrorCategory.EXTERNAL_SERVICE;
  }
  
  if (error instanceof Error) {
    // Check common retryable error patterns
    const retryablePatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /econnreset/i,
      /enotfound/i,
      /etimedout/i
    ];
    
    return retryablePatterns.some(pattern => pattern.test(error.message));
  }
  
  return false;
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  context?: ErrorContext
): Promise<T> {
  const {
    maxAttempts,
    baseDelay,
    maxDelay,
    backoffMultiplier,
    retryableErrors = []
  } = config;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, retryableErrors)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );
      
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
        context,
        attempt,
        maxAttempts
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All attempts failed, throw the last error
  throw lastError;
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorHandlerOptions = {}
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const structuredError = createStructuredError(error, undefined, options);
      throw new AppError(
        structuredError.message,
        structuredError.code,
        structuredError.severity,
        structuredError.category,
        structuredError.statusCode,
        structuredError.context,
        structuredError.details
      );
    }
  };
}

/**
 * Create error context from request
 */
export function createErrorContext(
  req?: any,
  operation?: string,
  resource?: string,
  metadata?: Record<string, any>
): ErrorContext {
  return {
    userId: req?.user?.id,
    requestId: req?.id || req?.headers?.["x-request-id"],
    operation,
    resource,
    metadata,
    timestamp: new Date(),
    userAgent: req?.headers?.["user-agent"],
    ipAddress: req?.ip || req?.connection?.remoteAddress
  };
}

/**
 * Sanitize error message for user display
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove sensitive information patterns
  const sensitivePatterns = [
    /password[\s]*[:=][\s]*[^\s]+/gi,
    /token[\s]*[:=][\s]*[^\s]+/gi,
    /key[\s]*[:=][\s]*[^\s]+/gi,
    /secret[\s]*[:=][\s]*[^\s]+/gi,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi // UUIDs
  ];
  
  let sanitized = message;
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  return sanitized;
}

/**
 * Get error summary for monitoring
 */
export function getErrorSummary(error: StructuredError): Record<string, any> {
  return {
    code: error.code,
    category: error.category,
    severity: error.severity,
    timestamp: error.context?.timestamp || new Date(),
    operation: error.context?.operation,
    resource: error.context?.resource,
    userId: error.context?.userId,
    statusCode: error.statusCode
  };
}

/**
 * Check if error should be reported to external monitoring
 */
export function shouldReportError(error: StructuredError): boolean {
  // Don't report validation errors or low severity errors
  if (error.category === ErrorCategory.VALIDATION || 
      error.severity === ErrorSeverity.LOW) {
    return false;
  }
  
  // Always report critical and high severity errors
  if (error.severity === ErrorSeverity.CRITICAL || 
      error.severity === ErrorSeverity.HIGH) {
    return true;
  }
  
  // Report medium severity errors for certain categories
  const reportableCategories = [
    ErrorCategory.DATABASE,
    ErrorCategory.EXTERNAL_SERVICE,
    ErrorCategory.SYSTEM
  ];
  
  return reportableCategories.includes(error.category);
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: StructuredError,
  includeDetails: boolean = false
): Record<string, any> {
  const response: Record<string, any> = {
    error: {
      code: error.code,
      message: error.message,
      timestamp: error.context?.timestamp || new Date().toISOString()
    }
  };
  
  if (includeDetails && error.details) {
    response.error.details = error.details;
  }
  
  if (error.context?.requestId) {
    response.error.requestId = error.context.requestId;
  }
  
  return response;
}

/**
 * Create common application errors
 */
export const CommonErrors = {
  // Validation errors
  VALIDATION_FAILED: (message: string, details?: Record<string, any>) => 
    new AppError(message, 'VALIDATION_FAILED', ErrorSeverity.LOW, ErrorCategory.VALIDATION, 400, undefined, details),
  
  INVALID_INPUT: (field: string) => 
    new AppError(`Invalid input for field: ${field}`, 'INVALID_INPUT', ErrorSeverity.LOW, ErrorCategory.VALIDATION, 400),
  
  REQUIRED_FIELD: (field: string) => 
    new AppError(`Required field missing: ${field}`, 'REQUIRED_FIELD', ErrorSeverity.LOW, ErrorCategory.VALIDATION, 400),
  
  // Authentication errors
  UNAUTHORIZED: () => 
    new AppError('Authentication required', 'UNAUTHORIZED', ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, 401),
  
  INVALID_CREDENTIALS: () => 
    new AppError('Invalid credentials', 'INVALID_CREDENTIALS', ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, 401),
  
  TOKEN_EXPIRED: () => 
    new AppError('Token has expired', 'TOKEN_EXPIRED', ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, 401),
  
  // Authorization errors
  FORBIDDEN: () => 
    new AppError('Access denied', 'FORBIDDEN', ErrorSeverity.MEDIUM, ErrorCategory.AUTHORIZATION, 403),
  
  INSUFFICIENT_PERMISSIONS: (permission: string) => 
    new AppError(`Insufficient permissions: ${permission}`, 'INSUFFICIENT_PERMISSIONS', ErrorSeverity.MEDIUM, ErrorCategory.AUTHORIZATION, 403),
  
  // Resource errors
  NOT_FOUND: (resource: string) => 
    new AppError(`${resource} not found`, 'NOT_FOUND', ErrorSeverity.LOW, ErrorCategory.BUSINESS_LOGIC, 404),
  
  ALREADY_EXISTS: (resource: string) => 
    new AppError(`${resource} already exists`, 'ALREADY_EXISTS', ErrorSeverity.LOW, ErrorCategory.BUSINESS_LOGIC, 409),
  
  // Database errors
  DATABASE_ERROR: (message?: string) => 
    new AppError(message || 'Database operation failed', 'DATABASE_ERROR', ErrorSeverity.HIGH, ErrorCategory.DATABASE, 500),
  
  CONNECTION_FAILED: () => 
    new AppError('Database connection failed', 'CONNECTION_FAILED', ErrorSeverity.HIGH, ErrorCategory.DATABASE, 500),
  
  // File system errors
  FILE_NOT_FOUND: (filename: string) => 
    new AppError(`File not found: ${filename}`, 'FILE_NOT_FOUND', ErrorSeverity.MEDIUM, ErrorCategory.FILE_SYSTEM, 404),
  
  FILE_TOO_LARGE: (maxSize: string) => 
    new AppError(`File size exceeds limit of ${maxSize}`, 'FILE_TOO_LARGE', ErrorSeverity.LOW, ErrorCategory.VALIDATION, 413),
  
  INVALID_FILE_TYPE: (allowedTypes: string[]) => 
    new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 'INVALID_FILE_TYPE', ErrorSeverity.LOW, ErrorCategory.VALIDATION, 400),
  
  // Network errors
  NETWORK_ERROR: (message?: string) => 
    new AppError(message || 'Network error occurred', 'NETWORK_ERROR', ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, 500),
  
  TIMEOUT: () => 
    new AppError('Operation timed out', 'TIMEOUT', ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, 408),
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: (service: string) => 
    new AppError(`External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR', ErrorSeverity.MEDIUM, ErrorCategory.EXTERNAL_SERVICE, 502),
  
  SERVICE_UNAVAILABLE: (service: string) => 
    new AppError(`Service unavailable: ${service}`, 'SERVICE_UNAVAILABLE', ErrorSeverity.MEDIUM, ErrorCategory.EXTERNAL_SERVICE, 503),
  
  // System errors
  INTERNAL_ERROR: () => 
    new AppError('Internal server error', 'INTERNAL_ERROR', ErrorSeverity.HIGH, ErrorCategory.SYSTEM, 500),
  
  CONFIGURATION_ERROR: (setting: string) => 
    new AppError(`Configuration error: ${setting}`, 'CONFIGURATION_ERROR', ErrorSeverity.HIGH, ErrorCategory.SYSTEM, 500)
};

// Export error constants
export const ERROR_CONSTANTS = {
  DEFAULT_RETRY_CONFIG: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  
  RETRYABLE_ERROR_CODES: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'CONNECTION_FAILED',
    'EXTERNAL_SERVICE_ERROR',
    'SERVICE_UNAVAILABLE'
  ],
  
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session'
  ]
};

// Export error types
export type ErrorHandler = (error: unknown, context?: ErrorContext) => StructuredError;
export type ErrorReporter = (error: StructuredError) => Promise<void>;
export type ErrorFilter = (error: StructuredError) => boolean;