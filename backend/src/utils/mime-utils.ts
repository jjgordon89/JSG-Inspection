/**
 * MIME Type Utilities
 * Helper functions for MIME type detection, validation, and manipulation
 */

import { readFileSync } from 'fs';
import { extname } from 'path';

// MIME type interface
export interface MimeTypeInfo {
  type: string;
  subtype: string;
  fullType: string;
  extensions: string[];
  category: MimeCategory;
  description: string;
  isBinary: boolean;
  isCompressible: boolean;
}

// MIME category enum
export enum MimeCategory {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  TEXT = 'text',
  APPLICATION = 'application',
  FONT = 'font',
  MODEL = 'model',
  MULTIPART = 'multipart',
  MESSAGE = 'message',
  UNKNOWN = 'unknown'
}

// Magic bytes interface
export interface MagicBytes {
  signature: number[];
  offset: number;
  mimeType: string;
  description: string;
}

// MIME type database
const MIME_TYPES: Record<string, MimeTypeInfo> = {
  // Images
  'image/jpeg': {
    type: 'image',
    subtype: 'jpeg',
    fullType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg', '.jpe'],
    category: MimeCategory.IMAGE,
    description: 'JPEG Image',
    isBinary: true,
    isCompressible: false
  },
  'image/png': {
    type: 'image',
    subtype: 'png',
    fullType: 'image/png',
    extensions: ['.png'],
    category: MimeCategory.IMAGE,
    description: 'PNG Image',
    isBinary: true,
    isCompressible: false
  },
  'image/gif': {
    type: 'image',
    subtype: 'gif',
    fullType: 'image/gif',
    extensions: ['.gif'],
    category: MimeCategory.IMAGE,
    description: 'GIF Image',
    isBinary: true,
    isCompressible: false
  },
  'image/webp': {
    type: 'image',
    subtype: 'webp',
    fullType: 'image/webp',
    extensions: ['.webp'],
    category: MimeCategory.IMAGE,
    description: 'WebP Image',
    isBinary: true,
    isCompressible: false
  },
  'image/svg+xml': {
    type: 'image',
    subtype: 'svg+xml',
    fullType: 'image/svg+xml',
    extensions: ['.svg'],
    category: MimeCategory.IMAGE,
    description: 'SVG Vector Image',
    isBinary: false,
    isCompressible: true
  },
  'image/bmp': {
    type: 'image',
    subtype: 'bmp',
    fullType: 'image/bmp',
    extensions: ['.bmp'],
    category: MimeCategory.IMAGE,
    description: 'Bitmap Image',
    isBinary: true,
    isCompressible: false
  },
  'image/tiff': {
    type: 'image',
    subtype: 'tiff',
    fullType: 'image/tiff',
    extensions: ['.tiff', '.tif'],
    category: MimeCategory.IMAGE,
    description: 'TIFF Image',
    isBinary: true,
    isCompressible: false
  },
  'image/x-icon': {
    type: 'image',
    subtype: 'x-icon',
    fullType: 'image/x-icon',
    extensions: ['.ico'],
    category: MimeCategory.IMAGE,
    description: 'Icon Image',
    isBinary: true,
    isCompressible: false
  },

  // Videos
  'video/mp4': {
    type: 'video',
    subtype: 'mp4',
    fullType: 'video/mp4',
    extensions: ['.mp4', '.m4v'],
    category: MimeCategory.VIDEO,
    description: 'MP4 Video',
    isBinary: true,
    isCompressible: false
  },
  'video/webm': {
    type: 'video',
    subtype: 'webm',
    fullType: 'video/webm',
    extensions: ['.webm'],
    category: MimeCategory.VIDEO,
    description: 'WebM Video',
    isBinary: true,
    isCompressible: false
  },
  'video/quicktime': {
    type: 'video',
    subtype: 'quicktime',
    fullType: 'video/quicktime',
    extensions: ['.mov'],
    category: MimeCategory.VIDEO,
    description: 'QuickTime Video',
    isBinary: true,
    isCompressible: false
  },
  'video/x-msvideo': {
    type: 'video',
    subtype: 'x-msvideo',
    fullType: 'video/x-msvideo',
    extensions: ['.avi'],
    category: MimeCategory.VIDEO,
    description: 'AVI Video',
    isBinary: true,
    isCompressible: false
  },

  // Audio
  'audio/mpeg': {
    type: 'audio',
    subtype: 'mpeg',
    fullType: 'audio/mpeg',
    extensions: ['.mp3'],
    category: MimeCategory.AUDIO,
    description: 'MP3 Audio',
    isBinary: true,
    isCompressible: false
  },
  'audio/wav': {
    type: 'audio',
    subtype: 'wav',
    fullType: 'audio/wav',
    extensions: ['.wav'],
    category: MimeCategory.AUDIO,
    description: 'WAV Audio',
    isBinary: true,
    isCompressible: false
  },
  'audio/ogg': {
    type: 'audio',
    subtype: 'ogg',
    fullType: 'audio/ogg',
    extensions: ['.ogg'],
    category: MimeCategory.AUDIO,
    description: 'OGG Audio',
    isBinary: true,
    isCompressible: false
  },
  'audio/mp4': {
    type: 'audio',
    subtype: 'mp4',
    fullType: 'audio/mp4',
    extensions: ['.m4a'],
    category: MimeCategory.AUDIO,
    description: 'MP4 Audio',
    isBinary: true,
    isCompressible: false
  },

  // Documents
  'application/pdf': {
    type: 'application',
    subtype: 'pdf',
    fullType: 'application/pdf',
    extensions: ['.pdf'],
    category: MimeCategory.DOCUMENT,
    description: 'PDF Document',
    isBinary: true,
    isCompressible: false
  },
  'application/msword': {
    type: 'application',
    subtype: 'msword',
    fullType: 'application/msword',
    extensions: ['.doc'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft Word Document',
    isBinary: true,
    isCompressible: false
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.wordprocessingml.document',
    fullType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft Word Document (OpenXML)',
    isBinary: true,
    isCompressible: false
  },
  'application/vnd.ms-excel': {
    type: 'application',
    subtype: 'vnd.ms-excel',
    fullType: 'application/vnd.ms-excel',
    extensions: ['.xls'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft Excel Spreadsheet',
    isBinary: true,
    isCompressible: false
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fullType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft Excel Spreadsheet (OpenXML)',
    isBinary: true,
    isCompressible: false
  },
  'application/vnd.ms-powerpoint': {
    type: 'application',
    subtype: 'vnd.ms-powerpoint',
    fullType: 'application/vnd.ms-powerpoint',
    extensions: ['.ppt'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft PowerPoint Presentation',
    isBinary: true,
    isCompressible: false
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.presentationml.presentation',
    fullType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
    category: MimeCategory.DOCUMENT,
    description: 'Microsoft PowerPoint Presentation (OpenXML)',
    isBinary: true,
    isCompressible: false
  },

  // Text
  'text/plain': {
    type: 'text',
    subtype: 'plain',
    fullType: 'text/plain',
    extensions: ['.txt'],
    category: MimeCategory.TEXT,
    description: 'Plain Text',
    isBinary: false,
    isCompressible: true
  },
  'text/html': {
    type: 'text',
    subtype: 'html',
    fullType: 'text/html',
    extensions: ['.html', '.htm'],
    category: MimeCategory.TEXT,
    description: 'HTML Document',
    isBinary: false,
    isCompressible: true
  },
  'text/css': {
    type: 'text',
    subtype: 'css',
    fullType: 'text/css',
    extensions: ['.css'],
    category: MimeCategory.TEXT,
    description: 'CSS Stylesheet',
    isBinary: false,
    isCompressible: true
  },
  'text/javascript': {
    type: 'text',
    subtype: 'javascript',
    fullType: 'text/javascript',
    extensions: ['.js'],
    category: MimeCategory.TEXT,
    description: 'JavaScript',
    isBinary: false,
    isCompressible: true
  },
  'text/csv': {
    type: 'text',
    subtype: 'csv',
    fullType: 'text/csv',
    extensions: ['.csv'],
    category: MimeCategory.TEXT,
    description: 'CSV Data',
    isBinary: false,
    isCompressible: true
  },
  'text/xml': {
    type: 'text',
    subtype: 'xml',
    fullType: 'text/xml',
    extensions: ['.xml'],
    category: MimeCategory.TEXT,
    description: 'XML Document',
    isBinary: false,
    isCompressible: true
  },

  // Application
  'application/json': {
    type: 'application',
    subtype: 'json',
    fullType: 'application/json',
    extensions: ['.json'],
    category: MimeCategory.APPLICATION,
    description: 'JSON Data',
    isBinary: false,
    isCompressible: true
  },
  'application/xml': {
    type: 'application',
    subtype: 'xml',
    fullType: 'application/xml',
    extensions: ['.xml'],
    category: MimeCategory.APPLICATION,
    description: 'XML Application',
    isBinary: false,
    isCompressible: true
  },
  'application/zip': {
    type: 'application',
    subtype: 'zip',
    fullType: 'application/zip',
    extensions: ['.zip'],
    category: MimeCategory.APPLICATION,
    description: 'ZIP Archive',
    isBinary: true,
    isCompressible: false
  },
  'application/x-rar-compressed': {
    type: 'application',
    subtype: 'x-rar-compressed',
    fullType: 'application/x-rar-compressed',
    extensions: ['.rar'],
    category: MimeCategory.APPLICATION,
    description: 'RAR Archive',
    isBinary: true,
    isCompressible: false
  },
  'application/x-7z-compressed': {
    type: 'application',
    subtype: 'x-7z-compressed',
    fullType: 'application/x-7z-compressed',
    extensions: ['.7z'],
    category: MimeCategory.APPLICATION,
    description: '7-Zip Archive',
    isBinary: true,
    isCompressible: false
  },
  'application/octet-stream': {
    type: 'application',
    subtype: 'octet-stream',
    fullType: 'application/octet-stream',
    extensions: ['.bin'],
    category: MimeCategory.APPLICATION,
    description: 'Binary Data',
    isBinary: true,
    isCompressible: false
  }
};

// Magic bytes signatures for file type detection
const MAGIC_BYTES: MagicBytes[] = [
  // Images
  { signature: [0xFF, 0xD8, 0xFF], offset: 0, mimeType: 'image/jpeg', description: 'JPEG Image' },
  { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0, mimeType: 'image/png', description: 'PNG Image' },
  { signature: [0x47, 0x49, 0x46, 0x38], offset: 0, mimeType: 'image/gif', description: 'GIF Image' },
  { signature: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'image/webp', description: 'WebP Image' },
  { signature: [0x42, 0x4D], offset: 0, mimeType: 'image/bmp', description: 'BMP Image' },
  { signature: [0x49, 0x49, 0x2A, 0x00], offset: 0, mimeType: 'image/tiff', description: 'TIFF Image (little-endian)' },
  { signature: [0x4D, 0x4D, 0x00, 0x2A], offset: 0, mimeType: 'image/tiff', description: 'TIFF Image (big-endian)' },
  { signature: [0x00, 0x00, 0x01, 0x00], offset: 0, mimeType: 'image/x-icon', description: 'ICO Image' },

  // Videos
  { signature: [0x66, 0x74, 0x79, 0x70], offset: 4, mimeType: 'video/mp4', description: 'MP4 Video' },
  { signature: [0x1A, 0x45, 0xDF, 0xA3], offset: 0, mimeType: 'video/webm', description: 'WebM Video' },
  { signature: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74], offset: 0, mimeType: 'video/quicktime', description: 'QuickTime Video' },
  { signature: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'video/x-msvideo', description: 'AVI Video' },

  // Audio
  { signature: [0xFF, 0xFB], offset: 0, mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  { signature: [0xFF, 0xF3], offset: 0, mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  { signature: [0xFF, 0xF2], offset: 0, mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  { signature: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'audio/wav', description: 'WAV Audio' },
  { signature: [0x4F, 0x67, 0x67, 0x53], offset: 0, mimeType: 'audio/ogg', description: 'OGG Audio' },

  // Documents
  { signature: [0x25, 0x50, 0x44, 0x46], offset: 0, mimeType: 'application/pdf', description: 'PDF Document' },
  { signature: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], offset: 0, mimeType: 'application/msword', description: 'Microsoft Office Document' },
  { signature: [0x50, 0x4B, 0x03, 0x04], offset: 0, mimeType: 'application/zip', description: 'ZIP Archive or Office Document' },
  { signature: [0x50, 0x4B, 0x05, 0x06], offset: 0, mimeType: 'application/zip', description: 'ZIP Archive (empty)' },
  { signature: [0x50, 0x4B, 0x07, 0x08], offset: 0, mimeType: 'application/zip', description: 'ZIP Archive (spanned)' },

  // Archives
  { signature: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00], offset: 0, mimeType: 'application/x-rar-compressed', description: 'RAR Archive' },
  { signature: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], offset: 0, mimeType: 'application/x-7z-compressed', description: '7-Zip Archive' }
];

// Extension to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {};

// Build extension mapping
Object.values(MIME_TYPES).forEach(mimeInfo => {
  mimeInfo.extensions.forEach(ext => {
    EXTENSION_TO_MIME[ext.toLowerCase()] = mimeInfo.fullType;
  });
});

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
  const ext = extension.toLowerCase();
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  return EXTENSION_TO_MIME[normalizedExt] || null;
}

/**
 * Get MIME type from file path
 */
export function getMimeTypeFromPath(filePath: string): string | null {
  const extension = extname(filePath);
  return getMimeTypeFromExtension(extension);
}

/**
 * Detect MIME type from file buffer using magic bytes
 */
export function detectMimeTypeFromBuffer(buffer: Buffer): string | null {
  for (const magic of MAGIC_BYTES) {
    if (buffer.length >= magic.offset + magic.signature.length) {
      const matches = magic.signature.every((byte, index) => {
        return buffer[magic.offset + index] === byte;
      });
      
      if (matches) {
        return magic.mimeType;
      }
    }
  }
  
  return null;
}

/**
 * Detect MIME type from file path using magic bytes
 */
export function detectMimeTypeFromFile(filePath: string): string | null {
  try {
    const buffer = readFileSync(filePath);
    return detectMimeTypeFromBuffer(buffer.slice(0, 512)); // Read first 512 bytes
  } catch (error) {
    return null;
  }
}

/**
 * Get comprehensive MIME type information
 */
export function getMimeTypeInfo(mimeType: string): MimeTypeInfo | null {
  return MIME_TYPES[mimeType.toLowerCase()] || null;
}

/**
 * Get MIME type category
 */
export function getMimeTypeCategory(mimeType: string): MimeCategory {
  const info = getMimeTypeInfo(mimeType);
  return info?.category || MimeCategory.UNKNOWN;
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return getMimeTypeCategory(mimeType) === MimeCategory.IMAGE;
}

/**
 * Check if MIME type is a video
 */
export function isVideoMimeType(mimeType: string): boolean {
  return getMimeTypeCategory(mimeType) === MimeCategory.VIDEO;
}

/**
 * Check if MIME type is audio
 */
export function isAudioMimeType(mimeType: string): boolean {
  return getMimeTypeCategory(mimeType) === MimeCategory.AUDIO;
}

/**
 * Check if MIME type is a document
 */
export function isDocumentMimeType(mimeType: string): boolean {
  return getMimeTypeCategory(mimeType) === MimeCategory.DOCUMENT;
}

/**
 * Check if MIME type is text
 */
export function isTextMimeType(mimeType: string): boolean {
  return getMimeTypeCategory(mimeType) === MimeCategory.TEXT;
}

/**
 * Check if MIME type is binary
 */
export function isBinaryMimeType(mimeType: string): boolean {
  const info = getMimeTypeInfo(mimeType);
  return info?.isBinary ?? true; // Default to binary if unknown
}

/**
 * Check if MIME type is compressible
 */
export function isCompressibleMimeType(mimeType: string): boolean {
  const info = getMimeTypeInfo(mimeType);
  return info?.isCompressible ?? false; // Default to not compressible if unknown
}

/**
 * Get file extensions for a MIME type
 */
export function getExtensionsForMimeType(mimeType: string): string[] {
  const info = getMimeTypeInfo(mimeType);
  return info?.extensions || [];
}

/**
 * Get primary extension for a MIME type
 */
export function getPrimaryExtension(mimeType: string): string | null {
  const extensions = getExtensionsForMimeType(mimeType);
  return extensions.length > 0 ? extensions[0] : null;
}

/**
 * Validate MIME type format
 */
export function isValidMimeType(mimeType: string): boolean {
  const mimeRegex = /^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.+]*$/;
  return mimeRegex.test(mimeType);
}

/**
 * Parse MIME type into components
 */
export function parseMimeType(mimeType: string): { type: string; subtype: string; parameters: Record<string, string> } | null {
  const parts = mimeType.split(';');
  const mainType = parts[0].trim();
  
  if (!isValidMimeType(mainType)) {
    return null;
  }
  
  const [type, subtype] = mainType.split('/');
  const parameters: Record<string, string> = {};
  
  // Parse parameters
  for (let i = 1; i < parts.length; i++) {
    const param = parts[i].trim();
    const [key, value] = param.split('=');
    if (key && value) {
      parameters[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  }
  
  return { type, subtype, parameters };
}

/**
 * Build MIME type string with parameters
 */
export function buildMimeType(type: string, subtype: string, parameters?: Record<string, string>): string {
  let mimeType = `${type}/${subtype}`;
  
  if (parameters) {
    Object.entries(parameters).forEach(([key, value]) => {
      mimeType += `; ${key}=${value}`;
    });
  }
  
  return mimeType;
}

/**
 * Get MIME type with charset
 */
export function getMimeTypeWithCharset(mimeType: string, charset: string = 'utf-8'): string {
  if (isTextMimeType(mimeType) || mimeType.includes('json') || mimeType.includes('xml')) {
    return `${mimeType}; charset=${charset}`;
  }
  return mimeType;
}

/**
 * Check if file extension is allowed
 */
export function isAllowedExtension(extension: string, allowedExtensions: string[]): boolean {
  const normalizedExt = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  const normalizedAllowed = allowedExtensions.map(ext => 
    ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
  );
  return normalizedAllowed.includes(normalizedExt);
}

/**
 * Check if MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string, allowedMimeTypes: string[]): boolean {
  const normalizedMime = mimeType.toLowerCase();
  const normalizedAllowed = allowedMimeTypes.map(mime => mime.toLowerCase());
  
  // Check exact match
  if (normalizedAllowed.includes(normalizedMime)) {
    return true;
  }
  
  // Check wildcard patterns (e.g., "image/*")
  return normalizedAllowed.some(allowed => {
    if (allowed.endsWith('/*')) {
      const allowedType = allowed.slice(0, -2);
      return normalizedMime.startsWith(allowedType + '/');
    }
    return false;
  });
}

/**
 * Get MIME types by category
 */
export function getMimeTypesByCategory(category: MimeCategory): string[] {
  return Object.entries(MIME_TYPES)
    .filter(([, info]) => info.category === category)
    .map(([mimeType]) => mimeType);
}

/**
 * Get all supported MIME types
 */
export function getAllSupportedMimeTypes(): string[] {
  return Object.keys(MIME_TYPES);
}

/**
 * Get all supported extensions
 */
export function getAllSupportedExtensions(): string[] {
  return Object.keys(EXTENSION_TO_MIME);
}

/**
 * Create MIME type validator
 */
export function createMimeTypeValidator(allowedTypes: string[]) {
  return (mimeType: string): boolean => {
    return isAllowedMimeType(mimeType, allowedTypes);
  };
}

/**
 * Create extension validator
 */
export function createExtensionValidator(allowedExtensions: string[]) {
  return (extension: string): boolean => {
    return isAllowedExtension(extension, allowedExtensions);
  };
}

/**
 * Get content type header value
 */
export function getContentTypeHeader(filePath: string, charset?: string): string {
  const mimeType = getMimeTypeFromPath(filePath) || 'application/octet-stream';
  
  if (charset && (isTextMimeType(mimeType) || mimeType.includes('json') || mimeType.includes('xml'))) {
    return `${mimeType}; charset=${charset}`;
  }
  
  return mimeType;
}

/**
 * Sanitize MIME type
 */
export function sanitizeMimeType(mimeType: string): string {
  // Remove any potentially dangerous characters
  return mimeType.replace(/[^a-zA-Z0-9\/\-_.+;=\s]/g, '').trim();
}

// Export MIME constants
export const MIME_CONSTANTS = {
  CATEGORIES: MimeCategory,
  
  COMMON_IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  COMMON_VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  COMMON_AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  COMMON_DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  COMMON_TEXT: ['text/plain', 'text/html', 'text/css', 'text/javascript'],
  COMMON_ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  
  DEFAULT_MIME_TYPE: 'application/octet-stream',
  DEFAULT_CHARSET: 'utf-8'
};

// Export MIME type utilities
export type MimeTypeValidator = (mimeType: string) => boolean;
export type ExtensionValidator = (extension: string) => boolean;
export type MimeTypeDetector = (input: string | Buffer) => string | null;