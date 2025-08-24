/**
 * Notification Controller
 * Handles HTTP requests for notification management
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationPreferences,
  BulkNotificationRequest,
  NotificationTemplate,
  NotificationSchedule
} from '../types/notification';
import { PaginationQuery, SortQuery } from '../types/common';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * Get notifications for current user
   * GET /api/notifications
   */
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters = {
        type: req.query.type as NotificationType,
        status: req.query.status as NotificationStatus,
        priority: req.query.priority as NotificationPriority,
        channel: req.query.channel as NotificationChannel,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        unreadOnly: req.query.unreadOnly === 'true'
      };

      const result = await this.notificationService.getNotifications(
        userId,
        filters,
        pagination,
        sort
      );

      res.json({
        success: true,
        data: result.notifications,
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
   * Get notification by ID
   * GET /api/notifications/:id
   */
  getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const notification = await this.notificationService.getNotificationById(id, userId);

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const notification = await this.notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as unread
   * PUT /api/notifications/:id/unread
   */
  markAsUnread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const notification = await this.notificationService.markAsUnread(id, userId);

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as unread'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { type, olderThan } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await this.notificationService.markAllAsRead(userId, {
        type,
        olderThan: olderThan ? new Date(olderThan) : undefined
      });

      res.json({
        success: true,
        data: { updatedCount: result },
        message: `${result} notifications marked as read`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete multiple notifications
   * DELETE /api/notifications/bulk
   */
  deleteNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { notificationIds, filters } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!notificationIds && !filters) {
        throw new AppError('Either notification IDs or filters must be provided', 400);
      }

      const deletedCount = await this.notificationService.deleteNotifications(
        userId,
        notificationIds,
        filters
      );

      res.json({
        success: true,
        data: { deletedCount },
        message: `${deletedCount} notifications deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const preferences = await this.notificationService.getPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const preferences: NotificationPreferences = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const updatedPreferences = await this.notificationService.updatePreferences(
        userId,
        preferences
      );

      res.json({
        success: true,
        data: updatedPreferences,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unread count
   * GET /api/notifications/unread-count
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const counts = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: counts
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Send notification (Admin only)
   * POST /api/notifications/send
   */
  sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        recipientIds,
        type,
        title,
        message,
        data,
        priority,
        channels,
        scheduledFor,
        expiresAt
      } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user has permission to send notifications
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('send_notifications')) {
        throw new AppError('Insufficient permissions to send notifications', 403);
      }

      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new AppError('Recipient IDs are required', 400);
      }

      if (!type || !title || !message) {
        throw new AppError('Type, title, and message are required', 400);
      }

      const notification = await this.notificationService.sendNotification({
        recipientIds,
        type,
        title,
        message,
        data,
        priority: priority || 'normal',
        channels: channels || ['in_app'],
        senderId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Send bulk notifications (Admin only)
   * POST /api/notifications/send-bulk
   */
  sendBulkNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bulkRequest: BulkNotificationRequest = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user has permission to send notifications
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('send_notifications')) {
        throw new AppError('Insufficient permissions to send notifications', 403);
      }

      if (!bulkRequest.notifications || !Array.isArray(bulkRequest.notifications)) {
        throw new AppError('Notifications array is required', 400);
      }

      const result = await this.notificationService.sendBulkNotifications({
        ...bulkRequest,
        senderId
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Bulk notifications sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification templates (Admin only)
   * GET /api/notifications/templates
   */
  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('manage_templates')) {
        throw new AppError('Insufficient permissions to access templates', 403);
      }

      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const filters = {
        type: req.query.type as NotificationType,
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
        search: req.query.search as string
      };

      const result = await this.notificationService.getTemplates(filters, pagination);

      res.json({
        success: true,
        data: result.templates,
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
   * Create notification template (Admin only)
   * POST /api/notifications/templates
   */
  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('manage_templates')) {
        throw new AppError('Insufficient permissions to create templates', 403);
      }

      const template: NotificationTemplate = req.body;
      const createdBy = req.user?.id;

      if (!template.name || !template.type || !template.title || !template.message) {
        throw new AppError('Name, type, title, and message are required', 400);
      }

      const createdTemplate = await this.notificationService.createTemplate({
        ...template,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: createdTemplate,
        message: 'Notification template created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update notification template (Admin only)
   * PUT /api/notifications/templates/:id
   */
  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('manage_templates')) {
        throw new AppError('Insufficient permissions to update templates', 403);
      }

      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.id;

      const updatedTemplate = await this.notificationService.updateTemplate(id, {
        ...updates,
        updatedBy
      });

      res.json({
        success: true,
        data: updatedTemplate,
        message: 'Notification template updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete notification template (Admin only)
   * DELETE /api/notifications/templates/:id
   */
  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('manage_templates')) {
        throw new AppError('Insufficient permissions to delete templates', 403);
      }

      const { id } = req.params;

      await this.notificationService.deleteTemplate(id);

      res.json({
        success: true,
        message: 'Notification template deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification statistics (Admin only)
   * GET /api/notifications/stats
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.permissions?.includes('view_stats')) {
        throw new AppError('Insufficient permissions to view statistics', 403);
      }

      const timeRange = req.query.timeRange as string || '7d';
      const groupBy = req.query.groupBy as string || 'day';
      const filters = {
        type: req.query.type as NotificationType,
        channel: req.query.channel as NotificationChannel,
        priority: req.query.priority as NotificationPriority
      };

      const stats = await this.notificationService.getStatistics(timeRange, groupBy, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Test notification delivery
   * POST /api/notifications/test
   */
  testNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { channel, recipientId, templateId, testData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!channel) {
        throw new AppError('Channel is required for testing', 400);
      }

      const result = await this.notificationService.testNotification({
        channel,
        recipientId: recipientId || userId,
        templateId,
        testData,
        senderId: userId
      });

      res.json({
        success: true,
        data: result,
        message: 'Test notification sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Subscribe to push notifications
   * POST /api/notifications/subscribe
   */
  subscribeToPush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subscription, deviceInfo } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!subscription) {
        throw new AppError('Push subscription is required', 400);
      }

      const result = await this.notificationService.subscribeToPush(
        userId,
        subscription,
        deviceInfo
      );

      res.json({
        success: true,
        data: result,
        message: 'Successfully subscribed to push notifications'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unsubscribe from push notifications
   * DELETE /api/notifications/subscribe
   */
  unsubscribeFromPush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { endpoint } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!endpoint) {
        throw new AppError('Subscription endpoint is required', 400);
      }

      await this.notificationService.unsubscribeFromPush(userId, endpoint);

      res.json({
        success: true,
        message: 'Successfully unsubscribed from push notifications'
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const notificationValidationSchemas = {
  markAllAsRead: {
    type: { required: false, type: 'string' },
    olderThan: { required: false, type: 'string' }
  },
  deleteNotifications: {
    notificationIds: { required: false, type: 'array' },
    filters: { required: false, type: 'object' }
  },
  updatePreferences: {
    emailEnabled: { required: false, type: 'boolean' },
    pushEnabled: { required: false, type: 'boolean' },
    smsEnabled: { required: false, type: 'boolean' },
    inAppEnabled: { required: false, type: 'boolean' },
    types: { required: false, type: 'object' },
    quietHours: { required: false, type: 'object' },
    frequency: { required: false, type: 'string' }
  },
  sendNotification: {
    recipientIds: { required: true, type: 'array', minItems: 1 },
    type: { required: true, type: 'string' },
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    message: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
    data: { required: false, type: 'object' },
    priority: { required: false, type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
    channels: { required: false, type: 'array' },
    scheduledFor: { required: false, type: 'string' },
    expiresAt: { required: false, type: 'string' }
  },
  sendBulkNotifications: {
    notifications: { required: true, type: 'array', minItems: 1 },
    batchSize: { required: false, type: 'number', min: 1, max: 1000 },
    delayBetweenBatches: { required: false, type: 'number', min: 0 }
  },
  createTemplate: {
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    type: { required: true, type: 'string' },
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    message: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
    variables: { required: false, type: 'array' },
    defaultData: { required: false, type: 'object' },
    channels: { required: false, type: 'array' },
    active: { required: false, type: 'boolean' }
  },
  updateTemplate: {
    name: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    title: { required: false, type: 'string', minLength: 1, maxLength: 200 },
    message: { required: false, type: 'string', minLength: 1, maxLength: 1000 },
    variables: { required: false, type: 'array' },
    defaultData: { required: false, type: 'object' },
    channels: { required: false, type: 'array' },
    active: { required: false, type: 'boolean' }
  },
  testNotification: {
    channel: { required: true, type: 'string', enum: ['email', 'push', 'sms', 'in_app'] },
    recipientId: { required: false, type: 'string' },
    templateId: { required: false, type: 'string' },
    testData: { required: false, type: 'object' }
  },
  subscribeToPush: {
    subscription: { required: true, type: 'object' },
    deviceInfo: { required: false, type: 'object' }
  },
  unsubscribeFromPush: {
    endpoint: { required: true, type: 'string' }
  }
};