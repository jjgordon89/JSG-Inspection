import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_queue.freezed.dart';
part 'sync_queue.g.dart';

@freezed
class SyncQueueItem with _$SyncQueueItem {
  const factory SyncQueueItem({
    required String id,
    required String entityType,
    required String entityId,
    required SyncOperation operation,
    required SyncQueueStatus status,
    required Map<String, dynamic> data,
    Map<String, dynamic>? originalData,
    Map<String, dynamic>? conflictData,
    String? parentId,
    List<String>? dependencyIds,
    @Default(0) int retryCount,
    @Default(3) int maxRetries,
    String? error,
    String? conflictReason,
    ConflictResolutionStrategy? resolutionStrategy,
    @Default(0) int priority,
    String? userId,
    String? deviceId,
    String? sessionId,
    required DateTime createdAt,
    DateTime? scheduledAt,
    DateTime? lastAttemptAt,
    DateTime? completedAt,
    DateTime? expiresAt,
    @Default(false) bool requiresNetwork,
    @Default(false) bool requiresAuth,
    @Default(false) bool isBlocking,
    @Default(false) bool hasConflict,
    @Default(false) bool isResolved,
    Map<String, dynamic>? metadata,
    List<String>? tags,
  }) = _SyncQueueItem;

  factory SyncQueueItem.fromJson(Map<String, dynamic> json) => _$SyncQueueItemFromJson(json);
}

@freezed
class SyncBatch with _$SyncBatch {
  const factory SyncBatch({
    required String id,
    required String name,
    String? description,
    required List<String> itemIds,
    required SyncBatchStatus status,
    required SyncBatchType type,
    @Default(0) int totalItems,
    @Default(0) int completedItems,
    @Default(0) int failedItems,
    @Default(0) int conflictItems,
    String? error,
    @Default(0) int priority,
    String? userId,
    String? deviceId,
    required DateTime createdAt,
    DateTime? startedAt,
    DateTime? completedAt,
    DateTime? expiresAt,
    @Default(false) bool isAutomatic,
    @Default(false) bool allowPartialSuccess,
    @Default(false) bool stopOnError,
    Map<String, dynamic>? configuration,
    Map<String, dynamic>? metadata,
    List<String>? tags,
  }) = _SyncBatch;

  factory SyncBatch.fromJson(Map<String, dynamic> json) => _$SyncBatchFromJson(json);
}

@freezed
class SyncConflict with _$SyncConflict {
  const factory SyncConflict({
    required String id,
    required String entityType,
    required String entityId,
    required String queueItemId,
    required ConflictType type,
    required ConflictSeverity severity,
    required Map<String, dynamic> localData,
    required Map<String, dynamic> remoteData,
    Map<String, dynamic>? baseData,
    required List<ConflictField> conflictFields,
    ConflictResolutionStrategy? suggestedResolution,
    ConflictResolutionStrategy? appliedResolution,
    Map<String, dynamic>? resolvedData,
    String? resolutionReason,
    String? resolvedById,
    required DateTime detectedAt,
    DateTime? resolvedAt,
    @Default(false) bool isResolved,
    @Default(false) bool isAutoResolvable,
    @Default(false) bool requiresUserInput,
    Map<String, dynamic>? metadata,
  }) = _SyncConflict;

  factory SyncConflict.fromJson(Map<String, dynamic> json) => _$SyncConflictFromJson(json);
}

@freezed
class ConflictField with _$ConflictField {
  const factory ConflictField({
    required String fieldName,
    required String fieldPath,
    required dynamic localValue,
    required dynamic remoteValue,
    dynamic baseValue,
    required ConflictFieldType type,
    ConflictResolutionStrategy? suggestedResolution,
    String? description,
    @Default(false) bool isResolved,
    dynamic resolvedValue,
  }) = _ConflictField;

  factory ConflictField.fromJson(Map<String, dynamic> json) => _$ConflictFieldFromJson(json);
}

@freezed
class SyncProgress with _$SyncProgress {
  const factory SyncProgress({
    required String id,
    String? batchId,
    required SyncProgressType type,
    required SyncProgressStatus status,
    @Default(0) int totalItems,
    @Default(0) int processedItems,
    @Default(0) int successfulItems,
    @Default(0) int failedItems,
    @Default(0) int conflictItems,
    @Default(0) int skippedItems,
    String? currentItem,
    String? currentOperation,
    String? message,
    String? error,
    @Default(0.0) double percentage,
    Duration? estimatedTimeRemaining,
    required DateTime startedAt,
    DateTime? updatedAt,
    DateTime? completedAt,
    @Default(false) bool isCancellable,
    @Default(false) bool isPaused,
    Map<String, dynamic>? details,
  }) = _SyncProgress;

  factory SyncProgress.fromJson(Map<String, dynamic> json) => _$SyncProgressFromJson(json);
}

@freezed
class SyncConfiguration with _$SyncConfiguration {
  const factory SyncConfiguration({
    required String id,
    String? name,
    String? description,
    @Default(true) bool autoSync,
    @Default(true) bool syncOnStartup,
    @Default(true) bool syncOnNetworkReconnect,
    @Default(false) bool syncOnlyOnWifi,
    @Default(false) bool syncOnlyWhenCharging,
    @Default(30) int syncIntervalMinutes,
    @Default(5) int retryDelaySeconds,
    @Default(3) int maxRetries,
    @Default(100) int batchSize,
    @Default(30) int timeoutSeconds,
    @Default(false) bool enableConflictResolution,
    ConflictResolutionStrategy? defaultResolutionStrategy,
    @Default(false) bool enableBackgroundSync,
    @Default(false) bool enablePrioritySync,
    List<String>? priorityEntityTypes,
    List<String>? excludedEntityTypes,
    Map<String, SyncEntityConfiguration>? entityConfigurations,
    Map<String, dynamic>? customSettings,
    String? userId,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _SyncConfiguration;

  factory SyncConfiguration.fromJson(Map<String, dynamic> json) => _$SyncConfigurationFromJson(json);
}

@freezed
class SyncEntityConfiguration with _$SyncEntityConfiguration {
  const factory SyncEntityConfiguration({
    required String entityType,
    @Default(true) bool enabled,
    @Default(0) int priority,
    @Default(3) int maxRetries,
    @Default(30) int timeoutSeconds,
    @Default(false) bool requiresAuth,
    @Default(false) bool requiresNetwork,
    ConflictResolutionStrategy? defaultResolutionStrategy,
    List<String>? dependsOn,
    Map<String, dynamic>? customSettings,
  }) = _SyncEntityConfiguration;

  factory SyncEntityConfiguration.fromJson(Map<String, dynamic> json) => _$SyncEntityConfigurationFromJson(json);
}

@freezed
class SyncStatistics with _$SyncStatistics {
  const factory SyncStatistics({
    required DateTime calculatedAt,
    @Default(0) int totalQueueItems,
    @Default(0) int pendingItems,
    @Default(0) int processingItems,
    @Default(0) int completedItems,
    @Default(0) int failedItems,
    @Default(0) int conflictItems,
    @Default(0) int expiredItems,
    @Default(0) int totalBatches,
    @Default(0) int activeBatches,
    @Default(0) int completedBatches,
    @Default(0) int failedBatches,
    @Default(0) int totalConflicts,
    @Default(0) int unresolvedConflicts,
    @Default(0) int autoResolvedConflicts,
    @Default(0) int manuallyResolvedConflicts,
    Map<String, int>? itemsByEntityType,
    Map<String, int>? itemsByOperation,
    Map<String, int>? itemsByStatus,
    Map<String, int>? conflictsByType,
    Map<String, int>? conflictsBySeverity,
    @Default(0.0) double averageProcessingTime,
    @Default(0.0) double successRate,
    @Default(0.0) double conflictRate,
    DateTime? lastSyncAt,
    DateTime? nextScheduledSyncAt,
    @Default(false) bool isSyncInProgress,
    String? currentSyncBatchId,
  }) = _SyncStatistics;

  factory SyncStatistics.fromJson(Map<String, dynamic> json) => _$SyncStatisticsFromJson(json);
}

@freezed
class SyncLog with _$SyncLog {
  const factory SyncLog({
    required String id,
    required SyncLogLevel level,
    required String message,
    String? category,
    String? entityType,
    String? entityId,
    String? queueItemId,
    String? batchId,
    String? conflictId,
    String? operation,
    String? error,
    String? stackTrace,
    Map<String, dynamic>? data,
    String? userId,
    String? deviceId,
    String? sessionId,
    required DateTime timestamp,
    Map<String, dynamic>? metadata,
  }) = _SyncLog;

  factory SyncLog.fromJson(Map<String, dynamic> json) => _$SyncLogFromJson(json);
}

enum SyncOperation {
  @JsonValue('create')
  create,
  @JsonValue('update')
  update,
  @JsonValue('delete')
  delete,
  @JsonValue('restore')
  restore,
  @JsonValue('merge')
  merge,
}

enum SyncQueueStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('processing')
  processing,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('conflict')
  conflict,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('expired')
  expired,
  @JsonValue('skipped')
  skipped,
}

enum SyncBatchStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('processing')
  processing,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('partial')
  partial,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('expired')
  expired,
}

enum SyncBatchType {
  @JsonValue('manual')
  manual,
  @JsonValue('automatic')
  automatic,
  @JsonValue('scheduled')
  scheduled,
  @JsonValue('priority')
  priority,
  @JsonValue('recovery')
  recovery,
  @JsonValue('initial')
  initial,
}

enum ConflictType {
  @JsonValue('data')
  data,
  @JsonValue('version')
  version,
  @JsonValue('concurrent_edit')
  concurrentEdit,
  @JsonValue('delete_conflict')
  deleteConflict,
  @JsonValue('schema_mismatch')
  schemaMismatch,
  @JsonValue('permission')
  permission,
  @JsonValue('dependency')
  dependency,
}

enum ConflictSeverity {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical,
}

enum ConflictFieldType {
  @JsonValue('value_change')
  valueChange,
  @JsonValue('type_mismatch')
  typeMismatch,
  @JsonValue('missing_field')
  missingField,
  @JsonValue('extra_field')
  extraField,
  @JsonValue('array_difference')
  arrayDifference,
  @JsonValue('object_difference')
  objectDifference,
}

enum ConflictResolutionStrategy {
  @JsonValue('local_wins')
  localWins,
  @JsonValue('remote_wins')
  remoteWins,
  @JsonValue('merge')
  merge,
  @JsonValue('manual')
  manual,
  @JsonValue('latest_timestamp')
  latestTimestamp,
  @JsonValue('highest_version')
  highestVersion,
  @JsonValue('user_priority')
  userPriority,
  @JsonValue('field_by_field')
  fieldByField,
}

enum SyncProgressType {
  @JsonValue('queue_processing')
  queueProcessing,
  @JsonValue('batch_processing')
  batchProcessing,
  @JsonValue('conflict_resolution')
  conflictResolution,
  @JsonValue('data_upload')
  dataUpload,
  @JsonValue('data_download')
  dataDownload,
  @JsonValue('full_sync')
  fullSync,
}

enum SyncProgressStatus {
  @JsonValue('starting')
  starting,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('paused')
  paused,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('cancelled')
  cancelled,
}

enum SyncLogLevel {
  @JsonValue('debug')
  debug,
  @JsonValue('info')
  info,
  @JsonValue('warning')
  warning,
  @JsonValue('error')
  error,
  @JsonValue('critical')
  critical,
}

// Extensions
extension SyncOperationExtension on SyncOperation {
  String get displayName {
    switch (this) {
      case SyncOperation.create:
        return 'Create';
      case SyncOperation.update:
        return 'Update';
      case SyncOperation.delete:
        return 'Delete';
      case SyncOperation.restore:
        return 'Restore';
      case SyncOperation.merge:
        return 'Merge';
    }
  }

  String get icon {
    switch (this) {
      case SyncOperation.create:
        return 'add';
      case SyncOperation.update:
        return 'edit';
      case SyncOperation.delete:
        return 'delete';
      case SyncOperation.restore:
        return 'restore';
      case SyncOperation.merge:
        return 'merge';
    }
  }

  String get color {
    switch (this) {
      case SyncOperation.create:
        return '#4CAF50'; // Green
      case SyncOperation.update:
        return '#2196F3'; // Blue
      case SyncOperation.delete:
        return '#F44336'; // Red
      case SyncOperation.restore:
        return '#FF9800'; // Orange
      case SyncOperation.merge:
        return '#9C27B0'; // Purple
    }
  }

  bool get isDestructive {
    return this == SyncOperation.delete;
  }

  bool get requiresConflictResolution {
    switch (this) {
      case SyncOperation.update:
      case SyncOperation.merge:
        return true;
      default:
        return false;
    }
  }
}

extension SyncQueueStatusExtension on SyncQueueStatus {
  String get displayName {
    switch (this) {
      case SyncQueueStatus.pending:
        return 'Pending';
      case SyncQueueStatus.processing:
        return 'Processing';
      case SyncQueueStatus.completed:
        return 'Completed';
      case SyncQueueStatus.failed:
        return 'Failed';
      case SyncQueueStatus.conflict:
        return 'Conflict';
      case SyncQueueStatus.cancelled:
        return 'Cancelled';
      case SyncQueueStatus.expired:
        return 'Expired';
      case SyncQueueStatus.skipped:
        return 'Skipped';
    }
  }

  String get color {
    switch (this) {
      case SyncQueueStatus.pending:
        return '#FF9800'; // Orange
      case SyncQueueStatus.processing:
        return '#2196F3'; // Blue
      case SyncQueueStatus.completed:
        return '#4CAF50'; // Green
      case SyncQueueStatus.failed:
        return '#F44336'; // Red
      case SyncQueueStatus.conflict:
        return '#9C27B0'; // Purple
      case SyncQueueStatus.cancelled:
        return '#607D8B'; // Blue Grey
      case SyncQueueStatus.expired:
        return '#795548'; // Brown
      case SyncQueueStatus.skipped:
        return '#9E9E9E'; // Grey
    }
  }

  String get icon {
    switch (this) {
      case SyncQueueStatus.pending:
        return 'schedule';
      case SyncQueueStatus.processing:
        return 'sync';
      case SyncQueueStatus.completed:
        return 'check_circle';
      case SyncQueueStatus.failed:
        return 'error';
      case SyncQueueStatus.conflict:
        return 'warning';
      case SyncQueueStatus.cancelled:
        return 'cancel';
      case SyncQueueStatus.expired:
        return 'access_time';
      case SyncQueueStatus.skipped:
        return 'skip_next';
    }
  }

  bool get isActive {
    switch (this) {
      case SyncQueueStatus.pending:
      case SyncQueueStatus.processing:
        return true;
      default:
        return false;
    }
  }

  bool get isCompleted {
    switch (this) {
      case SyncQueueStatus.completed:
      case SyncQueueStatus.skipped:
        return true;
      default:
        return false;
    }
  }

  bool get isFailed {
    switch (this) {
      case SyncQueueStatus.failed:
      case SyncQueueStatus.cancelled:
      case SyncQueueStatus.expired:
        return true;
      default:
        return false;
    }
  }

  bool get requiresAttention {
    switch (this) {
      case SyncQueueStatus.failed:
      case SyncQueueStatus.conflict:
        return true;
      default:
        return false;
    }
  }
}

extension ConflictTypeExtension on ConflictType {
  String get displayName {
    switch (this) {
      case ConflictType.data:
        return 'Data Conflict';
      case ConflictType.version:
        return 'Version Conflict';
      case ConflictType.concurrentEdit:
        return 'Concurrent Edit';
      case ConflictType.deleteConflict:
        return 'Delete Conflict';
      case ConflictType.schemaMismatch:
        return 'Schema Mismatch';
      case ConflictType.permission:
        return 'Permission Conflict';
      case ConflictType.dependency:
        return 'Dependency Conflict';
    }
  }

  String get description {
    switch (this) {
      case ConflictType.data:
        return 'Local and remote data have different values';
      case ConflictType.version:
        return 'Version numbers do not match';
      case ConflictType.concurrentEdit:
        return 'Multiple users edited the same data';
      case ConflictType.deleteConflict:
        return 'Item was deleted remotely but modified locally';
      case ConflictType.schemaMismatch:
        return 'Data structure does not match expected schema';
      case ConflictType.permission:
        return 'Insufficient permissions to perform operation';
      case ConflictType.dependency:
        return 'Required dependencies are missing or conflicting';
    }
  }

  ConflictSeverity get defaultSeverity {
    switch (this) {
      case ConflictType.data:
        return ConflictSeverity.medium;
      case ConflictType.version:
        return ConflictSeverity.low;
      case ConflictType.concurrentEdit:
        return ConflictSeverity.high;
      case ConflictType.deleteConflict:
        return ConflictSeverity.high;
      case ConflictType.schemaMismatch:
        return ConflictSeverity.critical;
      case ConflictType.permission:
        return ConflictSeverity.high;
      case ConflictType.dependency:
        return ConflictSeverity.medium;
    }
  }

  bool get isAutoResolvable {
    switch (this) {
      case ConflictType.data:
      case ConflictType.version:
        return true;
      default:
        return false;
    }
  }
}

extension ConflictSeverityExtension on ConflictSeverity {
  String get displayName {
    switch (this) {
      case ConflictSeverity.low:
        return 'Low';
      case ConflictSeverity.medium:
        return 'Medium';
      case ConflictSeverity.high:
        return 'High';
      case ConflictSeverity.critical:
        return 'Critical';
    }
  }

  String get color {
    switch (this) {
      case ConflictSeverity.low:
        return '#4CAF50'; // Green
      case ConflictSeverity.medium:
        return '#FF9800'; // Orange
      case ConflictSeverity.high:
        return '#FF5722'; // Deep Orange
      case ConflictSeverity.critical:
        return '#F44336'; // Red
    }
  }

  int get priority {
    switch (this) {
      case ConflictSeverity.low:
        return 1;
      case ConflictSeverity.medium:
        return 2;
      case ConflictSeverity.high:
        return 3;
      case ConflictSeverity.critical:
        return 4;
    }
  }

  bool get requiresImmediateAttention {
    return this == ConflictSeverity.critical;
  }
}

extension ConflictResolutionStrategyExtension on ConflictResolutionStrategy {
  String get displayName {
    switch (this) {
      case ConflictResolutionStrategy.localWins:
        return 'Keep Local Changes';
      case ConflictResolutionStrategy.remoteWins:
        return 'Use Remote Changes';
      case ConflictResolutionStrategy.merge:
        return 'Merge Changes';
      case ConflictResolutionStrategy.manual:
        return 'Manual Resolution';
      case ConflictResolutionStrategy.latestTimestamp:
        return 'Use Latest Timestamp';
      case ConflictResolutionStrategy.highestVersion:
        return 'Use Highest Version';
      case ConflictResolutionStrategy.userPriority:
        return 'Use User Priority';
      case ConflictResolutionStrategy.fieldByField:
        return 'Field by Field';
    }
  }

  String get description {
    switch (this) {
      case ConflictResolutionStrategy.localWins:
        return 'Always prefer local changes over remote changes';
      case ConflictResolutionStrategy.remoteWins:
        return 'Always prefer remote changes over local changes';
      case ConflictResolutionStrategy.merge:
        return 'Automatically merge non-conflicting changes';
      case ConflictResolutionStrategy.manual:
        return 'Require manual user intervention';
      case ConflictResolutionStrategy.latestTimestamp:
        return 'Use the data with the most recent timestamp';
      case ConflictResolutionStrategy.highestVersion:
        return 'Use the data with the highest version number';
      case ConflictResolutionStrategy.userPriority:
        return 'Use priority based on user roles and permissions';
      case ConflictResolutionStrategy.fieldByField:
        return 'Resolve each field individually';
    }
  }

  bool get isAutomatic {
    switch (this) {
      case ConflictResolutionStrategy.manual:
        return false;
      default:
        return true;
    }
  }

  bool get requiresUserInput {
    switch (this) {
      case ConflictResolutionStrategy.manual:
      case ConflictResolutionStrategy.fieldByField:
        return true;
      default:
        return false;
    }
  }
}

extension SyncLogLevelExtension on SyncLogLevel {
  String get displayName {
    switch (this) {
      case SyncLogLevel.debug:
        return 'Debug';
      case SyncLogLevel.info:
        return 'Info';
      case SyncLogLevel.warning:
        return 'Warning';
      case SyncLogLevel.error:
        return 'Error';
      case SyncLogLevel.critical:
        return 'Critical';
    }
  }

  String get color {
    switch (this) {
      case SyncLogLevel.debug:
        return '#9E9E9E'; // Grey
      case SyncLogLevel.info:
        return '#2196F3'; // Blue
      case SyncLogLevel.warning:
        return '#FF9800'; // Orange
      case SyncLogLevel.error:
        return '#F44336'; // Red
      case SyncLogLevel.critical:
        return '#9C27B0'; // Purple
    }
  }

  int get priority {
    switch (this) {
      case SyncLogLevel.debug:
        return 1;
      case SyncLogLevel.info:
        return 2;
      case SyncLogLevel.warning:
        return 3;
      case SyncLogLevel.error:
        return 4;
      case SyncLogLevel.critical:
        return 5;
    }
  }
}

// Sync Queue Item Extensions
extension SyncQueueItemExtension on SyncQueueItem {
  bool get canRetry => retryCount < maxRetries && status == SyncQueueStatus.failed;
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
  bool get isScheduled {
    if (scheduledAt == null) return false;
    return DateTime.now().isBefore(scheduledAt!);
  }
  bool get isReady {
    return status == SyncQueueStatus.pending && !isExpired && !isScheduled;
  }
  
  Duration? get timeUntilScheduled {
    if (scheduledAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(scheduledAt!)) return null;
    return scheduledAt!.difference(now);
  }
  
  Duration? get timeUntilExpiry {
    if (expiresAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(expiresAt!)) return null;
    return expiresAt!.difference(now);
  }
  
  Duration get age => DateTime.now().difference(createdAt);
  
  String get displayName => '${operation.displayName} ${entityType}';
  String get statusDisplayName => status.displayName;
  String get operationDisplayName => operation.displayName;
  
  String get statusColor => status.color;
  String get operationColor => operation.color;
  
  String get statusIcon => status.icon;
  String get operationIcon => operation.icon;
  
  bool get requiresUserAttention => status.requiresAttention || hasConflict;
  bool get isBlocked => dependencyIds?.isNotEmpty == true;
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'entityType': entityType,
      'entityId': entityId,
      'operation': operationDisplayName,
      'status': statusDisplayName,
      'hasConflict': hasConflict,
      'retryCount': retryCount,
      'maxRetries': maxRetries,
      'canRetry': canRetry,
      'isExpired': isExpired,
      'isScheduled': isScheduled,
      'isReady': isReady,
      'age': age.inMinutes,
      'createdAt': createdAt.toIso8601String(),
      'lastAttemptAt': lastAttemptAt?.toIso8601String(),
      'scheduledAt': scheduledAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}

extension SyncBatchExtension on SyncBatch {
  double get progressPercentage {
    if (totalItems == 0) return 0.0;
    return (completedItems / totalItems) * 100;
  }
  
  double get successRate {
    if (completedItems == 0) return 0.0;
    return ((completedItems - failedItems) / completedItems) * 100;
  }
  
  bool get isActive => status == SyncBatchStatus.processing;
  bool get isCompleted => status == SyncBatchStatus.completed;
  bool get hasFailed => status == SyncBatchStatus.failed;
  bool get hasPartialSuccess => status == SyncBatchStatus.partial;
  
  Duration? get duration {
    if (startedAt == null) return null;
    final endTime = completedAt ?? DateTime.now();
    return endTime.difference(startedAt!);
  }
  
  String get statusDisplayName {
    switch (status) {
      case SyncBatchStatus.pending:
        return 'Pending';
      case SyncBatchStatus.processing:
        return 'Processing';
      case SyncBatchStatus.completed:
        return 'Completed';
      case SyncBatchStatus.failed:
        return 'Failed';
      case SyncBatchStatus.partial:
        return 'Partial Success';
      case SyncBatchStatus.cancelled:
        return 'Cancelled';
      case SyncBatchStatus.expired:
        return 'Expired';
    }
  }
  
  String get typeDisplayName {
    switch (type) {
      case SyncBatchType.manual:
        return 'Manual';
      case SyncBatchType.automatic:
        return 'Automatic';
      case SyncBatchType.scheduled:
        return 'Scheduled';
      case SyncBatchType.priority:
        return 'Priority';
      case SyncBatchType.recovery:
        return 'Recovery';
      case SyncBatchType.initial:
        return 'Initial';
    }
  }
}

extension SyncConflictExtension on SyncConflict {
  String get typeDisplayName => type.displayName;
  String get severityDisplayName => severity.displayName;
  String get typeDescription => type.description;
  String get severityColor => severity.color;
  
  bool get canAutoResolve => isAutoResolvable && !requiresUserInput;
  bool get needsAttention => !isResolved && (severity.requiresImmediateAttention || requiresUserInput);
  
  Duration get age => DateTime.now().difference(detectedAt);
  Duration? get resolutionTime {
    if (resolvedAt == null) return null;
    return resolvedAt!.difference(detectedAt);
  }
  
  int get conflictFieldCount => conflictFields.length;
  List<ConflictField> get unresolvedFields => conflictFields.where((f) => !f.isResolved).toList();
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'entityType': entityType,
      'entityId': entityId,
      'type': typeDisplayName,
      'severity': severityDisplayName,
      'isResolved': isResolved,
      'isAutoResolvable': isAutoResolvable,
      'requiresUserInput': requiresUserInput,
      'conflictFieldCount': conflictFieldCount,
      'unresolvedFieldCount': unresolvedFields.length,
      'age': age.inMinutes,
      'detectedAt': detectedAt.toIso8601String(),
      'resolvedAt': resolvedAt?.toIso8601String(),
    };
  }
}

extension SyncStatisticsExtension on SyncStatistics {
  double get completionRate {
    if (totalQueueItems == 0) return 0.0;
    return (completedItems / totalQueueItems) * 100;
  }
  
  double get failureRate {
    if (totalQueueItems == 0) return 0.0;
    return (failedItems / totalQueueItems) * 100;
  }
  
  double get conflictRatePercentage {
    if (totalQueueItems == 0) return 0.0;
    return (conflictItems / totalQueueItems) * 100;
  }
  
  bool get hasActiveSync => isSyncInProgress || activeBatches > 0;
  bool get hasUnresolvedConflicts => unresolvedConflicts > 0;
  bool get hasFailedItems => failedItems > 0;
  
  String get healthStatus {
    if (hasUnresolvedConflicts) return 'Conflicts';
    if (hasFailedItems) return 'Errors';
    if (hasActiveSync) return 'Syncing';
    if (successRate >= 95) return 'Healthy';
    if (successRate >= 80) return 'Warning';
    return 'Poor';
  }
  
  String get healthColor {
    switch (healthStatus) {
      case 'Healthy':
        return '#4CAF50'; // Green
      case 'Warning':
        return '#FF9800'; // Orange
      case 'Syncing':
        return '#2196F3'; // Blue
      case 'Conflicts':
        return '#9C27B0'; // Purple
      case 'Errors':
      case 'Poor':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'totalQueueItems': totalQueueItems,
      'pendingItems': pendingItems,
      'completedItems': completedItems,
      'failedItems': failedItems,
      'conflictItems': conflictItems,
      'totalConflicts': totalConflicts,
      'unresolvedConflicts': unresolvedConflicts,
      'completionRate': completionRate,
      'successRate': successRate,
      'conflictRate': conflictRatePercentage,
      'healthStatus': healthStatus,
      'hasActiveSync': hasActiveSync,
      'lastSyncAt': lastSyncAt?.toIso8601String(),
      'nextScheduledSyncAt': nextScheduledSyncAt?.toIso8601String(),
      'calculatedAt': calculatedAt.toIso8601String(),
    };
  }
}

// Sync Queue Helper Functions
class SyncQueueHelper {
  static SyncQueueItem createQueueItem({
    required String entityType,
    required String entityId,
    required SyncOperation operation,
    required Map<String, dynamic> data,
    Map<String, dynamic>? originalData,
    String? userId,
    int priority = 0,
    List<String>? dependencyIds,
    Duration? delay,
    Duration? expiry,
  }) {
    final now = DateTime.now();
    
    return SyncQueueItem(
      id: '${entityType}_${operation.name}_${entityId}_${now.millisecondsSinceEpoch}',
      entityType: entityType,
      entityId: entityId,
      operation: operation,
      status: SyncQueueStatus.pending,
      data: data,
      originalData: originalData,
      priority: priority,
      userId: userId,
      dependencyIds: dependencyIds,
      createdAt: now,
      scheduledAt: delay != null ? now.add(delay) : null,
      expiresAt: expiry != null ? now.add(expiry) : null,
      requiresNetwork: true,
      requiresAuth: true,
    );
  }
  
  static SyncBatch createBatch({
    required String name,
    required List<String> itemIds,
    SyncBatchType type = SyncBatchType.manual,
    String? description,
    String? userId,
    int priority = 0,
    bool allowPartialSuccess = true,
    bool stopOnError = false,
  }) {
    final now = DateTime.now();
    
    return SyncBatch(
      id: 'batch_${now.millisecondsSinceEpoch}',
      name: name,
      description: description,
      itemIds: itemIds,
      status: SyncBatchStatus.pending,
      type: type,
      totalItems: itemIds.length,
      priority: priority,
      userId: userId,
      createdAt: now,
      allowPartialSuccess: allowPartialSuccess,
      stopOnError: stopOnError,
    );
  }
  
  static SyncConflict createConflict({
    required String entityType,
    required String entityId,
    required String queueItemId,
    required ConflictType type,
    required Map<String, dynamic> localData,
    required Map<String, dynamic> remoteData,
    Map<String, dynamic>? baseData,
    ConflictSeverity? severity,
  }) {
    final now = DateTime.now();
    final conflictFields = _detectConflictFields(localData, remoteData, baseData);
    
    return SyncConflict(
      id: 'conflict_${entityType}_${entityId}_${now.millisecondsSinceEpoch}',
      entityType: entityType,
      entityId: entityId,
      queueItemId: queueItemId,
      type: type,
      severity: severity ?? type.defaultSeverity,
      localData: localData,
      remoteData: remoteData,
      baseData: baseData,
      conflictFields: conflictFields,
      detectedAt: now,
      isAutoResolvable: type.isAutoResolvable && conflictFields.every((f) => f.type != ConflictFieldType.typeMismatch),
      requiresUserInput: !type.isAutoResolvable || conflictFields.any((f) => f.type == ConflictFieldType.typeMismatch),
    );
  }
  
  static List<ConflictField> _detectConflictFields(
    Map<String, dynamic> localData,
    Map<String, dynamic> remoteData,
    Map<String, dynamic>? baseData,
  ) {
    final conflicts = <ConflictField>[];
    final allKeys = {...localData.keys, ...remoteData.keys};
    
    for (final key in allKeys) {
      final localValue = localData[key];
      final remoteValue = remoteData[key];
      final baseValue = baseData?[key];
      
      if (localValue != remoteValue) {
        ConflictFieldType fieldType;
        
        if (localValue == null) {
          fieldType = ConflictFieldType.missingField;
        } else if (remoteValue == null) {
          fieldType = ConflictFieldType.extraField;
        } else if (localValue.runtimeType != remoteValue.runtimeType) {
          fieldType = ConflictFieldType.typeMismatch;
        } else if (localValue is List || remoteValue is List) {
          fieldType = ConflictFieldType.arrayDifference;
        } else if (localValue is Map || remoteValue is Map) {
          fieldType = ConflictFieldType.objectDifference;
        } else {
          fieldType = ConflictFieldType.valueChange;
        }
        
        conflicts.add(ConflictField(
          fieldName: key,
          fieldPath: key,
          localValue: localValue,
          remoteValue: remoteValue,
          baseValue: baseValue,
          type: fieldType,
        ));
      }
    }
    
    return conflicts;
  }
  
  static SyncLog createLog({
    required SyncLogLevel level,
    required String message,
    String? category,
    String? entityType,
    String? entityId,
    String? queueItemId,
    String? batchId,
    String? error,
    Map<String, dynamic>? data,
    String? userId,
  }) {
    final now = DateTime.now();
    
    return SyncLog(
      id: 'log_${now.millisecondsSinceEpoch}',
      level: level,
      message: message,
      category: category,
      entityType: entityType,
      entityId: entityId,
      queueItemId: queueItemId,
      batchId: batchId,
      error: error,
      data: data,
      userId: userId,
      timestamp: now,
    );
  }
}