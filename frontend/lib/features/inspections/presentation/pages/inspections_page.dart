import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/models/inspection.dart';

/// Page displaying list of inspections with filtering and search
class InspectionsPage extends HookConsumerWidget {
  const InspectionsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedFilter = useState<InspectionStatus?>(null);
    final isLoading = useState(false);
    
    // Mock data - replace with actual provider
    final inspections = useState<List<Inspection>>(_getMockInspections());
    final filteredInspections = useMemoized(() {
      var filtered = inspections.value;
      
      // Apply status filter
      if (selectedFilter.value != null) {
        filtered = filtered.where((i) => i.status == selectedFilter.value).toList();
      }
      
      // Apply search filter
      final searchTerm = searchController.text.toLowerCase();
      if (searchTerm.isNotEmpty) {
        filtered = filtered.where((i) => 
          i.id.toLowerCase().contains(searchTerm) ||
          i.assetId.toLowerCase().contains(searchTerm)
        ).toList();
      }
      
      return filtered;
    }, [inspections.value, selectedFilter.value, searchController.text]);

    return ResponsiveScaffold(
      title: 'Inspections',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(AppRoutes.newInspection),
        icon: const Icon(Icons.add),
        label: const Text('New Inspection'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, selectedFilter),
            Expanded(
              child: _buildInspectionsList(context, theme, colorScheme, filteredInspections),
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
    ValueNotifier<InspectionStatus?> selectedFilter,
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
                    hintText: 'Search inspections...',
                    onChanged: (value) {
                      // Trigger rebuild through controller
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusFilter(theme, colorScheme, selectedFilter),
                ),
                const SizedBox(width: 16),
                CustomButton(
                  text: 'Export',
                  style: ButtonStyle.outline,
                  icon: Icons.download,
                  onPressed: () => _handleExport(context),
                ),
              ],
            )
          else
            Column(
              children: [
                CustomSearchField(
                  controller: searchController,
                  hintText: 'Search inspections...',
                  onChanged: (value) {
                    // Trigger rebuild through controller
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatusFilter(theme, colorScheme, selectedFilter),
                    ),
                    const SizedBox(width: 12),
                    CustomButton(
                      text: 'Export',
                      style: ButtonStyle.outline,
                      size: ButtonSize.small,
                      icon: Icons.download,
                      onPressed: () => _handleExport(context),
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

  Widget _buildStatusFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<InspectionStatus?> selectedFilter,
  ) {
    return DropdownButtonFormField<InspectionStatus?>(
      value: selectedFilter.value,
      decoration: InputDecoration(
        labelText: 'Filter by Status',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<InspectionStatus?>(
          value: null,
          child: Text('All Statuses'),
        ),
        ...InspectionStatus.values.map((status) => DropdownMenuItem(
          value: status,
          child: Text(_getStatusDisplayName(status)),
        )),
      ],
      onChanged: (value) {
        selectedFilter.value = value;
      },
    );
  }

  Widget _buildStatsRow(ThemeData theme, ColorScheme colorScheme) {
    return Row(
      children: [
        _buildStatChip(theme, colorScheme, 'Total', '156', colorScheme.primary),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Pending', '23', Colors.orange),
        const SizedBox(width: 12),
        _buildStatChip(theme, colorScheme, 'Completed', '133', Colors.green),
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

  Widget _buildInspectionsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Inspection> inspections,
  ) {
    if (inspections.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }

    final screenType = context.screenType;
    
    if (screenType.isDesktop) {
      return _buildDesktopTable(context, theme, colorScheme, inspections);
    } else {
      return _buildMobileList(context, theme, colorScheme, inspections);
    }
  }

  Widget _buildDesktopTable(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Inspection> inspections,
  ) {
    return SingleChildScrollView(
      child: Container(
        margin: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: DataTable(
          headingRowColor: MaterialStateProperty.all(
            colorScheme.surfaceVariant.withOpacity(0.5),
          ),
          columns: const [
            DataColumn(label: Text('ID')),
            DataColumn(label: Text('Asset')),
            DataColumn(label: Text('Status')),
            DataColumn(label: Text('Inspector')),
            DataColumn(label: Text('Date')),
            DataColumn(label: Text('Score')),
            DataColumn(label: Text('Actions')),
          ],
          rows: inspections.map((inspection) => DataRow(
            cells: [
              DataCell(Text(inspection.id.substring(0, 8))),
              DataCell(Text(inspection.assetId)),
              DataCell(_buildStatusChip(theme, colorScheme, inspection.status)),
              DataCell(Text(inspection.inspectorId)),
              DataCell(Text(_formatDate(inspection.createdAt))),
              DataCell(inspection.score != null 
                ? _buildScoreChip(theme, colorScheme, inspection.score!)
                : const Text('-')
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.visibility),
                      onPressed: () => _viewInspection(context, inspection.id),
                      tooltip: 'View',
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => _editInspection(context, inspection.id),
                      tooltip: 'Edit',
                    ),
                    IconButton(
                      icon: const Icon(Icons.download),
                      onPressed: () => _downloadReport(context, inspection.id),
                      tooltip: 'Download Report',
                    ),
                  ],
                ),
              ),
            ],
          )).toList(),
        ),
      ),
    );
  }

  Widget _buildMobileList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Inspection> inspections,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: inspections.length,
      itemBuilder: (context, index) {
        final inspection = inspections[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () => _viewInspection(context, inspection.id),
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
                              'ID: ${inspection.id.substring(0, 8)}',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Asset: ${inspection.assetId}',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      _buildStatusChip(theme, colorScheme, inspection.status),
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
                        inspection.inspectorId,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Icon(
                        Icons.calendar_today,
                        size: 16,
                        color: colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(inspection.createdAt),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                      if (inspection.score != null) ..[
                        const Spacer(),
                        _buildScoreChip(theme, colorScheme, inspection.score!),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: CustomButton(
                          text: 'View',
                          style: ButtonStyle.outline,
                          size: ButtonSize.small,
                          onPressed: () => _viewInspection(context, inspection.id),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: CustomButton(
                          text: 'Edit',
                          size: ButtonSize.small,
                          onPressed: () => _editInspection(context, inspection.id),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusChip(ThemeData theme, ColorScheme colorScheme, InspectionStatus status) {
    Color color;
    switch (status) {
      case InspectionStatus.draft:
        color = Colors.grey;
        break;
      case InspectionStatus.inProgress:
        color = Colors.blue;
        break;
      case InspectionStatus.completed:
        color = Colors.green;
        break;
      case InspectionStatus.reviewed:
        color = Colors.purple;
        break;
      case InspectionStatus.archived:
        color = Colors.orange;
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

  Widget _buildScoreChip(ThemeData theme, ColorScheme colorScheme, InspectionScore score) {
    Color color;
    if (score.percentage >= 90) {
      color = Colors.green;
    } else if (score.percentage >= 70) {
      color = Colors.orange;
    } else {
      color = Colors.red;
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
        '${score.percentage.toInt()}%',
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
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
            Icons.assignment_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No inspections found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: colorScheme.onSurface,
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
            text: 'Create Inspection',
            icon: Icons.add,
            onPressed: () => context.go(AppRoutes.newInspection),
          ),
        ],
      ),
    );
  }

  String _getStatusDisplayName(InspectionStatus status) {
    switch (status) {
      case InspectionStatus.draft:
        return 'Draft';
      case InspectionStatus.inProgress:
        return 'In Progress';
      case InspectionStatus.completed:
        return 'Completed';
      case InspectionStatus.reviewed:
        return 'Reviewed';
      case InspectionStatus.archived:
        return 'Archived';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _viewInspection(BuildContext context, String inspectionId) {
    context.go('${AppRoutes.inspections}/$inspectionId');
  }

  void _editInspection(BuildContext context, String inspectionId) {
    context.go('${AppRoutes.inspections}/$inspectionId/edit');
  }

  void _downloadReport(BuildContext context, String inspectionId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Report download will be implemented soon'),
      ),
    );
  }

  void _handleExport(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality will be implemented soon'),
      ),
    );
  }

  // Mock data - replace with actual data provider
  List<Inspection> _getMockInspections() {
    return [
      Inspection(
        id: 'insp_001',
        formTemplateId: 'template_001',
        assetId: 'A001',
        folderId: 'folder_001',
        inspectorId: 'John Doe',
        status: InspectionStatus.completed,
        responses: [],
        photos: [],
        score: const InspectionScore(
          totalQuestions: 10,
          answeredQuestions: 10,
          passedQuestions: 9,
          percentage: 90.0,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      Inspection(
        id: 'insp_002',
        formTemplateId: 'template_001',
        assetId: 'A002',
        folderId: 'folder_001',
        inspectorId: 'Jane Smith',
        status: InspectionStatus.inProgress,
        responses: [],
        photos: [],
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Inspection(
        id: 'insp_003',
        formTemplateId: 'template_002',
        assetId: 'A003',
        folderId: 'folder_002',
        inspectorId: 'Bob Johnson',
        status: InspectionStatus.reviewed,
        responses: [],
        photos: [],
        score: const InspectionScore(
          totalQuestions: 15,
          answeredQuestions: 15,
          passedQuestions: 12,
          percentage: 80.0,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        updatedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }
}