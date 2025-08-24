import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_queue_item.freezed.dart';
part 'sync_queue_item.g.dart';

@freezed
@HiveType(typeId: 39)
class SyncQueueItem with _$SyncQueueItem {
  const factory SyncQueueItem({
    @HiveField(0) required String id,
    @HiveField(1) required String entityType,
    @HiveField(2) required String entityId,
    @HiveField(3) required SyncOperation operation,
    @HiveField(4) required Map<String, dynamic> data,
    @HiveField(5) required SyncQueueStatus status,
    @HiveField(6) required int priority,
    @HiveField(7) required DateTime createdAt,
    @HiveField(8) DateTime? lastAttemptAt,
    @HiveField(9) DateTime? completedAt,
    @HiveField(10) @Default(0) int retryCount,
    @HiveField(11) @Default(3) int maxRetries,
    @HiveField(12) String? error,
    @HiveField(13) @Default({}) Map<String, dynamic> metadata,
    @HiveField(14) @Default([]) List<String> dependencies,
  }) = _SyncQueueItem;

  factory SyncQueueItem.fromJson(Map<String, dynamic> json) => _$SyncQueueItemFromJson(json);
}

@HiveType(typeId: 40)
enum SyncOperation {
  @HiveField(0)
  create,
  @HiveField(1)
  update,
  @HiveField(2)
  delete,
  @HiveField(3)
  upload,
}

@HiveType(typeId: 41)
enum SyncQueueStatus {
  @HiveField(0)
  pending,
  @HiveField(1)
  processing,
  @HiveField(2)
  completed,
  @HiveField(3)
  failed,
  @HiveField(4)
  cancelled,
  @HiveField(5)
  blocked,
}

extension SyncOperationExtension on SyncOperation {
  String get displayName {
    switch (this) {
      case SyncOperation.create:
        return 'Create';
      case SyncOperation.update:
        return 'Update';
      case SyncOperation.delete:
        return 'Delete';
      case SyncOperation.upload:
        return 'Upload';
    }
  }

  String get httpMethod {
    switch (this) {
      case SyncOperation.create:
        return 'POST';
      case SyncOperation.update:
        return 'PUT';
      case SyncOperation.delete:
        return 'DELETE';
      case SyncOperation.upload:
        return 'POST';
    }
  }

  bool get isDestructive {
    return this == SyncOperation.delete;
  }

  bool get requiresData {
    return this == SyncOperation.create || 
           this == SyncOperation.update ||
           this == SyncOperation.upload;
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
      case SyncQueueStatus.cancelled:
        return 'Cancelled';
      case SyncQueueStatus.blocked:
        return 'Blocked';
    }
  }

  bool get isActive {
    return this == SyncQueueStatus.pending || this == SyncQueueStatus.processing;
  }

  bool get isComplete {
    return this == SyncQueueStatus.completed;
  }

  bool get hasError {
    return this == SyncQueueStatus.failed;
  }

  bool get canRetry {
    return this == SyncQueueStatus.failed || this == SyncQueueStatus.blocked;
  }

  bool get canCancel {
    return this == SyncQueueStatus.pending || this == SyncQueueStatus.blocked;
  }
}

// Helper class for managing sync queue operations
class SyncQueueManager {
  static const int highPriority = 1;
  static const int normalPriority = 5;
  static const int lowPriority = 10;

  static SyncQueueItem createItem({
    required String entityType,
    required String entityId,
    required SyncOperation operation,
    required Map<String, dynamic> data,
    int priority = normalPriority,
    List<String> dependencies = const [],
    Map<String, dynamic> metadata = const {},
  }) {
    return SyncQueueItem(
      id: _generateId(),
      entityType: entityType,
      entityId: entityId,
      operation: operation,
      data: data,
      status: SyncQueueStatus.pending,
      priority: priority,
      createdAt: DateTime.now(),
      dependencies: dependencies,
      metadata: metadata,
    );
  }

  static String _generateId() {
    return '${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';
  }

  static List<SyncQueueItem> sortByPriority(List<SyncQueueItem> items) {
    final sorted = List<SyncQueueItem>.from(items);
    sorted.sort((a, b) {
      // First sort by priority (lower number = higher priority)
      final priorityComparison = a.priority.compareTo(b.priority);
      if (priorityComparison != 0) return priorityComparison;
      
      // Then by creation time (older first)
      return a.createdAt.compareTo(b.createdAt);
    });
    return sorted;
  }

  static List<SyncQueueItem> filterByStatus(List<SyncQueueItem> items, SyncQueueStatus status) {
    return items.where((item) => item.status == status).toList();
  }

  static List<SyncQueueItem> filterByEntityType(List<SyncQueueItem> items, String entityType) {
    return items.where((item) => item.entityType == entityType).toList();
  }

  static List<SyncQueueItem> filterByOperation(List<SyncQueueItem> items, SyncOperation operation) {
    return items.where((item) => item.operation == operation).toList();
  }

  static List<SyncQueueItem> getReadyItems(List<SyncQueueItem> items) {
    final pendingItems = filterByStatus(items, SyncQueueStatus.pending);
    final completedIds = filterByStatus(items, SyncQueueStatus.completed)
        .map((item) => item.id)
        .toSet();

    return pendingItems.where((item) {
      // Check if all dependencies are completed
      return item.dependencies.every((depId) => completedIds.contains(depId));
    }).toList();
  }

  static List<SyncQueueItem> getRetryableItems(List<SyncQueueItem> items) {
    return items.where((item) {
      return item.status.canRetry && item.retryCount < item.maxRetries;
    }).toList();
  }

  static Map<String, int> getStatusCounts(List<SyncQueueItem> items) {
    final Map<String, int> counts = {};
    
    for (final status in SyncQueueStatus.values) {
      counts[status.displayName] = filterByStatus(items, status).length;
    }
    
    return counts;
  }

  static Map<String, int> getOperationCounts(List<SyncQueueItem> items) {
    final Map<String, int> counts = {};
    
    for (final operation in SyncOperation.values) {
      counts[operation.displayName] = filterByOperation(items, operation).length;
    }
    
    return counts;
  }

  static bool hasConflicts(List<SyncQueueItem> items, String entityId) {
    final entityItems = items.where((item) => item.entityId == entityId).toList();
    
    // Check for conflicting operations on the same entity
    final operations = entityItems.map((item) => item.operation).toSet();
    
    // Delete conflicts with any other operation
    if (operations.contains(SyncOperation.delete) && operations.length > 1) {
      return true;
    }
    
    // Multiple updates might conflict
    if (entityItems.where((item) => item.operation == SyncOperation.update).length > 1) {
      return true;
    }
    
    return false;
  }

  static List<SyncQueueItem> resolveConflicts(List<SyncQueueItem> items) {
    final Map<String, List<SyncQueueItem>> entityGroups = {};
    
    // Group items by entity ID
    for (final item in items) {
      entityGroups.putIfAbsent(item.entityId, () => []).add(item);
    }
    
    final List<SyncQueueItem> resolved = [];
    
    for (final entityItems in entityGroups.values) {
      if (entityItems.length == 1) {
        resolved.addAll(entityItems);
        continue;
      }
      
      // Sort by creation time
      entityItems.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      
      // If there's a delete operation, only keep the latest delete
      final deleteItems = entityItems.where((item) => item.operation == SyncOperation.delete).toList();
      if (deleteItems.isNotEmpty) {
        resolved.add(deleteItems.last);
        continue;
      }
      
      // For other operations, keep the latest of each type
      final Map<SyncOperation, SyncQueueItem> latestByOperation = {};
      for (final item in entityItems) {
        latestByOperation[item.operation] = item;
      }
      
      resolved.addAll(latestByOperation.values);
    }
    
    return resolved;
  }
}