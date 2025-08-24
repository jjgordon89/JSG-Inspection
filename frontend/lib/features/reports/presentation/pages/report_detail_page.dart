import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for viewing detailed report information
class ReportDetailPage extends HookConsumerWidget {
  final String reportId;

  const ReportDetailPage({
    super.key,
    required this.reportId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final selectedTab = useState<int>(0);
    
    // Mock data - in real app, this would come from a provider
    final report = _getMockReport(reportId);
    
    if (report == null) {
      return ResponsiveScaffold(
        title: 'Report Not Found',
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
                'Report not found',
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'The requested report could not be found.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Back to Reports',
                onPressed: () => context.go('/reports'),
              ),
            ],
          ),
        ),
      );
    }

    return ResponsiveScaffold(
      title: report['title'],
      actions: [
        IconButton(
          icon: const Icon(Icons.download),
          onPressed: () => _downloadReport(context, report),
          tooltip: 'Download Report',
        ),
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () => _shareReport(context, report),
          tooltip: 'Share Report',
        ),
        PopupMenuButton<String>(
          onSelected: (value) => _handleAction(context, value, report),
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'edit',
              child: ListTile(
                leading: Icon(Icons.edit),
                title: Text('Edit Report'),
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
                leading: Icon(Icons.file_download),
                title: Text('Export'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'schedule',
              child: ListTile(
                leading: Icon(Icons.schedule),
                title: Text('Schedule'),
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
      body: Column(
        children: [
          _buildHeader(context, theme, colorScheme, report),
          _buildTabBar(context, theme, colorScheme, selectedTab),
          Expanded(
            child: _buildTabContent(context, theme, colorScheme, report, selectedTab.value),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _getReportTypeColor(report['type']),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getReportTypeIcon(report['type']),
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report['title'],
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      report['description'],
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
                  color: _getReportTypeColor(report['type']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  _getReportTypeLabel(report['type']),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: _getReportTypeColor(report['type']),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildInfoChip(
                Icons.calendar_today,
                'Created',
                report['createdAt'],
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoChip(
                Icons.person,
                'Generated by',
                report['generatedBy'],
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoChip(
                Icons.folder,
                'Project',
                report['project'],
                theme,
                colorScheme,
              ),
              const SizedBox(width: 16),
              _buildInfoChip(
                Icons.schedule,
                'Period',
                report['period'],
                theme,
                colorScheme,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(
    IconData icon,
    String label,
    String value,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontSize: 10,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar(
    BuildContext context,
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
        controller: useTabController(initialLength: 4),
        onTap: (index) => selectedTab.value = index,
        tabs: const [
          Tab(
            icon: Icon(Icons.summarize),
            text: 'Summary',
          ),
          Tab(
            icon: Icon(Icons.analytics),
            text: 'Data',
          ),
          Tab(
            icon: Icon(Icons.photo_library),
            text: 'Media',
          ),
          Tab(
            icon: Icon(Icons.settings),
            text: 'Settings',
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
    int selectedTab,
  ) {
    switch (selectedTab) {
      case 0:
        return _buildSummaryTab(context, theme, colorScheme, report);
      case 1:
        return _buildDataTab(context, theme, colorScheme, report);
      case 2:
        return _buildMediaTab(context, theme, colorScheme, report);
      case 3:
        return _buildSettingsTab(context, theme, colorScheme, report);
      default:
        return _buildSummaryTab(context, theme, colorScheme, report);
    }
  }

  Widget _buildSummaryTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCards(context, theme, colorScheme, report),
          const SizedBox(height: 24),
          _buildKeyFindings(context, theme, colorScheme, report),
          const SizedBox(height: 24),
          _buildRecommendations(context, theme, colorScheme, report),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    final summary = report['summary'] as Map<String, dynamic>;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Summary Overview',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Total Inspections',
                summary['totalInspections'].toString(),
                Icons.assignment,
                Colors.blue,
                theme,
                colorScheme,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSummaryCard(
                'Passed',
                summary['passed'].toString(),
                Icons.check_circle,
                Colors.green,
                theme,
                colorScheme,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSummaryCard(
                'Failed',
                summary['failed'].toString(),
                Icons.error,
                Colors.red,
                theme,
                colorScheme,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSummaryCard(
                'Pending',
                summary['pending'].toString(),
                Icons.pending,
                Colors.orange,
                theme,
                colorScheme,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(
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
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKeyFindings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    final findings = report['keyFindings'] as List<Map<String, dynamic>>;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Key Findings',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...findings.map((finding) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getSeverityColor(finding['severity']),
              child: Icon(
                _getSeverityIcon(finding['severity']),
                color: Colors.white,
                size: 20,
              ),
            ),
            title: Text(
              finding['title'],
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Text(finding['description']),
            trailing: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: _getSeverityColor(finding['severity']).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                finding['severity'].toUpperCase(),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: _getSeverityColor(finding['severity']),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildRecommendations(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    final recommendations = report['recommendations'] as List<String>;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recommendations',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...recommendations.asMap().entries.map((entry) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 6),
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: colorScheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  entry.value,
                  style: theme.textTheme.bodyMedium,
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildDataTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Report Data',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Data visualization and detailed metrics would be displayed here.',
                    style: theme.textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'This could include:',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('• Charts and graphs\n• Detailed statistics\n• Trend analysis\n• Comparative data'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMediaTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Media Gallery',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Photos, videos, and other media from inspections would be displayed here.',
                    style: theme.textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Features would include:',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('• Photo gallery\n• Video playback\n• Document attachments\n• Media annotations'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTab(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> report,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Report Settings',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Report configuration and sharing settings would be displayed here.',
                    style: theme.textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Settings would include:',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('• Sharing permissions\n• Export formats\n• Scheduling options\n• Notification settings'),
                ],
              ),
            ),
          ),
        ],
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
        return 'Summary Report';
      case 'detailed':
        return 'Detailed Report';
      case 'analytics':
        return 'Analytics Report';
      case 'compliance':
        return 'Compliance Report';
      default:
        return 'Report';
    }
  }

  Color _getSeverityColor(String severity) {
    switch (severity.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.yellow;
      case 'info':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _getSeverityIcon(String severity) {
    switch (severity.toLowerCase()) {
      case 'high':
        return Icons.error;
      case 'medium':
        return Icons.warning;
      case 'low':
        return Icons.info;
      case 'info':
        return Icons.info_outline;
      default:
        return Icons.help;
    }
  }

  void _downloadReport(BuildContext context, Map<String, dynamic> report) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Downloading ${report['title']}...'),
        action: SnackBarAction(
          label: 'View',
          onPressed: () {
            // Open download location
          },
        ),
      ),
    );
  }

  void _shareReport(BuildContext context, Map<String, dynamic> report) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Share Report'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.email),
              title: const Text('Email'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening email...')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.link),
              title: const Text('Copy Link'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Link copied to clipboard')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.qr_code),
              title: const Text('QR Code'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Generating QR code...')),
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _handleAction(
    BuildContext context,
    String action,
    Map<String, dynamic> report,
  ) {
    switch (action) {
      case 'edit':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Editing ${report['title']}...')),
        );
        break;
      case 'duplicate':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Duplicating ${report['title']}...')),
        );
        break;
      case 'export':
        _showExportDialog(context, report);
        break;
      case 'schedule':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Scheduling ${report['title']}...')),
        );
        break;
      case 'delete':
        _showDeleteConfirmation(context, report);
        break;
    }
  }

  void _showExportDialog(BuildContext context, Map<String, dynamic> report) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Export Report'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: const Text('PDF'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Exporting as PDF...')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.table_chart),
              title: const Text('Excel'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Exporting as Excel...')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.code),
              title: const Text('CSV'),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Exporting as CSV...')),
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
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
              context.go('/reports');
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

  Map<String, dynamic>? _getMockReport(String reportId) {
    final reports = {
      'RPT001': {
        'id': 'RPT001',
        'title': 'Monthly Safety Summary',
        'description': 'Comprehensive safety inspection summary for March 2024',
        'type': 'summary',
        'createdAt': 'Mar 15, 2024',
        'generatedBy': 'John Smith',
        'project': 'Manufacturing Plant A',
        'period': 'March 2024',
        'summary': {
          'totalInspections': 45,
          'passed': 38,
          'failed': 5,
          'pending': 2,
        },
        'keyFindings': [
          {
            'title': 'Safety Equipment Compliance',
            'description': 'All safety equipment meets current standards',
            'severity': 'info',
          },
          {
            'title': 'Maintenance Schedule Delays',
            'description': 'Some equipment maintenance is behind schedule',
            'severity': 'medium',
          },
          {
            'title': 'Emergency Exit Obstruction',
            'description': 'Emergency exit blocked in Building C',
            'severity': 'high',
          },
        ],
        'recommendations': [
          'Update maintenance schedule to prevent delays',
          'Clear emergency exit obstructions immediately',
          'Implement weekly safety equipment checks',
          'Provide additional safety training for new employees',
        ],
      },
      'RPT002': {
        'id': 'RPT002',
        'title': 'Equipment Maintenance Report',
        'description': 'Detailed maintenance inspection results and recommendations',
        'type': 'detailed',
        'createdAt': 'Mar 14, 2024',
        'generatedBy': 'Sarah Johnson',
        'project': 'Equipment Maintenance',
        'period': 'Q1 2024',
        'summary': {
          'totalInspections': 28,
          'passed': 22,
          'failed': 4,
          'pending': 2,
        },
        'keyFindings': [
          {
            'title': 'Hydraulic System Performance',
            'description': 'Hydraulic systems operating within normal parameters',
            'severity': 'info',
          },
          {
            'title': 'Belt Wear Detected',
            'description': 'Conveyor belt showing signs of wear',
            'severity': 'medium',
          },
        ],
        'recommendations': [
          'Replace conveyor belt within 30 days',
          'Increase hydraulic fluid monitoring frequency',
          'Schedule preventive maintenance for all equipment',
        ],
      },
    };
    
    return reports[reportId];
  }
}