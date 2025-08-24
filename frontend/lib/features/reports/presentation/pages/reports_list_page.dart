import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/search_bar_widget.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for managing inspection reports
class ReportsListPage extends HookConsumerWidget {
  const ReportsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedFilter = useState<String>('all');
    final selectedDateRange = useState<String>('all');
    final viewMode = useState<String>('grid'); // 'grid' or 'list'
    
    // Mock data
    final reports = _getMockReports();
    final filteredReports = useMemoized(() {
      return reports.where((report) {
        final matchesSearch = searchController.text.isEmpty ||
            report['title'].toLowerCase().contains(searchController.text.toLowerCase()) ||
            report['description'].toLowerCase().contains(searchController.text.toLowerCase());
        
        final matchesFilter = selectedFilter.value == 'all' ||
            report['type'] == selectedFilter.value;
        
        return matchesSearch && matchesFilter;
      }).toList();
    }, [searchController.text, selectedFilter.value, reports]);

    return ResponsiveScaffold(
      title: 'Reports',
      actions: [
        IconButton(
          icon: Icon(viewMode.value == 'grid' ? Icons.list : Icons.grid_view),
          onPressed: () {
            viewMode.value = viewMode.value == 'grid' ? 'list' : 'grid';
          },
          tooltip: 'Toggle view mode',
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/reports/generate'),
        icon: const Icon(Icons.add),
        label: const Text('Generate Report'),
      ),
      body: Column(
        children: [
          _buildHeader(context, theme, colorScheme),
          _buildFilters(
            context,
            theme,
            colorScheme,
            searchController,
            selectedFilter,
            selectedDateRange,
          ),
          _buildStatsCards(context, theme, colorScheme, reports),
          Expanded(
            child: _buildReportsList(
              context,
              theme,
              colorScheme,
              filteredReports,
              viewMode.value,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
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
          Text(
            'Inspection Reports',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Generate, view, and manage inspection reports',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController searchController,
    ValueNotifier<String> selectedFilter,
    ValueNotifier<String> selectedDateRange,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          SearchBarWidget(
            controller: searchController,
            hintText: 'Search reports...',
            onChanged: (value) {
              // Trigger rebuild through controller
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: selectedFilter.value,
                  decoration: const InputDecoration(
                    labelText: 'Report Type',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: 'all',
                      child: Text('All Types'),
                    ),
                    const DropdownMenuItem(
                      value: 'summary',
                      child: Text('Summary Reports'),
                    ),
                    const DropdownMenuItem(
                      value: 'detailed',
                      child: Text('Detailed Reports'),
                    ),
                    const DropdownMenuItem(
                      value: 'analytics',
                      child: Text('Analytics Reports'),
                    ),
                    const DropdownMenuItem(
                      value: 'compliance',
                      child: Text('Compliance Reports'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      selectedFilter.value = value;
                    }
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: selectedDateRange.value,
                  decoration: const InputDecoration(
                    labelText: 'Date Range',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: 'all',
                      child: Text('All Time'),
                    ),
                    const DropdownMenuItem(
                      value: 'today',
                      child: Text('Today'),
                    ),
                    const DropdownMenuItem(
                      value: 'week',
                      child: Text('This Week'),
                    ),
                    const DropdownMenuItem(
                      value: 'month',
                      child: Text('This Month'),
                    ),
                    const DropdownMenuItem(
                      value: 'quarter',
                      child: Text('This Quarter'),
                    ),
                    const DropdownMenuItem(
                      value: 'year',
                      child: Text('This Year'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      selectedDateRange.value = value;
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
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> reports,
  ) {
    final totalReports = reports.length;
    final recentReports = reports.where((r) => r['isRecent'] == true).length;
    final sharedReports = reports.where((r) => r['isShared'] == true).length;
    final scheduledReports = reports.where((r) => r['isScheduled'] == true).length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              'Total Reports',
              totalReports.toString(),
              Icons.description,
              colorScheme.primary,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatCard(
              'Recent',
              recentReports.toString(),
              Icons.schedule,
              Colors.blue,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatCard(
              'Shared',
              sharedReports.toString(),
              Icons.share,
              Colors.green,
              theme,
              colorScheme,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatCard(
              'Scheduled',
              scheduledReports.toString(),
              Icons.event,
              Colors.orange,
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
                const SizedBox(width: 8),
                Text(
                  title,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
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
    List<Map<String, dynamic>> reports,
    String viewMode,
  ) {
    if (reports.isEmpty) {
      return _buildEmptyState(theme, colorScheme);
    }

    if (viewMode == 'grid') {
      return _buildGridView(context, theme, colorScheme, reports);
    } else {
      return _buildListView(context, theme, colorScheme, reports);
    }
  }

  Widget _buildEmptyState(
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.description,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No reports found',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Generate your first report to get started',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Generate Report',
            onPressed: () => context.go('/reports/generate'),
            icon: Icons.add,
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> reports,
  ) {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: reports.length,
      itemBuilder: (context, index) {
        final report = reports[index];
        return _buildReportCard(context, theme, colorScheme, report);
      },
    );
  }

  Widget _buildListView(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    List<Map<String, dynamic>> reports,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: reports.length,
      itemBuilder: (context, index) {
        final report = reports[index];
        return _buildReportListTile(context, theme, colorScheme, report);
      },
    );
  }

  Widget _buildReportCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.go('/reports/${report['id']}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    _getReportTypeColor(report['type']).withOpacity(0.8),
                    _getReportTypeColor(report['type']),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Icon(
                      _getReportTypeIcon(report['type']),
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: PopupMenuButton<String>(
                      icon: const Icon(
                        Icons.more_vert,
                        color: Colors.white,
                      ),
                      onSelected: (value) => _handleReportAction(context, value, report),
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'view',
                          child: ListTile(
                            leading: Icon(Icons.visibility),
                            title: Text('View'),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'download',
                          child: ListTile(
                            leading: Icon(Icons.download),
                            title: Text('Download'),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'share',
                          child: ListTile(
                            leading: Icon(Icons.share),
                            title: Text('Share'),
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
                          value: 'delete',
                          child: ListTile(
                            leading: Icon(Icons.delete, color: Colors.red),
                            title: Text('Delete', style: TextStyle(color: Colors.red)),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ],
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
                      report['title'],
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      report['description'],
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
                          Icons.calendar_today,
                          size: 12,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          report['createdAt'],
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: _getReportTypeColor(report['type']).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _getReportTypeLabel(report['type']),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: _getReportTypeColor(report['type']),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const Spacer(),
                        if (report['isShared'] == true)
                          Icon(
                            Icons.share,
                            size: 16,
                            color: colorScheme.primary,
                          ),
                        if (report['isScheduled'] == true)
                          Icon(
                            Icons.schedule,
                            size: 16,
                            color: Colors.orange,
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

  Widget _buildReportListTile(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getReportTypeColor(report['type']),
          child: Icon(
            _getReportTypeIcon(report['type']),
            color: Colors.white,
          ),
        ),
        title: Text(
          report['title'],
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              report['description'],
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _getReportTypeColor(report['type']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _getReportTypeLabel(report['type']),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: _getReportTypeColor(report['type']),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  report['createdAt'],
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const Spacer(),
                if (report['isShared'] == true)
                  Icon(
                    Icons.share,
                    size: 16,
                    color: colorScheme.primary,
                  ),
                if (report['isScheduled'] == true)
                  Icon(
                    Icons.schedule,
                    size: 16,
                    color: Colors.orange,
                  ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) => _handleReportAction(context, value, report),
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: ListTile(
                leading: Icon(Icons.visibility),
                title: Text('View'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'download',
              child: ListTile(
                leading: Icon(Icons.download),
                title: Text('Download'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'share',
              child: ListTile(
                leading: Icon(Icons.share),
                title: Text('Share'),
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
              value: 'delete',
              child: ListTile(
                leading: Icon(Icons.delete, color: Colors.red),
                title: Text('Delete', style: TextStyle(color: Colors.red)),
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ],
        ),
        onTap: () => context.go('/reports/${report['id']}'),
      ),
    );
  }

  Color _getReportTypeColor(String type) {
    switch (type) {
      case 'summary':
        return Colors.blue;
      case 'detailed':
        return Colors.green;
      case 'analytics':
        return Colors.purple;
      case 'compliance':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getReportTypeIcon(String type) {
    switch (type) {
      case 'summary':
        return Icons.summarize;
      case 'detailed':
        return Icons.description;
      case 'analytics':
        return Icons.analytics;
      case 'compliance':
        return Icons.gavel;
      default:
        return Icons.description;
    }
  }

  String _getReportTypeLabel(String type) {
    switch (type) {
      case 'summary':
        return 'Summary';
      case 'detailed':
        return 'Detailed';
      case 'analytics':
        return 'Analytics';
      case 'compliance':
        return 'Compliance';
      default:
        return 'Report';
    }
  }

  void _handleReportAction(
    BuildContext context,
    String action,
    Map<String, dynamic> report,
  ) {
    switch (action) {
      case 'view':
        context.go('/reports/${report['id']}');
        break;
      case 'download':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Downloading ${report['title']}...'),
          ),
        );
        break;
      case 'share':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sharing ${report['title']}...'),
          ),
        );
        break;
      case 'duplicate':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Duplicating ${report['title']}...'),
          ),
        );
        break;
      case 'delete':
        _showDeleteConfirmation(context, report);
        break;
    }
  }

  void _showDeleteConfirmation(
    BuildContext context,
    Map<String, dynamic> report,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Report'),
        content: Text(
          'Are you sure you want to delete "${report['title']}"? This action cannot be undone.',
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
                  content: Text('${report['title']} deleted'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getMockReports() {
    return [
      {
        'id': 'RPT001',
        'title': 'Monthly Safety Summary',
        'description': 'Comprehensive safety inspection summary for March 2024',
        'type': 'summary',
        'createdAt': 'Mar 15, 2024',
        'isRecent': true,
        'isShared': true,
        'isScheduled': false,
      },
      {
        'id': 'RPT002',
        'title': 'Equipment Maintenance Report',
        'description': 'Detailed maintenance inspection results and recommendations',
        'type': 'detailed',
        'createdAt': 'Mar 14, 2024',
        'isRecent': true,
        'isShared': false,
        'isScheduled': true,
      },
      {
        'id': 'RPT003',
        'title': 'Compliance Analytics Dashboard',
        'description': 'Analytics report showing compliance trends and metrics',
        'type': 'analytics',
        'createdAt': 'Mar 13, 2024',
        'isRecent': true,
        'isShared': true,
        'isScheduled': false,
      },
      {
        'id': 'RPT004',
        'title': 'OSHA Compliance Report',
        'description': 'Regulatory compliance report for OSHA requirements',
        'type': 'compliance',
        'createdAt': 'Mar 12, 2024',
        'isRecent': false,
        'isShared': false,
        'isScheduled': true,
      },
      {
        'id': 'RPT005',
        'title': 'Weekly Inspection Summary',
        'description': 'Summary of all inspections completed this week',
        'type': 'summary',
        'createdAt': 'Mar 11, 2024',
        'isRecent': false,
        'isShared': true,
        'isScheduled': false,
      },
      {
        'id': 'RPT006',
        'title': 'Asset Performance Analysis',
        'description': 'Detailed analysis of asset performance and maintenance needs',
        'type': 'analytics',
        'createdAt': 'Mar 10, 2024',
        'isRecent': false,
        'isShared': false,
        'isScheduled': false,
      },
    ];
  }
}