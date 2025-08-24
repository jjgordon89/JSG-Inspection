import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/constants/app_constants.dart';

/// Page displaying detailed information about a specific folder
class FolderDetailPage extends HookConsumerWidget {
  final String folderId;
  
  const FolderDetailPage({
    super.key,
    required this.folderId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final selectedTab = useState(0);
    final searchController = useTextEditingController();
    
    // Mock folder data
    final folder = useState(_getMockFolder(folderId));
    final assets = useState(_getMockAssets());
    final inspections = useState(_getMockInspections());
    final members = useState(_getMockMembers());
    
    // Filter assets and inspections based on search
    final filteredAssets = useState(assets.value);
    final filteredInspections = useState(inspections.value);
    
    useEffect(() {
      final query = searchController.text.toLowerCase();
      
      filteredAssets.value = assets.value.where((asset) {
        return asset['name'].toLowerCase().contains(query) ||
            asset['location'].toLowerCase().contains(query);
      }).toList();
      
      filteredInspections.value = inspections.value.where((inspection) {
        return inspection['assetName'].toLowerCase().contains(query) ||
            inspection['inspector'].toLowerCase().contains(query);
      }).toList();
      
      return null;
    }, [searchController.text]);

    if (folder.value == null) {
      return ResponsiveScaffold(
        title: 'Folder Not Found',
        body: const Center(
          child: Text('Folder not found'),
        ),
      );
    }

    return ResponsiveScaffold(
      title: folder.value!['name'],
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, folder.value!),
            _buildTabBar(theme, colorScheme, selectedTab),
            _buildSearchBar(searchController, theme, colorScheme),
            Expanded(
              child: _buildTabContent(
                context,
                theme,
                colorScheme,
                selectedTab.value,
                filteredAssets.value,
                filteredInspections.value,
                members.value,
                isLoading,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(
        context,
        selectedTab.value,
        folderId,
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> folder,
  ) {
    final statusColor = _getStatusColor(folder['status']);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.folder,
                  color: colorScheme.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      folder['name'],
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (folder['description'].isNotEmpty)
                      Text(
                        folder['description'],
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: statusColor.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  folder['status'],
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (value) {
                  _handleFolderAction(context, value, folder);
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: ListTile(
                      leading: Icon(Icons.edit),
                      title: Text('Edit Folder'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'duplicate',
                    child: ListTile(
                      leading: Icon(Icons.copy),
                      title: Text('Duplicate'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'export',
                    child: ListTile(
                      leading: Icon(Icons.download),
                      title: Text('Export Data'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'archive',
                    child: ListTile(
                      leading: Icon(Icons.archive),
                      title: Text('Archive'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: ListTile(
                      leading: Icon(Icons.delete, color: Colors.red),
                      title: Text('Delete', style: TextStyle(color: Colors.red)),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatChip(
                theme,
                colorScheme,
                Icons.inventory_2,
                '${folder['assetsCount']} Assets',
                Colors.blue,
              ),
              const SizedBox(width: 12),
              _buildStatChip(
                theme,
                colorScheme,
                Icons.assignment,
                '${folder['inspectionsCount']} Inspections',
                Colors.green,
              ),
              const SizedBox(width: 12),
              _buildStatChip(
                theme,
                colorScheme,
                Icons.people,
                '${folder['membersCount']} Members',
                Colors.orange,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                Icons.person,
                size: 16,
                color: colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Owner: ${folder['owner']}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.access_time,
                size: 16,
                color: colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Updated ${_formatDate(folder['updatedAt'])}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(
    ThemeData theme,
    ColorScheme colorScheme,
    IconData icon,
    String text,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: color,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> selectedTab,
  ) {
    final tabs = ['Assets', 'Inspections', 'Members', 'Activity'];
    
    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: TabBar(
        tabs: tabs.map((tab) => Tab(text: tab)).toList(),
        onTap: (index) {
          selectedTab.value = index;
        },
        labelColor: colorScheme.primary,
        unselectedLabelColor: colorScheme.onSurfaceVariant,
        indicatorColor: colorScheme.primary,
      ),
    );
  }

  Widget _buildSearchBar(
    TextEditingController searchController,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: CustomTextField(
        controller: searchController,
        hintText: 'Search assets, inspections, or members...',
        prefixIcon: const Icon(Icons.search),
        suffixIcon: searchController.text.isNotEmpty
            ? IconButton(
                onPressed: () {
                  searchController.clear();
                },
                icon: const Icon(Icons.clear),
              )
            : null,
      ),
    );
  }

  Widget _buildTabContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int selectedTab,
    List<Map<String, dynamic>> assets,
    List<Map<String, dynamic>> inspections,
    List<Map<String, dynamic>> members,
    ValueNotifier<bool> isLoading,
  ) {
    switch (selectedTab) {
      case 0:
        return _buildAssetsTab(context, theme, colorScheme, assets, isLoading);
      case 1:
        return _buildInspectionsTab(context, theme, colorScheme, inspections, isLoading);
      case 2:
        return _buildMembersTab(context, theme, colorScheme, members, isLoading);
      case 3:
        return _buildActivityTab(context, theme, colorScheme, isLoading);
      default:
        return const SizedBox();
    }
  }

  Widget _buildAssetsTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> assets,
    ValueNotifier<bool> isLoading,
  ) {
    if (assets.isEmpty) {
      return _buildEmptyState(
        context,
        theme,
        colorScheme,
        Icons.inventory_2_outlined,
        'No Assets',
        'Add assets to this folder to start organizing your inspections.',
        'Add Asset',
        () => context.push('/assets/create?folderId=$folderId'),
      );
    }
    
    return RefreshIndicator(
      onRefresh: () async {
        isLoading.value = true;
        await Future.delayed(const Duration(seconds: 1));
        isLoading.value = false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: assets.length,
        itemBuilder: (context, index) {
          final asset = assets[index];
          return _buildAssetCard(context, theme, colorScheme, asset);
        },
      ),
    );
  }

  Widget _buildInspectionsTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> inspections,
    ValueNotifier<bool> isLoading,
  ) {
    if (inspections.isEmpty) {
      return _buildEmptyState(
        context,
        theme,
        colorScheme,
        Icons.assignment_outlined,
        'No Inspections',
        'Start your first inspection for assets in this folder.',
        'New Inspection',
        () => context.push('/inspections/create?folderId=$folderId'),
      );
    }
    
    return RefreshIndicator(
      onRefresh: () async {
        isLoading.value = true;
        await Future.delayed(const Duration(seconds: 1));
        isLoading.value = false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: inspections.length,
        itemBuilder: (context, index) {
          final inspection = inspections[index];
          return _buildInspectionCard(context, theme, colorScheme, inspection);
        },
      ),
    );
  }

  Widget _buildMembersTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> members,
    ValueNotifier<bool> isLoading,
  ) {
    return RefreshIndicator(
      onRefresh: () async {
        isLoading.value = true;
        await Future.delayed(const Duration(seconds: 1));
        isLoading.value = false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: members.length,
        itemBuilder: (context, index) {
          final member = members[index];
          return _buildMemberCard(context, theme, colorScheme, member);
        },
      ),
    );
  }

  Widget _buildActivityTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<bool> isLoading,
  ) {
    final activities = _getMockActivities();
    
    return RefreshIndicator(
      onRefresh: () async {
        isLoading.value = true;
        await Future.delayed(const Duration(seconds: 1));
        isLoading.value = false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: activities.length,
        itemBuilder: (context, index) {
          final activity = activities[index];
          return _buildActivityCard(context, theme, colorScheme, activity);
        },
      ),
    );
  }

  Widget _buildEmptyState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    IconData icon,
    String title,
    String description,
    String buttonText,
    VoidCallback onPressed,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              onPressed: onPressed,
              text: buttonText,
              icon: Icons.add,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> asset,
  ) {
    final statusColor = _getAssetStatusColor(asset['status']);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.push('/assets/${asset['id']}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.inventory_2,
                  color: colorScheme.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      asset['name'],
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      asset['location'],
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: statusColor.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  asset['status'],
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInspectionCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> inspection,
  ) {
    final statusColor = _getInspectionStatusColor(inspection['status']);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.push('/inspections/${inspection['id']}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.assignment,
                      color: colorScheme.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          inspection['assetName'],
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Inspector: ${inspection['inspector']}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: statusColor.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      inspection['status'],
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Date: ${_formatDate(inspection['date'])}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMemberCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> member,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: colorScheme.primaryContainer,
              child: Text(
                member['name'].split(' ').map((n) => n[0]).join(''),
                style: TextStyle(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    member['name'],
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    member['role'],
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: colorScheme.surfaceVariant.withOpacity(0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                member['permissions'],
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> activity,
  ) {
    final iconData = _getActivityIcon(activity['type']);
    final iconColor = _getActivityColor(activity['type']);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                iconData,
                color: iconColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    activity['description'],
                    style: theme.textTheme.bodyMedium,
                  ),
                  Text(
                    '${activity['user']} • ${_formatDate(activity['timestamp'])}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget? _buildFloatingActionButton(
    BuildContext context,
    int selectedTab,
    String folderId,
  ) {
    switch (selectedTab) {
      case 0: // Assets
        return FloatingActionButton.extended(
          onPressed: () {
            context.push('/assets/create?folderId=$folderId');
          },
          icon: const Icon(Icons.add),
          label: const Text('Add Asset'),
        );
      case 1: // Inspections
        return FloatingActionButton.extended(
          onPressed: () {
            context.push('/inspections/create?folderId=$folderId');
          },
          icon: const Icon(Icons.add),
          label: const Text('New Inspection'),
        );
      case 2: // Members
        return FloatingActionButton.extended(
          onPressed: () {
            _showInviteMemberDialog(context);
          },
          icon: const Icon(Icons.person_add),
          label: const Text('Invite Member'),
        );
      default:
        return null;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'Archived':
        return Colors.grey;
      case 'Completed':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  Color _getAssetStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'Maintenance':
        return Colors.orange;
      case 'Retired':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  Color _getInspectionStatusColor(String status) {
    switch (status) {
      case 'Completed':
        return Colors.green;
      case 'In Progress':
        return Colors.blue;
      case 'Overdue':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  IconData _getActivityIcon(String type) {
    switch (type) {
      case 'inspection_created':
        return Icons.assignment_add;
      case 'asset_added':
        return Icons.inventory_2;
      case 'member_added':
        return Icons.person_add;
      case 'folder_updated':
        return Icons.edit;
      default:
        return Icons.info;
    }
  }

  Color _getActivityColor(String type) {
    switch (type) {
      case 'inspection_created':
        return Colors.green;
      case 'asset_added':
        return Colors.blue;
      case 'member_added':
        return Colors.purple;
      case 'folder_updated':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  void _handleFolderAction(
    BuildContext context,
    String action,
    Map<String, dynamic> folder,
  ) {
    switch (action) {
      case 'edit':
        context.push('/folders/${folder['id']}/edit');
        break;
      case 'duplicate':
        _showDuplicateDialog(context, folder);
        break;
      case 'export':
        _showExportDialog(context, folder);
        break;
      case 'archive':
        _showArchiveDialog(context, folder);
        break;
      case 'delete':
        _showDeleteDialog(context, folder);
        break;
    }
  }

  void _showDuplicateDialog(
    BuildContext context,
    Map<String, dynamic> folder,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Duplicate Folder'),
        content: Text('Create a copy of "${folder['name']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Folder "${folder['name']}" duplicated'),
                ),
              );
            },
            child: const Text('Duplicate'),
          ),
        ],
      ),
    );
  }

  void _showExportDialog(
    BuildContext context,
    Map<String, dynamic> folder,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Export Folder Data'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Export data for "${folder['name']}"'),
            const SizedBox(height: 16),
            const Text('Select export format:'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Export started - you will be notified when complete'),
                ),
              );
            },
            child: const Text('Export PDF'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Export started - you will be notified when complete'),
                ),
              );
            },
            child: const Text('Export CSV'),
          ),
        ],
      ),
    );
  }

  void _showArchiveDialog(
    BuildContext context,
    Map<String, dynamic> folder,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Archive Folder'),
        content: Text('Archive "${folder['name']}"? This will hide it from the active list.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Folder "${folder['name']}" archived'),
                ),
              );
            },
            child: const Text('Archive'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(
    BuildContext context,
    Map<String, dynamic> folder,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Folder'),
        content: Text(
          'Are you sure you want to delete "${folder['name']}"? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.pop(); // Go back to folders list
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Folder "${folder['name']}" deleted'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showInviteMemberDialog(BuildContext context) {
    final emailController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invite Member'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomTextField(
              controller: emailController,
              label: 'Email Address',
              hintText: 'Enter email address',
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Role',
                border: OutlineInputBorder(),
              ),
              items: ['Viewer', 'Editor', 'Admin']
                  .map((role) => DropdownMenuItem(
                        value: role,
                        child: Text(role),
                      ))
                  .toList(),
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Invitation sent to ${emailController.text}'),
                ),
              );
            },
            child: const Text('Send Invitation'),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic>? _getMockFolder(String id) {
    final folders = {
      'FOL001': {
        'id': 'FOL001',
        'name': 'Manufacturing Equipment',
        'description': 'All manufacturing and production equipment inspections',
        'status': 'Active',
        'assetsCount': 45,
        'inspectionsCount': 128,
        'membersCount': 8,
        'owner': 'John Smith',
        'createdAt': '2024-01-15T10:30:00Z',
        'updatedAt': '2024-01-20T14:22:00Z',
      },
      'FOL002': {
        'id': 'FOL002',
        'name': 'Vehicle Fleet',
        'description': 'Company vehicles and transportation equipment',
        'status': 'Active',
        'assetsCount': 23,
        'inspectionsCount': 67,
        'membersCount': 5,
        'owner': 'Sarah Johnson',
        'createdAt': '2024-01-10T09:15:00Z',
        'updatedAt': '2024-01-19T16:45:00Z',
      },
    };
    
    return folders[id];
  }

  List<Map<String, dynamic>> _getMockAssets() {
    return [
      {
        'id': 'AST001',
        'name': 'Conveyor Belt A1',
        'location': 'Production Floor - Section A',
        'status': 'Active',
      },
      {
        'id': 'AST002',
        'name': 'Hydraulic Press B2',
        'location': 'Production Floor - Section B',
        'status': 'Maintenance',
      },
      {
        'id': 'AST003',
        'name': 'Quality Control Station',
        'location': 'Quality Assurance Lab',
        'status': 'Active',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockInspections() {
    return [
      {
        'id': 'INS001',
        'assetName': 'Conveyor Belt A1',
        'inspector': 'John Smith',
        'status': 'Completed',
        'date': '2024-01-20T10:30:00Z',
      },
      {
        'id': 'INS002',
        'assetName': 'Hydraulic Press B2',
        'inspector': 'Sarah Johnson',
        'status': 'In Progress',
        'date': '2024-01-19T14:15:00Z',
      },
      {
        'id': 'INS003',
        'assetName': 'Quality Control Station',
        'inspector': 'Mike Wilson',
        'status': 'Scheduled',
        'date': '2024-01-22T09:00:00Z',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockMembers() {
    return [
      {
        'id': 'USR001',
        'name': 'John Smith',
        'role': 'Production Manager',
        'permissions': 'Admin',
      },
      {
        'id': 'USR002',
        'name': 'Sarah Johnson',
        'role': 'Quality Inspector',
        'permissions': 'Editor',
      },
      {
        'id': 'USR003',
        'name': 'Mike Wilson',
        'role': 'Maintenance Technician',
        'permissions': 'Editor',
      },
      {
        'id': 'USR004',
        'name': 'Lisa Brown',
        'role': 'Safety Officer',
        'permissions': 'Viewer',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockActivities() {
    return [
      {
        'id': 'ACT001',
        'type': 'inspection_created',
        'description': 'New inspection created for Conveyor Belt A1',
        'user': 'John Smith',
        'timestamp': '2024-01-20T10:30:00Z',
      },
      {
        'id': 'ACT002',
        'type': 'asset_added',
        'description': 'Added new asset: Quality Control Station',
        'user': 'Sarah Johnson',
        'timestamp': '2024-01-19T16:45:00Z',
      },
      {
        'id': 'ACT003',
        'type': 'member_added',
        'description': 'Lisa Brown joined the folder',
        'user': 'John Smith',
        'timestamp': '2024-01-18T11:20:00Z',
      },
      {
        'id': 'ACT004',
        'type': 'folder_updated',
        'description': 'Folder description updated',
        'user': 'John Smith',
        'timestamp': '2024-01-17T09:15:00Z',
      },
    ];
  }
}