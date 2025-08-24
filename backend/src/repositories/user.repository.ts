/**
 * User Repository
 * Data access layer for User entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { User, QueryOptions } from '../types/entities';
import { CreateUserDTO, UpdateUserDTO } from '../types/dtos';
import { NotFoundError, ConflictError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Create a new user with encrypted password
   */
  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already exists', 'DUPLICATE_EMAIL', {
          email: userData.email
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user data
      const userToCreate: Partial<User> = {
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const user = await this.create(userToCreate);
      
      logger.audit('User created', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return user;
    } catch (error) {
      logger.error('Failed to create user', {
        error: error.message,
        email: userData.email
      });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.findByField('email', email);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      logger.error('Failed to find user by email', {
        error: error.message,
        email
      });
      throw new DatabaseError('Failed to find user by email');
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      if (!user.isActive) {
        throw new ConflictError('Account is deactivated', 'ACCOUNT_DEACTIVATED');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await this.updateLastLogin(user.id!);

      return user;
    } catch (error) {
      logger.error('Failed to authenticate user', {
        error: error.message,
        email
      });
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found', 'users', userId);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new ConflictError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.update(userId, {
        password: hashedNewPassword,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Password updated', { userId });
    } catch (error) {
      logger.error('Failed to update password', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found', 'users', email);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.update(user.id!, {
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Password reset', { userId: user.id, email });
    } catch (error) {
      logger.error('Failed to reset password', {
        error: error.message,
        email
      });
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to update last login', {
        error: error.message,
        userId
      });
      // Don't throw error for last login update failure
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    try {
      return await this.findByField('role', role);
    } catch (error) {
      logger.error('Failed to find users by role', {
        error: error.message,
        role
      });
      throw new DatabaseError('Failed to find users by role');
    }
  }

  /**
   * Find users by team
   */
  async findByTeam(teamId: string): Promise<User[]> {
    try {
      return await this.findByField('teamId', teamId);
    } catch (error) {
      logger.error('Failed to find users by team', {
        error: error.message,
        teamId
      });
      throw new DatabaseError('Failed to find users by team');
    }
  }

  /**
   * Find active users
   */
  async findActiveUsers(options?: QueryOptions): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE isActive = true
        ${options?.search ? `AND (firstName CONTAINS $search OR lastName CONTAINS $search OR email CONTAINS $search)` : ''}
        ORDER BY ${options?.sortBy || 'firstName'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = {};
      if (options?.search) params.search = options.search;
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find active users', {
        error: error.message,
        options
      });
      throw new DatabaseError('Failed to find active users');
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      logger.audit('User deactivated', { userId });
    } catch (error) {
      logger.error('Failed to deactivate user', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        isActive: true,
        updatedAt: new Date().toISOString()
      });

      logger.audit('User activated', { userId });
    } catch (error) {
      logger.error('Failed to activate user', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found', 'users', userId);
      }

      const updatedUser = await this.update(userId, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });

      logger.audit('User profile updated', {
        userId,
        updatedFields: Object.keys(profileData)
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<void> {
    try {
      await this.update(userId, {
        preferences,
        updatedAt: new Date().toISOString()
      });

      logger.audit('User preferences updated', { userId });
    } catch (error) {
      logger.error('Failed to update user preferences', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          (SELECT count() FROM inspections WHERE inspector = $userId) as totalInspections,
          (SELECT count() FROM inspections WHERE inspector = $userId AND status = 'completed') as completedInspections,
          (SELECT count() FROM inspections WHERE inspector = $userId AND status = 'pending') as pendingInspections,
          (SELECT avg(score.percentage) FROM inspections WHERE inspector = $userId AND score IS NOT NONE) as avgScore,
          (SELECT count() FROM inspections WHERE inspector = $userId AND createdAt >= time::now() - 30d) as inspectionsLast30Days
      `;

      const result = await this.db.query(query, { userId });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get user statistics', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to get user statistics');
    }
  }

  /**
   * Search users with advanced filters
   */
  async searchUsers(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ users: User[], total: number }> {
    try {
      let whereClause = 'WHERE isActive = true';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (firstName CONTAINS $search OR lastName CONTAINS $search OR email CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.role) {
        whereClause += ` AND role = $role`;
        params.role = filters.role;
      }

      if (filters.department) {
        whereClause += ` AND department = $department`;
        params.department = filters.department;
      }

      if (filters.teamId) {
        whereClause += ` AND teamId = $teamId`;
        params.teamId = filters.teamId;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM users ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM users ${whereClause}`;
      
      // Add sorting
      const sortBy = options.sortBy || 'firstName';
      const sortOrder = options.sortOrder || 'ASC';
      dataQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (options.pageSize) {
        dataQuery += ` LIMIT $limit`;
        params.limit = options.pageSize;

        if (options.page) {
          dataQuery += ` START $start`;
          params.start = (options.page - 1) * options.pageSize;
        }
      }

      const dataResult = await this.db.query(dataQuery, params);
      const users = dataResult[0] || [];

      return { users, total };
    } catch (error) {
      logger.error('Failed to search users', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search users');
    }
  }

  /**
   * Get users with permissions
   */
  async findUsersWithPermission(permission: string): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE isActive = true 
        AND (permissions CONTAINS $permission OR role IN ['admin', 'manager'])
      `;

      const result = await this.db.query(query, { permission });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find users with permission', {
        error: error.message,
        permission
      });
      throw new DatabaseError('Failed to find users with permission');
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updateData: Partial<User>): Promise<void> {
    try {
      const query = `
        UPDATE users SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $userIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        userIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk user update', {
        userIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update users', {
        error: error.message,
        userIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update users');
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId: string, days: number = 30): Promise<any> {
    try {
      const query = `
        SELECT 
          date_trunc('day', createdAt) as date,
          count() as inspections
        FROM inspections 
        WHERE inspector = $userId 
        AND createdAt >= time::now() - ${days}d
        GROUP BY date
        ORDER BY date DESC
      `;

      const result = await this.db.query(query, { userId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get user activity', {
        error: error.message,
        userId,
        days
      });
      throw new DatabaseError('Failed to get user activity');
    }
  }
}