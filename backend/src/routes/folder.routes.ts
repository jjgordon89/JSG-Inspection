/**
 * Folder Routes
 * Defines all folder management endpoints
 */

import { Router } from 'express';
import { FolderController } from '../controllers/folder.controller';
import { FolderService } from '../services/folder.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { folderValidationSchemas } from '../controllers/folder.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const folderService = new FolderService();
const folderController = new FolderController(folderService);

// Folder CRUD operations

/**
 * @route   GET /api/v1/folders
 * @desc    Get all folders with filtering and pagination
 * @access  Private
 * @query   page?, limit?, search?, parentId?, includeChildren?, includeInspections?, sortBy?, sortOrder?
 */
router.get(
  '/',
  validationMiddleware.validateQuery(folderValidationSchemas.getFoldersQuery),
  asyncHandler(folderController.getFolders)
);

/**
 * @route   GET /api/v1/folders/:id
 * @desc    Get folder by ID
 * @access  Private
 * @params  id
 * @query   includeChildren?, includeInspections?, includeHistory?
 */
router.get(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    includeChildren: { required: false, type: 'boolean' },
    includeInspections: { required: false, type: 'boolean' },
    includeHistory: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.getFolderById)
);

/**
 * @route   POST /api/v1/folders
 * @desc    Create new folder
 * @access  Private
 * @body    { name, description?, parentId?, color?, icon?, settings? }
 */
router.post(
  '/',
  authMiddleware.requirePermission('folders.create'),
  validationMiddleware.validateBody(folderValidationSchemas.createFolder),
  asyncHandler(folderController.createFolder)
);

/**
 * @route   PUT /api/v1/folders/:id
 * @desc    Update folder
 * @access  Private
 * @params  id
 * @body    { name?, description?, color?, icon?, settings? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('folders.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(folderValidationSchemas.updateFolder),
  asyncHandler(folderController.updateFolder)
);

/**
 * @route   DELETE /api/v1/folders/:id
 * @desc    Delete folder
 * @access  Private
 * @params  id
 * @query   force?
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('folders.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    force: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.deleteFolder)
);

// Folder tree operations

/**
 * @route   GET /api/v1/folders/tree
 * @desc    Get folder tree structure
 * @access  Private
 * @query   rootId?, maxDepth?, includeInspectionCounts?
 */
router.get(
  '/tree',
  validationMiddleware.validateQuery({
    rootId: { required: false, type: 'string' },
    maxDepth: { required: false, type: 'number', min: 1, max: 10 },
    includeInspectionCounts: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.getFolderTree)
);

/**
 * @route   POST /api/v1/folders/:id/move
 * @desc    Move folder to new parent
 * @access  Private
 * @params  id
 * @body    { parentId }
 */
router.post(
  '/:id/move',
  authMiddleware.requirePermission('folders.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    parentId: { required: false, type: 'string' }
  }),
  asyncHandler(folderController.moveFolder)
);

/**
 * @route   POST /api/v1/folders/:id/copy
 * @desc    Copy folder to new parent
 * @access  Private
 * @params  id
 * @body    { parentId?, name?, includeInspections? }
 */
router.post(
  '/:id/copy',
  authMiddleware.requirePermission('folders.create'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    parentId: { required: false, type: 'string' },
    name: { required: false, type: 'string', maxLength: 100 },
    includeInspections: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.copyFolder)
);

// Folder inspections

/**
 * @route   GET /api/v1/folders/:id/inspections
 * @desc    Get inspections in folder
 * @access  Private
 * @params  id
 * @query   page?, limit?, status?, priority?, assignedTo?, includeSubfolders?
 */
router.get(
  '/:id/inspections',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    status: { required: false, type: 'string' },
    priority: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    assignedTo: { required: false, type: 'string' },
    includeSubfolders: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.getFolderInspections)
);

// Folder scheduling

/**
 * @route   POST /api/v1/folders/:id/schedule
 * @desc    Set folder schedule
 * @access  Private
 * @params  id
 * @body    { frequency, interval?, startDate?, endDate?, assignedTo?, settings? }
 */
router.post(
  '/:id/schedule',
  authMiddleware.requirePermission('folders.schedule'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(folderValidationSchemas.setSchedule),
  asyncHandler(folderController.setFolderSchedule)
);

/**
 * @route   DELETE /api/v1/folders/:id/schedule
 * @desc    Remove folder schedule
 * @access  Private
 * @params  id
 */
router.delete(
  '/:id/schedule',
  authMiddleware.requirePermission('folders.schedule'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(folderController.removeFolderSchedule)
);

// Folder assignments

/**
 * @route   POST /api/v1/folders/:id/assign
 * @desc    Assign folder to users/teams
 * @access  Private
 * @params  id
 * @body    { userIds?, teamIds?, permissions? }
 */
router.post(
  '/:id/assign',
  authMiddleware.requirePermission('folders.assign'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(folderValidationSchemas.assignFolder),
  asyncHandler(folderController.assignFolder)
);

/**
 * @route   POST /api/v1/folders/:id/unassign
 * @desc    Unassign folder from users/teams
 * @access  Private
 * @params  id
 * @body    { userIds?, teamIds? }
 */
router.post(
  '/:id/unassign',
  authMiddleware.requirePermission('folders.assign'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    userIds: { required: false, type: 'array', items: { type: 'string' } },
    teamIds: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(folderController.unassignFolder)
);

/**
 * @route   GET /api/v1/folders/:id/assignments
 * @desc    Get folder assignments
 * @access  Private
 * @params  id
 */
router.get(
  '/:id/assignments',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(folderController.getFolderAssignments)
);

/**
 * @route   GET /api/v1/folders/my-folders
 * @desc    Get folders assigned to current user
 * @access  Private
 * @query   page?, limit?, includeTeamFolders?
 */
router.get(
  '/my-folders',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    includeTeamFolders: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.getMyFolders)
);

// Folder templates

/**
 * @route   POST /api/v1/folders/from-template
 * @desc    Create folder from template
 * @access  Private
 * @body    { templateId, name?, parentId?, settings? }
 */
router.post(
  '/from-template',
  authMiddleware.requirePermission('folders.create'),
  validationMiddleware.validateBody({
    templateId: { required: true, type: 'string' },
    name: { required: false, type: 'string', maxLength: 100 },
    parentId: { required: false, type: 'string' },
    settings: { required: false, type: 'object' }
  }),
  asyncHandler(folderController.createFolderFromTemplate)
);

/**
 * @route   POST /api/v1/folders/:id/save-as-template
 * @desc    Save folder as template
 * @access  Private
 * @params  id
 * @body    { name, description?, includeSubfolders? }
 */
router.post(
  '/:id/save-as-template',
  authMiddleware.requirePermission('folders.create'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    name: { required: true, type: 'string', maxLength: 100 },
    description: { required: false, type: 'string', maxLength: 500 },
    includeSubfolders: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.saveFolderAsTemplate)
);

/**
 * @route   GET /api/v1/folders/templates
 * @desc    Get folder templates
 * @access  Private
 * @query   page?, limit?, search?
 */
router.get(
  '/templates',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    search: { required: false, type: 'string', maxLength: 100 }
  }),
  asyncHandler(folderController.getFolderTemplates)
);

// Analytics and statistics

/**
 * @route   GET /api/v1/folders/analytics
 * @desc    Get folder analytics
 * @access  Private
 * @query   timeRange?, groupBy?, parentId?
 */
router.get(
  '/analytics',
  authMiddleware.requirePermission('folders.read'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['status', 'priority', 'user', 'day', 'week', 'month'] },
    parentId: { required: false, type: 'string' }
  }),
  asyncHandler(folderController.getFolderAnalytics)
);

/**
 * @route   GET /api/v1/folders/stats
 * @desc    Get folder statistics
 * @access  Private
 * @query   timeRange?
 */
router.get(
  '/stats',
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] }
  }),
  asyncHandler(folderController.getFolderStats)
);

// Bulk operations

/**
 * @route   POST /api/v1/folders/bulk-update
 * @desc    Bulk update folders
 * @access  Private
 * @body    { folderIds, updates }
 */
router.post(
  '/bulk-update',
  authMiddleware.requirePermission('folders.update'),
  validationMiddleware.validateBody(folderValidationSchemas.bulkUpdate),
  asyncHandler(folderController.bulkUpdateFolders)
);

/**
 * @route   POST /api/v1/folders/bulk-delete
 * @desc    Bulk delete folders
 * @access  Private
 * @body    { folderIds, force? }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('folders.delete'),
  validationMiddleware.validateBody({
    folderIds: { required: true, type: 'array', items: { type: 'string' } },
    force: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.bulkDeleteFolders)
);

/**
 * @route   POST /api/v1/folders/bulk-move
 * @desc    Bulk move folders
 * @access  Private
 * @body    { folderIds, parentId }
 */
router.post(
  '/bulk-move',
  authMiddleware.requirePermission('folders.update'),
  validationMiddleware.validateBody({
    folderIds: { required: true, type: 'array', items: { type: 'string' } },
    parentId: { required: false, type: 'string' }
  }),
  asyncHandler(folderController.bulkMoveFolders)
);

/**
 * @route   POST /api/v1/folders/bulk-assign
 * @desc    Bulk assign folders
 * @access  Private
 * @body    { folderIds, userIds?, teamIds?, permissions? }
 */
router.post(
  '/bulk-assign',
  authMiddleware.requirePermission('folders.assign'),
  validationMiddleware.validateBody({
    folderIds: { required: true, type: 'array', items: { type: 'string' } },
    userIds: { required: false, type: 'array', items: { type: 'string' } },
    teamIds: { required: false, type: 'array', items: { type: 'string' } },
    permissions: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(folderController.bulkAssignFolders)
);

/**
 * @route   POST /api/v1/folders/bulk-unassign
 * @desc    Bulk unassign folders
 * @access  Private
 * @body    { folderIds, userIds?, teamIds? }
 */
router.post(
  '/bulk-unassign',
  authMiddleware.requirePermission('folders.assign'),
  validationMiddleware.validateBody({
    folderIds: { required: true, type: 'array', items: { type: 'string' } },
    userIds: { required: false, type: 'array', items: { type: 'string' } },
    teamIds: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(folderController.bulkUnassignFolders)
);

// Import/Export

/**
 * @route   GET /api/v1/folders/export
 * @desc    Export folders data
 * @access  Private
 * @query   format?, parentId?, includeSubfolders?, includeInspections?
 */
router.get(
  '/export',
  authMiddleware.requirePermission('folders.read'),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['csv', 'xlsx', 'json'] },
    parentId: { required: false, type: 'string' },
    includeSubfolders: { required: false, type: 'boolean' },
    includeInspections: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.exportFolders)
);

// History and audit

/**
 * @route   GET /api/v1/folders/:id/history
 * @desc    Get folder history
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
  asyncHandler(folderController.getFolderHistory)
);

// Due inspections

/**
 * @route   GET /api/v1/folders/due-inspections
 * @desc    Get folders with due inspections
 * @access  Private
 * @query   page?, limit?, dueDate?, overdue?
 */
router.get(
  '/due-inspections',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    dueDate: { required: false, type: 'string', format: 'date' },
    overdue: { required: false, type: 'boolean' }
  }),
  asyncHandler(folderController.getFoldersDueForInspection)
);

// Health check for folder service
/**
 * @route   GET /api/v1/folders/health
 * @desc    Folder service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'folders',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as folderRoutes };

// Export route information for documentation
export const folderRouteInfo = {
  basePath: '/folders',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get all folders with filtering',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get folder by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/',
      description: 'Create new folder',
      auth: true,
      permissions: ['folders.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update folder',
      auth: true,
      permissions: ['folders.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete folder',
      auth: true,
      permissions: ['folders.delete']
    },
    {
      method: 'GET',
      path: '/tree',
      description: 'Get folder tree structure',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/move',
      description: 'Move folder to new parent',
      auth: true,
      permissions: ['folders.update']
    },
    {
      method: 'POST',
      path: '/:id/copy',
      description: 'Copy folder to new parent',
      auth: true,
      permissions: ['folders.create']
    },
    {
      method: 'GET',
      path: '/:id/inspections',
      description: 'Get inspections in folder',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/schedule',
      description: 'Set folder schedule',
      auth: true,
      permissions: ['folders.schedule']
    },
    {
      method: 'DELETE',
      path: '/:id/schedule',
      description: 'Remove folder schedule',
      auth: true,
      permissions: ['folders.schedule']
    },
    {
      method: 'POST',
      path: '/:id/assign',
      description: 'Assign folder to users/teams',
      auth: true,
      permissions: ['folders.assign']
    },
    {
      method: 'POST',
      path: '/:id/unassign',
      description: 'Unassign folder from users/teams',
      auth: true,
      permissions: ['folders.assign']
    },
    {
      method: 'GET',
      path: '/:id/assignments',
      description: 'Get folder assignments',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/my-folders',
      description: 'Get folders assigned to current user',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/from-template',
      description: 'Create folder from template',
      auth: true,
      permissions: ['folders.create']
    },
    {
      method: 'POST',
      path: '/:id/save-as-template',
      description: 'Save folder as template',
      auth: true,
      permissions: ['folders.create']
    },
    {
      method: 'GET',
      path: '/templates',
      description: 'Get folder templates',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get folder analytics',
      auth: true,
      permissions: ['folders.read']
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get folder statistics',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/bulk-update',
      description: 'Bulk update folders',
      auth: true,
      permissions: ['folders.update']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete folders',
      auth: true,
      permissions: ['folders.delete']
    },
    {
      method: 'POST',
      path: '/bulk-move',
      description: 'Bulk move folders',
      auth: true,
      permissions: ['folders.update']
    },
    {
      method: 'POST',
      path: '/bulk-assign',
      description: 'Bulk assign folders',
      auth: true,
      permissions: ['folders.assign']
    },
    {
      method: 'POST',
      path: '/bulk-unassign',
      description: 'Bulk unassign folders',
      auth: true,
      permissions: ['folders.assign']
    },
    {
      method: 'GET',
      path: '/export',
      description: 'Export folders data',
      auth: true,
      permissions: ['folders.read']
    },
    {
      method: 'GET',
      path: '/:id/history',
      description: 'Get folder history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/due-inspections',
      description: 'Get folders with due inspections',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Folder service health check',
      auth: true,
      permissions: []
    }
  ]
};