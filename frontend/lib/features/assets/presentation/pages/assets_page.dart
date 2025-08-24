import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/models/asset.dart';

/// Page displaying list of assets with filtering and search
class AssetsPage extends HookConsumerWidget {
  const AssetsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedCategory = useState<AssetCategory?>(null);
    final selectedStatus = useState<AssetStatus?>(null);
    final isLoading = useState(false);
    
    // Mock data - replace with actual provider
    final assets = useState<List<Asset>>(_getMockAssets());
    final filteredAssets = useMemoized(() {
      var filtered = assets.value;
      
      // Apply category filter
      if (selectedCategory.value != null) {
        filtered = filtered.where((a) => a.category == selectedCategory.value).toList();
      }
      
      // Apply status filter
      if (selectedStatus.value != null) {
        filtered = filtered.where((a) => a.status == selectedStatus.value).toList();
      }
      
      // Apply search filter
      final searchTerm = searchController.text.toLowerCase();
      if (searchTerm.isNotEmpty) {
        filtered = filtered.where((a) => 
          a.name.toLowerCase().contains(searchTerm) ||
          a.id.toLowerCase().contains(searchTerm) ||
          a.serialNumber?.toLowerCase().contains(searchTerm) == true
        ).toList();
      }
      
      return filtered;
    }, [assets.value, selectedCategory.value, selectedStatus.value, searchController.text]);

    return ResponsiveScaffold(
      title: 'Assets',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(AppRoutes.newAsset),
        icon: const Icon(Icons.add),
        label: const Text('Add Asset'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, selectedCategory, selectedStatus),
            Expanded(
              child: _buildAssetsList(context, theme, colorScheme, filteredAssets),
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
    ValueNotifier<AssetCategory?> selectedCategory,
    ValueNotifier<AssetStatus?> selectedStatus,
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
                    hintText: 'Search assets...',
                    onChanged: (value) {
                      // Trigger rebuild through controller
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildCategoryFilter(theme, colorScheme, selectedCategory),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusFilter(theme, colorScheme, selectedStatus),
                ),
                const SizedBox(width: 16),
                CustomButton(
                  text: 'Scan QR',
                  style: ButtonStyle.outline,
                  icon: Icons.qr_code_scanner,
                  onPressed: () => _handleQRScan(context),
                ),
              ],
            )
          else
            Column(
              children: [
                CustomSearchField(
                  controller: searchController,
                  hintText: 'Search assets...',
                  onChanged: (value) {
                    // Trigger rebuild through controller
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildCategoryFilter(theme, colorScheme, selectedCategory),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatusFilter(theme, colorScheme, selectedStatus),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Scan QR Code',
                        style: ButtonStyle.outline,
                        icon: Icons.qr_code_scanner,
                        onPressed: () => _handleQRScan(context),
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

  Widget _buildCategoryFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<AssetCategory?> selectedCategory,
  ) {
    return DropdownButtonFormField<AssetCategory?>(
      value: selectedCategory.value,
      decoration: InputDecoration(
        labelText: 'Category',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<AssetCategory?>(
          value: null,
          child: Text('All Categories'),
        ),
        ...AssetCategory.values.map((category) => DropdownMenuItem(
          value: category,
          child: Text(_getCategoryDisplayName(category)),
        )),
      ],
      onChanged: (value) {
        selectedCategory.value = value;
      },
    );
  }

  Widget _buildStatusFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<AssetStatus?> selectedStatus,
  ) {
    return DropdownButtonFormField<AssetStatus?>(
      value: selectedStatus.value,
      decoration: InputDecoration(
        labelText: 'Status',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<AssetStatus?>(
          value: null,
          child: Text('All Statuses'),
        ),
        ...AssetStatus.values.map((status) => DropdownMenuItem(
          value: status,
          child: Text(_getStatusDisplayName(status)),
        )),
      ],
      onChanged: (value) {
        selectedStatus.value = value;
      },
    );
  }

  Widget _buildStatsRow(ThemeData theme, ColorScheme colorScheme) {
    return Row(
      children: [
        _buildStatChip(theme, colorScheme, 'Total', '89', colorScheme.primary),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Active', '76', Colors.green),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Maintenance', '8', Colors.orange),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Retired', '5', Colors.grey),
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

  Widget _buildAssetsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Asset> assets,
  ) {
    if (assets.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }

    final screenType = context.screenType;
    
    if (screenType.isDesktop) {
      return _buildDesktopGrid(context, theme, colorScheme, assets);
    } else {
      return _buildMobileList(context, theme, colorScheme, assets);
    }
  }

  Widget _buildDesktopGrid(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Asset> assets,
  ) {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: assets.length,
      itemBuilder: (context, index) {
        final asset = assets[index];
        return _buildAssetCard(context, theme, colorScheme, asset);
      },
    );
  }

  Widget _buildMobileList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Asset> assets,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: assets.length,
      itemBuilder: (context, index) {
        final asset = assets[index];
        return _buildAssetCard(context, theme, colorScheme, asset, isMobile: true);
      },
    );
  }

  Widget _buildAssetCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Asset asset, {
    bool isMobile = false,
  }) {
    return Card(
      margin: isMobile ? const EdgeInsets.only(bottom: 12) : EdgeInsets.zero,
      child: InkWell(
        onTap: () => _viewAsset(context, asset.id),
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
                      color: _getCategoryColor(asset.category).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getCategoryIcon(asset.category),
                      color: _getCategoryColor(asset.category),
                      size: 24,
                    ),
                  ),
                  const Spacer(),
                  _buildStatusChip(theme, colorScheme, asset.status),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                asset.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'ID: ${asset.id}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              if (asset.serialNumber != null) ..[
                const SizedBox(height: 2),
                Text(
                  'S/N: ${asset.serialNumber}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.location_on,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      asset.location,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (!isMobile) ..[
                const Spacer(),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'View',
                        style: ButtonStyle.outline,
                        size: ButtonSize.small,
                        onPressed: () => _viewAsset(context, asset.id),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Inspect',
                        size: ButtonSize.small,
                        onPressed: () => _inspectAsset(context, asset.id),
                      ),
                    ),
                  ],
                ),
              ] else ..[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'View Details',
                        style: ButtonStyle.outline,
                        size: ButtonSize.small,
                        onPressed: () => _viewAsset(context, asset.id),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Start Inspection',
                        size: ButtonSize.small,
                        onPressed: () => _inspectAsset(context, asset.id),
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

  Widget _buildStatusChip(ThemeData theme, ColorScheme colorScheme, AssetStatus status) {
    Color color;
    switch (status) {
      case AssetStatus.active:
        color = Colors.green;
        break;
      case AssetStatus.inactive:
        color = Colors.grey;
        break;
      case AssetStatus.maintenance:
        color = Colors.orange;
        break;
      case AssetStatus.retired:
        color = Colors.red;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        _getStatusDisplayName(status),
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ThemeData theme, ColorScheme colorScheme) {
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
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start by adding your first asset',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Add Asset',
            icon: Icons.add,
            onPressed: () => context.go(AppRoutes.newAsset),
          ),
        ],
      ),
    );
  }

  String _getCategoryDisplayName(AssetCategory category) {
    switch (category) {
      case AssetCategory.equipment:
        return 'Equipment';
      case AssetCategory.vehicle:
        return 'Vehicle';
      case AssetCategory.building:
        return 'Building';
      case AssetCategory.infrastructure:
        return 'Infrastructure';
      case AssetCategory.safety:
        return 'Safety';
      case AssetCategory.other:
        return 'Other';
    }
  }

  String _getStatusDisplayName(AssetStatus status) {
    switch (status) {
      case AssetStatus.active:
        return 'Active';
      case AssetStatus.inactive:
        return 'Inactive';
      case AssetStatus.maintenance:
        return 'Maintenance';
      case AssetStatus.retired:
        return 'Retired';
    }
  }

  IconData _getCategoryIcon(AssetCategory category) {
    switch (category) {
      case AssetCategory.equipment:
        return Icons.precision_manufacturing;
      case AssetCategory.vehicle:
        return Icons.directions_car;
      case AssetCategory.building:
        return Icons.business;
      case AssetCategory.infrastructure:
        return Icons.foundation;
      case AssetCategory.safety:
        return Icons.security;
      case AssetCategory.other:
        return Icons.category;
    }
  }

  Color _getCategoryColor(AssetCategory category) {
    switch (category) {
      case AssetCategory.equipment:
        return Colors.blue;
      case AssetCategory.vehicle:
        return Colors.green;
      case AssetCategory.building:
        return Colors.orange;
      case AssetCategory.infrastructure:
        return Colors.purple;
      case AssetCategory.safety:
        return Colors.red;
      case AssetCategory.other:
        return Colors.grey;
    }
  }

  void _viewAsset(BuildContext context, String assetId) {
    context.go('${AppRoutes.assets}/$assetId');
  }

  void _inspectAsset(BuildContext context, String assetId) {
    context.go('${AppRoutes.newInspection}?assetId=$assetId');
  }

  void _handleQRScan(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('QR code scanning will be implemented soon'),
      ),
    );
  }

  // Mock data - replace with actual data provider
  List<Asset> _getMockAssets() {
    return [
      Asset(
        id: 'A001',
        name: 'Fire Extinguisher #1',
        category: AssetCategory.safety,
        status: AssetStatus.active,
        location: 'Building A - Floor 1 - Corridor',
        serialNumber: 'FE001234',
        manufacturer: 'SafetyFirst Inc.',
        model: 'SF-2000',
        purchaseDate: DateTime(2022, 1, 15),
        warrantyExpiry: DateTime(2025, 1, 15),
        lastInspectionDate: DateTime.now().subtract(const Duration(days: 30)),
        nextInspectionDate: DateTime.now().add(const Duration(days: 335)),
        createdAt: DateTime(2022, 1, 15),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      Asset(
        id: 'A002',
        name: 'Emergency Exit Light',
        category: AssetCategory.safety,
        status: AssetStatus.active,
        location: 'Building A - Floor 2 - Exit Door',
        serialNumber: 'EL002345',
        manufacturer: 'LightTech Corp.',
        model: 'LT-EXIT-100',
        purchaseDate: DateTime(2021, 6, 10),
        warrantyExpiry: DateTime(2024, 6, 10),
        lastInspectionDate: DateTime.now().subtract(const Duration(days: 15)),
        nextInspectionDate: DateTime.now().add(const Duration(days: 350)),
        createdAt: DateTime(2021, 6, 10),
        updatedAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
      Asset(
        id: 'A003',
        name: 'HVAC Unit #1',
        category: AssetCategory.equipment,
        status: AssetStatus.maintenance,
        location: 'Building A - Roof',
        serialNumber: 'HVAC003456',
        manufacturer: 'ClimateControl Ltd.',
        model: 'CC-5000X',
        purchaseDate: DateTime(2020, 3, 20),
        warrantyExpiry: DateTime(2023, 3, 20),
        lastInspectionDate: DateTime.now().subtract(const Duration(days: 60)),
        nextInspectionDate: DateTime.now().add(const Duration(days: 305)),
        createdAt: DateTime(2020, 3, 20),
        updatedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Asset(
        id: 'A004',
        name: 'Company Vehicle #1',
        category: AssetCategory.vehicle,
        status: AssetStatus.active,
        location: 'Parking Lot A - Space 15',
        serialNumber: 'VIN1234567890',
        manufacturer: 'AutoMaker Inc.',
        model: 'WorkTruck 2023',
        purchaseDate: DateTime(2023, 1, 5),
        warrantyExpiry: DateTime(2026, 1, 5),
        lastInspectionDate: DateTime.now().subtract(const Duration(days: 10)),
        nextInspectionDate: DateTime.now().add(const Duration(days: 355)),
        createdAt: DateTime(2023, 1, 5),
        updatedAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
    ];
  }
}