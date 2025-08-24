import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification.freezed.dart';
part 'notification.g.dart';

@freezed
@HiveType(typeId: 42)
class AppNotification with _$AppNotification {
  const factory AppNotification({
    @HiveField(0) required String id,
    @HiveField(1) required String title,
    @HiveField(2) required String message,
    @HiveField(3) required NotificationType type,
    @HiveField(4) required NotificationPriority priority,
    @HiveField(5) required DateTime createdAt,
    @HiveField(6) DateTime? readAt,
    @HiveField(7) DateTime? dismissedAt,
    @HiveField(8) DateTime? expiresAt,
    @HiveField(9) @Default(false) bool isRead,
    @HiveField(10) @Default(false) bool isDismissed,
    @HiveField(11) @Default(false) bool isPersistent,
    @HiveField(12) String? actionUrl,
    @HiveField(13) String? actionLabel,
    @HiveField(14) String? entityType,
    @HiveField(15) String? entityId,
    @HiveField(16) String? userId,
    @HiveField(17) @Default({}) Map<String, dynamic> metadata,
    @HiveField(18) String? iconName,
    @HiveField(19) String? imageUrl,
  }) = _AppNotification;

  factory AppNotification.fromJson(Map<String, dynamic> json) => _$AppNotificationFromJson(json);
}

@HiveType(typeId: 43)
enum NotificationType {
  @HiveField(0)
  info,
  @HiveField(1)
  success,
  @HiveField(2)
  warning,
  @HiveField(3)
  error,
  @HiveField(4)
  inspection,
  @HiveField(5)
  asset,
  @HiveField(6)
  report,
  @HiveField(7)
  sync,
  @HiveField(8)
  system,
  @HiveField(9)
  reminder,
  @HiveField(10)
  alert,
}

@HiveType(typeId: 44)
enum NotificationPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  normal,
  @HiveField(2)
  high,
  @HiveField(3)
  urgent,
}

extension NotificationTypeExtension on NotificationType {
  String get displayName {
    switch (this) {
      case NotificationType.info:
        return 'Information';
      case NotificationType.success:
        return 'Success';
      case NotificationType.warning:
        return 'Warning';
      case NotificationType.error:
        return 'Error';
      case NotificationType.inspection:
        return 'Inspection';
      case NotificationType.asset:
        return 'Asset';
      case NotificationType.report:
        return 'Report';
      case NotificationType.sync:
        return 'Sync';
      case NotificationType.system:
        return 'System';
      case NotificationType.reminder:
        return 'Reminder';
      case NotificationType.alert:
        return 'Alert';
    }
  }

  String get iconName {
    switch (this) {
      case NotificationType.info:
        return 'info';
      case NotificationType.success:
        return 'check_circle';
      case NotificationType.warning:
        return 'warning';
      case NotificationType.error:
        return 'error';
      case NotificationType.inspection:
        return 'assignment';
      case NotificationType.asset:
        return 'inventory_2';
      case NotificationType.report:
        return 'description';
      case NotificationType.sync:
        return 'sync';
      case NotificationType.system:
        return 'settings';
      case NotificationType.reminder:
        return 'schedule';
      case NotificationType.alert:
        return 'notification_important';
    }
  }

  String get colorName {
    switch (this) {
      case NotificationType.info:
        return 'blue';
      case NotificationType.success:
        return 'green';
      case NotificationType.warning:
        return 'orange';
      case NotificationType.error:
        return 'red';
      case NotificationType.inspection:
        return 'purple';
      case NotificationType.asset:
        return 'teal';
      case NotificationType.report:
        return 'indigo';
      case NotificationType.sync:
        return 'cyan';
      case NotificationType.system:
        return 'grey';
      case NotificationType.reminder:
        return 'amber';
      case NotificationType.alert:
        return 'red';
    }
  }

  bool get isSystemType {
    return this == NotificationType.system || 
           this == NotificationType.sync ||
           this == NotificationType.error;
  }

  bool get isUserActionable {
    return this == NotificationType.inspection ||
           this == NotificationType.asset ||
           this == NotificationType.reminder ||
           this == NotificationType.alert;
  }
}

extension NotificationPriorityExtension on NotificationPriority {
  String get displayName {
    switch (this) {
      case NotificationPriority.low:
        return 'Low';
      case NotificationPriority.normal:
        return 'Normal';
      case NotificationPriority.high:
        return 'High';
      case NotificationPriority.urgent:
        return 'Urgent';
    }
  }

  int get sortOrder {
    switch (this) {
      case NotificationPriority.urgent:
        return 1;
      case NotificationPriority.high:
        return 2;
      case NotificationPriority.normal:
        return 3;
      case NotificationPriority.low:
        return 4;
    }
  }

  Duration get defaultTtl {
    switch (this) {
      case NotificationPriority.urgent:
        return const Duration(days: 7);
      case NotificationPriority.high:
        return const Duration(days: 5);
      case NotificationPriority.normal:
        return const Duration(days: 3);
      case NotificationPriority.low:
        return const Duration(days: 1);
    }
  }

  bool get requiresUserAction {
    return this == NotificationPriority.urgent || this == NotificationPriority.high;
  }

  bool get shouldShowBadge {
    return this == NotificationPriority.urgent || this == NotificationPriority.high;
  }
}

extension AppNotificationExtension on AppNotification {
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  bool get isActive {
    return !isExpired && !isDismissed;
  }

  bool get canDismiss {
    return !isDismissed && !isPersistent;
  }

  bool get hasAction {
    return actionUrl != null && actionLabel != null;
  }

  Duration get age {
    return DateTime.now().difference(createdAt);
  }

  String get ageDisplay {
    final age = this.age;
    
    if (age.inDays > 0) {
      return '${age.inDays}d ago';
    } else if (age.inHours > 0) {
      return '${age.inHours}h ago';
    } else if (age.inMinutes > 0) {
      return '${age.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  AppNotification markAsRead() {
    return copyWith(
      isRead: true,
      readAt: DateTime.now(),
    );
  }

  AppNotification dismiss() {
    return copyWith(
      isDismissed: true,
      dismissedAt: DateTime.now(),
    );
  }

  AppNotification updateExpiry(DateTime newExpiry) {
    return copyWith(expiresAt: newExpiry);
  }
}

// Helper class for managing notifications
class NotificationManager {
  static AppNotification createNotification({
    required String title,
    required String message,
    required NotificationType type,
    NotificationPriority priority = NotificationPriority.normal,
    String? actionUrl,
    String? actionLabel,
    String? entityType,
    String? entityId,
    String? userId,
    Duration? ttl,
    bool isPersistent = false,
    Map<String, dynamic> metadata = const {},
    String? iconName,
    String? imageUrl,
  }) {
    final now = DateTime.now();
    final expiry = ttl != null ? now.add(ttl) : now.add(priority.defaultTtl);
    
    return AppNotification(
      id: _generateId(),
      title: title,
      message: message,
      type: type,
      priority: priority,
      createdAt: now,
      expiresAt: isPersistent ? null : expiry,
      actionUrl: actionUrl,
      actionLabel: actionLabel,
      entityType: entityType,
      entityId: entityId,
      userId: userId,
      isPersistent: isPersistent,
      metadata: metadata,
      iconName: iconName ?? type.iconName,
      imageUrl: imageUrl,
    );
  }

  static String _generateId() {
    return 'notif_${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';
  }

  static List<AppNotification> sortNotifications(List<AppNotification> notifications) {
    final sorted = List<AppNotification>.from(notifications);
    sorted.sort((a, b) {
      // First by read status (unread first)
      if (a.isRead != b.isRead) {
        return a.isRead ? 1 : -1;
      }
      
      // Then by priority (higher priority first)
      final priorityComparison = a.priority.sortOrder.compareTo(b.priority.sortOrder);
      if (priorityComparison != 0) return priorityComparison;
      
      // Finally by creation time (newer first)
      return b.createdAt.compareTo(a.createdAt);
    });
    return sorted;
  }

  static List<AppNotification> filterActive(List<AppNotification> notifications) {
    return notifications.where((notification) => notification.isActive).toList();
  }

  static List<AppNotification> filterUnread(List<AppNotification> notifications) {
    return notifications.where((notification) => !notification.isRead).toList();
  }

  static List<AppNotification> filterByType(List<AppNotification> notifications, NotificationType type) {
    return notifications.where((notification) => notification.type == type).toList();
  }

  static List<AppNotification> filterByPriority(List<AppNotification> notifications, NotificationPriority priority) {
    return notifications.where((notification) => notification.priority == priority).toList();
  }

  static List<AppNotification> filterByEntity(List<AppNotification> notifications, String entityType, String entityId) {
    return notifications.where((notification) => 
        notification.entityType == entityType && notification.entityId == entityId).toList();
  }

  static List<AppNotification> filterExpired(List<AppNotification> notifications) {
    return notifications.where((notification) => notification.isExpired).toList();
  }

  static Map<String, int> getTypeCounts(List<AppNotification> notifications) {
    final Map<String, int> counts = {};
    
    for (final type in NotificationType.values) {
      counts[type.displayName] = filterByType(notifications, type).length;
    }
    
    return counts;
  }

  static Map<String, int> getPriorityCounts(List<AppNotification> notifications) {
    final Map<String, int> counts = {};
    
    for (final priority in NotificationPriority.values) {
      counts[priority.displayName] = filterByPriority(notifications, priority).length;
    }
    
    return counts;
  }

  static int getUnreadCount(List<AppNotification> notifications) {
    return filterUnread(filterActive(notifications)).length;
  }

  static int getUrgentCount(List<AppNotification> notifications) {
    return filterByPriority(filterActive(notifications), NotificationPriority.urgent).length;
  }

  static List<AppNotification> cleanupExpired(List<AppNotification> notifications) {
    return notifications.where((notification) => !notification.isExpired).toList();
  }

  static List<AppNotification> markAllAsRead(List<AppNotification> notifications) {
    return notifications.map((notification) => 
        notification.isRead ? notification : notification.markAsRead()).toList();
  }

  static List<AppNotification> dismissAll(List<AppNotification> notifications) {
    return notifications.map((notification) => 
        notification.isDismissed || !notification.canDismiss ? notification : notification.dismiss()).toList();
  }

  // Predefined notification creators
  static AppNotification createInspectionReminder({
    required String inspectionId,
    required String assetName,
    required DateTime dueDate,
    String? userId,
  }) {
    final daysUntilDue = dueDate.difference(DateTime.now()).inDays;
    final priority = daysUntilDue <= 1 ? NotificationPriority.urgent : 
                    daysUntilDue <= 3 ? NotificationPriority.high : NotificationPriority.normal;
    
    return createNotification(
      title: 'Inspection Due',
      message: 'Inspection for $assetName is due ${daysUntilDue > 0 ? "in $daysUntilDue days" : "today"}',
      type: NotificationType.reminder,
      priority: priority,
      entityType: 'inspection',
      entityId: inspectionId,
      userId: userId,
      actionUrl: '/inspections/$inspectionId',
      actionLabel: 'View Inspection',
    );
  }

  static AppNotification createSyncError({
    required String error,
    required int failedItems,
    String? userId,
  }) {
    return createNotification(
      title: 'Sync Failed',
      message: 'Failed to sync $failedItems items: $error',
      type: NotificationType.error,
      priority: NotificationPriority.high,
      entityType: 'sync',
      entityId: 'sync_error',
      userId: userId,
      actionUrl: '/settings/sync',
      actionLabel: 'View Sync Status',
    );
  }

  static AppNotification createReportReady({
    required String reportId,
    required String reportName,
    String? userId,
  }) {
    return createNotification(
      title: 'Report Ready',
      message: 'Your report "$reportName" has been generated and is ready for download',
      type: NotificationType.success,
      priority: NotificationPriority.normal,
      entityType: 'report',
      entityId: reportId,
      userId: userId,
      actionUrl: '/reports/$reportId',
      actionLabel: 'Download Report',
    );
  }

  static AppNotification createAssetAlert({
    required String assetId,
    required String assetName,
    required String alertMessage,
    NotificationPriority priority = NotificationPriority.high,
    String? userId,
  }) {
    return createNotification(
      title: 'Asset Alert',
      message: '$assetName: $alertMessage',
      type: NotificationType.alert,
      priority: priority,
      entityType: 'asset',
      entityId: assetId,
      userId: userId,
      actionUrl: '/assets/$assetId',
      actionLabel: 'View Asset',
    );
  }
}