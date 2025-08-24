import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../shared/widgets/responsive_scaffold.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../app/router/app_router.dart';
import '../providers/inspection_provider.dart';
import '../widgets/dynamic_form_widget.dart';
import '../../domain/entities/inspection.dart';

/// Page displaying detailed view of a specific inspection
class InspectionDetailPage extends HookConsumerWidget {
  final String inspectionId;

  const InspectionDetailPage({
    super.key,
    required this.inspectionId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    // Watch inspection detail
    final inspectionAsync = ref.watch(inspectionDetailProvider(inspectionId));
    final inspectionsNotifier = ref.read(inspectionsNotifierProvider.notifier);
    
    return ResponsiveScaffold(
      title: 'Inspection Details',
      actions: [
        inspectionAsync.when(
          data: (inspection) => inspection != null && inspection.status != InspectionStatus.completed
              ? IconButton(
                  onPressed: () {
                    context.push('/inspections/$inspectionId/edit');
                  },
                  icon: const Icon(Icons.edit),
                  tooltip: 'Edit Inspection',
                )
              : const SizedBox.shrink(),
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
        ),
        PopupMenuButton<String>(
          onSelected: (value) async {
            switch (value) {
              case 'duplicate':
                await _duplicateInspection(context, ref, inspectionId);
                break;
              case 'export':
                await _exportInspection(context, inspectionId);
                break;
              case 'delete':
                await _deleteInspection(context, ref, inspectionId);
                break;
            }
          },
          itemBuilder: (context) => [
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
                title: Text('Export PDF'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuDivider(),
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
      body: inspectionAsync.when(
        data: (inspection) {
          if (inspection == null) {
            return const Center(
              child: Text('Inspection not found'),
            );
          }
          
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInspectionHeader(theme, colorScheme, inspection),
                const SizedBox(height: 24),
                _buildInspectionDetails(theme, colorScheme, inspection),
                const SizedBox(height: 24),
                _buildFormSection(inspection),
              ],
            ),
          );
        },
        loading: () => const LoadingWidget(
          message: 'Loading inspection details...',
        ),
        error: (error, stackTrace) => ErrorDisplayWidget(
          error: error.toString(),
          onRetry: () {
            ref.invalidate(inspectionDetailProvider(inspectionId));
          },
        ),
      ),
    );
  }

  Widget _buildNotFoundState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'Inspection not found',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'The inspection you\'re looking for doesn\'t exist or has been deleted.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          CustomButton(
            onPressed: () {
              context.goNamed(AppRoutes.inspections);
            },
            text: 'Back to Inspections',
            variant: ButtonVariant.outline,
          ),
        ],
      ),
    );
  }

  Widget _buildInspectionContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeaderCard(theme, colorScheme, inspection),
          const SizedBox(height: 16),
          _buildAssetCard(theme, colorScheme, inspection),
          const SizedBox(height: 16),
          _buildInspectorCard(theme, colorScheme, inspection),
          const SizedBox(height: 16),
          _buildResponsesCard(theme, colorScheme, inspection),
          if (inspection.photos.isNotEmpty) ..[
            const SizedBox(height: 16),
            _buildPhotosCard(theme, colorScheme, inspection),
          ],
          if (inspection.signature != null) ..[
            const SizedBox(height: 16),
            _buildSignatureCard(theme, colorScheme, inspection),
          ],
          const SizedBox(height: 24),
          _buildActionButtons(context, theme, colorScheme, inspection),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    inspection.title,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                _buildStatusChip(theme, colorScheme, inspection.status),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.calendar_today_outlined,
                  size: 16,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Text(
                  'Created: ${_formatDateTime(inspection.createdAt)}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            if (inspection.completedAt != null) ..[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Completed: ${_formatDateTime(inspection.completedAt!)}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
            if (inspection.score != null) ..[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.star,
                    size: 20,
                    color: _getScoreColor(inspection.score!, colorScheme),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Score: ${inspection.score}%',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: _getScoreColor(inspection.score!, colorScheme),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAssetCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Asset Information',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
              theme,
              colorScheme,
              Icons.precision_manufacturing,
              'Asset Name',
              inspection.assetName,
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              theme,
              colorScheme,
              Icons.qr_code,
              'Asset ID',
              inspection.assetId,
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              theme,
              colorScheme,
              Icons.location_on_outlined,
              'Location',
              inspection.location,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInspectorCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Inspector Information',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
              theme,
              colorScheme,
              Icons.person_outline,
              'Inspector',
              inspection.inspectorName,
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              theme,
              colorScheme,
              Icons.email_outlined,
              'Email',
              inspection.inspectorEmail,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResponsesCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Inspection Responses',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...inspection.responses.map((response) => 
              _buildResponseItem(theme, colorScheme, response)
            ).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildResponseItem(
    ThemeData theme,
    ColorScheme colorScheme,
    MockResponse response,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            response.question,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            response.answer,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          if (response.notes != null) ..[
            const SizedBox(height: 4),
            Text(
              'Notes: ${response.notes}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPhotosCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Photos (${inspection.photos.length})',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 1,
              ),
              itemCount: inspection.photos.length,
              itemBuilder: (context, index) {
                return Container(
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceVariant,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.image),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignatureCard(
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Inspector Signature',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              height: 100,
              width: double.infinity,
              decoration: BoxDecoration(
                color: colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: colorScheme.outline,
                  width: 1,
                ),
              ),
              child: const Center(
                child: Icon(Icons.draw),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    MockInspectionDetail inspection,
  ) {
    return Row(
      children: [
        if (inspection.status == InspectionStatus.completed)
          Expanded(
            child: CustomButton(
              onPressed: () {
                _submitInspection(context);
              },
              text: 'Submit Inspection',
              icon: Icons.upload,
            ),
          ),
        if (inspection.status == InspectionStatus.draft ||
            inspection.status == InspectionStatus.inProgress) ..[
          Expanded(
            child: CustomButton(
              onPressed: () {
                context.pushNamed(
                  AppRoutes.inspectionEdit,
                  pathParameters: {'id': inspectionId},
                );
              },
              text: 'Continue Inspection',
              icon: Icons.edit,
            ),
          ),
        ],
        if (inspection.status == InspectionStatus.submitted) ..[
          Expanded(
            child: CustomButton(
              onPressed: () {
                _exportInspection(context);
              },
              text: 'Export PDF',
              icon: Icons.download,
              variant: ButtonVariant.outline,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoRow(
    ThemeData theme,
    ColorScheme colorScheme,
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusChip(
    ThemeData theme,
    ColorScheme colorScheme,
    InspectionStatus status,
  ) {
    Color backgroundColor;
    Color textColor;
    IconData icon;

    switch (status) {
      case InspectionStatus.draft:
        backgroundColor = colorScheme.surfaceVariant;
        textColor = colorScheme.onSurfaceVariant;
        icon = Icons.edit_outlined;
        break;
      case InspectionStatus.inProgress:
        backgroundColor = colorScheme.primaryContainer;
        textColor = colorScheme.onPrimaryContainer;
        icon = Icons.play_arrow_outlined;
        break;
      case InspectionStatus.completed:
        backgroundColor = colorScheme.tertiaryContainer;
        textColor = colorScheme.onTertiaryContainer;
        icon = Icons.check_circle_outline;
        break;
      case InspectionStatus.submitted:
        backgroundColor = colorScheme.secondaryContainer;
        textColor = colorScheme.onSecondaryContainer;
        icon = Icons.upload_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: textColor,
          ),
          const SizedBox(width: 4),
          Text(
            status.displayName,
            style: theme.textTheme.labelMedium?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(int score, ColorScheme colorScheme) {
    if (score >= 90) {
      return Colors.green;
    } else if (score >= 70) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  void _duplicateInspection(BuildContext context) {
    // TODO: Implement duplication logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Inspection duplicated')),
    );
  }

  void _exportInspection(BuildContext context) {
    // TODO: Implement export logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Exporting inspection...')),
    );
  }

  void _deleteInspection(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Inspection'),
        content: const Text(
          'Are you sure you want to delete this inspection? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.goNamed(AppRoutes.inspections);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Inspection deleted')),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _submitInspection(BuildContext context) {
    // TODO: Implement submission logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Inspection submitted')),
    );
  }

  MockInspectionDetail? _getMockInspection() {
    // Mock data - replace with actual data fetching
    return MockInspectionDetail(
      id: inspectionId,
      title: 'Monthly Safety Inspection',
      assetName: 'Forklift #001',
      assetId: 'FL-001',
      location: 'Warehouse A - Section 3',
      inspectorName: 'John Smith',
      inspectorEmail: 'john.smith@company.com',
      status: InspectionStatus.completed,
      score: 95,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      completedAt: DateTime.now().subtract(const Duration(hours: 2)),
      responses: [
        MockResponse(
          question: 'Are all safety guards in place?',
          answer: 'Yes',
          notes: 'All guards properly secured',
        ),
        MockResponse(
          question: 'Is the equipment clean and well-maintained?',
          answer: 'Yes',
        ),
        MockResponse(
          question: 'Any visible damage or wear?',
          answer: 'No',
          notes: 'Minor scratches on left side panel',
        ),
      ],
      photos: ['photo1.jpg', 'photo2.jpg'],
      signature: 'signature_data',
    );
  }
}

// Mock data classes
class MockInspectionDetail {
  final String id;
  final String title;
  final String assetName;
  final String assetId;
  final String location;
  final String inspectorName;
  final String inspectorEmail;
  final InspectionStatus status;
  final int? score;
  final DateTime createdAt;
  final DateTime? completedAt;
  final List<MockResponse> responses;
  final List<String> photos;
  final String? signature;

  MockInspectionDetail({
    required this.id,
    required this.title,
    required this.assetName,
    required this.assetId,
    required this.location,
    required this.inspectorName,
    required this.inspectorEmail,
    required this.status,
    this.score,
    required this.createdAt,
    this.completedAt,
    required this.responses,
    required this.photos,
    this.signature,
  });
}

class MockResponse {
  final String question;
  final String answer;
  final String? notes;

  MockResponse({
    required this.question,
    required this.answer,
    this.notes,
  });
}

enum InspectionStatus {
  draft,
  inProgress,
  completed,
  submitted;

  String get displayName {
    switch (this) {
      case InspectionStatus.draft:
        return 'Draft';
      case InspectionStatus.inProgress:
        return 'In Progress';
      case InspectionStatus.completed:
        return 'Completed';
      case InspectionStatus.submitted:
        return 'Submitted';
    }
  }
}