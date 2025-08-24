/**
 * User Service
 * Handles user management operations, profile updates, and user-related business logic
 */

import { UserRepository } from '../repositories/user.repository';
import { TeamRepository } from '../repositories/team.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserRole,
  UserPermission,
  UserPreferences,
  DEFAULT_ROLE_PERMISSIONS
} from '../types/auth';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { AuthService } from './auth.service';

export interface UserSearchFilters {
  search?: string;
  role?: UserRole;
  teamId?: string;
  department?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
  byTeam: Record<string, number>;
  byDepartment: Record<string, number>;
  emailVerified: number;
  recentLogins: number; // last 30 days
  newUsers: number; // last 30 days
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'updateRole' | 'updateTeam';
  data?: {
    role?: UserRole;
    teamId?: string;
    permissions?: UserPermission[];
  };
}

export class UserService {
  private userRepository: UserRepository;
  private teamRepository: TeamRepository;
  private auditLogRepository: AuditLogRepository;
  private authService: AuthService;

  constructor(
    userRepository: UserRepository,
    teamRepository: TeamRepository,
    auditLogRepository: AuditLogRepository,
    authService: AuthService
  ) {
    this.userRepository = userRepository;
    this.teamRepository = teamRepository;
    this.auditLogRepository = auditLogRepository;
    this.authService = authService;
  }

  /**
   * Create a new user
   */
  async createUser(
    userData: CreateUserDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<User> {
    try {
      // Validate team exists if teamId provided
      if (userData.teamId) {
        const team = await this.teamRepository.findById(userData.teamId);
        if (!team || !team.isActive) {
          throw new AppError(
            'Invalid or inactive team',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Set default permissions based on role if not provided
      if (!userData.permissions) {
        userData.permissions = DEFAULT_ROLE_PERMISSIONS[userData.role] || [];
      }

      // Use auth service to register user
      const { user } = await this.authService.register(userData, createdBy, ipAddress);

      // Update team member count if user assigned to team
      if (userData.teamId) {
        await this.teamRepository.updateMemberCount(userData.teamId);
      }

      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdBy
      });

      return user;
    } catch (error) {
      logger.error('User creation failed', {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }
    return user;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateData: UpdateUserDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(userId);

      // Validate team exists if teamId being updated
      if (updateData.teamId && updateData.teamId !== existingUser.teamId) {
        const team = await this.teamRepository.findById(updateData.teamId);
        if (!team || !team.isActive) {
          throw new AppError(
            'Invalid or inactive team',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Update permissions based on role if role is being changed
      if (updateData.role && updateData.role !== existingUser.role) {
        if (!updateData.permissions) {
          updateData.permissions = DEFAULT_ROLE_PERMISSIONS[updateData.role] || [];
        }
      }

      // Perform update
      const updatedUser = await this.userRepository.update(userId, {
        ...updateData,
        updatedBy
      });

      // Update team member counts if team changed
      if (updateData.teamId && updateData.teamId !== existingUser.teamId) {
        // Decrease count for old team
        if (existingUser.teamId) {
          await this.teamRepository.updateMemberCount(existingUser.teamId);
        }
        // Increase count for new team
        await this.teamRepository.updateMemberCount(updateData.teamId);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'USER_UPDATED',
        entityType: 'user',
        entityId: userId,
        details: {
          updatedFields: Object.keys(updateData),
          previousValues: this.getChangedFields(existingUser, updateData),
          newValues: updateData
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('User updated successfully', {
        userId,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedUser;
    } catch (error) {
      logger.error('User update failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(
    userId: string,
    deletedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check if user exists
      const user = await this.getUserById(userId);

      // Prevent self-deletion
      if (userId === deletedBy) {
        throw new AppError(
          'Cannot delete your own account',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Soft delete user
      await this.userRepository.delete(userId);

      // Update team member count if user was in a team
      if (user.teamId) {
        await this.teamRepository.updateMemberCount(user.teamId);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: deletedBy,
        action: 'USER_DELETED',
        entityType: 'user',
        entityId: userId,
        details: {
          deletedUser: {
            email: user.email,
            role: user.role,
            teamId: user.teamId
          }
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      logger.info('User deleted successfully', {
        userId,
        email: user.email,
        deletedBy
      });
    } catch (error) {
      logger.error('User deletion failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(
    userId: string,
    activatedBy: string,
    ipAddress?: string
  ): Promise<User> {
    return this.updateUserStatus(userId, true, activatedBy, ipAddress);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(
    userId: string,
    deactivatedBy: string,
    ipAddress?: string
  ): Promise<User> {
    return this.updateUserStatus(userId, false, deactivatedBy, ipAddress);
  }

  /**
   * Update user status (active/inactive)
   */
  private async updateUserStatus(
    userId: string,
    isActive: boolean,
    updatedBy: string,
    ipAddress?: string
  ): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      
      if (user.isActive === isActive) {
        return user; // No change needed
      }

      const updatedUser = await this.userRepository.update(userId, {
        isActive,
        updatedBy
      });

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entityType: 'user',
        entityId: userId,
        details: {
          email: user.email,
          previousStatus: user.isActive,
          newStatus: isActive
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info(`User ${isActive ? 'activated' : 'deactivated'} successfully`, {
        userId,
        email: user.email,
        updatedBy
      });

      return updatedUser;
    } catch (error) {
      logger.error(`User ${isActive ? 'activation' : 'deactivation'} failed`, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      
      const updatedPreferences = {
        ...user.preferences,
        ...preferences
      };

      const updatedUser = await this.userRepository.update(userId, {
        preferences: updatedPreferences,
        updatedBy: userId
      });

      logger.debug('User preferences updated', {
        userId,
        updatedFields: Object.keys(preferences)
      });

      return updatedUser;
    } catch (error) {
      logger.error('User preferences update failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search users with filters and pagination
   */
  async searchUsers(
    filters: UserSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    try {
      const result = await this.userRepository.search(filters, pagination);
      
      logger.debug('User search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('User search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get users by team
   */
  async getUsersByTeam(
    teamId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    try {
      const result = await this.userRepository.findByTeam(teamId, pagination);
      
      logger.debug('Users by team retrieved', {
        teamId,
        userCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get users by team failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: UserRole,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    try {
      const result = await this.userRepository.findByRole(role, pagination);
      
      logger.debug('Users by role retrieved', {
        role,
        userCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get users by role failed', {
        role,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const stats = await this.userRepository.getStatistics();
      
      logger.debug('User statistics retrieved', {
        totalUsers: stats.total,
        activeUsers: stats.active
      });

      return stats;
    } catch (error) {
      logger.error('Get user statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Bulk user operations
   */
  async bulkUserOperation(
    operation: BulkUserOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { userId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { userId: string; error: string }[]
    };

    try {
      for (const userId of operation.userIds) {
        try {
          switch (operation.operation) {
            case 'activate':
              await this.activateUser(userId, performedBy, ipAddress);
              break;
            case 'deactivate':
              await this.deactivateUser(userId, performedBy, ipAddress);
              break;
            case 'delete':
              await this.deleteUser(userId, performedBy, ipAddress);
              break;
            case 'updateRole':
              if (operation.data?.role) {
                await this.updateUser(
                  userId,
                  { 
                    role: operation.data.role,
                    permissions: operation.data.permissions
                  },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'updateTeam':
              if (operation.data?.teamId) {
                await this.updateUser(
                  userId,
                  { teamId: operation.data.teamId },
                  performedBy,
                  ipAddress
                );
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(userId);
        } catch (error) {
          results.failed.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_USER_OPERATION',
        entityType: 'user',
        entityId: null,
        details: {
          operation: operation.operation,
          totalUsers: operation.userIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk user operation completed', {
        operation: operation.operation,
        totalUsers: operation.userIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk user operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(
    userId: string,
    verificationToken: string
  ): Promise<User> {
    try {
      // TODO: Implement email verification logic
      // This would typically involve checking the verification token
      // and updating the user's emailVerified status
      
      const updatedUser = await this.userRepository.update(userId, {
        emailVerified: true,
        updatedBy: 'system'
      });

      // Log email verification
      await this.auditLogRepository.create({
        userId,
        action: 'EMAIL_VERIFIED',
        entityType: 'user',
        entityId: userId,
        details: {
          email: updatedUser.email,
          verificationMethod: 'token'
        },
        ipAddress: '',
        userAgent: '',
        severity: 'info'
      });

      logger.info('User email verified', {
        userId,
        email: updatedUser.email
      });

      return updatedUser;
    } catch (error) {
      logger.error('Email verification failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get changed fields for audit logging
   */
  private getChangedFields(original: User, updates: UpdateUserDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateUserDTO;
      if (original[typedKey as keyof User] !== updates[typedKey]) {
        changed[key] = original[typedKey as keyof User];
      }
    });
    
    return changed;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: UserPermission): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissions: UserPermission[]): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return permissions.some(permission => user.permissions.includes(permission));
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(userId: string, permissions: UserPermission[]): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return permissions.every(permission => user.permissions.includes(permission));
    } catch (error) {
      return false;
    }
  }
}