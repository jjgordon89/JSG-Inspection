import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/inspection.dart';
import '../providers/inspection_provider.dart';
import '../widgets/inspection_card.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';

/// Page displaying list of inspections with filtering and search
class InspectionsListPage extends HookConsumerWidget {
  const InspectionsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final searchController = useTextEditingController();
    final selectedFilter = useState<InspectionFilter>(InspectionFilter.all);
    final searchQuery = useState<String>('');
    final isLoading = useState(false);
    
    // Watch inspections state
    final inspectionsAsync = ref.watch(inspectionsNotifierProvider);
    
    // Search inspections when query changes
    final searchResults = ref.watch(
      searchInspectionsProvider(
        searchQuery.value.isEmpty ? null : searchQuery.value,
      ),
    );

    useEffect(() {
      void onSearchChanged() {
        searchQuery.value = searchController.text;
      }
      
      searchController.addListener(onSearchChanged);
      return () => searchController.removeListener(onSearchChanged);
    }, [searchController]);

    return ResponsiveScaffold(
      title: 'Inspections',
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () {
            ref.read(inspectionsNotifierProvider.notifier).refreshInspections();
          },
          tooltip: 'Refresh inspections',
        ),
        IconButton(
          icon: const Icon(Icons.sync),
          onPressed: () {
            ref.read(inspectionsNotifierProvider.notifier).syncInspections();
          },
          tooltip: 'Sync inspections',
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.pushNamed(AppRoutes.inspectionCreate);
        },
        icon: const Icon(Icons.add),
        label: const Text('New Inspection'),
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: searchController,
                decoration: InputDecoration(
                  hintText: 'Search inspections...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: searchQuery.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            searchController.clear();
                            searchQuery.value = '';
                          },
                        )
                      : null,
                  border: const OutlineInputBorder(),
                ),
              ),
            ),
            _buildFilterChips(context, theme, selectedFilter),
            Expanded(
              child: _buildInspectionsList(context, theme, colorScheme, inspectionsAsync, searchResults, searchQuery, selectedFilter),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips(
    BuildContext context,
    ThemeData theme,
    ValueNotifier<InspectionFilter> selectedFilter,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: InspectionFilter.values.map((filter) {
            final isSelected = selectedFilter.value == filter;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(filter.displayName),
                selected: isSelected,
                onSelected: (selected) {
                  selectedFilter.value = filter;
                },
                showCheckmark: false,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildInspectionsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    AsyncValue<List<Inspection>> inspectionsAsync,
    AsyncValue<List<Inspection>> searchResults,
    ValueNotifier<String> searchQuery,
    ValueNotifier<InspectionFilter> selectedFilter,
  ) {
    return inspectionsAsync.when(
      data: (inspections) {
        final displayInspections = searchQuery.value.isNotEmpty
            ? searchResults.when(
                data: (results) => _getFilteredInspections(results, selectedFilter.value),
                loading: () => <Inspection>[],
                error: (_, __) => <Inspection>[],
              )
            : _getFilteredInspections(inspections, selectedFilter.value);

        if (displayInspections.isEmpty) {
          return _buildEmptyState(context, theme, colorScheme, searchQuery.value, selectedFilter.value);
        }

        return RefreshIndicator(
          onRefresh: () async {
            await ref.read(inspectionsNotifierProvider.notifier).refreshInspections();
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: displayInspections.length,
            itemBuilder: (context, index) {
              final inspection = displayInspections[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: InspectionCard(
                  inspection: inspection,
                  onTap: () {
                    context.pushNamed(
                      AppRoutes.inspectionDetail,
                      pathParameters: {'id': inspection.id},
                    );
                  },
                  onEdit: () {
                    context.pushNamed(
                      AppRoutes.inspectionEdit,
                      pathParameters: {'id': inspection.id},
                    );
                  },
                  onDelete: () async {
                    final confirmed = await _showDeleteConfirmation(context);
                    if (confirmed) {
                      await ref
                          .read(inspectionsNotifierProvider.notifier)
                          .deleteInspection(inspection.id);
                    }
                  },
                ),
              );
            },
          ),
        );
      },
      loading: () => const LoadingWidget(
        message: 'Loading inspections...',
      ),
      error: (error, stackTrace) => ErrorDisplayWidget(
        error: error.toString(),
        onRetry: () {
          ref.read(inspectionsNotifierProvider.notifier).refreshInspections();
        },
      ),
    );
  }

  List<Inspection> _getFilteredInspections(List<Inspection> inspections, InspectionFilter filter) {
    if (filter == InspectionFilter.all) return inspections;
    
    final statusMap = {
      InspectionFilter.draft: InspectionStatus.draft,
      InspectionFilter.inProgress: InspectionStatus.inProgress,
      InspectionFilter.completed: InspectionStatus.completed,
      InspectionFilter.submitted: InspectionStatus.submitted,
    };
    
    final targetStatus = statusMap[filter];
    if (targetStatus == null) return inspections;
    
    return inspections.where((i) => i.status == targetStatus).toList();
  }

  Widget _buildEmptyState(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    String searchQuery,
    InspectionFilter selectedFilter,
  ) {
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
            searchQuery.isNotEmpty
                ? 'No inspections found for "$searchQuery"'
                : selectedFilter != InspectionFilter.all
                    ? 'No ${selectedFilter.displayName.toLowerCase()} inspections'
                    : 'No inspections found',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first inspection to get started',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          CustomButton(
            onPressed: () {
              context.pushNamed(AppRoutes.inspectionCreate);
            },
            text: 'Create Inspection',
            icon: Icons.add,
          ),
        ],
      ),
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
            pathParameters: {'id': inspection.id},
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
                        const SizedBox(height: 4),
                        Text(
                          inspection.assetName,
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
                    Icons.person_outline,
                    size: 16,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    inspection.inspectorName,
                    style: theme.textTheme.bodySmall?.copyWith(
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
                    _formatDate(inspection.createdAt),
                    style: theme.textTheme.bodySmall?.copyWith(
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: textColor,
          ),
          const SizedBox(width: 4),
          Text(
            status.displayName,
            style: theme.textTheme.labelSmall?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  Future<bool> _showDeleteConfirmation(BuildContext context) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Inspection'),
        content: const Text(
          'Are you sure you want to delete this inspection? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    ) ?? false;
  }
}

enum InspectionFilter {
  all,
  draft,
  inProgress,
  completed,
  submitted;

  String get displayName {
    switch (this) {
      case InspectionFilter.all:
        return 'All';
      case InspectionFilter.draft:
        return 'Draft';
      case InspectionFilter.inProgress:
        return 'In Progress';
      case InspectionFilter.completed:
        return 'Completed';
      case InspectionFilter.submitted:
        return 'Submitted';
    }
  }
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