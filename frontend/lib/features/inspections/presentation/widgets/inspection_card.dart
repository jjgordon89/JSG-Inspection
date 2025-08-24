import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/inspection.dart';
import '../../../../shared/widgets/status_chip.dart';
import '../../../../shared/widgets/priority_indicator.dart';
import '../../../../shared/utils/date_formatter.dart';
import '../../../../core/constants/app_colors.dart';

class InspectionCard extends HookConsumerWidget {
  final Inspection inspection;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final bool showActions;

  const InspectionCard({
    super.key,
    required this.inspection,
    this.onTap,
    this.onEdit,
    this.onDelete,
    this.showActions = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isHovered = useState(false);

    return MouseRegion(
      onEnter: (_) => isHovered.value = true,
      onExit: (_) => isHovered.value = false,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isHovered.value
                ? theme.colorScheme.primary.withOpacity(0.3)
                : theme.colorScheme.outline.withOpacity(0.2),
            width: isHovered.value ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: theme.shadowColor.withOpacity(isHovered.value ? 0.1 : 0.05),
              blurRadius: isHovered.value ? 8 : 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: InkWell(
          onTap: onTap ?? () => _navigateToDetail(context),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context, theme),
                const SizedBox(height: 12),
                _buildContent(context, theme),
                const SizedBox(height: 12),
                _buildFooter(context, theme),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Inspection #${inspection.id.substring(0, 8)}',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Asset: ${inspection.assetId}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            StatusChip(status: inspection.status.displayName),
            if (inspection.priority != null) ..[
              const SizedBox(height: 4),
              PriorityIndicator(priority: inspection.priority!),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildContent(BuildContext context, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (inspection.notes?.isNotEmpty == true) ..[
          Text(
            inspection.notes!,
            style: theme.textTheme.bodyMedium,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
        ],
        _buildProgressIndicator(context, theme),
      ],
    );
  }

  Widget _buildProgressIndicator(BuildContext context, ThemeData theme) {
    final progress = _calculateProgress();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progress',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: theme.colorScheme.surfaceVariant,
          valueColor: AlwaysStoppedAnimation<Color>(
            _getProgressColor(progress, theme),
          ),
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Created: ${DateFormatter.formatRelative(inspection.createdAt)}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              if (inspection.completedAt != null)
                Text(
                  'Completed: ${DateFormatter.formatRelative(inspection.completedAt!)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
            ],
          ),
        ),
        if (showActions) _buildActions(context, theme),
      ],
    );
  }

  Widget _buildActions(BuildContext context, ThemeData theme) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (inspection.status.isEditable) ..[
          IconButton(
            onPressed: onEdit ?? () => _navigateToEdit(context),
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Edit Inspection',
            style: IconButton.styleFrom(
              foregroundColor: theme.colorScheme.primary,
            ),
          ),
        ],
        IconButton(
          onPressed: () => _showDetailsBottomSheet(context),
          icon: const Icon(Icons.visibility_outlined),
          tooltip: 'View Details',
          style: IconButton.styleFrom(
            foregroundColor: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        if (inspection.status == InspectionStatus.draft) ..[
          IconButton(
            onPressed: onDelete ?? () => _showDeleteDialog(context),
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete Inspection',
            style: IconButton.styleFrom(
              foregroundColor: theme.colorScheme.error,
            ),
          ),
        ],
      ],
    );
  }

  double _calculateProgress() {
    if (inspection.status == InspectionStatus.completed) return 1.0;
    if (inspection.status == InspectionStatus.draft) return 0.0;
    
    // Calculate based on responses
    final totalQuestions = 10; // This should come from form template
    final answeredQuestions = inspection.responses.length;
    
    return answeredQuestions / totalQuestions;
  }

  Color _getProgressColor(double progress, ThemeData theme) {
    if (progress >= 0.8) return AppColors.success;
    if (progress >= 0.5) return AppColors.warning;
    return theme.colorScheme.primary;
  }

  void _navigateToDetail(BuildContext context) {
    context.push('/inspections/${inspection.id}');
  }

  void _navigateToEdit(BuildContext context) {
    context.push('/inspections/${inspection.id}/edit');
  }

  void _showDetailsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => InspectionDetailsBottomSheet(inspection: inspection),
    );
  }

  void _showDeleteDialog(BuildContext context) {
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
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              onDelete?.call();
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class InspectionDetailsBottomSheet extends StatelessWidget {
  final Inspection inspection;

  const InspectionDetailsBottomSheet({
    super.key,
    required this.inspection,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(
                      'Inspection Details',
                      style: theme.textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    _buildDetailRow('ID', inspection.id, theme),
                    _buildDetailRow('Status', inspection.status.displayName, theme),
                    _buildDetailRow('Asset', inspection.assetId, theme),
                    _buildDetailRow('Folder', inspection.folderId, theme),
                    _buildDetailRow('Inspector', inspection.inspectorId, theme),
                    if (inspection.priority != null)
                      _buildDetailRow('Priority', inspection.priority!.displayName, theme),
                    _buildDetailRow('Created', DateFormatter.formatFull(inspection.createdAt), theme),
                    if (inspection.startedAt != null)
                      _buildDetailRow('Started', DateFormatter.formatFull(inspection.startedAt!), theme),
                    if (inspection.completedAt != null)
                      _buildDetailRow('Completed', DateFormatter.formatFull(inspection.completedAt!), theme),
                    if (inspection.notes?.isNotEmpty == true) ..[
                      const SizedBox(height: 16),
                      Text(
                        'Notes',
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        inspection.notes!,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                    if (inspection.score != null) ..[
                      const SizedBox(height: 16),
                      _buildScoreSection(theme),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreSection(ThemeData theme) {
    final score = inspection.score!;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Score',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceVariant.withOpacity(0.5),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Score',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    '${score.totalScore.toStringAsFixed(1)}/${score.maxScore.toStringAsFixed(1)}',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: score.percentage / 100,
                backgroundColor: theme.colorScheme.surfaceVariant,
                valueColor: AlwaysStoppedAnimation<Color>(
                  score.percentage >= 80 ? AppColors.success :
                  score.percentage >= 60 ? AppColors.warning : AppColors.error,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${score.percentage.toStringAsFixed(1)}%',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}