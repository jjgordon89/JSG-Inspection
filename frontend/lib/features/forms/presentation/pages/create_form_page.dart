import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../core/constants/app_constants.dart';

/// Page for creating new form templates
class CreateFormPage extends HookConsumerWidget {
  const CreateFormPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final pageController = usePageController();
    final currentStep = useState(0);
    final isLoading = useState(false);
    
    // Form controllers
    final nameController = useTextEditingController();
    final descriptionController = useTextEditingController();
    final selectedCategory = useState<String?>('safety');
    final selectedTemplate = useState<String?>('blank');
    final isPublic = useState(false);
    final requiresApproval = useState(false);
    
    // Form sections and questions
    final sections = useState<List<Map<String, dynamic>>>([]);
    final currentSectionIndex = useState(0);
    
    final steps = [
      'Basic Information',
      'Template & Settings',
      'Form Structure',
      'Review & Create',
    ];

    return ResponsiveScaffold(
      title: 'Create Form Template',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildStepIndicator(theme, colorScheme, currentStep.value, steps),
            Expanded(
              child: PageView(
                controller: pageController,
                onPageChanged: (index) => currentStep.value = index,
                children: [
                  _buildBasicInfoStep(
                    context,
                    theme,
                    colorScheme,
                    nameController,
                    descriptionController,
                    selectedCategory,
                  ),
                  _buildTemplateSettingsStep(
                    context,
                    theme,
                    colorScheme,
                    selectedTemplate,
                    isPublic,
                    requiresApproval,
                  ),
                  _buildFormStructureStep(
                    context,
                    theme,
                    colorScheme,
                    sections,
                    currentSectionIndex,
                  ),
                  _buildReviewStep(
                    context,
                    theme,
                    colorScheme,
                    nameController,
                    descriptionController,
                    selectedCategory,
                    selectedTemplate,
                    isPublic,
                    requiresApproval,
                    sections,
                  ),
                ],
              ),
            ),
            _buildNavigationButtons(
              context,
              theme,
              colorScheme,
              currentStep,
              pageController,
              steps.length,
              isLoading,
              () => _createForm(
                context,
                isLoading,
                nameController.text,
                descriptionController.text,
                selectedCategory.value!,
                selectedTemplate.value!,
                isPublic.value,
                requiresApproval.value,
                sections.value,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(
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
                                  style: TextStyle(
                                    color: isActive
                                        ? colorScheme.onPrimary
                                        : colorScheme.onSurface,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        step,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: isActive || isCompleted
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
                    height: 2,
                    width: 24,
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

  Widget _buildBasicInfoStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController nameController,
    TextEditingController descriptionController,
    ValueNotifier<String?> selectedCategory,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Provide basic details about your form template',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Form Name *',
                      hintText: 'Enter a descriptive name for your form',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Form name is required';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  TextFormField(
                    controller: descriptionController,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      hintText: 'Describe the purpose and scope of this form',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Category *',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _getCategories().map((category) {
                      final isSelected = selectedCategory.value == category['id'];
                      return FilterChip(
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            selectedCategory.value = category['id'];
                          }
                        },
                        avatar: Icon(
                          category['icon'],
                          size: 18,
                          color: isSelected
                              ? colorScheme.onSecondaryContainer
                              : colorScheme.onSurfaceVariant,
                        ),
                        label: Text(category['name']),
                        backgroundColor: isSelected
                            ? colorScheme.secondaryContainer
                            : null,
                        selectedColor: colorScheme.secondaryContainer,
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateSettingsStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<bool> isPublic,
    ValueNotifier<bool> requiresApproval,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Template & Settings',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a starting template and configure form settings',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Starting Template',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._getTemplates().map((template) {
                    return RadioListTile<String>(
                      value: template['id'],
                      groupValue: selectedTemplate.value,
                      onChanged: (value) => selectedTemplate.value = value,
                      title: Text(template['name']),
                      subtitle: Text(template['description']),
                      secondary: Icon(template['icon']),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Form Settings',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    value: isPublic.value,
                    onChanged: (value) => isPublic.value = value,
                    title: const Text('Public Form'),
                    subtitle: const Text('Allow other teams to use this form'),
                    secondary: const Icon(Icons.public),
                  ),
                  SwitchListTile(
                    value: requiresApproval.value,
                    onChanged: (value) => requiresApproval.value = value,
                    title: const Text('Requires Approval'),
                    subtitle: const Text('Inspections must be approved before completion'),
                    secondary: const Icon(Icons.approval),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormStructureStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<Map<String, dynamic>>> sections,
    ValueNotifier<int> currentSectionIndex,
  ) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(24),
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
                          'Form Structure',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Build your form by adding sections and questions',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  CustomButton(
                    text: 'Add Section',
                    onPressed: () => _addSection(sections),
                    icon: Icons.add,
                  ),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: sections.value.isEmpty
              ? _buildEmptyState(theme, colorScheme, sections)
              : _buildSectionsList(context, theme, colorScheme, sections, currentSectionIndex),
        ),
      ],
    );
  }

  Widget _buildEmptyState(
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<Map<String, dynamic>>> sections,
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
            'No sections yet',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your first section to start building the form',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Add First Section',
            onPressed: () => _addSection(sections),
            icon: Icons.add,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionsList(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<Map<String, dynamic>>> sections,
    ValueNotifier<int> currentSectionIndex,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: sections.value.length,
      itemBuilder: (context, index) {
        final section = sections.value[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ExpansionTile(
            leading: CircleAvatar(
              backgroundColor: colorScheme.primary,
              child: Text(
                '${index + 1}',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            title: Text(
              section['title'] ?? 'Untitled Section',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text(
              '${section['questions']?.length ?? 0} questions',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () => _editSection(context, sections, index),
                ),
                IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () => _deleteSection(sections, index),
                ),
              ],
            ),
            children: [
              if (section['questions']?.isNotEmpty == true)
                ...section['questions'].map<Widget>((question) {
                  return ListTile(
                    leading: Icon(
                      _getQuestionTypeIcon(question['type']),
                      color: colorScheme.primary,
                    ),
                    title: Text(question['text'] ?? 'Untitled Question'),
                    subtitle: Text(
                      _getQuestionTypeLabel(question['type']),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (question['required'] == true)
                          const Icon(
                            Icons.star,
                            color: Colors.red,
                            size: 16,
                          ),
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () => _editQuestion(context, sections, index, question),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              Padding(
                padding: const EdgeInsets.all(16),
                child: CustomButton(
                  text: 'Add Question',
                  onPressed: () => _addQuestion(context, sections, index),
                  variant: ButtonVariant.outline,
                  size: ButtonSize.small,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildReviewStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController nameController,
    TextEditingController descriptionController,
    ValueNotifier<String?> selectedCategory,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<bool> isPublic,
    ValueNotifier<bool> requiresApproval,
    ValueNotifier<List<Map<String, dynamic>>> sections,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Review & Create',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Review your form template before creating',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Form Details',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildReviewRow('Name', nameController.text, theme, colorScheme),
                  _buildReviewRow('Description', descriptionController.text.isEmpty ? 'No description' : descriptionController.text, theme, colorScheme),
                  _buildReviewRow('Category', _getCategoryName(selectedCategory.value), theme, colorScheme),
                  _buildReviewRow('Template', _getTemplateName(selectedTemplate.value), theme, colorScheme),
                  _buildReviewRow('Public', isPublic.value ? 'Yes' : 'No', theme, colorScheme),
                  _buildReviewRow('Requires Approval', requiresApproval.value ? 'Yes' : 'No', theme, colorScheme),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Form Structure',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (sections.value.isEmpty)
                    Text(
                      'No sections added yet',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    )
                  else
                    ...sections.value.asMap().entries.map((entry) {
                      final index = entry.key;
                      final section = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 12,
                              backgroundColor: colorScheme.primary,
                              child: Text(
                                '${index + 1}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    section['title'] ?? 'Untitled Section',
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${section['questions']?.length ?? 0} questions',
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewRow(
    String label,
    String value,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurfaceVariant,
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

  Widget _buildNavigationButtons(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<int> currentStep,
    PageController pageController,
    int totalSteps,
    ValueNotifier<bool> isLoading,
    VoidCallback onCreateForm,
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
              onPressed: () {
                currentStep.value--;
                pageController.previousPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
              variant: ButtonVariant.outline,
            ),
          const Spacer(),
          if (currentStep.value < totalSteps - 1)
            CustomButton(
              text: 'Next',
              onPressed: () {
                currentStep.value++;
                pageController.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
            )
          else
            CustomButton(
              text: 'Create Form',
              onPressed: onCreateForm,
              isLoading: isLoading.value,
            ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getCategories() {
    return [
      {'id': 'safety', 'name': 'Safety', 'icon': Icons.security},
      {'id': 'equipment', 'name': 'Equipment', 'icon': Icons.precision_manufacturing},
      {'id': 'maintenance', 'name': 'Maintenance', 'icon': Icons.build},
      {'id': 'quality', 'name': 'Quality', 'icon': Icons.verified},
      {'id': 'environmental', 'name': 'Environmental', 'icon': Icons.eco},
      {'id': 'compliance', 'name': 'Compliance', 'icon': Icons.gavel},
    ];
  }

  List<Map<String, dynamic>> _getTemplates() {
    return [
      {
        'id': 'blank',
        'name': 'Blank Form',
        'description': 'Start with an empty form and build from scratch',
        'icon': Icons.description,
      },
      {
        'id': 'safety_basic',
        'name': 'Basic Safety Inspection',
        'description': 'Standard safety checklist with common questions',
        'icon': Icons.security,
      },
      {
        'id': 'equipment_maintenance',
        'name': 'Equipment Maintenance',
        'description': 'Maintenance inspection template with technical checks',
        'icon': Icons.build,
      },
      {
        'id': 'quality_control',
        'name': 'Quality Control',
        'description': 'Quality assurance checklist with rating scales',
        'icon': Icons.verified,
      },
    ];
  }

  String _getCategoryName(String? categoryId) {
    final category = _getCategories().firstWhere(
      (cat) => cat['id'] == categoryId,
      orElse: () => {'name': 'Unknown'},
    );
    return category['name'];
  }

  String _getTemplateName(String? templateId) {
    final template = _getTemplates().firstWhere(
      (temp) => temp['id'] == templateId,
      orElse: () => {'name': 'Unknown'},
    );
    return template['name'];
  }

  IconData _getQuestionTypeIcon(String type) {
    switch (type) {
      case 'text':
        return Icons.text_fields;
      case 'number':
        return Icons.numbers;
      case 'multipleChoice':
        return Icons.radio_button_checked;
      case 'yesNo':
        return Icons.check_box;
      case 'rating':
        return Icons.star;
      case 'photo':
        return Icons.camera_alt;
      case 'signature':
        return Icons.draw;
      case 'date':
        return Icons.calendar_today;
      case 'time':
        return Icons.access_time;
      default:
        return Icons.help;
    }
  }

  String _getQuestionTypeLabel(String type) {
    switch (type) {
      case 'text':
        return 'Text Input';
      case 'number':
        return 'Number Input';
      case 'multipleChoice':
        return 'Multiple Choice';
      case 'yesNo':
        return 'Yes/No';
      case 'rating':
        return 'Rating';
      case 'photo':
        return 'Photo';
      case 'signature':
        return 'Signature';
      case 'date':
        return 'Date';
      case 'time':
        return 'Time';
      default:
        return 'Unknown';
    }
  }

  void _addSection(ValueNotifier<List<Map<String, dynamic>>> sections) {
    final newSection = {
      'id': 'SEC${DateTime.now().millisecondsSinceEpoch}',
      'title': 'New Section',
      'description': '',
      'questions': <Map<String, dynamic>>[],
    };
    
    sections.value = [...sections.value, newSection];
  }

  void _editSection(
    BuildContext context,
    ValueNotifier<List<Map<String, dynamic>>> sections,
    int index,
  ) {
    // In a real app, this would open a dialog or navigate to an edit page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit section functionality')),
    );
  }

  void _deleteSection(
    ValueNotifier<List<Map<String, dynamic>>> sections,
    int index,
  ) {
    final updatedSections = List<Map<String, dynamic>>.from(sections.value);
    updatedSections.removeAt(index);
    sections.value = updatedSections;
  }

  void _addQuestion(
    BuildContext context,
    ValueNotifier<List<Map<String, dynamic>>> sections,
    int sectionIndex,
  ) {
    final newQuestion = {
      'id': 'Q${DateTime.now().millisecondsSinceEpoch}',
      'text': 'New Question',
      'type': 'text',
      'required': false,
    };
    
    final updatedSections = List<Map<String, dynamic>>.from(sections.value);
    final section = Map<String, dynamic>.from(updatedSections[sectionIndex]);
    final questions = List<Map<String, dynamic>>.from(section['questions'] ?? []);
    questions.add(newQuestion);
    section['questions'] = questions;
    updatedSections[sectionIndex] = section;
    sections.value = updatedSections;
  }

  void _editQuestion(
    BuildContext context,
    ValueNotifier<List<Map<String, dynamic>>> sections,
    int sectionIndex,
    Map<String, dynamic> question,
  ) {
    // In a real app, this would open a dialog or navigate to an edit page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit question functionality')),
    );
  }

  Future<void> _createForm(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    String name,
    String description,
    String category,
    String template,
    bool isPublic,
    bool requiresApproval,
    List<Map<String, dynamic>> sections,
  ) async {
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a form name'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    isLoading.value = true;

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      // In a real app, this would call the form creation API
      final formData = {
        'name': name,
        'description': description,
        'category': category,
        'template': template,
        'isPublic': isPublic,
        'requiresApproval': requiresApproval,
        'sections': sections,
        'createdAt': DateTime.now().toIso8601String(),
      };

      print('Creating form: $formData');

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Form template created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/forms');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create form: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }
}