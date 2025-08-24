/**
 * Inspection Routes
 * Defines all inspection management endpoints
 */

import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { InspectionService } from '../services/inspection.service';
import { FileService } from '../services/file.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { inspectionValidationSchemas } from '../controllers/inspection.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const inspectionService = new InspectionService();
const fileService = new FileService();
const inspectionController = new InspectionController(inspectionService, fileService);

// Inspection CRUD operations

/**
 * @swagger
 * /api/v1/inspections:
 *   get:
 *     tags: [Inspections]
 *     summary: Get all inspections
 *     description: Retrieve inspections with filtering, pagination, and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, in_progress, completed, cancelled]
 *         description: Filter by inspection status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority level
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *         description: Filter by folder ID
 *       - in: query
 *         name: assetId
 *         schema:
 *           type: string
 *         description: Filter by asset ID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *     responses:
 *       200:
 *         description: Inspections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inspection'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/',
  validationMiddleware.validateQuery(inspectionValidationSchemas.getInspectionsQuery),
  asyncHandler(inspectionController.getInspections)
);

/**
 * @swagger
 * /api/v1/inspections/{id}:
 *   get:
 *     tags: [Inspections]
 *     summary: Get inspection by ID
 *     description: Retrieve a specific inspection with optional history and photos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inspection ID
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inspection history
 *       - in: query
 *         name: includePhotos
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inspection photos
 *     responses:
 *       200:
 *         description: Inspection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InspectionDetailed'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Inspection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    includeHistory: { required: false, type: 'boolean' },
    includePhotos: { required: false, type: 'boolean' }
  }),
  asyncHandler(inspectionController.getInspectionById)
);

/**
 * @swagger
 * /api/v1/inspections:
 *   post:
 *     tags: [Inspections]
 *     summary: Create new inspection
 *     description: Create a new inspection with form template and assignment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, folderId]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Inspection title
 *               description:
 *                 type: string
 *                 description: Optional inspection description
 *               folderId:
 *                 type: string
 *                 description: Folder ID where inspection belongs
 *               assetId:
 *                 type: string
 *                 description: Optional asset ID being inspected
 *               formTemplateId:
 *                 type: string
 *                 description: Form template ID to use
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign inspection to
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Inspection priority level
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled date for inspection
 *           example:
 *             title: "Monthly Safety Inspection"
 *             description: "Routine safety check for equipment"
 *             folderId: "folder_123"
 *             assetId: "asset_456"
 *             formTemplateId: "template_789"
 *             assignedTo: "user_101"
 *             priority: "high"
 *             scheduledDate: "2024-02-15T10:00:00Z"
 *     responses:
 *       201:
 *         description: Inspection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Inspection'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  authMiddleware.requirePermission('inspections.create'),
  validationMiddleware.validateBody(inspectionValidationSchemas.createInspection),
  asyncHandler(inspectionController.createInspection)
);

/**
 * @route   PUT /api/v1/inspections/:id
 * @desc    Update inspection
 * @access  Private
 * @params  id
 * @body    { title?, description?, priority?, assignedTo?, scheduledDate?, responses? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(inspectionValidationSchemas.updateInspection),
  asyncHandler(inspectionController.updateInspection)
);

/**
 * @route   DELETE /api/v1/inspections/:id
 * @desc    Delete inspection
 * @access  Private
 * @params  id
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('inspections.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(inspectionController.deleteInspection)
);

// Inspection workflow operations

/**
 * @route   POST /api/v1/inspections/:id/complete
 * @desc    Complete inspection
 * @access  Private
 * @params  id
 * @body    { responses?, notes?, photos? }
 */
router.post(
  '/:id/complete',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(inspectionValidationSchemas.completeInspection),
  asyncHandler(inspectionController.completeInspection)
);

/**
 * @route   POST /api/v1/inspections/:id/cancel
 * @desc    Cancel inspection
 * @access  Private
 * @params  id
 * @body    { reason? }
 */
router.post(
  '/:id/cancel',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    reason: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.cancelInspection)
);

/**
 * @route   POST /api/v1/inspections/:id/duplicate
 * @desc    Duplicate inspection
 * @access  Private
 * @params  id
 * @body    { title?, scheduledDate?, assignedTo? }
 */
router.post(
  '/:id/duplicate',
  authMiddleware.requirePermission('inspections.create'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    title: { required: false, type: 'string', maxLength: 200 },
    scheduledDate: { required: false, type: 'string', format: 'date-time' },
    assignedTo: { required: false, type: 'string' }
  }),
  asyncHandler(inspectionController.duplicateInspection)
);

// Photo management

/**
 * @route   POST /api/v1/inspections/:id/photos
 * @desc    Upload inspection photos
 * @access  Private
 * @params  id
 * @body    FormData with 'photos' files
 */
router.post(
  '/:id/photos',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  uploadMiddleware.array('photos', 20),
  asyncHandler(inspectionController.uploadInspectionPhotos)
);

/**
 * @route   DELETE /api/v1/inspections/:id/photos/:photoId
 * @desc    Delete inspection photo
 * @access  Private
 * @params  id, photoId
 */
router.delete(
  '/:id/photos/:photoId',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' },
    photoId: { required: true, type: 'string' }
  }),
  asyncHandler(inspectionController.deleteInspectionPhoto)
);

// Assignment management

/**
 * @route   POST /api/v1/inspections/:id/assign
 * @desc    Assign inspection to user
 * @access  Private
 * @params  id
 * @body    { userId, notes? }
 */
router.post(
  '/:id/assign',
  authMiddleware.requirePermission('inspections.assign'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    userId: { required: true, type: 'string' },
    notes: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.assignInspection)
);

/**
 * @route   POST /api/v1/inspections/:id/unassign
 * @desc    Unassign inspection
 * @access  Private
 * @params  id
 * @body    { reason? }
 */
router.post(
  '/:id/unassign',
  authMiddleware.requirePermission('inspections.assign'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    reason: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.unassignInspection)
);

/**
 * @route   GET /api/v1/inspections/my-inspections
 * @desc    Get inspections assigned to current user
 * @access  Private
 * @query   page?, limit?, status?, priority?, startDate?, endDate?
 */
router.get(
  '/my-inspections',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string' },
    priority: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(inspectionController.getMyInspections)
);

// Analytics and statistics

/**
 * @route   GET /api/v1/inspections/analytics
 * @desc    Get inspection analytics
 * @access  Private
 * @query   timeRange?, groupBy?, folderId?, assetId?, assignedTo?
 */
router.get(
  '/analytics',
  authMiddleware.requirePermission('inspections.read'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['status', 'priority', 'folder', 'asset', 'user', 'day', 'week', 'month'] },
    folderId: { required: false, type: 'string' },
    assetId: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' }
  }),
  asyncHandler(inspectionController.getInspectionAnalytics)
);

/**
 * @route   GET /api/v1/inspections/stats
 * @desc    Get inspection statistics
 * @access  Private
 * @query   timeRange?
 */
router.get(
  '/stats',
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] }
  }),
  asyncHandler(inspectionController.getInspectionStats)
);

// Bulk operations

/**
 * @route   POST /api/v1/inspections/bulk-assign
 * @desc    Bulk assign inspections
 * @access  Private
 * @body    { inspectionIds, userId, notes? }
 */
router.post(
  '/bulk-assign',
  authMiddleware.requirePermission('inspections.assign'),
  validationMiddleware.validateBody({
    inspectionIds: { required: true, type: 'array', items: { type: 'string' } },
    userId: { required: true, type: 'string' },
    notes: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.bulkAssignInspections)
);

/**
 * @route   POST /api/v1/inspections/bulk-unassign
 * @desc    Bulk unassign inspections
 * @access  Private
 * @body    { inspectionIds, reason? }
 */
router.post(
  '/bulk-unassign',
  authMiddleware.requirePermission('inspections.assign'),
  validationMiddleware.validateBody({
    inspectionIds: { required: true, type: 'array', items: { type: 'string' } },
    reason: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.bulkUnassignInspections)
);

/**
 * @route   POST /api/v1/inspections/bulk-delete
 * @desc    Bulk delete inspections
 * @access  Private
 * @body    { inspectionIds }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('inspections.delete'),
  validationMiddleware.validateBody({
    inspectionIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(inspectionController.bulkDeleteInspections)
);

/**
 * @route   POST /api/v1/inspections/bulk-complete
 * @desc    Bulk complete inspections
 * @access  Private
 * @body    { inspectionIds, notes? }
 */
router.post(
  '/bulk-complete',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateBody({
    inspectionIds: { required: true, type: 'array', items: { type: 'string' } },
    notes: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.bulkCompleteInspections)
);

/**
 * @route   POST /api/v1/inspections/bulk-cancel
 * @desc    Bulk cancel inspections
 * @access  Private
 * @body    { inspectionIds, reason? }
 */
router.post(
  '/bulk-cancel',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateBody({
    inspectionIds: { required: true, type: 'array', items: { type: 'string' } },
    reason: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(inspectionController.bulkCancelInspections)
);

/**
 * @route   POST /api/v1/inspections/bulk-update
 * @desc    Bulk update inspections
 * @access  Private
 * @body    { inspectionIds, updates }
 */
router.post(
  '/bulk-update',
  authMiddleware.requirePermission('inspections.update'),
  validationMiddleware.validateBody(inspectionValidationSchemas.bulkUpdate),
  asyncHandler(inspectionController.bulkUpdateInspections)
);

// Import/Export

/**
 * @route   GET /api/v1/inspections/export
 * @desc    Export inspections data
 * @access  Private
 * @query   format?, status?, priority?, folderId?, assetId?, assignedTo?, startDate?, endDate?
 */
router.get(
  '/export',
  authMiddleware.requirePermission('inspections.read'),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['csv', 'xlsx', 'json'] },
    status: { required: false, type: 'string' },
    priority: { required: false, type: 'string' },
    folderId: { required: false, type: 'string' },
    assetId: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(inspectionController.exportInspections)
);

// History and audit

/**
 * @route   GET /api/v1/inspections/:id/history
 * @desc    Get inspection history
 * @access  Private
 * @params  id
 * @query   page?, limit?, action?, startDate?, endDate?
 */
router.get(
  '/:id/history',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    action: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(inspectionController.getInspectionHistory)
);

// Folder and asset specific routes

/**
 * @route   GET /api/v1/inspections/folder/:folderId
 * @desc    Get inspections by folder
 * @access  Private
 * @params  folderId
 * @query   page?, limit?, status?, priority?, assignedTo?
 */
router.get(
  '/folder/:folderId',
  validationMiddleware.validateParams({
    folderId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string' },
    priority: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' }
  }),
  asyncHandler(inspectionController.getInspectionsByFolder)
);

/**
 * @route   GET /api/v1/inspections/asset/:assetId
 * @desc    Get inspections by asset
 * @access  Private
 * @params  assetId
 * @query   page?, limit?, status?, priority?, startDate?, endDate?
 */
router.get(
  '/asset/:assetId',
  validationMiddleware.validateParams({
    assetId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string' },
    priority: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(inspectionController.getInspectionsByAsset)
);

// Health check for inspection service
/**
 * @route   GET /api/v1/inspections/health
 * @desc    Inspection service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'inspections',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as inspectionRoutes };

// Export route information for documentation
export const inspectionRouteInfo = {
  basePath: '/inspections',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get all inspections with filtering',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get inspection by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/',
      description: 'Create new inspection',
      auth: true,
      permissions: ['inspections.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update inspection',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete inspection',
      auth: true,
      permissions: ['inspections.delete']
    },
    {
      method: 'POST',
      path: '/:id/complete',
      description: 'Complete inspection',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'POST',
      path: '/:id/cancel',
      description: 'Cancel inspection',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'POST',
      path: '/:id/duplicate',
      description: 'Duplicate inspection',
      auth: true,
      permissions: ['inspections.create']
    },
    {
      method: 'POST',
      path: '/:id/photos',
      description: 'Upload inspection photos',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'DELETE',
      path: '/:id/photos/:photoId',
      description: 'Delete inspection photo',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'POST',
      path: '/:id/assign',
      description: 'Assign inspection to user',
      auth: true,
      permissions: ['inspections.assign']
    },
    {
      method: 'POST',
      path: '/:id/unassign',
      description: 'Unassign inspection',
      auth: true,
      permissions: ['inspections.assign']
    },
    {
      method: 'GET',
      path: '/my-inspections',
      description: 'Get inspections assigned to current user',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get inspection analytics',
      auth: true,
      permissions: ['inspections.read']
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get inspection statistics',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/bulk-assign',
      description: 'Bulk assign inspections',
      auth: true,
      permissions: ['inspections.assign']
    },
    {
      method: 'POST',
      path: '/bulk-unassign',
      description: 'Bulk unassign inspections',
      auth: true,
      permissions: ['inspections.assign']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete inspections',
      auth: true,
      permissions: ['inspections.delete']
    },
    {
      method: 'POST',
      path: '/bulk-complete',
      description: 'Bulk complete inspections',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'POST',
      path: '/bulk-cancel',
      description: 'Bulk cancel inspections',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'POST',
      path: '/bulk-update',
      description: 'Bulk update inspections',
      auth: true,
      permissions: ['inspections.update']
    },
    {
      method: 'GET',
      path: '/export',
      description: 'Export inspections data',
      auth: true,
      permissions: ['inspections.read']
    },
    {
      method: 'GET',
      path: '/:id/history',
      description: 'Get inspection history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/folder/:folderId',
      description: 'Get inspections by folder',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/asset/:assetId',
      description: 'Get inspections by asset',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Inspection service health check',
      auth: true,
      permissions: []
    }
  ]
};