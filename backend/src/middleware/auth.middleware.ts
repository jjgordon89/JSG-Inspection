/**
 * Authentication Middleware
 * Handles JWT token validation and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ValidationError } from '../types/errors';
import { UserRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        teamId?: string;
        permissions: string[];
      };
      correlationId?: string;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  teamId?: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  }

  /**
   * Verify JWT token and authenticate user
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        throw new AuthenticationError('No token provided');
      }

      const decoded = this.verifyToken(token) as JWTPayload;
      
      // Verify user still exists and is active
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive');
      }

      // Attach user info to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        teamId: decoded.teamId,
        permissions: decoded.permissions
      };

      logger.auth('User authenticated', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        correlationId: req.correlationId
      });

      next();
    } catch (error) {
      logger.security('Authentication failed', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId
      });
      
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: error.message
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        });
      }
    }
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const decoded = this.verifyToken(token) as JWTPayload;
        
        const user = await this.userRepository.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            teamId: decoded.teamId,
            permissions: decoded.permissions
          };
        }
      }

      next();
    } catch (error) {
      // For optional auth, we don't fail on invalid tokens
      logger.auth('Optional authentication failed', {
        error: error.message,
        correlationId: req.correlationId
      });
      next();
    }
  };

  /**
   * Authorize user based on roles
   */
  authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
          logger.security('Authorization failed - insufficient role', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredRoles: allowedRoles,
            correlationId: req.correlationId
          });
          
          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions to access this resource'
            }
          });
          return;
        }

        logger.auth('User authorized', {
          userId: req.user.id,
          role: req.user.role,
          correlationId: req.correlationId
        });

        next();
      } catch (error) {
        logger.error('Authorization error', {
          error: error.message,
          correlationId: req.correlationId
        });
        
        res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Authorization failed'
          }
        });
      }
    };
  };

  /**
   * Authorize user based on permissions
   */
  authorizePermission = (requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        const hasPermission = requiredPermissions.some(permission => 
          req.user!.permissions.includes(permission)
        );

        if (!hasPermission) {
          logger.security('Authorization failed - insufficient permissions', {
            userId: req.user.id,
            userPermissions: req.user.permissions,
            requiredPermissions,
            correlationId: req.correlationId
          });
          
          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions to access this resource'
            }
          });
          return;
        }

        logger.auth('User authorized by permission', {
          userId: req.user.id,
          permissions: req.user.permissions,
          correlationId: req.correlationId
        });

        next();
      } catch (error) {
        logger.error('Permission authorization error', {
          error: error.message,
          correlationId: req.correlationId
        });
        
        res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Authorization failed'
          }
        });
      }
    };
  };

  /**
   * Authorize team access
   */
  authorizeTeamAccess = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const teamId = req.params.teamId || req.body.teamId;
      
      // Admin and super_admin can access any team
      if (['admin', 'super_admin'].includes(req.user.role)) {
        next();
        return;
      }

      // Users can only access their own team
      if (req.user.teamId !== teamId) {
        logger.security('Team access denied', {
          userId: req.user.id,
          userTeamId: req.user.teamId,
          requestedTeamId: teamId,
          correlationId: req.correlationId
        });
        
        res.status(403).json({
          success: false,
          error: {
            code: 'TEAM_ACCESS_DENIED',
            message: 'Access denied to this team'
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Team authorization error', {
        error: error.message,
        correlationId: req.correlationId
      });
      
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Team authorization failed'
        }
      });
    }
  };

  /**
   * Authorize resource owner or admin
   */
  authorizeOwnerOrAdmin = (userIdField: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];
        
        // Admin and super_admin can access any resource
        if (['admin', 'super_admin'].includes(req.user.role)) {
          next();
          return;
        }

        // Users can only access their own resources
        if (req.user.id !== resourceUserId) {
          logger.security('Resource access denied', {
            userId: req.user.id,
            resourceUserId,
            correlationId: req.correlationId
          });
          
          res.status(403).json({
            success: false,
            error: {
              code: 'RESOURCE_ACCESS_DENIED',
              message: 'Access denied to this resource'
            }
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Resource authorization error', {
          error: error.message,
          correlationId: req.correlationId
        });
        
        res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Resource authorization failed'
          }
        });
      }
    };
  };

  /**
   * Extract token from request headers
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check for token in cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    
    return null;
  }

  /**
   * Verify JWT token
   */
  private verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      } else {
        throw new AuthenticationError('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      } else {
        throw new AuthenticationError('Refresh token verification failed');
      }
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Export individual middleware functions for convenience
export const authenticate = authMiddleware.authenticate;
export const optionalAuthenticate = authMiddleware.optionalAuthenticate;
export const authorize = authMiddleware.authorize;
export const authorizePermission = authMiddleware.authorizePermission;
export const authorizeTeamAccess = authMiddleware.authorizeTeamAccess;
export const authorizeOwnerOrAdmin = authMiddleware.authorizeOwnerOrAdmin;

// Common role-based middleware
export const requireAdmin = authorize(['admin', 'super_admin']);
export const requireManager = authorize(['manager', 'admin', 'super_admin']);
export const requireInspector = authorize(['inspector', 'manager', 'admin', 'super_admin']);
export const requireUser = authorize(['user', 'inspector', 'manager', 'admin', 'super_admin']);

// Common permission-based middleware
export const requireCreatePermission = authorizePermission(['create']);
export const requireUpdatePermission = authorizePermission(['update']);
export const requireDeletePermission = authorizePermission(['delete']);
export const requireViewPermission = authorizePermission(['view']);
export const requireManageUsersPermission = authorizePermission(['manage_users']);
export const requireManageTeamsPermission = authorizePermission(['manage_teams']);
export const requireManageAssetsPermission = authorizePermission(['manage_assets']);
export const requireManageInspectionsPermission = authorizePermission(['manage_inspections']);
export const requireManageReportsPermission = authorizePermission(['manage_reports']);
export const requireSystemAdminPermission = authorizePermission(['system_admin']);