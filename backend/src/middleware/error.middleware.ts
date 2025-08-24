/**
 * Error Handling Middleware
 * Provides centralized error processing and consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes, ErrorSeverity } from '../types/errors';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    correlationId?: string;
    stack?: string;
  };
}

export class ErrorMiddleware {
  /**
   * Global error handler middleware
   */
  static handleError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
      return next(error);
    }

    let statusCode = 500;
    let errorCode = ErrorCodes.SYSTEM_INTERNAL_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;
    let severity = ErrorSeverity.ERROR;

    // Handle known application errors
    if (error instanceof AppError) {
      statusCode = error.statusCode;
      errorCode = error.code;
      message = error.message;
      details = error.details;
      severity = error.severity;
    } else {
      // Handle specific error types
      if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = ErrorCodes.VALIDATION_INVALID_INPUT;
        message = 'Validation failed';
        details = error.message;
      } else if (error.name === 'CastError') {
        statusCode = 400;
        errorCode = ErrorCodes.VALIDATION_INVALID_FORMAT;
        message = 'Invalid data format';
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        statusCode = 500;
        errorCode = ErrorCodes.DATABASE_CONNECTION_ERROR;
        message = 'Database operation failed';
        severity = ErrorSeverity.CRITICAL;
      } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = ErrorCodes.AUTH_INVALID_TOKEN;
        message = 'Invalid authentication token';
      } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = ErrorCodes.AUTH_TOKEN_EXPIRED;
        message = 'Authentication token expired';
      } else if (error.name === 'MulterError') {
        statusCode = 400;
        errorCode = ErrorCodes.FILE_UPLOAD_ERROR;
        message = 'File upload failed';
        details = error.message;
      } else if (error.message?.includes('ENOENT')) {
        statusCode = 404;
        errorCode = ErrorCodes.FILE_NOT_FOUND;
        message = 'File not found';
      } else if (error.message?.includes('EACCES')) {
        statusCode = 403;
        errorCode = ErrorCodes.FILE_ACCESS_DENIED;
        message = 'File access denied';
      }
    }

    // Log the error
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        code: errorCode,
        statusCode,
        stack: error.stack
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      } : null,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    };

    // Log based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('Critical error occurred', logData);
        break;
      case ErrorSeverity.ERROR:
        logger.error('Error occurred', logData);
        break;
      case ErrorSeverity.WARNING:
        logger.warn('Warning occurred', logData);
        break;
      case ErrorSeverity.INFO:
        logger.info('Info level error', logData);
        break;
      default:
        logger.error('Unknown severity error', logData);
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId
      }
    };

    // Add details in development mode
    if (process.env.NODE_ENV === 'development') {
      if (details) {
        errorResponse.error.details = details;
      }
      errorResponse.error.stack = error.stack;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
  };

  /**
   * Handle 404 errors for undefined routes
   */
  static handleNotFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      ErrorCodes.API_ROUTE_NOT_FOUND
    );

    logger.api('Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });

    next(error);
  };

  /**
   * Handle async errors in route handlers
   */
  static asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Handle validation errors specifically
   */
  static handleValidationError = (error: any, req: Request, res: Response, next: NextFunction): void => {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      const appError = new AppError(
        'Validation failed',
        400,
        ErrorCodes.VALIDATION_INVALID_INPUT,
        validationErrors
      );

      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    next(error);
  };

  /**
   * Handle database errors specifically
   */
  static handleDatabaseError = (error: any, req: Request, res: Response, next: NextFunction): void => {
    // SurrealDB specific errors
    if (error.message?.includes('Database connection')) {
      const appError = new AppError(
        'Database connection failed',
        503,
        ErrorCodes.DATABASE_CONNECTION_ERROR,
        undefined,
        ErrorSeverity.CRITICAL
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.message?.includes('Query failed')) {
      const appError = new AppError(
        'Database query failed',
        500,
        ErrorCodes.DATABASE_QUERY_ERROR
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.message?.includes('Duplicate')) {
      const appError = new AppError(
        'Duplicate entry found',
        409,
        ErrorCodes.DATABASE_DUPLICATE_ENTRY
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.message?.includes('Not found')) {
      const appError = new AppError(
        'Record not found',
        404,
        ErrorCodes.DATABASE_RECORD_NOT_FOUND
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    next(error);
  };

  /**
   * Handle authentication errors specifically
   */
  static handleAuthError = (error: any, req: Request, res: Response, next: NextFunction): void => {
    if (error.name === 'JsonWebTokenError') {
      const appError = new AppError(
        'Invalid authentication token',
        401,
        ErrorCodes.AUTH_INVALID_TOKEN
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.name === 'TokenExpiredError') {
      const appError = new AppError(
        'Authentication token expired',
        401,
        ErrorCodes.AUTH_TOKEN_EXPIRED
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.name === 'NotBeforeError') {
      const appError = new AppError(
        'Authentication token not active',
        401,
        ErrorCodes.AUTH_INVALID_TOKEN
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    next(error);
  };

  /**
   * Handle file operation errors
   */
  static handleFileError = (error: any, req: Request, res: Response, next: NextFunction): void => {
    if (error.code === 'ENOENT') {
      const appError = new AppError(
        'File not found',
        404,
        ErrorCodes.FILE_NOT_FOUND
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.code === 'EACCES') {
      const appError = new AppError(
        'File access denied',
        403,
        ErrorCodes.FILE_ACCESS_DENIED
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.code === 'ENOSPC') {
      const appError = new AppError(
        'Insufficient storage space',
        507,
        ErrorCodes.FILE_STORAGE_FULL
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    if (error.name === 'MulterError') {
      let message = 'File upload failed';
      let code = ErrorCodes.FILE_UPLOAD_ERROR;

      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File size too large';
          code = ErrorCodes.FILE_SIZE_EXCEEDED;
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files';
          code = ErrorCodes.FILE_COUNT_EXCEEDED;
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Unexpected file field';
          code = ErrorCodes.FILE_INVALID_TYPE;
          break;
      }

      const appError = new AppError(message, 400, code);
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    next(error);
  };

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError = (error: any, req: Request, res: Response, next: NextFunction): void => {
    if (error.name === 'RateLimitError') {
      const appError = new AppError(
        'Too many requests, please try again later',
        429,
        ErrorCodes.API_RATE_LIMIT_EXCEEDED,
        {
          retryAfter: error.retryAfter,
          limit: error.limit,
          remaining: error.remaining
        }
      );
      return ErrorMiddleware.handleError(appError, req, res, next);
    }

    next(error);
  };

  /**
   * Create error response helper
   */
  static createErrorResponse = (
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    correlationId?: string
  ): ErrorResponse => {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        correlationId
      }
    };
  };

  /**
   * Send error response helper
   */
  static sendErrorResponse = (
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    correlationId?: string
  ): void => {
    const errorResponse = ErrorMiddleware.createErrorResponse(
      code,
      message,
      statusCode,
      details,
      correlationId
    );
    res.status(statusCode).json(errorResponse);
  };
}

// Export middleware functions
export const handleError = ErrorMiddleware.handleError;
export const handleNotFound = ErrorMiddleware.handleNotFound;
export const asyncHandler = ErrorMiddleware.asyncHandler;
export const handleValidationError = ErrorMiddleware.handleValidationError;
export const handleDatabaseError = ErrorMiddleware.handleDatabaseError;
export const handleAuthError = ErrorMiddleware.handleAuthError;
export const handleFileError = ErrorMiddleware.handleFileError;
export const handleRateLimitError = ErrorMiddleware.handleRateLimitError;
export const createErrorResponse = ErrorMiddleware.createErrorResponse;
export const sendErrorResponse = ErrorMiddleware.sendErrorResponse;

// Error handling middleware chain
export const errorHandlingChain = [
  handleValidationError,
  handleDatabaseError,
  handleAuthError,
  handleFileError,
  handleRateLimitError,
  handleError
];