/**
 * Auth Controller
 * Handles HTTP requests for authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { RateLimiter } from '../utils/rate-limiter';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  AuthResponse,
  UserRole,
  UserPermission
} from '../types/auth';
import { User } from '../types/user';

export class AuthController {
  private loginRateLimiter: RateLimiter;
  private registerRateLimiter: RateLimiter;
  private passwordResetRateLimiter: RateLimiter;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    // Initialize rate limiters for auth endpoints
    this.loginRateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per window
      keyGenerator: (req) => req.ip + ':' + (req.body.email || req.body.username)
    });

    this.registerRateLimiter = new RateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 registrations per hour per IP
      keyGenerator: (req) => req.ip
    });

    this.passwordResetRateLimiter = new RateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 password reset attempts per hour
      keyGenerator: (req) => req.ip + ':' + req.body.email
    });
  }

  /**
   * User login
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Apply rate limiting
      const rateLimitResult = await this.loginRateLimiter.checkLimit(req);
      if (!rateLimitResult.allowed) {
        throw new AppError(
          `Too many login attempts. Try again in ${Math.ceil(rateLimitResult.resetTime! / 1000)} seconds`,
          429
        );
      }

      const loginData: LoginRequest = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      const deviceId = req.headers['x-device-id'] as string;

      // Validate required fields
      if (!loginData.email && !loginData.username) {
        throw new AppError('Email or username is required', 400);
      }

      if (!loginData.password) {
        throw new AppError('Password is required', 400);
      }

      // Attempt login
      const authResult: AuthResponse = await this.authService.login({
        ...loginData,
        userAgent,
        ipAddress,
        deviceId
      });

      // Record successful login
      await this.loginRateLimiter.recordRequest(req);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove refresh token from response body
      const { refreshToken, ...responseData } = authResult;

      res.json({
        success: true,
        data: responseData,
        message: 'Login successful'
      });
    } catch (error) {
      // Record failed attempt for rate limiting
      await this.loginRateLimiter.recordRequest(req);
      next(error);
    }
  };

  /**
   * User registration
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Apply rate limiting
      const rateLimitResult = await this.registerRateLimiter.checkLimit(req);
      if (!rateLimitResult.allowed) {
        throw new AppError(
          `Too many registration attempts. Try again in ${Math.ceil(rateLimitResult.resetTime! / 1000)} seconds`,
          429
        );
      }

      const registerData: RegisterRequest = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      const deviceId = req.headers['x-device-id'] as string;

      // Validate required fields
      if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
        throw new AppError('Email, password, first name, and last name are required', 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Validate password strength
      if (registerData.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      // Register user
      const authResult: AuthResponse = await this.authService.register({
        ...registerData,
        userAgent,
        ipAddress,
        deviceId
      });

      // Record registration attempt
      await this.registerRateLimiter.recordRequest(req);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove refresh token from response body
      const { refreshToken, ...responseData } = authResult;

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Registration successful'
      });
    } catch (error) {
      await this.registerRateLimiter.recordRequest(req);
      next(error);
    }
  };

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshTokenFromCookie = req.cookies.refreshToken;
      const refreshTokenFromBody = req.body.refreshToken;
      const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      const deviceId = req.headers['x-device-id'] as string;

      const authResult: AuthResponse = await this.authService.refreshToken({
        refreshToken,
        userAgent,
        ipAddress,
        deviceId
      });

      // Update refresh token cookie if a new one was issued
      if (authResult.refreshToken) {
        res.cookie('refreshToken', authResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      // Remove refresh token from response body
      const { refreshToken: newRefreshToken, ...responseData } = authResult;

      res.json({
        success: true,
        data: responseData,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * User logout
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const sessionId = req.user?.sessionId;
      const userId = req.user?.id;

      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      if (sessionId && userId) {
        await this.authService.invalidateSession(userId, sessionId);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout from all devices
   * POST /api/auth/logout-all
   */
  logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.authService.logoutAll(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const changePasswordData: ChangePasswordRequest = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!changePasswordData.currentPassword || !changePasswordData.newPassword) {
        throw new AppError('Current password and new password are required', 400);
      }

      if (changePasswordData.newPassword.length < 8) {
        throw new AppError('New password must be at least 8 characters long', 400);
      }

      if (changePasswordData.currentPassword === changePasswordData.newPassword) {
        throw new AppError('New password must be different from current password', 400);
      }

      await this.authService.changePassword(userId, changePasswordData);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Apply rate limiting
      const rateLimitResult = await this.passwordResetRateLimiter.checkLimit(req);
      if (!rateLimitResult.allowed) {
        throw new AppError(
          `Too many password reset attempts. Try again in ${Math.ceil(rateLimitResult.resetTime! / 1000)} seconds`,
          429
        );
      }

      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400);
      }

      await this.authService.requestPasswordReset(email);
      await this.passwordResetRateLimiter.recordRequest(req);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      await this.passwordResetRateLimiter.recordRequest(req);
      next(error);
    }
  };

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resetData: ResetPasswordRequest = req.body;

      if (!resetData.token || !resetData.newPassword) {
        throw new AppError('Reset token and new password are required', 400);
      }

      if (resetData.newPassword.length < 8) {
        throw new AppError('New password must be at least 8 characters long', 400);
      }

      await this.authService.resetPassword(resetData);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email address
   * POST /api/auth/verify-email
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData: VerifyEmailRequest = req.body;

      if (!verifyData.token) {
        throw new AppError('Verification token is required', 400);
      }

      const user = await this.authService.verifyEmail(verifyData.token);

      res.json({
        success: true,
        data: { user },
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend email verification
   * POST /api/auth/resend-verification
   */
  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      await this.authService.resendEmailVerification(email);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user sessions
   * GET /api/auth/sessions
   */
  getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const sessions = await this.authService.getUserSessions(userId);

      res.json({
        success: true,
        data: { sessions }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Revoke specific session
   * DELETE /api/auth/sessions/:sessionId
   */
  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.authService.revokeSession(userId, sessionId);

      res.json({
        success: true,
        message: 'Session revoked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user has specific permission
   * GET /api/auth/permissions/:permission
   */
  checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permission } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const hasPermission = await this.authService.checkPermission(userId, permission as UserPermission);

      res.json({
        success: true,
        data: { hasPermission }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user has specific role
   * GET /api/auth/roles/:role
   */
  checkRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const hasRole = await this.authService.checkRole(userId, role as UserRole);

      res.json({
        success: true,
        data: { hasRole }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate current session
   * GET /api/auth/validate
   */
  validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.user?.sessionId;

      if (!userId || !sessionId) {
        throw new AppError('Invalid session', 401);
      }

      const isValid = await this.authService.validateSession(userId, sessionId);

      if (!isValid) {
        throw new AppError('Session expired or invalid', 401);
      }

      res.json({
        success: true,
        data: { valid: true },
        message: 'Session is valid'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get authentication statistics (Admin only)
   * GET /api/auth/stats
   */
  getAuthStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin')) {
        throw new AppError('Insufficient permissions', 403);
      }

      const timeRange = req.query.timeRange as string || '7d';
      const stats = await this.authService.getAuthStats(timeRange);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const authValidationSchemas = {
  login: {
    email: { required: false, type: 'string', format: 'email' },
    username: { required: false, type: 'string', minLength: 3, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 1 },
    rememberMe: { required: false, type: 'boolean' }
  },
  register: {
    email: { required: true, type: 'string', format: 'email' },
    username: { required: false, type: 'string', minLength: 3, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 8 },
    firstName: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    lastName: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    phone: { required: false, type: 'string' },
    company: { required: false, type: 'string', maxLength: 100 },
    acceptTerms: { required: true, type: 'boolean', enum: [true] }
  },
  refreshToken: {
    refreshToken: { required: false, type: 'string' }
  },
  changePassword: {
    currentPassword: { required: true, type: 'string', minLength: 1 },
    newPassword: { required: true, type: 'string', minLength: 8 }
  },
  forgotPassword: {
    email: { required: true, type: 'string', format: 'email' }
  },
  resetPassword: {
    token: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string', minLength: 8 }
  },
  verifyEmail: {
    token: { required: true, type: 'string' }
  },
  resendVerification: {
    email: { required: true, type: 'string', format: 'email' }
  }
};