import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../core/constants/app_constants.dart';

/// Edit profile page for updating user information
class EditProfilePage extends HookConsumerWidget {
  const EditProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLoading = useState(false);
    final hasChanges = useState(false);
    final currentStep = useState(0);
    
    // Form controllers with mock current data
    final firstNameController = useTextEditingController(text: 'John');
    final lastNameController = useTextEditingController(text: 'Smith');
    final emailController = useTextEditingController(text: 'john.smith@jsg.com');
    final phoneController = useTextEditingController(text: '+1 (555) 123-4567');
    final companyController = useTextEditingController(text: 'JSG Inspections');
    final titleController = useTextEditingController(text: 'Senior Inspector');
    final departmentController = useTextEditingController(text: 'Quality Assurance');
    final locationController = useTextEditingController(text: 'New York, NY');
    final bioController = useTextEditingController(
      text: 'Experienced safety inspector with over 10 years in the field.',
    );
    final emergencyContactController = useTextEditingController(
      text: 'Jane Smith - +1 (555) 987-6543',
    );
    
    // Form validation
    final formKey = useMemoized(() => GlobalKey<FormState>());
    
    // Listen for changes
    useEffect(() {
      void listener() {
        hasChanges.value = true;
      }
      
      firstNameController.addListener(listener);
      lastNameController.addListener(listener);
      emailController.addListener(listener);
      phoneController.addListener(listener);
      companyController.addListener(listener);
      titleController.addListener(listener);
      departmentController.addListener(listener);
      locationController.addListener(listener);
      bioController.addListener(listener);
      emergencyContactController.addListener(listener);
      
      return () {
        firstNameController.removeListener(listener);
        lastNameController.removeListener(listener);
        emailController.removeListener(listener);
        phoneController.removeListener(listener);
        companyController.removeListener(listener);
        titleController.removeListener(listener);
        departmentController.removeListener(listener);
        locationController.removeListener(listener);
        bioController.removeListener(listener);
        emergencyContactController.removeListener(listener);
      };
    }, []);
    
    final steps = [
      'Personal Info',
      'Work Details',
      'Additional Info',
    ];

    return ResponsiveScaffold(
      title: 'Edit Profile',
      actions: [
        if (hasChanges.value)
          TextButton(
            onPressed: () => _resetForm(
              firstNameController,
              lastNameController,
              emailController,
              phoneController,
              companyController,
              titleController,
              departmentController,
              locationController,
              bioController,
              emergencyContactController,
              hasChanges,
            ),
            child: const Text('Reset'),
          ),
      ],
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: Column(
          children: [
            // Progress indicator
            Container(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: steps.asMap().entries.map((entry) {
                  final index = entry.key;
                  final step = entry.value;
                  final isActive = index == currentStep.value;
                  final isCompleted = index < currentStep.value;
                  
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
                                  shape: BoxShape.circle,
                                  color: isCompleted
                                      ? colorScheme.primary
                                      : isActive
                                          ? colorScheme.primary
                                          : colorScheme.outline,
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
                                  fontWeight: isActive ? FontWeight.bold : null,
                                  color: isActive
                                      ? colorScheme.primary
                                      : colorScheme.onSurfaceVariant,
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
            ),
            
            // Form content
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
                    firstNameController,
                    lastNameController,
                    emailController,
                    phoneController,
                    companyController,
                    titleController,
                    departmentController,
                    locationController,
                    bioController,
                    emergencyContactController,
                  ),
                ),
              ),
            ),
            
            // Navigation buttons
            Container(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  if (currentStep.value > 0)
                    Expanded(
                      child: CustomButton(
                        text: 'Previous',
                        onPressed: () {
                          currentStep.value = currentStep.value - 1;
                        },
                        variant: ButtonVariant.outlined,
                      ),
                    ),
                  if (currentStep.value > 0) const SizedBox(width: 16),
                  Expanded(
                    child: CustomButton(
                      text: currentStep.value == steps.length - 1
                          ? 'Save Changes'
                          : 'Next',
                      onPressed: () => _handleNext(
                        context,
                        formKey,
                        currentStep,
                        steps.length,
                        isLoading,
                        firstNameController,
                        lastNameController,
                        emailController,
                        phoneController,
                        companyController,
                        titleController,
                        departmentController,
                        locationController,
                        bioController,
                        emergencyContactController,
                      ),
                      isLoading: isLoading.value,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    int currentStep,
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController departmentController,
    TextEditingController locationController,
    TextEditingController bioController,
    TextEditingController emergencyContactController,
  ) {
    switch (currentStep) {
      case 0:
        return _buildPersonalInfoStep(
          context,
          theme,
          colorScheme,
          firstNameController,
          lastNameController,
          emailController,
          phoneController,
        );
      case 1:
        return _buildWorkDetailsStep(
          context,
          theme,
          colorScheme,
          companyController,
          titleController,
          departmentController,
          locationController,
        );
      case 2:
        return _buildAdditionalInfoStep(
          context,
          theme,
          colorScheme,
          bioController,
          emergencyContactController,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildPersonalInfoStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Personal Information',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Update your basic personal information',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 32),
        
        // Profile photo section
        Center(
          child: Column(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: colorScheme.primary,
                    child: Text(
                      'JS',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: colorScheme.primary,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: colorScheme.surface,
                          width: 2,
                        ),
                      ),
                      child: IconButton(
                        icon: Icon(
                          Icons.camera_alt,
                          color: colorScheme.onPrimary,
                          size: 16,
                        ),
                        onPressed: () => _changeProfilePhoto(context),
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                        padding: const EdgeInsets.all(4),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => _changeProfilePhoto(context),
                child: const Text('Change Photo'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        
        // Name fields
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                controller: firstNameController,
                label: 'First Name',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'First name is required';
                  }
                  return null;
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: CustomTextField(
                controller: lastNameController,
                label: 'Last Name',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Last name is required';
                  }
                  return null;
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Contact fields
        CustomTextField(
          controller: emailController,
          label: 'Email Address',
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Email is required';
            }
            if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\$').hasMatch(value)) {
              return 'Please enter a valid email';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: phoneController,
          label: 'Phone Number',
          keyboardType: TextInputType.phone,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Phone number is required';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildWorkDetailsStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController departmentController,
    TextEditingController locationController,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Work Details',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Update your professional information',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 32),
        
        CustomTextField(
          controller: companyController,
          label: 'Company',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Company is required';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: titleController,
          label: 'Job Title',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Job title is required';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: departmentController,
          label: 'Department',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Department is required';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: locationController,
          label: 'Work Location',
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Work location is required';
            }
            return null;
          },
        ),
        const SizedBox(height: 32),
        
        // Skills section
        Text(
          'Skills & Certifications',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildSkillChip('Safety Inspection', true, theme, colorScheme),
            _buildSkillChip('OSHA Compliance', true, theme, colorScheme),
            _buildSkillChip('Quality Assurance', true, theme, colorScheme),
            _buildSkillChip('Risk Assessment', false, theme, colorScheme),
            _buildSkillChip('Equipment Maintenance', false, theme, colorScheme),
          ],
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () => _addSkill(context),
          icon: const Icon(Icons.add),
          label: const Text('Add Skill'),
        ),
      ],
    );
  }

  Widget _buildAdditionalInfoStep(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    TextEditingController bioController,
    TextEditingController emergencyContactController,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Additional Information',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Optional information to complete your profile',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 32),
        
        CustomTextField(
          controller: bioController,
          label: 'Bio / Description',
          maxLines: 4,
          hint: 'Tell us about your experience and expertise...',
        ),
        const SizedBox(height: 16),
        CustomTextField(
          controller: emergencyContactController,
          label: 'Emergency Contact',
          hint: 'Name and phone number',
        ),
        const SizedBox(height: 32),
        
        // Preferences section
        Text(
          'Preferences',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Email Notifications'),
                  subtitle: const Text('Receive inspection reminders and updates'),
                  value: true,
                  onChanged: (value) {},
                ),
                SwitchListTile(
                  title: const Text('Push Notifications'),
                  subtitle: const Text('Get notified about urgent inspections'),
                  value: true,
                  onChanged: (value) {},
                ),
                SwitchListTile(
                  title: const Text('Weekly Reports'),
                  subtitle: const Text('Receive weekly inspection summaries'),
                  value: false,
                  onChanged: (value) {},
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSkillChip(
    String skill,
    bool isSelected,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return FilterChip(
      label: Text(skill),
      selected: isSelected,
      onSelected: (selected) {
        // Handle skill selection
      },
      backgroundColor: colorScheme.surface,
      selectedColor: colorScheme.primaryContainer,
      checkmarkColor: colorScheme.primary,
    );
  }

  void _resetForm(
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController departmentController,
    TextEditingController locationController,
    TextEditingController bioController,
    TextEditingController emergencyContactController,
    ValueNotifier<bool> hasChanges,
  ) {
    // Reset to original values
    firstNameController.text = 'John';
    lastNameController.text = 'Smith';
    emailController.text = 'john.smith@jsg.com';
    phoneController.text = '+1 (555) 123-4567';
    companyController.text = 'JSG Inspections';
    titleController.text = 'Senior Inspector';
    departmentController.text = 'Quality Assurance';
    locationController.text = 'New York, NY';
    bioController.text = 'Experienced safety inspector with over 10 years in the field.';
    emergencyContactController.text = 'Jane Smith - +1 (555) 987-6543';
    
    hasChanges.value = false;
  }

  Future<void> _handleNext(
    BuildContext context,
    GlobalKey<FormState> formKey,
    ValueNotifier<int> currentStep,
    int totalSteps,
    ValueNotifier<bool> isLoading,
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController departmentController,
    TextEditingController locationController,
    TextEditingController bioController,
    TextEditingController emergencyContactController,
  ) async {
    if (!formKey.currentState!.validate()) {
      return;
    }
    
    if (currentStep.value == totalSteps - 1) {
      // Save profile
      await _saveProfile(
        context,
        isLoading,
        firstNameController,
        lastNameController,
        emailController,
        phoneController,
        companyController,
        titleController,
        departmentController,
        locationController,
        bioController,
        emergencyContactController,
      );
    } else {
      // Go to next step
      currentStep.value = currentStep.value + 1;
    }
  }

  Future<void> _saveProfile(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController departmentController,
    TextEditingController locationController,
    TextEditingController bioController,
    TextEditingController emergencyContactController,
  ) async {
    try {
      isLoading.value = true;
      
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        
        context.pop();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  void _changeProfilePhoto(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                // Handle camera
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Opening camera...'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                // Handle gallery
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Opening gallery...'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text('Remove Photo'),
              onTap: () {
                Navigator.pop(context);
                // Handle remove
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Photo removed'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _addSkill(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Skill'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Skill name',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Skill added'),
                ),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}