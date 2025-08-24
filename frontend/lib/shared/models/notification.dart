import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification.freezed.dart';
part 'notification.g.dart';

@freezed
class AppNotification with _$AppNotification {
  const factory AppNotification({
    required String id,
    required String title,
    required String message,
    required NotificationType type,
    required NotificationPriority priority,
    required NotificationStatus status,
    String? userId,
    String? groupId,
    String? relatedEntityId,
    String? relatedEntityType,
    NotificationAction? action,
    Map<String, dynamic>? data,
    Map<String, dynamic>? metadata,
    String? imageUrl,
    String? iconName,
    String? color,
    required DateTime createdAt,
    DateTime? readAt,
    DateTime? dismissedAt,
    DateTime? expiresAt,
    DateTime? scheduledAt,
    @Default(false) bool isRead,
    @Default(false) bool isDismissed,
    @Default(false) bool isPersistent,
    @Default(false) bool requiresAction,
    @Default(false) bool isSystemGenerated,
    List<String>? tags,
    String? category,
    String? source,
  }) = _AppNotification;

  factory AppNotification.fromJson(Map<String, dynamic> json) => _$AppNotificationFromJson(json);
}

@freezed
class NotificationAction with _$NotificationAction {
  const factory NotificationAction({
    required String id,
    required String label,
    required NotificationActionType type,
    String? route,
    Map<String, dynamic>? parameters,
    String? url,
    String? apiEndpoint,
    String? method,
    Map<String, dynamic>? payload,
    String? confirmationMessage,
    @Default(false) bool requiresConfirmation,
    @Default(false) bool dismissesNotification,
    String? icon,
    String? color,
  }) = _NotificationAction;

  factory NotificationAction.fromJson(Map<String, dynamic> json) => _$NotificationActionFromJson(json);
}

@freezed
class NotificationSettings with _$NotificationSettings {
  const factory NotificationSettings({
    required String userId,
    @Default(true) bool enablePushNotifications,
    @Default(true) bool enableEmailNotifications,
    @Default(true) bool enableInAppNotifications,
    @Default(true) bool enableSoundNotifications,
    @Default(true) bool enableVibrationNotifications,
    NotificationTypeSettings? typeSettings,
    NotificationSchedule? schedule,
    @Default(false) bool doNotDisturbEnabled,
    TimeRange? doNotDisturbPeriod,
    List<String>? mutedCategories,
    List<String>? mutedSources,
    @Default(7) int retentionDays,
    @Default(100) int maxNotifications,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _NotificationSettings;

  factory NotificationSettings.fromJson(Map<String, dynamic> json) => _$NotificationSettingsFromJson(json);
}

@freezed
class NotificationTypeSettings with _$NotificationTypeSettings {
  const factory NotificationTypeSettings({
    @Default(true) bool inspectionReminders,
    @Default(true) bool inspectionOverdue,
    @Default(true) bool inspectionCompleted,
    @Default(true) bool assetUpdates,
    @Default(true) bool systemAlerts,
    @Default(true) bool securityAlerts,
    @Default(true) bool reportGenerated,
    @Default(true) bool syncStatus,
    @Default(true) bool teamUpdates,
    @Default(true) bool maintenanceAlerts,
    @Default(true) bool complianceAlerts,
    @Default(false) bool marketingUpdates,
    @Default(true) bool criticalIssues,
    @Default(true) bool workflowUpdates,
  }) = _NotificationTypeSettings;

  factory NotificationTypeSettings.fromJson(Map<String, dynamic> json) => _$NotificationTypeSettingsFromJson(json);
}

@freezed
class NotificationSchedule with _$NotificationSchedule {
  const factory NotificationSchedule({
    TimeRange? workingHours,
    List<int>? workingDays, // 1-7, Monday to Sunday
    @Default(false) bool weekendsOnly,
    @Default(false) bool workingHoursOnly,
    String? timezone,
  }) = _NotificationSchedule;

  factory NotificationSchedule.fromJson(Map<String, dynamic> json) => _$NotificationScheduleFromJson(json);
}

@freezed
class TimeRange with _$TimeRange {
  const factory TimeRange({
    required String startTime, // HH:mm format
    required String endTime,   // HH:mm format
  }) = _TimeRange;

  factory TimeRange.fromJson(Map<String, dynamic> json) => _$TimeRangeFromJson(json);
}

@freezed
class NotificationBatch with _$NotificationBatch {
  const factory NotificationBatch({
    required String id,
    required String title,
    String? description,
    required List<String> notificationIds,
    required NotificationBatchStatus status,
    required DateTime createdAt,
    DateTime? sentAt,
    DateTime? completedAt,
    int? totalRecipients,
    int? successfulDeliveries,
    int? failedDeliveries,
    List<String>? errors,
    Map<String, dynamic>? metadata,
  }) = _NotificationBatch;

  factory NotificationBatch.fromJson(Map<String, dynamic> json) => _$NotificationBatchFromJson(json);
}

@freezed
class NotificationTemplate with _$NotificationTemplate {
  const factory NotificationTemplate({
    required String id,
    required String name,
    String? description,
    required NotificationType type,
    required String titleTemplate,
    required String messageTemplate,
    String? emailSubjectTemplate,
    String? emailBodyTemplate,
    String? smsTemplate,
    Map<String, dynamic>? defaultData,
    List<String>? requiredVariables,
    NotificationAction? defaultAction,
    String? iconName,
    String? color,
    @Default(true) bool isActive,
    String? createdById,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _NotificationTemplate;

  factory NotificationTemplate.fromJson(Map<String, dynamic> json) => _$NotificationTemplateFromJson(json);
}

@freezed
class NotificationRule with _$NotificationRule {
  const factory NotificationRule({
    required String id,
    required String name,
    String? description,
    required NotificationTrigger trigger,
    required List<NotificationCondition> conditions,
    required NotificationRuleAction action,
    @Default(true) bool isActive,
    @Default(0) int priority,
    String? createdById,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? lastTriggeredAt,
    int? triggerCount,
  }) = _NotificationRule;

  factory NotificationRule.fromJson(Map<String, dynamic> json) => _$NotificationRuleFromJson(json);
}

@freezed
class NotificationTrigger with _$NotificationTrigger {
  const factory NotificationTrigger({
    required NotificationTriggerType type,
    String? entityType,
    String? eventType,
    Map<String, dynamic>? parameters,
    String? cronExpression,
    Duration? delay,
  }) = _NotificationTrigger;

  factory NotificationTrigger.fromJson(Map<String, dynamic> json) => _$NotificationTriggerFromJson(json);
}

@freezed
class NotificationCondition with _$NotificationCondition {
  const factory NotificationCondition({
    required String field,
    required NotificationConditionOperator operator,
    required dynamic value,
    NotificationConditionLogic? logic,
  }) = _NotificationCondition;

  factory NotificationCondition.fromJson(Map<String, dynamic> json) => _$NotificationConditionFromJson(json);
}

@freezed
class NotificationRuleAction with _$NotificationRuleAction {
  const factory NotificationRuleAction({
    required NotificationRuleActionType type,
    String? templateId,
    List<String>? recipientIds,
    List<String>? recipientRoles,
    Map<String, dynamic>? data,
    NotificationChannel? channel,
    @Default(false) bool suppressDuplicates,
    Duration? suppressionWindow,
  }) = _NotificationRuleAction;

  factory NotificationRuleAction.fromJson(Map<String, dynamic> json) => _$NotificationRuleActionFromJson(json);
}

@freezed
class NotificationStatistics with _$NotificationStatistics {
  const factory NotificationStatistics({
    required int totalNotifications,
    required int unreadNotifications,
    required int readNotifications,
    required int dismissedNotifications,
    required int expiredNotifications,
    Map<String, int>? notificationsByType,
    Map<String, int>? notificationsByPriority,
    Map<String, int>? notificationsByStatus,
    Map<String, int>? notificationsByCategory,
    Map<String, int>? notificationsBySource,
    double? averageReadTime,
    double? readRate,
    double? dismissalRate,
    DateTime? oldestUnread,
    DateTime? newestNotification,
    required DateTime calculatedAt,
  }) = _NotificationStatistics;

  factory NotificationStatistics.fromJson(Map<String, dynamic> json) => _$NotificationStatisticsFromJson(json);
}

enum NotificationType {
  @JsonValue('info')
  info,
  @JsonValue('success')
  success,
  @JsonValue('warning')
  warning,
  @JsonValue('error')
  error,
  @JsonValue('reminder')
  reminder,
  @JsonValue('alert')
  alert,
  @JsonValue('update')
  update,
  @JsonValue('invitation')
  invitation,
  @JsonValue('announcement')
  announcement,
  @JsonValue('system')
  system,
}

enum NotificationPriority {
  @JsonValue('low')
  low,
  @JsonValue('normal')
  normal,
  @JsonValue('high')
  high,
  @JsonValue('urgent')
  urgent,
  @JsonValue('critical')
  critical,
}

enum NotificationStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('sent')
  sent,
  @JsonValue('delivered')
  delivered,
  @JsonValue('read')
  read,
  @JsonValue('dismissed')
  dismissed,
  @JsonValue('failed')
  failed,
  @JsonValue('expired')
  expired,
  @JsonValue('cancelled')
  cancelled,
}

enum NotificationActionType {
  @JsonValue('navigate')
  navigate,
  @JsonValue('api_call')
  apiCall,
  @JsonValue('external_link')
  externalLink,
  @JsonValue('dismiss')
  dismiss,
  @JsonValue('mark_read')
  markRead,
  @JsonValue('custom')
  custom,
}

enum NotificationChannel {
  @JsonValue('in_app')
  inApp,
  @JsonValue('push')
  push,
  @JsonValue('email')
  email,
  @JsonValue('sms')
  sms,
  @JsonValue('webhook')
  webhook,
}

enum NotificationBatchStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('processing')
  processing,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('cancelled')
  cancelled,
}

enum NotificationTriggerType {
  @JsonValue('event')
  event,
  @JsonValue('schedule')
  schedule,
  @JsonValue('condition')
  condition,
  @JsonValue('manual')
  manual,
}

enum NotificationConditionOperator {
  @JsonValue('equals')
  equals,
  @JsonValue('not_equals')
  notEquals,
  @JsonValue('greater_than')
  greaterThan,
  @JsonValue('less_than')
  lessThan,
  @JsonValue('greater_than_or_equal')
  greaterThanOrEqual,
  @JsonValue('less_than_or_equal')
  lessThanOrEqual,
  @JsonValue('contains')
  contains,
  @JsonValue('not_contains')
  notContains,
  @JsonValue('starts_with')
  startsWith,
  @JsonValue('ends_with')
  endsWith,
  @JsonValue('in')
  inList,
  @JsonValue('not_in')
  notInList,
  @JsonValue('is_null')
  isNull,
  @JsonValue('is_not_null')
  isNotNull,
}

enum NotificationConditionLogic {
  @JsonValue('and')
  and,
  @JsonValue('or')
  or,
}

enum NotificationRuleActionType {
  @JsonValue('send_notification')
  sendNotification,
  @JsonValue('send_email')
  sendEmail,
  @JsonValue('send_sms')
  sendSms,
  @JsonValue('webhook')
  webhook,
  @JsonValue('create_task')
  createTask,
  @JsonValue('update_entity')
  updateEntity,
}

// Extensions
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
      case NotificationType.reminder:
        return 'Reminder';
      case NotificationType.alert:
        return 'Alert';
      case NotificationType.update:
        return 'Update';
      case NotificationType.invitation:
        return 'Invitation';
      case NotificationType.announcement:
        return 'Announcement';
      case NotificationType.system:
        return 'System';
    }
  }

  String get icon {
    switch (this) {
      case NotificationType.info:
        return 'info';
      case NotificationType.success:
        return 'check_circle';
      case NotificationType.warning:
        return 'warning';
      case NotificationType.error:
        return 'error';
      case NotificationType.reminder:
        return 'schedule';
      case NotificationType.alert:
        return 'notification_important';
      case NotificationType.update:
        return 'update';
      case NotificationType.invitation:
        return 'person_add';
      case NotificationType.announcement:
        return 'campaign';
      case NotificationType.system:
        return 'settings';
    }
  }

  String get color {
    switch (this) {
      case NotificationType.info:
        return '#2196F3'; // Blue
      case NotificationType.success:
        return '#4CAF50'; // Green
      case NotificationType.warning:
        return '#FF9800'; // Orange
      case NotificationType.error:
        return '#F44336'; // Red
      case NotificationType.reminder:
        return '#9C27B0'; // Purple
      case NotificationType.alert:
        return '#FF5722'; // Deep Orange
      case NotificationType.update:
        return '#00BCD4'; // Cyan
      case NotificationType.invitation:
        return '#3F51B5'; // Indigo
      case NotificationType.announcement:
        return '#607D8B'; // Blue Grey
      case NotificationType.system:
        return '#795548'; // Brown
    }
  }

  bool get isImportant {
    switch (this) {
      case NotificationType.error:
      case NotificationType.alert:
        return true;
      default:
        return false;
    }
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
      case NotificationPriority.critical:
        return 'Critical';
    }
  }

  String get color {
    switch (this) {
      case NotificationPriority.low:
        return '#4CAF50'; // Green
      case NotificationPriority.normal:
        return '#2196F3'; // Blue
      case NotificationPriority.high:
        return '#FF9800'; // Orange
      case NotificationPriority.urgent:
        return '#FF5722'; // Deep Orange
      case NotificationPriority.critical:
        return '#F44336'; // Red
    }
  }

  int get value {
    switch (this) {
      case NotificationPriority.low:
        return 1;
      case NotificationPriority.normal:
        return 2;
      case NotificationPriority.high:
        return 3;
      case NotificationPriority.urgent:
        return 4;
      case NotificationPriority.critical:
        return 5;
    }
  }

  bool get requiresImmediateAttention {
    return this == NotificationPriority.urgent || this == NotificationPriority.critical;
  }

  bool get shouldShowBadge {
    return value >= NotificationPriority.high.value;
  }
}

extension NotificationStatusExtension on NotificationStatus {
  String get displayName {
    switch (this) {
      case NotificationStatus.pending:
        return 'Pending';
      case NotificationStatus.sent:
        return 'Sent';
      case NotificationStatus.delivered:
        return 'Delivered';
      case NotificationStatus.read:
        return 'Read';
      case NotificationStatus.dismissed:
        return 'Dismissed';
      case NotificationStatus.failed:
        return 'Failed';
      case NotificationStatus.expired:
        return 'Expired';
      case NotificationStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get color {
    switch (this) {
      case NotificationStatus.pending:
        return '#FF9800'; // Orange
      case NotificationStatus.sent:
        return '#2196F3'; // Blue
      case NotificationStatus.delivered:
        return '#00BCD4'; // Cyan
      case NotificationStatus.read:
        return '#4CAF50'; // Green
      case NotificationStatus.dismissed:
        return '#9E9E9E'; // Grey
      case NotificationStatus.failed:
        return '#F44336'; // Red
      case NotificationStatus.expired:
        return '#795548'; // Brown
      case NotificationStatus.cancelled:
        return '#607D8B'; // Blue Grey
    }
  }

  bool get isActive {
    switch (this) {
      case NotificationStatus.pending:
      case NotificationStatus.sent:
      case NotificationStatus.delivered:
        return true;
      default:
        return false;
    }
  }

  bool get isCompleted {
    switch (this) {
      case NotificationStatus.read:
      case NotificationStatus.dismissed:
        return true;
      default:
        return false;
    }
  }

  bool get isFailed {
    switch (this) {
      case NotificationStatus.failed:
      case NotificationStatus.expired:
      case NotificationStatus.cancelled:
        return true;
      default:
        return false;
    }
  }
}

extension NotificationActionTypeExtension on NotificationActionType {
  String get displayName {
    switch (this) {
      case NotificationActionType.navigate:
        return 'Navigate';
      case NotificationActionType.apiCall:
        return 'API Call';
      case NotificationActionType.externalLink:
        return 'External Link';
      case NotificationActionType.dismiss:
        return 'Dismiss';
      case NotificationActionType.markRead:
        return 'Mark as Read';
      case NotificationActionType.custom:
        return 'Custom';
    }
  }

  String get icon {
    switch (this) {
      case NotificationActionType.navigate:
        return 'navigation';
      case NotificationActionType.apiCall:
        return 'api';
      case NotificationActionType.externalLink:
        return 'open_in_new';
      case NotificationActionType.dismiss:
        return 'close';
      case NotificationActionType.markRead:
        return 'mark_email_read';
      case NotificationActionType.custom:
        return 'extension';
    }
  }
}

// Notification Extensions
extension AppNotificationExtension on AppNotification {
  bool get isUnread => !isRead;
  bool get isActive => !isDismissed && !isExpired;
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
  
  Duration? get timeUntilExpiry {
    if (expiresAt == null) return null;
    final now = DateTime.now();
    if (now.isAfter(expiresAt!)) return null;
    return expiresAt!.difference(now);
  }
  
  Duration get age => DateTime.now().difference(createdAt);
  
  String get ageFormatted {
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
  
  String get typeDisplayName => type.displayName;
  String get priorityDisplayName => priority.displayName;
  String get statusDisplayName => status.displayName;
  
  String get typeIcon => type.icon;
  String get typeColor => type.color;
  String get priorityColor => priority.color;
  String get statusColor => status.color;
  
  bool get hasAction => action != null;
  bool get hasImage => imageUrl != null;
  bool get hasIcon => iconName != null;
  bool get hasRelatedEntity => relatedEntityId != null;
  
  bool get shouldShowBadge => priority.shouldShowBadge && isUnread;
  bool get requiresImmediateAttention => priority.requiresImmediateAttention;
  
  String get displayIcon {
    if (iconName != null) return iconName!;
    return typeIcon;
  }
  
  String get displayColor {
    if (color != null) return color!;
    return typeColor;
  }
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': typeDisplayName,
      'priority': priorityDisplayName,
      'status': statusDisplayName,
      'isRead': isRead,
      'isDismissed': isDismissed,
      'isExpired': isExpired,
      'hasAction': hasAction,
      'age': ageFormatted,
      'createdAt': createdAt.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}

extension NotificationSettingsExtension on NotificationSettings {
  bool get hasDoNotDisturb => doNotDisturbEnabled && doNotDisturbPeriod != null;
  
  bool get isInDoNotDisturbPeriod {
    if (!hasDoNotDisturb) return false;
    
    final now = DateTime.now();
    final currentTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    
    final period = doNotDisturbPeriod!;
    final start = period.startTime;
    final end = period.endTime;
    
    // Handle overnight periods (e.g., 22:00 to 06:00)
    if (start.compareTo(end) > 0) {
      return currentTime.compareTo(start) >= 0 || currentTime.compareTo(end) <= 0;
    } else {
      return currentTime.compareTo(start) >= 0 && currentTime.compareTo(end) <= 0;
    }
  }
  
  bool isNotificationEnabled(NotificationType type) {
    if (!enableInAppNotifications) return false;
    if (typeSettings == null) return true;
    
    switch (type) {
      case NotificationType.info:
        return true; // Always enabled
      case NotificationType.success:
        return true; // Always enabled
      case NotificationType.warning:
        return typeSettings!.systemAlerts;
      case NotificationType.error:
        return typeSettings!.systemAlerts;
      case NotificationType.reminder:
        return typeSettings!.inspectionReminders;
      case NotificationType.alert:
        return typeSettings!.systemAlerts;
      case NotificationType.update:
        return typeSettings!.teamUpdates;
      case NotificationType.invitation:
        return typeSettings!.teamUpdates;
      case NotificationType.announcement:
        return typeSettings!.marketingUpdates;
      case NotificationType.system:
        return typeSettings!.systemAlerts;
    }
  }
  
  bool isCategoryMuted(String? category) {
    if (category == null) return false;
    return mutedCategories?.contains(category) == true;
  }
  
  bool isSourceMuted(String? source) {
    if (source == null) return false;
    return mutedSources?.contains(source) == true;
  }
  
  bool shouldReceiveNotification(AppNotification notification) {
    // Check if notifications are enabled
    if (!enableInAppNotifications) return false;
    
    // Check if type is enabled
    if (!isNotificationEnabled(notification.type)) return false;
    
    // Check if category is muted
    if (isCategoryMuted(notification.category)) return false;
    
    // Check if source is muted
    if (isSourceMuted(notification.source)) return false;
    
    // Check do not disturb
    if (isInDoNotDisturbPeriod && !notification.priority.requiresImmediateAttention) {
      return false;
    }
    
    return true;
  }
}

extension TimeRangeExtension on TimeRange {
  bool contains(String time) {
    // Handle overnight periods
    if (startTime.compareTo(endTime) > 0) {
      return time.compareTo(startTime) >= 0 || time.compareTo(endTime) <= 0;
    } else {
      return time.compareTo(startTime) >= 0 && time.compareTo(endTime) <= 0;
    }
  }
  
  Duration get duration {
    final start = _parseTime(startTime);
    final end = _parseTime(endTime);
    
    if (end.isBefore(start)) {
      // Overnight period
      final endOfDay = DateTime(start.year, start.month, start.day, 23, 59, 59);
      final startOfNextDay = DateTime(start.year, start.month, start.day + 1, 0, 0, 0);
      final nextDayEnd = DateTime(start.year, start.month, start.day + 1, end.hour, end.minute);
      
      return endOfDay.difference(start) + nextDayEnd.difference(startOfNextDay);
    } else {
      return end.difference(start);
    }
  }
  
  DateTime _parseTime(String time) {
    final parts = time.split(':');
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, hour, minute);
  }
  
  String get displayText {
    return '$startTime - $endTime';
  }
}

extension NotificationStatisticsExtension on NotificationStatistics {
  double get unreadPercentage {
    if (totalNotifications == 0) return 0.0;
    return (unreadNotifications / totalNotifications) * 100;
  }
  
  double get readPercentage {
    if (totalNotifications == 0) return 0.0;
    return (readNotifications / totalNotifications) * 100;
  }
  
  double get dismissedPercentage {
    if (totalNotifications == 0) return 0.0;
    return (dismissedNotifications / totalNotifications) * 100;
  }
  
  bool get hasUnreadNotifications => unreadNotifications > 0;
  bool get hasOldUnreadNotifications {
    if (oldestUnread == null) return false;
    final age = DateTime.now().difference(oldestUnread!);
    return age.inDays > 7; // Consider notifications older than 7 days as old
  }
  
  String get summaryText {
    if (totalNotifications == 0) {
      return 'No notifications';
    }
    
    if (unreadNotifications == 0) {
      return 'All notifications read';
    }
    
    return '$unreadNotifications unread of $totalNotifications total';
  }
}

// Notification Helper Functions
class NotificationHelper {
  static AppNotification createInspectionReminder({
    required String inspectionId,
    required String assetName,
    required DateTime dueDate,
    String? userId,
  }) {
    final isOverdue = DateTime.now().isAfter(dueDate);
    final daysUntilDue = dueDate.difference(DateTime.now()).inDays;
    
    return AppNotification(
      id: 'inspection_reminder_$inspectionId',
      title: isOverdue ? 'Overdue Inspection' : 'Inspection Reminder',
      message: isOverdue 
          ? 'Inspection for $assetName is overdue by ${-daysUntilDue} days'
          : 'Inspection for $assetName is due in $daysUntilDue days',
      type: isOverdue ? NotificationType.alert : NotificationType.reminder,
      priority: isOverdue ? NotificationPriority.high : NotificationPriority.normal,
      status: NotificationStatus.pending,
      userId: userId,
      relatedEntityId: inspectionId,
      relatedEntityType: 'inspection',
      action: NotificationAction(
        id: 'view_inspection',
        label: 'View Inspection',
        type: NotificationActionType.navigate,
        route: '/inspections/$inspectionId',
        dismissesNotification: true,
      ),
      category: 'inspection',
      source: 'system',
      createdAt: DateTime.now(),
      expiresAt: dueDate.add(const Duration(days: 30)),
      isSystemGenerated: true,
    );
  }
  
  static AppNotification createReportGenerated({
    required String reportId,
    required String reportName,
    String? userId,
  }) {
    return AppNotification(
      id: 'report_generated_$reportId',
      title: 'Report Generated',
      message: 'Your report "$reportName" has been generated and is ready for download',
      type: NotificationType.success,
      priority: NotificationPriority.normal,
      status: NotificationStatus.pending,
      userId: userId,
      relatedEntityId: reportId,
      relatedEntityType: 'report',
      action: NotificationAction(
        id: 'download_report',
        label: 'Download Report',
        type: NotificationActionType.navigate,
        route: '/reports/$reportId',
        dismissesNotification: true,
      ),
      category: 'report',
      source: 'system',
      createdAt: DateTime.now(),
      expiresAt: DateTime.now().add(const Duration(days: 7)),
      isSystemGenerated: true,
    );
  }
  
  static AppNotification createSyncError({
    required String error,
    String? userId,
  }) {
    return AppNotification(
      id: 'sync_error_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Sync Error',
      message: 'Failed to synchronize data: $error',
      type: NotificationType.error,
      priority: NotificationPriority.high,
      status: NotificationStatus.pending,
      userId: userId,
      action: NotificationAction(
        id: 'retry_sync',
        label: 'Retry Sync',
        type: NotificationActionType.apiCall,
        apiEndpoint: '/api/sync/retry',
        method: 'POST',
        dismissesNotification: true,
      ),
      category: 'sync',
      source: 'system',
      createdAt: DateTime.now(),
      isPersistent: true,
      requiresAction: true,
      isSystemGenerated: true,
    );
  }
  
  static AppNotification createSystemMaintenance({
    required DateTime maintenanceStart,
    required Duration duration,
  }) {
    return AppNotification(
      id: 'system_maintenance_${maintenanceStart.millisecondsSinceEpoch}',
      title: 'Scheduled Maintenance',
      message: 'System maintenance is scheduled for ${_formatDateTime(maintenanceStart)} and will last approximately ${_formatDuration(duration)}',
      type: NotificationType.announcement,
      priority: NotificationPriority.normal,
      status: NotificationStatus.pending,
      category: 'system',
      source: 'admin',
      createdAt: DateTime.now(),
      scheduledAt: maintenanceStart.subtract(const Duration(hours: 24)),
      expiresAt: maintenanceStart.add(duration),
      isPersistent: true,
      isSystemGenerated: true,
    );
  }
  
  static String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} at ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
  
  static String _formatDuration(Duration duration) {
    if (duration.inHours > 0) {
      return '${duration.inHours} hour${duration.inHours > 1 ? 's' : ''}';
    } else {
      return '${duration.inMinutes} minute${duration.inMinutes > 1 ? 's' : ''}';
    }
  }
}