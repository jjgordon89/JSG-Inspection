/**
 * User Controller
 * Handles HTTP requests for user management operations
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserFilters,
  UserRole,
  UserPermission,
  ChangePasswordRequest,
  UpdatePreferencesRequest
} from '../types/auth';
import { PaginationQuery, SortQuery } from '../types/common';

export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  /**
   * Get current user profile
   * GET /api/users/me
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
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update current user profile
   * PUT /api/users/me
   */
  updateCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const updateData: UpdateUserDTO = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.role;
      delete updateData.status;
      delete updateData.emailVerified;

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change current user password
   * POST /api/users/me/change-password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const passwordData: ChangePasswordRequest = req.body;
      
      await this.authService.changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        keepCurrentSession: passwordData.keepCurrentSession,
        currentSessionId: req.sessionId
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user preferences
   * PUT /api/users/me/preferences
   */
  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const preferences: UpdatePreferencesRequest = req.body;
      const updatedUser = await this.userService.updateUserPreferences(userId, preferences);

      res.json({
        success: true,
        data: updatedUser.preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user sessions
   * GET /api/users/me/sessions
   */
  getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const sessions = this.authService.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Revoke user session
   * DELETE /api/users/me/sessions/:sessionId
   */
  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;
      
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
   * Get all users (Admin only)
   * GET /api/users
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: UserFilters = {
        search: req.query.search as string,
        role: req.query.role as UserRole,
        status: req.query.status as string,
        teamId: req.query.teamId as string,
        emailVerified: req.query.emailVerified === 'true' ? true : 
                      req.query.emailVerified === 'false' ? false : undefined,
        twoFactorEnabled: req.query.twoFactorEnabled === 'true' ? true :
                         req.query.twoFactorEnabled === 'false' ? false : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        lastLoginAfter: req.query.lastLoginAfter ? new Date(req.query.lastLoginAfter as string) : undefined,
        lastLoginBefore: req.query.lastLoginBefore ? new Date(req.query.lastLoginBefore as string) : undefined
      };

      const result = await this.userService.getUsers(filters, pagination, sort);

      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID (Admin/Manager only)
   * GET /api/users/:id
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new user (Admin only)
   * POST /api/users
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDTO = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userService.createUser(userData, createdBy);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user (Admin/Manager only)
   * PUT /api/users/:id
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user is trying to update themselves
      if (id === updatedBy) {
        // Remove sensitive fields for self-update
        delete updateData.role;
        delete updateData.status;
        delete updateData.emailVerified;
      }

      const updatedUser = await this.userService.updateUser(id, updateData, updatedBy);

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user (Admin only)
   * DELETE /api/users/:id
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      // Prevent self-deletion
      if (id === deletedBy) {
        throw new AppError('Cannot delete your own account', 400);
      }

      await this.userService.deleteUser(id, deletedBy);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Activate user (Admin only)
   * POST /api/users/:id/activate
   */
  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const activatedBy = req.user?.id;

      if (!activatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userService.activateUser(id, activatedBy);

      res.json({
        success: true,
        data: user,
        message: 'User activated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate user (Admin only)
   * POST /api/users/:id/deactivate
   */
  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deactivatedBy = req.user?.id;

      if (!deactivatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      // Prevent self-deactivation
      if (id === deactivatedBy) {
        throw new AppError('Cannot deactivate your own account', 400);
      }

      const user = await this.userService.deactivateUser(id, deactivatedBy);

      res.json({
        success: true,
        data: user,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset user password (Admin only)
   * POST /api/users/:id/reset-password
   */
  resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { temporaryPassword } = req.body;
      const resetBy = req.user?.id;

      if (!resetBy) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await this.userService.resetUserPassword(id, temporaryPassword, resetBy);

      res.json({
        success: true,
        data: result,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics (Admin/Manager only)
   * GET /api/users/stats
   */
  getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.userService.getUserStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk update users (Admin only)
   * POST /api/users/bulk-update
   */
  bulkUpdateUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userIds, updateData } = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new AppError('User IDs array is required', 400);
      }

      // Prevent updating own account in bulk operations
      if (userIds.includes(updatedBy)) {
        throw new AppError('Cannot include your own account in bulk operations', 400);
      }

      const result = await this.userService.bulkUpdateUsers(userIds, updateData, updatedBy);

      res.json({
        success: true,
        data: result,
        message: `${result.updated} users updated successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export users (Admin only)
   * GET /api/users/export
   */
  exportUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format as string || 'csv';
      const filters: UserFilters = {
        search: req.query.search as string,
        role: req.query.role as UserRole,
        status: req.query.status as string,
        teamId: req.query.teamId as string
      };

      const exportData = await this.userService.exportUsers(filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=users.json');
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Force logout user (Admin only)
   * POST /api/users/:id/force-logout
   */
  forceLogoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actionBy = req.user?.id;

      if (!actionBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.authService.forceLogoutUser(id);

      res.json({
        success: true,
        message: 'User logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user activity log (Admin/Manager only)
   * GET /api/users/:id/activity
   */
  getUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const activity = await this.userService.getUserActivity(id, pagination);

      res.json({
        success: true,
        data: activity.activities,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: activity.total,
          pages: Math.ceil(activity.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const userValidationSchemas = {
  createUser: {
    email: { required: true, type: 'email' },
    firstName: { required: true, type: 'string', minLength: 1 },
    lastName: { required: true, type: 'string', minLength: 1 },
    username: { required: false, type: 'string', minLength: 3 },
    password: { required: true, type: 'string', minLength: 8 },
    role: { required: false, type: 'string', enum: Object.values(UserRole) },
    teamId: { required: false, type: 'string' }
  },
  updateUser: {
    email: { required: false, type: 'email' },
    firstName: { required: false, type: 'string', minLength: 1 },
    lastName: { required: false, type: 'string', minLength: 1 },
    username: { required: false, type: 'string', minLength: 3 },
    role: { required: false, type: 'string', enum: Object.values(UserRole) },
    teamId: { required: false, type: 'string' },
    phone: { required: false, type: 'string' },
    avatar: { required: false, type: 'string' }
  },
  changePassword: {
    currentPassword: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string', minLength: 8 },
    keepCurrentSession: { required: false, type: 'boolean' }
  },
  updatePreferences: {
    language: { required: false, type: 'string' },
    timezone: { required: false, type: 'string' },
    theme: { required: false, type: 'string', enum: ['light', 'dark', 'auto'] },
    notifications: { required: false, type: 'object' }
  },
  resetPassword: {
    temporaryPassword: { required: false, type: 'string', minLength: 8 }
  },
  bulkUpdate: {
    userIds: { required: true, type: 'array', minItems: 1 },
    updateData: { required: true, type: 'object' }
  }
};