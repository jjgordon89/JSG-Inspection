/**
 * Authentication Service
 * Handles user authentication, JWT tokens, refresh tokens, and password management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  User,
  CreateUserDTO,
  LoginCredentials,
  AuthTokens,
  RefreshTokenPayload,
  JWTPayload,
  PasswordResetRequest,
  ChangePasswordRequest,
  UserRole,
  UserPermission
} from '../types/auth';

export interface AuthConfig {
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  password: {
    saltRounds: number;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    passwordResetExpiry: number; // in minutes
    sessionTimeout: number; // in minutes
  };
}

export class AuthService {
  private userRepository: UserRepository;
  private auditLogRepository: AuditLogRepository;
  private config: AuthConfig;

  constructor(
    userRepository: UserRepository,
    auditLogRepository: AuditLogRepository
  ) {
    this.userRepository = userRepository;
    this.auditLogRepository = auditLogRepository;
    this.config = this.getDefaultConfig();
  }

  /**
   * Get default authentication configuration
   */
  private getDefaultConfig(): AuthConfig {
    return {
      jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
        issuer: process.env.JWT_ISSUER || 'jsg-inspections',
        audience: process.env.JWT_AUDIENCE || 'jsg-inspections-api'
      },
      password: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      security: {
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        passwordResetExpiry: 60,
        sessionTimeout: 480 // 8 hours
      }
    };
  }

  /**
   * Register a new user
   */
  async register(
    userData: CreateUserDTO,
    createdBy?: string,
    ipAddress?: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Validate password strength
      this.validatePasswordStrength(userData.password);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError(
          'User with this email already exists',
          409,
          ErrorCodes.AUTH_USER_EXISTS
        );
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
        emailVerified: false,
        loginAttempts: 0,
        lastLogin: null,
        createdBy: createdBy || 'system'
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log audit event
      await this.auditLogRepository.create({
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'user',
        entityId: user.id,
        details: {
          email: user.email,
          role: user.role,
          createdBy
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        user: this.sanitizeUser(user),
        tokens
      };
    } catch (error) {
      logger.error('User registration failed', {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async login(
    credentials: LoginCredentials,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        await this.logFailedLogin(credentials.email, 'USER_NOT_FOUND', ipAddress, userAgent);
        throw new AppError(
          'Invalid credentials',
          401,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logFailedLogin(credentials.email, 'USER_INACTIVE', ipAddress, userAgent);
        throw new AppError(
          'Account is deactivated',
          401,
          ErrorCodes.AUTH_ACCOUNT_DEACTIVATED
        );
      }

      // Check if account is locked
      if (await this.isAccountLocked(user)) {
        await this.logFailedLogin(credentials.email, 'ACCOUNT_LOCKED', ipAddress, userAgent);
        throw new AppError(
          'Account is temporarily locked due to too many failed login attempts',
          423,
          ErrorCodes.AUTH_ACCOUNT_LOCKED
        );
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user, ipAddress, userAgent);
        throw new AppError(
          'Invalid credentials',
          401,
          ErrorCodes.AUTH_INVALID_CREDENTIALS
        );
      }

      // Reset login attempts on successful login
      await this.userRepository.update(user.id, {
        loginAttempts: 0,
        lastLogin: new Date(),
        lockedUntil: null
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log successful login
      await this.auditLogRepository.create({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'user',
        entityId: user.id,
        details: {
          email: user.email,
          loginMethod: 'password'
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ipAddress
      });

      return {
        user: this.sanitizeUser(user),
        tokens
      };
    } catch (error) {
      logger.error('User login failed', {
        email: credentials.email,
        ipAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new AppError(
          'Invalid refresh token',
          401,
          ErrorCodes.AUTH_INVALID_TOKEN
        );
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Log token refresh
      await this.auditLogRepository.create({
        userId: user.id,
        action: 'TOKEN_REFRESHED',
        entityType: 'user',
        entityId: user.id,
        details: {
          email: user.email
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.debug('Token refreshed successfully', {
        userId: user.id,
        email: user.email
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ipAddress
      });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(
    userId: string,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // TODO: Add refresh token to blacklist/revocation list
      // This would typically involve storing revoked tokens in Redis or database
      
      // Log logout
      await this.auditLogRepository.create({
        userId,
        action: 'USER_LOGOUT',
        entityType: 'user',
        entityId: userId,
        details: {
          logoutMethod: 'manual'
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.info('User logged out successfully', {
        userId,
        ipAddress
      });
    } catch (error) {
      logger.error('Logout failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    request: ChangePasswordRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(
          'User not found',
          404,
          ErrorCodes.AUTH_USER_NOT_FOUND
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(
        request.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new AppError(
          'Current password is incorrect',
          400,
          ErrorCodes.AUTH_INVALID_CURRENT_PASSWORD
        );
      }

      // Validate new password strength
      this.validatePasswordStrength(request.newPassword);

      // Check if new password is different from current
      const isSamePassword = await this.verifyPassword(request.newPassword, user.password);
      if (isSamePassword) {
        throw new AppError(
          'New password must be different from current password',
          400,
          ErrorCodes.AUTH_SAME_PASSWORD
        );
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(request.newPassword);

      // Update password
      await this.userRepository.update(userId, {
        password: hashedPassword,
        passwordChangedAt: new Date()
      });

      // Log password change
      await this.auditLogRepository.create({
        userId,
        action: 'PASSWORD_CHANGED',
        entityType: 'user',
        entityId: userId,
        details: {
          email: user.email,
          changeMethod: 'manual'
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.info('Password changed successfully', {
        userId,
        email: user.email
      });
    } catch (error) {
      logger.error('Password change failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ resetToken: string; expiresAt: Date }> {
    try {
      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        logger.warn('Password reset requested for non-existent user', { email });
        throw new AppError(
          'If the email exists, a reset link will be sent',
          200,
          ErrorCodes.AUTH_PASSWORD_RESET_SENT
        );
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + this.config.security.passwordResetExpiry * 60 * 1000);

      // Save reset token
      await this.userRepository.update(user.id, {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: expiresAt
      });

      // Log password reset request
      await this.auditLogRepository.create({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'user',
        entityId: user.id,
        details: {
          email: user.email
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.info('Password reset requested', {
        userId: user.id,
        email: user.email
      });

      return { resetToken, expiresAt };
    } catch (error) {
      logger.error('Password reset request failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetToken: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Hash the provided token
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Find user with valid reset token
      const user = await this.userRepository.findByPasswordResetToken(hashedToken);
      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        throw new AppError(
          'Invalid or expired reset token',
          400,
          ErrorCodes.AUTH_INVALID_RESET_TOKEN
        );
      }

      // Validate new password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0,
        lockedUntil: null
      });

      // Log password reset
      await this.auditLogRepository.create({
        userId: user.id,
        action: 'PASSWORD_RESET',
        entityType: 'user',
        entityId: user.id,
        details: {
          email: user.email,
          resetMethod: 'token'
        },
        ipAddress,
        userAgent,
        severity: 'info'
      });

      logger.info('Password reset successfully', {
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      logger.error('Password reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.config.jwt.accessTokenSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          'Access token expired',
          401,
          ErrorCodes.AUTH_TOKEN_EXPIRED
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          'Invalid access token',
          401,
          ErrorCodes.AUTH_INVALID_TOKEN
        );
      }
      throw error;
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, this.config.jwt.refreshTokenSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience
      }) as RefreshTokenPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          'Refresh token expired',
          401,
          ErrorCodes.AUTH_TOKEN_EXPIRED
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          'Invalid refresh token',
          401,
          ErrorCodes.AUTH_INVALID_TOKEN
        );
      }
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const now = Math.floor(Date.now() / 1000);
    
    const accessTokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      teamId: user.teamId,
      iat: now,
      exp: now + this.parseExpiry(this.config.jwt.accessTokenExpiry),
      iss: this.config.jwt.issuer,
      aud: this.config.jwt.audience
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenVersion: user.tokenVersion || 0,
      iat: now,
      exp: now + this.parseExpiry(this.config.jwt.refreshTokenExpiry),
      iss: this.config.jwt.issuer,
      aud: this.config.jwt.audience
    };

    const accessToken = jwt.sign(accessTokenPayload, this.config.jwt.accessTokenSecret);
    const refreshToken = jwt.sign(refreshTokenPayload, this.config.jwt.refreshTokenSecret);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.config.jwt.accessTokenExpiry)
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.password.saltRounds);
  }

  /**
   * Verify password
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    const { password: config } = this.config;
    const errors: string[] = [];

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw new AppError(
        `Password validation failed: ${errors.join(', ')}`,
        400,
        ErrorCodes.AUTH_WEAK_PASSWORD
      );
    }
  }

  /**
   * Check if account is locked
   */
  private async isAccountLocked(user: User): Promise<boolean> {
    if (!user.lockedUntil) {
      return false;
    }
    
    if (user.lockedUntil > new Date()) {
      return true;
    }
    
    // Unlock account if lock period has expired
    await this.userRepository.update(user.id, {
      loginAttempts: 0,
      lockedUntil: null
    });
    
    return false;
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const loginAttempts = (user.loginAttempts || 0) + 1;
    const updateData: Partial<User> = { loginAttempts };

    if (loginAttempts >= this.config.security.maxLoginAttempts) {
      updateData.lockedUntil = new Date(
        Date.now() + this.config.security.lockoutDuration * 60 * 1000
      );
    }

    await this.userRepository.update(user.id, updateData);
    await this.logFailedLogin(user.email, 'INVALID_PASSWORD', ipAddress, userAgent);
  }

  /**
   * Log failed login attempt
   */
  private async logFailedLogin(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.auditLogRepository.create({
      userId: null,
      action: 'LOGIN_FAILED',
      entityType: 'user',
      entityId: null,
      details: {
        email,
        reason
      },
      ipAddress,
      userAgent,
      severity: 'warning'
    });

    logger.warn('Failed login attempt', {
      email,
      reason,
      ipAddress
    });
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): User {
    const { password, passwordResetToken, passwordResetExpires, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  /**
   * Update authentication configuration
   */
  updateConfig(newConfig: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AuthConfig {
    return { ...this.config };
  }
}