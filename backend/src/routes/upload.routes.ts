/**
 * Upload Routes
 * Defines all file upload and media handling endpoints
 */

import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { FileService } from '../services/file.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const fileService = new FileService();
const uploadController = new UploadController(fileService);

// Apply rate limiting for upload operations
const uploadRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit upload requests per minute
  message: 'Too many upload requests'
});

const bulkUploadRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Very limited bulk uploads
  message: 'Too many bulk upload requests'
});

// Single file upload endpoints

/**
 * @route   POST /api/v1/uploads/image
 * @desc    Upload single image file
 * @access  Private
 * @body    FormData with 'file' field
 * @query   resize?, quality?, format?
 */
router.post(
  '/image',
  uploadRateLimit,
  uploadMiddleware.single('file', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: 'uploads/images'
  }),
  validationMiddleware.validateQuery({
    resize: { required: false, type: 'string', pattern: '^\\d+x\\d+$' },
    quality: { required: false, type: 'number', min: 1, max: 100 },
    format: { required: false, type: 'string', enum: ['jpeg', 'png', 'webp'] }
  }),
  asyncHandler(uploadController.uploadImage)
);

/**
 * @route   POST /api/v1/uploads/document
 * @desc    Upload single document file
 * @access  Private
 * @body    FormData with 'file' field
 * @query   category?
 */
router.post(
  '/document',
  uploadRateLimit,
  uploadMiddleware.single('file', {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize: 50 * 1024 * 1024, // 50MB
    destination: 'uploads/documents'
  }),
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', maxLength: 50 }
  }),
  asyncHandler(uploadController.uploadDocument)
);

/**
 * @route   POST /api/v1/uploads/avatar
 * @desc    Upload user avatar image
 * @access  Private
 * @body    FormData with 'file' field
 */
router.post(
  '/avatar',
  uploadRateLimit,
  uploadMiddleware.single('file', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/avatars'
  }),
  asyncHandler(uploadController.uploadAvatar)
);

/**
 * @route   POST /api/v1/uploads/inspection-photo
 * @desc    Upload inspection photo
 * @access  Private
 * @body    FormData with 'file' field
 * @query   inspectionId, questionId?, metadata?
 */
router.post(
  '/inspection-photo',
  uploadRateLimit,
  uploadMiddleware.single('file', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 15 * 1024 * 1024, // 15MB
    destination: 'uploads/inspections'
  }),
  validationMiddleware.validateQuery({
    inspectionId: { required: true, type: 'string' },
    questionId: { required: false, type: 'string' },
    metadata: { required: false, type: 'string' } // JSON string
  }),
  asyncHandler(uploadController.uploadInspectionPhoto)
);

/**
 * @route   POST /api/v1/uploads/asset-photo
 * @desc    Upload asset photo
 * @access  Private
 * @body    FormData with 'file' field
 * @query   assetId, category?
 */
router.post(
  '/asset-photo',
  uploadRateLimit,
  uploadMiddleware.single('file', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 15 * 1024 * 1024, // 15MB
    destination: 'uploads/assets'
  }),
  validationMiddleware.validateQuery({
    assetId: { required: true, type: 'string' },
    category: { required: false, type: 'string', enum: ['main', 'detail', 'defect', 'repair'] }
  }),
  asyncHandler(uploadController.uploadAssetPhoto)
);

// Multiple file upload endpoints

/**
 * @route   POST /api/v1/uploads/images
 * @desc    Upload multiple image files
 * @access  Private
 * @body    FormData with 'files' field (array)
 * @query   resize?, quality?, format?
 */
router.post(
  '/images',
  bulkUploadRateLimit,
  uploadMiddleware.array('files', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 10 * 1024 * 1024, // 10MB per file
    maxCount: 10,
    destination: 'uploads/images'
  }),
  validationMiddleware.validateQuery({
    resize: { required: false, type: 'string', pattern: '^\\d+x\\d+$' },
    quality: { required: false, type: 'number', min: 1, max: 100 },
    format: { required: false, type: 'string', enum: ['jpeg', 'png', 'webp'] }
  }),
  asyncHandler(uploadController.uploadMultipleImages)
);

/**
 * @route   POST /api/v1/uploads/documents
 * @desc    Upload multiple document files
 * @access  Private
 * @body    FormData with 'files' field (array)
 * @query   category?
 */
router.post(
  '/documents',
  bulkUploadRateLimit,
  uploadMiddleware.array('files', {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize: 50 * 1024 * 1024, // 50MB per file
    maxCount: 5,
    destination: 'uploads/documents'
  }),
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', maxLength: 50 }
  }),
  asyncHandler(uploadController.uploadMultipleDocuments)
);

/**
 * @route   POST /api/v1/uploads/inspection-photos
 * @desc    Upload multiple inspection photos
 * @access  Private
 * @body    FormData with 'files' field (array)
 * @query   inspectionId, questionId?, metadata?
 */
router.post(
  '/inspection-photos',
  bulkUploadRateLimit,
  uploadMiddleware.array('files', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 15 * 1024 * 1024, // 15MB per file
    maxCount: 20,
    destination: 'uploads/inspections'
  }),
  validationMiddleware.validateQuery({
    inspectionId: { required: true, type: 'string' },
    questionId: { required: false, type: 'string' },
    metadata: { required: false, type: 'string' } // JSON string
  }),
  asyncHandler(uploadController.uploadMultipleInspectionPhotos)
);

// File management endpoints

/**
 * @route   GET /api/v1/uploads/:fileId
 * @desc    Get file information
 * @access  Private
 * @params  fileId
 */
router.get(
  '/:fileId',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  asyncHandler(uploadController.getFileInfo)
);

/**
 * @route   GET /api/v1/uploads/:fileId/download
 * @desc    Download file
 * @access  Private
 * @params  fileId
 * @query   inline?
 */
router.get(
  '/:fileId/download',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    inline: { required: false, type: 'boolean' }
  }),
  asyncHandler(uploadController.downloadFile)
);

/**
 * @route   GET /api/v1/uploads/:fileId/thumbnail
 * @desc    Get image thumbnail
 * @access  Private
 * @params  fileId
 * @query   size?, quality?
 */
router.get(
  '/:fileId/thumbnail',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    size: { required: false, type: 'string', enum: ['small', 'medium', 'large'] },
    quality: { required: false, type: 'number', min: 1, max: 100 }
  }),
  asyncHandler(uploadController.getThumbnail)
);

/**
 * @route   DELETE /api/v1/uploads/:fileId
 * @desc    Delete file
 * @access  Private
 * @params  fileId
 */
router.delete(
  '/:fileId',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  asyncHandler(uploadController.deleteFile)
);

/**
 * @route   DELETE /api/v1/uploads/bulk
 * @desc    Delete multiple files
 * @access  Private
 * @body    { fileIds }
 */
router.delete(
  '/bulk',
  validationMiddleware.validateBody({
    fileIds: { required: true, type: 'array', items: { type: 'string' }, maxItems: 50 }
  }),
  asyncHandler(uploadController.deleteMultipleFiles)
);

// File processing endpoints

/**
 * @route   POST /api/v1/uploads/:fileId/process
 * @desc    Process uploaded file (resize, convert, etc.)
 * @access  Private
 * @params  fileId
 * @body    { operations }
 */
router.post(
  '/:fileId/process',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    operations: {
      required: true,
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['resize', 'convert', 'compress', 'watermark'] },
          parameters: { type: 'object' }
        },
        required: ['type']
      }
    }
  }),
  asyncHandler(uploadController.processFile)
);

/**
 * @route   GET /api/v1/uploads/:fileId/process-status
 * @desc    Get file processing status
 * @access  Private
 * @params  fileId
 */
router.get(
  '/:fileId/process-status',
  validationMiddleware.validateParams({
    fileId: { required: true, type: 'string' }
  }),
  asyncHandler(uploadController.getProcessingStatus)
);

// File search and listing

/**
 * @route   GET /api/v1/uploads
 * @desc    List uploaded files
 * @access  Private
 * @query   page?, limit?, type?, category?, startDate?, endDate?, sortBy?, sortOrder?
 */
router.get(
  '/',
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    type: { required: false, type: 'string', enum: ['image', 'document', 'avatar', 'inspection', 'asset'] },
    category: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    sortBy: { required: false, type: 'string', enum: ['createdAt', 'size', 'name', 'type'] },
    sortOrder: { required: false, type: 'string', enum: ['asc', 'desc'] }
  }),
  asyncHandler(uploadController.listFiles)
);

/**
 * @route   GET /api/v1/uploads/search
 * @desc    Search uploaded files
 * @access  Private
 * @query   q, type?, category?, page?, limit?
 */
router.get(
  '/search',
  validationMiddleware.validateQuery({
    q: { required: true, type: 'string', minLength: 1 },
    type: { required: false, type: 'string', enum: ['image', 'document', 'avatar', 'inspection', 'asset'] },
    category: { required: false, type: 'string' },
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 }
  }),
  asyncHandler(uploadController.searchFiles)
);

// Storage and quota management

/**
 * @route   GET /api/v1/uploads/quota
 * @desc    Get user storage quota information
 * @access  Private
 */
router.get(
  '/quota',
  asyncHandler(uploadController.getStorageQuota)
);

/**
 * @route   GET /api/v1/uploads/stats
 * @desc    Get upload statistics
 * @access  Private
 * @query   timeRange?, groupBy?
 */
router.get(
  '/stats',
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month', 'type'] }
  }),
  asyncHandler(uploadController.getUploadStats)
);

// Admin endpoints

/**
 * @route   GET /api/v1/uploads/admin/overview
 * @desc    Get upload system overview (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/admin/overview',
  authMiddleware.requireRole('admin'),
  asyncHandler(uploadController.getAdminUploadOverview)
);

/**
 * @route   POST /api/v1/uploads/admin/cleanup
 * @desc    Cleanup orphaned files (admin only)
 * @access  Private (Admin)
 * @body    { olderThan?, dryRun? }
 */
router.post(
  '/admin/cleanup',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Very limited cleanup operations
    message: 'Too many cleanup requests'
  }),
  validationMiddleware.validateBody({
    olderThan: { required: false, type: 'string', format: 'date-time' },
    dryRun: { required: false, type: 'boolean' }
  }),
  asyncHandler(uploadController.cleanupOrphanedFiles)
);

/**
 * @route   POST /api/v1/uploads/admin/migrate
 * @desc    Migrate files to new storage (admin only)
 * @access  Private (Admin)
 * @body    { source, destination, fileIds? }
 */
router.post(
  '/admin/migrate',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Very limited migration operations
    message: 'Too many migration requests'
  }),
  validationMiddleware.validateBody({
    source: { required: true, type: 'string' },
    destination: { required: true, type: 'string' },
    fileIds: { required: false, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(uploadController.migrateFiles)
);

// Temporary upload endpoints for chunked uploads

/**
 * @route   POST /api/v1/uploads/chunk/init
 * @desc    Initialize chunked upload
 * @access  Private
 * @body    { fileName, fileSize, chunkSize, totalChunks, fileType }
 */
router.post(
  '/chunk/init',
  validationMiddleware.validateBody({
    fileName: { required: true, type: 'string', maxLength: 255 },
    fileSize: { required: true, type: 'number', min: 1 },
    chunkSize: { required: true, type: 'number', min: 1024 },
    totalChunks: { required: true, type: 'number', min: 1 },
    fileType: { required: true, type: 'string' }
  }),
  asyncHandler(uploadController.initChunkedUpload)
);

/**
 * @route   POST /api/v1/uploads/chunk/:uploadId
 * @desc    Upload file chunk
 * @access  Private
 * @params  uploadId
 * @body    FormData with 'chunk' field
 * @query   chunkIndex
 */
router.post(
  '/chunk/:uploadId',
  uploadRateLimit,
  validationMiddleware.validateParams({
    uploadId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    chunkIndex: { required: true, type: 'number', min: 0 }
  }),
  uploadMiddleware.single('chunk', {
    maxSize: 10 * 1024 * 1024, // 10MB chunk size
    destination: 'uploads/chunks'
  }),
  asyncHandler(uploadController.uploadChunk)
);

/**
 * @route   POST /api/v1/uploads/chunk/:uploadId/complete
 * @desc    Complete chunked upload
 * @access  Private
 * @params  uploadId
 * @body    { metadata? }
 */
router.post(
  '/chunk/:uploadId/complete',
  validationMiddleware.validateParams({
    uploadId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    metadata: { required: false, type: 'object' }
  }),
  asyncHandler(uploadController.completeChunkedUpload)
);

/**
 * @route   DELETE /api/v1/uploads/chunk/:uploadId
 * @desc    Cancel chunked upload
 * @access  Private
 * @params  uploadId
 */
router.delete(
  '/chunk/:uploadId',
  validationMiddleware.validateParams({
    uploadId: { required: true, type: 'string' }
  }),
  asyncHandler(uploadController.cancelChunkedUpload)
);

// Export the router
export { router as uploadRoutes };

// Export route information for documentation
export const uploadRouteInfo = {
  basePath: '/uploads',
  routes: [
    {
      method: 'POST',
      path: '/image',
      description: 'Upload single image file',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/document',
      description: 'Upload single document file',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/avatar',
      description: 'Upload user avatar image',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/inspection-photo',
      description: 'Upload inspection photo',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/asset-photo',
      description: 'Upload asset photo',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/images',
      description: 'Upload multiple image files',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/documents',
      description: 'Upload multiple document files',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/inspection-photos',
      description: 'Upload multiple inspection photos',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:fileId',
      description: 'Get file information',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:fileId/download',
      description: 'Download file',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:fileId/thumbnail',
      description: 'Get image thumbnail',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/:fileId',
      description: 'Delete file',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/bulk',
      description: 'Delete multiple files',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:fileId/process',
      description: 'Process uploaded file (resize, convert, etc.)',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:fileId/process-status',
      description: 'Get file processing status',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/',
      description: 'List uploaded files',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/search',
      description: 'Search uploaded files',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/quota',
      description: 'Get user storage quota information',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get upload statistics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/admin/overview',
      description: 'Get upload system overview (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/admin/cleanup',
      description: 'Cleanup orphaned files (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/admin/migrate',
      description: 'Migrate files to new storage (admin only)',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/chunk/init',
      description: 'Initialize chunked upload',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/chunk/:uploadId',
      description: 'Upload file chunk',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/chunk/:uploadId/complete',
      description: 'Complete chunked upload',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/chunk/:uploadId',
      description: 'Cancel chunked upload',
      auth: true,
      permissions: []
    }
  ]
};