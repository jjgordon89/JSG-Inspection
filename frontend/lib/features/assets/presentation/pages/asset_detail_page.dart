import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/constants/app_constants.dart';

/// Page displaying detailed information about a specific asset
class AssetDetailPage extends HookConsumerWidget {
  final String assetId;
  
  const AssetDetailPage({
    super.key,
    required this.assetId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final asset = useState(_getMockAsset(assetId));
    final inspections = useState(_getMockInspections(assetId));
    final selectedTab = useState(0);
    
    if (asset.value == null) {
      return ResponsiveScaffold(
        title: 'Asset Not Found',
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'Asset not found',
                style: theme.textTheme.titleLarge?.copyWith(
                  color: colorScheme.error,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'The asset with ID "$assetId" could not be found.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 24),
              CustomButton(
                onPressed: () {
                  context.pop();
                },
                text: 'Go Back',
                variant: ButtonVariant.outline,
              ),
            ],
          ),
        ),
      );
    }

    return ResponsiveScaffold(
      title: asset.value!.name,
      actions: [
        IconButton(
          onPressed: () {
            context.pushNamed(
              AppRoutes.qrScanner,
              queryParameters: {'assetId': assetId},
            );
          },
          icon: const Icon(Icons.qr_code),
          tooltip: 'View QR Code',
        ),
        PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'edit':
                _editAsset(context, assetId);
                break;
              case 'duplicate':
                _duplicateAsset(context, asset.value!);
                break;
              case 'delete':
                _deleteAsset(context, asset.value!);
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'edit',
              child: ListTile(
                leading: Icon(Icons.edit),
                title: Text('Edit Asset'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'duplicate',
              child: ListTile(
                leading: Icon(Icons.copy),
                title: Text('Duplicate Asset'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'delete',
              child: ListTile(
                leading: Icon(Icons.delete, color: Colors.red),
                title: Text('Delete Asset', style: TextStyle(color: Colors.red)),
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ],
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.pushNamed(
            AppRoutes.inspectionEdit,
            queryParameters: {'assetId': assetId},
          );
        },
        icon: const Icon(Icons.assignment_add),
        label: const Text('New Inspection'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildAssetHeader(theme, colorScheme, asset.value!),
            _buildTabBar(theme, colorScheme, selectedTab),
            Expanded(
              child: _buildTabContent(
                context,
                theme,
                colorScheme,
                selectedTab.value,
                asset.value!,
                inspections.value,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetHeader(
    ThemeData theme,
    ColorScheme colorScheme,
    MockAssetDetail asset,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _getStatusColor(asset.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getCategoryIcon(asset.category),
                  color: _getStatusColor(asset.status),
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      asset.name,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ID: ${asset.id}',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusChip(theme, colorScheme, asset.status),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoGrid(theme, colorScheme, asset),
        ],
      ),
    );
  }

  Widget _buildInfoGrid(
    ThemeData theme,
    ColorScheme colorScheme,
    MockAssetDetail asset,
  ) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 3,
      crossAxisSpacing: 16,
      mainAxisSpacing: 12,
      children: [
        _buildInfoItem(
          theme,
          colorScheme,
          'Category',
          asset.category,
          Icons.category,
        ),
        _buildInfoItem(
          theme,
          colorScheme,
          'Location',
          asset.location,
          Icons.location_on,
        ),
        _buildInfoItem(
          theme,
          colorScheme,
          'Manufacturer',
          asset.manufacturer,
          Icons.business,
        ),
        _buildInfoItem(
          theme,
          colorScheme,
          'Model',
          asset.model,
          Icons.info,
        ),
        _buildInfoItem(
          theme,
          colorScheme,
          'Serial Number',
          asset.serialNumber,
          Icons.tag,
        ),
        _buildInfoItem(
          theme,
          colorScheme,
          'Purchase Date',
          asset.purchaseDate,
          Icons.calendar_today,
        ),
      ],
    );
  }

  Widget _buildInfoItem(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.5),
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: colorScheme.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
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
        controller: null,
        onTap: (index) {
          selectedTab.value = index;
        },
        tabs: const [
          Tab(
            icon: Icon(Icons.assignment),
            text: 'Inspections',
          ),
          Tab(
            icon: Icon(Icons.description),
            text: 'Details',
          ),
          Tab(
            icon: Icon(Icons.history),
            text: 'History',
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int selectedTab,
    MockAssetDetail asset,
    List<MockInspection> inspections,
  ) {
    switch (selectedTab) {
      case 0:
        return _buildInspectionsTab(context, theme, colorScheme, inspections);
      case 1:
        return _buildDetailsTab(theme, colorScheme, asset);
      case 2:
        return _buildHistoryTab(theme, colorScheme, asset);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildInspectionsTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<MockInspection> inspections,
  ) {
    if (inspections.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.assignment_outlined,
              size: 64,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No inspections yet',
              style: theme.textTheme.titleLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start by creating your first inspection',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            CustomButton(
              onPressed: () {
                context.pushNamed(
                  AppRoutes.inspectionEdit,
                  queryParameters: {'assetId': assetId},
                );
              },
              text: 'Create Inspection',
              icon: Icons.add,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: inspections.length,
      itemBuilder: (context, index) {
        final inspection = inspections[index];
        return _buildInspectionCard(context, theme, colorScheme, inspection);
      },
    );
  }

  Widget _buildInspectionCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspection inspection,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.pushNamed(
            AppRoutes.inspectionDetail,
            pathParameters: {'inspectionId': inspection.id},
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
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          inspection.title,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'ID: ${inspection.id}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildInspectionStatusChip(theme, colorScheme, inspection.status),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    inspection.inspector,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    inspection.date,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              if (inspection.score != null) ..[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.star_outline,
                      size: 16,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Score: ${inspection.score}%',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: _getScoreColor(inspection.score!),
                        fontWeight: FontWeight.w600,
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

  Widget _buildDetailsTab(
    ThemeData theme,
    ColorScheme colorScheme,
    MockAssetDetail asset,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDetailSection(
            theme,
            colorScheme,
            'Basic Information',
            [
              _buildDetailRow('Asset ID', asset.id),
              _buildDetailRow('Name', asset.name),
              _buildDetailRow('Category', asset.category),
              _buildDetailRow('Status', asset.status),
              _buildDetailRow('Location', asset.location),
            ],
          ),
          const SizedBox(height: 24),
          _buildDetailSection(
            theme,
            colorScheme,
            'Technical Specifications',
            [
              _buildDetailRow('Manufacturer', asset.manufacturer),
              _buildDetailRow('Model', asset.model),
              _buildDetailRow('Serial Number', asset.serialNumber),
              _buildDetailRow('Purchase Date', asset.purchaseDate),
              _buildDetailRow('Warranty Expiry', asset.warrantyExpiry ?? 'N/A'),
            ],
          ),
          const SizedBox(height: 24),
          _buildDetailSection(
            theme,
            colorScheme,
            'Description',
            [
              Text(
                asset.description ?? 'No description available.',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailSection(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    List<Widget> children,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: colorScheme.outline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(
    ThemeData theme,
    ColorScheme colorScheme,
    MockAssetDetail asset,
  ) {
    final historyItems = _getMockHistory(asset.id);
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: historyItems.length,
      itemBuilder: (context, index) {
        final item = historyItems[index];
        return _buildHistoryItem(theme, colorScheme, item);
      },
    );
  }

  Widget _buildHistoryItem(
    ThemeData theme,
    ColorScheme colorScheme,
    MockHistoryItem item,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorScheme.outline),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _getHistoryTypeColor(item.type).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getHistoryTypeIcon(item.type),
              color: _getHistoryTypeColor(item.type),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.action,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (item.description != null) ..[
                  const SizedBox(height: 2),
                  Text(
                    item.description!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  '${item.date} • ${item.user}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildInspectionStatusChip(
    ThemeData theme,
    ColorScheme colorScheme,
    String status,
  ) {
    final color = _getInspectionStatusColor(status);
    
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

  Color _getInspectionStatusColor(String status) {
    switch (status) {
      case 'Completed':
        return Colors.green;
      case 'In Progress':
        return Colors.blue;
      case 'Pending':
        return Colors.orange;
      case 'Failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  Color _getHistoryTypeColor(String type) {
    switch (type) {
      case 'created':
        return Colors.blue;
      case 'updated':
        return Colors.orange;
      case 'inspection':
        return Colors.green;
      case 'maintenance':
        return Colors.purple;
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

  IconData _getHistoryTypeIcon(String type) {
    switch (type) {
      case 'created':
        return Icons.add_circle;
      case 'updated':
        return Icons.edit;
      case 'inspection':
        return Icons.assignment;
      case 'maintenance':
        return Icons.build;
      default:
        return Icons.history;
    }
  }

  void _editAsset(BuildContext context, String assetId) {
    // Navigate to edit asset page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Edit asset functionality will be implemented'),
      ),
    );
  }

  void _duplicateAsset(BuildContext context, MockAssetDetail asset) {
    // Duplicate asset logic
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Asset "${asset.name}" duplicated successfully'),
      ),
    );
  }

  void _deleteAsset(BuildContext context, MockAssetDetail asset) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Asset'),
        content: Text(
          'Are you sure you want to delete "${asset.name}"? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.pop(); // Go back to assets list
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Asset "${asset.name}" deleted successfully'),
                ),
              );
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

  MockAssetDetail? _getMockAsset(String assetId) {
    final assets = {
      'FL-001': MockAssetDetail(
        id: 'FL-001',
        name: 'Forklift #001',
        category: 'Vehicles',
        status: 'Active',
        location: 'Warehouse A - Section 1',
        manufacturer: 'Toyota',
        model: 'Model 8FBE15U',
        serialNumber: 'TY123456789',
        purchaseDate: '2022-03-15',
        warrantyExpiry: '2025-03-15',
        description: 'Electric forklift with 1.5-ton capacity. Used for warehouse operations and material handling.',
      ),
      'CNC-001': MockAssetDetail(
        id: 'CNC-001',
        name: 'CNC Machine #001',
        category: 'Machinery',
        status: 'Maintenance',
        location: 'Production Floor - Bay 2',
        manufacturer: 'Haas',
        model: 'VF-2SS',
        serialNumber: 'HS987654321',
        purchaseDate: '2021-08-20',
        warrantyExpiry: '2024-08-20',
        description: 'High-precision CNC machining center for metal fabrication and prototyping.',
      ),
    };
    
    return assets[assetId];
  }

  List<MockInspection> _getMockInspections(String assetId) {
    return [
      MockInspection(
        id: 'INS-001',
        title: 'Monthly Safety Inspection',
        status: 'Completed',
        inspector: 'John Smith',
        date: '2024-01-15',
        score: 85,
      ),
      MockInspection(
        id: 'INS-002',
        title: 'Quarterly Maintenance Check',
        status: 'In Progress',
        inspector: 'Sarah Johnson',
        date: '2024-01-10',
        score: null,
      ),
      MockInspection(
        id: 'INS-003',
        title: 'Annual Compliance Audit',
        status: 'Completed',
        inspector: 'Mike Wilson',
        date: '2024-01-05',
        score: 92,
      ),
    ];
  }

  List<MockHistoryItem> _getMockHistory(String assetId) {
    return [
      MockHistoryItem(
        type: 'inspection',
        action: 'Inspection Completed',
        description: 'Monthly safety inspection passed with score 85%',
        date: '2024-01-15',
        user: 'John Smith',
      ),
      MockHistoryItem(
        type: 'updated',
        action: 'Asset Updated',
        description: 'Location changed to Warehouse A - Section 1',
        date: '2024-01-12',
        user: 'Admin User',
      ),
      MockHistoryItem(
        type: 'maintenance',
        action: 'Maintenance Scheduled',
        description: 'Quarterly maintenance check scheduled',
        date: '2024-01-10',
        user: 'Sarah Johnson',
      ),
      MockHistoryItem(
        type: 'created',
        action: 'Asset Created',
        description: 'Asset added to inventory system',
        date: '2022-03-15',
        user: 'System Admin',
      ),
    ];
  }
}

// Mock data classes
class MockAssetDetail {
  final String id;
  final String name;
  final String category;
  final String status;
  final String location;
  final String manufacturer;
  final String model;
  final String serialNumber;
  final String purchaseDate;
  final String? warrantyExpiry;
  final String? description;

  MockAssetDetail({
    required this.id,
    required this.name,
    required this.category,
    required this.status,
    required this.location,
    required this.manufacturer,
    required this.model,
    required this.serialNumber,
    required this.purchaseDate,
    this.warrantyExpiry,
    this.description,
  });
}

class MockInspection {
  final String id;
  final String title;
  final String status;
  final String inspector;
  final String date;
  final int? score;

  MockInspection({
    required this.id,
    required this.title,
    required this.status,
    required this.inspector,
    required this.date,
    this.score,
  });
}

class MockHistoryItem {
  final String type;
  final String action;
  final String? description;
  final String date;
  final String user;

  MockHistoryItem({
    required this.type,
    required this.action,
    this.description,
    required this.date,
    required this.user,
  });
}