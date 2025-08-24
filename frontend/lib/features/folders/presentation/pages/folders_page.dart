import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/models/folder.dart';

/// Page displaying folder hierarchy and management
class FoldersPage extends HookConsumerWidget {
  const FoldersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedType = useState<FolderType?>(null);
    final isLoading = useState(false);
    final expandedFolders = useState<Set<String>>({});
    
    // Mock data - replace with actual provider
    final folders = useState<List<Folder>>(_getMockFolders());
    final filteredFolders = useMemoized(() {
      var filtered = folders.value;
      
      // Apply type filter
      if (selectedType.value != null) {
        filtered = filtered.where((f) => f.type == selectedType.value).toList();
      }
      
      // Apply search filter
      final searchTerm = searchController.text.toLowerCase();
      if (searchTerm.isNotEmpty) {
        filtered = filtered.where((f) => 
          f.name.toLowerCase().contains(searchTerm) ||
          f.description?.toLowerCase().contains(searchTerm) == true
        ).toList();
      }
      
      return filtered;
    }, [folders.value, selectedType.value, searchController.text]);

    return ResponsiveScaffold(
      title: 'Folders',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateFolderDialog(context),
        icon: const Icon(Icons.create_new_folder),
        label: const Text('New Folder'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, selectedType),
            Expanded(
              child: _buildFoldersList(context, theme, colorScheme, filteredFolders, expandedFolders),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<FolderType?> selectedType,
  ) {
    final screenType = context.screenType;
    
    return Container(
      padding: EdgeInsets.all(screenType.isMobile ? 16 : 24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (screenType.isDesktop)
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: CustomSearchField(
                    controller: searchController,
                    hintText: 'Search folders...',
                    onChanged: (value) {
                      // Trigger rebuild through controller
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTypeFilter(theme, colorScheme, selectedType),
                ),
                const SizedBox(width: 16),
                CustomButton(
                  text: 'Import',
                  style: ButtonStyle.outline,
                  icon: Icons.upload_file,
                  onPressed: () => _handleImport(context),
                ),
              ],
            )
          else
            Column(
              children: [
                CustomSearchField(
                  controller: searchController,
                  hintText: 'Search folders...',
                  onChanged: (value) {
                    // Trigger rebuild through controller
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildTypeFilter(theme, colorScheme, selectedType),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: CustomButton(
                        text: 'Import',
                        style: ButtonStyle.outline,
                        icon: Icons.upload_file,
                        onPressed: () => _handleImport(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          const SizedBox(height: 16),
          _buildStatsRow(theme, colorScheme),
        ],
      ),
    );
  }

  Widget _buildTypeFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<FolderType?> selectedType,
  ) {
    return DropdownButtonFormField<FolderType?>(
      value: selectedType.value,
      decoration: InputDecoration(
        labelText: 'Type',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<FolderType?>(
          value: null,
          child: Text('All Types'),
        ),
        ...FolderType.values.map((type) => DropdownMenuItem(
          value: type,
          child: Text(_getTypeDisplayName(type)),
        )),
      ],
      onChanged: (value) {
        selectedType.value = value;
      },
    );
  }

  Widget _buildStatsRow(ThemeData theme, ColorScheme colorScheme) {
    return Row(
      children: [
        _buildStatChip(theme, colorScheme, 'Total', '24', colorScheme.primary),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Projects', '8', Colors.blue),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Workflows', '12', Colors.green),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Templates', '4', Colors.orange),
      ],
    );
  }

  Widget _buildStatChip(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              value,
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFoldersList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Folder> folders,
    ValueNotifier<Set<String>> expandedFolders,
  ) {
    if (folders.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }

    final screenType = context.screenType;
    
    if (screenType.isDesktop) {
      return _buildDesktopView(context, theme, colorScheme, folders, expandedFolders);
    } else {
      return _buildMobileView(context, theme, colorScheme, folders, expandedFolders);
    }
  }

  Widget _buildDesktopView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Folder> folders,
    ValueNotifier<Set<String>> expandedFolders,
  ) {
    return Row(
      children: [
        // Folder tree on the left
        Expanded(
          flex: 1,
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                right: BorderSide(
                  color: colorScheme.outline.withOpacity(0.2),
                  width: 1,
                ),
              ),
            ),
            child: _buildFolderTree(context, theme, colorScheme, folders, expandedFolders),
          ),
        ),
        // Folder details on the right
        Expanded(
          flex: 2,
          child: _buildFolderDetails(context, theme, colorScheme),
        ),
      ],
    );
  }

  Widget _buildMobileView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Folder> folders,
    ValueNotifier<Set<String>> expandedFolders,
  ) {
    return _buildFolderTree(context, theme, colorScheme, folders, expandedFolders);
  }

  Widget _buildFolderTree(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Folder> folders,
    ValueNotifier<Set<String>> expandedFolders,
  ) {
    final rootFolders = folders.where((f) => f.parentId == null).toList();
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: rootFolders.length,
      itemBuilder: (context, index) {
        final folder = rootFolders[index];
        return _buildFolderTreeItem(
          context,
          theme,
          colorScheme,
          folder,
          folders,
          expandedFolders,
          0,
        );
      },
    );
  }

  Widget _buildFolderTreeItem(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Folder folder,
    List<Folder> allFolders,
    ValueNotifier<Set<String>> expandedFolders,
    int depth,
  ) {
    final children = allFolders.where((f) => f.parentId == folder.id).toList();
    final hasChildren = children.isNotEmpty;
    final isExpanded = expandedFolders.value.contains(folder.id);
    
    return Column(
      children: [
        Container(
          margin: EdgeInsets.only(left: depth * 20.0),
          child: Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: InkWell(
              onTap: () => _selectFolder(context, folder),
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    if (hasChildren)
                      InkWell(
                        onTap: () => _toggleExpanded(expandedFolders, folder.id),
                        child: Icon(
                          isExpanded ? Icons.expand_more : Icons.chevron_right,
                          size: 20,
                          color: colorScheme.onSurfaceVariant,
                        ),
                      )
                    else
                      const SizedBox(width: 20),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: _getTypeColor(folder.type).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        _getTypeIcon(folder.type),
                        size: 18,
                        color: _getTypeColor(folder.type),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            folder.name,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (folder.description != null) ..[
                            const SizedBox(height: 2),
                            Text(
                              folder.description!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    _buildTypeChip(theme, colorScheme, folder.type),
                    const SizedBox(width: 8),
                    PopupMenuButton<String>(
                      icon: Icon(
                        Icons.more_vert,
                        size: 18,
                        color: colorScheme.onSurfaceVariant,
                      ),
                      onSelected: (value) => _handleFolderAction(context, folder, value),
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit, size: 18),
                              SizedBox(width: 8),
                              Text('Edit'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'duplicate',
                          child: Row(
                            children: [
                              Icon(Icons.copy, size: 18),
                              SizedBox(width: 8),
                              Text('Duplicate'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'export',
                          child: Row(
                            children: [
                              Icon(Icons.download, size: 18),
                              SizedBox(width: 8),
                              Text('Export'),
                            ],
                          ),
                        ),
                        const PopupMenuDivider(),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete, size: 18, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Delete', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (hasChildren && isExpanded)
          ...children.map((child) => _buildFolderTreeItem(
            context,
            theme,
            colorScheme,
            child,
            allFolders,
            expandedFolders,
            depth + 1,
          )),
      ],
    );
  }

  Widget _buildTypeChip(ThemeData theme, ColorScheme colorScheme, FolderType type) {
    final color = _getTypeColor(type);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        _getTypeDisplayName(type),
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildFolderDetails(BuildContext context, ThemeData theme, ColorScheme colorScheme) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Folder Details',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.folder_outlined,
                    size: 64,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Select a folder to view details',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.folder_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No folders found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first folder to organize your work',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Create Folder',
            icon: Icons.create_new_folder,
            onPressed: () => _showCreateFolderDialog(context),
          ),
        ],
      ),
    );
  }

  String _getTypeDisplayName(FolderType type) {
    switch (type) {
      case FolderType.project:
        return 'Project';
      case FolderType.workflow:
        return 'Workflow';
      case FolderType.template:
        return 'Template';
      case FolderType.archive:
        return 'Archive';
    }
  }

  IconData _getTypeIcon(FolderType type) {
    switch (type) {
      case FolderType.project:
        return Icons.work;
      case FolderType.workflow:
        return Icons.account_tree;
      case FolderType.template:
        return Icons.description;
      case FolderType.archive:
        return Icons.archive;
    }
  }

  Color _getTypeColor(FolderType type) {
    switch (type) {
      case FolderType.project:
        return Colors.blue;
      case FolderType.workflow:
        return Colors.green;
      case FolderType.template:
        return Colors.orange;
      case FolderType.archive:
        return Colors.grey;
    }
  }

  void _toggleExpanded(ValueNotifier<Set<String>> expandedFolders, String folderId) {
    final expanded = Set<String>.from(expandedFolders.value);
    if (expanded.contains(folderId)) {
      expanded.remove(folderId);
    } else {
      expanded.add(folderId);
    }
    expandedFolders.value = expanded;
  }

  void _selectFolder(BuildContext context, Folder folder) {
    context.go('${AppRoutes.folders}/${folder.id}');
  }

  void _handleFolderAction(BuildContext context, Folder folder, String action) {
    switch (action) {
      case 'edit':
        _showEditFolderDialog(context, folder);
        break;
      case 'duplicate':
        _duplicateFolder(context, folder);
        break;
      case 'export':
        _exportFolder(context, folder);
        break;
      case 'delete':
        _showDeleteConfirmation(context, folder);
        break;
    }
  }

  void _showCreateFolderDialog(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Create folder dialog will be implemented soon'),
      ),
    );
  }

  void _showEditFolderDialog(BuildContext context, Folder folder) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Edit folder "${folder.name}" will be implemented soon'),
      ),
    );
  }

  void _duplicateFolder(BuildContext context, Folder folder) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Duplicate folder "${folder.name}" will be implemented soon'),
      ),
    );
  }

  void _exportFolder(BuildContext context, Folder folder) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Export folder "${folder.name}" will be implemented soon'),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Folder folder) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Folder'),
        content: Text('Are you sure you want to delete "${folder.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _deleteFolder(context, folder);
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _deleteFolder(BuildContext context, Folder folder) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Delete folder "${folder.name}" will be implemented soon'),
      ),
    );
  }

  void _handleImport(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Import functionality will be implemented soon'),
      ),
    );
  }

  // Mock data - replace with actual data provider
  List<Folder> _getMockFolders() {
    return [
      Folder(
        id: 'F001',
        name: 'Safety Inspections',
        type: FolderType.project,
        description: 'All safety-related inspection workflows',
        parentId: null,
        createdBy: 'user1',
        createdAt: DateTime(2023, 1, 15),
        updatedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Folder(
        id: 'F002',
        name: 'Fire Safety',
        type: FolderType.workflow,
        description: 'Fire extinguisher and emergency exit inspections',
        parentId: 'F001',
        createdBy: 'user1',
        createdAt: DateTime(2023, 1, 20),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      Folder(
        id: 'F003',
        name: 'Equipment Maintenance',
        type: FolderType.project,
        description: 'Regular equipment inspection and maintenance',
        parentId: null,
        createdBy: 'user2',
        createdAt: DateTime(2023, 2, 1),
        updatedAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
      Folder(
        id: 'F004',
        name: 'HVAC Systems',
        type: FolderType.workflow,
        description: 'Heating, ventilation, and air conditioning inspections',
        parentId: 'F003',
        createdBy: 'user2',
        createdAt: DateTime(2023, 2, 5),
        updatedAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Folder(
        id: 'F005',
        name: 'Vehicle Inspections',
        type: FolderType.project,
        description: 'Company vehicle safety and maintenance checks',
        parentId: null,
        createdBy: 'user3',
        createdAt: DateTime(2023, 3, 1),
        updatedAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      Folder(
        id: 'F006',
        name: 'Standard Templates',
        type: FolderType.template,
        description: 'Reusable inspection form templates',
        parentId: null,
        createdBy: 'admin',
        createdAt: DateTime(2023, 1, 1),
        updatedAt: DateTime.now().subtract(const Duration(days: 7)),
      ),
    ];
  }
}