/**
 * Report Routes
 * Defines all report generation and management endpoints
 */

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { ReportService } from '../services/report.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { reportValidationSchemas } from '../controllers/report.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const reportService = new ReportService();
const reportController = new ReportController(reportService);

// Report CRUD operations

/**
 * @route   GET /api/v1/reports
 * @desc    Get all reports with filtering and pagination
 * @access  Private
 * @query   page?, limit?, search?, type?, status?, createdBy?, startDate?, endDate?, sortBy?, sortOrder?
 */
router.get(
  '/',
  validationMiddleware.validateQuery(reportValidationSchemas.getReportsQuery),
  asyncHandler(reportController.getReports)
);

/**
 * @route   GET /api/v1/reports/:id
 * @desc    Get report by ID
 * @access  Private
 * @params  id
 */
router.get(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.getReportById)
);

/**
 * @route   POST /api/v1/reports/generate
 * @desc    Generate new report
 * @access  Private
 * @body    { type, title?, description?, filters?, templateId?, format?, settings? }
 */
router.post(
  '/generate',
  authMiddleware.requirePermission('reports.create'),
  rateLimitMiddleware.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit report generation
    message: 'Too many report generation requests'
  }),
  validationMiddleware.validateBody(reportValidationSchemas.generateReport),
  asyncHandler(reportController.generateReport)
);

/**
 * @route   PUT /api/v1/reports/:id
 * @desc    Update report
 * @access  Private
 * @params  id
 * @body    { title?, description?, settings? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('reports.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(reportValidationSchemas.updateReport),
  asyncHandler(reportController.updateReport)
);

/**
 * @route   DELETE /api/v1/reports/:id
 * @desc    Delete report
 * @access  Private
 * @params  id
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('reports.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.deleteReport)
);

/**
 * @route   POST /api/v1/reports/:id/duplicate
 * @desc    Duplicate report
 * @access  Private
 * @params  id
 * @body    { title?, description? }
 */
router.post(
  '/:id/duplicate',
  authMiddleware.requirePermission('reports.create'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    title: { required: false, type: 'string', maxLength: 200 },
    description: { required: false, type: 'string', maxLength: 1000 }
  }),
  asyncHandler(reportController.duplicateReport)
);

// Report download and preview

/**
 * @route   GET /api/v1/reports/:id/download
 * @desc    Download report
 * @access  Private
 * @params  id
 * @query   format?
 */
router.get(
  '/:id/download',
  authMiddleware.requirePermission('reports.read'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['pdf', 'xlsx', 'csv', 'docx'] }
  }),
  asyncHandler(reportController.downloadReport)
);

/**
 * @route   GET /api/v1/reports/:id/preview
 * @desc    Preview report
 * @access  Private
 * @params  id
 * @query   format?
 */
router.get(
  '/:id/preview',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['html', 'json'] }
  }),
  asyncHandler(reportController.previewReport)
);

// Report sharing

/**
 * @route   POST /api/v1/reports/:id/share
 * @desc    Share report
 * @access  Private
 * @params  id
 * @body    { recipients, message?, expiresAt?, permissions? }
 */
router.post(
  '/:id/share',
  authMiddleware.requirePermission('reports.share'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(reportValidationSchemas.shareReport),
  asyncHandler(reportController.shareReport)
);

// Report scheduling

/**
 * @route   POST /api/v1/reports/schedule
 * @desc    Schedule report generation
 * @access  Private
 * @body    { reportConfig, schedule, recipients?, settings? }
 */
router.post(
  '/schedule',
  authMiddleware.requirePermission('reports.schedule'),
  validationMiddleware.validateBody(reportValidationSchemas.scheduleReport),
  asyncHandler(reportController.scheduleReport)
);

/**
 * @route   GET /api/v1/reports/schedules
 * @desc    Get report schedules
 * @access  Private
 * @query   page?, limit?, status?, createdBy?
 */
router.get(
  '/schedules',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string', enum: ['active', 'paused', 'disabled'] },
    createdBy: { required: false, type: 'string' }
  }),
  asyncHandler(reportController.getReportSchedules)
);

/**
 * @route   GET /api/v1/reports/schedules/:scheduleId
 * @desc    Get report schedule by ID
 * @access  Private
 * @params  scheduleId
 */
router.get(
  '/schedules/:scheduleId',
  validationMiddleware.validateParams({
    scheduleId: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.getReportScheduleById)
);

/**
 * @route   PUT /api/v1/reports/schedules/:scheduleId
 * @desc    Update report schedule
 * @access  Private
 * @params  scheduleId
 * @body    { schedule?, recipients?, settings?, status? }
 */
router.put(
  '/schedules/:scheduleId',
  authMiddleware.requirePermission('reports.schedule'),
  validationMiddleware.validateParams({
    scheduleId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    schedule: { required: false, type: 'object' },
    recipients: { required: false, type: 'array' },
    settings: { required: false, type: 'object' },
    status: { required: false, type: 'string', enum: ['active', 'paused', 'disabled'] }
  }),
  asyncHandler(reportController.updateReportSchedule)
);

/**
 * @route   DELETE /api/v1/reports/schedules/:scheduleId
 * @desc    Delete report schedule
 * @access  Private
 * @params  scheduleId
 */
router.delete(
  '/schedules/:scheduleId',
  authMiddleware.requirePermission('reports.schedule'),
  validationMiddleware.validateParams({
    scheduleId: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.deleteReportSchedule)
);

// Report analytics

/**
 * @route   GET /api/v1/reports/analytics
 * @desc    Get report analytics
 * @access  Private
 * @query   timeRange?, groupBy?, type?
 */
router.get(
  '/analytics',
  authMiddleware.requirePermission('reports.analytics'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month', 'type', 'user'] },
    type: { required: false, type: 'string' }
  }),
  asyncHandler(reportController.getReportAnalytics)
);

// Report templates

/**
 * @route   GET /api/v1/reports/templates
 * @desc    Get report templates
 * @access  Private
 * @query   page?, limit?, category?, search?
 */
router.get(
  '/templates',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    category: { required: false, type: 'string' },
    search: { required: false, type: 'string' }
  }),
  asyncHandler(reportController.getReportTemplates)
);

/**
 * @route   GET /api/v1/reports/templates/:templateId
 * @desc    Get report template by ID
 * @access  Private
 * @params  templateId
 */
router.get(
  '/templates/:templateId',
  validationMiddleware.validateParams({
    templateId: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.getReportTemplateById)
);

/**
 * @route   POST /api/v1/reports/templates
 * @desc    Create report template
 * @access  Private
 * @body    { name, description?, category?, config, isPublic? }
 */
router.post(
  '/templates',
  authMiddleware.requirePermission('reports.templates.create'),
  validationMiddleware.validateBody(reportValidationSchemas.createReportTemplate),
  asyncHandler(reportController.createReportTemplate)
);

/**
 * @route   PUT /api/v1/reports/templates/:templateId
 * @desc    Update report template
 * @access  Private
 * @params  templateId
 * @body    { name?, description?, category?, config?, isPublic? }
 */
router.put(
  '/templates/:templateId',
  authMiddleware.requirePermission('reports.templates.update'),
  validationMiddleware.validateParams({
    templateId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    name: { required: false, type: 'string', maxLength: 100 },
    description: { required: false, type: 'string', maxLength: 500 },
    category: { required: false, type: 'string', maxLength: 50 },
    config: { required: false, type: 'object' },
    isPublic: { required: false, type: 'boolean' }
  }),
  asyncHandler(reportController.updateReportTemplate)
);

/**
 * @route   DELETE /api/v1/reports/templates/:templateId
 * @desc    Delete report template
 * @access  Private
 * @params  templateId
 */
router.delete(
  '/templates/:templateId',
  authMiddleware.requirePermission('reports.templates.delete'),
  validationMiddleware.validateParams({
    templateId: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.deleteReportTemplate)
);

// Report generation status and control

/**
 * @route   GET /api/v1/reports/:id/status
 * @desc    Get report generation status
 * @access  Private
 * @params  id
 */
router.get(
  '/:id/status',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.getReportStatus)
);

/**
 * @route   POST /api/v1/reports/:id/cancel
 * @desc    Cancel report generation
 * @access  Private
 * @params  id
 */
router.post(
  '/:id/cancel',
  authMiddleware.requirePermission('reports.cancel'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(reportController.cancelReportGeneration)
);

/**
 * @route   POST /api/v1/reports/:id/regenerate
 * @desc    Regenerate report
 * @access  Private
 * @params  id
 * @body    { filters?, settings? }
 */
router.post(
  '/:id/regenerate',
  authMiddleware.requirePermission('reports.create'),
  rateLimitMiddleware.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit regeneration
    message: 'Too many report regeneration requests'
  }),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    filters: { required: false, type: 'object' },
    settings: { required: false, type: 'object' }
  }),
  asyncHandler(reportController.regenerateReport)
);

// Bulk operations

/**
 * @route   POST /api/v1/reports/export
 * @desc    Export multiple reports
 * @access  Private
 * @body    { reportIds, format?, includeData? }
 */
router.post(
  '/export',
  authMiddleware.requirePermission('reports.read'),
  validationMiddleware.validateBody({
    reportIds: { required: true, type: 'array', items: { type: 'string' } },
    format: { required: false, type: 'string', enum: ['zip', 'pdf', 'xlsx'] },
    includeData: { required: false, type: 'boolean' }
  }),
  asyncHandler(reportController.exportReports)
);

/**
 * @route   POST /api/v1/reports/bulk-delete
 * @desc    Bulk delete reports
 * @access  Private
 * @body    { reportIds }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('reports.delete'),
  validationMiddleware.validateBody({
    reportIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(reportController.bulkDeleteReports)
);

/**
 * @route   POST /api/v1/reports/bulk-share
 * @desc    Bulk share reports
 * @access  Private
 * @body    { reportIds, recipients, message?, expiresAt? }
 */
router.post(
  '/bulk-share',
  authMiddleware.requirePermission('reports.share'),
  validationMiddleware.validateBody({
    reportIds: { required: true, type: 'array', items: { type: 'string' } },
    recipients: { required: true, type: 'array', items: { type: 'string' } },
    message: { required: false, type: 'string', maxLength: 500 },
    expiresAt: { required: false, type: 'string', format: 'date-time' }
  }),
  asyncHandler(reportController.bulkShareReports)
);

/**
 * @route   POST /api/v1/reports/bulk-regenerate
 * @desc    Bulk regenerate reports
 * @access  Private
 * @body    { reportIds, settings? }
 */
router.post(
  '/bulk-regenerate',
  authMiddleware.requirePermission('reports.create'),
  rateLimitMiddleware.createLimiter({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Very limited bulk regeneration
    message: 'Too many bulk regeneration requests'
  }),
  validationMiddleware.validateBody({
    reportIds: { required: true, type: 'array', items: { type: 'string' } },
    settings: { required: false, type: 'object' }
  }),
  asyncHandler(reportController.bulkRegenerateReports)
);

// Report history

/**
 * @route   GET /api/v1/reports/:id/history
 * @desc    Get report history
 * @access  Private
 * @params  id
 * @query   page?, limit?
 */
router.get(
  '/:id/history',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 }
  }),
  asyncHandler(reportController.getReportHistory)
);

// Health check for report service
/**
 * @route   GET /api/v1/reports/health
 * @desc    Report service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'reports',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as reportRoutes };

// Export route information for documentation
export const reportRouteInfo = {
  basePath: '/reports',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get all reports with filtering',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get report by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/generate',
      description: 'Generate new report',
      auth: true,
      permissions: ['reports.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update report',
      auth: true,
      permissions: ['reports.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete report',
      auth: true,
      permissions: ['reports.delete']
    },
    {
      method: 'POST',
      path: '/:id/duplicate',
      description: 'Duplicate report',
      auth: true,
      permissions: ['reports.create']
    },
    {
      method: 'GET',
      path: '/:id/download',
      description: 'Download report',
      auth: true,
      permissions: ['reports.read']
    },
    {
      method: 'GET',
      path: '/:id/preview',
      description: 'Preview report',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/share',
      description: 'Share report',
      auth: true,
      permissions: ['reports.share']
    },
    {
      method: 'POST',
      path: '/schedule',
      description: 'Schedule report generation',
      auth: true,
      permissions: ['reports.schedule']
    },
    {
      method: 'GET',
      path: '/schedules',
      description: 'Get report schedules',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/schedules/:scheduleId',
      description: 'Get report schedule by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/schedules/:scheduleId',
      description: 'Update report schedule',
      auth: true,
      permissions: ['reports.schedule']
    },
    {
      method: 'DELETE',
      path: '/schedules/:scheduleId',
      description: 'Delete report schedule',
      auth: true,
      permissions: ['reports.schedule']
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get report analytics',
      auth: true,
      permissions: ['reports.analytics']
    },
    {
      method: 'GET',
      path: '/templates',
      description: 'Get report templates',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/templates/:templateId',
      description: 'Get report template by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/templates',
      description: 'Create report template',
      auth: true,
      permissions: ['reports.templates.create']
    },
    {
      method: 'PUT',
      path: '/templates/:templateId',
      description: 'Update report template',
      auth: true,
      permissions: ['reports.templates.update']
    },
    {
      method: 'DELETE',
      path: '/templates/:templateId',
      description: 'Delete report template',
      auth: true,
      permissions: ['reports.templates.delete']
    },
    {
      method: 'GET',
      path: '/:id/status',
      description: 'Get report generation status',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/cancel',
      description: 'Cancel report generation',
      auth: true,
      permissions: ['reports.cancel']
    },
    {
      method: 'POST',
      path: '/:id/regenerate',
      description: 'Regenerate report',
      auth: true,
      permissions: ['reports.create']
    },
    {
      method: 'POST',
      path: '/export',
      description: 'Export multiple reports',
      auth: true,
      permissions: ['reports.read']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete reports',
      auth: true,
      permissions: ['reports.delete']
    },
    {
      method: 'POST',
      path: '/bulk-share',
      description: 'Bulk share reports',
      auth: true,
      permissions: ['reports.share']
    },
    {
      method: 'POST',
      path: '/bulk-regenerate',
      description: 'Bulk regenerate reports',
      auth: true,
      permissions: ['reports.create']
    },
    {
      method: 'GET',
      path: '/:id/history',
      description: 'Get report history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Report service health check',
      auth: true,
      permissions: []
    }
  ]
};