import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for creating new inspections
class CreateInspectionPage extends HookConsumerWidget {
  final String? folderId;
  final String? assetId;
  final String? templateId;
  
  const CreateInspectionPage({
    super.key,
    this.folderId,
    this.assetId,
    this.templateId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final currentStep = useState(0);
    final formKey = useMemoized(() => GlobalKey<FormState>());
    
    // Form controllers
    final titleController = useTextEditingController();
    final descriptionController = useTextEditingController();
    final notesController = useTextEditingController();
    
    // Form state
    final selectedFolder = useState<Map<String, dynamic>?>(null);
    final selectedAsset = useState<Map<String, dynamic>?>(null);
    final selectedTemplate = useState<Map<String, dynamic>?>(null);
    final selectedInspector = useState<Map<String, dynamic>?>(null);
    final scheduledDate = useState<DateTime?>(null);
    final priority = useState<String>('medium');
    
    // Initialize with provided IDs
    useEffect(() {
      if (folderId != null) {
        selectedFolder.value = _getFolderById(folderId!);
      }
      if (assetId != null) {
        selectedAsset.value = _getAssetById(assetId!);
      }
      if (templateId != null) {
        selectedTemplate.value = _getTemplateById(templateId!);
      }
      return null;
    }, [folderId, assetId, templateId]);

    return ResponsiveScaffold(
      title: 'Create Inspection',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildStepIndicator(theme, colorScheme, currentStep.value),
            Expanded(
              child: Form(
                key: formKey,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: _buildStepContent(
                    context,
                    theme,
                    colorScheme,
                    currentStep.value,
                    titleController,
                    descriptionController,
                    notesController,
                    selectedFolder,
                    selectedAsset,
                    selectedTemplate,
                    selectedInspector,
                    scheduledDate,
                    priority,
                  ),
                ),
              ),
            ),
            _buildNavigationFooter(
              context,
              theme,
              colorScheme,
              currentStep,
              formKey,
              isLoading,
              titleController,
              selectedFolder,
              selectedAsset,
              selectedTemplate,
              selectedInspector,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(ThemeData theme, ColorScheme colorScheme, int currentStep) {
    final steps = [
      'Basic Info',
      'Asset & Template',
      'Assignment',
      'Review',
    ];
    
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
                                  ? colorScheme.primaryContainer
                                  : colorScheme.surfaceVariant,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isActive
                                ? colorScheme.primary
                                : colorScheme.outline,
                            width: 2,
                          ),
                        ),
                        child: Center(
                          child: isCompleted
                              ? Icon(
                                  Icons.check,
                                  color: colorScheme.onPrimary,
                                  size: 16,
                                )
                              : Text(
                                  (index + 1).toString(),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isActive
                                        ? colorScheme.primary
                                        : colorScheme.onSurfaceVariant,
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
                          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                if (index < steps.length - 1)
                  Container(
                    width: 24,
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
    TextEditingController notesController,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
    ValueNotifier<DateTime?> scheduledDate,
    ValueNotifier<String> priority,
  ) {
    switch (currentStep) {
      case 0:
        return _buildBasicInfoStep(
          theme,
          colorScheme,
          titleController,
          descriptionController,
          selectedFolder,
          priority,
        );
      case 1:
        return _buildAssetTemplateStep(
          context,
          theme,
          colorScheme,
          selectedAsset,
          selectedTemplate,
        );
      case 2:
        return _buildAssignmentStep(
          context,
          theme,
          colorScheme,
          selectedInspector,
          scheduledDate,
          notesController,
        );
      case 3:
        return _buildReviewStep(
          theme,
          colorScheme,
          titleController,
          descriptionController,
          selectedFolder,
          selectedAsset,
          selectedTemplate,
          selectedInspector,
          scheduledDate,
          priority,
          notesController,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildBasicInfoStep(
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController titleController,
    TextEditingController descriptionController,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
    ValueNotifier<String> priority,
  ) {
    return Column(
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
          'Provide basic details for the new inspection',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        CustomTextField(
          controller: titleController,
          label: 'Inspection Title',
          hintText: 'Enter a descriptive title for this inspection',
          validator: Validators.required('Title is required'),
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: descriptionController,
          label: 'Description',
          hintText: 'Provide a detailed description of this inspection',
          maxLines: 3,
        ),
        const SizedBox(height: 16),
        _buildFolderSelector(theme, colorScheme, selectedFolder),
        const SizedBox(height: 16),
        _buildPrioritySelector(theme, colorScheme, priority),
      ],
    );
  }

  Widget _buildAssetTemplateStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Asset & Template Selection',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Select the asset to inspect and the inspection template to use',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        _buildAssetSelector(context, theme, colorScheme, selectedAsset),
        const SizedBox(height: 24),
        _buildTemplateSelector(theme, colorScheme, selectedTemplate),
      ],
    );
  }

  Widget _buildAssignmentStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
    ValueNotifier<DateTime?> scheduledDate,
    TextEditingController notesController,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Assignment Details',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Assign the inspection and set scheduling details',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        _buildInspectorSelector(theme, colorScheme, selectedInspector),
        const SizedBox(height: 16),
        _buildDateScheduler(context, theme, colorScheme, scheduledDate),
        const SizedBox(height: 16),
        CustomTextField(
          controller: notesController,
          label: 'Assignment Notes',
          hintText: 'Add any special instructions or notes for the inspector',
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildReviewStep(
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController titleController,
    TextEditingController descriptionController,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
    ValueNotifier<DateTime?> scheduledDate,
    ValueNotifier<String> priority,
    TextEditingController notesController,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review & Create',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Review all details before creating the inspection',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        _buildReviewCard(
          'Basic Information',
          [
            _buildReviewItem('Title', titleController.text),
            if (descriptionController.text.isNotEmpty)
              _buildReviewItem('Description', descriptionController.text),
            _buildReviewItem('Folder', selectedFolder.value?['name'] ?? 'Not selected'),
            _buildReviewItem('Priority', priority.value.toUpperCase()),
          ],
          theme,
          colorScheme,
        ),
        const SizedBox(height: 16),
        _buildReviewCard(
          'Asset & Template',
          [
            _buildReviewItem('Asset', selectedAsset.value?['name'] ?? 'Not selected'),
            _buildReviewItem('Template', selectedTemplate.value?['name'] ?? 'Not selected'),
          ],
          theme,
          colorScheme,
        ),
        const SizedBox(height: 16),
        _buildReviewCard(
          'Assignment',
          [
            _buildReviewItem('Inspector', selectedInspector.value?['name'] ?? 'Not assigned'),
            _buildReviewItem(
              'Scheduled Date',
              scheduledDate.value != null
                  ? '${scheduledDate.value!.day}/${scheduledDate.value!.month}/${scheduledDate.value!.year}'
                  : 'Not scheduled',
            ),
            if (notesController.text.isNotEmpty)
              _buildReviewItem('Notes', notesController.text),
          ],
          theme,
          colorScheme,
        ),
      ],
    );
  }

  Widget _buildFolderSelector(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
  ) {
    final folders = _getMockFolders();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Folder/Project',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<Map<String, dynamic>>(
          value: selectedFolder.value,
          decoration: InputDecoration(
            hintText: 'Select a folder/project',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: folders.map((folder) {
            return DropdownMenuItem(
              value: folder,
              child: Text(folder['name']),
            );
          }).toList(),
          onChanged: (folder) {
            selectedFolder.value = folder;
          },
          validator: (value) {
            if (value == null) {
              return 'Please select a folder/project';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildPrioritySelector(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<String> priority,
  ) {
    final priorities = [
      {'value': 'low', 'label': 'Low', 'color': Colors.green},
      {'value': 'medium', 'label': 'Medium', 'color': Colors.orange},
      {'value': 'high', 'label': 'High', 'color': Colors.red},
      {'value': 'critical', 'label': 'Critical', 'color': Colors.red.shade900},
    ];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Priority',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: priorities.map((priorityOption) {
            final isSelected = priority.value == priorityOption['value'];
            
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () {
                    priority.value = priorityOption['value'] as String;
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? (priorityOption['color'] as Color).withOpacity(0.1)
                          : colorScheme.surface,
                      border: Border.all(
                        color: isSelected
                            ? (priorityOption['color'] as Color)
                            : colorScheme.outline,
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        priorityOption['label'] as String,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isSelected
                              ? (priorityOption['color'] as Color)
                              : colorScheme.onSurfaceVariant,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAssetSelector(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Asset to Inspect',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            CustomButton(
              onPressed: () => _showAssetSelector(context, selectedAsset),
              text: 'Browse Assets',
              icon: Icons.search,
              size: ButtonSize.small,
              variant: ButtonVariant.outline,
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (selectedAsset.value != null)
          _buildSelectedAssetCard(theme, colorScheme, selectedAsset.value!)
        else
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(
                color: colorScheme.outline,
                style: BorderStyle.solid,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.precision_manufacturing,
                  size: 48,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: 8),
                Text(
                  'No asset selected',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Browse assets or scan QR code to select',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSelectedAssetCard(
    ThemeData theme,
    ColorScheme colorScheme,
    Map<String, dynamic> asset,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.precision_manufacturing,
                color: colorScheme.primary,
                size: 32,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    asset['name'],
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'ID: ${asset['id']}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  Text(
                    asset['location'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () {
                // Clear selection
              },
              icon: const Icon(Icons.close),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTemplateSelector(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
  ) {
    final templates = _getMockTemplates();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Inspection Template',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<Map<String, dynamic>>(
          value: selectedTemplate.value,
          decoration: InputDecoration(
            hintText: 'Select an inspection template',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: templates.map((template) {
            return DropdownMenuItem(
              value: template,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(template['name']),
                  Text(
                    template['description'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (template) {
            selectedTemplate.value = template;
          },
          validator: (value) {
            if (value == null) {
              return 'Please select an inspection template';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildInspectorSelector(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
  ) {
    final inspectors = _getMockInspectors();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Assign Inspector',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<Map<String, dynamic>>(
          value: selectedInspector.value,
          decoration: InputDecoration(
            hintText: 'Select an inspector',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: inspectors.map((inspector) {
            return DropdownMenuItem(
              value: inspector,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: colorScheme.primaryContainer,
                    child: Text(
                      inspector['name'][0],
                      style: TextStyle(
                        color: colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(inspector['name']),
                        Text(
                          inspector['role'],
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
          }).toList(),
          onChanged: (inspector) {
            selectedInspector.value = inspector;
          },
        ),
      ],
    );
  }

  Widget _buildDateScheduler(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<DateTime?> scheduledDate,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Scheduled Date',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        CustomButton(
          onPressed: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: scheduledDate.value ?? DateTime.now(),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
            );
            
            if (date != null) {
              scheduledDate.value = date;
            }
          },
          text: scheduledDate.value != null
              ? '${scheduledDate.value!.day}/${scheduledDate.value!.month}/${scheduledDate.value!.year}'
              : 'Select Date',
          icon: Icons.calendar_today,
          variant: ButtonVariant.outline,
        ),
      ],
    );
  }

  Widget _buildReviewCard(
    String title,
    List<Widget> items,
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
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...items,
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationFooter(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> currentStep,
    GlobalKey<FormState> formKey,
    ValueNotifier<bool> isLoading,
    TextEditingController titleController,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
  ) {
    final isFirstStep = currentStep.value == 0;
    final isLastStep = currentStep.value == 3;
    
    return Container(
      padding: const EdgeInsets.all(16),
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
          if (!isFirstStep)
            CustomButton(
              onPressed: () {
                currentStep.value--;
              },
              text: 'Previous',
              variant: ButtonVariant.outline,
            ),
          const Spacer(),
          if (isLastStep)
            CustomButton(
              onPressed: () => _createInspection(
                context,
                isLoading,
                titleController,
                selectedFolder,
                selectedAsset,
                selectedTemplate,
                selectedInspector,
              ),
              text: 'Create Inspection',
              icon: Icons.add,
            )
          else
            CustomButton(
              onPressed: () {
                if (_validateCurrentStep(
                  currentStep.value,
                  formKey,
                  selectedAsset,
                  selectedTemplate,
                )) {
                  currentStep.value++;
                }
              },
              text: 'Next',
              icon: Icons.arrow_forward,
            ),
        ],
      ),
    );
  }

  bool _validateCurrentStep(
    int step,
    GlobalKey<FormState> formKey,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
  ) {
    switch (step) {
      case 0:
        return formKey.currentState?.validate() ?? false;
      case 1:
        return selectedAsset.value != null && selectedTemplate.value != null;
      case 2:
        return true; // Assignment is optional
      default:
        return true;
    }
  }

  Future<void> _showAssetSelector(
    BuildContext context,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
  ) async {
    final assets = _getMockAssets();
    
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Select Asset'),
          content: SizedBox(
            width: double.maxFinite,
            height: 400,
            child: ListView.builder(
              itemCount: assets.length,
              itemBuilder: (context, index) {
                final asset = assets[index];
                return ListTile(
                  leading: const Icon(Icons.precision_manufacturing),
                  title: Text(asset['name']),
                  subtitle: Text('${asset['id']} • ${asset['location']}'),
                  onTap: () {
                    Navigator.of(context).pop(asset);
                  },
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
    
    if (result != null) {
      selectedAsset.value = result;
    }
  }

  Future<void> _createInspection(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    TextEditingController titleController,
    ValueNotifier<Map<String, dynamic>?> selectedFolder,
    ValueNotifier<Map<String, dynamic>?> selectedAsset,
    ValueNotifier<Map<String, dynamic>?> selectedTemplate,
    ValueNotifier<Map<String, dynamic>?> selectedInspector,
  ) async {
    isLoading.value = true;
    
    try {
      // Simulate inspection creation
      await Future.delayed(const Duration(seconds: 2));
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Inspection created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate to the new inspection
        context.go('/inspections/INS001');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create inspection: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Mock data methods
  List<Map<String, dynamic>> _getMockFolders() {
    return [
      {
        'id': 'FOLDER001',
        'name': 'Manufacturing Equipment',
        'description': 'Production line equipment inspections',
      },
      {
        'id': 'FOLDER002',
        'name': 'Safety Systems',
        'description': 'Safety equipment and systems',
      },
      {
        'id': 'FOLDER003',
        'name': 'HVAC Systems',
        'description': 'Heating, ventilation, and air conditioning',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockAssets() {
    return [
      {
        'id': 'ASSET001',
        'name': 'CNC Machine #1',
        'location': 'Production Floor A',
        'type': 'Manufacturing Equipment',
      },
      {
        'id': 'ASSET002',
        'name': 'Conveyor Belt System',
        'location': 'Production Floor B',
        'type': 'Material Handling',
      },
      {
        'id': 'ASSET003',
        'name': 'Emergency Exit Door #3',
        'location': 'Building East Wing',
        'type': 'Safety Equipment',
      },
    ];
  }

  List<Map<String, dynamic>> _getMockTemplates() {
    return [
      {
        'id': 'TEMPLATE001',
        'name': 'Equipment Safety Inspection',
        'description': 'Comprehensive safety inspection for manufacturing equipment',
        'sections': 3,
        'questions': 15,
      },
      {
        'id': 'TEMPLATE002',
        'name': 'Fire Safety Inspection',
        'description': 'Fire safety systems and equipment inspection',
        'sections': 2,
        'questions': 8,
      },
      {
        'id': 'TEMPLATE003',
        'name': 'Electrical Safety Inspection',
        'description': 'Electrical systems and components safety check',
        'sections': 4,
        'questions': 20,
      },
    ];
  }

  List<Map<String, dynamic>> _getMockInspectors() {
    return [
      {
        'id': 'USER001',
        'name': 'John Smith',
        'role': 'Senior Inspector',
        'email': 'john.smith@company.com',
      },
      {
        'id': 'USER002',
        'name': 'Sarah Johnson',
        'role': 'Safety Inspector',
        'email': 'sarah.johnson@company.com',
      },
      {
        'id': 'USER003',
        'name': 'Mike Wilson',
        'role': 'Equipment Inspector',
        'email': 'mike.wilson@company.com',
      },
    ];
  }

  Map<String, dynamic>? _getFolderById(String id) {
    final folders = _getMockFolders();
    try {
      return folders.firstWhere((folder) => folder['id'] == id);
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic>? _getAssetById(String id) {
    final assets = _getMockAssets();
    try {
      return assets.firstWhere((asset) => asset['id'] == id);
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic>? _getTemplateById(String id) {
    final templates = _getMockTemplates();
    try {
      return templates.firstWhere((template) => template['id'] == id);
    } catch (e) {
      return null;
    }
  }
}