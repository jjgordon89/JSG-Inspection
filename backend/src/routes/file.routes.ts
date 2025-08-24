/**
 * File Routes
 * Defines HTTP routes for file upload, processing, and management operations
 */

import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { FileService } from '../services/file.service';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';
import { upload, uploadMultiple, uploadChunk } from '../middleware/upload.middleware';
import { validationSchemas } from '../models/validation.schemas';
import { AppError, ErrorCodes } from '../types/errors';
import multer from 'multer';

const router = Router();
const fileService = new FileService();
const fileController = new FileController(fileService);

// Rate limiting for file operations
const fileUploadLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per window
  message: 'Too many file uploads, please try again later'
});

const fileDownloadLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 downloads per window
  message: 'Too many file downloads, please try again later'
});

// File upload routes
router.post(
  '/upload',
  fileUploadLimiter,
  authenticate,
  upload.single('file'),
  validateRequest({
    body: validationSchemas.fileUpload
  }),
  fileController.uploadFile
);

router.post(
  '/upload/multiple',
  fileUploadLimiter,
  authenticate,
  uploadMultiple.array('files', 10), // Max 10 files
  validateRequest({
    body: validationSchemas.fileUpload
  }),
  fileController.uploadMultipleFiles
);

// Chunked upload routes
router.post(
  '/upload/chunked/init',
  fileUploadLimiter,
  authenticate,
  validateRequest({
    body: validationSchemas.chunkedUploadInit
  }),
  fileController.initializeChunkedUpload
);

router.post(
  '/upload/chunked/:sessionId',
  fileUploadLimiter,
  authenticate,
  uploadChunk.single('chunk'),
  validateRequest({
    body: validationSchemas.chunkedUploadChunk,
    params: validationSchemas.fileParams
  }),
  fileController.uploadChunk
);

// File management routes
router.get(
  '/search',
  authenticate,
  validateRequest({
    query: validationSchemas.fileSearchQuery
  }),
  fileController.searchFiles
);

router.get(
  '/stats',
  authenticate,
  fileController.getFileStats
);

router.get(
  '/quota',
  authenticate,
  fileController.getStorageQuota
);

router.get(
  '/:id',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams
  }),
  fileController.getFile
);

router.get(
  '/:id/download',
  fileDownloadLimiter,
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams,
    query: validationSchemas.fileDownloadQuery
  }),
  fileController.downloadFile
);

router.put(
  '/:id',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams,
    body: validationSchemas.fileUpdate
  }),
  fileController.updateFile
);

router.delete(
  '/:id',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams,
    query: validationSchemas.fileDeleteQuery
  }),
  fileController.deleteFile
);

// File processing routes
router.post(
  '/:id/process',
  fileUploadLimiter,
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams,
    body: validationSchemas.fileProcessing
  }),
  fileController.processFile
);

router.get(
  '/:id/processing-status',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams
  }),
  fileController.getProcessingStatus
);

// Bulk operations
router.post(
  '/bulk',
  authenticate,
  validateRequest({
    body: validationSchemas.bulkFileOperation
  }),
  fileController.bulkFileOperation
);

// File sharing routes
router.post(
  '/:id/share',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams,
    body: validationSchemas.fileShare
  }),
  fileController.generateShareLink
);

router.get(
  '/shared/:token',
  fileDownloadLimiter,
  validateRequest({
    params: validationSchemas.shareTokenParams,
    query: validationSchemas.sharedFileAccessQuery
  }),
  fileController.accessSharedFile
);

// File versioning routes
router.get(
  '/:id/versions',
  authenticate,
  validateRequest({
    params: validationSchemas.fileParams
  }),
  fileController.getFileVersions
);

router.post(
  '/:id/versions/:versionId/restore',
  authenticate,
  validateRequest({
    params: validationSchemas.fileVersionParams
  }),
  fileController.restoreFileVersion
);

// Error handling middleware for file routes
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'MISSING_FIELD_NAME':
        message = 'Missing field name';
        break;
      default:
        message = error.message || 'File upload error';
    }

    const appError = new AppError(
      message,
      statusCode,
      ErrorCodes.FILE_UPLOAD_ERROR
    );
    return next(appError);
  }

  next(error);
});

export { router as fileRoutes };