/**
 * Logging Middleware
 * Provides request/response logging, correlation ID tracking, and performance monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
      user?: {
        id: string;
        email: string;
        role: string;
        teamId?: string;
      };
    }
  }
}

export interface RequestLogData {
  correlationId: string;
  method: string;
  url: string;
  originalUrl: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  body?: any;
  ip: string;
  userAgent?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    teamId?: string;
  };
  timestamp: string;
}

export interface ResponseLogData {
  correlationId: string;
  statusCode: number;
  responseTime: number;
  contentLength?: number;
  timestamp: string;
}

export class LoggingMiddleware {
  /**
   * Add correlation ID to requests
   */
  static addCorrelationId = (req: Request, res: Response, next: NextFunction): void => {
    // Get correlation ID from header or generate new one
    req.correlationId = req.get('X-Correlation-ID') || req.get('x-correlation-id') || uuidv4();
    
    // Add correlation ID to response headers
    res.set('X-Correlation-ID', req.correlationId);
    
    next();
  };

  /**
   * Log incoming requests
   */
  static logRequest = (req: Request, res: Response, next: NextFunction): void => {
    req.startTime = Date.now();

    const requestData: RequestLogData = {
      correlationId: req.correlationId!,
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      headers: LoggingMiddleware.sanitizeHeaders(req.headers),
      query: req.query,
      params: req.params,
      body: LoggingMiddleware.sanitizeBody(req.body),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      user: req.user,
      timestamp: new Date().toISOString()
    };

    // Log based on route sensitivity
    if (LoggingMiddleware.isSensitiveRoute(req.originalUrl)) {
      logger.api('Incoming request (sensitive)', {
        ...requestData,
        body: '[REDACTED]',
        headers: LoggingMiddleware.redactSensitiveHeaders(requestData.headers)
      });
    } else {
      logger.api('Incoming request', requestData);
    }

    next();
  };

  /**
   * Log outgoing responses
   */
  static logResponse = (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = function(body: any) {
      LoggingMiddleware.logResponseData(req, res, body);
      return originalSend.call(this, body);
    };

    // Override res.json
    res.json = function(body: any) {
      LoggingMiddleware.logResponseData(req, res, body);
      return originalJson.call(this, body);
    };

    next();
  };

  /**
   * Log response data
   */
  private static logResponseData = (req: Request, res: Response, body?: any): void => {
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;
    const contentLength = res.get('Content-Length');

    const responseData: ResponseLogData = {
      correlationId: req.correlationId!,
      statusCode: res.statusCode,
      responseTime,
      contentLength: contentLength ? parseInt(contentLength) : undefined,
      timestamp: new Date().toISOString()
    };

    // Determine log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Response sent (server error)', {
        ...responseData,
        request: {
          method: req.method,
          url: req.originalUrl,
          user: req.user
        },
        response: LoggingMiddleware.sanitizeResponseBody(body, res.statusCode)
      });
    } else if (res.statusCode >= 400) {
      logger.warn('Response sent (client error)', {
        ...responseData,
        request: {
          method: req.method,
          url: req.originalUrl,
          user: req.user
        },
        response: LoggingMiddleware.sanitizeResponseBody(body, res.statusCode)
      });
    } else {
      logger.api('Response sent', responseData);
    }

    // Log slow requests
    if (responseTime > 1000) {
      logger.performance('Slow request detected', {
        correlationId: req.correlationId!,
        method: req.method,
        url: req.originalUrl,
        responseTime,
        user: req.user
      });
    }
  };

  /**
   * Performance monitoring middleware
   */
  static monitorPerformance = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      const performanceData = {
        correlationId: req.correlationId!,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        memory: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          rss: endMemory.rss - startMemory.rss
        },
        timestamp: new Date().toISOString()
      };

      // Log performance metrics
      if (duration > 5000) { // 5 seconds
        logger.performance('Very slow request', performanceData);
      } else if (duration > 1000) { // 1 second
        logger.performance('Slow request', performanceData);
      } else {
        logger.performance('Request performance', performanceData);
      }
    });

    next();
  };

  /**
   * Security event logging
   */
  static logSecurityEvent = (
    req: Request,
    eventType: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void => {
    const securityData = {
      correlationId: req.correlationId!,
      eventType,
      severity,
      details,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        user: req.user
      },
      timestamp: new Date().toISOString()
    };

    switch (severity) {
      case 'critical':
        logger.security('Critical security event', securityData);
        break;
      case 'high':
        logger.security('High severity security event', securityData);
        break;
      case 'medium':
        logger.security('Medium severity security event', securityData);
        break;
      case 'low':
        logger.security('Low severity security event', securityData);
        break;
    }
  };

  /**
   * Audit logging for important actions
   */
  static logAuditEvent = (
    req: Request,
    action: string,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
    metadata?: Record<string, any>
  ): void => {
    const auditData = {
      correlationId: req.correlationId!,
      action,
      entityType,
      entityId,
      changes,
      metadata,
      user: req.user,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date().toISOString()
    };

    logger.audit('Audit event', auditData);
  };

  /**
   * Sanitize request headers
   */
  private static sanitizeHeaders = (headers: Record<string, any>): Record<string, any> => {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'authentication'
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  };

  /**
   * Redact sensitive headers for sensitive routes
   */
  private static redactSensitiveHeaders = (headers: Record<string, any>): Record<string, any> => {
    const redacted = { ...headers };
    Object.keys(redacted).forEach(key => {
      if (key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('key')) {
        redacted[key] = '[REDACTED]';
      }
    });
    return redacted;
  };

  /**
   * Sanitize request body
   */
  private static sanitizeBody = (body: any): any => {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'refreshToken',
      'apiKey',
      'secret',
      'privateKey'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  };

  /**
   * Sanitize response body
   */
  private static sanitizeResponseBody = (body: any, statusCode: number): any => {
    // Don't log response body for successful requests to reduce noise
    if (statusCode >= 200 && statusCode < 300) {
      return '[SUCCESS_RESPONSE]';
    }

    // For error responses, include the body but sanitize sensitive data
    if (body && typeof body === 'object') {
      const sanitized = { ...body };
      if (sanitized.error && sanitized.error.stack && process.env.NODE_ENV === 'production') {
        sanitized.error.stack = '[REDACTED_IN_PRODUCTION]';
      }
      return sanitized;
    }

    return body;
  };

  /**
   * Check if route is sensitive
   */
  private static isSensitiveRoute = (url: string): boolean => {
    const sensitiveRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/reset-password',
      '/api/auth/change-password',
      '/api/users/password'
    ];

    return sensitiveRoutes.some(route => url.includes(route));
  };

  /**
   * Create request context middleware
   */
  static createRequestContext = (req: Request, res: Response, next: NextFunction): void => {
    // Add request context that can be used throughout the request lifecycle
    req.context = {
      correlationId: req.correlationId!,
      startTime: Date.now(),
      user: req.user,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    next();
  };
}

// Export middleware functions
export const addCorrelationId = LoggingMiddleware.addCorrelationId;
export const logRequest = LoggingMiddleware.logRequest;
export const logResponse = LoggingMiddleware.logResponse;
export const monitorPerformance = LoggingMiddleware.monitorPerformance;
export const logSecurityEvent = LoggingMiddleware.logSecurityEvent;
export const logAuditEvent = LoggingMiddleware.logAuditEvent;
export const createRequestContext = LoggingMiddleware.createRequestContext;

// Complete logging middleware chain
export const loggingMiddlewareChain = [
  addCorrelationId,
  createRequestContext,
  logRequest,
  logResponse,
  monitorPerformance
];

// Extend Express Request interface for context
declare global {
  namespace Express {
    interface Request {
      context?: {
        correlationId: string;
        startTime: number;
        user?: {
          id: string;
          email: string;
          role: string;
          teamId?: string;
        };
        ip: string;
        userAgent?: string;
      };
    }
  }
}