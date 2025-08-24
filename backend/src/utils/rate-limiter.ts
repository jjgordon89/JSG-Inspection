/**
 * Rate Limiter Utility
 * Implements rate limiting for API endpoints and WebSocket connections
 */

import { logger } from './logger';

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
  onLimitReached?: (identifier: string, resetTime: Date) => void;
}

export interface RateLimitInfo {
  identifier: string;
  requests: number;
  maxRequests: number;
  resetTime: Date;
  remaining: number;
  isLimited: boolean;
}

export interface RateLimitStore {
  identifier: string;
  requests: number;
  resetTime: Date;
  firstRequest: Date;
}

export class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (identifier: string) => identifier,
      onLimitReached: () => {},
      ...options
    };

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    logger.debug('Rate limiter initialized', {
      windowMs: this.options.windowMs,
      maxRequests: this.options.maxRequests
    });
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    identifier: string,
    maxRequests?: number,
    windowMs?: number
  ): Promise<boolean> {
    try {
      const key = this.options.keyGenerator(identifier);
      const now = new Date();
      const requestLimit = maxRequests || this.options.maxRequests;
      const timeWindow = windowMs || this.options.windowMs;
      
      let store = this.store.get(key);
      
      // Initialize or reset if window expired
      if (!store || now.getTime() >= store.resetTime.getTime()) {
        store = {
          identifier: key,
          requests: 0,
          resetTime: new Date(now.getTime() + timeWindow),
          firstRequest: now
        };
        this.store.set(key, store);
      }
      
      // Check if limit exceeded
      if (store.requests >= requestLimit) {
        this.options.onLimitReached(identifier, store.resetTime);
        
        logger.warn('Rate limit exceeded', {
          identifier,
          requests: store.requests,
          maxRequests: requestLimit,
          resetTime: store.resetTime
        });
        
        return false;
      }
      
      // Increment request count
      store.requests++;
      
      logger.debug('Rate limit check passed', {
        identifier,
        requests: store.requests,
        maxRequests: requestLimit,
        remaining: requestLimit - store.requests
      });
      
      return true;
    } catch (error) {
      logger.error('Rate limit check failed', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Allow request on error to avoid blocking legitimate traffic
      return true;
    }
  }

  /**
   * Record a request (for manual tracking)
   */
  async recordRequest(
    identifier: string,
    success: boolean = true
  ): Promise<RateLimitInfo> {
    try {
      // Skip recording based on options
      if ((success && this.options.skipSuccessfulRequests) ||
          (!success && this.options.skipFailedRequests)) {
        return this.getInfo(identifier);
      }
      
      const key = this.options.keyGenerator(identifier);
      const now = new Date();
      
      let store = this.store.get(key);
      
      // Initialize or reset if window expired
      if (!store || now.getTime() >= store.resetTime.getTime()) {
        store = {
          identifier: key,
          requests: 0,
          resetTime: new Date(now.getTime() + this.options.windowMs),
          firstRequest: now
        };
        this.store.set(key, store);
      }
      
      // Increment request count
      store.requests++;
      
      return this.getInfo(identifier);
    } catch (error) {
      logger.error('Record request failed', {
        identifier,
        success,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.getInfo(identifier);
    }
  }

  /**
   * Get rate limit information for identifier
   */
  getInfo(identifier: string): RateLimitInfo {
    try {
      const key = this.options.keyGenerator(identifier);
      const store = this.store.get(key);
      const now = new Date();
      
      if (!store || now.getTime() >= store.resetTime.getTime()) {
        return {
          identifier,
          requests: 0,
          maxRequests: this.options.maxRequests,
          resetTime: new Date(now.getTime() + this.options.windowMs),
          remaining: this.options.maxRequests,
          isLimited: false
        };
      }
      
      const remaining = Math.max(0, this.options.maxRequests - store.requests);
      const isLimited = store.requests >= this.options.maxRequests;
      
      return {
        identifier,
        requests: store.requests,
        maxRequests: this.options.maxRequests,
        resetTime: store.resetTime,
        remaining,
        isLimited
      };
    } catch (error) {
      logger.error('Get rate limit info failed', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return safe defaults on error
      return {
        identifier,
        requests: 0,
        maxRequests: this.options.maxRequests,
        resetTime: new Date(Date.now() + this.options.windowMs),
        remaining: this.options.maxRequests,
        isLimited: false
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    try {
      const key = this.options.keyGenerator(identifier);
      this.store.delete(key);
      
      logger.debug('Rate limit reset', { identifier });
    } catch (error) {
      logger.error('Rate limit reset failed', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    try {
      const count = this.store.size;
      this.store.clear();
      
      logger.info('All rate limits reset', { count });
    } catch (error) {
      logger.error('Reset all rate limits failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all active rate limits
   */
  getAllLimits(): RateLimitInfo[] {
    try {
      const limits: RateLimitInfo[] = [];
      const now = new Date();
      
      for (const [key, store] of this.store.entries()) {
        // Skip expired entries
        if (now.getTime() >= store.resetTime.getTime()) {
          continue;
        }
        
        const remaining = Math.max(0, this.options.maxRequests - store.requests);
        const isLimited = store.requests >= this.options.maxRequests;
        
        limits.push({
          identifier: store.identifier,
          requests: store.requests,
          maxRequests: this.options.maxRequests,
          resetTime: store.resetTime,
          remaining,
          isLimited
        });
      }
      
      return limits;
    } catch (error) {
      logger.error('Get all limits failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return [];
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalIdentifiers: number;
    activeLimits: number;
    limitedIdentifiers: number;
    totalRequests: number;
    averageRequests: number;
  } {
    try {
      const now = new Date();
      let activeLimits = 0;
      let limitedIdentifiers = 0;
      let totalRequests = 0;
      
      for (const [key, store] of this.store.entries()) {
        // Skip expired entries
        if (now.getTime() >= store.resetTime.getTime()) {
          continue;
        }
        
        activeLimits++;
        totalRequests += store.requests;
        
        if (store.requests >= this.options.maxRequests) {
          limitedIdentifiers++;
        }
      }
      
      const averageRequests = activeLimits > 0 ? totalRequests / activeLimits : 0;
      
      return {
        totalIdentifiers: this.store.size,
        activeLimits,
        limitedIdentifiers,
        totalRequests,
        averageRequests: Math.round(averageRequests * 100) / 100
      };
    } catch (error) {
      logger.error('Get rate limiter stats failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        totalIdentifiers: 0,
        activeLimits: 0,
        limitedIdentifiers: 0,
        totalRequests: 0,
        averageRequests: 0
      };
    }
  }

  /**
   * Check if identifier is currently limited
   */
  isLimited(identifier: string): boolean {
    try {
      const info = this.getInfo(identifier);
      return info.isLimited;
    } catch (error) {
      logger.error('Check is limited failed', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return false;
    }
  }

  /**
   * Get time until reset for identifier
   */
  getTimeUntilReset(identifier: string): number {
    try {
      const info = this.getInfo(identifier);
      const now = Date.now();
      const resetTime = info.resetTime.getTime();
      
      return Math.max(0, resetTime - now);
    } catch (error) {
      logger.error('Get time until reset failed', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return 0;
    }
  }

  /**
   * Set custom limit for specific identifier
   */
  setCustomLimit(
    identifier: string,
    maxRequests: number,
    windowMs?: number
  ): void {
    try {
      const key = this.options.keyGenerator(identifier);
      const now = new Date();
      const timeWindow = windowMs || this.options.windowMs;
      
      const store: RateLimitStore = {
        identifier: key,
        requests: 0,
        resetTime: new Date(now.getTime() + timeWindow),
        firstRequest: now
      };
      
      this.store.set(key, store);
      
      logger.debug('Custom rate limit set', {
        identifier,
        maxRequests,
        windowMs: timeWindow
      });
    } catch (error) {
      logger.error('Set custom limit failed', {
        identifier,
        maxRequests,
        windowMs,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    try {
      const now = new Date();
      let cleanedCount = 0;
      
      for (const [key, store] of this.store.entries()) {
        if (now.getTime() >= store.resetTime.getTime()) {
          this.store.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.debug('Rate limiter cleanup completed', {
          cleanedCount,
          remainingCount: this.store.size
        });
      }
    } catch (error) {
      logger.error('Rate limiter cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Destroy rate limiter and clean up resources
   */
  destroy(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      
      this.store.clear();
      
      logger.info('Rate limiter destroyed');
    } catch (error) {
      logger.error('Rate limiter destroy failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

/**
 * Express middleware factory for rate limiting
 */
export function createRateLimitMiddleware(options: RateLimiterOptions) {
  const rateLimiter = new RateLimiter(options);
  
  return async (req: any, res: any, next: any) => {
    try {
      // Generate identifier (IP + User ID if available)
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userId = req.user?.id || '';
      const identifier = userId ? `${ip}:${userId}` : ip;
      
      // Check rate limit
      const allowed = await rateLimiter.checkLimit(identifier);
      
      if (!allowed) {
        const info = rateLimiter.getInfo(identifier);
        
        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': info.maxRequests.toString(),
          'X-RateLimit-Remaining': info.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(info.resetTime.getTime() / 1000).toString(),
          'Retry-After': Math.ceil((info.resetTime.getTime() - Date.now()) / 1000).toString()
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000)
        });
      }
      
      // Record successful request
      const info = await rateLimiter.recordRequest(identifier, true);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': info.maxRequests.toString(),
        'X-RateLimit-Remaining': info.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(info.resetTime.getTime() / 1000).toString()
      });
      
      next();
    } catch (error) {
      logger.error('Rate limit middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Allow request on error
      next();
    }
  };
}

/**
 * WebSocket rate limiting helper
 */
export function createWebSocketRateLimiter(options: RateLimiterOptions) {
  return new RateLimiter({
    ...options,
    keyGenerator: (identifier: string) => `ws:${identifier}`
  });
}

/**
 * API rate limiting helper
 */
export function createAPIRateLimiter(options: RateLimiterOptions) {
  return new RateLimiter({
    ...options,
    keyGenerator: (identifier: string) => `api:${identifier}`
  });
}