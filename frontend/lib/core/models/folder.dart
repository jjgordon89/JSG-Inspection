import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'sync_status.dart';

part 'folder.freezed.dart';
part 'folder.g.dart';

@freezed
@HiveType(typeId: 22)
class Folder with _$Folder {
  const factory Folder({
    @HiveField(0) required String id,
    @HiveField(1) required String name,
    @HiveField(2) String? description,
    @HiveField(3) String? parentId,
    @HiveField(4) required FolderType type,
    @HiveField(5) String? color,
    @HiveField(6) String? icon,
    @HiveField(7) @Default([]) List<String> tags,
    @HiveField(8) String? createdBy,
    @HiveField(9) required DateTime createdAt,
    @HiveField(10) required DateTime updatedAt,
    @HiveField(11) @Default(SyncStatus.pending) SyncStatus syncStatus,
    @HiveField(12) @Default({}) Map<String, dynamic> metadata,
    @HiveField(13) @Default(0) int inspectionCount,
    @HiveField(14) @Default(0) int assetCount,
    @HiveField(15) DateTime? lastActivityAt,
  }) = _Folder;

  factory Folder.fromJson(Map<String, dynamic> json) => _$FolderFromJson(json);
}

@HiveType(typeId: 23)
enum FolderType {
  @HiveField(0)
  project,
  @HiveField(1)
  category,
  @HiveField(2)
  location,
  @HiveField(3)
  department,
  @HiveField(4)
  custom,
}

extension FolderTypeExtension on FolderType {
  String get displayName {
    switch (this) {
      case FolderType.project:
        return 'Project';
      case FolderType.category:
        return 'Category';
      case FolderType.location:
        return 'Location';
      case FolderType.department:
        return 'Department';
      case FolderType.custom:
        return 'Custom';
    }
  }

  String get description {
    switch (this) {
      case FolderType.project:
        return 'Organize inspections by project or campaign';
      case FolderType.category:
        return 'Group by inspection category or type';
      case FolderType.location:
        return 'Organize by physical location or site';
      case FolderType.department:
        return 'Group by organizational department';
      case FolderType.custom:
        return 'Custom organization structure';
    }
  }

  bool get supportsHierarchy {
    return this == FolderType.project || 
           this == FolderType.location ||
           this == FolderType.department ||
           this == FolderType.custom;
  }
}

// Helper class for folder tree operations
class FolderTree {
  final Folder folder;
  final List<FolderTree> children;
  final int depth;

  const FolderTree({
    required this.folder,
    this.children = const [],
    this.depth = 0,
  });

  bool get hasChildren => children.isNotEmpty;
  bool get isRoot => folder.parentId == null;
  
  int get totalInspections {
    return folder.inspectionCount + 
           children.fold(0, (sum, child) => sum + child.totalInspections);
  }

  int get totalAssets {
    return folder.assetCount + 
           children.fold(0, (sum, child) => sum + child.totalAssets);
  }

  List<Folder> get allFolders {
    final List<Folder> result = [folder];
    for (final child in children) {
      result.addAll(child.allFolders);
    }
    return result;
  }

  FolderTree? findById(String id) {
    if (folder.id == id) return this;
    
    for (final child in children) {
      final found = child.findById(id);
      if (found != null) return found;
    }
    
    return null;
  }

  List<FolderTree> findByType(FolderType type) {
    final List<FolderTree> result = [];
    
    if (folder.type == type) {
      result.add(this);
    }
    
    for (final child in children) {
      result.addAll(child.findByType(type));
    }
    
    return result;
  }

  FolderTree copyWith({
    Folder? folder,
    List<FolderTree>? children,
    int? depth,
  }) {
    return FolderTree(
      folder: folder ?? this.folder,
      children: children ?? this.children,
      depth: depth ?? this.depth,
    );
  }
}

// Utility functions for folder operations
class FolderUtils {
  static List<FolderTree> buildTree(List<Folder> folders) {
    final Map<String, FolderTree> nodeMap = {};
    final List<FolderTree> roots = [];

    // Create nodes for all folders
    for (final folder in folders) {
      nodeMap[folder.id] = FolderTree(folder: folder);
    }

    // Build the tree structure
    for (final folder in folders) {
      final node = nodeMap[folder.id]!;
      
      if (folder.parentId == null) {
        roots.add(node);
      } else {
        final parent = nodeMap[folder.parentId];
        if (parent != null) {
          final updatedChildren = List<FolderTree>.from(parent.children)..add(node);
          nodeMap[folder.parentId!] = parent.copyWith(
            children: updatedChildren,
            depth: parent.depth,
          );
        } else {
          // Parent not found, treat as root
          roots.add(node);
        }
      }
    }

    return _assignDepths(roots, 0);
  }

  static List<FolderTree> _assignDepths(List<FolderTree> nodes, int depth) {
    return nodes.map((node) {
      final updatedChildren = _assignDepths(node.children, depth + 1);
      return node.copyWith(
        depth: depth,
        children: updatedChildren,
      );
    }).toList();
  }

  static List<Folder> flattenTree(List<FolderTree> tree) {
    final List<Folder> result = [];
    
    for (final node in tree) {
      result.addAll(node.allFolders);
    }
    
    return result;
  }

  static List<Folder> getPath(List<Folder> allFolders, String folderId) {
    final Map<String, Folder> folderMap = {
      for (final folder in allFolders) folder.id: folder
    };
    
    final List<Folder> path = [];
    String? currentId = folderId;
    
    while (currentId != null) {
      final folder = folderMap[currentId];
      if (folder == null) break;
      
      path.insert(0, folder);
      currentId = folder.parentId;
    }
    
    return path;
  }

  static bool isAncestor(List<Folder> allFolders, String ancestorId, String descendantId) {
    final path = getPath(allFolders, descendantId);
    return path.any((folder) => folder.id == ancestorId);
  }

  static List<Folder> getDescendants(List<FolderTree> tree, String folderId) {
    for (final node in tree) {
      final found = node.findById(folderId);
      if (found != null) {
        return found.allFolders.skip(1).toList(); // Skip the folder itself
      }
    }
    return [];
  }
}