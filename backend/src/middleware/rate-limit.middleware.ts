/**
 * Rate Limiting Middleware
 * Provides configurable rate limiting for API endpoints with different strategies
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import { logSecurityEvent } from './logging.middleware';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimitMiddleware {
  private static store: RateLimitStore = {};
  private static cleanupInterval: NodeJS.Timeout;

  /**
   * Initialize rate limiting with cleanup
   */
  static initialize(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * Cleanup expired entries from store
   */
  private static cleanupExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * General API rate limiting
   */
  static general(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per 15 minutes
      message: {
        success: false,
        error: {
          code: ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          message: 'Too many requests, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'RATE_LIMIT_EXCEEDED',
          {
            limit: 1000,
            window: '15 minutes',
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Strict rate limiting for authentication endpoints
   */
  static auth(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 attempts per 15 minutes
      message: {
        success: false,
        error: {
          code: ErrorCodes.AUTH_RATE_LIMIT_EXCEEDED,
          message: 'Too many authentication attempts, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        // Use IP + email for login attempts
        const email = req.body?.email || 'unknown';
        return `auth:${req.ip}:${email}`;
      },
      skipSuccessfulRequests: true, // Don't count successful logins
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'AUTH_RATE_LIMIT_EXCEEDED',
          {
            limit: 10,
            window: '15 minutes',
            email: req.body?.email,
            endpoint: req.originalUrl
          },
          'high'
        );
      }
    });
  }

  /**
   * Rate limiting for file uploads
   */
  static fileUpload(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100, // 100 uploads per hour
      message: {
        success: false,
        error: {
          code: ErrorCodes.FILE_UPLOAD_RATE_LIMIT,
          message: 'Too many file uploads, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'FILE_UPLOAD_RATE_LIMIT_EXCEEDED',
          {
            limit: 100,
            window: '1 hour',
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Rate limiting for AI/ML operations
   */
  static aiOperations(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 AI operations per hour
      message: {
        success: false,
        error: {
          code: ErrorCodes.AI_RATE_LIMIT_EXCEEDED,
          message: 'Too many AI operations, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'AI_RATE_LIMIT_EXCEEDED',
          {
            limit: 50,
            window: '1 hour',
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Rate limiting for search operations
   */
  static search(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 searches per minute
      message: {
        success: false,
        error: {
          code: ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          message: 'Too many search requests, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'SEARCH_RATE_LIMIT_EXCEEDED',
          {
            limit: 30,
            window: '1 minute',
            endpoint: req.originalUrl
          },
          'low'
        );
      }
    });
  }

  /**
   * Rate limiting for report generation
   */
  static reportGeneration(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 reports per hour
      message: {
        success: false,
        error: {
          code: ErrorCodes.REPORT_RATE_LIMIT_EXCEEDED,
          message: 'Too many report generation requests, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'REPORT_RATE_LIMIT_EXCEEDED',
          {
            limit: 20,
            window: '1 hour',
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Custom rate limiting with configurable options
   */
  static custom(config: RateLimitConfig): RateLimitRequestHandler {
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: config.message || {
        success: false,
        error: {
          code: ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          message: 'Rate limit exceeded',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: config.standardHeaders ?? true,
      legacyHeaders: config.legacyHeaders ?? false,
      skipSuccessfulRequests: config.skipSuccessfulRequests,
      skipFailedRequests: config.skipFailedRequests,
      keyGenerator: config.keyGenerator || ((req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      }),
      skip: config.skip,
      onLimitReached: config.onLimitReached || ((req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'CUSTOM_RATE_LIMIT_EXCEEDED',
          {
            limit: config.max,
            window: `${config.windowMs}ms`,
            endpoint: req.originalUrl
          },
          'medium'
        );
      })
    });
  }

  /**
   * Progressive rate limiting (increases restrictions for repeated violations)
   */
  static progressive() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = req.user?.id || req.ip || 'anonymous';
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      
      if (!this.store[key]) {
        this.store[key] = {
          count: 1,
          resetTime: now + windowMs
        };
        return next();
      }

      const entry = this.store[key];
      
      // Reset if window expired
      if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + windowMs;
        return next();
      }

      entry.count++;

      // Progressive limits based on violation count
      let maxRequests = 1000; // Base limit
      if (entry.count > 5000) maxRequests = 100;  // Severe restriction
      else if (entry.count > 2000) maxRequests = 250; // High restriction
      else if (entry.count > 1500) maxRequests = 500; // Medium restriction

      if (entry.count > maxRequests) {
        logSecurityEvent(
          req,
          'PROGRESSIVE_RATE_LIMIT_EXCEEDED',
          {
            currentCount: entry.count,
            maxRequests,
            endpoint: req.originalUrl
          },
          'high'
        );

        const error = new AppError(
          'Rate limit exceeded - progressive restriction applied',
          429,
          ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          {
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
            limit: maxRequests,
            remaining: 0
          }
        );

        return next(error);
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
      });

      next();
    };
  }

  /**
   * IP-based rate limiting for anonymous users
   */
  static ipBased(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per 15 minutes for anonymous users
      message: {
        success: false,
        error: {
          code: ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          message: 'Too many requests from this IP, please try again later',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => req.ip || 'unknown',
      skip: (req: Request) => !!req.user, // Skip for authenticated users
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'IP_RATE_LIMIT_EXCEEDED',
          {
            limit: 100,
            window: '15 minutes',
            ip: req.ip,
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Burst protection (short-term high-frequency request protection)
   */
  static burstProtection(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute (1 per second average)
      message: {
        success: false,
        error: {
          code: ErrorCodes.API_RATE_LIMIT_EXCEEDED,
          message: 'Request rate too high, please slow down',
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
      },
      onLimitReached: (req: Request, res: Response) => {
        logSecurityEvent(
          req,
          'BURST_RATE_LIMIT_EXCEEDED',
          {
            limit: 60,
            window: '1 minute',
            endpoint: req.originalUrl
          },
          'medium'
        );
      }
    });
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store = {};
  }
}

// Export rate limiting functions
export const generalRateLimit = RateLimitMiddleware.general;
export const authRateLimit = RateLimitMiddleware.auth;
export const fileUploadRateLimit = RateLimitMiddleware.fileUpload;
export const aiOperationsRateLimit = RateLimitMiddleware.aiOperations;
export const searchRateLimit = RateLimitMiddleware.search;
export const reportGenerationRateLimit = RateLimitMiddleware.reportGeneration;
export const customRateLimit = RateLimitMiddleware.custom;
export const progressiveRateLimit = RateLimitMiddleware.progressive;
export const ipBasedRateLimit = RateLimitMiddleware.ipBased;
export const burstProtectionRateLimit = RateLimitMiddleware.burstProtection;

// Initialize rate limiting
RateLimitMiddleware.initialize();

// Cleanup on process exit
process.on('SIGINT', () => {
  RateLimitMiddleware.cleanup();
});

process.on('SIGTERM', () => {
  RateLimitMiddleware.cleanup();
});