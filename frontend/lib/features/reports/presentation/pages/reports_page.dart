import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/models/report.dart';

/// Page displaying reports with analytics and generation capabilities
class ReportsPage extends HookConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedType = useState<ReportType?>(null);
    final selectedPeriod = useState<ReportPeriod>(ReportPeriod.lastMonth);
    final isLoading = useState(false);
    
    // Mock data - replace with actual provider
    final reports = useState<List<Report>>(_getMockReports());
    final filteredReports = useMemoized(() {
      var filtered = reports.value;
      
      // Apply type filter
      if (selectedType.value != null) {
        filtered = filtered.where((r) => r.type == selectedType.value).toList();
      }
      
      // Apply search filter
      final searchTerm = searchController.text.toLowerCase();
      if (searchTerm.isNotEmpty) {
        filtered = filtered.where((r) => 
          r.title.toLowerCase().contains(searchTerm) ||
          r.description?.toLowerCase().contains(searchTerm) == true
        ).toList();
      }
      
      return filtered;
    }, [reports.value, selectedType.value, searchController.text]);

    return ResponsiveScaffold(
      title: 'Reports & Analytics',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showGenerateReportDialog(context),
        icon: const Icon(Icons.add_chart),
        label: const Text('Generate Report'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildHeader(context, theme, colorScheme, searchController, selectedType, selectedPeriod),
            _buildAnalyticsCards(context, theme, colorScheme),
            Expanded(
              child: _buildReportsList(context, theme, colorScheme, filteredReports),
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
    ValueNotifier<ReportType?> selectedType,
    ValueNotifier<ReportPeriod> selectedPeriod,
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
                    hintText: 'Search reports...',
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
                Expanded(
                  child: _buildPeriodFilter(theme, colorScheme, selectedPeriod),
                ),
                const SizedBox(width: 16),
                CustomButton(
                  text: 'Export All',
                  style: ButtonStyle.outline,
                  icon: Icons.download,
                  onPressed: () => _handleExportAll(context),
                ),
              ],
            )
          else
            Column(
              children: [
                CustomSearchField(
                  controller: searchController,
                  hintText: 'Search reports...',
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
                      child: _buildPeriodFilter(theme, colorScheme, selectedPeriod),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Export All Reports',
                        style: ButtonStyle.outline,
                        icon: Icons.download,
                        onPressed: () => _handleExportAll(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildTypeFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<ReportType?> selectedType,
  ) {
    return DropdownButtonFormField<ReportType?>(
      value: selectedType.value,
      decoration: InputDecoration(
        labelText: 'Report Type',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<ReportType?>(
          value: null,
          child: Text('All Types'),
        ),
        ...ReportType.values.map((type) => DropdownMenuItem(
          value: type,
          child: Text(_getTypeDisplayName(type)),
        )),
      ],
      onChanged: (value) {
        selectedType.value = value;
      },
    );
  }

  Widget _buildPeriodFilter(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<ReportPeriod> selectedPeriod,
  ) {
    return DropdownButtonFormField<ReportPeriod>(
      value: selectedPeriod.value,
      decoration: InputDecoration(
        labelText: 'Time Period',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: ReportPeriod.values.map((period) => DropdownMenuItem(
        value: period,
        child: Text(_getPeriodDisplayName(period)),
      )).toList(),
      onChanged: (value) {
        if (value != null) {
          selectedPeriod.value = value;
        }
      },
    );
  }

  Widget _buildAnalyticsCards(BuildContext context, ThemeData theme, ColorScheme colorScheme) {
    final screenType = context.screenType;
    
    return Container(
      padding: EdgeInsets.all(screenType.isMobile ? 16 : 24),
      child: screenType.isDesktop
          ? Row(
              children: [
                Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Total Inspections', '1,247', Icons.assignment, Colors.blue)),
                const SizedBox(width: 16),
                Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Completed This Month', '89', Icons.check_circle, Colors.green)),
                const SizedBox(width: 16),
                Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Issues Found', '23', Icons.warning, Colors.orange)),
                const SizedBox(width: 16),
                Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Avg. Score', '87%', Icons.trending_up, Colors.purple)),
              ],
            )
          : Column(
              children: [
                Row(
                  children: [
                    Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Total Inspections', '1,247', Icons.assignment, Colors.blue)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'This Month', '89', Icons.check_circle, Colors.green)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Issues Found', '23', Icons.warning, Colors.orange)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildAnalyticsCard(theme, colorScheme, 'Avg. Score', '87%', Icons.trending_up, Colors.purple)),
                  ],
                ),
              ],
            ),
    );
  }

  Widget _buildAnalyticsCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
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
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 20,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.trending_up,
                  color: Colors.green,
                  size: 16,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
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

  Widget _buildReportsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Report> reports,
  ) {
    if (reports.isEmpty) {
      return _buildEmptyState(context, theme, colorScheme);
    }

    final screenType = context.screenType;
    
    return ListView.builder(
      padding: EdgeInsets.all(screenType.isMobile ? 16 : 24),
      itemCount: reports.length,
      itemBuilder: (context, index) {
        final report = reports[index];
        return _buildReportCard(context, theme, colorScheme, report);
      },
    );
  }

  Widget _buildReportCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Report report,
  ) {
    final screenType = context.screenType;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _viewReport(context, report.id),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: screenType.isDesktop
              ? Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _getTypeColor(report.type).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _getTypeIcon(report.type),
                        color: _getTypeColor(report.type),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            report.title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (report.description != null) ..[
                            const SizedBox(height: 4),
                            Text(
                              report.description!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildTypeChip(theme, colorScheme, report.type),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                size: 14,
                                color: colorScheme.onSurfaceVariant,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _formatDate(report.generatedAt),
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      children: [
                        CustomButton(
                          text: 'View',
                          style: ButtonStyle.outline,
                          size: ButtonSize.small,
                          onPressed: () => _viewReport(context, report.id),
                        ),
                        const SizedBox(height: 8),
                        CustomButton(
                          text: 'Export',
                          size: ButtonSize.small,
                          onPressed: () => _exportReport(context, report.id),
                        ),
                      ],
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: _getTypeColor(report.type).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            _getTypeIcon(report.type),
                            color: _getTypeColor(report.type),
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                report.title,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              _buildTypeChip(theme, colorScheme, report.type),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (report.description != null) ..[
                      const SizedBox(height: 8),
                      Text(
                        report.description!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 14,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(report.generatedAt),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${report.dataPoints} data points',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: CustomButton(
                            text: 'View Report',
                            style: ButtonStyle.outline,
                            size: ButtonSize.small,
                            onPressed: () => _viewReport(context, report.id),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: CustomButton(
                            text: 'Export',
                            size: ButtonSize.small,
                            onPressed: () => _exportReport(context, report.id),
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

  Widget _buildTypeChip(ThemeData theme, ColorScheme colorScheme, ReportType type) {
    final color = _getTypeColor(type);

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
        _getTypeDisplayName(type),
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
            Icons.analytics_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No reports found',
            style: theme.textTheme.titleLarge?.copyWith(
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Generate your first report to see analytics',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Generate Report',
            icon: Icons.add_chart,
            onPressed: () => _showGenerateReportDialog(context),
          ),
        ],
      ),
    );
  }

  String _getTypeDisplayName(ReportType type) {
    switch (type) {
      case ReportType.inspection:
        return 'Inspection';
      case ReportType.asset:
        return 'Asset';
      case ReportType.compliance:
        return 'Compliance';
      case ReportType.performance:
        return 'Performance';
      case ReportType.custom:
        return 'Custom';
    }
  }

  String _getPeriodDisplayName(ReportPeriod period) {
    switch (period) {
      case ReportPeriod.lastWeek:
        return 'Last Week';
      case ReportPeriod.lastMonth:
        return 'Last Month';
      case ReportPeriod.lastQuarter:
        return 'Last Quarter';
      case ReportPeriod.lastYear:
        return 'Last Year';
      case ReportPeriod.custom:
        return 'Custom Range';
    }
  }

  IconData _getTypeIcon(ReportType type) {
    switch (type) {
      case ReportType.inspection:
        return Icons.assignment;
      case ReportType.asset:
        return Icons.inventory;
      case ReportType.compliance:
        return Icons.gavel;
      case ReportType.performance:
        return Icons.trending_up;
      case ReportType.custom:
        return Icons.analytics;
    }
  }

  Color _getTypeColor(ReportType type) {
    switch (type) {
      case ReportType.inspection:
        return Colors.blue;
      case ReportType.asset:
        return Colors.green;
      case ReportType.compliance:
        return Colors.orange;
      case ReportType.performance:
        return Colors.purple;
      case ReportType.custom:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _viewReport(BuildContext context, String reportId) {
    context.go('${AppRoutes.reports}/$reportId');
  }

  void _exportReport(BuildContext context, String reportId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality will be implemented soon'),
      ),
    );
  }

  void _handleExportAll(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export all functionality will be implemented soon'),
      ),
    );
  }

  void _showGenerateReportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Generate Report'),
        content: const Text('Report generation functionality will be implemented soon'),
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
                  content: Text('Report generation started'),
                ),
              );
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }

  // Mock data - replace with actual data provider
  List<Report> _getMockReports() {
    return [
      Report(
        id: 'RPT001',
        title: 'Monthly Safety Inspection Report',
        description: 'Comprehensive safety inspection analysis for December 2023',
        type: ReportType.inspection,
        generatedAt: DateTime.now().subtract(const Duration(days: 2)),
        generatedBy: 'admin',
        dataPoints: 156,
        fileSize: '2.4 MB',
        format: 'PDF',
      ),
      Report(
        id: 'RPT002',
        title: 'Asset Performance Analysis',
        description: 'Q4 2023 asset performance and maintenance trends',
        type: ReportType.asset,
        generatedAt: DateTime.now().subtract(const Duration(days: 5)),
        generatedBy: 'user2',
        dataPoints: 89,
        fileSize: '1.8 MB',
        format: 'PDF',
      ),
      Report(
        id: 'RPT003',
        title: 'Compliance Audit Report',
        description: 'Annual compliance audit findings and recommendations',
        type: ReportType.compliance,
        generatedAt: DateTime.now().subtract(const Duration(days: 7)),
        generatedBy: 'user3',
        dataPoints: 234,
        fileSize: '3.1 MB',
        format: 'PDF',
      ),
      Report(
        id: 'RPT004',
        title: 'Performance Dashboard',
        description: 'Real-time performance metrics and KPIs',
        type: ReportType.performance,
        generatedAt: DateTime.now().subtract(const Duration(hours: 6)),
        generatedBy: 'system',
        dataPoints: 45,
        fileSize: '892 KB',
        format: 'Excel',
      ),
    ];
  }
}