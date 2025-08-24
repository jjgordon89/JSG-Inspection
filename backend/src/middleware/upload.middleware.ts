/**
 * Upload Middleware
 * Handles file uploads, validation, and processing for inspection photos and documents
 */

import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import { logSecurityEvent } from './logging.middleware';

export interface UploadConfig {
  maxFileSize: number;
  maxFiles: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  uploadPath: string;
  thumbnailPath: string;
  tempPath: string;
  imageProcessing: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: 'jpeg' | 'png' | 'webp';
    thumbnailSize: number;
  };
}

export interface ProcessedFile {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  thumbnailPath?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    exif?: any;
  };
}

export class UploadMiddleware {
  private static config: UploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.webp', '.gif',
      '.pdf', '.txt', '.doc', '.docx'
    ],
    uploadPath: path.join(process.cwd(), 'uploads'),
    thumbnailPath: path.join(process.cwd(), 'uploads', 'thumbnails'),
    tempPath: path.join(process.cwd(), 'uploads', 'temp'),
    imageProcessing: {
      enabled: true,
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'jpeg',
      thumbnailSize: 200
    }
  };

  /**
   * Initialize upload directories
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.config.uploadPath, { recursive: true });
      await fs.mkdir(this.config.thumbnailPath, { recursive: true });
      await fs.mkdir(this.config.tempPath, { recursive: true });
      
      logger.info('Upload directories initialized', {
        uploadPath: this.config.uploadPath,
        thumbnailPath: this.config.thumbnailPath,
        tempPath: this.config.tempPath
      });
    } catch (error) {
      logger.error('Failed to initialize upload directories', { error });
      throw new AppError(
        'Failed to initialize upload system',
        500,
        ErrorCodes.SYSTEM_INITIALIZATION_ERROR
      );
    }
  }

  /**
   * Configure multer storage
   */
  private static configureStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          const uploadDir = this.config.tempPath;
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error as Error, '');
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `${uniqueSuffix}${extension}`;
        cb(null, filename);
      }
    });
  }

  /**
   * File filter function
   */
  private static fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    try {
      // Check MIME type
      if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
        logSecurityEvent(
          req,
          'INVALID_FILE_TYPE',
          {
            filename: file.originalname,
            mimetype: file.mimetype,
            allowedTypes: this.config.allowedMimeTypes
          },
          'medium'
        );
        
        return cb(new AppError(
          `File type ${file.mimetype} not allowed`,
          400,
          ErrorCodes.VALIDATION_INVALID_FILE_TYPE
        ));
      }

      // Check file extension
      const extension = path.extname(file.originalname).toLowerCase();
      if (!this.config.allowedExtensions.includes(extension)) {
        logSecurityEvent(
          req,
          'INVALID_FILE_EXTENSION',
          {
            filename: file.originalname,
            extension,
            allowedExtensions: this.config.allowedExtensions
          },
          'medium'
        );
        
        return cb(new AppError(
          `File extension ${extension} not allowed`,
          400,
          ErrorCodes.VALIDATION_INVALID_FILE_EXTENSION
        ));
      }

      // Check filename for suspicious patterns
      if (this.hasSuspiciousFilename(file.originalname)) {
        logSecurityEvent(
          req,
          'SUSPICIOUS_FILENAME',
          {
            filename: file.originalname
          },
          'high'
        );
        
        return cb(new AppError(
          'Suspicious filename detected',
          400,
          ErrorCodes.VALIDATION_SUSPICIOUS_FILENAME
        ));
      }

      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  };

  /**
   * Check for suspicious filename patterns
   */
  private static hasSuspiciousFilename(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app)$/i, // Executable extensions
      /^\./,  // Hidden files
      /\s+$/, // Trailing whitespace
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Create multer instance for single file upload
   */
  static single(fieldName: string = 'file') {
    const upload = multer({
      storage: this.configureStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.config.maxFileSize,
        files: 1
      }
    });

    return upload.single(fieldName);
  }

  /**
   * Create multer instance for multiple file upload
   */
  static multiple(fieldName: string = 'files', maxCount?: number) {
    const upload = multer({
      storage: this.configureStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.config.maxFileSize,
        files: maxCount || this.config.maxFiles
      }
    });

    return upload.array(fieldName, maxCount || this.config.maxFiles);
  }

  /**
   * Create multer instance for form fields with files
   */
  static fields(fields: { name: string; maxCount?: number }[]) {
    const upload = multer({
      storage: this.configureStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.config.maxFileSize,
        files: this.config.maxFiles
      }
    });

    return upload.fields(fields);
  }

  /**
   * Process uploaded files
   */
  static processFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (!files) {
        return next();
      }

      let filesToProcess: Express.Multer.File[] = [];
      
      if (Array.isArray(files)) {
        filesToProcess = files;
      } else if (typeof files === 'object') {
        filesToProcess = Object.values(files).flat();
      } else if (req.file) {
        filesToProcess = [req.file];
      }

      const processedFiles: ProcessedFile[] = [];

      for (const file of filesToProcess) {
        const processedFile = await this.processFile(file);
        processedFiles.push(processedFile);
      }

      // Attach processed files to request
      (req as any).processedFiles = processedFiles;
      
      next();
    } catch (error) {
      logger.error('File processing failed', { error });
      next(new AppError(
        'File processing failed',
        500,
        ErrorCodes.FILE_PROCESSING_ERROR
      ));
    }
  };

  /**
   * Process individual file
   */
  private static async processFile(file: Express.Multer.File): Promise<ProcessedFile> {
    const processedFile: ProcessedFile = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    };

    try {
      // Move file from temp to permanent location
      const permanentPath = path.join(this.config.uploadPath, file.filename);
      await fs.rename(file.path, permanentPath);
      processedFile.path = permanentPath;

      // Process images
      if (this.isImage(file.mimetype) && this.config.imageProcessing.enabled) {
        await this.processImage(processedFile);
      }

      // Extract metadata
      if (this.isImage(file.mimetype)) {
        processedFile.metadata = await this.extractImageMetadata(processedFile.path);
      }

      logger.info('File processed successfully', {
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype
      });

      return processedFile;
    } catch (error) {
      logger.error('Individual file processing failed', {
        filename: file.filename,
        error
      });
      
      // Clean up on error
      try {
        await fs.unlink(processedFile.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after processing error', {
          filename: file.filename,
          cleanupError
        });
      }
      
      throw error;
    }
  }

  /**
   * Process image (resize, optimize, create thumbnail)
   */
  private static async processImage(file: ProcessedFile): Promise<void> {
    const { imageProcessing } = this.config;
    
    try {
      // Create optimized version
      const optimizedPath = file.path;
      await sharp(file.path)
        .resize(imageProcessing.maxWidth, imageProcessing.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: imageProcessing.quality })
        .toFile(optimizedPath + '.tmp');
      
      // Replace original with optimized
      await fs.rename(optimizedPath + '.tmp', optimizedPath);

      // Create thumbnail
      const thumbnailFilename = `thumb_${file.filename}`;
      const thumbnailPath = path.join(this.config.thumbnailPath, thumbnailFilename);
      
      await sharp(file.path)
        .resize(imageProcessing.thumbnailSize, imageProcessing.thumbnailSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      file.thumbnailPath = thumbnailPath;
      
      logger.debug('Image processed', {
        filename: file.filename,
        thumbnailPath
      });
    } catch (error) {
      logger.error('Image processing failed', {
        filename: file.filename,
        error
      });
      throw error;
    }
  }

  /**
   * Extract image metadata
   */
  private static async extractImageMetadata(filePath: string): Promise<any> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha,
        exif: metadata.exif
      };
    } catch (error) {
      logger.warn('Failed to extract image metadata', {
        filePath,
        error
      });
      return {};
    }
  }

  /**
   * Check if file is an image
   */
  private static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Clean up temporary files
   */
  static cleanupTempFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (files) {
        let filesToCleanup: Express.Multer.File[] = [];
        
        if (Array.isArray(files)) {
          filesToCleanup = files;
        } else if (typeof files === 'object') {
          filesToCleanup = Object.values(files).flat();
        }

        for (const file of filesToCleanup) {
          try {
            await fs.unlink(file.path);
          } catch (error) {
            logger.warn('Failed to cleanup temp file', {
              filename: file.filename,
              path: file.path,
              error
            });
          }
        }
      }
      
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (error) {
          logger.warn('Failed to cleanup temp file', {
            filename: req.file.filename,
            path: req.file.path,
            error
          });
        }
      }
    } catch (error) {
      logger.error('Cleanup process failed', { error });
    }
    
    next();
  };

  /**
   * Handle multer errors
   */
  static handleMulterError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (error instanceof MulterError) {
      let message = 'File upload error';
      let code = ErrorCodes.FILE_UPLOAD_ERROR;
      
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = `File too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB`;
          code = ErrorCodes.VALIDATION_FILE_TOO_LARGE;
          break;
        case 'LIMIT_FILE_COUNT':
          message = `Too many files. Maximum is ${this.config.maxFiles}`;
          code = ErrorCodes.VALIDATION_TOO_MANY_FILES;
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Unexpected file field';
          code = ErrorCodes.VALIDATION_UNEXPECTED_FILE;
          break;
        case 'LIMIT_PART_COUNT':
          message = 'Too many parts in multipart form';
          code = ErrorCodes.VALIDATION_TOO_MANY_PARTS;
          break;
        case 'LIMIT_FIELD_KEY':
          message = 'Field name too long';
          code = ErrorCodes.VALIDATION_FIELD_NAME_TOO_LONG;
          break;
        case 'LIMIT_FIELD_VALUE':
          message = 'Field value too long';
          code = ErrorCodes.VALIDATION_FIELD_VALUE_TOO_LONG;
          break;
        case 'LIMIT_FIELD_COUNT':
          message = 'Too many fields';
          code = ErrorCodes.VALIDATION_TOO_MANY_FIELDS;
          break;
      }
      
      logSecurityEvent(
        req,
        'MULTER_ERROR',
        {
          errorCode: error.code,
          message: error.message,
          field: error.field
        },
        'medium'
      );
      
      return next(new AppError(message, 400, code));
    }
    
    next(error);
  };

  /**
   * Delete uploaded file
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      
      // Also delete thumbnail if it exists
      const filename = path.basename(filePath);
      const thumbnailPath = path.join(this.config.thumbnailPath, `thumb_${filename}`);
      
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Thumbnail might not exist, ignore error
      }
      
      logger.info('File deleted', { filePath });
    } catch (error) {
      logger.error('Failed to delete file', { filePath, error });
      throw new AppError(
        'Failed to delete file',
        500,
        ErrorCodes.FILE_DELETE_ERROR
      );
    }
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<UploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  static getConfig(): UploadConfig {
    return { ...this.config };
  }
}

// Export middleware functions
export const uploadSingle = UploadMiddleware.single;
export const uploadMultiple = UploadMiddleware.multiple;
export const uploadFields = UploadMiddleware.fields;
export const processFiles = UploadMiddleware.processFiles;
export const cleanupTempFiles = UploadMiddleware.cleanupTempFiles;
export const handleMulterError = UploadMiddleware.handleMulterError;
export const deleteFile = UploadMiddleware.deleteFile;

// Common upload configurations
export const inspectionPhotoUpload = [
  UploadMiddleware.multiple('photos', 10),
  UploadMiddleware.handleMulterError,
  UploadMiddleware.processFiles
];

export const documentUpload = [
  UploadMiddleware.single('document'),
  UploadMiddleware.handleMulterError,
  UploadMiddleware.processFiles
];

export const avatarUpload = [
  UploadMiddleware.single('avatar'),
  UploadMiddleware.handleMulterError,
  UploadMiddleware.processFiles
];