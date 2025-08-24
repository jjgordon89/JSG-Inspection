/**
 * File Utilities
 * Helper functions for file operations, validation, and processing
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import { CONSTANTS, UtilityResponse } from './index';

const pipelineAsync = promisify(pipeline);

// File validation
export interface FileValidationOptions {
  maxSize?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  requireExtension?: boolean;
  checkMagicBytes?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    size: number;
    extension: string;
    mimeType?: string;
    encoding?: string;
  };
}

/**
 * Validate file based on various criteria
 */
export async function validateFile(
  filePath: string,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    metadata: {
      size: 0,
      extension: '',
    },
  };

  try {
    // Check if file exists
    const stats = await fs.stat(filePath);
    result.metadata.size = stats.size;

    // Extract extension
    const ext = path.extname(filePath).toLowerCase().slice(1);
    result.metadata.extension = ext;

    // Validate file size
    const maxSize = options.maxSize || CONSTANTS.MAX_FILE_SIZE;
    if (stats.size > maxSize) {
      result.errors.push(`File size (${formatFileSize(stats.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
      result.isValid = false;
    }

    // Validate extension
    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      if (!options.allowedExtensions.includes(ext)) {
        result.errors.push(`File extension '${ext}' is not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`);
        result.isValid = false;
      }
    }

    // Check if extension is required
    if (options.requireExtension && !ext) {
      result.errors.push('File must have an extension');
      result.isValid = false;
    }

    // Validate MIME type if provided
    if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      const mimeType = await getMimeType(filePath);
      result.metadata.mimeType = mimeType;
      
      if (!options.allowedMimeTypes.includes(mimeType)) {
        result.errors.push(`MIME type '${mimeType}' is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`);
        result.isValid = false;
      }
    }

    // Check magic bytes if requested
    if (options.checkMagicBytes) {
      const isValidMagicBytes = await validateMagicBytes(filePath, ext);
      if (!isValidMagicBytes) {
        result.errors.push('File content does not match its extension (invalid magic bytes)');
        result.isValid = false;
      }
    }

  } catch (error) {
    result.errors.push(`File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Get MIME type from file
 */
export async function getMimeType(filePath: string): Promise<string> {
  try {
    const { fileTypeFromFile } = await import('file-type');
    const fileType = await fileTypeFromFile(filePath);
    return fileType?.mime || 'application/octet-stream';
  } catch {
    // Fallback to extension-based detection
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return getMimeTypeFromExtension(ext);
  }
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    
    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Validate file magic bytes
 */
export async function validateMagicBytes(filePath: string, expectedExtension: string): Promise<boolean> {
  try {
    const buffer = Buffer.alloc(16);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 16, 0);
    await fileHandle.close();

    const magicBytes = buffer.toString('hex').toUpperCase();
    
    // Magic byte signatures
    const signatures: Record<string, string[]> = {
      jpg: ['FFD8FF'],
      jpeg: ['FFD8FF'],
      png: ['89504E47'],
      gif: ['474946'],
      pdf: ['255044462D'],
      zip: ['504B0304', '504B0506', '504B0708'],
      mp4: ['66747970'],
      mp3: ['494433', 'FFFB', 'FFF3', 'FFF2'],
    };

    const expectedSignatures = signatures[expectedExtension.toLowerCase()];
    if (!expectedSignatures) {
      return true; // No signature to validate
    }

    return expectedSignatures.some(signature => magicBytes.startsWith(signature));
  } catch {
    return true; // If we can't validate, assume it's valid
  }
}

/**
 * Calculate file checksum
 */
export async function calculateChecksum(filePath: string, algorithm: string = 'sha256'): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Copy file with progress tracking
 */
export async function copyFileWithProgress(
  source: string,
  destination: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const stats = await fs.stat(source);
  const totalSize = stats.size;
  let copiedSize = 0;

  const readStream = createReadStream(source);
  const writeStream = createWriteStream(destination);

  if (onProgress) {
    readStream.on('data', (chunk) => {
      copiedSize += chunk.length;
      const progress = (copiedSize / totalSize) * 100;
      onProgress(Math.round(progress));
    });
  }

  await pipelineAsync(readStream, writeStream);
}

/**
 * Move file (rename with fallback to copy+delete)
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  try {
    await fs.rename(source, destination);
  } catch (error) {
    // If rename fails (e.g., cross-device), copy and delete
    await copyFileWithProgress(source, destination);
    await fs.unlink(source);
  }
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase().slice(1);
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const uniqueName = `${prefix ? prefix + '_' : ''}${name}_${timestamp}_${random}${ext}`;
  return uniqueName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file info
 */
export async function getFileInfo(filePath: string): Promise<{
  name: string;
  size: number;
  extension: string;
  mimeType: string;
  created: Date;
  modified: Date;
  checksum: string;
}> {
  const stats = await fs.stat(filePath);
  const name = path.basename(filePath);
  const extension = getFileExtension(name);
  const mimeType = await getMimeType(filePath);
  const checksum = await calculateChecksum(filePath);

  return {
    name,
    size: stats.size,
    extension,
    mimeType,
    created: stats.birthtime,
    modified: stats.mtime,
    checksum,
  };
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(tempDir: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
  let cleanedCount = 0;
  
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        cleanedCount++;
      }
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
  
  return cleanedCount;
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return CONSTANTS.SUPPORTED_IMAGE_FORMATS.includes(ext);
}

/**
 * Check if file is document
 */
export function isDocumentFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return CONSTANTS.SUPPORTED_DOCUMENT_FORMATS.includes(ext);
}

/**
 * Check if file is video
 */
export function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return CONSTANTS.SUPPORTED_VIDEO_FORMATS.includes(ext);
}

/**
 * Check if file is audio
 */
export function isAudioFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return CONSTANTS.SUPPORTED_AUDIO_FORMATS.includes(ext);
}

/**
 * Get file category based on extension
 */
export function getFileCategory(filename: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
  if (isImageFile(filename)) return 'image';
  if (isDocumentFile(filename)) return 'document';
  if (isVideoFile(filename)) return 'video';
  if (isAudioFile(filename)) return 'audio';
  return 'other';
}