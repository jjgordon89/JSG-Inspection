/**
 * Notification Routes
 * Defines all notification-related API endpoints
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { notificationValidationSchemas } from '../controllers/notification.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService);

// Apply rate limiting for notification operations
const notificationRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit notification requests per minute
  message: 'Too many notification requests'
});

const sendNotificationRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit sending notifications
  message: 'Too many notification send requests'
});

// User notification endpoints

/**
 * @route   GET /api/v1/notifications
 * @desc    Get notifications for current user
 * @access  Private
 * @query   page?, limit?, status?, type?, startDate?, endDate?, sortBy?, sortOrder?
 */
router.get(
  '/',
  notificationRateLimit,
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string', enum: ['read', 'unread', 'archived'] },
    type: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    sortBy: { required: false, type: 'string', enum: ['createdAt', 'priority', 'type'] },
    sortOrder: { required: false, type: 'string', enum: ['asc', 'desc'] }
  }),
  asyncHandler(notificationController.getNotifications)
);

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get single notification by ID
 * @access  Private
 * @params  id
 */
router.get(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.getNotificationById)
);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 * @params  id
 */
router.put(
  '/:id/read',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.markAsRead)
);

/**
 * @route   PUT /api/v1/notifications/:id/unread
 * @desc    Mark notification as unread
 * @access  Private
 * @params  id
 */
router.put(
  '/:id/unread',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.markAsUnread)
);

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 * @body    { types?, olderThan? }
 */
router.put(
  '/mark-all-read',
  validationMiddleware.validateBody({
    types: { required: false, type: 'array', items: { type: 'string' } },
    olderThan: { required: false, type: 'string', format: 'date-time' }
  }),
  asyncHandler(notificationController.markAllAsRead)
);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 * @params  id
 */
router.delete(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.deleteNotification)
);

/**
 * @route   DELETE /api/v1/notifications/bulk
 * @desc    Delete multiple notifications
 * @access  Private
 * @body    { notificationIds, criteria? }
 */
router.delete(
  '/bulk',
  validationMiddleware.validateBody(notificationValidationSchemas.bulkDelete),
  asyncHandler(notificationController.bulkDeleteNotifications)
);

// User preferences

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get user notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  asyncHandler(notificationController.getNotificationPreferences)
);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update user notification preferences
 * @access  Private
 * @body    { email?, push?, inApp?, types? }
 */
router.put(
  '/preferences',
  validationMiddleware.validateBody(notificationValidationSchemas.updatePreferences),
  asyncHandler(notificationController.updateNotificationPreferences)
);

// Notification counts and status

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 * @query   types?
 */
router.get(
  '/unread-count',
  validationMiddleware.validateQuery({
    types: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(notificationController.getUnreadCount)
);

// Push notification subscription

/**
 * @route   POST /api/v1/notifications/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 * @body    { endpoint, keys, deviceInfo? }
 */
router.post(
  '/subscribe',
  validationMiddleware.validateBody(notificationValidationSchemas.pushSubscription),
  asyncHandler(notificationController.subscribeToPush)
);

/**
 * @route   POST /api/v1/notifications/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 * @body    { endpoint }
 */
router.post(
  '/unsubscribe',
  validationMiddleware.validateBody({
    endpoint: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.unsubscribeFromPush)
);

// Admin notification management

/**
 * @route   POST /api/v1/notifications/send
 * @desc    Send notification to user(s) (admin only)
 * @access  Private (Admin)
 * @body    { recipients, title, message, type?, priority?, data?, channels? }
 */
router.post(
  '/send',
  authMiddleware.requireRole('admin'),
  sendNotificationRateLimit,
  validationMiddleware.validateBody(notificationValidationSchemas.sendNotification),
  asyncHandler(notificationController.sendNotification)
);

/**
 * @route   POST /api/v1/notifications/send-bulk
 * @desc    Send bulk notifications (admin only)
 * @access  Private (Admin)
 * @body    { notifications, batchSize?, delay? }
 */
router.post(
  '/send-bulk',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Very limited bulk sending
    message: 'Too many bulk notification requests'
  }),
  validationMiddleware.validateBody(notificationValidationSchemas.sendBulkNotifications),
  asyncHandler(notificationController.sendBulkNotifications)
);

// Notification templates (admin only)

/**
 * @route   GET /api/v1/notifications/templates
 * @desc    Get notification templates (admin only)
 * @access  Private (Admin)
 * @query   page?, limit?, type?, active?
 */
router.get(
  '/templates',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    type: { required: false, type: 'string' },
    active: { required: false, type: 'boolean' }
  }),
  asyncHandler(notificationController.getNotificationTemplates)
);

/**
 * @route   POST /api/v1/notifications/templates
 * @desc    Create notification template (admin only)
 * @access  Private (Admin)
 * @body    { name, type, title, message, variables?, active? }
 */
router.post(
  '/templates',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateBody(notificationValidationSchemas.createTemplate),
  asyncHandler(notificationController.createNotificationTemplate)
);

/**
 * @route   PUT /api/v1/notifications/templates/:id
 * @desc    Update notification template (admin only)
 * @access  Private (Admin)
 * @params  id
 * @body    { name?, type?, title?, message?, variables?, active? }
 */
router.put(
  '/templates/:id',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(notificationValidationSchemas.updateTemplate),
  asyncHandler(notificationController.updateNotificationTemplate)
);

/**
 * @route   DELETE /api/v1/notifications/templates/:id
 * @desc    Delete notification template (admin only)
 * @access  Private (Admin)
 * @params  id
 */
router.delete(
  '/templates/:id',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.deleteNotificationTemplate)
);

// Notification statistics and analytics (admin only)

/**
 * @route   GET /api/v1/notifications/stats
 * @desc    Get notification statistics (admin only)
 * @access  Private (Admin)
 * @query   timeRange?, type?, groupBy?
 */
router.get(
  '/stats',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    type: { required: false, type: 'string' },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month', 'type', 'status'] }
  }),
  asyncHandler(notificationController.getNotificationStats)
);

// Testing and debugging

/**
 * @route   POST /api/v1/notifications/test
 * @desc    Test notification delivery
 * @access  Private
 * @body    { type, channel?, testData? }
 */
router.post(
  '/test',
  authMiddleware.requirePermission('notifications.test'),
  rateLimitMiddleware.createLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limited test notifications
    message: 'Too many test notification requests'
  }),
  validationMiddleware.validateBody({
    type: { required: true, type: 'string' },
    channel: { required: false, type: 'string', enum: ['email', 'push', 'inApp'] },
    testData: { required: false, type: 'object' }
  }),
  asyncHandler(notificationController.testNotificationDelivery)
);

// Notification delivery status and tracking

/**
 * @route   GET /api/v1/notifications/:id/delivery-status
 * @desc    Get notification delivery status
 * @access  Private
 * @params  id
 */
router.get(
  '/:id/delivery-status',
  authMiddleware.requirePermission('notifications.track'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(notificationController.getDeliveryStatus)
);

/**
 * @route   POST /api/v1/notifications/:id/retry
 * @desc    Retry failed notification delivery
 * @access  Private (Admin)
 * @params  id
 * @body    { channels? }
 */
router.post(
  '/:id/retry',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    channels: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(notificationController.retryNotificationDelivery)
);

// Notification channels management

/**
 * @route   GET /api/v1/notifications/channels
 * @desc    Get available notification channels
 * @access  Private
 */
router.get(
  '/channels',
  asyncHandler(notificationController.getNotificationChannels)
);

/**
 * @route   GET /api/v1/notifications/channels/health
 * @desc    Get notification channels health status
 * @access  Private (Admin)
 */
router.get(
  '/channels/health',
  authMiddleware.requireRole('admin'),
  asyncHandler(notificationController.getChannelsHealthStatus)
);

// Notification queue management (admin only)

/**
 * @route   GET /api/v1/notifications/queue/status
 * @desc    Get notification queue status (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/queue/status',
  authMiddleware.requireRole('admin'),
  asyncHandler(notificationController.getQueueStatus)
);

/**
 * @route   POST /api/v1/notifications/queue/clear
 * @desc    Clear notification queue (admin only)
 * @access  Private (Admin)
 * @body    { queueType?, olderThan? }
 */
router.post(
  '/queue/clear',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Very limited queue clearing
    message: 'Too many queue clear requests'
  }),
  validationMiddleware.validateBody({
    queueType: { required: false, type: 'string', enum: ['email', 'push', 'inApp', 'all'] },
    olderThan: { required: false, type: 'string', format: 'date-time' }
  }),
  asyncHandler(notificationController.clearNotificationQueue)
);

// WebSocket endpoint for real-time notifications
/**
 * @route   GET /api/v1/notifications/ws
 * @desc    WebSocket endpoint for real-time notifications
 * @access  Private
 * @note    This will be handled by WebSocket middleware
 */
router.get('/ws', (req, res) => {
  res.status(426).json({
    success: false,
    message: 'Upgrade to WebSocket required',
    upgrade: 'websocket'
  });
});

// Export the router
export { router as notificationRoutes };

// Export route information for documentation
export const notificationRouteInfo = {
  basePath: '/notifications',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get notifications for current user',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get single notification by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/:id/read',
      description: 'Mark notification as read',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/:id/unread',
      description: 'Mark notification as unread',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/mark-all-read',
      description: 'Mark all notifications as read',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete notification',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/bulk',
      description: 'Delete multiple notifications',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/preferences',
      description: 'Get user notification preferences',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/preferences',
      description: 'Update user notification preferences',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/unread-count',
      description: 'Get unread notification count',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/subscribe',
      description: 'Subscribe to push notifications',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/unsubscribe',
      description: 'Unsubscribe from push notifications',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/send',
      description: 'Send notification to user(s) (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/send-bulk',
      description: 'Send bulk notifications (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/templates',
      description: 'Get notification templates (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/templates',
      description: 'Create notification template (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/templates/:id',
      description: 'Update notification template (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'DELETE',
      path: '/templates/:id',
      description: 'Delete notification template (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get notification statistics (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/test',
      description: 'Test notification delivery',
      auth: true,
      permissions: ['notifications.test']
    },
    {
      method: 'GET',
      path: '/:id/delivery-status',
      description: 'Get notification delivery status',
      auth: true,
      permissions: ['notifications.track']
    },
    {
      method: 'POST',
      path: '/:id/retry',
      description: 'Retry failed notification delivery',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/channels',
      description: 'Get available notification channels',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/channels/health',
      description: 'Get notification channels health status',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/queue/status',
      description: 'Get notification queue status (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/queue/clear',
      description: 'Clear notification queue (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/ws',
      description: 'WebSocket endpoint for real-time notifications',
      auth: true,
      permissions: []
    }
  ]
};