import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for generating new reports
class GenerateReportPage extends HookConsumerWidget {
  const GenerateReportPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currentStep = useState<int>(0);
    final isGenerating = useState<bool>(false);
    
    // Form controllers
    final titleController = useTextEditingController();
    final descriptionController = useTextEditingController();
    
    // Form state
    final selectedReportType = useState<String>('summary');
    final selectedProjects = useState<List<String>>([]);
    final selectedDateRange = useState<DateTimeRange?>(
      DateTimeRange(
        start: DateTime.now().subtract(const Duration(days: 30)),
        end: DateTime.now(),
      ),
    );
    final selectedInspectors = useState<List<String>>([]);
    final selectedAssets = useState<List<String>>([]);
    final includePhotos = useState<bool>(true);
    final includeSignatures = useState<bool>(true);
    final includeRecommendations = useState<bool>(true);
    final autoSchedule = useState<bool>(false);
    final scheduleFrequency = useState<String>('monthly');
    
    final steps = [
      'Basic Information',
      'Data Selection',
      'Content Options',
      'Review & Generate',
    ];

    return ResponsiveScaffold(
      title: 'Generate Report',
      body: Column(
        children: [
          _buildStepIndicator(
            context,
            theme,
            colorScheme,
            currentStep.value,
            steps,
          ),
          Expanded(
            child: _buildStepContent(
              context,
              theme,
              colorScheme,
              currentStep.value,
              titleController,
              descriptionController,
              selectedReportType,
              selectedProjects,
              selectedDateRange,
              selectedInspectors,
              selectedAssets,
              includePhotos,
              includeSignatures,
              includeRecommendations,
              autoSchedule,
              scheduleFrequency,
            ),
          ),
          _buildNavigationButtons(
            context,
            theme,
            colorScheme,
            currentStep,
            steps.length,
            isGenerating,
            () => _generateReport(
              context,
              titleController.text,
              descriptionController.text,
              selectedReportType.value,
              selectedProjects.value,
              selectedDateRange.value,
              selectedInspectors.value,
              selectedAssets.value,
              includePhotos.value,
              includeSignatures.value,
              includeRecommendations.value,
              autoSchedule.value,
              scheduleFrequency.value,
              isGenerating,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    List<String> steps,
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
      child: Row(
        children: steps.asMap().entries.map((entry) {
          final index = entry.key;
          final step = entry.value;
          final isActive = index == currentStep;
          final isCompleted = index < currentStep;
          
          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? colorScheme.primary
                              : isActive
                                  ? colorScheme.primary
                                  : colorScheme.outline,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isCompleted
                              ? Icon(
                                  Icons.check,
                                  color: colorScheme.onPrimary,
                                  size: 16,
                                )
                              : Text(
                                  '${index + 1}',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isActive
                                        ? colorScheme.onPrimary
                                        : colorScheme.onSurface,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        step,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: isActive
                              ? colorScheme.primary
                              : colorScheme.onSurfaceVariant,
                          fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                if (index < steps.length - 1)
                  Container(
                    width: 40,
                    height: 2,
                    color: isCompleted
                        ? colorScheme.primary
                        : colorScheme.outline,
                  ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    TextEditingController titleController,
    TextEditingController descriptionController,
    ValueNotifier<String> selectedReportType,
    ValueNotifier<List<String>> selectedProjects,
    ValueNotifier<DateTimeRange?> selectedDateRange,
    ValueNotifier<List<String>> selectedInspectors,
    ValueNotifier<List<String>> selectedAssets,
    ValueNotifier<bool> includePhotos,
    ValueNotifier<bool> includeSignatures,
    ValueNotifier<bool> includeRecommendations,
    ValueNotifier<bool> autoSchedule,
    ValueNotifier<String> scheduleFrequency,
  ) {
    switch (currentStep) {
      case 0:
        return _buildBasicInformationStep(
          context,
          theme,
          colorScheme,
          titleController,
          descriptionController,
          selectedReportType,
        );
      case 1:
        return _buildDataSelectionStep(
          context,
          theme,
          colorScheme,
          selectedProjects,
          selectedDateRange,
          selectedInspectors,
          selectedAssets,
        );
      case 2:
        return _buildContentOptionsStep(
          context,
          theme,
          colorScheme,
          includePhotos,
          includeSignatures,
          includeRecommendations,
          autoSchedule,
          scheduleFrequency,
        );
      case 3:
        return _buildReviewStep(
          context,
          theme,
          colorScheme,
          titleController.text,
          descriptionController.text,
          selectedReportType.value,
          selectedProjects.value,
          selectedDateRange.value,
          selectedInspectors.value,
          selectedAssets.value,
          includePhotos.value,
          includeSignatures.value,
          includeRecommendations.value,
          autoSchedule.value,
          scheduleFrequency.value,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildBasicInformationStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController titleController,
    TextEditingController descriptionController,
    ValueNotifier<String> selectedReportType,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Provide basic information about the report you want to generate.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          CustomTextField(
            controller: titleController,
            label: 'Report Title',
            hint: 'Enter a descriptive title for your report',
            isRequired: true,
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: descriptionController,
            label: 'Description',
            hint: 'Provide a brief description of the report purpose',
            maxLines: 3,
          ),
          const SizedBox(height: 24),
          Text(
            'Report Type',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          ...[
            {
              'value': 'summary',
              'title': 'Summary Report',
              'description': 'High-level overview with key metrics and findings',
              'icon': Icons.summarize,
            },
            {
              'value': 'detailed',
              'title': 'Detailed Report',
              'description': 'Comprehensive report with all inspection data',
              'icon': Icons.description,
            },
            {
              'value': 'analytics',
              'title': 'Analytics Report',
              'description': 'Data analysis with trends and insights',
              'icon': Icons.analytics,
            },
            {
              'value': 'compliance',
              'title': 'Compliance Report',
              'description': 'Regulatory compliance and audit findings',
              'icon': Icons.gavel,
            },
          ].map((type) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: RadioListTile<String>(
              value: type['value'] as String,
              groupValue: selectedReportType.value,
              onChanged: (value) => selectedReportType.value = value!,
              title: Row(
                children: [
                  Icon(
                    type['icon'] as IconData,
                    color: colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    type['title'] as String,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(left: 36),
                child: Text(type['description'] as String),
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildDataSelectionStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<String>> selectedProjects,
    ValueNotifier<DateTimeRange?> selectedDateRange,
    ValueNotifier<List<String>> selectedInspectors,
    ValueNotifier<List<String>> selectedAssets,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Data Selection',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select the data sources and filters for your report.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          _buildProjectSelection(context, theme, colorScheme, selectedProjects),
          const SizedBox(height: 24),
          _buildDateRangeSelection(context, theme, colorScheme, selectedDateRange),
          const SizedBox(height: 24),
          _buildInspectorSelection(context, theme, colorScheme, selectedInspectors),
          const SizedBox(height: 24),
          _buildAssetSelection(context, theme, colorScheme, selectedAssets),
        ],
      ),
    );
  }

  Widget _buildProjectSelection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<String>> selectedProjects,
  ) {
    final projects = _getMockProjects();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Projects',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Select projects to include in the report',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: projects.map((project) => CheckboxListTile(
              value: selectedProjects.value.contains(project['id']),
              onChanged: (checked) {
                if (checked == true) {
                  selectedProjects.value = [
                    ...selectedProjects.value,
                    project['id'] as String,
                  ];
                } else {
                  selectedProjects.value = selectedProjects.value
                      .where((id) => id != project['id'])
                      .toList();
                }
              },
              title: Text(project['name'] as String),
              subtitle: Text(project['description'] as String),
            )).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildDateRangeSelection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<DateTimeRange?> selectedDateRange,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Date Range',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Select the date range for inspection data',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.date_range),
            title: Text(
              selectedDateRange.value != null
                  ? '${_formatDate(selectedDateRange.value!.start)} - ${_formatDate(selectedDateRange.value!.end)}'
                  : 'Select date range',
            ),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () async {
              final dateRange = await showDateRangePicker(
                context: context,
                firstDate: DateTime(2020),
                lastDate: DateTime.now(),
                initialDateRange: selectedDateRange.value,
              );
              if (dateRange != null) {
                selectedDateRange.value = dateRange;
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildInspectorSelection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<String>> selectedInspectors,
  ) {
    final inspectors = _getMockInspectors();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Inspectors',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Filter by specific inspectors (optional)',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: inspectors.map((inspector) => CheckboxListTile(
              value: selectedInspectors.value.contains(inspector['id']),
              onChanged: (checked) {
                if (checked == true) {
                  selectedInspectors.value = [
                    ...selectedInspectors.value,
                    inspector['id'] as String,
                  ];
                } else {
                  selectedInspectors.value = selectedInspectors.value
                      .where((id) => id != inspector['id'])
                      .toList();
                }
              },
              title: Text(inspector['name'] as String),
              subtitle: Text(inspector['role'] as String),
              secondary: CircleAvatar(
                child: Text(
                  (inspector['name'] as String).substring(0, 1),
                ),
              ),
            )).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildAssetSelection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<String>> selectedAssets,
  ) {
    final assets = _getMockAssets();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Assets',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Filter by specific assets (optional)',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: assets.take(5).map((asset) => CheckboxListTile(
              value: selectedAssets.value.contains(asset['id']),
              onChanged: (checked) {
                if (checked == true) {
                  selectedAssets.value = [
                    ...selectedAssets.value,
                    asset['id'] as String,
                  ];
                } else {
                  selectedAssets.value = selectedAssets.value
                      .where((id) => id != asset['id'])
                      .toList();
                }
              },
              title: Text(asset['name'] as String),
              subtitle: Text(asset['type'] as String),
            )).toList(),
          ),
        ),
        if (assets.length > 5)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: TextButton(
              onPressed: () {
                // Show full asset selection dialog
              },
              child: Text('View all ${assets.length} assets'),
            ),
          ),
      ],
    );
  }

  Widget _buildContentOptionsStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<bool> includePhotos,
    ValueNotifier<bool> includeSignatures,
    ValueNotifier<bool> includeRecommendations,
    ValueNotifier<bool> autoSchedule,
    ValueNotifier<String> scheduleFrequency,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Content Options',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Configure what content to include in your report.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Include in Report',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  value: includePhotos.value,
                  onChanged: (value) => includePhotos.value = value,
                  title: const Text('Photos'),
                  subtitle: const Text('Include inspection photos in the report'),
                  secondary: const Icon(Icons.photo_library),
                ),
                SwitchListTile(
                  value: includeSignatures.value,
                  onChanged: (value) => includeSignatures.value = value,
                  title: const Text('Signatures'),
                  subtitle: const Text('Include inspector signatures'),
                  secondary: const Icon(Icons.draw),
                ),
                SwitchListTile(
                  value: includeRecommendations.value,
                  onChanged: (value) => includeRecommendations.value = value,
                  title: const Text('Recommendations'),
                  subtitle: const Text('Include AI-generated recommendations'),
                  secondary: const Icon(Icons.lightbulb),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Scheduling',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  value: autoSchedule.value,
                  onChanged: (value) => autoSchedule.value = value,
                  title: const Text('Auto-generate'),
                  subtitle: const Text('Automatically generate this report on schedule'),
                  secondary: const Icon(Icons.schedule),
                ),
                if (autoSchedule.value)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Frequency',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          value: scheduleFrequency.value,
                          onChanged: (value) => scheduleFrequency.value = value!,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'daily',
                              child: Text('Daily'),
                            ),
                            DropdownMenuItem(
                              value: 'weekly',
                              child: Text('Weekly'),
                            ),
                            DropdownMenuItem(
                              value: 'monthly',
                              child: Text('Monthly'),
                            ),
                            DropdownMenuItem(
                              value: 'quarterly',
                              child: Text('Quarterly'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String description,
    String reportType,
    List<String> selectedProjects,
    DateTimeRange? selectedDateRange,
    List<String> selectedInspectors,
    List<String> selectedAssets,
    bool includePhotos,
    bool includeSignatures,
    bool includeRecommendations,
    bool autoSchedule,
    String scheduleFrequency,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Review & Generate',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Review your report configuration before generating.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          _buildReviewSection(
            'Basic Information',
            [
              'Title: $title',
              'Description: ${description.isEmpty ? 'None' : description}',
              'Type: ${_getReportTypeLabel(reportType)}',
            ],
            theme,
            colorScheme,
          ),
          const SizedBox(height: 16),
          _buildReviewSection(
            'Data Selection',
            [
              'Projects: ${selectedProjects.isEmpty ? 'All projects' : '${selectedProjects.length} selected'}',
              'Date Range: ${selectedDateRange != null ? '${_formatDate(selectedDateRange.start)} - ${_formatDate(selectedDateRange.end)}' : 'Not specified'}',
              'Inspectors: ${selectedInspectors.isEmpty ? 'All inspectors' : '${selectedInspectors.length} selected'}',
              'Assets: ${selectedAssets.isEmpty ? 'All assets' : '${selectedAssets.length} selected'}',
            ],
            theme,
            colorScheme,
          ),
          const SizedBox(height: 16),
          _buildReviewSection(
            'Content Options',
            [
              'Include Photos: ${includePhotos ? 'Yes' : 'No'}',
              'Include Signatures: ${includeSignatures ? 'Yes' : 'No'}',
              'Include Recommendations: ${includeRecommendations ? 'Yes' : 'No'}',
              'Auto-generate: ${autoSchedule ? 'Yes ($scheduleFrequency)' : 'No'}',
            ],
            theme,
            colorScheme,
          ),
        ],
      ),
    );
  }

  Widget _buildReviewSection(
    String title,
    List<String> items,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                item,
                style: theme.textTheme.bodyMedium,
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildNavigationButtons(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> currentStep,
    int totalSteps,
    ValueNotifier<bool> isGenerating,
    VoidCallback onGenerate,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          if (currentStep.value > 0)
            CustomButton(
              text: 'Previous',
              onPressed: () => currentStep.value--,
              variant: ButtonVariant.outlined,
            ),
          const Spacer(),
          if (currentStep.value < totalSteps - 1)
            CustomButton(
              text: 'Next',
              onPressed: () => currentStep.value++,
            )
          else
            CustomButton(
              text: isGenerating.value ? 'Generating...' : 'Generate Report',
              onPressed: isGenerating.value ? null : onGenerate,
              isLoading: isGenerating.value,
            ),
        ],
      ),
    );
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

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> _generateReport(
    BuildContext context,
    String title,
    String description,
    String reportType,
    List<String> selectedProjects,
    DateTimeRange? selectedDateRange,
    List<String> selectedInspectors,
    List<String> selectedAssets,
    bool includePhotos,
    bool includeSignatures,
    bool includeRecommendations,
    bool autoSchedule,
    String scheduleFrequency,
    ValueNotifier<bool> isGenerating,
  ) async {
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a report title'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    isGenerating.value = true;

    try {
      // Simulate report generation
      await Future.delayed(const Duration(seconds: 3));

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Report "$title" generated successfully!'),
            backgroundColor: Colors.green,
            action: SnackBarAction(
              label: 'View',
              onPressed: () {
                context.go('/reports/RPT001'); // Navigate to generated report
              },
            ),
          ),
        );
        context.go('/reports');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate report: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isGenerating.value = false;
    }
  }

  List<Map<String, dynamic>> _getMockProjects() {
    return [
      {
        'id': 'PRJ001',
        'name': 'Manufacturing Plant A',
        'description': 'Main production facility',
      },
      {
        'id': 'PRJ002',
        'name': 'Warehouse B',
        'description': 'Storage and distribution center',
      },
      {
        'id': 'PRJ003',
        'name': 'Office Building C',
        'description': 'Administrative headquarters',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockInspectors() {
    return [
      {
        'id': 'INS001',
        'name': 'John Smith',
        'role': 'Senior Inspector',
      },
      {
        'id': 'INS002',
        'name': 'Sarah Johnson',
        'role': 'Safety Inspector',
      },
      {
        'id': 'INS003',
        'name': 'Mike Wilson',
        'role': 'Quality Inspector',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockAssets() {
    return [
      {
        'id': 'AST001',
        'name': 'Conveyor Belt #1',
        'type': 'Machinery',
      },
      {
        'id': 'AST002',
        'name': 'Safety Equipment Station',
        'type': 'Safety',
      },
      {
        'id': 'AST003',
        'name': 'HVAC System',
        'type': 'Infrastructure',
      },
      {
        'id': 'AST004',
        'name': 'Fire Extinguisher #5',
        'type': 'Safety',
      },
      {
        'id': 'AST005',
        'name': 'Electrical Panel A',
        'type': 'Electrical',
      },
      {
        'id': 'AST006',
        'name': 'Emergency Exit Door',
        'type': 'Safety',
      },
    ];
  }
}