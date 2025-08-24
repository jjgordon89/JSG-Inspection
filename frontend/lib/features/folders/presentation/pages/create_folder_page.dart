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

/// Page for creating a new folder/project
class CreateFolderPage extends HookConsumerWidget {
  const CreateFolderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final formKey = useMemoized(() => GlobalKey<FormState>());
    final isLoading = useState(false);
    final currentStep = useState(0);
    
    // Form controllers
    final nameController = useTextEditingController();
    final descriptionController = useTextEditingController();
    final tagsController = useTextEditingController();
    final locationController = useTextEditingController();
    
    // Form state
    final selectedTemplate = useState<String?>(null);
    final selectedMembers = useState<List<String>>([]);
    final isPrivate = useState(false);
    final enableNotifications = useState(true);
    final autoArchive = useState(false);
    final archiveDays = useState(90);
    
    final steps = [
      'Basic Information',
      'Template & Settings',
      'Members & Permissions',
      'Review & Create',
    ];

    return ResponsiveScaffold(
      title: 'Create New Folder',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            _buildStepIndicator(theme, colorScheme, currentStep.value, steps),
            Expanded(
              child: Form(
                key: formKey,
                child: _buildStepContent(
                  context,
                  theme,
                  colorScheme,
                  currentStep.value,
                  nameController,
                  descriptionController,
                  tagsController,
                  locationController,
                  selectedTemplate,
                  selectedMembers,
                  isPrivate,
                  enableNotifications,
                  autoArchive,
                  archiveDays,
                ),
              ),
            ),
            _buildNavigationButtons(
              context,
              theme,
              colorScheme,
              currentStep,
              steps.length,
              formKey,
              isLoading,
              nameController,
              descriptionController,
              tagsController,
              locationController,
              selectedTemplate,
              selectedMembers,
              isPrivate,
              enableNotifications,
              autoArchive,
              archiveDays,
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
                          border: isActive && !isCompleted
                              ? Border.all(
                                  color: colorScheme.primary,
                                  width: 2,
                                )
                              : null,
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
                                  style: theme.textTheme.bodyMedium?.copyWith(
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
                          color: isActive || isCompleted
                              ? colorScheme.primary
                              : colorScheme.onSurfaceVariant,
                          fontWeight: isActive ? FontWeight.bold : null,
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
    TextEditingController nameController,
    TextEditingController descriptionController,
    TextEditingController tagsController,
    TextEditingController locationController,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<List<String>> selectedMembers,
    ValueNotifier<bool> isPrivate,
    ValueNotifier<bool> enableNotifications,
    ValueNotifier<bool> autoArchive,
    ValueNotifier<int> archiveDays,
  ) {
    switch (currentStep) {
      case 0:
        return _buildBasicInfoStep(
          context,
          theme,
          colorScheme,
          nameController,
          descriptionController,
          tagsController,
          locationController,
        );
      case 1:
        return _buildTemplateSettingsStep(
          context,
          theme,
          colorScheme,
          selectedTemplate,
          isPrivate,
          enableNotifications,
          autoArchive,
          archiveDays,
        );
      case 2:
        return _buildMembersStep(
          context,
          theme,
          colorScheme,
          selectedMembers,
        );
      case 3:
        return _buildReviewStep(
          context,
          theme,
          colorScheme,
          nameController,
          descriptionController,
          tagsController,
          locationController,
          selectedTemplate,
          selectedMembers,
          isPrivate,
          enableNotifications,
          autoArchive,
          archiveDays,
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildBasicInfoStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController nameController,
    TextEditingController descriptionController,
    TextEditingController tagsController,
    TextEditingController locationController,
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
            'Provide basic details about your folder/project.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          CustomTextField(
            controller: nameController,
            label: 'Folder Name *',
            hintText: 'Enter folder name',
            validator: Validators.required('Folder name is required'),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: descriptionController,
            label: 'Description',
            hintText: 'Enter folder description',
            maxLines: 3,
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: locationController,
            label: 'Location',
            hintText: 'Enter physical location or site',
            prefixIcon: const Icon(Icons.location_on),
          ),
          const SizedBox(height: 24),
          CustomTextField(
            controller: tagsController,
            label: 'Tags',
            hintText: 'Enter tags separated by commas',
            prefixIcon: const Icon(Icons.tag),
          ),
          const SizedBox(height: 16),
          Text(
            'Tags help organize and filter your folders. Example: manufacturing, equipment, safety',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
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
    ValueNotifier<bool> isPrivate,
    ValueNotifier<bool> enableNotifications,
    ValueNotifier<bool> autoArchive,
    ValueNotifier<int> archiveDays,
  ) {
    final templates = _getTemplates();
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Template & Settings',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a template and configure folder settings.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Folder Template',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...templates.map((template) {
            final isSelected = selectedTemplate.value == template['id'];
            
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () {
                  selectedTemplate.value = template['id'];
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: isSelected
                        ? Border.all(
                            color: colorScheme.primary,
                            width: 2,
                          )
                        : null,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? colorScheme.primary
                              : colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          template['icon'],
                          color: isSelected
                              ? colorScheme.onPrimary
                              : colorScheme.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              template['name'],
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? colorScheme.primary
                                    : null,
                              ),
                            ),
                            Text(
                              template['description'],
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (isSelected)
                        Icon(
                          Icons.check_circle,
                          color: colorScheme.primary,
                        ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
          const SizedBox(height: 32),
          Text(
            'Privacy & Notifications',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            title: const Text('Private Folder'),
            subtitle: const Text('Only invited members can access this folder'),
            value: isPrivate.value,
            onChanged: (value) {
              isPrivate.value = value;
            },
          ),
          SwitchListTile(
            title: const Text('Enable Notifications'),
            subtitle: const Text('Receive notifications for folder activities'),
            value: enableNotifications.value,
            onChanged: (value) {
              enableNotifications.value = value;
            },
          ),
          const SizedBox(height: 24),
          Text(
            'Auto-Archive Settings',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            title: const Text('Auto-Archive Completed Inspections'),
            subtitle: Text('Archive inspections after ${archiveDays.value} days'),
            value: autoArchive.value,
            onChanged: (value) {
              autoArchive.value = value;
            },
          ),
          if (autoArchive.value)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Text('Archive after:'),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Slider(
                      value: archiveDays.value.toDouble(),
                      min: 30,
                      max: 365,
                      divisions: 11,
                      label: '${archiveDays.value} days',
                      onChanged: (value) {
                        archiveDays.value = value.round();
                      },
                    ),
                  ),
                  Text('${archiveDays.value} days'),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMembersStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<List<String>> selectedMembers,
  ) {
    final availableMembers = _getAvailableMembers();
    final emailController = useTextEditingController();
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Members & Permissions',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add team members and set their permissions.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: CustomTextField(
                  controller: emailController,
                  label: 'Invite by Email',
                  hintText: 'Enter email address',
                  keyboardType: TextInputType.emailAddress,
                ),
              ),
              const SizedBox(width: 12),
              CustomButton(
                onPressed: () {
                  if (emailController.text.isNotEmpty) {
                    selectedMembers.value = [
                      ...selectedMembers.value,
                      emailController.text,
                    ];
                    emailController.clear();
                  }
                },
                text: 'Invite',
                size: ButtonSize.small,
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (selectedMembers.value.isNotEmpty) ..[
            Text(
              'Invited Members',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...selectedMembers.value.map((email) {
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: colorScheme.primaryContainer,
                    child: Text(
                      email[0].toUpperCase(),
                      style: TextStyle(
                        color: colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(email),
                  subtitle: const Text('Pending invitation'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      DropdownButton<String>(
                        value: 'Editor',
                        items: ['Viewer', 'Editor', 'Admin']
                            .map((role) => DropdownMenuItem(
                                  value: role,
                                  child: Text(role),
                                ))
                            .toList(),
                        onChanged: (value) {},
                      ),
                      IconButton(
                        onPressed: () {
                          selectedMembers.value = selectedMembers.value
                              .where((member) => member != email)
                              .toList();
                        },
                        icon: const Icon(Icons.remove_circle_outline),
                        color: Colors.red,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
            const SizedBox(height: 24),
          ],
          Text(
            'Suggested Members',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...availableMembers.map((member) {
            final isSelected = selectedMembers.value.contains(member['email']);
            
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: colorScheme.primaryContainer,
                  child: Text(
                    member['name'].split(' ').map((n) => n[0]).join(''),
                    style: TextStyle(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(member['name']),
                subtitle: Text(member['role']),
                trailing: isSelected
                    ? Icon(
                        Icons.check_circle,
                        color: colorScheme.primary,
                      )
                    : IconButton(
                        onPressed: () {
                          if (!isSelected) {
                            selectedMembers.value = [
                              ...selectedMembers.value,
                              member['email'],
                            ];
                          }
                        },
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                onTap: () {
                  if (!isSelected) {
                    selectedMembers.value = [
                      ...selectedMembers.value,
                      member['email'],
                    ];
                  }
                },
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildReviewStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController nameController,
    TextEditingController descriptionController,
    TextEditingController tagsController,
    TextEditingController locationController,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<List<String>> selectedMembers,
    ValueNotifier<bool> isPrivate,
    ValueNotifier<bool> enableNotifications,
    ValueNotifier<bool> autoArchive,
    ValueNotifier<int> archiveDays,
  ) {
    final templates = _getTemplates();
    final selectedTemplateData = templates.firstWhere(
      (t) => t['id'] == selectedTemplate.value,
      orElse: () => templates.first,
    );
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
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
            'Review your folder configuration before creating.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          _buildReviewSection(
            theme,
            colorScheme,
            'Basic Information',
            [
              _buildReviewItem('Name', nameController.text),
              if (descriptionController.text.isNotEmpty)
                _buildReviewItem('Description', descriptionController.text),
              if (locationController.text.isNotEmpty)
                _buildReviewItem('Location', locationController.text),
              if (tagsController.text.isNotEmpty)
                _buildReviewItem('Tags', tagsController.text),
            ],
          ),
          const SizedBox(height: 24),
          _buildReviewSection(
            theme,
            colorScheme,
            'Template & Settings',
            [
              _buildReviewItem('Template', selectedTemplateData['name']),
              _buildReviewItem('Privacy', isPrivate.value ? 'Private' : 'Public'),
              _buildReviewItem('Notifications', enableNotifications.value ? 'Enabled' : 'Disabled'),
              if (autoArchive.value)
                _buildReviewItem('Auto-Archive', 'After ${archiveDays.value} days'),
            ],
          ),
          const SizedBox(height: 24),
          _buildReviewSection(
            theme,
            colorScheme,
            'Members',
            [
              _buildReviewItem(
                'Invited Members',
                selectedMembers.value.isEmpty
                    ? 'None'
                    : '${selectedMembers.value.length} member(s)',
              ),
              if (selectedMembers.value.isNotEmpty)
                ...selectedMembers.value.map((email) =>
                    _buildReviewItem('', '• $email')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReviewSection(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    List<Widget> items,
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
          if (label.isNotEmpty) ..[
            SizedBox(
              width: 120,
              child: Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Text(
              value,
              style: label.isEmpty
                  ? const TextStyle(color: Colors.grey)
                  : null,
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
    int totalSteps,
    GlobalKey<FormState> formKey,
    ValueNotifier<bool> isLoading,
    TextEditingController nameController,
    TextEditingController descriptionController,
    TextEditingController tagsController,
    TextEditingController locationController,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<List<String>> selectedMembers,
    ValueNotifier<bool> isPrivate,
    ValueNotifier<bool> enableNotifications,
    ValueNotifier<bool> autoArchive,
    ValueNotifier<int> archiveDays,
  ) {
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
          if (currentStep.value > 0)
            CustomButton(
              onPressed: () {
                currentStep.value--;
              },
              text: 'Previous',
              variant: ButtonVariant.outline,
            ),
          const Spacer(),
          if (currentStep.value < totalSteps - 1)
            CustomButton(
              onPressed: () {
                if (_validateCurrentStep(currentStep.value, formKey)) {
                  currentStep.value++;
                }
              },
              text: 'Next',
            )
          else
            CustomButton(
              onPressed: () async {
                if (_validateCurrentStep(currentStep.value, formKey)) {
                  await _createFolder(
                    context,
                    isLoading,
                    nameController,
                    descriptionController,
                    tagsController,
                    locationController,
                    selectedTemplate,
                    selectedMembers,
                    isPrivate,
                    enableNotifications,
                    autoArchive,
                    archiveDays,
                  );
                }
              },
              text: 'Create Folder',
              icon: Icons.create_new_folder,
            ),
        ],
      ),
    );
  }

  bool _validateCurrentStep(int step, GlobalKey<FormState> formKey) {
    switch (step) {
      case 0:
        return formKey.currentState?.validate() ?? false;
      default:
        return true;
    }
  }

  Future<void> _createFolder(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    TextEditingController nameController,
    TextEditingController descriptionController,
    TextEditingController tagsController,
    TextEditingController locationController,
    ValueNotifier<String?> selectedTemplate,
    ValueNotifier<List<String>> selectedMembers,
    ValueNotifier<bool> isPrivate,
    ValueNotifier<bool> enableNotifications,
    ValueNotifier<bool> autoArchive,
    ValueNotifier<int> archiveDays,
  ) async {
    isLoading.value = true;
    
    try {
      // Simulate folder creation
      await Future.delayed(const Duration(seconds: 2));
      
      // Show success message
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Folder "${nameController.text}" created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate back to folders list
        context.go('/folders');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create folder: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  List<Map<String, dynamic>> _getTemplates() {
    return [
      {
        'id': 'general',
        'name': 'General Purpose',
        'description': 'Basic folder for general inspections and asset management',
        'icon': Icons.folder,
      },
      {
        'id': 'manufacturing',
        'name': 'Manufacturing',
        'description': 'Optimized for manufacturing equipment and production lines',
        'icon': Icons.precision_manufacturing,
      },
      {
        'id': 'vehicle',
        'name': 'Vehicle Fleet',
        'description': 'Designed for vehicle inspections and fleet management',
        'icon': Icons.directions_car,
      },
      {
        'id': 'building',
        'name': 'Building & Facilities',
        'description': 'For building inspections, HVAC, and facility management',
        'icon': Icons.business,
      },
      {
        'id': 'safety',
        'name': 'Safety & Compliance',
        'description': 'Focus on safety inspections and regulatory compliance',
        'icon': Icons.security,
      },
    ];
  }

  List<Map<String, dynamic>> _getAvailableMembers() {
    return [
      {
        'id': 'USR001',
        'name': 'John Smith',
        'email': 'john.smith@company.com',
        'role': 'Production Manager',
      },
      {
        'id': 'USR002',
        'name': 'Sarah Johnson',
        'email': 'sarah.johnson@company.com',
        'role': 'Quality Inspector',
      },
      {
        'id': 'USR003',
        'name': 'Mike Wilson',
        'email': 'mike.wilson@company.com',
        'role': 'Maintenance Technician',
      },
      {
        'id': 'USR004',
        'name': 'Lisa Brown',
        'email': 'lisa.brown@company.com',
        'role': 'Safety Officer',
      },
      {
        'id': 'USR005',
        'name': 'David Chen',
        'email': 'david.chen@company.com',
        'role': 'Operations Supervisor',
      },
    ];
  }
}