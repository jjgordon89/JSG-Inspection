import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
@HiveType(typeId: 0)
class User with _$User {
  const factory User({
    @HiveField(0) required String id,
    @HiveField(1) required String email,
    @HiveField(2) required String firstName,
    @HiveField(3) required String lastName,
    @HiveField(4) required UserRole role,
    @HiveField(5) String? phone,
    @HiveField(6) String? avatar,
    @HiveField(7) String? department,
    @HiveField(8) String? position,
    @HiveField(9) required bool isActive,
    @HiveField(10) required DateTime createdAt,
    @HiveField(11) required DateTime updatedAt,
    @HiveField(12) DateTime? lastLoginAt,
    @HiveField(13) @Default({}) Map<String, dynamic> preferences,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@HiveType(typeId: 1)
enum UserRole {
  @HiveField(0)
  admin,
  @HiveField(1)
  inspector,
  @HiveField(2)
  manager,
  @HiveField(3)
  viewer,
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Administrator';
      case UserRole.inspector:
        return 'Inspector';
      case UserRole.manager:
        return 'Manager';
      case UserRole.viewer:
        return 'Viewer';
    }
  }

  bool get canCreateInspections {
    return this == UserRole.admin || this == UserRole.inspector || this == UserRole.manager;
  }

  bool get canManageUsers {
    return this == UserRole.admin;
  }

  bool get canManageAssets {
    return this == UserRole.admin || this == UserRole.manager;
  }

  bool get canViewReports {
    return true; // All roles can view reports
  }

  bool get canGenerateReports {
    return this == UserRole.admin || this == UserRole.manager;
  }
}