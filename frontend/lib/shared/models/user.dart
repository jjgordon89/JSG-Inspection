import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    String? phone,
    String? organization,
    String? department,
    String? jobTitle,
    String? profileImageUrl,
    required List<String> roles,
    required UserStatus status,
    UserPreferences? preferences,
    DateTime? lastLoginAt,
    DateTime? emailVerifiedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class UserPreferences with _$UserPreferences {
  const factory UserPreferences({
    @Default('system') String theme, // 'light', 'dark', 'system'
    @Default('en') String language,
    @Default(true) bool notificationsEnabled,
    @Default(true) bool emailNotifications,
    @Default(true) bool pushNotifications,
    @Default(false) bool soundEnabled,
    @Default(true) bool vibrationEnabled,
    @Default('metric') String units, // 'metric', 'imperial'
    @Default('dd/MM/yyyy') String dateFormat,
    @Default('24') String timeFormat, // '12', '24'
    @Default('auto') String syncFrequency, // 'manual', 'auto', 'wifi_only'
    @Default(true) bool offlineMode,
    @Default(50) int cacheSize, // MB
    @Default(5) int autoSaveInterval, // minutes
    Map<String, dynamic>? customSettings,
  }) = _UserPreferences;

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
}

enum UserStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('suspended')
  suspended,
  @JsonValue('pending_verification')
  pendingVerification,
}

enum UserRole {
  @JsonValue('admin')
  admin,
  @JsonValue('manager')
  manager,
  @JsonValue('inspector')
  inspector,
  @JsonValue('viewer')
  viewer,
  @JsonValue('technician')
  technician,
}

extension UserStatusExtension on UserStatus {
  String get displayName {
    switch (this) {
      case UserStatus.active:
        return 'Active';
      case UserStatus.inactive:
        return 'Inactive';
      case UserStatus.suspended:
        return 'Suspended';
      case UserStatus.pendingVerification:
        return 'Pending Verification';
    }
  }

  bool get isActive => this == UserStatus.active;
  bool get canLogin => this == UserStatus.active || this == UserStatus.pendingVerification;
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Administrator';
      case UserRole.manager:
        return 'Manager';
      case UserRole.inspector:
        return 'Inspector';
      case UserRole.viewer:
        return 'Viewer';
      case UserRole.technician:
        return 'Technician';
    }
  }

  List<String> get permissions {
    switch (this) {
      case UserRole.admin:
        return [
          'users.create',
          'users.read',
          'users.update',
          'users.delete',
          'inspections.create',
          'inspections.read',
          'inspections.update',
          'inspections.delete',
          'assets.create',
          'assets.read',
          'assets.update',
          'assets.delete',
          'reports.create',
          'reports.read',
          'reports.export',
          'settings.manage',
        ];
      case UserRole.manager:
        return [
          'users.read',
          'inspections.create',
          'inspections.read',
          'inspections.update',
          'inspections.assign',
          'assets.create',
          'assets.read',
          'assets.update',
          'reports.create',
          'reports.read',
          'reports.export',
        ];
      case UserRole.inspector:
        return [
          'inspections.create',
          'inspections.read',
          'inspections.update',
          'assets.read',
          'assets.update',
          'reports.read',
        ];
      case UserRole.technician:
        return [
          'inspections.read',
          'assets.read',
          'assets.update',
          'reports.read',
        ];
      case UserRole.viewer:
        return [
          'inspections.read',
          'assets.read',
          'reports.read',
        ];
    }
  }

  int get priority {
    switch (this) {
      case UserRole.admin:
        return 5;
      case UserRole.manager:
        return 4;
      case UserRole.inspector:
        return 3;
      case UserRole.technician:
        return 2;
      case UserRole.viewer:
        return 1;
    }
  }
}

extension UserExtension on User {
  bool get isActive => status.isActive;
  bool get canLogin => status.canLogin;
  bool get isEmailVerified => emailVerifiedAt != null;
  
  String get displayName => name.isNotEmpty ? name : email;
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    } else if (parts.isNotEmpty) {
      return parts.first.substring(0, 1).toUpperCase();
    } else {
      return email.substring(0, 1).toUpperCase();
    }
  }
  
  List<UserRole> get userRoles {
    return roles
        .map((role) => UserRole.values.firstWhere(
              (r) => r.name == role,
              orElse: () => UserRole.viewer,
            ))
        .toList();
  }
  
  UserRole get primaryRole {
    if (userRoles.isEmpty) return UserRole.viewer;
    
    // Return the role with highest priority
    userRoles.sort((a, b) => b.priority.compareTo(a.priority));
    return userRoles.first;
  }
  
  List<String> get allPermissions {
    final permissions = <String>{};
    for (final role in userRoles) {
      permissions.addAll(role.permissions);
    }
    return permissions.toList();
  }
  
  bool hasPermission(String permission) {
    return allPermissions.contains(permission);
  }
  
  bool hasRole(String roleName) {
    return roles.contains(roleName);
  }
  
  bool hasAnyRole(List<String> roleNames) {
    return roleNames.any((role) => roles.contains(role));
  }
  
  bool hasAllRoles(List<String> roleNames) {
    return roleNames.every((role) => roles.contains(role));
  }
  
  bool get isAdmin => hasRole('admin');
  bool get isManager => hasRole('manager') || isAdmin;
  bool get isInspector => hasRole('inspector') || isManager;
  bool get isTechnician => hasRole('technician') || isInspector;
  
  String get roleDisplayText {
    if (userRoles.length == 1) {
      return userRoles.first.displayName;
    } else if (userRoles.length > 1) {
      return '${primaryRole.displayName} (+${userRoles.length - 1})';
    } else {
      return 'No Role';
    }
  }
  
  Duration? get timeSinceLastLogin {
    if (lastLoginAt == null) return null;
    return DateTime.now().difference(lastLoginAt!);
  }
  
  bool get isNewUser {
    final accountAge = DateTime.now().difference(createdAt);
    return accountAge.inDays < 7;
  }
  
  Map<String, dynamic> toDisplayMap() {
    return {
      'id': id,
      'name': displayName,
      'email': email,
      'role': roleDisplayText,
      'status': status.displayName,
      'organization': organization ?? 'N/A',
      'lastLogin': lastLoginAt?.toIso8601String(),
      'verified': isEmailVerified,
    };
  }
}

@freezed
class UserSession with _$UserSession {
  const factory UserSession({
    required String id,
    required String userId,
    required String deviceId,
    required String deviceName,
    required String ipAddress,
    required String userAgent,
    required DateTime createdAt,
    required DateTime lastActiveAt,
    DateTime? expiresAt,
    @Default(false) bool isActive,
  }) = _UserSession;

  factory UserSession.fromJson(Map<String, dynamic> json) => _$UserSessionFromJson(json);
}

extension UserSessionExtension on UserSession {
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
  
  bool get isValid => isActive && !isExpired;
  
  Duration get timeSinceLastActive {
    return DateTime.now().difference(lastActiveAt);
  }
  
  String get deviceDisplayName {
    if (deviceName.isNotEmpty) return deviceName;
    
    // Try to extract device info from user agent
    if (userAgent.contains('Windows')) return 'Windows Device';
    if (userAgent.contains('Android')) return 'Android Device';
    if (userAgent.contains('iPhone')) return 'iPhone';
    if (userAgent.contains('iPad')) return 'iPad';
    if (userAgent.contains('Mac')) return 'Mac';
    
    return 'Unknown Device';
  }
}

@freezed
class UserActivity with _$UserActivity {
  const factory UserActivity({
    required String id,
    required String userId,
    required String action,
    required String resource,
    String? resourceId,
    Map<String, dynamic>? metadata,
    String? ipAddress,
    String? userAgent,
    required DateTime createdAt,
  }) = _UserActivity;

  factory UserActivity.fromJson(Map<String, dynamic> json) => _$UserActivityFromJson(json);
}

extension UserActivityExtension on UserActivity {
  String get displayText {
    switch (action.toLowerCase()) {
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      case 'create':
        return 'Created $resource';
      case 'update':
        return 'Updated $resource';
      case 'delete':
        return 'Deleted $resource';
      case 'view':
        return 'Viewed $resource';
      case 'export':
        return 'Exported $resource';
      default:
        return '$action $resource';
    }
  }
  
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
}