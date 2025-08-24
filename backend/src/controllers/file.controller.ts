/**
 * File Controller
 * Handles HTTP requests for file upload, processing, and management operations
 */

import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  FileUploadDTO,
  UpdateFileDTO,
  FileResponseDTO,
  FileSearchFilters,
  BulkFileOperation,
  FileProcessingOptions,
  FileCompressionOptions,
  ChunkedUploadSession
} from '../models/file.model';
import { PaginationQuery, SortQuery } from '../models/common.types';
import { AuthenticatedRequest } from '../types/auth';
import { validationSchemas } from '../models/validation.schemas';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

export interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface ChunkedUploadRequest extends AuthenticatedRequest {
  body: {
    sessionId: string;
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    checksum?: string;
  };
  file: Express.Multer.File;
}

export class FileController {
  constructor(private fileService: FileService) {}

  /**
   * Upload single file
   */
  uploadFile = async (
    req: FileUploadRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(
          'No file provided',
          400,
          ErrorCodes.FILE_VALIDATION_ERROR
        );
      }

      const userId = req.user!.id;
      const options = {
        category: req.body.category,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        description: req.body.description,
        isPublic: req.body.isPublic === 'true',
        preventDuplicates: req.body.preventDuplicates === 'true',
        generateThumbnails: req.body.generateThumbnails !== 'false',
        processImages: req.body.processImages !== 'false'
      };

      const result = await this.fileService.uploadFile(
        {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
          fieldname: req.file.fieldname,
          encoding: req.file.encoding
        },
        userId,
        options
      );

      logger.info('File uploaded successfully', {
        fileId: result.originalFile.id,
        fileName: req.file.originalname,
        userId
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: result.originalFile,
          processedFiles: result.processedFiles,
          thumbnails: result.thumbnails,
          metadata: result.metadata
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple files
   */
  uploadMultipleFiles = async (
    req: FileUploadRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError(
          'No files provided',
          400,
          ErrorCodes.FILE_VALIDATION_ERROR
        );
      }

      const userId = req.user!.id;
      const options = {
        category: req.body.category,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        description: req.body.description,
        isPublic: req.body.isPublic === 'true',
        preventDuplicates: req.body.preventDuplicates === 'true',
        generateThumbnails: req.body.generateThumbnails !== 'false',
        processImages: req.body.processImages !== 'false'
      };

      const results = await this.fileService.uploadMultipleFiles(
        req.files.map(file => ({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
          fieldname: file.fieldname,
          encoding: file.encoding
        })),
        userId,
        options
      );

      logger.info('Multiple files uploaded successfully', {
        fileCount: req.files.length,
        userId
      });

      res.status(201).json({
        success: true,
        message: `${results.length} files uploaded successfully`,
        data: {
          files: results,
          summary: {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Initialize chunked upload session
   */
  initializeChunkedUpload = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { fileName, fileSize, mimeType, totalChunks } = req.body;
      const userId = req.user!.id;

      const session = await this.fileService.initializeChunkedUpload({
        fileName,
        fileSize,
        mimeType,
        totalChunks,
        userId
      });

      res.status(201).json({
        success: true,
        message: 'Chunked upload session initialized',
        data: { session }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload file chunk
   */
  uploadChunk = async (
    req: ChunkedUploadRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(
          'No chunk data provided',
          400,
          ErrorCodes.FILE_VALIDATION_ERROR
        );
      }

      const { sessionId, chunkIndex, totalChunks } = req.body;
      const userId = req.user!.id;

      const result = await this.fileService.uploadChunk({
        sessionId,
        chunkIndex,
        totalChunks,
        chunkData: req.file.buffer,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'Chunk uploaded successfully',
        data: {
          chunkIndex,
          isComplete: result.isComplete,
          file: result.file
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get file by ID
   */
  getFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await this.fileService.getFileById(id, userId);
      if (!file) {
        throw new AppError(
          'File not found',
          404,
          ErrorCodes.FILE_NOT_FOUND
        );
      }

      res.status(200).json({
        success: true,
        data: { file }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download file content
   */
  downloadFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { variant = 'original', download = 'false' } = req.query as {
        variant?: 'original' | 'thumbnail' | 'compressed';
        download?: string;
      };
      const userId = req.user!.id;

      const result = await this.fileService.getFileContent(id, userId, {
        variant
      });

      // Set appropriate headers
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Length', result.contentLength);
      
      if (download === 'true') {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${result.metadata.originalName}"`
        );
      } else {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${result.metadata.originalName}"`
        );
      }

      // Set caching headers
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader('ETag', result.metadata.checksum);

      // Stream file content
      result.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update file metadata
   */
  updateFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateFileDTO = req.body;
      const userId = req.user!.id;

      const updatedFile = await this.fileService.updateFile(id, updateData, userId);

      logger.info('File updated successfully', {
        fileId: id,
        userId,
        updatedFields: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: { file: updatedFile }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete file
   */
  deleteFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { permanent = 'false' } = req.query as { permanent?: string };
      const userId = req.user!.id;

      await this.fileService.deleteFile(id, userId, {
        permanent: permanent === 'true'
      });

      logger.info('File deleted successfully', {
        fileId: id,
        userId,
        permanent: permanent === 'true'
      });

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search files
   */
  searchFiles = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const filters: FileSearchFilters = {
        search: req.query.search as string,
        category: req.query.category as string,
        mimeType: req.query.mimeType as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        dateRange: req.query.startDate && req.query.endDate ? {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string)
        } : undefined,
        sizeRange: req.query.minSize && req.query.maxSize ? {
          min: parseInt(req.query.minSize as string),
          max: parseInt(req.query.maxSize as string)
        } : undefined
      };

      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.fileService.searchFiles(filters, pagination, sort, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get file statistics
   */
  getFileStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { timeRange = '30d' } = req.query as { timeRange?: string };

      const stats = await this.fileService.getFileStatistics(userId, timeRange);

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user storage quota
   */
  getStorageQuota = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const quota = await this.fileService.getUserStorageQuota(userId);

      res.status(200).json({
        success: true,
        data: { quota }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process file (resize, compress, etc.)
   */
  processFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const options: FileProcessingOptions = req.body;
      const userId = req.user!.id;

      const result = await this.fileService.processFile(id, options, userId);

      logger.info('File processed successfully', {
        fileId: id,
        userId,
        operations: Object.keys(options)
      });

      res.status(200).json({
        success: true,
        message: 'File processed successfully',
        data: { result }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk file operations
   */
  bulkFileOperation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const operation: BulkFileOperation = req.body;
      const userId = req.user!.id;

      const result = await this.fileService.performBulkOperation(operation, userId);

      logger.info('Bulk file operation completed', {
        operation: operation.operation,
        fileCount: operation.fileIds.length,
        userId,
        successCount: result.successCount,
        failureCount: result.failureCount
      });

      res.status(200).json({
        success: true,
        message: `Bulk ${operation.operation} operation completed`,
        data: { result }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get file processing status
   */
  getProcessingStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const status = await this.fileService.getProcessingStatus(id, userId);

      res.status(200).json({
        success: true,
        data: { status }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate file share link
   */
  generateShareLink = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { expiresIn = '7d', permissions = ['read'] } = req.body;
      const userId = req.user!.id;

      const shareLink = await this.fileService.generateShareLink(id, {
        expiresIn,
        permissions,
        createdBy: userId
      });

      logger.info('File share link generated', {
        fileId: id,
        userId,
        expiresIn
      });

      res.status(201).json({
        success: true,
        message: 'Share link generated successfully',
        data: { shareLink }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Access shared file
   */
  accessSharedFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.params;
      const { action = 'view' } = req.query as { action?: string };

      const result = await this.fileService.accessSharedFile(token, action);

      if (action === 'download') {
        // Set download headers
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Length', result.contentLength);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${result.metadata.originalName}"`
        );

        // Stream file content
        result.stream.pipe(res);
      } else {
        res.status(200).json({
          success: true,
          data: {
            file: result.metadata,
            permissions: result.permissions
          }
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * List file versions
   */
  getFileVersions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const versions = await this.fileService.getFileVersions(id, userId);

      res.status(200).json({
        success: true,
        data: { versions }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restore file version
   */
  restoreFileVersion = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id, versionId } = req.params;
      const userId = req.user!.id;

      const restoredFile = await this.fileService.restoreFileVersion(id, versionId, userId);

      logger.info('File version restored', {
        fileId: id,
        versionId,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'File version restored successfully',
        data: { file: restoredFile }
      });
    } catch (error) {
      next(error);
    }
  };
}