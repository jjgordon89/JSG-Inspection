/**
 * Audit Routes
 * Defines all audit logging and activity tracking endpoints
 */

import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { AuditService } from '../services/audit.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const auditService = new AuditService();
const auditController = new AuditController(auditService);

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Apply rate limiting for audit operations
const auditRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Limit audit requests per minute
  message: 'Too many audit requests'
});

const heavyAuditRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Very limited heavy audit operations
  message: 'Too many heavy audit requests'
});

// Audit log retrieval

/**
 * @route   GET /api/v1/audit/logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Private (Manager+)
 * @query   page?, limit?, startDate?, endDate?, userId?, action?, resource?, level?, search?
 */
router.get(
  '/logs',
  authMiddleware.requireRole(['manager', 'admin']),
  auditRateLimit,
  cacheMiddleware.cache(2 * 60), // Cache for 2 minutes
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    userId: { required: false, type: 'string' },
    action: { required: false, type: 'string', enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'] },
    resource: { required: false, type: 'string', enum: ['user', 'asset', 'inspection', 'folder', 'form', 'report', 'notification'] },
    level: { required: false, type: 'string', enum: ['info', 'warn', 'error', 'critical'] },
    search: { required: false, type: 'string', maxLength: 100 },
    sortBy: { required: false, type: 'string', enum: ['timestamp', 'userId', 'action', 'resource'] },
    sortOrder: { required: false, type: 'string', enum: ['asc', 'desc'] }
  }),
  asyncHandler(auditController.getAuditLogs)
);

/**
 * @route   GET /api/v1/audit/logs/:logId
 * @desc    Get specific audit log entry
 * @access  Private (Manager+)
 * @params  logId
 */
router.get(
  '/logs/:logId',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateParams({
    logId: { required: true, type: 'string' }
  }),
  asyncHandler(auditController.getAuditLog)
);

// User activity tracking

/**
 * @route   GET /api/v1/audit/users/:userId/activity
 * @desc    Get user activity history
 * @access  Private (Manager+ or own activity)
 * @params  userId
 * @query   page?, limit?, startDate?, endDate?, action?, resource?
 */
router.get(
  '/users/:userId/activity',
  validationMiddleware.validateParams({
    userId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    action: { required: false, type: 'string' },
    resource: { required: false, type: 'string' }
  }),
  asyncHandler(auditController.getUserActivity)
);

/**
 * @route   GET /api/v1/audit/users/activity/summary
 * @desc    Get user activity summary
 * @access  Private (Manager+)
 * @query   timeRange?, userId?, groupBy?
 */
router.get(
  '/users/activity/summary',
  authMiddleware.requireRole(['manager', 'admin']),
  auditRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    userId: { required: false, type: 'string' },
    groupBy: { required: false, type: 'string', enum: ['user', 'action', 'resource', 'hour', 'day'] }
  }),
  asyncHandler(auditController.getUserActivitySummary)
);

// Resource activity tracking

/**
 * @route   GET /api/v1/audit/resources/:resourceType/:resourceId/activity
 * @desc    Get activity history for a specific resource
 * @access  Private (Manager+)
 * @params  resourceType, resourceId
 * @query   page?, limit?, startDate?, endDate?, action?, userId?
 */
router.get(
  '/resources/:resourceType/:resourceId/activity',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateParams({
    resourceType: { required: true, type: 'string', enum: ['user', 'asset', 'inspection', 'folder', 'form', 'report'] },
    resourceId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    action: { required: false, type: 'string' },
    userId: { required: false, type: 'string' }
  }),
  asyncHandler(auditController.getResourceActivity)
);

/**
 * @route   GET /api/v1/audit/resources/activity/summary
 * @desc    Get resource activity summary
 * @access  Private (Manager+)
 * @query   resourceType?, timeRange?, groupBy?
 */
router.get(
  '/resources/activity/summary',
  authMiddleware.requireRole(['manager', 'admin']),
  auditRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    resourceType: { required: false, type: 'string', enum: ['user', 'asset', 'inspection', 'folder', 'form', 'report'] },
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    groupBy: { required: false, type: 'string', enum: ['resource', 'action', 'user', 'day'] }
  }),
  asyncHandler(auditController.getResourceActivitySummary)
);

// Security audit

/**
 * @route   GET /api/v1/audit/security/events
 * @desc    Get security-related audit events
 * @access  Private (Admin)
 * @query   page?, limit?, startDate?, endDate?, severity?, eventType?, userId?
 */
router.get(
  '/security/events',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(1 * 60),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    severity: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    eventType: { required: false, type: 'string', enum: ['failed_login', 'suspicious_activity', 'permission_escalation', 'data_breach', 'unauthorized_access'] },
    userId: { required: false, type: 'string' }
  }),
  asyncHandler(auditController.getSecurityEvents)
);

/**
 * @route   GET /api/v1/audit/security/summary
 * @desc    Get security audit summary
 * @access  Private (Admin)
 * @query   timeRange?, includeDetails?
 */
router.get(
  '/security/summary',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d'] },
    includeDetails: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.getSecuritySummary)
);

/**
 * @route   GET /api/v1/audit/security/failed-logins
 * @desc    Get failed login attempts
 * @access  Private (Admin)
 * @query   page?, limit?, startDate?, endDate?, ipAddress?, userId?
 */
router.get(
  '/security/failed-logins',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    ipAddress: { required: false, type: 'string' },
    userId: { required: false, type: 'string' }
  }),
  asyncHandler(auditController.getFailedLogins)
);

// Data access audit

/**
 * @route   GET /api/v1/audit/data-access
 * @desc    Get data access audit logs
 * @access  Private (Admin)
 * @query   page?, limit?, startDate?, endDate?, userId?, dataType?, operation?
 */
router.get(
  '/data-access',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(2 * 60),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    userId: { required: false, type: 'string' },
    dataType: { required: false, type: 'string', enum: ['personal', 'sensitive', 'confidential', 'public'] },
    operation: { required: false, type: 'string', enum: ['read', 'write', 'delete', 'export'] }
  }),
  asyncHandler(auditController.getDataAccessLogs)
);

/**
 * @route   GET /api/v1/audit/data-access/summary
 * @desc    Get data access summary
 * @access  Private (Admin)
 * @query   timeRange?, groupBy?
 */
router.get(
  '/data-access/summary',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    groupBy: { required: false, type: 'string', enum: ['user', 'dataType', 'operation', 'day'] }
  }),
  asyncHandler(auditController.getDataAccessSummary)
);

// System audit

/**
 * @route   GET /api/v1/audit/system/events
 * @desc    Get system-level audit events
 * @access  Private (Admin)
 * @query   page?, limit?, startDate?, endDate?, component?, level?, search?
 */
router.get(
  '/system/events',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(1 * 60),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    component: { required: false, type: 'string', enum: ['auth', 'database', 'api', 'sync', 'ai', 'file_system'] },
    level: { required: false, type: 'string', enum: ['info', 'warn', 'error', 'critical'] },
    search: { required: false, type: 'string', maxLength: 100 }
  }),
  asyncHandler(auditController.getSystemEvents)
);

/**
 * @route   GET /api/v1/audit/system/performance
 * @desc    Get system performance audit data
 * @access  Private (Admin)
 * @query   timeRange?, metric?, threshold?
 */
router.get(
  '/system/performance',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['1h', '24h', '7d', '30d'] },
    metric: { required: false, type: 'string', enum: ['response_time', 'error_rate', 'throughput', 'memory_usage'] },
    threshold: { required: false, type: 'number' }
  }),
  asyncHandler(auditController.getSystemPerformance)
);

// Compliance audit

/**
 * @route   GET /api/v1/audit/compliance/report
 * @desc    Generate compliance audit report
 * @access  Private (Admin)
 * @query   standard, startDate, endDate, format?
 */
router.get(
  '/compliance/report',
  authMiddleware.requireRole('admin'),
  heavyAuditRateLimit,
  validationMiddleware.validateQuery({
    standard: { required: true, type: 'string', enum: ['gdpr', 'hipaa', 'sox', 'iso27001', 'custom'] },
    startDate: { required: true, type: 'string', format: 'date' },
    endDate: { required: true, type: 'string', format: 'date' },
    format: { required: false, type: 'string', enum: ['json', 'pdf', 'csv'] }
  }),
  asyncHandler(auditController.generateComplianceReport)
);

/**
 * @route   GET /api/v1/audit/compliance/violations
 * @desc    Get compliance violations
 * @access  Private (Admin)
 * @query   page?, limit?, startDate?, endDate?, severity?, standard?, resolved?
 */
router.get(
  '/compliance/violations',
  authMiddleware.requireRole('admin'),
  auditRateLimit,
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    severity: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    standard: { required: false, type: 'string', enum: ['gdpr', 'hipaa', 'sox', 'iso27001'] },
    resolved: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.getComplianceViolations)
);

// Audit search and analytics

/**
 * @route   POST /api/v1/audit/search
 * @desc    Advanced audit log search
 * @access  Private (Manager+)
 * @body    { query, filters?, aggregations?, timeRange? }
 */
router.post(
  '/search',
  authMiddleware.requireRole(['manager', 'admin']),
  heavyAuditRateLimit,
  validationMiddleware.validateBody({
    query: { required: true, type: 'string', maxLength: 500 },
    filters: { required: false, type: 'object' },
    aggregations: { required: false, type: 'array', items: { type: 'string' } },
    timeRange: { required: false, type: 'object' }
  }),
  asyncHandler(auditController.searchAuditLogs)
);

/**
 * @route   GET /api/v1/audit/analytics
 * @desc    Get audit analytics
 * @access  Private (Manager+)
 * @query   timeRange?, metric?, groupBy?, includeComparisons?
 */
router.get(
  '/analytics',
  authMiddleware.requireRole(['manager', 'admin']),
  auditRateLimit,
  cacheMiddleware.cache(10 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    metric: { required: false, type: 'string', enum: ['activity_volume', 'user_activity', 'resource_access', 'security_events'] },
    groupBy: { required: false, type: 'string', enum: ['hour', 'day', 'week', 'user', 'action', 'resource'] },
    includeComparisons: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.getAuditAnalytics)
);

// Audit export

/**
 * @route   POST /api/v1/audit/export
 * @desc    Export audit logs
 * @access  Private (Manager+)
 * @body    { format, filters?, startDate?, endDate?, includeMetadata? }
 */
router.post(
  '/export',
  authMiddleware.requireRole(['manager', 'admin']),
  heavyAuditRateLimit,
  validationMiddleware.validateBody({
    format: { required: true, type: 'string', enum: ['csv', 'json', 'xlsx', 'pdf'] },
    filters: { required: false, type: 'object' },
    startDate: { required: false, type: 'string', format: 'date-time' },
    endDate: { required: false, type: 'string', format: 'date-time' },
    includeMetadata: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.exportAuditLogs)
);

/**
 * @route   GET /api/v1/audit/export/:exportId
 * @desc    Get audit export status
 * @access  Private (Manager+)
 * @params  exportId
 */
router.get(
  '/export/:exportId',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateParams({
    exportId: { required: true, type: 'string' }
  }),
  asyncHandler(auditController.getExportStatus)
);

/**
 * @route   GET /api/v1/audit/export/:exportId/download
 * @desc    Download audit export file
 * @access  Private (Manager+)
 * @params  exportId
 */
router.get(
  '/export/:exportId/download',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateParams({
    exportId: { required: true, type: 'string' }
  }),
  asyncHandler(auditController.downloadExport)
);

// Audit configuration

/**
 * @route   GET /api/v1/audit/config
 * @desc    Get audit configuration
 * @access  Private (Admin)
 */
router.get(
  '/config',
  authMiddleware.requireRole('admin'),
  asyncHandler(auditController.getAuditConfig)
);

/**
 * @route   PUT /api/v1/audit/config
 * @desc    Update audit configuration
 * @access  Private (Admin)
 * @body    { retention?, levels?, components?, compliance? }
 */
router.put(
  '/config',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateBody({
    retention: { required: false, type: 'object' },
    levels: { required: false, type: 'array', items: { type: 'string' } },
    components: { required: false, type: 'array', items: { type: 'string' } },
    compliance: { required: false, type: 'object' }
  }),
  asyncHandler(auditController.updateAuditConfig)
);

// Audit maintenance

/**
 * @route   POST /api/v1/audit/maintenance/cleanup
 * @desc    Cleanup old audit logs
 * @access  Private (Admin)
 * @body    { olderThan?, dryRun? }
 */
router.post(
  '/maintenance/cleanup',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Very limited cleanup operations
    message: 'Too many cleanup requests'
  }),
  validationMiddleware.validateBody({
    olderThan: { required: false, type: 'string', format: 'date-time' },
    dryRun: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.cleanupAuditLogs)
);

/**
 * @route   POST /api/v1/audit/maintenance/archive
 * @desc    Archive old audit logs
 * @access  Private (Admin)
 * @body    { olderThan?, destination?, compress? }
 */
router.post(
  '/maintenance/archive',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limited archive operations
    message: 'Too many archive requests'
  }),
  validationMiddleware.validateBody({
    olderThan: { required: false, type: 'string', format: 'date-time' },
    destination: { required: false, type: 'string' },
    compress: { required: false, type: 'boolean' }
  }),
  asyncHandler(auditController.archiveAuditLogs)
);

/**
 * @route   GET /api/v1/audit/maintenance/status
 * @desc    Get audit maintenance status
 * @access  Private (Admin)
 */
router.get(
  '/maintenance/status',
  authMiddleware.requireRole('admin'),
  asyncHandler(auditController.getMaintenanceStatus)
);

// Export the router
export { router as auditRoutes };

// Export route information for documentation
export const auditRouteInfo = {
  basePath: '/audit',
  routes: [
    {
      method: 'GET',
      path: '/logs',
      description: 'Get audit logs with filtering and pagination',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/logs/:logId',
      description: 'Get specific audit log entry',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/users/:userId/activity',
      description: 'Get user activity history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/users/activity/summary',
      description: 'Get user activity summary',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/resources/:resourceType/:resourceId/activity',
      description: 'Get activity history for a specific resource',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/resources/activity/summary',
      description: 'Get resource activity summary',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/security/events',
      description: 'Get security-related audit events',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/security/summary',
      description: 'Get security audit summary',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/security/failed-logins',
      description: 'Get failed login attempts',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/data-access',
      description: 'Get data access audit logs',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/data-access/summary',
      description: 'Get data access summary',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/system/events',
      description: 'Get system-level audit events',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/system/performance',
      description: 'Get system performance audit data',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/compliance/report',
      description: 'Generate compliance audit report',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/compliance/violations',
      description: 'Get compliance violations',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/search',
      description: 'Advanced audit log search',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get audit analytics',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'POST',
      path: '/export',
      description: 'Export audit logs',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/export/:exportId',
      description: 'Get audit export status',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/export/:exportId/download',
      description: 'Download audit export file',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/config',
      description: 'Get audit configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/config',
      description: 'Update audit configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/maintenance/cleanup',
      description: 'Cleanup old audit logs',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/maintenance/archive',
      description: 'Archive old audit logs',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/maintenance/status',
      description: 'Get audit maintenance status',
      auth: true,
      permissions: [],
      roles: ['admin']
    }
  ]
};