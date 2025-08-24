import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for managing inspection form templates
class FormsListPage extends HookConsumerWidget {
  const FormsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final searchController = useTextEditingController();
    final selectedCategory = useState<String>('all');
    final selectedStatus = useState<String>('all');
    final viewMode = useState<String>('grid'); // 'grid' or 'list'
    
    // Mock data
    final forms = useState(_getMockForms());
    final filteredForms = useState<List<Map<String, dynamic>>>([]);
    
    // Filter forms based on search and filters
    useEffect(() {
      var filtered = forms.value;
      
      // Apply search filter
      if (searchController.text.isNotEmpty) {
        filtered = filtered.where((form) {
          return form['name'].toLowerCase().contains(searchController.text.toLowerCase()) ||
                 form['description'].toLowerCase().contains(searchController.text.toLowerCase()) ||
                 form['category'].toLowerCase().contains(searchController.text.toLowerCase());
        }).toList();
      }
      
      // Apply category filter
      if (selectedCategory.value != 'all') {
        filtered = filtered.where((form) => form['category'] == selectedCategory.value).toList();
      }
      
      // Apply status filter
      if (selectedStatus.value != 'all') {
        filtered = filtered.where((form) => form['status'] == selectedStatus.value).toList();
      }
      
      filteredForms.value = filtered;
      return null;
    }, [searchController.text, selectedCategory.value, selectedStatus.value, forms.value]);

    return ResponsiveScaffold(
      title: 'Form Templates',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, viewMode),
            _buildFilters(theme, colorScheme, selectedCategory, selectedStatus),
            _buildStatsCards(theme, colorScheme, forms.value),
            Expanded(
              child: _buildFormsList(
                context,
                theme,
                colorScheme,
                filteredForms.value,
                viewMode.value,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/forms/create'),
        icon: const Icon(Icons.add),
        label: const Text('Create Template'),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<String> viewMode,
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
          Row(
            children: [
              Expanded(
                child: CustomTextField(
                  controller: searchController,
                  hintText: 'Search form templates...',
                  prefixIcon: Icons.search,
                ),
              ),
              const SizedBox(width: 16),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'grid',
                    icon: Icon(Icons.grid_view),
                    label: Text('Grid'),
                  ),
                  ButtonSegment(
                    value: 'list',
                    icon: Icon(Icons.list),
                    label: Text('List'),
                  ),
                ],
                selected: {viewMode.value},
                onSelectionChanged: (Set<String> selection) {
                  viewMode.value = selection.first;
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<String> selectedCategory,
    ValueNotifier<String> selectedStatus,
  ) {
    final categories = [
      {'value': 'all', 'label': 'All Categories'},
      {'value': 'safety', 'label': 'Safety'},
      {'value': 'equipment', 'label': 'Equipment'},
      {'value': 'maintenance', 'label': 'Maintenance'},
      {'value': 'quality', 'label': 'Quality'},
      {'value': 'environmental', 'label': 'Environmental'},
    ];
    
    final statuses = [
      {'value': 'all', 'label': 'All Status'},
      {'value': 'active', 'label': 'Active'},
      {'value': 'draft', 'label': 'Draft'},
      {'value': 'archived', 'label': 'Archived'},
    ];
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<String>(
              value: selectedCategory.value,
              decoration: const InputDecoration(
                labelText: 'Category',
                isDense: true,
              ),
              items: categories.map((category) {
                return DropdownMenuItem(
                  value: category['value'],
                  child: Text(category['label']!),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  selectedCategory.value = value;
                }
              },
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: DropdownButtonFormField<String>(
              value: selectedStatus.value,
              decoration: const InputDecoration(
                labelText: 'Status',
                isDense: true,
              ),
              items: statuses.map((status) {
                return DropdownMenuItem(
                  value: status['value'],
                  child: Text(status['label']!),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  selectedStatus.value = value;
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards(
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> forms,
  ) {
    final totalForms = forms.length;
    final activeForms = forms.where((form) => form['status'] == 'active').length;
    final draftForms = forms.where((form) => form['status'] == 'draft').length;
    final usageCount = forms.fold<int>(0, (sum, form) => sum + (form['usageCount'] as int));
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              'Total Templates',
              totalForms.toString(),
              Icons.description,
              colorScheme.primary,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              'Active',
              activeForms.toString(),
              Icons.check_circle,
              Colors.green,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              'Draft',
              draftForms.toString(),
              Icons.edit,
              Colors.orange,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildStatCard(
              'Total Usage',
              usageCount.toString(),
              Icons.trending_up,
              Colors.blue,
              theme,
              colorScheme,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
                const Spacer(),
                Text(
                  value,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> forms,
    String viewMode,
  ) {
    if (forms.isEmpty) {
      return _buildEmptyState(theme, colorScheme);
    }
    
    if (viewMode == 'grid') {
      return _buildGridView(context, theme, colorScheme, forms);
    } else {
      return _buildListView(context, theme, colorScheme, forms);
    }
  }

  Widget _buildEmptyState(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.description_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No form templates found',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first form template to get started',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> forms,
  ) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
        ),
        itemCount: forms.length,
        itemBuilder: (context, index) {
          final form = forms[index];
          return _buildFormCard(context, theme, colorScheme, form);
        },
      ),
    );
  }

  Widget _buildListView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> forms,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: forms.length,
      itemBuilder: (context, index) {
        final form = forms[index];
        return _buildFormListTile(context, theme, colorScheme, form);
      },
    );
  }

  Widget _buildFormCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> form,
  ) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.go('/forms/${form['id']}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 80,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    _getCategoryColor(form['category']).withOpacity(0.8),
                    _getCategoryColor(form['category']),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _buildStatusChip(form['status'], theme),
                  ),
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Icon(
                      _getCategoryIcon(form['category']),
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      form['name'],
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      form['description'],
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Icon(
                          Icons.quiz,
                          size: 16,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${form['questionCount']} questions',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${form['usageCount']} uses',
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
          ],
        ),
      ),
    );
  }

  Widget _buildFormListTile(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> form,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: _getCategoryColor(form['category']),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getCategoryIcon(form['category']),
            color: Colors.white,
            size: 24,
          ),
        ),
        title: Text(
          form['name'],
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(form['description']),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildStatusChip(form['status'], theme),
                const SizedBox(width: 8),
                Text(
                  '${form['questionCount']} questions',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${form['usageCount']} uses',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: ListTile(
                leading: Icon(Icons.visibility),
                title: Text('View'),
                dense: true,
              ),
            ),
            const PopupMenuItem(
              value: 'edit',
              child: ListTile(
                leading: Icon(Icons.edit),
                title: Text('Edit'),
                dense: true,
              ),
            ),
            const PopupMenuItem(
              value: 'duplicate',
              child: ListTile(
                leading: Icon(Icons.copy),
                title: Text('Duplicate'),
                dense: true,
              ),
            ),
            const PopupMenuItem(
              value: 'archive',
              child: ListTile(
                leading: Icon(Icons.archive),
                title: Text('Archive'),
                dense: true,
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: ListTile(
                leading: Icon(Icons.delete, color: Colors.red),
                title: Text('Delete', style: TextStyle(color: Colors.red)),
                dense: true,
              ),
            ),
          ],
          onSelected: (value) => _handleFormAction(context, value, form),
        ),
        onTap: () => context.go('/forms/${form['id']}'),
      ),
    );
  }

  Widget _buildStatusChip(String status, ThemeData theme) {
    Color color;
    String label;
    
    switch (status) {
      case 'active':
        color = Colors.green;
        label = 'Active';
        break;
      case 'draft':
        color = Colors.orange;
        label = 'Draft';
        break;
      case 'archived':
        color = Colors.grey;
        label = 'Archived';
        break;
      default:
        color = Colors.grey;
        label = status;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'safety':
        return Colors.red;
      case 'equipment':
        return Colors.blue;
      case 'maintenance':
        return Colors.orange;
      case 'quality':
        return Colors.green;
      case 'environmental':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'safety':
        return Icons.security;
      case 'equipment':
        return Icons.precision_manufacturing;
      case 'maintenance':
        return Icons.build;
      case 'quality':
        return Icons.verified;
      case 'environmental':
        return Icons.eco;
      default:
        return Icons.description;
    }
  }

  void _handleFormAction(BuildContext context, String action, Map<String, dynamic> form) {
    switch (action) {
      case 'view':
        context.go('/forms/${form['id']}');
        break;
      case 'edit':
        context.go('/forms/${form['id']}/edit');
        break;
      case 'duplicate':
        _duplicateForm(context, form);
        break;
      case 'archive':
        _archiveForm(context, form);
        break;
      case 'delete':
        _deleteForm(context, form);
        break;
    }
  }

  void _duplicateForm(BuildContext context, Map<String, dynamic> form) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Duplicated "${form['name']}"'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _archiveForm(BuildContext context, Map<String, dynamic> form) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Archived "${form['name']}"'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _deleteForm(BuildContext context, Map<String, dynamic> form) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Form Template'),
        content: Text('Are you sure you want to delete "${form['name']}"? This action cannot be undone.'),
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
                  content: Text('Deleted "${form['name']}"'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getMockForms() {
    return [
      {
        'id': 'FORM001',
        'name': 'Equipment Safety Inspection',
        'description': 'Comprehensive safety inspection checklist for manufacturing equipment',
        'category': 'safety',
        'status': 'active',
        'questionCount': 25,
        'usageCount': 156,
        'createdAt': DateTime.now().subtract(const Duration(days: 30)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 5)),
      },
      {
        'id': 'FORM002',
        'name': 'Fire Safety Inspection',
        'description': 'Fire safety systems and equipment inspection form',
        'category': 'safety',
        'status': 'active',
        'questionCount': 18,
        'usageCount': 89,
        'createdAt': DateTime.now().subtract(const Duration(days: 45)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 10)),
      },
      {
        'id': 'FORM003',
        'name': 'CNC Machine Maintenance',
        'description': 'Routine maintenance checklist for CNC machines',
        'category': 'maintenance',
        'status': 'active',
        'questionCount': 32,
        'usageCount': 234,
        'createdAt': DateTime.now().subtract(const Duration(days: 60)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 2)),
      },
      {
        'id': 'FORM004',
        'name': 'Quality Control Inspection',
        'description': 'Product quality control and assurance inspection',
        'category': 'quality',
        'status': 'active',
        'questionCount': 22,
        'usageCount': 178,
        'createdAt': DateTime.now().subtract(const Duration(days: 25)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 7)),
      },
      {
        'id': 'FORM005',
        'name': 'Environmental Compliance',
        'description': 'Environmental compliance and waste management inspection',
        'category': 'environmental',
        'status': 'draft',
        'questionCount': 15,
        'usageCount': 12,
        'createdAt': DateTime.now().subtract(const Duration(days: 10)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 1)),
      },
      {
        'id': 'FORM006',
        'name': 'Electrical Safety Check',
        'description': 'Electrical systems and components safety inspection',
        'category': 'safety',
        'status': 'active',
        'questionCount': 28,
        'usageCount': 145,
        'createdAt': DateTime.now().subtract(const Duration(days: 40)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 8)),
      },
      {
        'id': 'FORM007',
        'name': 'HVAC System Inspection',
        'description': 'Heating, ventilation, and air conditioning system inspection',
        'category': 'equipment',
        'status': 'active',
        'questionCount': 20,
        'usageCount': 67,
        'createdAt': DateTime.now().subtract(const Duration(days: 35)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 12)),
      },
      {
        'id': 'FORM008',
        'name': 'Conveyor Belt Maintenance',
        'description': 'Conveyor belt system maintenance and inspection checklist',
        'category': 'maintenance',
        'status': 'archived',
        'questionCount': 16,
        'usageCount': 45,
        'createdAt': DateTime.now().subtract(const Duration(days: 90)),
        'updatedAt': DateTime.now().subtract(const Duration(days: 30)),
      },
    ];
  }
}