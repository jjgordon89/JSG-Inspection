/**
 * Middleware Index
 * Central export point for all middleware modules
 */

// Authentication middleware
export {
  AuthMiddleware,
  authenticate,
  optionalAuthenticate,
  authorize,
  authorizeRoles,
  authorizePermissions,
  authorizeTeamAccess,
  authorizeOwnerOrAdmin,
  requireRole,
  requirePermission,
  requireAnyRole,
  requireAnyPermission
} from './auth.middleware';

// Validation middleware
export {
  ValidationMiddleware,
  validateBody,
  validateParams,
  validateQuery,
  validateHeaders,
  commonSchemas,
  validationSchemas
} from './validation.middleware';

// Error handling middleware
export {
  ErrorMiddleware,
  handleError,
  handleNotFound,
  asyncHandler,
  handleValidationError,
  handleDatabaseError,
  handleAuthError,
  handleFileError,
  handleRateLimitError,
  createErrorResponse,
  sendErrorResponse
} from './error.middleware';

// Logging middleware
export {
  LoggingMiddleware,
  addCorrelationId,
  logRequest,
  logResponse,
  logPerformance,
  logSecurityEvent,
  logAuditEvent
} from './logging.middleware';

// Rate limiting middleware
export {
  RateLimitMiddleware,
  generalApiLimit,
  authLimit,
  uploadLimit,
  aiOperationLimit,
  searchLimit,
  reportGenerationLimit,
  customLimit,
  progressiveLimit,
  ipBasedLimit,
  burstProtection
} from './rate-limit.middleware';

// Security middleware
export {
  SecurityMiddleware,
  configureCors,
  configureHelmet,
  sanitizeInput,
  validateApiKey,
  limitRequestSize,
  securityHeaders,
  ipWhitelist,
  validateUserAgent,
  securityMiddlewareChain
} from './security.middleware';

// Upload middleware
export {
  UploadMiddleware,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processFiles,
  cleanupTempFiles,
  handleMulterError,
  deleteFile,
  inspectionPhotoUpload,
  documentUpload,
  avatarUpload
} from './upload.middleware';

// Common middleware chains
export const commonMiddleware = [
  addCorrelationId,
  logRequest,
  securityHeaders,
  validateUserAgent,
  sanitizeInput
];

export const protectedMiddleware = [
  ...commonMiddleware,
  authenticate
];

export const adminMiddleware = [
  ...protectedMiddleware,
  requireRole('admin')
];

export const managerMiddleware = [
  ...protectedMiddleware,
  requireAnyRole(['admin', 'manager'])
];

export const inspectorMiddleware = [
  ...protectedMiddleware,
  requireAnyRole(['admin', 'manager', 'inspector'])
];