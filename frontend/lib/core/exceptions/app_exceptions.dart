import 'package:flutter/foundation.dart';

/// Base exception class for all application exceptions
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic originalError;
  final StackTrace? stackTrace;

  const AppException(
    this.message, {
    this.code,
    this.originalError,
    this.stackTrace,
  });

  @override
  String toString() {
    if (kDebugMode) {
      return 'AppException: $message${code != null ? ' (Code: $code)' : ''}${originalError != null ? '\nOriginal: $originalError' : ''}';
    }
    return message;
  }
}

/// Network related exceptions
class NetworkException extends AppException {
  const NetworkException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory NetworkException.noConnection() {
    return const NetworkException(
      'No internet connection available',
      code: 'NO_CONNECTION',
    );
  }

  factory NetworkException.timeout() {
    return const NetworkException(
      'Request timeout',
      code: 'TIMEOUT',
    );
  }

  factory NetworkException.serverError(int statusCode, [String? message]) {
    return NetworkException(
      message ?? 'Server error occurred',
      code: 'SERVER_ERROR_$statusCode',
    );
  }

  factory NetworkException.badRequest([String? message]) {
    return NetworkException(
      message ?? 'Bad request',
      code: 'BAD_REQUEST',
    );
  }

  factory NetworkException.unauthorized([String? message]) {
    return NetworkException(
      message ?? 'Unauthorized access',
      code: 'UNAUTHORIZED',
    );
  }

  factory NetworkException.forbidden([String? message]) {
    return NetworkException(
      message ?? 'Access forbidden',
      code: 'FORBIDDEN',
    );
  }

  factory NetworkException.notFound([String? message]) {
    return NetworkException(
      message ?? 'Resource not found',
      code: 'NOT_FOUND',
    );
  }
}

/// Authentication related exceptions
class AuthException extends AppException {
  const AuthException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory AuthException.invalidCredentials() {
    return const AuthException(
      'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    );
  }

  factory AuthException.tokenExpired() {
    return const AuthException(
      'Session expired. Please login again',
      code: 'TOKEN_EXPIRED',
    );
  }

  factory AuthException.userNotFound() {
    return const AuthException(
      'User account not found',
      code: 'USER_NOT_FOUND',
    );
  }

  factory AuthException.emailAlreadyExists() {
    return const AuthException(
      'Email address is already registered',
      code: 'EMAIL_EXISTS',
    );
  }

  factory AuthException.weakPassword() {
    return const AuthException(
      'Password is too weak',
      code: 'WEAK_PASSWORD',
    );
  }

  factory AuthException.invalidEmail() {
    return const AuthException(
      'Invalid email address format',
      code: 'INVALID_EMAIL',
    );
  }

  factory AuthException.accountDisabled() {
    return const AuthException(
      'User account has been disabled',
      code: 'ACCOUNT_DISABLED',
    );
  }

  factory AuthException.tooManyRequests() {
    return const AuthException(
      'Too many login attempts. Please try again later',
      code: 'TOO_MANY_REQUESTS',
    );
  }
}

/// Database related exceptions
class DatabaseException extends AppException {
  const DatabaseException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory DatabaseException.connectionFailed() {
    return const DatabaseException(
      'Failed to connect to database',
      code: 'CONNECTION_FAILED',
    );
  }

  factory DatabaseException.queryFailed(String query, [dynamic error]) {
    return DatabaseException(
      'Database query failed: $query',
      code: 'QUERY_FAILED',
      originalError: error,
    );
  }

  factory DatabaseException.recordNotFound(String recordId) {
    return DatabaseException(
      'Record not found: $recordId',
      code: 'RECORD_NOT_FOUND',
    );
  }

  factory DatabaseException.duplicateKey(String field) {
    return DatabaseException(
      'Duplicate value for field: $field',
      code: 'DUPLICATE_KEY',
    );
  }

  factory DatabaseException.syncFailed() {
    return const DatabaseException(
      'Failed to synchronize data',
      code: 'SYNC_FAILED',
    );
  }
}

/// File system related exceptions
class FileException extends AppException {
  const FileException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory FileException.notFound(String filePath) {
    return FileException(
      'File not found: $filePath',
      code: 'FILE_NOT_FOUND',
    );
  }

  factory FileException.accessDenied(String filePath) {
    return FileException(
      'Access denied to file: $filePath',
      code: 'ACCESS_DENIED',
    );
  }

  factory FileException.uploadFailed(String fileName) {
    return FileException(
      'Failed to upload file: $fileName',
      code: 'UPLOAD_FAILED',
    );
  }

  factory FileException.downloadFailed(String fileName) {
    return FileException(
      'Failed to download file: $fileName',
      code: 'DOWNLOAD_FAILED',
    );
  }

  factory FileException.invalidFormat(String expectedFormat) {
    return FileException(
      'Invalid file format. Expected: $expectedFormat',
      code: 'INVALID_FORMAT',
    );
  }

  factory FileException.fileTooLarge(int maxSizeBytes) {
    return FileException(
      'File size exceeds limit of ${(maxSizeBytes / 1024 / 1024).toStringAsFixed(1)}MB',
      code: 'FILE_TOO_LARGE',
    );
  }
}

/// Validation related exceptions
class ValidationException extends AppException {
  final Map<String, List<String>>? fieldErrors;

  const ValidationException(
    super.message, {
    super.code,
    this.fieldErrors,
    super.originalError,
    super.stackTrace,
  });

  factory ValidationException.required(String fieldName) {
    return ValidationException(
      '$fieldName is required',
      code: 'FIELD_REQUIRED',
      fieldErrors: {
        fieldName: ['This field is required']
      },
    );
  }

  factory ValidationException.invalidFormat(String fieldName, String format) {
    return ValidationException(
      'Invalid format for $fieldName. Expected: $format',
      code: 'INVALID_FORMAT',
      fieldErrors: {
        fieldName: ['Invalid format. Expected: $format']
      },
    );
  }

  factory ValidationException.minLength(String fieldName, int minLength) {
    return ValidationException(
      '$fieldName must be at least $minLength characters',
      code: 'MIN_LENGTH',
      fieldErrors: {
        fieldName: ['Must be at least $minLength characters']
      },
    );
  }

  factory ValidationException.maxLength(String fieldName, int maxLength) {
    return ValidationException(
      '$fieldName must not exceed $maxLength characters',
      code: 'MAX_LENGTH',
      fieldErrors: {
        fieldName: ['Must not exceed $maxLength characters']
      },
    );
  }

  factory ValidationException.multipleFields(Map<String, List<String>> errors) {
    final allErrors = errors.values.expand((e) => e).join(', ');
    return ValidationException(
      'Validation failed: $allErrors',
      code: 'MULTIPLE_VALIDATION_ERRORS',
      fieldErrors: errors,
    );
  }
}

/// Camera and media related exceptions
class CameraException extends AppException {
  const CameraException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory CameraException.permissionDenied() {
    return const CameraException(
      'Camera permission denied',
      code: 'PERMISSION_DENIED',
    );
  }

  factory CameraException.notAvailable() {
    return const CameraException(
      'Camera not available on this device',
      code: 'NOT_AVAILABLE',
    );
  }

  factory CameraException.captureFailed() {
    return const CameraException(
      'Failed to capture photo',
      code: 'CAPTURE_FAILED',
    );
  }

  factory CameraException.initializationFailed() {
    return const CameraException(
      'Failed to initialize camera',
      code: 'INITIALIZATION_FAILED',
    );
  }
}

/// Location related exceptions
class LocationException extends AppException {
  const LocationException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory LocationException.permissionDenied() {
    return const LocationException(
      'Location permission denied',
      code: 'PERMISSION_DENIED',
    );
  }

  factory LocationException.serviceDisabled() {
    return const LocationException(
      'Location services are disabled',
      code: 'SERVICE_DISABLED',
    );
  }

  factory LocationException.timeout() {
    return const LocationException(
      'Location request timeout',
      code: 'TIMEOUT',
    );
  }

  factory LocationException.notAvailable() {
    return const LocationException(
      'Location not available',
      code: 'NOT_AVAILABLE',
    );
  }
}

/// QR Code related exceptions
class QRException extends AppException {
  const QRException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory QRException.permissionDenied() {
    return const QRException(
      'Camera permission required for QR scanning',
      code: 'PERMISSION_DENIED',
    );
  }

  factory QRException.scanFailed() {
    return const QRException(
      'Failed to scan QR code',
      code: 'SCAN_FAILED',
    );
  }

  factory QRException.invalidFormat() {
    return const QRException(
      'Invalid QR code format',
      code: 'INVALID_FORMAT',
    );
  }

  factory QRException.generationFailed() {
    return const QRException(
      'Failed to generate QR code',
      code: 'GENERATION_FAILED',
    );
  }
}

/// Business logic related exceptions
class BusinessException extends AppException {
  const BusinessException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory BusinessException.inspectionAlreadyCompleted() {
    return const BusinessException(
      'Inspection has already been completed',
      code: 'INSPECTION_COMPLETED',
    );
  }

  factory BusinessException.assetNotFound() {
    return const BusinessException(
      'Asset not found or has been deleted',
      code: 'ASSET_NOT_FOUND',
    );
  }

  factory BusinessException.formTemplateNotFound() {
    return const BusinessException(
      'Form template not found or has been deleted',
      code: 'FORM_TEMPLATE_NOT_FOUND',
    );
  }

  factory BusinessException.insufficientPermissions() {
    return const BusinessException(
      'Insufficient permissions to perform this action',
      code: 'INSUFFICIENT_PERMISSIONS',
    );
  }

  factory BusinessException.operationNotAllowed() {
    return const BusinessException(
      'Operation not allowed in current state',
      code: 'OPERATION_NOT_ALLOWED',
    );
  }

  factory BusinessException.quotaExceeded(String resource) {
    return BusinessException(
      'Quota exceeded for $resource',
      code: 'QUOTA_EXCEEDED',
    );
  }
}

/// AI/ML related exceptions
class AIException extends AppException {
  const AIException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory AIException.modelNotLoaded() {
    return const AIException(
      'AI model not loaded',
      code: 'MODEL_NOT_LOADED',
    );
  }

  factory AIException.inferenceError() {
    return const AIException(
      'AI inference failed',
      code: 'INFERENCE_ERROR',
    );
  }

  factory AIException.unsupportedFormat() {
    return const AIException(
      'Unsupported input format for AI processing',
      code: 'UNSUPPORTED_FORMAT',
    );
  }

  factory AIException.processingTimeout() {
    return const AIException(
      'AI processing timeout',
      code: 'PROCESSING_TIMEOUT',
    );
  }
}

/// Sync related exceptions
class SyncException extends AppException {
  const SyncException(
    super.message, {
    super.code,
    super.originalError,
    super.stackTrace,
  });

  factory SyncException.conflictDetected() {
    return const SyncException(
      'Data conflict detected during sync',
      code: 'CONFLICT_DETECTED',
    );
  }

  factory SyncException.versionMismatch() {
    return const SyncException(
      'Version mismatch during sync',
      code: 'VERSION_MISMATCH',
    );
  }

  factory SyncException.serverRejected() {
    return const SyncException(
      'Server rejected sync request',
      code: 'SERVER_REJECTED',
    );
  }

  factory SyncException.maxRetriesExceeded() {
    return const SyncException(
      'Maximum sync retries exceeded',
      code: 'MAX_RETRIES_EXCEEDED',
    );
  }
}