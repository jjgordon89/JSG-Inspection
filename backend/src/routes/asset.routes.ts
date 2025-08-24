/**
 * Asset Routes
 * Defines all asset management endpoints
 */

import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { AssetService } from '../services/asset.service';
import { FileService } from '../services/file.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { assetValidationSchemas } from '../controllers/asset.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const assetService = new AssetService();
const fileService = new FileService();
const assetController = new AssetController(assetService, fileService);

// Asset CRUD operations

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve all assets with filtering, searching, and pagination
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: category
 *         in: query
 *         description: Filter by asset category
 *         schema:
 *           type: string
 *           enum: [equipment, building, vehicle, tool, other]
 *         example: equipment
 *       - name: location
 *         in: query
 *         description: Filter by asset location
 *         schema:
 *           type: string
 *         example: "Building A - Floor 2"
 *       - name: status
 *         in: query
 *         description: Filter by asset status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, retired]
 *         example: active
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           enum: [name, category, location, createdAt, updatedAt]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *             example:
 *               success: true
 *               data:
 *                 - id: "asset:12345"
 *                   name: "Industrial Pump A1"
 *                   category: "equipment"
 *                   location: "Building A - Floor 2"
 *                   status: "active"
 *                   qrCode: "AST001"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 150
 *                 pages: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/',
  validationMiddleware.validateQuery(assetValidationSchemas.getAssetsQuery),
  asyncHandler(assetController.getAssets)
);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     description: Retrieve a specific asset by its ID with optional related data
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Asset ID
 *         schema:
 *           type: string
 *         example: "asset:12345"
 *       - name: includeHistory
 *         in: query
 *         description: Include asset history in response
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: includeInspections
 *         in: query
 *         description: Include related inspections in response
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: includeMaintenanceRecords
 *         in: query
 *         description: Include maintenance records in response
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Asset retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *             example:
 *               success: true
 *               data:
 *                 id: "asset:12345"
 *                 name: "Industrial Pump A1"
 *                 description: "High-pressure industrial pump for water circulation"
 *                 category: "equipment"
 *                 location: "Building A - Floor 2"
 *                 status: "active"
 *                 qrCode: "AST001"
 *                 customFields:
 *                   manufacturer: "PumpCorp"
 *                   model: "PC-2000"
 *                   serialNumber: "SN123456"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-20T14:45:00Z"
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "ASSET_NOT_FOUND"
 *                 message: "Asset not found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
    includeInspections: { required: false, type: 'boolean' },
    includeMaintenanceRecords: { required: false, type: 'boolean' }
  }),
  asyncHandler(assetController.getAssetById)
);

/**
 * @swagger
 * /api/v1/assets/qr/{qrCode}:
 *   get:
 *     summary: Get asset by QR code
 *     description: Retrieve an asset using its QR code identifier
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: qrCode
 *         in: path
 *         required: true
 *         description: Asset QR code
 *         schema:
 *           type: string
 *         example: "AST001"
 *     responses:
 *       200:
 *         description: Asset retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *             example:
 *               success: true
 *               data:
 *                 id: "asset:12345"
 *                 name: "Industrial Pump A1"
 *                 category: "equipment"
 *                 location: "Building A - Floor 2"
 *                 status: "active"
 *                 qrCode: "AST001"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "ASSET_NOT_FOUND"
 *                 message: "Asset with QR code 'AST001' not found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/qr/:qrCode',
  validationMiddleware.validateParams({
    qrCode: { required: true, type: 'string' }
  }),
  asyncHandler(assetController.getAssetByQRCode)
);

/**
 * @route   POST /api/v1/assets
 * @desc    Create new asset
 * @access  Private
 * @body    { name, description?, category, location, qrCode?, customFields? }
 */
router.post(
  '/',
  authMiddleware.requirePermission('assets.create'),
  validationMiddleware.validateBody(assetValidationSchemas.createAsset),
  asyncHandler(assetController.createAsset)
);

/**
 * @route   PUT /api/v1/assets/:id
 * @desc    Update asset
 * @access  Private
 * @params  id
 * @body    { name?, description?, category?, location?, status?, customFields? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(assetValidationSchemas.updateAsset),
  asyncHandler(assetController.updateAsset)
);

/**
 * @route   DELETE /api/v1/assets/:id
 * @desc    Delete asset
 * @access  Private
 * @params  id
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('assets.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(assetController.deleteAsset)
);

// Asset photos and media

/**
 * @route   POST /api/v1/assets/:id/photos
 * @desc    Upload asset photos
 * @access  Private
 * @params  id
 * @body    FormData with 'photos' files
 */
router.post(
  '/:id/photos',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  uploadMiddleware.array('photos', 10),
  asyncHandler(assetController.uploadAssetPhotos)
);

/**
 * @route   DELETE /api/v1/assets/:id/photos/:photoId
 * @desc    Delete asset photo
 * @access  Private
 * @params  id, photoId
 */
router.delete(
  '/:id/photos/:photoId',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' },
    photoId: { required: true, type: 'string' }
  }),
  asyncHandler(assetController.deleteAssetPhoto)
);

// QR Code management

/**
 * @route   POST /api/v1/assets/:id/qr-code
 * @desc    Generate QR code for asset
 * @access  Private
 * @params  id
 * @body    { size?, format? }
 */
router.post(
  '/:id/qr-code',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    size: { required: false, type: 'number', min: 100, max: 1000 },
    format: { required: false, type: 'string', enum: ['png', 'svg'] }
  }),
  asyncHandler(assetController.generateQRCode)
);

// Location management

/**
 * @route   PUT /api/v1/assets/:id/location
 * @desc    Update asset location
 * @access  Private
 * @params  id
 * @body    { latitude, longitude, address?, building?, floor?, room? }
 */
router.put(
  '/:id/location',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(assetValidationSchemas.updateLocation),
  asyncHandler(assetController.updateAssetLocation)
);

/**
 * @route   GET /api/v1/assets/search/location
 * @desc    Search assets by location (GPS coordinates)
 * @access  Private
 * @query   latitude, longitude, radius?, unit?
 */
router.get(
  '/search/location',
  validationMiddleware.validateQuery({
    latitude: { required: true, type: 'number', min: -90, max: 90 },
    longitude: { required: true, type: 'number', min: -180, max: 180 },
    radius: { required: false, type: 'number', min: 0.1, max: 100 },
    unit: { required: false, type: 'string', enum: ['km', 'miles'] }
  }),
  asyncHandler(assetController.searchAssetsByLocation)
);

// Inspection history

/**
 * @route   GET /api/v1/assets/:id/inspections
 * @desc    Get asset inspection history
 * @access  Private
 * @params  id
 * @query   page?, limit?, startDate?, endDate?, status?
 */
router.get(
  '/:id/inspections',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    status: { required: false, type: 'string' }
  }),
  asyncHandler(assetController.getAssetInspectionHistory)
);

// Maintenance management

/**
 * @route   GET /api/v1/assets/:id/maintenance
 * @desc    Get asset maintenance records
 * @access  Private
 * @params  id
 * @query   page?, limit?, startDate?, endDate?, type?
 */
router.get(
  '/:id/maintenance',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    type: { required: false, type: 'string' }
  }),
  asyncHandler(assetController.getAssetMaintenanceRecords)
);

/**
 * @route   POST /api/v1/assets/:id/maintenance
 * @desc    Schedule asset maintenance
 * @access  Private
 * @params  id
 * @body    { type, description, scheduledDate, assignedTo?, priority? }
 */
router.post(
  '/:id/maintenance',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(assetValidationSchemas.scheduleMaintenance),
  asyncHandler(assetController.scheduleAssetMaintenance)
);

/**
 * @route   GET /api/v1/assets/maintenance/due
 * @desc    Get assets due for maintenance
 * @access  Private
 * @query   days?, priority?, type?
 */
router.get(
  '/maintenance/due',
  validationMiddleware.validateQuery({
    days: { required: false, type: 'number', min: 1, max: 365 },
    priority: { required: false, type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    type: { required: false, type: 'string' }
  }),
  asyncHandler(assetController.getAssetsDueForMaintenance)
);

// Analytics and statistics

/**
 * @route   GET /api/v1/assets/analytics
 * @desc    Get asset analytics
 * @access  Private
 * @query   timeRange?, groupBy?, category?, location?
 */
router.get(
  '/analytics',
  authMiddleware.requirePermission('assets.read'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['category', 'location', 'status', 'day', 'week', 'month'] },
    category: { required: false, type: 'string' },
    location: { required: false, type: 'string' }
  }),
  asyncHandler(assetController.getAssetAnalytics)
);

/**
 * @route   GET /api/v1/assets/stats
 * @desc    Get asset statistics
 * @access  Private
 * @query   timeRange?
 */
router.get(
  '/stats',
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] }
  }),
  asyncHandler(assetController.getAssetStats)
);

// Bulk operations

/**
 * @route   POST /api/v1/assets/bulk-update
 * @desc    Bulk update assets
 * @access  Private
 * @body    { assetIds, updates }
 */
router.post(
  '/bulk-update',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateBody(assetValidationSchemas.bulkUpdate),
  asyncHandler(assetController.bulkUpdateAssets)
);

/**
 * @route   POST /api/v1/assets/bulk-delete
 * @desc    Bulk delete assets
 * @access  Private
 * @body    { assetIds }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('assets.delete'),
  validationMiddleware.validateBody({
    assetIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(assetController.bulkDeleteAssets)
);

/**
 * @route   POST /api/v1/assets/bulk-activate
 * @desc    Bulk activate assets
 * @access  Private
 * @body    { assetIds }
 */
router.post(
  '/bulk-activate',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateBody({
    assetIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(assetController.bulkActivateAssets)
);

/**
 * @route   POST /api/v1/assets/bulk-deactivate
 * @desc    Bulk deactivate assets
 * @access  Private
 * @body    { assetIds }
 */
router.post(
  '/bulk-deactivate',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateBody({
    assetIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(assetController.bulkDeactivateAssets)
);

/**
 * @route   POST /api/v1/assets/bulk-move
 * @desc    Bulk move assets to new location
 * @access  Private
 * @body    { assetIds, location }
 */
router.post(
  '/bulk-move',
  authMiddleware.requirePermission('assets.update'),
  validationMiddleware.validateBody({
    assetIds: { required: true, type: 'array', items: { type: 'string' } },
    location: { required: true, type: 'object' }
  }),
  asyncHandler(assetController.bulkMoveAssets)
);

// Import/Export

/**
 * @route   GET /api/v1/assets/export
 * @desc    Export assets data
 * @access  Private
 * @query   format?, category?, location?, status?, startDate?, endDate?
 */
router.get(
  '/export',
  authMiddleware.requirePermission('assets.read'),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['csv', 'xlsx', 'json'] },
    category: { required: false, type: 'string' },
    location: { required: false, type: 'string' },
    status: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(assetController.exportAssets)
);

/**
 * @route   POST /api/v1/assets/import
 * @desc    Import assets data
 * @access  Private
 * @body    FormData with 'file' (CSV/XLSX)
 */
router.post(
  '/import',
  authMiddleware.requirePermission('assets.create'),
  uploadMiddleware.single('file'),
  asyncHandler(assetController.importAssets)
);

// Asset history

/**
 * @route   GET /api/v1/assets/:id/history
 * @desc    Get asset history
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
  asyncHandler(assetController.getAssetHistory)
);

// Categories and metadata

/**
 * @route   GET /api/v1/assets/categories
 * @desc    Get distinct asset categories
 * @access  Private
 */
router.get(
  '/categories',
  asyncHandler(assetController.getAssetCategories)
);

/**
 * @route   GET /api/v1/assets/locations
 * @desc    Get distinct asset locations
 * @access  Private
 */
router.get(
  '/locations',
  asyncHandler(assetController.getAssetLocations)
);

// Health check for asset service
/**
 * @route   GET /api/v1/assets/health
 * @desc    Asset service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'assets',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as assetRoutes };

// Export route information for documentation
export const assetRouteInfo = {
  basePath: '/assets',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get all assets with filtering',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get asset by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/qr/:qrCode',
      description: 'Get asset by QR code',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/',
      description: 'Create new asset',
      auth: true,
      permissions: ['assets.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update asset',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete asset',
      auth: true,
      permissions: ['assets.delete']
    },
    {
      method: 'POST',
      path: '/:id/photos',
      description: 'Upload asset photos',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'DELETE',
      path: '/:id/photos/:photoId',
      description: 'Delete asset photo',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'POST',
      path: '/:id/qr-code',
      description: 'Generate QR code for asset',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'PUT',
      path: '/:id/location',
      description: 'Update asset location',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'GET',
      path: '/search/location',
      description: 'Search assets by location',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id/inspections',
      description: 'Get asset inspection history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id/maintenance',
      description: 'Get asset maintenance records',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/maintenance',
      description: 'Schedule asset maintenance',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'GET',
      path: '/maintenance/due',
      description: 'Get assets due for maintenance',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get asset analytics',
      auth: true,
      permissions: ['assets.read']
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get asset statistics',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/bulk-update',
      description: 'Bulk update assets',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete assets',
      auth: true,
      permissions: ['assets.delete']
    },
    {
      method: 'POST',
      path: '/bulk-activate',
      description: 'Bulk activate assets',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'POST',
      path: '/bulk-deactivate',
      description: 'Bulk deactivate assets',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'POST',
      path: '/bulk-move',
      description: 'Bulk move assets',
      auth: true,
      permissions: ['assets.update']
    },
    {
      method: 'GET',
      path: '/export',
      description: 'Export assets data',
      auth: true,
      permissions: ['assets.read']
    },
    {
      method: 'POST',
      path: '/import',
      description: 'Import assets data',
      auth: true,
      permissions: ['assets.create']
    },
    {
      method: 'GET',
      path: '/:id/history',
      description: 'Get asset history',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/categories',
      description: 'Get distinct asset categories',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/locations',
      description: 'Get distinct asset locations',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Asset service health check',
      auth: true,
      permissions: []
    }
  ]
};