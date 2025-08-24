/**
 * Notification Service
 * Handles real-time alerts, updates, and communication for the inspection system
 */

import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { TeamRepository } from '../repositories/team.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  Notification,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationTemplate,
  NotificationPreferences,
  NotificationStatistics,
  BulkNotificationRequest,
  NotificationDeliveryStatus
} from '../types/notification';
import { User, Inspection, Asset, FormTemplate, Folder } from '../types';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { PushNotificationService } from './push-notification.service';
import { WebSocketService } from './websocket.service';

export interface NotificationSearchFilters {
  search?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  recipientId?: string;
  senderId?: string;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  tags?: string[];
}

export interface NotificationBatch {
  notifications: CreateNotificationDTO[];
  scheduledAt?: Date;
  priority?: NotificationPriority;
  batchId?: string;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  channelBreakdown: Record<NotificationChannel, number>;
  typeBreakdown: Record<NotificationType, number>;
  priorityBreakdown: Record<NotificationPriority, number>;
}

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;
  private teamRepository: TeamRepository;
  private auditLogRepository: AuditLogRepository;
  private emailService: EmailService;
  private smsService: SMSService;
  private pushNotificationService: PushNotificationService;
  private webSocketService: WebSocketService;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(
    notificationRepository: NotificationRepository,
    userRepository: UserRepository,
    teamRepository: TeamRepository,
    auditLogRepository: AuditLogRepository,
    emailService: EmailService,
    smsService: SMSService,
    pushNotificationService: PushNotificationService,
    webSocketService: WebSocketService
  ) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
    this.teamRepository = teamRepository;
    this.auditLogRepository = auditLogRepository;
    this.emailService = emailService;
    this.smsService = smsService;
    this.pushNotificationService = pushNotificationService;
    this.webSocketService = webSocketService;
    
    this.initializeTemplates();
  }

  /**
   * Send notification to user(s)
   */
  async sendNotification(
    notificationData: CreateNotificationDTO,
    senderId?: string,
    ipAddress?: string
  ): Promise<Notification> {
    try {
      // Validate recipient
      const recipient = await this.userRepository.findById(notificationData.recipientId);
      if (!recipient) {
        throw new AppError(
          'Recipient not found',
          404,
          ErrorCodes.USER_NOT_FOUND
        );
      }

      // Get recipient preferences
      const preferences = await this.getUserNotificationPreferences(notificationData.recipientId);
      
      // Check if user wants to receive this type of notification
      if (!this.shouldSendNotification(notificationData.type, preferences)) {
        logger.info('Notification skipped due to user preferences', {
          recipientId: notificationData.recipientId,
          type: notificationData.type
        });
        return this.createSkippedNotification(notificationData, 'User preferences');
      }

      // Create notification record
      const notification = await this.notificationRepository.create({
        ...notificationData,
        senderId,
        status: NotificationStatus.PENDING
      });

      // Determine delivery channels based on preferences and priority
      const channels = this.determineDeliveryChannels(
        notificationData.priority || NotificationPriority.MEDIUM,
        preferences
      );

      // Send through each channel
      const deliveryResults = await this.deliverNotification(notification, channels, recipient);
      
      // Update notification with delivery status
      const updatedNotification = await this.notificationRepository.updateDeliveryStatus(
        notification.id,
        deliveryResults
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: senderId || 'system',
        action: 'NOTIFICATION_SENT',
        entityType: 'notification',
        entityId: notification.id,
        details: {
          type: notification.type,
          priority: notification.priority,
          recipientId: notification.recipientId,
          channels: channels,
          deliveryResults,
          entityType: notification.entityType,
          entityId: notification.entityId
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Notification sent successfully', {
        notificationId: notification.id,
        type: notification.type,
        recipientId: notification.recipientId,
        channels,
        senderId
      });

      return updatedNotification;
    } catch (error) {
      logger.error('Notification sending failed', {
        notificationData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    request: BulkNotificationRequest,
    senderId?: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { recipientId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { recipientId: string; error: string }[]
    };

    try {
      for (const recipientId of request.recipientIds) {
        try {
          const notification = await this.sendNotification(
            {
              ...request.notification,
              recipientId
            },
            senderId,
            ipAddress
          );
          results.success.push(notification.id);
        } catch (error) {
          results.failed.push({
            recipientId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: senderId || 'system',
        action: 'BULK_NOTIFICATION_SENT',
        entityType: 'notification',
        entityId: null,
        details: {
          type: request.notification.type,
          totalRecipients: request.recipientIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          batchId: request.batchId
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk notifications sent', {
        type: request.notification.type,
        totalRecipients: request.recipientIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        senderId
      });

      return results;
    } catch (error) {
      logger.error('Bulk notification sending failed', {
        request,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
    ipAddress?: string
  ): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new AppError(
          'Notification not found',
          404,
          ErrorCodes.NOTIFICATION_NOT_FOUND
        );
      }

      // Verify user can mark this notification as read
      if (notification.recipientId !== userId) {
        throw new AppError(
          'Unauthorized to mark this notification as read',
          403,
          ErrorCodes.UNAUTHORIZED
        );
      }

      if (notification.isRead) {
        return notification; // Already read
      }

      const updatedNotification = await this.notificationRepository.markAsRead(
        notificationId,
        new Date()
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId,
        action: 'NOTIFICATION_READ',
        entityType: 'notification',
        entityId: notificationId,
        details: {
          type: notification.type,
          readAt: updatedNotification.readAt
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.debug('Notification marked as read', {
        notificationId,
        userId,
        type: notification.type
      });

      return updatedNotification;
    } catch (error) {
      logger.error('Mark notification as read failed', {
        notificationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
    ipAddress?: string
  ): Promise<number> {
    try {
      const count = await this.notificationRepository.markAllAsReadForUser(userId);

      // Log audit event
      await this.auditLogRepository.create({
        userId,
        action: 'ALL_NOTIFICATIONS_READ',
        entityType: 'notification',
        entityId: null,
        details: {
          markedCount: count
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('All notifications marked as read', {
        userId,
        count
      });

      return count;
    } catch (error) {
      logger.error('Mark all notifications as read failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    filters: NotificationSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Notification>> {
    try {
      const result = await this.notificationRepository.findByRecipient(
        userId,
        filters,
        pagination
      );

      logger.debug('User notifications retrieved', {
        userId,
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Get user notifications failed', {
        userId,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notificationRepository.getUnreadCountForUser(userId);
      
      logger.debug('Unread notification count retrieved', {
        userId,
        count
      });

      return count;
    } catch (error) {
      logger.error('Get unread count failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences,
    updatedBy: string,
    ipAddress?: string
  ): Promise<NotificationPreferences> {
    try {
      const updatedPreferences = await this.notificationRepository.updatePreferences(
        userId,
        preferences
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'NOTIFICATION_PREFERENCES_UPDATED',
        entityType: 'user',
        entityId: userId,
        details: {
          preferences: updatedPreferences
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Notification preferences updated', {
        userId,
        updatedBy
      });

      return updatedPreferences;
    } catch (error) {
      logger.error('Update notification preferences failed', {
        userId,
        preferences,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(
    startDate?: Date,
    endDate?: Date,
    filters?: NotificationSearchFilters
  ): Promise<NotificationAnalytics> {
    try {
      const analytics = await this.notificationRepository.getAnalytics(
        startDate,
        endDate,
        filters
      );

      logger.debug('Notification analytics retrieved', {
        startDate,
        endDate,
        filters,
        totalSent: analytics.totalSent,
        deliveryRate: analytics.deliveryRate
      });

      return analytics;
    } catch (error) {
      logger.error('Get notification analytics failed', {
        startDate,
        endDate,
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Inspection-specific notification methods
   */
  async sendInspectionAssignmentNotification(
    assigneeId: string,
    inspection: Inspection,
    assignedBy: string
  ): Promise<Notification> {
    const template = this.templates.get('inspection_assignment');
    if (!template) {
      throw new AppError(
        'Notification template not found',
        500,
        ErrorCodes.TEMPLATE_NOT_FOUND
      );
    }

    const notification: CreateNotificationDTO = {
      type: NotificationType.INSPECTION_ASSIGNED,
      priority: NotificationPriority.HIGH,
      recipientId: assigneeId,
      title: template.title.replace('{{inspection_name}}', inspection.name),
      message: template.message
        .replace('{{inspection_name}}', inspection.name)
        .replace('{{inspection_id}}', inspection.inspectionId)
        .replace('{{assigned_by}}', assignedBy)
        .replace('{{due_date}}', inspection.dueDate?.toLocaleDateString() || 'Not set'),
      entityType: 'inspection',
      entityId: inspection.id,
      actionUrl: `/inspections/${inspection.id}`,
      data: {
        inspectionId: inspection.id,
        inspectionNumber: inspection.inspectionId,
        assignedBy,
        dueDate: inspection.dueDate,
        priority: inspection.priority
      }
    };

    return this.sendNotification(notification, assignedBy);
  }

  async sendInspectionReassignmentNotification(
    newAssigneeId: string,
    previousAssigneeId: string | null,
    inspection: Inspection,
    reassignedBy: string
  ): Promise<void> {
    // Notify new assignee
    await this.sendInspectionAssignmentNotification(newAssigneeId, inspection, reassignedBy);

    // Notify previous assignee if exists
    if (previousAssigneeId) {
      const template = this.templates.get('inspection_reassignment');
      if (template) {
        const notification: CreateNotificationDTO = {
          type: NotificationType.INSPECTION_REASSIGNED,
          priority: NotificationPriority.MEDIUM,
          recipientId: previousAssigneeId,
          title: template.title.replace('{{inspection_name}}', inspection.name),
          message: template.message
            .replace('{{inspection_name}}', inspection.name)
            .replace('{{inspection_id}}', inspection.inspectionId)
            .replace('{{reassigned_by}}', reassignedBy),
          entityType: 'inspection',
          entityId: inspection.id,
          data: {
            inspectionId: inspection.id,
            inspectionNumber: inspection.inspectionId,
            reassignedBy,
            newAssigneeId
          }
        };

        await this.sendNotification(notification, reassignedBy);
      }
    }
  }

  async sendInspectionCompletionNotification(
    inspection: Inspection,
    completedBy: string
  ): Promise<void> {
    const template = this.templates.get('inspection_completed');
    if (!template) return;

    // Get stakeholders to notify
    const stakeholders = await this.getInspectionStakeholders(inspection);

    for (const stakeholder of stakeholders) {
      if (stakeholder.id === completedBy) continue; // Don't notify the person who completed it

      const notification: CreateNotificationDTO = {
        type: NotificationType.INSPECTION_COMPLETED,
        priority: NotificationPriority.MEDIUM,
        recipientId: stakeholder.id,
        title: template.title.replace('{{inspection_name}}', inspection.name),
        message: template.message
          .replace('{{inspection_name}}', inspection.name)
          .replace('{{inspection_id}}', inspection.inspectionId)
          .replace('{{completed_by}}', completedBy)
          .replace('{{score}}', inspection.score?.percentage?.toString() || 'N/A'),
        entityType: 'inspection',
        entityId: inspection.id,
        actionUrl: `/inspections/${inspection.id}/report`,
        data: {
          inspectionId: inspection.id,
          inspectionNumber: inspection.inspectionId,
          completedBy,
          score: inspection.score,
          hasIssues: (inspection.score?.issueCount || 0) > 0
        }
      };

      await this.sendNotification(notification, completedBy);
    }
  }

  async sendInspectionCancellationNotification(
    inspection: Inspection,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    const template = this.templates.get('inspection_cancelled');
    if (!template) return;

    // Get stakeholders to notify
    const stakeholders = await this.getInspectionStakeholders(inspection);

    for (const stakeholder of stakeholders) {
      if (stakeholder.id === cancelledBy) continue; // Don't notify the person who cancelled it

      const notification: CreateNotificationDTO = {
        type: NotificationType.INSPECTION_CANCELLED,
        priority: NotificationPriority.HIGH,
        recipientId: stakeholder.id,
        title: template.title.replace('{{inspection_name}}', inspection.name),
        message: template.message
          .replace('{{inspection_name}}', inspection.name)
          .replace('{{inspection_id}}', inspection.inspectionId)
          .replace('{{cancelled_by}}', cancelledBy)
          .replace('{{reason}}', reason),
        entityType: 'inspection',
        entityId: inspection.id,
        data: {
          inspectionId: inspection.id,
          inspectionNumber: inspection.inspectionId,
          cancelledBy,
          reason,
          cancelledAt: new Date()
        }
      };

      await this.sendNotification(notification, cancelledBy);
    }
  }

  async sendInspectionDueReminderNotification(
    inspection: Inspection
  ): Promise<void> {
    if (!inspection.assignedTo || !inspection.dueDate) return;

    const template = this.templates.get('inspection_due_reminder');
    if (!template) return;

    const daysUntilDue = Math.ceil(
      (inspection.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const notification: CreateNotificationDTO = {
      type: NotificationType.INSPECTION_DUE_REMINDER,
      priority: daysUntilDue <= 1 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      recipientId: inspection.assignedTo,
      title: template.title.replace('{{inspection_name}}', inspection.name),
      message: template.message
        .replace('{{inspection_name}}', inspection.name)
        .replace('{{inspection_id}}', inspection.inspectionId)
        .replace('{{days_until_due}}', daysUntilDue.toString())
        .replace('{{due_date}}', inspection.dueDate.toLocaleDateString()),
      entityType: 'inspection',
      entityId: inspection.id,
      actionUrl: `/inspections/${inspection.id}`,
      data: {
        inspectionId: inspection.id,
        inspectionNumber: inspection.inspectionId,
        dueDate: inspection.dueDate,
        daysUntilDue,
        isOverdue: daysUntilDue < 0
      }
    };

    await this.sendNotification(notification, 'system');
  }

  async sendInspectionOverdueNotification(
    inspection: Inspection
  ): Promise<void> {
    if (!inspection.assignedTo) return;

    const template = this.templates.get('inspection_overdue');
    if (!template) return;

    const daysOverdue = Math.ceil(
      (new Date().getTime() - (inspection.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
    );

    const notification: CreateNotificationDTO = {
      type: NotificationType.INSPECTION_OVERDUE,
      priority: NotificationPriority.CRITICAL,
      recipientId: inspection.assignedTo,
      title: template.title.replace('{{inspection_name}}', inspection.name),
      message: template.message
        .replace('{{inspection_name}}', inspection.name)
        .replace('{{inspection_id}}', inspection.inspectionId)
        .replace('{{days_overdue}}', daysOverdue.toString())
        .replace('{{due_date}}', inspection.dueDate?.toLocaleDateString() || 'Unknown'),
      entityType: 'inspection',
      entityId: inspection.id,
      actionUrl: `/inspections/${inspection.id}`,
      data: {
        inspectionId: inspection.id,
        inspectionNumber: inspection.inspectionId,
        dueDate: inspection.dueDate,
        daysOverdue,
        isOverdue: true
      }
    };

    await this.sendNotification(notification, 'system');

    // Also notify supervisor/manager
    const stakeholders = await this.getInspectionStakeholders(inspection);
    for (const stakeholder of stakeholders) {
      if (stakeholder.id !== inspection.assignedTo) {
        const supervisorNotification: CreateNotificationDTO = {
          ...notification,
          recipientId: stakeholder.id,
          title: `Overdue Inspection Alert: ${inspection.name}`,
          message: `Inspection ${inspection.inspectionId} assigned to ${inspection.assignedTo} is ${daysOverdue} days overdue.`
        };
        await this.sendNotification(supervisorNotification, 'system');
      }
    }
  }

  /**
   * Asset-specific notification methods
   */
  async sendAssetMaintenanceReminderNotification(
    asset: Asset,
    recipientId: string
  ): Promise<void> {
    const template = this.templates.get('asset_maintenance_reminder');
    if (!template) return;

    const notification: CreateNotificationDTO = {
      type: NotificationType.ASSET_MAINTENANCE_DUE,
      priority: NotificationPriority.MEDIUM,
      recipientId,
      title: template.title.replace('{{asset_name}}', asset.name),
      message: template.message
        .replace('{{asset_name}}', asset.name)
        .replace('{{asset_id}}', asset.assetId)
        .replace('{{next_maintenance}}', asset.nextMaintenanceDate?.toLocaleDateString() || 'Not scheduled'),
      entityType: 'asset',
      entityId: asset.id,
      actionUrl: `/assets/${asset.id}`,
      data: {
        assetId: asset.id,
        assetNumber: asset.assetId,
        nextMaintenanceDate: asset.nextMaintenanceDate,
        maintenanceType: asset.maintenanceSchedule?.type
      }
    };

    await this.sendNotification(notification, 'system');
  }

  /**
   * System notification methods
   */
  async sendSystemMaintenanceNotification(
    message: string,
    scheduledAt: Date,
    duration: number,
    affectedUsers: string[]
  ): Promise<void> {
    const notification: CreateNotificationDTO = {
      type: NotificationType.SYSTEM_MAINTENANCE,
      priority: NotificationPriority.HIGH,
      recipientId: '', // Will be set for each user
      title: 'Scheduled System Maintenance',
      message: `System maintenance is scheduled for ${scheduledAt.toLocaleString()}. Expected duration: ${duration} minutes. ${message}`,
      data: {
        scheduledAt,
        duration,
        maintenanceMessage: message
      }
    };

    const bulkRequest: BulkNotificationRequest = {
      notification,
      recipientIds: affectedUsers,
      batchId: `maintenance_${Date.now()}`
    };

    await this.sendBulkNotifications(bulkRequest, 'system');
  }

  /**
   * Real-time notification methods
   */
  async sendRealTimeNotification(
    userId: string,
    notification: Notification
  ): Promise<void> {
    try {
      // Send via WebSocket if user is connected
      await this.webSocketService.sendToUser(userId, {
        type: 'notification',
        data: notification
      });

      logger.debug('Real-time notification sent', {
        userId,
        notificationId: notification.id,
        type: notification.type
      });
    } catch (error) {
      logger.error('Real-time notification failed', {
        userId,
        notificationId: notification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  /**
   * Helper methods
   */
  private async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      return await this.notificationRepository.getPreferences(userId);
    } catch (error) {
      // Return default preferences if not found
      return this.getDefaultNotificationPreferences();
    }
  }

  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: true,
        types: [NotificationType.INSPECTION_ASSIGNED, NotificationType.INSPECTION_OVERDUE]
      },
      push: {
        enabled: true,
        types: [NotificationType.INSPECTION_ASSIGNED, NotificationType.INSPECTION_DUE_REMINDER]
      },
      sms: {
        enabled: false,
        types: [NotificationType.INSPECTION_OVERDUE]
      },
      inApp: {
        enabled: true,
        types: Object.values(NotificationType)
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      frequency: {
        digest: false,
        immediate: true,
        batchInterval: 60 // minutes
      }
    };
  }

  private shouldSendNotification(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    // Check if user has disabled this type of notification
    const emailEnabled = preferences.email?.enabled && preferences.email.types.includes(type);
    const pushEnabled = preferences.push?.enabled && preferences.push.types.includes(type);
    const smsEnabled = preferences.sms?.enabled && preferences.sms.types.includes(type);
    const inAppEnabled = preferences.inApp?.enabled && preferences.inApp.types.includes(type);

    return emailEnabled || pushEnabled || smsEnabled || inAppEnabled;
  }

  private determineDeliveryChannels(
    priority: NotificationPriority,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Always include in-app notifications
    if (preferences.inApp?.enabled) {
      channels.push(NotificationChannel.IN_APP);
    }

    // Add other channels based on priority and preferences
    if (preferences.email?.enabled) {
      channels.push(NotificationChannel.EMAIL);
    }

    if (preferences.push?.enabled) {
      channels.push(NotificationChannel.PUSH);
    }

    // SMS only for high/critical priority
    if (preferences.sms?.enabled && 
        (priority === NotificationPriority.HIGH || priority === NotificationPriority.CRITICAL)) {
      channels.push(NotificationChannel.SMS);
    }

    return channels;
  }

  private async deliverNotification(
    notification: Notification,
    channels: NotificationChannel[],
    recipient: User
  ): Promise<NotificationDeliveryStatus[]> {
    const deliveryResults: NotificationDeliveryStatus[] = [];

    for (const channel of channels) {
      try {
        let success = false;
        let error: string | undefined;

        switch (channel) {
          case NotificationChannel.EMAIL:
            if (recipient.email) {
              await this.emailService.sendNotificationEmail(
                recipient.email,
                notification.title,
                notification.message,
                notification.actionUrl
              );
              success = true;
            } else {
              error = 'No email address available';
            }
            break;

          case NotificationChannel.SMS:
            if (recipient.phone) {
              await this.smsService.sendNotificationSMS(
                recipient.phone,
                notification.message
              );
              success = true;
            } else {
              error = 'No phone number available';
            }
            break;

          case NotificationChannel.PUSH:
            await this.pushNotificationService.sendNotification(
              recipient.id,
              notification.title,
              notification.message,
              notification.data
            );
            success = true;
            break;

          case NotificationChannel.IN_APP:
            // In-app notifications are stored in database and sent via WebSocket
            await this.sendRealTimeNotification(recipient.id, notification);
            success = true;
            break;

          default:
            error = `Unknown channel: ${channel}`;
        }

        deliveryResults.push({
          channel,
          success,
          error,
          deliveredAt: success ? new Date() : undefined
        });
      } catch (err) {
        deliveryResults.push({
          channel,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          deliveredAt: undefined
        });
      }
    }

    return deliveryResults;
  }

  private async getInspectionStakeholders(inspection: Inspection): Promise<User[]> {
    const stakeholders: User[] = [];

    // Add assigned inspector
    if (inspection.assignedTo) {
      const assignee = await this.userRepository.findById(inspection.assignedTo);
      if (assignee) stakeholders.push(assignee);
    }

    // Add inspection creator
    if (inspection.createdBy) {
      const creator = await this.userRepository.findById(inspection.createdBy);
      if (creator && !stakeholders.find(s => s.id === creator.id)) {
        stakeholders.push(creator);
      }
    }

    // Add team supervisors/managers
    if (inspection.assignedTo) {
      const assignee = await this.userRepository.findById(inspection.assignedTo);
      if (assignee?.teamId) {
        const team = await this.teamRepository.findById(assignee.teamId);
        if (team?.supervisorId) {
          const supervisor = await this.userRepository.findById(team.supervisorId);
          if (supervisor && !stakeholders.find(s => s.id === supervisor.id)) {
            stakeholders.push(supervisor);
          }
        }
      }
    }

    return stakeholders;
  }

  private createSkippedNotification(
    notificationData: CreateNotificationDTO,
    reason: string
  ): Notification {
    return {
      id: `skipped_${Date.now()}`,
      ...notificationData,
      status: NotificationStatus.SKIPPED,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false,
      deliveryStatus: [{
        channel: NotificationChannel.IN_APP,
        success: false,
        error: `Skipped: ${reason}`,
        deliveredAt: undefined
      }]
    } as Notification;
  }

  private initializeTemplates(): void {
    // Initialize notification templates
    this.templates.set('inspection_assignment', {
      id: 'inspection_assignment',
      name: 'Inspection Assignment',
      title: 'New Inspection Assigned: {{inspection_name}}',
      message: 'You have been assigned inspection {{inspection_name}} ({{inspection_id}}) by {{assigned_by}}. Due date: {{due_date}}.',
      type: NotificationType.INSPECTION_ASSIGNED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      variables: ['inspection_name', 'inspection_id', 'assigned_by', 'due_date']
    });

    this.templates.set('inspection_completed', {
      id: 'inspection_completed',
      name: 'Inspection Completed',
      title: 'Inspection Completed: {{inspection_name}}',
      message: 'Inspection {{inspection_name}} ({{inspection_id}}) has been completed by {{completed_by}}. Score: {{score}}%.',
      type: NotificationType.INSPECTION_COMPLETED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      variables: ['inspection_name', 'inspection_id', 'completed_by', 'score']
    });

    this.templates.set('inspection_due_reminder', {
      id: 'inspection_due_reminder',
      name: 'Inspection Due Reminder',
      title: 'Reminder: {{inspection_name}} Due Soon',
      message: 'Inspection {{inspection_name}} ({{inspection_id}}) is due in {{days_until_due}} days ({{due_date}}).',
      type: NotificationType.INSPECTION_DUE_REMINDER,
      channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      variables: ['inspection_name', 'inspection_id', 'days_until_due', 'due_date']
    });

    this.templates.set('inspection_overdue', {
      id: 'inspection_overdue',
      name: 'Inspection Overdue',
      title: 'OVERDUE: {{inspection_name}}',
      message: 'Inspection {{inspection_name}} ({{inspection_id}}) is {{days_overdue}} days overdue. Original due date: {{due_date}}.',
      type: NotificationType.INSPECTION_OVERDUE,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      variables: ['inspection_name', 'inspection_id', 'days_overdue', 'due_date']
    });

    // Add more templates as needed...
  }
}