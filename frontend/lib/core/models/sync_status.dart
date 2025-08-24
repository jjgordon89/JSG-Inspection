import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_status.freezed.dart';
part 'sync_status.g.dart';

/// Enumeration of possible sync statuses
enum SyncStatus {
  /// Data is synchronized with the server
  synced,
  
  /// Data is pending synchronization
  pending,
  
  /// Currently synchronizing data
  syncing,
  
  /// Synchronization failed
  error,
  
  /// Conflict detected during sync
  conflict,
  
  /// Data exists only locally (offline mode)
  localOnly,
  
  /// Data exists only on server (needs download)
  remoteOnly,
}

/// Extension to provide human-readable descriptions and UI properties
extension SyncStatusExtension on SyncStatus {
  /// Human-readable description of the sync status
  String get description {
    switch (this) {
      case SyncStatus.synced:
        return 'Synchronized';
      case SyncStatus.pending:
        return 'Pending sync';
      case SyncStatus.syncing:
        return 'Synchronizing...';
      case SyncStatus.error:
        return 'Sync failed';
      case SyncStatus.conflict:
        return 'Conflict detected';
      case SyncStatus.localOnly:
        return 'Local only';
      case SyncStatus.remoteOnly:
        return 'Remote only';
    }
  }
  
  /// Short description for compact UI elements
  String get shortDescription {
    switch (this) {
      case SyncStatus.synced:
        return 'Synced';
      case SyncStatus.pending:
        return 'Pending';
      case SyncStatus.syncing:
        return 'Syncing';
      case SyncStatus.error:
        return 'Error';
      case SyncStatus.conflict:
        return 'Conflict';
      case SyncStatus.localOnly:
        return 'Local';
      case SyncStatus.remoteOnly:
        return 'Remote';
    }
  }
  
  /// Icon name for the sync status
  String get iconName {
    switch (this) {
      case SyncStatus.synced:
        return 'check_circle';
      case SyncStatus.pending:
        return 'schedule';
      case SyncStatus.syncing:
        return 'sync';
      case SyncStatus.error:
        return 'error';
      case SyncStatus.conflict:
        return 'warning';
      case SyncStatus.localOnly:
        return 'offline_pin';
      case SyncStatus.remoteOnly:
        return 'cloud_download';
    }
  }
  
  /// Whether this status indicates an error state
  bool get isError => this == SyncStatus.error || this == SyncStatus.conflict;
  
  /// Whether this status indicates active synchronization
  bool get isSyncing => this == SyncStatus.syncing;
  
  /// Whether this status indicates successful synchronization
  bool get isSynced => this == SyncStatus.synced;
  
  /// Whether this status indicates pending synchronization
  bool get isPending => this == SyncStatus.pending;
  
  /// Whether this status requires user attention
  bool get requiresAttention => isError || this == SyncStatus.conflict;
}

/// Detailed sync information for a specific record or operation
@freezed
class SyncInfo with _$SyncInfo {
  const factory SyncInfo({
    required SyncStatus status,
    required DateTime lastUpdated,
    DateTime? lastSyncAttempt,
    DateTime? lastSuccessfulSync,
    String? errorMessage,
    int? retryCount,
    int? maxRetries,
    Map<String, dynamic>? conflictData,
    String? operationType,
    double? progress,
  }) = _SyncInfo;
  
  factory SyncInfo.fromJson(Map<String, dynamic> json) => _$SyncInfoFromJson(json);
  
  /// Create initial sync info for a new record
  factory SyncInfo.initial() {
    return SyncInfo(
      status: SyncStatus.pending,
      lastUpdated: DateTime.now(),
    );
  }
  
  /// Create sync info for a synced record
  factory SyncInfo.synced() {
    final now = DateTime.now();
    return SyncInfo(
      status: SyncStatus.synced,
      lastUpdated: now,
      lastSyncAttempt: now,
      lastSuccessfulSync: now,
    );
  }
  
  /// Create sync info for a failed sync
  factory SyncInfo.error(String errorMessage, {int? retryCount}) {
    return SyncInfo(
      status: SyncStatus.error,
      lastUpdated: DateTime.now(),
      lastSyncAttempt: DateTime.now(),
      errorMessage: errorMessage,
      retryCount: retryCount ?? 0,
    );
  }
  
  /// Create sync info for a conflict
  factory SyncInfo.conflict(Map<String, dynamic> conflictData) {
    return SyncInfo(
      status: SyncStatus.conflict,
      lastUpdated: DateTime.now(),
      lastSyncAttempt: DateTime.now(),
      conflictData: conflictData,
    );
  }
}

/// Sync statistics for the entire application
@freezed
class SyncStatistics with _$SyncStatistics {
  const factory SyncStatistics({
    @Default(0) int totalRecords,
    @Default(0) int syncedRecords,
    @Default(0) int pendingRecords,
    @Default(0) int errorRecords,
    @Default(0) int conflictRecords,
    @Default(0) int localOnlyRecords,
    @Default(0) int remoteOnlyRecords,
    DateTime? lastFullSync,
    DateTime? lastSyncAttempt,
    @Default(false) bool isSyncing,
    double? syncProgress,
    String? currentSyncOperation,
  }) = _SyncStatistics;
  
  factory SyncStatistics.fromJson(Map<String, dynamic> json) => _$SyncStatisticsFromJson(json);
  
  /// Calculate sync completion percentage
  double get syncPercentage {
    if (totalRecords == 0) return 100.0;
    return (syncedRecords / totalRecords) * 100.0;
  }
  
  /// Get number of records that need attention
  int get recordsNeedingAttention => errorRecords + conflictRecords;
  
  /// Check if all records are synced
  bool get isFullySynced => totalRecords > 0 && syncedRecords == totalRecords;
  
  /// Check if there are any sync issues
  bool get hasSyncIssues => errorRecords > 0 || conflictRecords > 0;
  
  /// Get overall sync health status
  SyncStatus get overallStatus {
    if (isSyncing) return SyncStatus.syncing;
    if (conflictRecords > 0) return SyncStatus.conflict;
    if (errorRecords > 0) return SyncStatus.error;
    if (pendingRecords > 0) return SyncStatus.pending;
    if (isFullySynced) return SyncStatus.synced;
    return SyncStatus.pending;
  }
}

/// Sync operation details
@freezed
class SyncOperation with _$SyncOperation {
  const factory SyncOperation({
    required String id,
    required String tableName,
    required String recordId,
    required String operationType, // CREATE, UPDATE, DELETE
    required Map<String, dynamic> data,
    required DateTime createdAt,
    @Default(0) int retryCount,
    @Default(3) int maxRetries,
    String? lastError,
    DateTime? lastAttempt,
    @Default(SyncStatus.pending) SyncStatus status,
    int? priority, // Higher number = higher priority
  }) = _SyncOperation;
  
  factory SyncOperation.fromJson(Map<String, dynamic> json) => _$SyncOperationFromJson(json);
  
  /// Check if operation can be retried
  bool get canRetry => retryCount < maxRetries && status == SyncStatus.error;
  
  /// Check if operation has exceeded max retries
  bool get hasExceededRetries => retryCount >= maxRetries;
  
  /// Get next retry delay in seconds (exponential backoff)
  int get nextRetryDelay {
    if (!canRetry) return 0;
    return (1 << retryCount) * 30; // 30s, 60s, 120s, 240s...
  }
}

/// Conflict resolution strategy
enum ConflictResolution {
  /// Use local version
  useLocal,
  
  /// Use remote version
  useRemote,
  
  /// Merge both versions
  merge,
  
  /// Skip this conflict
  skip,
  
  /// Ask user to resolve manually
  manual,
}

/// Conflict resolution result
@freezed
class ConflictResolution with _$ConflictResolution {
  const factory ConflictResolution({
    required String recordId,
    required ConflictResolution strategy,
    Map<String, dynamic>? resolvedData,
    String? userNote,
    required DateTime resolvedAt,
    required String resolvedBy,
  }) = _ConflictResolution;
  
  factory ConflictResolution.fromJson(Map<String, dynamic> json) => _$ConflictResolutionFromJson(json);
}