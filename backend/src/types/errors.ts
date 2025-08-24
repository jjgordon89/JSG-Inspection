/**
 * Error Types and Custom Error Classes
 * Centralized error handling definitions
 */

// Base error interface
export interface BaseError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp?: string;
  correlationId?: string;
  stack?: string;
}

// Error codes enum
export enum ErrorCodes {
  // Authentication errors (1000-1099)
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  TOKEN_INVALID = 'AUTH_003',
  UNAUTHORIZED = 'AUTH_004',
  FORBIDDEN = 'AUTH_005',
  ACCOUNT_LOCKED = 'AUTH_006',
  PASSWORD_EXPIRED = 'AUTH_007',
  TWO_FACTOR_REQUIRED = 'AUTH_008',
  REFRESH_TOKEN_INVALID = 'AUTH_009',
  SESSION_EXPIRED = 'AUTH_010',

  // Validation errors (1100-1199)
  VALIDATION_FAILED = 'VAL_001',
  REQUIRED_FIELD_MISSING = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',
  INVALID_LENGTH = 'VAL_004',
  INVALID_RANGE = 'VAL_005',
  DUPLICATE_VALUE = 'VAL_006',
  INVALID_ENUM_VALUE = 'VAL_007',
  INVALID_DATE_FORMAT = 'VAL_008',
  INVALID_EMAIL_FORMAT = 'VAL_009',
  INVALID_PHONE_FORMAT = 'VAL_010',

  // Database errors (1200-1299)
  DATABASE_CONNECTION_FAILED = 'DB_001',
  DATABASE_QUERY_FAILED = 'DB_002',
  RECORD_NOT_FOUND = 'DB_003',
  DUPLICATE_RECORD = 'DB_004',
  FOREIGN_KEY_CONSTRAINT = 'DB_005',
  DATABASE_TIMEOUT = 'DB_006',
  TRANSACTION_FAILED = 'DB_007',
  SCHEMA_VALIDATION_FAILED = 'DB_008',
  DATABASE_MIGRATION_FAILED = 'DB_009',
  DATABASE_BACKUP_FAILED = 'DB_010',

  // Business logic errors (1300-1399)
  BUSINESS_RULE_VIOLATION = 'BIZ_001',
  INSUFFICIENT_PERMISSIONS = 'BIZ_002',
  RESOURCE_LOCKED = 'BIZ_003',
  OPERATION_NOT_ALLOWED = 'BIZ_004',
  QUOTA_EXCEEDED = 'BIZ_005',
  WORKFLOW_VIOLATION = 'BIZ_006',
  DEPENDENCY_VIOLATION = 'BIZ_007',
  STATE_TRANSITION_INVALID = 'BIZ_008',
  RESOURCE_CONFLICT = 'BIZ_009',
  PRECONDITION_FAILED = 'BIZ_010',

  // File handling errors (1400-1499)
  FILE_NOT_FOUND = 'FILE_001',
  FILE_TOO_LARGE = 'FILE_002',
  INVALID_FILE_TYPE = 'FILE_003',
  FILE_UPLOAD_FAILED = 'FILE_004',
  FILE_PROCESSING_FAILED = 'FILE_005',
  STORAGE_QUOTA_EXCEEDED = 'FILE_006',
  FILE_CORRUPTED = 'FILE_007',
  FILE_ACCESS_DENIED = 'FILE_008',
  FILE_ALREADY_EXISTS = 'FILE_009',
  FILE_VIRUS_DETECTED = 'FILE_010',

  // AI/ML errors (1500-1599)
  AI_SERVICE_UNAVAILABLE = 'AI_001',
  AI_MODEL_NOT_FOUND = 'AI_002',
  AI_PROCESSING_FAILED = 'AI_003',
  AI_CONFIDENCE_TOO_LOW = 'AI_004',
  AI_QUOTA_EXCEEDED = 'AI_005',
  AI_MODEL_LOADING_FAILED = 'AI_006',
  AI_INVALID_INPUT = 'AI_007',
  AI_TIMEOUT = 'AI_008',
  AI_RATE_LIMIT_EXCEEDED = 'AI_009',
  AI_MODEL_DEPRECATED = 'AI_010',

  // Network/API errors (1600-1699)
  NETWORK_ERROR = 'NET_001',
  API_RATE_LIMIT_EXCEEDED = 'NET_002',
  EXTERNAL_SERVICE_UNAVAILABLE = 'NET_003',
  REQUEST_TIMEOUT = 'NET_004',
  INVALID_REQUEST_FORMAT = 'NET_005',
  PAYLOAD_TOO_LARGE = 'NET_006',
  UNSUPPORTED_MEDIA_TYPE = 'NET_007',
  METHOD_NOT_ALLOWED = 'NET_008',
  ENDPOINT_NOT_FOUND = 'NET_009',
  CORS_ERROR = 'NET_010',

  // Sync/Offline errors (1700-1799)
  SYNC_CONFLICT = 'SYNC_001',
  SYNC_FAILED = 'SYNC_002',
  OFFLINE_MODE_REQUIRED = 'SYNC_003',
  SYNC_VERSION_MISMATCH = 'SYNC_004',
  SYNC_DATA_CORRUPTED = 'SYNC_005',
  SYNC_QUOTA_EXCEEDED = 'SYNC_006',
  SYNC_TIMEOUT = 'SYNC_007',
  SYNC_DEVICE_NOT_REGISTERED = 'SYNC_008',
  SYNC_MERGE_CONFLICT = 'SYNC_009',
  SYNC_SCHEMA_MISMATCH = 'SYNC_010',

  // System errors (1800-1899)
  INTERNAL_SERVER_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  CONFIGURATION_ERROR = 'SYS_003',
  MEMORY_LIMIT_EXCEEDED = 'SYS_004',
  CPU_LIMIT_EXCEEDED = 'SYS_005',
  DISK_SPACE_FULL = 'SYS_006',
  HEALTH_CHECK_FAILED = 'SYS_007',
  MAINTENANCE_MODE = 'SYS_008',
  VERSION_MISMATCH = 'SYS_009',
  FEATURE_NOT_AVAILABLE = 'SYS_010',

  // Security errors (1900-1999)
  SECURITY_VIOLATION = 'SEC_001',
  SUSPICIOUS_ACTIVITY = 'SEC_002',
  IP_BLOCKED = 'SEC_003',
  MALICIOUS_REQUEST = 'SEC_004',
  ENCRYPTION_FAILED = 'SEC_005',
  CERTIFICATE_INVALID = 'SEC_006',
  SIGNATURE_VERIFICATION_FAILED = 'SEC_007',
  AUDIT_LOG_FAILED = 'SEC_008',
  DATA_BREACH_DETECTED = 'SEC_009',
  COMPLIANCE_VIOLATION = 'SEC_010'
}

// Custom error classes
export class AppError extends Error implements BaseError {
  public readonly name: string;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: Record<string, any>;
  public readonly timestamp: string;
  public readonly correlationId?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: number = 500,
    details: Record<string, any> = {},
    correlationId?: string,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      stack: this.stack
    };
  }
}

// Authentication errors
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: ErrorCodes = ErrorCodes.INVALID_CREDENTIALS,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 401, details, correlationId);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    code: ErrorCodes = ErrorCodes.FORBIDDEN,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 403, details, correlationId);
  }
}

export class TokenError extends AppError {
  constructor(
    message: string = 'Invalid token',
    code: ErrorCodes = ErrorCodes.TOKEN_INVALID,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 401, details, correlationId);
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly fields: ValidationFieldError[];

  constructor(
    message: string = 'Validation failed',
    fields: ValidationFieldError[] = [],
    code: ErrorCodes = ErrorCodes.VALIDATION_FAILED,
    correlationId?: string
  ) {
    super(message, code, 400, { fields }, correlationId);
    this.fields = fields;
  }
}

export interface ValidationFieldError {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

// Database errors
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    code: ErrorCodes = ErrorCodes.DATABASE_QUERY_FAILED,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 500, details, correlationId);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    resource?: string,
    id?: string,
    correlationId?: string
  ) {
    const details = resource && id ? { resource, id } : {};
    super(message, ErrorCodes.RECORD_NOT_FOUND, 404, details, correlationId);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    code: ErrorCodes = ErrorCodes.DUPLICATE_RECORD,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 409, details, correlationId);
  }
}

// Business logic errors
export class BusinessRuleError extends AppError {
  constructor(
    message: string = 'Business rule violation',
    rule: string,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(
      message,
      ErrorCodes.BUSINESS_RULE_VIOLATION,
      422,
      { rule, ...details },
      correlationId
    );
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    requiredPermission?: string,
    correlationId?: string
  ) {
    const details = requiredPermission ? { requiredPermission } : {};
    super(
      message,
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      403,
      details,
      correlationId
    );
  }
}

// File handling errors
export class FileError extends AppError {
  constructor(
    message: string = 'File operation failed',
    code: ErrorCodes = ErrorCodes.FILE_UPLOAD_FAILED,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 400, details, correlationId);
  }
}

export class FileTooLargeError extends FileError {
  constructor(
    maxSize: number,
    actualSize: number,
    correlationId?: string
  ) {
    super(
      `File too large. Maximum size: ${maxSize} bytes, actual size: ${actualSize} bytes`,
      ErrorCodes.FILE_TOO_LARGE,
      { maxSize, actualSize },
      correlationId
    );
  }
}

export class InvalidFileTypeError extends FileError {
  constructor(
    allowedTypes: string[],
    actualType: string,
    correlationId?: string
  ) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}, actual type: ${actualType}`,
      ErrorCodes.INVALID_FILE_TYPE,
      { allowedTypes, actualType },
      correlationId
    );
  }
}

// AI/ML errors
export class AIError extends AppError {
  constructor(
    message: string = 'AI processing failed',
    code: ErrorCodes = ErrorCodes.AI_PROCESSING_FAILED,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 500, details, correlationId);
  }
}

export class AIServiceUnavailableError extends AIError {
  constructor(
    service: string,
    correlationId?: string
  ) {
    super(
      `AI service unavailable: ${service}`,
      ErrorCodes.AI_SERVICE_UNAVAILABLE,
      { service },
      correlationId
    );
  }
}

export class AIConfidenceTooLowError extends AIError {
  constructor(
    confidence: number,
    threshold: number,
    correlationId?: string
  ) {
    super(
      `AI confidence too low: ${confidence} < ${threshold}`,
      ErrorCodes.AI_CONFIDENCE_TOO_LOW,
      { confidence, threshold },
      correlationId
    );
  }
}

// Network/API errors
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network error',
    code: ErrorCodes = ErrorCodes.NETWORK_ERROR,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 500, details, correlationId);
  }
}

export class RateLimitError extends AppError {
  constructor(
    limit: number,
    resetTime: Date,
    correlationId?: string
  ) {
    super(
      `Rate limit exceeded. Limit: ${limit}, reset time: ${resetTime.toISOString()}`,
      ErrorCodes.API_RATE_LIMIT_EXCEEDED,
      429,
      { limit, resetTime: resetTime.toISOString() },
      correlationId
    );
  }
}

export class ExternalServiceError extends NetworkError {
  constructor(
    service: string,
    statusCode?: number,
    correlationId?: string
  ) {
    super(
      `External service unavailable: ${service}`,
      ErrorCodes.EXTERNAL_SERVICE_UNAVAILABLE,
      { service, statusCode },
      correlationId
    );
  }
}

// Sync/Offline errors
export class SyncError extends AppError {
  constructor(
    message: string = 'Synchronization failed',
    code: ErrorCodes = ErrorCodes.SYNC_FAILED,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 500, details, correlationId);
  }
}

export class SyncConflictError extends SyncError {
  constructor(
    entity: string,
    entityId: string,
    serverData: any,
    clientData: any,
    correlationId?: string
  ) {
    super(
      `Sync conflict for ${entity} with ID ${entityId}`,
      ErrorCodes.SYNC_CONFLICT,
      { entity, entityId, serverData, clientData },
      correlationId
    );
  }
}

// System errors
export class SystemError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: ErrorCodes = ErrorCodes.INTERNAL_SERVER_ERROR,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 500, details, correlationId, false);
  }
}

export class ConfigurationError extends SystemError {
  constructor(
    configKey: string,
    correlationId?: string
  ) {
    super(
      `Configuration error: ${configKey}`,
      ErrorCodes.CONFIGURATION_ERROR,
      { configKey },
      correlationId
    );
  }
}

export class ServiceUnavailableError extends SystemError {
  constructor(
    service: string,
    correlationId?: string
  ) {
    super(
      `Service unavailable: ${service}`,
      ErrorCodes.SERVICE_UNAVAILABLE,
      { service },
      correlationId
    );
  }
}

// Security errors
export class SecurityError extends AppError {
  constructor(
    message: string = 'Security violation',
    code: ErrorCodes = ErrorCodes.SECURITY_VIOLATION,
    details: Record<string, any> = {},
    correlationId?: string
  ) {
    super(message, code, 403, details, correlationId);
  }
}

export class SuspiciousActivityError extends SecurityError {
  constructor(
    activity: string,
    ipAddress?: string,
    correlationId?: string
  ) {
    super(
      `Suspicious activity detected: ${activity}`,
      ErrorCodes.SUSPICIOUS_ACTIVITY,
      { activity, ipAddress },
      correlationId
    );
  }
}

// Error factory functions
export const createError = {
  authentication: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new AuthenticationError(message, code, details, correlationId),

  authorization: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new AuthorizationError(message, code, details, correlationId),

  validation: (message?: string, fields?: ValidationFieldError[], correlationId?: string) =>
    new ValidationError(message, fields, ErrorCodes.VALIDATION_FAILED, correlationId),

  notFound: (message?: string, resource?: string, id?: string, correlationId?: string) =>
    new NotFoundError(message, resource, id, correlationId),

  conflict: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new ConflictError(message, code, details, correlationId),

  businessRule: (message: string, rule: string, details?: Record<string, any>, correlationId?: string) =>
    new BusinessRuleError(message, rule, details, correlationId),

  database: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new DatabaseError(message, code, details, correlationId),

  file: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new FileError(message, code, details, correlationId),

  ai: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new AIError(message, code, details, correlationId),

  network: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new NetworkError(message, code, details, correlationId),

  sync: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new SyncError(message, code, details, correlationId),

  system: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new SystemError(message, code, details, correlationId),

  security: (message?: string, code?: ErrorCodes, details?: Record<string, any>, correlationId?: string) =>
    new SecurityError(message, code, details, correlationId)
};

// Error type guards
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: any): boolean => {
  return isAppError(error) && error.isOperational;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isFileError = (error: any): error is FileError => {
  return error instanceof FileError;
};

export const isAIError = (error: any): error is AIError => {
  return error instanceof AIError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isSyncError = (error: any): error is SyncError => {
  return error instanceof SyncError;
};

export const isSystemError = (error: any): error is SystemError => {
  return error instanceof SystemError;
};

export const isSecurityError = (error: any): error is SecurityError => {
  return error instanceof SecurityError;
};

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  timestamp: string;
  environment: string;
  version: string;
}

// Error reporting interface
export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  severity: ErrorSeverity;
  tags?: string[];
  fingerprint?: string;
  breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: string;
  message: string;
  category: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}