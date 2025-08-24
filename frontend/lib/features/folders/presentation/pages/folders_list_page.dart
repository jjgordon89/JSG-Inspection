import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/constants/app_constants.dart';

/// Page displaying list of folders/projects
class FoldersListPage extends HookConsumerWidget {
  const FoldersListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final isLoading = useState(false);
    final selectedFilter = useState<String>('All');
    final selectedSort = useState<String>('Name');
    
    // Mock folders data
    final folders = useState(_getMockFolders());
    final filteredFolders = useState(folders.value);
    
    // Filter and search logic
    useEffect(() {
      final query = searchController.text.toLowerCase();
      final filter = selectedFilter.value;
      
      var filtered = folders.value.where((folder) {
        final matchesSearch = folder['name'].toLowerCase().contains(query) ||
            folder['description'].toLowerCase().contains(query);
        
        final matchesFilter = filter == 'All' || folder['status'] == filter;
        
        return matchesSearch && matchesFilter;
      }).toList();
      
      // Sort
      switch (selectedSort.value) {
        case 'Name':
          filtered.sort((a, b) => a['name'].compareTo(b['name']));
          break;
        case 'Created Date':
          filtered.sort((a, b) => DateTime.parse(b['createdAt']).compareTo(DateTime.parse(a['createdAt'])));
          break;
        case 'Modified Date':
          filtered.sort((a, b) => DateTime.parse(b['updatedAt']).compareTo(DateTime.parse(a['updatedAt'])));
          break;
        case 'Assets Count':
          filtered.sort((a, b) => b['assetsCount'].compareTo(a['assetsCount']));
          break;
      }
      
      filteredFolders.value = filtered;
      return null;
    }, [searchController.text, selectedFilter.value, selectedSort.value]);

    return ResponsiveScaffold(
      title: 'Folders & Projects',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(
              context,
              theme,
              colorScheme,
              searchController,
              selectedFilter,
              selectedSort,
            ),
            _buildStatsCards(theme, colorScheme, folders.value),
            Expanded(
              child: _buildFoldersList(
                context,
                theme,
                colorScheme,
                filteredFolders.value,
                isLoading,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push('/folders/create');
        },
        icon: const Icon(Icons.add),
        label: const Text('New Folder'),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<String> selectedFilter,
    ValueNotifier<String> selectedSort,
  ) {
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
        children: [
          // Search bar
          CustomTextField(
            controller: searchController,
            hintText: 'Search folders and projects...',
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
          const SizedBox(height: 16),
          // Filters and sort
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: selectedFilter.value,
                  decoration: const InputDecoration(
                    labelText: 'Filter by Status',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: ['All', 'Active', 'Archived', 'Completed']
                      .map((filter) => DropdownMenuItem(
                            value: filter,
                            child: Text(filter),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      selectedFilter.value = value;
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: selectedSort.value,
                  decoration: const InputDecoration(
                    labelText: 'Sort by',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: ['Name', 'Created Date', 'Modified Date', 'Assets Count']
                      .map((sort) => DropdownMenuItem(
                            value: sort,
                            child: Text(sort),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      selectedSort.value = value;
                    }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards(
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> folders,
  ) {
    final totalFolders = folders.length;
    final activeFolders = folders.where((f) => f['status'] == 'Active').length;
    final totalAssets = folders.fold<int>(0, (sum, f) => sum + (f['assetsCount'] as int));
    final totalInspections = folders.fold<int>(0, (sum, f) => sum + (f['inspectionsCount'] as int));
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Total Folders',
              totalFolders.toString(),
              Icons.folder,
              colorScheme.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Active',
              activeFolders.toString(),
              Icons.folder_open,
              Colors.green,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Assets',
              totalAssets.toString(),
              Icons.inventory_2,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Inspections',
              totalInspections.toString(),
              Icons.assignment,
              Colors.orange,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String value,
    IconData icon,
    Color iconColor,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(
              icon,
              color: iconColor,
              size: 24,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFoldersList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> folders,
    ValueNotifier<bool> isLoading,
  ) {
    if (folders.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }
    
    return RefreshIndicator(
      onRefresh: () async {
        isLoading.value = true;
        await Future.delayed(const Duration(seconds: 1));
        isLoading.value = false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: folders.length,
        itemBuilder: (context, index) {
          final folder = folders[index];
          return _buildFolderCard(context, theme, colorScheme, folder);
        },
      ),
    );
  }

  Widget _buildEmptyState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.folder_outlined,
              size: 64,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              'No Folders Found',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first folder to organize assets and inspections.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              onPressed: () {
                context.push('/folders/create');
              },
              text: 'Create Folder',
              icon: Icons.add,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFolderCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> folder,
  ) {
    final statusColor = _getStatusColor(folder['status']);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.push('/folders/${folder['id']}');
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
                      Icons.folder,
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
                          folder['name'],
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (folder['description'].isNotEmpty)
                          Text(
                            folder['description'],
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
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
                      folder['status'],
                      style: theme.textTheme.bodySmall?.copyWith(
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
                          title: Text('Edit'),
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
                  _buildInfoChip(
                    theme,
                    colorScheme,
                    Icons.inventory_2,
                    '${folder['assetsCount']} Assets',
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    theme,
                    colorScheme,
                    Icons.assignment,
                    '${folder['inspectionsCount']} Inspections',
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    theme,
                    colorScheme,
                    Icons.person,
                    folder['owner'],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 14,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Updated ${_formatDate(folder['updatedAt'])}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    Icons.calendar_today,
                    size: 14,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Created ${_formatDate(folder['createdAt'])}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(
    ThemeData theme,
    ColorScheme colorScheme,
    IconData icon,
    String text,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
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

  List<Map<String, dynamic>> _getMockFolders() {
    return [
      {
        'id': 'FOL001',
        'name': 'Manufacturing Equipment',
        'description': 'All manufacturing and production equipment inspections',
        'status': 'Active',
        'assetsCount': 45,
        'inspectionsCount': 128,
        'owner': 'John Smith',
        'createdAt': '2024-01-15T10:30:00Z',
        'updatedAt': '2024-01-20T14:22:00Z',
      },
      {
        'id': 'FOL002',
        'name': 'Vehicle Fleet',
        'description': 'Company vehicles and transportation equipment',
        'status': 'Active',
        'assetsCount': 23,
        'inspectionsCount': 67,
        'owner': 'Sarah Johnson',
        'createdAt': '2024-01-10T09:15:00Z',
        'updatedAt': '2024-01-19T16:45:00Z',
      },
      {
        'id': 'FOL003',
        'name': 'Safety Equipment',
        'description': 'Fire safety, emergency equipment, and safety systems',
        'status': 'Active',
        'assetsCount': 78,
        'inspectionsCount': 234,
        'owner': 'Mike Wilson',
        'createdAt': '2024-01-05T11:20:00Z',
        'updatedAt': '2024-01-18T13:30:00Z',
      },
      {
        'id': 'FOL004',
        'name': 'HVAC Systems',
        'description': 'Heating, ventilation, and air conditioning equipment',
        'status': 'Active',
        'assetsCount': 34,
        'inspectionsCount': 89,
        'owner': 'Lisa Brown',
        'createdAt': '2023-12-20T08:45:00Z',
        'updatedAt': '2024-01-17T10:15:00Z',
      },
      {
        'id': 'FOL005',
        'name': 'Q4 2023 Audit',
        'description': 'Quarterly audit inspections for compliance',
        'status': 'Completed',
        'assetsCount': 156,
        'inspectionsCount': 312,
        'owner': 'David Lee',
        'createdAt': '2023-10-01T07:00:00Z',
        'updatedAt': '2023-12-31T17:00:00Z',
      },
      {
        'id': 'FOL006',
        'name': 'Legacy Equipment',
        'description': 'Older equipment scheduled for replacement',
        'status': 'Archived',
        'assetsCount': 12,
        'inspectionsCount': 45,
        'owner': 'Tom Anderson',
        'createdAt': '2023-08-15T12:30:00Z',
        'updatedAt': '2023-11-20T09:45:00Z',
      },
    ];
  }
}