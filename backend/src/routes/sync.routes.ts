/**
 * Sync Routes
 * Defines all data synchronization and offline operation endpoints
 */

import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { SyncService } from '../services/sync.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { syncValidationSchemas } from '../controllers/sync.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const syncService = new SyncService();
const syncController = new SyncController(syncService);

// Apply rate limiting for sync operations
const syncRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit sync requests per minute
  message: 'Too many sync requests'
});

// Core synchronization endpoints

/**
 * @route   POST /api/v1/sync
 * @desc    Synchronize data between client and server
 * @access  Private
 * @body    { deviceId, lastSyncTimestamp?, changes?, conflicts? }
 */
router.post(
  '/',
  syncRateLimit,
  validationMiddleware.validateBody(syncValidationSchemas.syncData),
  asyncHandler(syncController.syncData)
);

/**
 * @route   GET /api/v1/sync/status
 * @desc    Get synchronization status
 * @access  Private
 * @query   deviceId?
 */
router.get(
  '/status',
  validationMiddleware.validateQuery({
    deviceId: { required: false, type: 'string' }
  }),
  asyncHandler(syncController.getSyncStatus)
);

/**
 * @route   POST /api/v1/sync/queue
 * @desc    Queue offline operation
 * @access  Private
 * @body    { deviceId, operation, data, timestamp }
 */
router.post(
  '/queue',
  validationMiddleware.validateBody(syncValidationSchemas.queueOperation),
  asyncHandler(syncController.queueOfflineOperation)
);

/**
 * @route   GET /api/v1/sync/pending
 * @desc    Get pending operations for device
 * @access  Private
 * @query   deviceId, limit?, offset?
 */
router.get(
  '/pending',
  validationMiddleware.validateQuery({
    deviceId: { required: true, type: 'string' },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    offset: { required: false, type: 'number', min: 0 }
  }),
  asyncHandler(syncController.getPendingOperations)
);

// Conflict resolution

/**
 * @route   POST /api/v1/sync/resolve-conflict
 * @desc    Resolve synchronization conflict
 * @access  Private
 * @body    { conflictId, resolution, data? }
 */
router.post(
  '/resolve-conflict',
  validationMiddleware.validateBody(syncValidationSchemas.resolveConflict),
  asyncHandler(syncController.resolveConflict)
);

/**
 * @route   GET /api/v1/sync/conflicts
 * @desc    Get synchronization conflicts
 * @access  Private
 * @query   deviceId?, status?, page?, limit?
 */
router.get(
  '/conflicts',
  validationMiddleware.validateQuery({
    deviceId: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['pending', 'resolved', 'ignored'] },
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 }
  }),
  asyncHandler(syncController.getSyncConflicts)
);

// Sync statistics and monitoring

/**
 * @route   GET /api/v1/sync/stats
 * @desc    Get synchronization statistics
 * @access  Private
 * @query   deviceId?, timeRange?
 */
router.get(
  '/stats',
  validationMiddleware.validateQuery({
    deviceId: { required: false, type: 'string' },
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] }
  }),
  asyncHandler(syncController.getSyncStats)
);

/**
 * @route   POST /api/v1/sync/force-full
 * @desc    Force full synchronization
 * @access  Private
 * @body    { deviceId, reason? }
 */
router.post(
  '/force-full',
  authMiddleware.requirePermission('sync.force'),
  rateLimitMiddleware.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Very limited full sync
    message: 'Too many full sync requests'
  }),
  validationMiddleware.validateBody({
    deviceId: { required: true, type: 'string' },
    reason: { required: false, type: 'string', maxLength: 200 }
  }),
  asyncHandler(syncController.forceFullSync)
);

/**
 * @route   POST /api/v1/sync/reset
 * @desc    Reset synchronization state
 * @access  Private
 * @body    { deviceId, resetType? }
 */
router.post(
  '/reset',
  authMiddleware.requirePermission('sync.reset'),
  rateLimitMiddleware.createLimiter({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 2, // Very limited reset
    message: 'Too many sync reset requests'
  }),
  validationMiddleware.validateBody({
    deviceId: { required: true, type: 'string' },
    resetType: { required: false, type: 'string', enum: ['soft', 'hard'] }
  }),
  asyncHandler(syncController.resetSyncState)
);

// Sync history and audit

/**
 * @route   GET /api/v1/sync/history
 * @desc    Get synchronization history
 * @access  Private
 * @query   deviceId?, page?, limit?, startDate?, endDate?
 */
router.get(
  '/history',
  validationMiddleware.validateQuery({
    deviceId: { required: false, type: 'string' },
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(syncController.getSyncHistory)
);

/**
 * @route   GET /api/v1/sync/changes
 * @desc    Check for server changes since timestamp
 * @access  Private
 * @query   since, entityTypes?, deviceId?
 */
router.get(
  '/changes',
  validationMiddleware.validateQuery({
    since: { required: true, type: 'string', format: 'date-time' },
    entityTypes: { required: false, type: 'array', items: { type: 'string' } },
    deviceId: { required: false, type: 'string' }
  }),
  asyncHandler(syncController.checkServerChanges)
);

// Data validation and integrity

/**
 * @route   POST /api/v1/sync/validate
 * @desc    Validate sync data integrity
 * @access  Private
 * @body    { deviceId, checksums?, entities? }
 */
router.post(
  '/validate',
  validationMiddleware.validateBody(syncValidationSchemas.validateSyncData),
  asyncHandler(syncController.validateSyncData)
);

// Device management

/**
 * @route   GET /api/v1/sync/devices
 * @desc    Get device sync information
 * @access  Private
 * @query   page?, limit?, status?
 */
router.get(
  '/devices',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string', enum: ['active', 'inactive', 'blocked'] }
  }),
  asyncHandler(syncController.getDeviceSyncInfo)
);

/**
 * @route   DELETE /api/v1/sync/devices/:deviceId
 * @desc    Remove device sync data
 * @access  Private
 * @params  deviceId
 * @query   purgeData?
 */
router.delete(
  '/devices/:deviceId',
  authMiddleware.requirePermission('sync.manage'),
  validationMiddleware.validateParams({
    deviceId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    purgeData: { required: false, type: 'boolean' }
  }),
  asyncHandler(syncController.removeDeviceSyncData)
);

// Health and performance monitoring

/**
 * @route   GET /api/v1/sync/health
 * @desc    Get sync health check
 * @access  Private
 * @query   deviceId?
 */
router.get(
  '/health',
  validationMiddleware.validateQuery({
    deviceId: { required: false, type: 'string' }
  }),
  asyncHandler(syncController.getSyncHealthCheck)
);

/**
 * @route   POST /api/v1/sync/optimize
 * @desc    Optimize sync performance
 * @access  Private
 * @body    { deviceId, optimizationType? }
 */
router.post(
  '/optimize',
  authMiddleware.requirePermission('sync.optimize'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limited optimization requests
    message: 'Too many optimization requests'
  }),
  validationMiddleware.validateBody({
    deviceId: { required: true, type: 'string' },
    optimizationType: { required: false, type: 'string', enum: ['cleanup', 'reindex', 'compress'] }
  }),
  asyncHandler(syncController.optimizeSyncPerformance)
);

// Batch operations for efficiency

/**
 * @route   POST /api/v1/sync/batch
 * @desc    Process batch sync operations
 * @access  Private
 * @body    { deviceId, operations, batchId? }
 */
router.post(
  '/batch',
  syncRateLimit,
  validationMiddleware.validateBody({
    deviceId: { required: true, type: 'string' },
    operations: { required: true, type: 'array', maxItems: 100 },
    batchId: { required: false, type: 'string' }
  }),
  asyncHandler(syncController.processBatchOperations)
);

/**
 * @route   GET /api/v1/sync/batch/:batchId/status
 * @desc    Get batch operation status
 * @access  Private
 * @params  batchId
 */
router.get(
  '/batch/:batchId/status',
  validationMiddleware.validateParams({
    batchId: { required: true, type: 'string' }
  }),
  asyncHandler(syncController.getBatchOperationStatus)
);

// WebSocket endpoint for real-time sync notifications
/**
 * @route   GET /api/v1/sync/ws
 * @desc    WebSocket endpoint for real-time sync notifications
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

// Admin endpoints for sync management

/**
 * @route   GET /api/v1/sync/admin/overview
 * @desc    Get sync system overview (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/admin/overview',
  authMiddleware.requireRole('admin'),
  asyncHandler(syncController.getAdminSyncOverview)
);

/**
 * @route   POST /api/v1/sync/admin/maintenance
 * @desc    Perform sync system maintenance (admin only)
 * @access  Private (Admin)
 * @body    { operation, parameters? }
 */
router.post(
  '/admin/maintenance',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Very limited maintenance operations
    message: 'Too many maintenance requests'
  }),
  validationMiddleware.validateBody({
    operation: { required: true, type: 'string', enum: ['cleanup', 'rebuild', 'analyze', 'vacuum'] },
    parameters: { required: false, type: 'object' }
  }),
  asyncHandler(syncController.performSyncMaintenance)
);

// Export the router
export { router as syncRoutes };

// Export route information for documentation
export const syncRouteInfo = {
  basePath: '/sync',
  routes: [
    {
      method: 'POST',
      path: '/',
      description: 'Synchronize data between client and server',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/status',
      description: 'Get synchronization status',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/queue',
      description: 'Queue offline operation',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/pending',
      description: 'Get pending operations for device',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/resolve-conflict',
      description: 'Resolve synchronization conflict',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/conflicts',
      description: 'Get synchronization conflicts',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get synchronization statistics',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/force-full',
      description: 'Force full synchronization',
      auth: true,
      permissions: ['sync.force']
    },
    {
      method: 'POST',
      path: '/reset',
      description: 'Reset synchronization state',
      auth: true,
      permissions: ['sync.reset']
    },
    {
      method: 'GET',
      path: '/history',
      description: 'Get synchronization history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/changes',
      description: 'Check for server changes since timestamp',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/validate',
      description: 'Validate sync data integrity',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/devices',
      description: 'Get device sync information',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/devices/:deviceId',
      description: 'Remove device sync data',
      auth: true,
      permissions: ['sync.manage']
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Get sync health check',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/optimize',
      description: 'Optimize sync performance',
      auth: true,
      permissions: ['sync.optimize']
    },
    {
      method: 'POST',
      path: '/batch',
      description: 'Process batch sync operations',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/batch/:batchId/status',
      description: 'Get batch operation status',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/ws',
      description: 'WebSocket endpoint for real-time sync notifications',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/admin/overview',
      description: 'Get sync system overview (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/admin/maintenance',
      description: 'Perform sync system maintenance (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    }
  ]
};