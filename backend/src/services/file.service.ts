/**
 * File Service
 * Handles file upload, processing, and management capabilities
 */

import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../types/errors';
import {
  FileUpload,
  FileMetadata,
  ImageProcessingOptions,
  FileValidationResult,
  FileStorageOptions,
  FileCompressionOptions,
  FileSyncOptions,
  FileBackupOptions,
  FileAccessLog,
  FileQuota,
  FileCategory
} from '../types/file';
import { User } from '../types/auth';
import { FileRepository } from '../repositories/file.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import archiver from 'archiver';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import {
  validateFile as validateFileUtil,
  getMimeTypeFromPath,
  detectMimeTypeFromBuffer,
  calculateChecksum as calculateChecksumUtil,
  processImage as processImageUtil,
  createThumbnail,
  getImageMetadata,
  optimizeForWeb,
  validatePath,
  createSafePath,
  ensureDirectoryExists,
  generateUniqueFilename,
  formatFileSize,
  getFileInfo as getPathInfo,
  pathExists,
  compressFile as compressFileUtil,
  encryptFile,
  generateRandomString
} from '../utils';

export interface FileProcessingResult {
  originalFile: FileMetadata;
  processedFiles: FileMetadata[];
  thumbnails: FileMetadata[];
  metadata: {
    dimensions?: { width: number; height: number };
    fileSize: number;
    mimeType: string;
    checksum: string;
    exifData?: Record<string, any>;
  };
}

export interface FileSearchOptions {
  category?: FileCategory;
  mimeType?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByCategory: Record<FileCategory, number>;
  filesByType: Record<string, number>;
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
  recentActivity: Array<{
    date: Date;
    uploads: number;
    downloads: number;
    deletions: number;
  }>;
}

export interface BulkFileOperation {
  fileIds: string[];
  operation: 'delete' | 'move' | 'copy' | 'compress' | 'backup';
  options?: {
    destination?: string;
    compressionLevel?: number;
    backupLocation?: string;
  };
}

export class FileService {
  private readonly uploadDir: string;
  private readonly tempDir: string;
  private readonly backupDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Set<string>;
  private readonly imageFormats: Set<string>;
  private readonly documentFormats: Set<string>;

  constructor(
    private fileRepository: FileRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.tempDir = process.env.TEMP_DIR || 'temp';
    this.backupDir = process.env.BACKUP_DIR || 'backups';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024; // 50MB default
    
    this.allowedMimeTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/json'
    ]);
    
    this.imageFormats = new Set([
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]);
    
    this.documentFormats = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]);
    
    this.initializeDirectories();
  }

  /**
   * Upload and process a single file
   */
  async uploadFile(
    file: FileUpload,
    userId: string,
    options: FileStorageOptions = {}
  ): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting file upload', {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId
      });

      // Validate file
      const validationResult = await this.validateFile(file, userId);
      if (!validationResult.isValid) {
        throw new AppError(
          `File validation failed: ${validationResult.errors.join(', ')}`,
          400,
          ErrorCodes.FILE_VALIDATION_ERROR
        );
      }

      // Generate file metadata
      const fileId = this.generateFileId();
      const checksum = await this.calculateChecksum(file.buffer);
      const category = this.determineFileCategory(file.mimetype);
      
      // Check for duplicates
      const existingFile = await this.fileRepository.findByChecksum(checksum);
      if (existingFile && options.preventDuplicates) {
        logger.info('Duplicate file detected', {
          fileId,
          existingFileId: existingFile.id,
          checksum
        });
        
        // Return existing file info
        return {
          originalFile: existingFile,
          processedFiles: [],
          thumbnails: [],
          metadata: {
            fileSize: existingFile.size,
            mimeType: existingFile.mimeType,
            checksum: existingFile.checksum
          }
        };
      }

      // Save original file
      const originalPath = await this.saveFile(
        file.buffer,
        fileId,
        file.originalname,
        options.directory
      );

      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: fileId,
        originalName: file.originalname,
        fileName: this.generateFileName(fileId, file.originalname),
        filePath: originalPath,
        size: file.size,
        mimeType: file.mimetype,
        category,
        checksum,
        uploadedBy: userId,
        uploadedAt: new Date(),
        tags: options.tags || [],
        metadata: {
          originalSize: file.size
        }
      };

      // Process file based on type
      let processedFiles: FileMetadata[] = [];
      let thumbnails: FileMetadata[] = [];
      let additionalMetadata: any = {};

      if (this.imageFormats.has(file.mimetype)) {
        const imageResult = await this.processImage(
          file.buffer,
          fileId,
          file.originalname,
          options.imageProcessing
        );
        processedFiles = imageResult.processedFiles;
        thumbnails = imageResult.thumbnails;
        additionalMetadata = imageResult.metadata;
      } else if (this.documentFormats.has(file.mimetype)) {
        const docResult = await this.processDocument(
          file.buffer,
          fileId,
          file.originalname,
          options
        );
        processedFiles = docResult.processedFiles;
        additionalMetadata = docResult.metadata;
      }

      // Save file record to database
      const savedFile = await this.fileRepository.create({
        ...fileMetadata,
        metadata: {
          ...fileMetadata.metadata,
          ...additionalMetadata,
          processingTime: Date.now() - startTime
        }
      });

      // Save processed files and thumbnails
      for (const processedFile of processedFiles) {
        await this.fileRepository.create({
          ...processedFile,
          parentId: fileId
        });
      }

      for (const thumbnail of thumbnails) {
        await this.fileRepository.create({
          ...thumbnail,
          parentId: fileId
        });
      }

      // Log file access
      await this.logFileAccess(fileId, userId, 'upload');

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'file',
        entityId: fileId,
        action: 'upload',
        userId,
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype
        },
        timestamp: new Date()
      });

      logger.info('File upload completed', {
        fileId,
        fileName: file.originalname,
        processingTime: Date.now() - startTime,
        processedCount: processedFiles.length,
        thumbnailCount: thumbnails.length
      });

      return {
        originalFile: savedFile,
        processedFiles,
        thumbnails,
        metadata: {
          ...additionalMetadata,
          fileSize: file.size,
          mimeType: file.mimetype,
          checksum
        }
      };
    } catch (error) {
      logger.error('File upload failed', {
        fileName: file.originalname,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: FileUpload[],
    userId: string,
    options: FileStorageOptions = {}
  ): Promise<FileProcessingResult[]> {
    try {
      logger.info('Starting bulk file upload', {
        fileCount: files.length,
        userId
      });

      const results: FileProcessingResult[] = [];
      const errors: Array<{ file: string; error: string }> = [];

      // Process files in parallel with concurrency limit
      const concurrency = options.concurrency || 3;
      const chunks = this.chunkArray(files, concurrency);

      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(file => this.uploadFile(file, userId, options))
        );

        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            errors.push({
              file: chunk[index].originalname,
              error: result.reason.message
            });
          }
        });
      }

      if (errors.length > 0) {
        logger.warn('Some files failed to upload', {
          successCount: results.length,
          errorCount: errors.length,
          errors
        });
      }

      logger.info('Bulk file upload completed', {
        totalFiles: files.length,
        successCount: results.length,
        errorCount: errors.length,
        userId
      });

      return results;
    } catch (error) {
      logger.error('Bulk file upload failed', {
        fileCount: files.length,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string, userId: string): Promise<FileMetadata | null> {
    try {
      const file = await this.fileRepository.findById(id);
      
      if (!file) {
        return null;
      }

      // Check access permissions
      await this.checkFileAccess(file, userId, 'read');

      // Log file access
      await this.logFileAccess(id, userId, 'read');

      return file;
    } catch (error) {
      logger.error('Get file by ID failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Get file content/stream
   */
  async getFileContent(
    id: string,
    userId: string,
    options: {
      variant?: 'original' | 'thumbnail' | 'compressed';
      range?: { start: number; end: number };
    } = {}
  ): Promise<{
    stream: NodeJS.ReadableStream;
    metadata: FileMetadata;
    contentLength: number;
    contentType: string;
  }> {
    try {
      const file = await this.getFileById(id, userId);
      if (!file) {
        throw new AppError(
          'File not found',
          404,
          ErrorCodes.FILE_NOT_FOUND
        );
      }

      let filePath = file.filePath;
      
      // Handle variants
      if (options.variant && options.variant !== 'original') {
        const variant = await this.fileRepository.findVariant(id, options.variant);
        if (variant) {
          filePath = variant.filePath;
        }
      }

      // Check if file exists on disk using utility
      const fileExists = await pathExists(filePath);
      if (!fileExists) {
        throw new AppError(
          'File not found on disk',
          404,
          ErrorCodes.FILE_NOT_FOUND
        );
      }

      // Create read stream
      const stream = createReadStream(filePath, options.range);
      
      // Get file info using utility
      const fileInfo = await getPathInfo(filePath);
      const contentLength = fileInfo.size || 0;
      
      // Log file access
      await this.logFileAccess(id, userId, 'download');

      return {
        stream,
        metadata: file,
        contentLength,
        contentType: file.mimeType
      };
    } catch (error) {
      logger.error('Get file content failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Search files
   */
  async searchFiles(
    options: FileSearchOptions,
    userId: string
  ): Promise<{
    files: FileMetadata[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      logger.debug('Searching files', { options, userId });

      // Add user access filter
      const accessFilter = await this.addUserAccessFilter(options, userId);

      const result = await this.fileRepository.search(accessFilter);

      return {
        files: result.files,
        total: result.total,
        page: options.page || 1,
        limit: options.limit || 20
      };
    } catch (error) {
      logger.error('Search files failed', { options, userId, error });
      throw new AppError(
        'Failed to search files',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting file', { id, userId });

      const file = await this.fileRepository.findById(id);
      if (!file) {
        throw new AppError(
          'File not found',
          404,
          ErrorCodes.FILE_NOT_FOUND
        );
      }

      // Check permissions
      await this.checkFileAccess(file, userId, 'delete');

      // Delete file from disk
      try {
        await fs.unlink(file.filePath);
      } catch (error) {
        logger.warn('Failed to delete file from disk', {
          filePath: file.filePath,
          error
        });
      }

      // Delete variants and thumbnails
      const variants = await this.fileRepository.findVariants(id);
      for (const variant of variants) {
        try {
          await fs.unlink(variant.filePath);
        } catch (error) {
          logger.warn('Failed to delete variant from disk', {
            filePath: variant.filePath,
            error
          });
        }
      }

      // Soft delete from database
      await this.fileRepository.softDelete(id, userId);

      // Log file access
      await this.logFileAccess(id, userId, 'delete');

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'file',
        entityId: id,
        action: 'delete',
        userId,
        metadata: {
          fileName: file.originalName,
          filePath: file.filePath
        },
        timestamp: new Date()
      });

      logger.info('File deleted successfully', { id, userId });
    } catch (error) {
      logger.error('Delete file failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Bulk file operations
   */
  async bulkFileOperation(
    operation: BulkFileOperation,
    userId: string
  ): Promise<{
    success: string[];
    failed: Array<{ fileId: string; error: string }>;
  }> {
    try {
      logger.info('Starting bulk file operation', {
        operation: operation.operation,
        fileCount: operation.fileIds.length,
        userId
      });

      const success: string[] = [];
      const failed: Array<{ fileId: string; error: string }> = [];

      for (const fileId of operation.fileIds) {
        try {
          switch (operation.operation) {
            case 'delete':
              await this.deleteFile(fileId, userId);
              break;
            case 'move':
              await this.moveFile(fileId, operation.options?.destination!, userId);
              break;
            case 'copy':
              await this.copyFile(fileId, operation.options?.destination!, userId);
              break;
            case 'compress':
              await this.compressFile(fileId, operation.options?.compressionLevel, userId);
              break;
            case 'backup':
              await this.backupFile(fileId, operation.options?.backupLocation, userId);
              break;
            default:
              throw new Error(`Unsupported operation: ${operation.operation}`);
          }
          success.push(fileId);
        } catch (error) {
          failed.push({
            fileId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      logger.info('Bulk file operation completed', {
        operation: operation.operation,
        successCount: success.length,
        failedCount: failed.length,
        userId
      });

      return { success, failed };
    } catch (error) {
      logger.error('Bulk file operation failed', {
        operation: operation.operation,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(
    filter: {
      userId?: string;
      teamId?: string;
      dateRange?: { start: Date; end: Date };
    },
    userId: string
  ): Promise<FileStats> {
    try {
      logger.debug('Getting file statistics', { filter, userId });

      const stats = await this.fileRepository.getStats(filter);

      return {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        filesByCategory: stats.filesByCategory,
        filesByType: stats.filesByType,
        storageUsage: {
          used: stats.totalSize,
          available: this.getAvailableStorage(),
          percentage: (stats.totalSize / this.getMaxStorage()) * 100
        },
        recentActivity: stats.recentActivity
      };
    } catch (error) {
      logger.error('Get file stats failed', { filter, userId, error });
      throw new AppError(
        'Failed to retrieve file statistics',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Cleanup temporary files
   */
  async cleanupTempFiles(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<void> {
    try {
      logger.info('Starting temp file cleanup', { olderThan });

      const tempFiles = await fs.readdir(this.tempDir);
      let deletedCount = 0;

      for (const fileName of tempFiles) {
        const filePath = path.join(this.tempDir, fileName);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < olderThan) {
          try {
            await fs.unlink(filePath);
            deletedCount++;
          } catch (error) {
            logger.warn('Failed to delete temp file', { filePath, error });
          }
        }
      }

      logger.info('Temp file cleanup completed', {
        deletedCount,
        totalFiles: tempFiles.length
      });
    } catch (error) {
      logger.error('Temp file cleanup failed', { error });
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string): Promise<FileInfo | null> {
    try {
      const fileRecord = await this.fileRepository.findById(fileId);
      if (!fileRecord) {
        return null;
      }

      const filePath = fileRecord.filePath;
      
      // Use utility to get comprehensive path info
      const pathInfo = await getPathInfo(filePath);
      if (!pathInfo.exists) {
        logger.warn('File record exists but file not found on disk', { fileId, filePath });
        return null;
      }

      return {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        fileName: fileRecord.fileName,
        mimeType: fileRecord.mimeType,
        size: pathInfo.size || 0,
        path: fileRecord.filePath,
        uploadedAt: fileRecord.uploadedAt,
        uploadedBy: fileRecord.uploadedBy,
        checksum: fileRecord.checksum,
        metadata: fileRecord.metadata,
        formattedSize: formatFileSize(pathInfo.size || 0),
        isReadable: pathInfo.permissions?.readable || false,
        isWritable: pathInfo.permissions?.writable || false
      };
    } catch (error) {
      logger.error('Get file info failed', { fileId, error });
      throw new AppError(
        'Failed to get file information',
        500,
        ErrorCodes.FILE_INFO_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Save file to disk
   */
  async saveFile(
    content: string | Buffer,
    filePath: string,
    options: { encrypt?: boolean; encryptionKey?: string } = {}
  ): Promise<void> {
    try {
      // Validate and create safe path
      const safePath = createSafePath(filePath);
      
      // Ensure directory exists
      await ensureDirectoryExists(path.dirname(safePath));
      
      let finalContent = content;
      
      // Encrypt file if requested
      if (options.encrypt && options.encryptionKey) {
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
        finalContent = await encryptFile(buffer, options.encryptionKey);
      }
      
      // Write file
      await fs.writeFile(safePath, finalContent);
      
      logger.debug('File saved to disk', { 
        filePath: safePath,
        encrypted: options.encrypt || false
      });
    } catch (error) {
      logger.error('Save file failed', { filePath, error });
      throw new AppError(
        'Failed to save file',
        500,
        ErrorCodes.FILE_SAVE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Private helper methods
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'compressed'), { recursive: true });
    } catch (error) {
      logger.error('Failed to initialize directories', { error });
      throw error;
    }
  }

  private async validateFile(file: FileUpload, userId: string): Promise<FileValidationResult> {
    const errors: string[] = [];

    try {
      // Use the comprehensive validation utility
      await validateFileUtil(file.buffer, {
        maxSize: this.maxFileSize,
        allowedMimeTypes: Array.from(this.allowedMimeTypes),
        checkMagicBytes: true,
        scanForMalware: true,
        originalName: file.originalname
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'File validation failed');
    }

    // Check user quota
    try {
      const userQuota = await this.getUserQuota(userId);
      if (userQuota.used + file.size > userQuota.limit) {
        errors.push('File would exceed user storage quota');
      }
    } catch (error) {
      errors.push('Failed to check user quota');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async processImage(
    buffer: Buffer,
    fileId: string,
    originalName: string,
    options: ImageProcessingOptions = {}
  ): Promise<{
    processedFiles: FileMetadata[];
    thumbnails: FileMetadata[];
    metadata: any;
  }> {
    const processedFiles: FileMetadata[] = [];
    const thumbnails: FileMetadata[] = [];
    
    try {
      // Get image metadata using utility
      const metadata = await getImageMetadata(buffer);
      const image = sharp(buffer);
      
      // Generate thumbnails
      const thumbnailSizes = options.thumbnailSizes || [150, 300, 600];
      
      for (const size of thumbnailSizes) {
        const thumbnailBuffer = await createThumbnail(buffer, {
          width: size,
          height: size,
          quality: 80,
          format: 'jpeg'
        });
        
        const thumbnailId = `${fileId}_thumb_${size}`;
        const thumbnailPath = await this.saveFile(
          thumbnailBuffer,
          thumbnailId,
          `thumb_${size}_${originalName}`,
          'thumbnails'
        );
        
        thumbnails.push({
          id: thumbnailId,
          originalName: `thumb_${size}_${originalName}`,
          fileName: this.generateFileName(thumbnailId, originalName),
          filePath: thumbnailPath,
          size: thumbnailBuffer.length,
          mimeType: 'image/jpeg',
          category: FileCategory.IMAGE,
          checksum: await this.calculateChecksum(thumbnailBuffer),
          uploadedBy: '',
          uploadedAt: new Date(),
          tags: ['thumbnail'],
          metadata: {
            thumbnailSize: size,
            parentId: fileId
          }
        });
      }
      
      // Generate compressed version if requested
      if (options.compress) {
        const compressedBuffer = await optimizeForWeb(buffer, {
          quality: options.quality || 85,
          format: 'jpeg'
        });
        
        const compressedId = `${fileId}_compressed`;
        const compressedPath = await this.saveFile(
          compressedBuffer,
          compressedId,
          `compressed_${originalName}`,
          'compressed'
        );
        
        processedFiles.push({
          id: compressedId,
          originalName: `compressed_${originalName}`,
          fileName: this.generateFileName(compressedId, originalName),
          filePath: compressedPath,
          size: compressedBuffer.length,
          mimeType: 'image/jpeg',
          category: FileCategory.IMAGE,
          checksum: await this.calculateChecksum(compressedBuffer),
          uploadedBy: '',
          uploadedAt: new Date(),
          tags: ['compressed'],
          metadata: {
            compressionQuality: options.quality || 85,
            parentId: fileId
          }
        });
      }
      
      return {
        processedFiles,
        thumbnails,
        metadata: {
          dimensions: {
            width: metadata.width || 0,
            height: metadata.height || 0
          },
          format: metadata.format,
          hasAlpha: metadata.hasAlpha,
          density: metadata.density,
          exifData: metadata.exif
        }
      };
    } catch (error) {
      logger.error('Image processing failed', {
        fileId,
        originalName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new AppError(
        'Image processing failed',
        500,
        ErrorCodes.FILE_PROCESSING_ERROR,
        { originalError: error }
      );
    }
  }

  private async processDocument(
    buffer: Buffer,
    fileId: string,
    originalName: string,
    options: FileStorageOptions
  ): Promise<{
    processedFiles: FileMetadata[];
    metadata: any;
  }> {
    const processedFiles: FileMetadata[] = [];
    
    try {
      // Extract document metadata
      const metadata: any = {
        pageCount: 0,
        wordCount: 0,
        author: '',
        title: '',
        subject: '',
        creator: ''
      };
      
      // For PDF files, we could use pdf-parse or similar library
      // For now, we'll just return basic metadata
      
      return {
        processedFiles,
        metadata
      };
    } catch (error) {
      logger.error('Document processing failed', {
        fileId,
        originalName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new AppError(
        'Document processing failed',
        500,
        ErrorCodes.FILE_PROCESSING_ERROR,
        { originalError: error }
      );
    }
  }

  private async saveFile(
    buffer: Buffer,
    fileId: string,
    originalName: string,
    directory?: string
  ): Promise<string> {
    const fileName = this.generateFileName(fileId, originalName);
    const subDir = directory || this.determineSubDirectory(originalName);
    const filePath = createSafePath(path.join(this.uploadDir, subDir, fileName));
    
    // Ensure directory exists
    await ensureDirectoryExists(path.dirname(filePath));
    
    // Write file
    await fs.writeFile(filePath, buffer);
    
    return filePath;
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${generateRandomString(16)}`;
  }

  private generateFileName(fileId: string, originalName: string): string {
    return generateUniqueFilename(fileId, originalName);
  }

  private determineFileCategory(mimeType: string): FileCategory {
    if (this.imageFormats.has(mimeType)) {
      return FileCategory.IMAGE;
    } else if (this.documentFormats.has(mimeType)) {
      return FileCategory.DOCUMENT;
    } else {
      return FileCategory.OTHER;
    }
  }

  private determineSubDirectory(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      return 'images';
    } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'].includes(extension)) {
      return 'documents';
    } else {
      return 'other';
    }
  }

  private async calculateChecksum(buffer: Buffer): Promise<string> {
    return calculateChecksumUtil(buffer);
  }



  private async getUserQuota(userId: string): Promise<FileQuota> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }
    
    // Get user's current usage
    const usage = await this.fileRepository.getUserUsage(userId);
    
    // Default quota based on user role
    const defaultQuotas = {
      admin: 10 * 1024 * 1024 * 1024, // 10GB
      manager: 5 * 1024 * 1024 * 1024, // 5GB
      inspector: 2 * 1024 * 1024 * 1024, // 2GB
      viewer: 500 * 1024 * 1024 // 500MB
    };
    
    const limit = user.quota || defaultQuotas[user.role] || defaultQuotas.viewer;
    
    return {
      used: usage.totalSize,
      limit,
      fileCount: usage.fileCount
    };
  }

  private async checkFileAccess(
    file: FileMetadata,
    userId: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<void> {
    // Check if user has access to the file
    // This would typically check ownership, team membership, permissions, etc.
    if (file.uploadedBy !== userId) {
      const user = await this.userRepository.findById(userId);
      if (!user || !user.permissions.includes(`files:${action}`)) {
        throw new AppError(
          'Access denied',
          403,
          ErrorCodes.ACCESS_DENIED
        );
      }
    }
  }

  private async logFileAccess(
    fileId: string,
    userId: string,
    action: string
  ): Promise<void> {
    try {
      await this.fileRepository.logAccess({
        id: `access_${Date.now()}`,
        fileId,
        userId,
        action,
        timestamp: new Date(),
        ipAddress: '', // Would be passed from request
        userAgent: '' // Would be passed from request
      });
    } catch (error) {
      logger.warn('Failed to log file access', {
        fileId,
        userId,
        action,
        error
      });
    }
  }

  private async addUserAccessFilter(
    options: FileSearchOptions,
    userId: string
  ): Promise<FileSearchOptions> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }

    // If user has admin permissions, return options as is
    if (user.permissions.includes('files:read_all')) {
      return options;
    }

    // Otherwise, restrict to user's own files and team files
    return {
      ...options,
      userId: user.id,
      teamId: user.teamId
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private getMaxStorage(): number {
    return parseInt(process.env.MAX_STORAGE || '100') * 1024 * 1024 * 1024; // 100GB default
  }

  private getAvailableStorage(): number {
    // This would typically check actual disk space
    return this.getMaxStorage() * 0.8; // Assume 80% available
  }

  private async moveFile(
    fileId: string,
    destination: string,
    userId: string
  ): Promise<void> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new AppError(
        'File not found',
        404,
        ErrorCodes.FILE_NOT_FOUND
      );
    }

    const newPath = path.join(destination, path.basename(file.filePath));
    await fs.rename(file.filePath, newPath);
    
    await this.fileRepository.update(fileId, {
      filePath: newPath,
      updatedAt: new Date()
    });
  }

  private async copyFile(
    fileId: string,
    destination: string,
    userId: string
  ): Promise<void> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new AppError(
        'File not found',
        404,
        ErrorCodes.FILE_NOT_FOUND
      );
    }

    const newPath = path.join(destination, path.basename(file.filePath));
    await fs.copyFile(file.filePath, newPath);
    
    // Create new file record
    const newFileId = this.generateFileId();
    await this.fileRepository.create({
      ...file,
      id: newFileId,
      filePath: newPath,
      uploadedAt: new Date()
    });
  }

  private async compressFile(
    fileId: string,
    compressionLevel: number = 6,
    userId: string
  ): Promise<void> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new AppError(
        'File not found',
        404,
        ErrorCodes.FILE_NOT_FOUND
      );
    }

    // For images, use sharp compression
    if (this.imageFormats.has(file.mimeType)) {
      const buffer = await fs.readFile(file.filePath);
      const compressedBuffer = await sharp(buffer)
        .jpeg({ quality: Math.max(10, 100 - compressionLevel * 10) })
        .toBuffer();
      
      const compressedPath = file.filePath.replace(/\.[^.]+$/, '_compressed.jpg');
      await fs.writeFile(compressedPath, compressedBuffer);
      
      // Update file record
      await this.fileRepository.update(fileId, {
        filePath: compressedPath,
        size: compressedBuffer.length,
        mimeType: 'image/jpeg',
        updatedAt: new Date()
      });
    } else {
      // For other files, use compression utility
      const compressedPath = file.filePath.replace(/\.[^.]+$/, '_compressed.gz');
      
      const result = await compressFileUtil(file.filePath, compressedPath, {
        algorithm: 'gzip',
        level: compressionLevel,
        preserveOriginal: true
      });
      
      // Update file record
      await this.fileRepository.update(fileId, {
        filePath: compressedPath,
        size: result.compressedSize,
        mimeType: 'application/gzip',
        updatedAt: new Date(),
        metadata: {
          ...file.metadata,
          compressionRatio: result.compressionRatio,
          originalSize: file.size
        }
      });
    }
  }

  private async backupFile(
    fileId: string,
    backupLocation: string = this.backupDir,
    userId: string
  ): Promise<void> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new AppError(
        'File not found',
        404,
        ErrorCodes.FILE_NOT_FOUND
      );
    }

    const backupPath = path.join(backupLocation, path.basename(file.filePath));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(file.filePath, backupPath);
    
    logger.info('File backed up', {
      fileId,
      originalPath: file.filePath,
      backupPath
    });
  }
}