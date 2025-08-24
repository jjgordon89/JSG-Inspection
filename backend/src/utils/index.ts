/**
 * Utilities Index
 * Central export point for all utility functions and helpers
 */

export { logger, stream, createCorrelationId, createRequestLogger } from './logger';
export { RateLimiter } from './rate-limiter';

// Export all utility functions
export * from './file-utils';
export * from './validation-utils';
export * from './crypto-utils';
export * from './date-utils';
export * from './string-utils';
export * from './image-utils';
export * from './compression-utils';
export * from './mime-utils';
export * from './path-utils';
export * from './async-utils';
export * from './error-utils';
export * from './performance-utils';
export * from './websocket';

// Re-export commonly used utilities for convenience
export {
  // File utilities
  validateFile,
  getMimeType,
  calculateChecksum,
  copyFileWithProgress,
  ensureDirectory,
  generateUniqueFilename,
  formatFileSize,
  getFileInfo,
  cleanupTempFiles
} from './file-utils';

export {
  // Validation utilities
  validateEmail,
  validatePhone,
  validateUrl,
  validateUuid,
  validatePassword,
  sanitizeString,
  sanitizeFilename,
  validateCoordinates,
  validateDateRange,
  validatePagination
} from './validation-utils';

export {
  // Crypto utilities
  generateRandomString,
  generateUuid,
  generateToken,
  hashPassword,
  verifyPassword,
  hashData,
  generateHmac,
  verifyHmac,
  encryptData,
  decryptData,
  generateApiKey
} from './crypto-utils';

export {
  // Date utilities
  getCurrentDate,
  getCurrentISOString,
  createDate,
  formatDate,
  parseDate,
  isValidDate,
  addDuration,
  subtractDuration,
  getDateDifference,
  isDateInRange,
  formatDuration,
  formatRelativeTime
} from './date-utils';

export {
  // String utilities
  isEmpty,
  isNotEmpty,
  capitalize,
  capitalizeWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  padStart,
  padEnd,
  removeWhitespace,
  normalizeWhitespace,
  slugify,
  generateRandomString as generateRandomStringUtil,
  escapeHtml,
  unescapeHtml,
  maskSensitiveData
} from './string-utils';

export {
  // Image utilities
  processImage,
  createThumbnail,
  getImageMetadata,
  optimizeForWeb,
  addWatermark,
  convertFormat,
  createMultipleSizes,
  validateImageDimensions
} from './image-utils';

export {
  // Compression utilities
  gzipCompress,
  gzipDecompress,
  deflateCompress,
  deflateDecompress,
  brotliCompress,
  brotliDecompress,
  compressFile,
  decompressFile,
  compressString,
  decompressString
} from './compression-utils';

export {
  // MIME utilities
  getMimeTypeFromExtension,
  getMimeTypeFromPath,
  detectMimeTypeFromBuffer,
  detectMimeTypeFromFile,
  getMimeTypeInfo,
  getMimeTypeCategory,
  isImageMimeType,
  isVideoMimeType,
  isAudioMimeType,
  isDocumentMimeType,
  isTextMimeType,
  isBinaryMimeType,
  isCompressibleMimeType,
  isAllowedMimeType,
  isAllowedExtension
} from './mime-utils';

export {
  // Path utilities
  validatePath,
  createSafePath,
  getPathInfo,
  pathExists,
  isAccessible,
  ensureDirectoryExists,
  getRelativePath,
  getAbsolutePath,
  getFileExtension,
  changeExtension,
  addFilenameSuffix,
  generateUniqueFilename as generateUniqueFilenameUtil,
  normalizePathSeparators
} from './path-utils';

export {
  // Async utilities
  delay,
  timeout,
  retry,
  retryWithBackoff,
  limitConcurrency,
  processBatch,
  timeAsync,
  executeWithRetryAndTiming,
  debounceAsync,
  throttleAsync,
  promiseAllSettledWithResults,
  raceWithTimeout,
  memoizeAsync,
  createCancellablePromise,
  waitForCondition
} from './async-utils';

export {
  // Error utilities
  AppError,
  createStructuredError,
  logError,
  isRetryableError,
  executeWithRetry,
  wrapAsyncFunction,
  createErrorContext,
  sanitizeErrorMessage,
  getErrorSummary,
  shouldReportError,
  formatErrorForApi
} from './error-utils';

export {
  // Performance utilities
  PerformanceMonitor,
  performanceMonitor,
  timed,
  profiled,
  timeFunction,
  benchmark,
  createSampler,
  formatBytes,
  formatDuration as formatPerformanceDuration,
  getSystemPerformance,
  createPerformanceReport
} from './performance-utils';

// Common utility types
export interface UtilityResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ProcessingOptions {
  timeout?: number;
  retries?: number;
  batchSize?: number;
  parallel?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Common constants
export const CONSTANTS = {
  // File constants
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES_PER_UPLOAD: 10,
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'],
  SUPPORTED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  
  // Image processing
  DEFAULT_IMAGE_QUALITY: 85,
  THUMBNAIL_SIZE: 200,
  MAX_IMAGE_DIMENSION: 4096,
  
  // Security
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  
  // Rate limiting
  DEFAULT_RATE_LIMIT: 100,
  DEFAULT_RATE_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 300000, // 5 minutes
  AI_PROCESSING_TIMEOUT: 120000, // 2 minutes
} as const;

// Environment helpers
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
export const isTest = (): boolean => process.env.NODE_ENV === 'test';

// Type guards
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isObject = (value: any): value is object => value !== null && typeof value === 'object';
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isDate = (value: any): value is Date => value instanceof Date && !isNaN(value.getTime());

// Common error messages
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  INTERNAL_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  PROCESSING_FAILED: 'File processing failed',
  NETWORK_ERROR: 'Network error',
  TIMEOUT_ERROR: 'Operation timed out',
  DATABASE_ERROR: 'Database operation failed',
  AI_SERVICE_ERROR: 'AI service error',
  SYNC_ERROR: 'Synchronization error',
} as const;