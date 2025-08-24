/**
 * Analytics Routes
 * Defines all analytics and reporting endpoints for data insights
 */

import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const analyticsService = new AnalyticsService();
const analyticsController = new AnalyticsController(analyticsService);

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Apply rate limiting for analytics operations
const analyticsRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit analytics requests per minute
  message: 'Too many analytics requests'
});

const heavyAnalyticsRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Very limited heavy analytics
  message: 'Too many heavy analytics requests'
});

// Dashboard analytics

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard analytics overview
 * @access  Private
 * @query   timeRange?, organizationId?
 */
router.get(
  '/dashboard',
  analyticsRateLimit,
  cacheMiddleware.cache(5 * 60), // Cache for 5 minutes
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    organizationId: { required: false, type: 'string' }
  }),
  asyncHandler(analyticsController.getDashboardAnalytics)
);

/**
 * @route   GET /api/v1/analytics/summary
 * @desc    Get analytics summary with key metrics
 * @access  Private
 * @query   timeRange?, metrics?
 */
router.get(
  '/summary',
  analyticsRateLimit,
  cacheMiddleware.cache(10 * 60), // Cache for 10 minutes
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    metrics: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(analyticsController.getAnalyticsSummary)
);

// Inspection analytics

/**
 * @route   GET /api/v1/analytics/inspections
 * @desc    Get inspection analytics
 * @access  Private
 * @query   timeRange?, folderId?, assetId?, status?, groupBy?, includeDetails?
 */
router.get(
  '/inspections',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60), // Cache for 15 minutes
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    folderId: { required: false, type: 'string' },
    assetId: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month', 'status', 'folder', 'asset'] },
    includeDetails: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getInspectionAnalytics)
);

/**
 * @route   GET /api/v1/analytics/inspections/trends
 * @desc    Get inspection trends over time
 * @access  Private
 * @query   timeRange?, metric?, groupBy?
 */
router.get(
  '/inspections/trends',
  analyticsRateLimit,
  cacheMiddleware.cache(20 * 60), // Cache for 20 minutes
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d', '1y'] },
    metric: { required: false, type: 'string', enum: ['count', 'completion_rate', 'avg_score', 'defects'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month'] }
  }),
  asyncHandler(analyticsController.getInspectionTrends)
);

/**
 * @route   GET /api/v1/analytics/inspections/performance
 * @desc    Get inspection performance metrics
 * @access  Private
 * @query   timeRange?, userId?, folderId?, includeComparisons?
 */
router.get(
  '/inspections/performance',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d', '1y'] },
    userId: { required: false, type: 'string' },
    folderId: { required: false, type: 'string' },
    includeComparisons: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getInspectionPerformance)
);

/**
 * @route   GET /api/v1/analytics/inspections/defects
 * @desc    Get defect analytics from inspections
 * @access  Private
 * @query   timeRange?, severity?, category?, assetType?, groupBy?
 */
router.get(
  '/inspections/defects',
  analyticsRateLimit,
  cacheMiddleware.cache(20 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d', '1y'] },
    severity: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    category: { required: false, type: 'string' },
    assetType: { required: false, type: 'string' },
    groupBy: { required: false, type: 'string', enum: ['severity', 'category', 'asset_type', 'time'] }
  }),
  asyncHandler(analyticsController.getDefectAnalytics)
);

// Asset analytics

/**
 * @route   GET /api/v1/analytics/assets
 * @desc    Get asset analytics
 * @access  Private
 * @query   timeRange?, assetType?, location?, status?, groupBy?
 */
router.get(
  '/assets',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    assetType: { required: false, type: 'string' },
    location: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['active', 'inactive', 'maintenance', 'retired'] },
    groupBy: { required: false, type: 'string', enum: ['type', 'location', 'status', 'age'] }
  }),
  asyncHandler(analyticsController.getAssetAnalytics)
);

/**
 * @route   GET /api/v1/analytics/assets/utilization
 * @desc    Get asset utilization analytics
 * @access  Private
 * @query   timeRange?, assetId?, assetType?, threshold?
 */
router.get(
  '/assets/utilization',
  analyticsRateLimit,
  cacheMiddleware.cache(20 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    assetId: { required: false, type: 'string' },
    assetType: { required: false, type: 'string' },
    threshold: { required: false, type: 'number', min: 0, max: 100 }
  }),
  asyncHandler(analyticsController.getAssetUtilization)
);

/**
 * @route   GET /api/v1/analytics/assets/maintenance
 * @desc    Get asset maintenance analytics
 * @access  Private
 * @query   timeRange?, assetId?, maintenanceType?, status?
 */
router.get(
  '/assets/maintenance',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    assetId: { required: false, type: 'string' },
    maintenanceType: { required: false, type: 'string', enum: ['preventive', 'corrective', 'emergency'] },
    status: { required: false, type: 'string', enum: ['scheduled', 'in_progress', 'completed', 'overdue'] }
  }),
  asyncHandler(analyticsController.getAssetMaintenanceAnalytics)
);

// User analytics

/**
 * @route   GET /api/v1/analytics/users
 * @desc    Get user analytics
 * @access  Private (Manager+)
 * @query   timeRange?, role?, teamId?, includeActivity?
 */
router.get(
  '/users',
  authMiddleware.requireRole(['manager', 'admin']),
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d', '1y'] },
    role: { required: false, type: 'string' },
    teamId: { required: false, type: 'string' },
    includeActivity: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getUserAnalytics)
);

/**
 * @route   GET /api/v1/analytics/users/productivity
 * @desc    Get user productivity analytics
 * @access  Private (Manager+)
 * @query   timeRange?, userId?, teamId?, metric?
 */
router.get(
  '/users/productivity',
  authMiddleware.requireRole(['manager', 'admin']),
  analyticsRateLimit,
  cacheMiddleware.cache(20 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d'] },
    userId: { required: false, type: 'string' },
    teamId: { required: false, type: 'string' },
    metric: { required: false, type: 'string', enum: ['inspections_completed', 'avg_time', 'quality_score'] }
  }),
  asyncHandler(analyticsController.getUserProductivity)
);

// Form analytics

/**
 * @route   GET /api/v1/analytics/forms
 * @desc    Get form analytics
 * @access  Private
 * @query   timeRange?, formId?, category?, includeResponses?
 */
router.get(
  '/forms',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    formId: { required: false, type: 'string' },
    category: { required: false, type: 'string' },
    includeResponses: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getFormAnalytics)
);

/**
 * @route   GET /api/v1/analytics/forms/responses
 * @desc    Get form response analytics
 * @access  Private
 * @query   formId, timeRange?, groupBy?, includeDetails?
 */
router.get(
  '/forms/responses',
  analyticsRateLimit,
  cacheMiddleware.cache(10 * 60),
  validationMiddleware.validateQuery({
    formId: { required: true, type: 'string' },
    timeRange: { required: false, type: 'string', enum: ['7d', '30d', '90d'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'question', 'user'] },
    includeDetails: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getFormResponseAnalytics)
);

// Report analytics

/**
 * @route   GET /api/v1/analytics/reports
 * @desc    Get report analytics
 * @access  Private
 * @query   timeRange?, reportType?, status?, includeGeneration?
 */
router.get(
  '/reports',
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    reportType: { required: false, type: 'string' },
    status: { required: false, type: 'string', enum: ['pending', 'generating', 'completed', 'failed'] },
    includeGeneration: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getReportAnalytics)
);

// Custom analytics

/**
 * @route   POST /api/v1/analytics/custom
 * @desc    Run custom analytics query
 * @access  Private (Manager+)
 * @body    { query, parameters?, cacheKey? }
 */
router.post(
  '/custom',
  authMiddleware.requireRole(['manager', 'admin']),
  heavyAnalyticsRateLimit,
  validationMiddleware.validateBody({
    query: { required: true, type: 'object' },
    parameters: { required: false, type: 'object' },
    cacheKey: { required: false, type: 'string', maxLength: 100 }
  }),
  asyncHandler(analyticsController.runCustomAnalytics)
);

/**
 * @route   GET /api/v1/analytics/custom/saved
 * @desc    Get saved custom analytics queries
 * @access  Private (Manager+)
 * @query   category?, page?, limit?
 */
router.get(
  '/custom/saved',
  authMiddleware.requireRole(['manager', 'admin']),
  analyticsRateLimit,
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string' },
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 50 }
  }),
  asyncHandler(analyticsController.getSavedAnalytics)
);

/**
 * @route   POST /api/v1/analytics/custom/save
 * @desc    Save custom analytics query
 * @access  Private (Manager+)
 * @body    { name, description?, query, parameters?, category? }
 */
router.post(
  '/custom/save',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateBody({
    name: { required: true, type: 'string', maxLength: 100 },
    description: { required: false, type: 'string', maxLength: 500 },
    query: { required: true, type: 'object' },
    parameters: { required: false, type: 'object' },
    category: { required: false, type: 'string', maxLength: 50 }
  }),
  asyncHandler(analyticsController.saveCustomAnalytics)
);

// Export analytics

/**
 * @route   POST /api/v1/analytics/export
 * @desc    Export analytics data
 * @access  Private
 * @body    { type, format, filters?, includeCharts? }
 */
router.post(
  '/export',
  heavyAnalyticsRateLimit,
  validationMiddleware.validateBody({
    type: { required: true, type: 'string', enum: ['dashboard', 'inspections', 'assets', 'users', 'forms', 'reports', 'custom'] },
    format: { required: true, type: 'string', enum: ['csv', 'xlsx', 'pdf', 'json'] },
    filters: { required: false, type: 'object' },
    includeCharts: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.exportAnalytics)
);

/**
 * @route   GET /api/v1/analytics/export/:exportId
 * @desc    Get export status and download link
 * @access  Private
 * @params  exportId
 */
router.get(
  '/export/:exportId',
  validationMiddleware.validateParams({
    exportId: { required: true, type: 'string' }
  }),
  asyncHandler(analyticsController.getExportStatus)
);

/**
 * @route   GET /api/v1/analytics/export/:exportId/download
 * @desc    Download exported analytics file
 * @access  Private
 * @params  exportId
 */
router.get(
  '/export/:exportId/download',
  validationMiddleware.validateParams({
    exportId: { required: true, type: 'string' }
  }),
  asyncHandler(analyticsController.downloadExport)
);

// Real-time analytics

/**
 * @route   GET /api/v1/analytics/realtime
 * @desc    Get real-time analytics data
 * @access  Private
 * @query   metrics?, interval?
 */
router.get(
  '/realtime',
  analyticsRateLimit,
  validationMiddleware.validateQuery({
    metrics: { required: false, type: 'array', items: { type: 'string' } },
    interval: { required: false, type: 'number', min: 5, max: 300 } // 5 seconds to 5 minutes
  }),
  asyncHandler(analyticsController.getRealtimeAnalytics)
);

/**
 * @route   GET /api/v1/analytics/alerts
 * @desc    Get analytics alerts and thresholds
 * @access  Private (Manager+)
 * @query   active?, category?, severity?
 */
router.get(
  '/alerts',
  authMiddleware.requireRole(['manager', 'admin']),
  analyticsRateLimit,
  validationMiddleware.validateQuery({
    active: { required: false, type: 'boolean' },
    category: { required: false, type: 'string' },
    severity: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
  }),
  asyncHandler(analyticsController.getAnalyticsAlerts)
);

/**
 * @route   POST /api/v1/analytics/alerts
 * @desc    Create analytics alert
 * @access  Private (Manager+)
 * @body    { name, description?, metric, threshold, condition, actions }
 */
router.post(
  '/alerts',
  authMiddleware.requireRole(['manager', 'admin']),
  validationMiddleware.validateBody({
    name: { required: true, type: 'string', maxLength: 100 },
    description: { required: false, type: 'string', maxLength: 500 },
    metric: { required: true, type: 'string' },
    threshold: { required: true, type: 'number' },
    condition: { required: true, type: 'string', enum: ['greater_than', 'less_than', 'equals', 'not_equals'] },
    actions: { required: true, type: 'array', items: { type: 'object' } }
  }),
  asyncHandler(analyticsController.createAnalyticsAlert)
);

// Predictive analytics

/**
 * @route   GET /api/v1/analytics/predictions
 * @desc    Get predictive analytics
 * @access  Private (Manager+)
 * @query   type, timeHorizon?, confidence?
 */
router.get(
  '/predictions',
  authMiddleware.requireRole(['manager', 'admin']),
  heavyAnalyticsRateLimit,
  cacheMiddleware.cache(60 * 60), // Cache for 1 hour
  validationMiddleware.validateQuery({
    type: { required: true, type: 'string', enum: ['inspection_volume', 'defect_trends', 'asset_failures', 'maintenance_needs'] },
    timeHorizon: { required: false, type: 'string', enum: ['7d', '30d', '90d'] },
    confidence: { required: false, type: 'number', min: 0.5, max: 0.99 }
  }),
  asyncHandler(analyticsController.getPredictiveAnalytics)
);

// Benchmarking

/**
 * @route   GET /api/v1/analytics/benchmarks
 * @desc    Get benchmarking data
 * @access  Private (Manager+)
 * @query   category?, timeRange?, includeIndustry?
 */
router.get(
  '/benchmarks',
  authMiddleware.requireRole(['manager', 'admin']),
  analyticsRateLimit,
  cacheMiddleware.cache(24 * 60 * 60), // Cache for 24 hours
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', enum: ['inspections', 'assets', 'users', 'quality'] },
    timeRange: { required: false, type: 'string', enum: ['30d', '90d', '1y'] },
    includeIndustry: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getBenchmarkData)
);

// Admin analytics

/**
 * @route   GET /api/v1/analytics/admin/system
 * @desc    Get system analytics (admin only)
 * @access  Private (Admin)
 * @query   timeRange?, includePerformance?
 */
router.get(
  '/admin/system',
  authMiddleware.requireRole('admin'),
  analyticsRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['1h', '24h', '7d', '30d'] },
    includePerformance: { required: false, type: 'boolean' }
  }),
  asyncHandler(analyticsController.getSystemAnalytics)
);

/**
 * @route   GET /api/v1/analytics/admin/usage
 * @desc    Get usage analytics (admin only)
 * @access  Private (Admin)
 * @query   timeRange?, organizationId?, feature?
 */
router.get(
  '/admin/usage',
  authMiddleware.requireRole('admin'),
  analyticsRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    organizationId: { required: false, type: 'string' },
    feature: { required: false, type: 'string' }
  }),
  asyncHandler(analyticsController.getUsageAnalytics)
);

// Export the router
export { router as analyticsRoutes };

// Export route information for documentation
export const analyticsRouteInfo = {
  basePath: '/analytics',
  routes: [
    {
      method: 'GET',
      path: '/dashboard',
      description: 'Get dashboard analytics overview',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/summary',
      description: 'Get analytics summary with key metrics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/inspections',
      description: 'Get inspection analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/inspections/trends',
      description: 'Get inspection trends over time',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/inspections/performance',
      description: 'Get inspection performance metrics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/inspections/defects',
      description: 'Get defect analytics from inspections',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/assets',
      description: 'Get asset analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/assets/utilization',
      description: 'Get asset utilization analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/assets/maintenance',
      description: 'Get asset maintenance analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/users',
      description: 'Get user analytics',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/users/productivity',
      description: 'Get user productivity analytics',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/forms',
      description: 'Get form analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/forms/responses',
      description: 'Get form response analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/reports',
      description: 'Get report analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/custom',
      description: 'Run custom analytics query',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/custom/saved',
      description: 'Get saved custom analytics queries',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'POST',
      path: '/custom/save',
      description: 'Save custom analytics query',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'POST',
      path: '/export',
      description: 'Export analytics data',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/export/:exportId',
      description: 'Get export status and download link',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/export/:exportId/download',
      description: 'Download exported analytics file',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/realtime',
      description: 'Get real-time analytics data',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/alerts',
      description: 'Get analytics alerts and thresholds',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'POST',
      path: '/alerts',
      description: 'Create analytics alert',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/predictions',
      description: 'Get predictive analytics',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/benchmarks',
      description: 'Get benchmarking data',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/admin/system',
      description: 'Get system analytics (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/admin/usage',
      description: 'Get usage analytics (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    }
  ]
};