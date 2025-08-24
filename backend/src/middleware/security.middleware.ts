/**
 * Security Middleware
 * Provides comprehensive security measures including CORS, headers, input sanitization
 */

import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import { logSecurityEvent } from './logging.middleware';

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    optionsSuccessStatus: number;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
  };
  inputSanitization: {
    enabled: boolean;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
  };
}

export class SecurityMiddleware {
  private static config: SecurityConfig = {
    cors: {
      origins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      credentials: true,
      optionsSuccessStatus: 200
    },
    helmet: {
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: false,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: true,
      xssFilter: true
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000,
      max: 1000
    },
    inputSanitization: {
      enabled: true,
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {
        'a': ['href'],
        'img': ['src', 'alt']
      }
    }
  };

  /**
   * Configure CORS middleware
   */
  static configureCors(): cors.CorsOptions {
    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (this.config.cors.origins.includes(origin)) {
          return callback(null, true);
        }

        // In development, allow localhost with any port
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
          return callback(null, true);
        }

        // Log blocked origin
        logger.security('CORS origin blocked', {
          origin,
          allowedOrigins: this.config.cors.origins,
          timestamp: new Date().toISOString()
        });

        callback(new Error('Not allowed by CORS'));
      },
      credentials: this.config.cors.credentials,
      optionsSuccessStatus: this.config.cors.optionsSuccessStatus,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Correlation-ID',
        'X-API-Key'
      ],
      exposedHeaders: [
        'X-Correlation-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
      ]
    };

    return corsOptions;
  }

  /**
   * Configure Helmet security headers
   */
  static configureHelmet() {
    return helmet({
      contentSecurityPolicy: this.config.helmet.contentSecurityPolicy ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"]
        }
      } : false,
      crossOriginEmbedderPolicy: this.config.helmet.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: this.config.helmet.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: this.config.helmet.crossOriginResourcePolicy ? {
        policy: 'cross-origin'
      } : false,
      dnsPrefetchControl: this.config.helmet.dnsPrefetchControl,
      frameguard: this.config.helmet.frameguard ? { action: 'deny' } : false,
      hidePoweredBy: this.config.helmet.hidePoweredBy,
      hsts: this.config.helmet.hsts ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      } : false,
      ieNoOpen: this.config.helmet.ieNoOpen,
      noSniff: this.config.helmet.noSniff,
      originAgentCluster: this.config.helmet.originAgentCluster,
      permittedCrossDomainPolicies: this.config.helmet.permittedCrossDomainPolicies,
      referrerPolicy: this.config.helmet.referrerPolicy ? {
        policy: 'strict-origin-when-cross-origin'
      } : false,
      xssFilter: this.config.helmet.xssFilter
    });
  }

  /**
   * Input sanitization middleware
   */
  static sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.config.inputSanitization.enabled) {
      return next();
    }

    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = SecurityMiddleware.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = SecurityMiddleware.sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = SecurityMiddleware.sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      logSecurityEvent(
        req,
        'INPUT_SANITIZATION_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          body: req.body,
          query: req.query,
          params: req.params
        },
        'medium'
      );

      next(new AppError(
        'Invalid input data',
        400,
        ErrorCodes.VALIDATION_INVALID_INPUT
      ));
    }
  };

  /**
   * Sanitize object recursively
   */
  private static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize string input
   */
  private static sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    // Remove null bytes
    str = str.replace(/\0/g, '');

    // Remove potential script injections
    str = str.replace(/<script[^>]*>.*?<\/script>/gi, '');
    str = str.replace(/javascript:/gi, '');
    str = str.replace(/on\w+\s*=/gi, '');

    // Remove potential SQL injection patterns
    str = str.replace(/('|(\-\-)|(;)|(\||\|)|(\*|\*))/g, '');

    // Remove potential NoSQL injection patterns
    str = str.replace(/\$\w+/g, '');

    // Trim whitespace
    str = str.trim();

    return str;
  }

  /**
   * API key validation middleware
   */
  static validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.get('X-API-Key');
    
    if (!apiKey) {
      logSecurityEvent(
        req,
        'MISSING_API_KEY',
        { endpoint: req.originalUrl },
        'medium'
      );

      return next(new AppError(
        'API key required',
        401,
        ErrorCodes.AUTH_MISSING_TOKEN
      ));
    }

    // Validate API key format
    if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
      logSecurityEvent(
        req,
        'INVALID_API_KEY_FORMAT',
        { 
          apiKey: apiKey.substring(0, 8) + '...',
          endpoint: req.originalUrl 
        },
        'high'
      );

      return next(new AppError(
        'Invalid API key format',
        401,
        ErrorCodes.AUTH_INVALID_TOKEN
      ));
    }

    // TODO: Validate against stored API keys
    // This would typically involve checking against a database
    
    next();
  };

  /**
   * Request size limiting middleware
   */
  static limitRequestSize = (maxSize: string = '10mb') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = req.get('Content-Length');
      
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength);
        const maxSizeInBytes = this.parseSize(maxSize);
        
        if (sizeInBytes > maxSizeInBytes) {
          logSecurityEvent(
            req,
            'REQUEST_SIZE_EXCEEDED',
            {
              contentLength: sizeInBytes,
              maxSize: maxSizeInBytes,
              endpoint: req.originalUrl
            },
            'medium'
          );

          return next(new AppError(
            'Request size too large',
            413,
            ErrorCodes.VALIDATION_REQUEST_TOO_LARGE
          ));
        }
      }
      
      next();
    };
  };

  /**
   * Parse size string to bytes
   */
  private static parseSize(size: string): number {
    const units: Record<string, number> = {
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) {
      throw new Error(`Invalid size format: ${size}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return Math.floor(value * units[unit]);
  }

  /**
   * Security headers middleware
   */
  static securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Add custom security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    next();
  };

  /**
   * IP whitelist middleware
   */
  static ipWhitelist = (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        return next();
      }

      if (!allowedIPs.includes(clientIP)) {
        logSecurityEvent(
          req,
          'IP_NOT_WHITELISTED',
          {
            clientIP,
            allowedIPs,
            endpoint: req.originalUrl
          },
          'high'
        );

        return next(new AppError(
          'Access denied',
          403,
          ErrorCodes.AUTH_ACCESS_DENIED
        ));
      }

      next();
    };
  };

  /**
   * User agent validation middleware
   */
  static validateUserAgent = (req: Request, res: Response, next: NextFunction): void => {
    const userAgent = req.get('User-Agent');
    
    if (!userAgent) {
      logSecurityEvent(
        req,
        'MISSING_USER_AGENT',
        { endpoint: req.originalUrl },
        'low'
      );
    }

    // Check for suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];

    if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      logSecurityEvent(
        req,
        'SUSPICIOUS_USER_AGENT',
        {
          userAgent,
          endpoint: req.originalUrl
        },
        'medium'
      );
    }

    next();
  };

  /**
   * Update security configuration
   */
  static updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current security configuration
   */
  static getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Export middleware functions
export const configureCors = SecurityMiddleware.configureCors;
export const configureHelmet = SecurityMiddleware.configureHelmet;
export const sanitizeInput = SecurityMiddleware.sanitizeInput;
export const validateApiKey = SecurityMiddleware.validateApiKey;
export const limitRequestSize = SecurityMiddleware.limitRequestSize;
export const securityHeaders = SecurityMiddleware.securityHeaders;
export const ipWhitelist = SecurityMiddleware.ipWhitelist;
export const validateUserAgent = SecurityMiddleware.validateUserAgent;

// Complete security middleware chain
export const securityMiddlewareChain = [
  SecurityMiddleware.configureHelmet(),
  cors(SecurityMiddleware.configureCors()),
  securityHeaders,
  validateUserAgent,
  sanitizeInput,
  limitRequestSize()
];