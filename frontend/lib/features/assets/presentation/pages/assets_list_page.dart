import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/constants/app_constants.dart';

/// Page displaying list of assets with search and filtering capabilities
class AssetsListPage extends HookConsumerWidget {
  const AssetsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final isLoading = useState(false);
    final selectedCategory = useState<String?>('All');
    final selectedStatus = useState<String?>('All');
    
    // Mock assets data
    final assets = useState(_getMockAssets());
    final filteredAssets = useState(_getMockAssets());
    
    // Filter assets based on search and filters
    useEffect(() {
      final query = searchController.text.toLowerCase();
      final category = selectedCategory.value;
      final status = selectedStatus.value;
      
      filteredAssets.value = assets.value.where((asset) {
        final matchesSearch = asset.name.toLowerCase().contains(query) ||
            asset.id.toLowerCase().contains(query) ||
            asset.location.toLowerCase().contains(query);
        
        final matchesCategory = category == 'All' || asset.category == category;
        final matchesStatus = status == 'All' || asset.status == status;
        
        return matchesSearch && matchesCategory && matchesStatus;
      }).toList();
      
      return null;
    }, [searchController.text, selectedCategory.value, selectedStatus.value]);

    return ResponsiveScaffold(
      title: 'Assets',
      actions: [
        IconButton(
          onPressed: () {
            context.pushNamed(AppRoutes.qrScanner);
          },
          icon: const Icon(Icons.qr_code_scanner),
          tooltip: 'Scan QR Code',
        ),
        IconButton(
          onPressed: () {
            _showFilterDialog(context, selectedCategory, selectedStatus);
          },
          icon: const Icon(Icons.filter_list),
          tooltip: 'Filter',
        ),
      ],
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.pushNamed(AppRoutes.createAsset);
        },
        child: const Icon(Icons.add),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildSearchAndFilters(theme, colorScheme, searchController, selectedCategory, selectedStatus),
            _buildStatsCards(theme, colorScheme, assets.value),
            Expanded(
              child: _buildAssetsList(context, theme, colorScheme, filteredAssets.value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilters(
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<String?> selectedCategory,
    ValueNotifier<String?> selectedStatus,
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
          CustomTextField(
            controller: searchController,
            label: '',
            hintText: 'Search assets by name, ID, or location...',
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
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildFilterChip(
                  theme,
                  colorScheme,
                  'Category: ${selectedCategory.value}',
                  Icons.category,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildFilterChip(
                  theme,
                  colorScheme,
                  'Status: ${selectedStatus.value}',
                  Icons.info_outline,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colorScheme.outline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards(
    ThemeData theme,
    ColorScheme colorScheme,
    List<MockAsset> assets,
  ) {
    final totalAssets = assets.length;
    final activeAssets = assets.where((a) => a.status == 'Active').length;
    final maintenanceAssets = assets.where((a) => a.status == 'Maintenance').length;
    final inactiveAssets = assets.where((a) => a.status == 'Inactive').length;
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Total',
              totalAssets.toString(),
              Icons.inventory,
              colorScheme.primary,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Active',
              activeAssets.toString(),
              Icons.check_circle,
              Colors.green,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Maintenance',
              maintenanceAssets.toString(),
              Icons.build,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              theme,
              colorScheme,
              'Inactive',
              inactiveAssets.toString(),
              Icons.pause_circle,
              Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colorScheme.outline),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 20,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAssetsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<MockAsset> assets,
  ) {
    if (assets.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 64,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No assets found',
              style: theme.textTheme.titleLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your search or filters',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            CustomButton(
              onPressed: () {
                context.pushNamed(AppRoutes.createAsset);
              },
              text: 'Create Asset',
              icon: Icons.add,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: assets.length,
      itemBuilder: (context, index) {
        final asset = assets[index];
        return _buildAssetCard(context, theme, colorScheme, asset);
      },
    );
  }

  Widget _buildAssetCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockAsset asset,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.pushNamed(
            AppRoutes.assetDetail,
            pathParameters: {'assetId': asset.id},
          );
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
                      color: _getStatusColor(asset.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getCategoryIcon(asset.category),
                      color: _getStatusColor(asset.status),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          asset.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'ID: ${asset.id}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusChip(theme, colorScheme, asset.status),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      asset.location,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.category_outlined,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    asset.category,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              if (asset.lastInspection != null) ..[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.assignment_outlined,
                      size: 16,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Last inspection: ${asset.lastInspection}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(
    ThemeData theme,
    ColorScheme colorScheme,
    String status,
  ) {
    final color = _getStatusColor(status);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status,
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'Maintenance':
        return Colors.orange;
      case 'Inactive':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Vehicles':
        return Icons.local_shipping;
      case 'Machinery':
        return Icons.precision_manufacturing;
      case 'Tools':
        return Icons.build;
      case 'Equipment':
        return Icons.hardware;
      default:
        return Icons.inventory;
    }
  }

  void _showFilterDialog(
    BuildContext context,
    ValueNotifier<String?> selectedCategory,
    ValueNotifier<String?> selectedStatus,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Assets'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              value: selectedCategory.value,
              decoration: const InputDecoration(
                labelText: 'Category',
                border: OutlineInputBorder(),
              ),
              items: ['All', 'Vehicles', 'Machinery', 'Tools', 'Equipment']
                  .map((category) => DropdownMenuItem(
                        value: category,
                        child: Text(category),
                      ))
                  .toList(),
              onChanged: (value) {
                selectedCategory.value = value;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: selectedStatus.value,
              decoration: const InputDecoration(
                labelText: 'Status',
                border: OutlineInputBorder(),
              ),
              items: ['All', 'Active', 'Maintenance', 'Inactive']
                  .map((status) => DropdownMenuItem(
                        value: status,
                        child: Text(status),
                      ))
                  .toList(),
              onChanged: (value) {
                selectedStatus.value = value;
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              selectedCategory.value = 'All';
              selectedStatus.value = 'All';
              Navigator.of(context).pop();
            },
            child: const Text('Reset'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  List<MockAsset> _getMockAssets() {
    return [
      MockAsset(
        id: 'FL-001',
        name: 'Forklift #001',
        category: 'Vehicles',
        status: 'Active',
        location: 'Warehouse A - Section 1',
        lastInspection: '2024-01-15',
      ),
      MockAsset(
        id: 'CNC-001',
        name: 'CNC Machine #001',
        category: 'Machinery',
        status: 'Maintenance',
        location: 'Production Floor - Bay 2',
        lastInspection: '2024-01-10',
      ),
      MockAsset(
        id: 'DR-001',
        name: 'Power Drill Set',
        category: 'Tools',
        status: 'Active',
        location: 'Tool Room - Shelf A3',
        lastInspection: '2024-01-12',
      ),
      MockAsset(
        id: 'CR-001',
        name: 'Overhead Crane',
        category: 'Equipment',
        status: 'Active',
        location: 'Production Floor - Bay 1',
        lastInspection: '2024-01-08',
      ),
      MockAsset(
        id: 'FL-002',
        name: 'Forklift #002',
        category: 'Vehicles',
        status: 'Inactive',
        location: 'Warehouse B - Section 2',
        lastInspection: '2023-12-20',
      ),
    ];
  }
}

// Mock data class
class MockAsset {
  final String id;
  final String name;
  final String category;
  final String status;
  final String location;
  final String? lastInspection;

  MockAsset({
    required this.id,
    required this.name,
    required this.category,
    required this.status,
    required this.location,
    this.lastInspection,
  });
}