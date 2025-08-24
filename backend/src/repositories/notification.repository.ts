/**
 * Notification Repository
 * Data access layer for Notification entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Notification, QueryOptions } from '../types/entities';
import { CreateNotificationDTO, UpdateNotificationDTO } from '../types/dtos';
import { NotFoundError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationDTO): Promise<Notification> {
    try {
      const notificationToCreate: Partial<Notification> = {
        ...notificationData,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const notification = await this.create(notificationToCreate);
      
      logger.audit('Notification created', {
        notificationId: notification.id,
        type: notification.type,
        userId: notification.userId,
        priority: notification.priority
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', {
        error: error.message,
        notificationData
      });
      throw error;
    }
  }

  /**
   * Find notifications by user
   */
  async findByUser(userId: string, options?: QueryOptions): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE userId = $userId
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { userId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find notifications by user', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to find notifications by user');
    }
  }

  /**
   * Find unread notifications by user
   */
  async findUnreadByUser(userId: string, options?: QueryOptions): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE userId = $userId AND isRead = false
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { userId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find unread notifications by user', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to find unread notifications by user');
    }
  }

  /**
   * Find notifications by type
   */
  async findByType(type: string, options?: QueryOptions): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE type = $type
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { type };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find notifications by type', {
        error: error.message,
        type
      });
      throw new DatabaseError('Failed to find notifications by type');
    }
  }

  /**
   * Find notifications by priority
   */
  async findByPriority(priority: string, options?: QueryOptions): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE priority = $priority
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { priority };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find notifications by priority', {
        error: error.message,
        priority
      });
      throw new DatabaseError('Failed to find notifications by priority');
    }
  }

  /**
   * Find notifications by related entity
   */
  async findByRelatedEntity(entityType: string, entityId: string): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE relatedEntityType = $entityType AND relatedEntityId = $entityId
        ORDER BY createdAt DESC
      `;

      const result = await this.db.query(query, { entityType, entityId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find notifications by related entity', {
        error: error.message,
        entityType,
        entityId
      });
      throw new DatabaseError('Failed to find notifications by related entity');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await this.update(notificationId, {
        isRead: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      logger.audit('Notification marked as read', {
        notificationId,
        userId: notification.userId
      });

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notificationId
      });
      throw error;
    }
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string): Promise<Notification> {
    try {
      const notification = await this.update(notificationId, {
        isRead: false,
        readAt: null,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Notification marked as unread', {
        notificationId,
        userId: notification.userId
      });

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as unread', {
        error: error.message,
        notificationId
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsReadForUser(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE notifications SET 
        isRead = true,
        readAt = $readAt,
        updatedAt = $updatedAt
        WHERE userId = $userId AND isRead = false
      `;

      const params = {
        userId,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.db.query(query, params);

      logger.audit('All notifications marked as read for user', {
        userId
      });
    } catch (error) {
      logger.error('Failed to mark all notifications as read for user', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to mark all notifications as read for user');
    }
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCountForUser(userId: string): Promise<number> {
    try {
      const query = `
        SELECT count() as unreadCount FROM notifications 
        WHERE userId = $userId AND isRead = false
      `;

      const result = await this.db.query(query, { userId });
      return result[0]?.unreadCount || 0;
    } catch (error) {
      logger.error('Failed to get unread notification count', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to get unread notification count');
    }
  }

  /**
   * Search notifications with advanced filters
   */
  async searchNotifications(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ notifications: Notification[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (title CONTAINS $search OR message CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.userId) {
        whereClause += ` AND userId = $userId`;
        params.userId = filters.userId;
      }

      if (filters.type) {
        whereClause += ` AND type = $type`;
        params.type = filters.type;
      }

      if (filters.priority) {
        whereClause += ` AND priority = $priority`;
        params.priority = filters.priority;
      }

      if (filters.isRead !== undefined) {
        whereClause += ` AND isRead = $isRead`;
        params.isRead = filters.isRead;
      }

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.relatedEntityType) {
        whereClause += ` AND relatedEntityType = $relatedEntityType`;
        params.relatedEntityType = filters.relatedEntityType;
      }

      if (filters.relatedEntityId) {
        whereClause += ` AND relatedEntityId = $relatedEntityId`;
        params.relatedEntityId = filters.relatedEntityId;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM notifications ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM notifications ${whereClause}`;
      
      // Add sorting
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'DESC';
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
      const notifications = dataResult[0] || [];

      return { notifications, total };
    } catch (error) {
      logger.error('Failed to search notifications', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search notifications');
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(filters: any = {}): Promise<any> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      if (filters.userId) {
        whereClause += ` AND userId = $userId`;
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      const query = `
        SELECT 
          count() as totalNotifications,
          count(CASE WHEN isRead = true THEN 1 END) as readNotifications,
          count(CASE WHEN isRead = false THEN 1 END) as unreadNotifications,
          count(CASE WHEN priority = 'high' THEN 1 END) as highPriorityNotifications,
          count(CASE WHEN priority = 'medium' THEN 1 END) as mediumPriorityNotifications,
          count(CASE WHEN priority = 'low' THEN 1 END) as lowPriorityNotifications,
          count(CASE WHEN type = 'inspection_due' THEN 1 END) as inspectionDueNotifications,
          count(CASE WHEN type = 'inspection_completed' THEN 1 END) as inspectionCompletedNotifications,
          count(CASE WHEN type = 'report_generated' THEN 1 END) as reportGeneratedNotifications,
          count(CASE WHEN type = 'system_alert' THEN 1 END) as systemAlertNotifications
        FROM notifications ${whereClause}
      `;

      const result = await this.db.query(query, params);
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get notification statistics', {
        error: error.message,
        filters
      });
      throw new DatabaseError('Failed to get notification statistics');
    }
  }

  /**
   * Get notification trends
   */
  async getNotificationTrends(days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          time::format(createdAt, '%Y-%m-%d') as date,
          count() as totalNotifications,
          count(CASE WHEN isRead = true THEN 1 END) as readNotifications,
          count(CASE WHEN isRead = false THEN 1 END) as unreadNotifications,
          count(CASE WHEN priority = 'high' THEN 1 END) as highPriorityNotifications
        FROM notifications 
        WHERE createdAt >= time::now() - duration::from::days($days)
        GROUP BY time::format(createdAt, '%Y-%m-%d')
        ORDER BY date DESC
      `;

      const result = await this.db.query(query, { days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get notification trends', {
        error: error.message,
        days
      });
      throw new DatabaseError('Failed to get notification trends');
    }
  }

  /**
   * Get notification types
   */
  async getNotificationTypes(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT type FROM notifications 
        WHERE type IS NOT NONE
        ORDER BY type
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.type);
    } catch (error) {
      logger.error('Failed to get notification types', {
        error: error.message
      });
      throw new DatabaseError('Failed to get notification types');
    }
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(olderThanDays: number = 90): Promise<number> {
    try {
      const query = `
        DELETE FROM notifications 
        WHERE createdAt < time::now() - duration::from::days($olderThanDays)
      `;

      const result = await this.db.query(query, { olderThanDays });
      const deletedCount = result[0]?.length || 0;

      logger.audit('Old notifications deleted', {
        deletedCount,
        olderThanDays
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete old notifications', {
        error: error.message,
        olderThanDays
      });
      throw new DatabaseError('Failed to delete old notifications');
    }
  }

  /**
   * Bulk create notifications
   */
  async bulkCreateNotifications(notificationsData: CreateNotificationDTO[]): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];
      const timestamp = new Date().toISOString();

      for (const notificationData of notificationsData) {
        const notificationToCreate: Partial<Notification> = {
          ...notificationData,
          isRead: false,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        const notification = await this.create(notificationToCreate);
        notifications.push(notification);
      }

      logger.audit('Bulk notifications created', {
        count: notifications.length,
        types: [...new Set(notifications.map(n => n.type))]
      });

      return notifications;
    } catch (error) {
      logger.error('Failed to bulk create notifications', {
        error: error.message,
        count: notificationsData.length
      });
      throw new DatabaseError('Failed to bulk create notifications');
    }
  }

  /**
   * Bulk mark notifications as read
   */
  async bulkMarkAsRead(notificationIds: string[]): Promise<void> {
    try {
      const query = `
        UPDATE notifications SET 
        isRead = true,
        readAt = $readAt,
        updatedAt = $updatedAt
        WHERE id IN $notificationIds
      `;

      const params = {
        notificationIds,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.db.query(query, params);

      logger.audit('Bulk notifications marked as read', {
        notificationIds
      });
    } catch (error) {
      logger.error('Failed to bulk mark notifications as read', {
        error: error.message,
        notificationIds
      });
      throw new DatabaseError('Failed to bulk mark notifications as read');
    }
  }

  /**
   * Bulk delete notifications
   */
  async bulkDeleteNotifications(notificationIds: string[]): Promise<void> {
    try {
      const query = `
        DELETE FROM notifications 
        WHERE id IN $notificationIds
      `;

      await this.db.query(query, { notificationIds });

      logger.audit('Bulk notifications deleted', {
        notificationIds
      });
    } catch (error) {
      logger.error('Failed to bulk delete notifications', {
        error: error.message,
        notificationIds
      });
      throw new DatabaseError('Failed to bulk delete notifications');
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          type,
          count() as totalReceived,
          count(CASE WHEN isRead = true THEN 1 END) as totalRead,
          avg(CASE WHEN readAt IS NOT NONE THEN time::unix(readAt) - time::unix(createdAt) END) as avgReadTime
        FROM notifications 
        WHERE userId = $userId
        GROUP BY type
        ORDER BY totalReceived DESC
      `;

      const result = await this.db.query(query, { userId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get user notification preferences', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to get user notification preferences');
    }
  }

  /**
   * Get notifications requiring action
   */
  async getNotificationsRequiringAction(userId?: string): Promise<Notification[]> {
    try {
      let whereClause = 'WHERE actionRequired = true AND isRead = false';
      const params: any = {};

      if (userId) {
        whereClause += ' AND userId = $userId';
        params.userId = userId;
      }

      const query = `
        SELECT * FROM notifications 
        ${whereClause}
        ORDER BY priority DESC, createdAt ASC
      `;

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get notifications requiring action', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to get notifications requiring action');
    }
  }

  /**
   * Update notification action status
   */
  async updateActionStatus(notificationId: string, actionTaken: boolean, actionDetails?: string): Promise<Notification> {
    try {
      const updateData: any = {
        actionTaken,
        updatedAt: new Date().toISOString()
      };

      if (actionDetails) {
        updateData.actionDetails = actionDetails;
      }

      if (actionTaken) {
        updateData.actionTakenAt = new Date().toISOString();
      }

      const notification = await this.update(notificationId, updateData);

      logger.audit('Notification action status updated', {
        notificationId,
        actionTaken,
        actionDetails
      });

      return notification;
    } catch (error) {
      logger.error('Failed to update notification action status', {
        error: error.message,
        notificationId,
        actionTaken
      });
      throw error;
    }
  }
}