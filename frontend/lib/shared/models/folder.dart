import 'package:freezed_annotation/freezed_annotation.dart';

part 'folder.freezed.dart';
part 'folder.g.dart';

@freezed
class Folder with _$Folder {
  const factory Folder({
    required String id,
    required String name,
    String? description,
    String? parentId,
    required FolderType type,
    required FolderStatus status,
    String? color,
    String? icon,
    @Default([]) List<String> tags,
    FolderSettings? settings,
    FolderPermissions? permissions,
    FolderStatistics? statistics,
    String? createdById,
    String? lastModifiedById,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? archivedAt,
    Map<String, dynamic>? metadata,
  }) = _Folder;

  factory Folder.fromJson(Map<String, dynamic> json) => _$FolderFromJson(json);
}

@freezed
class FolderSettings with _$FolderSettings {
  const factory FolderSettings({
    @Default(true) bool allowSubfolders,
    @Default(true) bool allowAssets,
    @Default(true) bool allowInspections,
    @Default(false) bool requireApproval,
    @Default(false) bool autoArchive,
    int? autoArchiveDays,
    @Default(false) bool inheritPermissions,
    @Default(true) bool allowOfflineSync,
    List<String>? allowedFormTemplates,
    List<String>? allowedAssetTypes,
    Map<String, dynamic>? customSettings,
  }) = _FolderSettings;

  factory FolderSettings.fromJson(Map<String, dynamic> json) => _$FolderSettingsFromJson(json);
}

@freezed
class FolderPermissions with _$FolderPermissions {
  const factory FolderPermissions({
    @Default([]) List<FolderUserPermission> userPermissions,
    @Default([]) List<FolderRolePermission> rolePermissions,
    @Default(false) bool isPublic,
    @Default(false) bool allowGuestAccess,
    FolderPermissionLevel? defaultPermission,
  }) = _FolderPermissions;

  factory FolderPermissions.fromJson(Map<String, dynamic> json) => _$FolderPermissionsFromJson(json);
}

@freezed
class FolderUserPermission with _$FolderUserPermission {
  const factory FolderUserPermission({
    required String userId,
    required FolderPermissionLevel permission,
    DateTime? grantedAt,
    String? grantedById,
    DateTime? expiresAt,
  }) = _FolderUserPermission;

  factory FolderUserPermission.fromJson(Map<String, dynamic> json) => _$FolderUserPermissionFromJson(json);
}

@freezed
class FolderRolePermission with _$FolderRolePermission {
  const factory FolderRolePermission({
    required String roleId,
    required FolderPermissionLevel permission,
    DateTime? grantedAt,
    String? grantedById,
  }) = _FolderRolePermission;

  factory FolderRolePermission.fromJson(Map<String, dynamic> json) => _$FolderRolePermissionFromJson(json);
}

@freezed
class FolderStatistics with _$FolderStatistics {
  const factory FolderStatistics({
    @Default(0) int totalAssets,
    @Default(0) int totalInspections,
    @Default(0) int totalSubfolders,
    @Default(0) int pendingInspections,
    @Default(0) int completedInspections,
    @Default(0) int overdueInspections,
    @Default(0) int criticalIssues,
    @Default(0) int activeAssets,
    @Default(0) int inactiveAssets,
    @Default(0.0) double averageScore,
    DateTime? lastInspectionDate,
    DateTime? lastActivityDate,
    Map<String, int>? inspectionsByStatus,
    Map<String, int>? assetsByStatus,
    Map<String, int>? inspectionsByPriority,
  }) = _FolderStatistics;

  factory FolderStatistics.fromJson(Map<String, dynamic> json) => _$FolderStatisticsFromJson(json);
}

@freezed
class FolderTreeNode with _$FolderTreeNode {
  const factory FolderTreeNode({
    required Folder folder,
    @Default([]) List<FolderTreeNode> children,
    @Default(0) int depth,
    @Default(false) bool isExpanded,
    @Default(false) bool isSelected,
    @Default(false) bool isLoading,
  }) = _FolderTreeNode;

  factory FolderTreeNode.fromJson(Map<String, dynamic> json) => _$FolderTreeNodeFromJson(json);
}

@freezed
class FolderBreadcrumb with _$FolderBreadcrumb {
  const factory FolderBreadcrumb({
    required String id,
    required String name,
    required FolderType type,
    String? icon,
    String? color,
  }) = _FolderBreadcrumb;

  factory FolderBreadcrumb.fromJson(Map<String, dynamic> json) => _$FolderBreadcrumbFromJson(json);
}

enum FolderType {
  @JsonValue('root')
  root,
  @JsonValue('project')
  project,
  @JsonValue('site')
  site,
  @JsonValue('building')
  building,
  @JsonValue('floor')
  floor,
  @JsonValue('room')
  room,
  @JsonValue('area')
  area,
  @JsonValue('system')
  system,
  @JsonValue('category')
  category,
  @JsonValue('custom')
  custom,
}

enum FolderStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('archived')
  archived,
  @JsonValue('deleted')
  deleted,
}

enum FolderPermissionLevel {
  @JsonValue('none')
  none,
  @JsonValue('view')
  view,
  @JsonValue('edit')
  edit,
  @JsonValue('admin')
  admin,
  @JsonValue('owner')
  owner,
}

extension FolderTypeExtension on FolderType {
  String get displayName {
    switch (this) {
      case FolderType.root:
        return 'Root';
      case FolderType.project:
        return 'Project';
      case FolderType.site:
        return 'Site';
      case FolderType.building:
        return 'Building';
      case FolderType.floor:
        return 'Floor';
      case FolderType.room:
        return 'Room';
      case FolderType.area:
        return 'Area';
      case FolderType.system:
        return 'System';
      case FolderType.category:
        return 'Category';
      case FolderType.custom:
        return 'Custom';
    }
  }

  String get description {
    switch (this) {
      case FolderType.root:
        return 'Top-level organizational folder';
      case FolderType.project:
        return 'Project or contract folder';
      case FolderType.site:
        return 'Physical site or location';
      case FolderType.building:
        return 'Building or structure';
      case FolderType.floor:
        return 'Floor or level within a building';
      case FolderType.room:
        return 'Room or specific space';
      case FolderType.area:
        return 'Designated area or zone';
      case FolderType.system:
        return 'System or equipment group';
      case FolderType.category:
        return 'Category or classification';
      case FolderType.custom:
        return 'Custom folder type';
    }
  }

  String get defaultIcon {
    switch (this) {
      case FolderType.root:
        return 'folder_special';
      case FolderType.project:
        return 'work';
      case FolderType.site:
        return 'location_city';
      case FolderType.building:
        return 'business';
      case FolderType.floor:
        return 'layers';
      case FolderType.room:
        return 'meeting_room';
      case FolderType.area:
        return 'place';
      case FolderType.system:
        return 'settings';
      case FolderType.category:
        return 'category';
      case FolderType.custom:
        return 'folder';
    }
  }

  String get defaultColor {
    switch (this) {
      case FolderType.root:
        return '#2196F3'; // Blue
      case FolderType.project:
        return '#4CAF50'; // Green
      case FolderType.site:
        return '#FF9800'; // Orange
      case FolderType.building:
        return '#9C27B0'; // Purple
      case FolderType.floor:
        return '#607D8B'; // Blue Grey
      case FolderType.room:
        return '#795548'; // Brown
      case FolderType.area:
        return '#009688'; // Teal
      case FolderType.system:
        return '#F44336'; // Red
      case FolderType.category:
        return '#3F51B5'; // Indigo
      case FolderType.custom:
        return '#757575'; // Grey
    }
  }

  bool get canHaveSubfolders {
    switch (this) {
      case FolderType.root:
      case FolderType.project:
      case FolderType.site:
      case FolderType.building:
      case FolderType.floor:
      case FolderType.area:
      case FolderType.system:
      case FolderType.category:
      case FolderType.custom:
        return true;
      case FolderType.room:
        return false; // Rooms typically don't have subfolders
    }
  }

  bool get canHaveAssets {
    return true; // All folder types can contain assets
  }

  bool get canHaveInspections {
    return true; // All folder types can contain inspections
  }

  List<FolderType> get allowedChildTypes {
    switch (this) {
      case FolderType.root:
        return [FolderType.project, FolderType.site, FolderType.category];
      case FolderType.project:
        return [FolderType.site, FolderType.building, FolderType.system, FolderType.category];
      case FolderType.site:
        return [FolderType.building, FolderType.area, FolderType.system];
      case FolderType.building:
        return [FolderType.floor, FolderType.area, FolderType.system];
      case FolderType.floor:
        return [FolderType.room, FolderType.area];
      case FolderType.room:
        return []; // Rooms typically don't have children
      case FolderType.area:
        return [FolderType.area, FolderType.system];
      case FolderType.system:
        return [FolderType.system, FolderType.category];
      case FolderType.category:
        return [FolderType.category];
      case FolderType.custom:
        return FolderType.values; // Custom can have any child type
    }
  }

  int get hierarchyLevel {
    switch (this) {
      case FolderType.root:
        return 0;
      case FolderType.project:
        return 1;
      case FolderType.site:
        return 2;
      case FolderType.building:
        return 3;
      case FolderType.floor:
        return 4;
      case FolderType.room:
        return 5;
      case FolderType.area:
        return 3; // Can be at various levels
      case FolderType.system:
        return 3; // Can be at various levels
      case FolderType.category:
        return 1; // Can be at various levels
      case FolderType.custom:
        return 99; // No specific level
    }
  }
}

extension FolderStatusExtension on FolderStatus {
  String get displayName {
    switch (this) {
      case FolderStatus.active:
        return 'Active';
      case FolderStatus.inactive:
        return 'Inactive';
      case FolderStatus.archived:
        return 'Archived';
      case FolderStatus.deleted:
        return 'Deleted';
    }
  }

  String get description {
    switch (this) {
      case FolderStatus.active:
        return 'Folder is active and available for use';
      case FolderStatus.inactive:
        return 'Folder is temporarily inactive';
      case FolderStatus.archived:
        return 'Folder has been archived';
      case FolderStatus.deleted:
        return 'Folder has been deleted';
    }
  }

  String get color {
    switch (this) {
      case FolderStatus.active:
        return '#4CAF50'; // Green
      case FolderStatus.inactive:
        return '#FF9800'; // Orange
      case FolderStatus.archived:
        return '#607D8B'; // Blue Grey
      case FolderStatus.deleted:
        return '#F44336'; // Red
    }
  }

  bool get isVisible {
    return this != FolderStatus.deleted;
  }

  bool get canEdit {
    return this == FolderStatus.active;
  }

  bool get canAddContent {
    return this == FolderStatus.active;
  }

  bool get canArchive {
    return this == FolderStatus.active || this == FolderStatus.inactive;
  }

  bool get canRestore {
    return this == FolderStatus.archived;
  }

  bool get canDelete {
    return this != FolderStatus.deleted;
  }
}

extension FolderPermissionLevelExtension on FolderPermissionLevel {
  String get displayName {
    switch (this) {
      case FolderPermissionLevel.none:
        return 'No Access';
      case FolderPermissionLevel.view:
        return 'View Only';
      case FolderPermissionLevel.edit:
        return 'Edit';
      case FolderPermissionLevel.admin:
        return 'Admin';
      case FolderPermissionLevel.owner:
        return 'Owner';
    }
  }

  String get description {
    switch (this) {
      case FolderPermissionLevel.none:
        return 'No access to the folder';
      case FolderPermissionLevel.view:
        return 'Can view folder contents';
      case FolderPermissionLevel.edit:
        return 'Can view and edit folder contents';
      case FolderPermissionLevel.admin:
        return 'Can manage folder and permissions';
      case FolderPermissionLevel.owner:
        return 'Full control over folder';
    }
  }

  int get level {
    switch (this) {
      case FolderPermissionLevel.none:
        return 0;
      case FolderPermissionLevel.view:
        return 1;
      case FolderPermissionLevel.edit:
        return 2;
      case FolderPermissionLevel.admin:
        return 3;
      case FolderPermissionLevel.owner:
        return 4;
    }
  }

  bool get canView => level >= 1;
  bool get canEdit => level >= 2;
  bool get canAdmin => level >= 3;
  bool get canOwn => level >= 4;

  bool get canCreateSubfolders => canEdit;
  bool get canAddAssets => canEdit;
  bool get canCreateInspections => canEdit;
  bool get canManagePermissions => canAdmin;
  bool get canDeleteFolder => canOwn;
  bool get canArchiveFolder => canAdmin;

  bool hasPermission(FolderPermissionLevel required) {
    return level >= required.level;
  }
}

extension FolderExtension on Folder {
  bool get isRoot => parentId == null;
  bool get hasParent => parentId != null;
  bool get hasChildren => statistics?.totalSubfolders != null && statistics!.totalSubfolders > 0;
  
  bool get isActive => status == FolderStatus.active;
  bool get isInactive => status == FolderStatus.inactive;
  bool get isArchived => status == FolderStatus.archived;
  bool get isDeleted => status == FolderStatus.deleted;
  
  bool get isVisible => status.isVisible;
  bool get canEdit => status.canEdit;
  bool get canAddContent => status.canAddContent;
  
  String get displayIcon => icon ?? type.defaultIcon;
  String get displayColor => color ?? type.defaultColor;
  
  String get typeDisplayName => type.displayName;
  String get statusDisplayName => status.displayName;
  
  bool get allowsSubfolders => settings?.allowSubfolders == true && type.canHaveSubfolders;
  bool get allowsAssets => settings?.allowAssets == true && type.canHaveAssets;
  bool get allowsInspections => settings?.allowInspections == true && type.canHaveInspections;
  
  bool get requiresApproval => settings?.requireApproval == true;
  bool get autoArchives => settings?.autoArchive == true;
  bool get inheritsPermissions => settings?.inheritPermissions == true;
  bool get allowsOfflineSync => settings?.allowOfflineSync == true;
  
  Duration? get autoArchiveDuration {
    if (settings?.autoArchiveDays == null) return null;
    return Duration(days: settings!.autoArchiveDays!);
  }
  
  bool get hasAutoArchive => autoArchiveDuration != null;
  
  List<String> get allowedFormTemplates => settings?.allowedFormTemplates ?? [];
  List<String> get allowedAssetTypes => settings?.allowedAssetTypes ?? [];
  
  bool get hasFormTemplateRestrictions => allowedFormTemplates.isNotEmpty;
  bool get hasAssetTypeRestrictions => allowedAssetTypes.isNotEmpty;
  
  bool canUseFormTemplate(String templateId) {
    if (!hasFormTemplateRestrictions) return true;
    return allowedFormTemplates.contains(templateId);
  }
  
  bool canAddAssetType(String assetType) {
    if (!hasAssetTypeRestrictions) return true;
    return allowedAssetTypes.contains(assetType);
  }
  
  // Statistics helpers
  int get totalAssets => statistics?.totalAssets ?? 0;
  int get totalInspections => statistics?.totalInspections ?? 0;
  int get totalSubfolders => statistics?.totalSubfolders ?? 0;
  int get pendingInspections => statistics?.pendingInspections ?? 0;
  int get completedInspections => statistics?.completedInspections ?? 0;
  int get overdueInspections => statistics?.overdueInspections ?? 0;
  int get criticalIssues => statistics?.criticalIssues ?? 0;
  int get activeAssets => statistics?.activeAssets ?? 0;
  int get inactiveAssets => statistics?.inactiveAssets ?? 0;
  double get averageScore => statistics?.averageScore ?? 0.0;
  
  DateTime? get lastInspectionDate => statistics?.lastInspectionDate;
  DateTime? get lastActivityDate => statistics?.lastActivityDate;
  
  bool get hasActivity => lastActivityDate != null;
  bool get hasInspections => totalInspections > 0;
  bool get hasAssets => totalAssets > 0;
  bool get hasSubfolders => totalSubfolders > 0;
  
  bool get hasPendingInspections => pendingInspections > 0;
  bool get hasOverdueInspections => overdueInspections > 0;
  bool get hasCriticalIssues => criticalIssues > 0;
  
  double get inspectionCompletionRate {
    if (totalInspections == 0) return 0.0;
    return (completedInspections / totalInspections) * 100;
  }
  
  double get assetActiveRate {
    if (totalAssets == 0) return 0.0;
    return (activeAssets / totalAssets) * 100;
  }
  
  // Permission helpers
  bool get isPublic => permissions?.isPublic == true;
  bool get allowsGuestAccess => permissions?.allowGuestAccess == true;
  
  FolderPermissionLevel? get defaultPermission => permissions?.defaultPermission;
  
  List<FolderUserPermission> get userPermissions => permissions?.userPermissions ?? [];
  List<FolderRolePermission> get rolePermissions => permissions?.rolePermissions ?? [];
  
  bool hasUserPermission(String userId) {
    return userPermissions.any((p) => p.userId == userId);
  }
  
  FolderPermissionLevel? getUserPermissionLevel(String userId) {
    final permission = userPermissions.where((p) => p.userId == userId).firstOrNull;
    return permission?.permission;
  }
  
  bool hasRolePermission(String roleId) {
    return rolePermissions.any((p) => p.roleId == roleId);
  }
  
  FolderPermissionLevel? getRolePermissionLevel(String roleId) {
    final permission = rolePermissions.where((p) => p.roleId == roleId).firstOrNull;
    return permission?.permission;
  }
  
  // Utility methods
  String get fullPath {
    // This would typically be computed by traversing up the parent hierarchy
    return name; // Simplified for now
  }
  
  String get breadcrumbPath {
    // This would typically be computed by traversing up the parent hierarchy
    return name; // Simplified for now
  }
  
  Map<String, dynamic> toSummaryMap() {
    return {
      'id': id,
      'name': name,
      'type': typeDisplayName,
      'status': statusDisplayName,
      'parentId': parentId,
      'totalAssets': totalAssets,
      'totalInspections': totalInspections,
      'totalSubfolders': totalSubfolders,
      'pendingInspections': pendingInspections,
      'completedInspections': completedInspections,
      'overdueInspections': overdueInspections,
      'criticalIssues': criticalIssues,
      'averageScore': averageScore,
      'inspectionCompletionRate': inspectionCompletionRate,
      'assetActiveRate': assetActiveRate,
      'lastInspectionDate': lastInspectionDate?.toIso8601String(),
      'lastActivityDate': lastActivityDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

extension FolderTreeNodeExtension on FolderTreeNode {
  bool get hasChildren => children.isNotEmpty;
  bool get canExpand => hasChildren && !isExpanded;
  bool get canCollapse => hasChildren && isExpanded;
  
  String get displayName => folder.name;
  String get displayIcon => folder.displayIcon;
  String get displayColor => folder.displayColor;
  
  FolderType get type => folder.type;
  FolderStatus get status => folder.status;
  
  bool get isVisible => folder.isVisible;
  bool get canEdit => folder.canEdit;
  
  int get totalDescendants {
    int count = children.length;
    for (final child in children) {
      count += child.totalDescendants;
    }
    return count;
  }
  
  List<FolderTreeNode> get allDescendants {
    List<FolderTreeNode> descendants = [];
    for (final child in children) {
      descendants.add(child);
      descendants.addAll(child.allDescendants);
    }
    return descendants;
  }
  
  List<Folder> get allDescendantFolders {
    return allDescendants.map((node) => node.folder).toList();
  }
  
  FolderTreeNode? findChild(String folderId) {
    for (final child in children) {
      if (child.folder.id == folderId) return child;
      final found = child.findChild(folderId);
      if (found != null) return found;
    }
    return null;
  }
  
  List<FolderTreeNode> findChildren(bool Function(Folder) predicate) {
    List<FolderTreeNode> found = [];
    for (final child in children) {
      if (predicate(child.folder)) found.add(child);
      found.addAll(child.findChildren(predicate));
    }
    return found;
  }
  
  FolderTreeNode copyWithExpanded(bool expanded) {
    return copyWith(isExpanded: expanded);
  }
  
  FolderTreeNode copyWithSelected(bool selected) {
    return copyWith(isSelected: selected);
  }
  
  FolderTreeNode copyWithLoading(bool loading) {
    return copyWith(isLoading: loading);
  }
}

extension FolderBreadcrumbExtension on FolderBreadcrumb {
  String get displayIcon => icon ?? type.defaultIcon;
  String get displayColor => color ?? type.defaultColor;
  String get typeDisplayName => type.displayName;
}

// Helper class for folder operations
class FolderHelper {
  static List<FolderBreadcrumb> buildBreadcrumbs(List<Folder> folderPath) {
    return folderPath.map((folder) => FolderBreadcrumb(
      id: folder.id,
      name: folder.name,
      type: folder.type,
      icon: folder.icon,
      color: folder.color,
    )).toList();
  }
  
  static FolderTreeNode buildTree(List<Folder> folders, {String? rootId}) {
    final Map<String, List<Folder>> childrenMap = {};
    final Map<String, Folder> folderMap = {};
    
    // Build maps
    for (final folder in folders) {
      folderMap[folder.id] = folder;
      final parentId = folder.parentId ?? 'root';
      childrenMap[parentId] = (childrenMap[parentId] ?? [])..add(folder);
    }
    
    FolderTreeNode buildNode(Folder folder, int depth) {
      final children = childrenMap[folder.id] ?? [];
      return FolderTreeNode(
        folder: folder,
        children: children.map((child) => buildNode(child, depth + 1)).toList(),
        depth: depth,
      );
    }
    
    // Find root folder or create virtual root
    if (rootId != null && folderMap.containsKey(rootId)) {
      return buildNode(folderMap[rootId]!, 0);
    }
    
    // Create virtual root for orphaned folders
    final rootFolders = childrenMap['root'] ?? [];
    final virtualRoot = Folder(
      id: 'root',
      name: 'Root',
      type: FolderType.root,
      status: FolderStatus.active,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    
    return FolderTreeNode(
      folder: virtualRoot,
      children: rootFolders.map((folder) => buildNode(folder, 1)).toList(),
      depth: 0,
    );
  }
  
  static List<Folder> flattenTree(FolderTreeNode root) {
    List<Folder> folders = [];
    
    void traverse(FolderTreeNode node) {
      if (node.folder.id != 'root') {
        folders.add(node.folder);
      }
      for (final child in node.children) {
        traverse(child);
      }
    }
    
    traverse(root);
    return folders;
  }
  
  static List<Folder> getPath(List<Folder> allFolders, String folderId) {
    final Map<String, Folder> folderMap = {
      for (final folder in allFolders) folder.id: folder
    };
    
    List<Folder> path = [];
    String? currentId = folderId;
    
    while (currentId != null && folderMap.containsKey(currentId)) {
      final folder = folderMap[currentId]!;
      path.insert(0, folder);
      currentId = folder.parentId;
    }
    
    return path;
  }
  
  static bool canMoveTo(Folder source, Folder target) {
    // Can't move to itself
    if (source.id == target.id) return false;
    
    // Can't move to a descendant
    // This would require checking the full hierarchy
    
    // Check if target allows subfolders
    if (!target.allowsSubfolders) return false;
    
    // Check if source type is allowed as child of target type
    if (!target.type.allowedChildTypes.contains(source.type)) return false;
    
    return true;
  }
  
  static List<Folder> filterByPermission(
    List<Folder> folders,
    String userId,
    List<String> userRoles,
    FolderPermissionLevel requiredLevel,
  ) {
    return folders.where((folder) {
      // Check user permission
      final userPermission = folder.getUserPermissionLevel(userId);
      if (userPermission != null && userPermission.hasPermission(requiredLevel)) {
        return true;
      }
      
      // Check role permissions
      for (final roleId in userRoles) {
        final rolePermission = folder.getRolePermissionLevel(roleId);
        if (rolePermission != null && rolePermission.hasPermission(requiredLevel)) {
          return true;
        }
      }
      
      // Check default permission
      final defaultPermission = folder.defaultPermission;
      if (defaultPermission != null && defaultPermission.hasPermission(requiredLevel)) {
        return true;
      }
      
      // Check if public
      if (folder.isPublic && requiredLevel == FolderPermissionLevel.view) {
        return true;
      }
      
      return false;
    }).toList();
  }
}