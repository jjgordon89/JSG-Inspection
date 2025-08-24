import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../shared/providers/auth_provider.dart';
import '../../../../app/router/app_router.dart';

/// User profile page with personal information and account settings
class ProfilePage extends HookConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authNotifierProvider);
    final isLoading = useState(false);
    final isEditing = useState(false);
    
    // Form controllers
    final firstNameController = useTextEditingController(text: 'John');
    final lastNameController = useTextEditingController(text: 'Doe');
    final emailController = useTextEditingController(text: 'john.doe@example.com');
    final phoneController = useTextEditingController(text: '+1 (555) 123-4567');
    final companyController = useTextEditingController(text: 'JSG Inspections');
    final titleController = useTextEditingController(text: 'Senior Inspector');
    final locationController = useTextEditingController(text: 'New York, NY');
    
    return ResponsiveScaffold(
      title: 'Profile',
      actions: [
        IconButton(
          icon: Icon(isEditing.value ? Icons.close : Icons.edit),
          onPressed: () {
            isEditing.value = !isEditing.value;
          },
          tooltip: isEditing.value ? 'Cancel' : 'Edit Profile',
        ),
      ],
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildProfileHeader(context, theme, colorScheme, isEditing.value),
              const SizedBox(height: 32),
              _buildPersonalInfo(
                context,
                theme,
                colorScheme,
                isEditing.value,
                firstNameController,
                lastNameController,
                emailController,
                phoneController,
              ),
              const SizedBox(height: 32),
              _buildProfessionalInfo(
                context,
                theme,
                colorScheme,
                isEditing.value,
                companyController,
                titleController,
                locationController,
              ),
              const SizedBox(height: 32),
              _buildAccountInfo(context, theme, colorScheme),
              const SizedBox(height: 32),
              _buildActivityStats(context, theme, colorScheme),
              if (isEditing.value) ..[
                const SizedBox(height: 32),
                _buildActionButtons(
                  context,
                  theme,
                  colorScheme,
                  isLoading,
                  isEditing,
                  {
                    'firstName': firstNameController.text,
                    'lastName': lastNameController.text,
                    'email': emailController.text,
                    'phone': phoneController.text,
                    'company': companyController.text,
                    'title': titleController.text,
                    'location': locationController.text,
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    bool isEditing,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: colorScheme.primary.withOpacity(0.1),
                  child: Icon(
                    Icons.person,
                    size: 60,
                    color: colorScheme.primary,
                  ),
                ),
                if (isEditing)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(
                          Icons.camera_alt,
                          color: Colors.white,
                          size: 20,
                        ),
                        onPressed: () => _changeProfilePhoto(context),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'John Doe',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Senior Inspector',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.green.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Active',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.green.shade700,
                      fontWeight: FontWeight.w600,
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

  Widget _buildPersonalInfo(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    bool isEditing,
    TextEditingController firstNameController,
    TextEditingController lastNameController,
    TextEditingController emailController,
    TextEditingController phoneController,
  ) {
    return _buildSection(
      context,
      theme,
      colorScheme,
      'Personal Information',
      Icons.person_outline,
      [
        Row(
          children: [
            Expanded(
              child: isEditing
                  ? CustomTextField(
                      controller: firstNameController,
                      label: 'First Name',
                      prefixIcon: Icons.person,
                    )
                  : _buildInfoItem(theme, colorScheme, 'First Name', firstNameController.text),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: isEditing
                  ? CustomTextField(
                      controller: lastNameController,
                      label: 'Last Name',
                      prefixIcon: Icons.person,
                    )
                  : _buildInfoItem(theme, colorScheme, 'Last Name', lastNameController.text),
            ),
          ],
        ),
        const SizedBox(height: 16),
        isEditing
            ? CustomTextField(
                controller: emailController,
                label: 'Email Address',
                prefixIcon: Icons.email,
                keyboardType: TextInputType.emailAddress,
              )
            : _buildInfoItem(theme, colorScheme, 'Email', emailController.text),
        const SizedBox(height: 16),
        isEditing
            ? CustomTextField(
                controller: phoneController,
                label: 'Phone Number',
                prefixIcon: Icons.phone,
                keyboardType: TextInputType.phone,
              )
            : _buildInfoItem(theme, colorScheme, 'Phone', phoneController.text),
      ],
    );
  }

  Widget _buildProfessionalInfo(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    bool isEditing,
    TextEditingController companyController,
    TextEditingController titleController,
    TextEditingController locationController,
  ) {
    return _buildSection(
      context,
      theme,
      colorScheme,
      'Professional Information',
      Icons.work_outline,
      [
        isEditing
            ? CustomTextField(
                controller: companyController,
                label: 'Company',
                prefixIcon: Icons.business,
              )
            : _buildInfoItem(theme, colorScheme, 'Company', companyController.text),
        const SizedBox(height: 16),
        isEditing
            ? CustomTextField(
                controller: titleController,
                label: 'Job Title',
                prefixIcon: Icons.badge,
              )
            : _buildInfoItem(theme, colorScheme, 'Job Title', titleController.text),
        const SizedBox(height: 16),
        isEditing
            ? CustomTextField(
                controller: locationController,
                label: 'Location',
                prefixIcon: Icons.location_on,
              )
            : _buildInfoItem(theme, colorScheme, 'Location', locationController.text),
      ],
    );
  }

  Widget _buildAccountInfo(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return _buildSection(
      context,
      theme,
      colorScheme,
      'Account Information',
      Icons.account_circle_outlined,
      [
        _buildInfoItem(theme, colorScheme, 'User ID', 'USR-2023-001'),
        const SizedBox(height: 16),
        _buildInfoItem(theme, colorScheme, 'Member Since', 'January 15, 2023'),
        const SizedBox(height: 16),
        _buildInfoItem(theme, colorScheme, 'Last Login', '2 hours ago'),
        const SizedBox(height: 16),
        _buildInfoItem(theme, colorScheme, 'Account Type', 'Professional'),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Change Password',
                style: ButtonStyle.outline,
                icon: Icons.lock_outline,
                onPressed: () => context.go(AppRoutes.changePassword),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomButton(
                text: 'Two-Factor Auth',
                style: ButtonStyle.text,
                icon: Icons.security,
                onPressed: () => _setupTwoFactor(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActivityStats(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return _buildSection(
      context,
      theme,
      colorScheme,
      'Activity Statistics',
      Icons.analytics_outlined,
      [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                theme,
                colorScheme,
                'Inspections',
                '247',
                Icons.assignment_turned_in,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                theme,
                colorScheme,
                'Reports',
                '89',
                Icons.description,
                Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                theme,
                colorScheme,
                'Assets',
                '156',
                Icons.inventory,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                theme,
                colorScheme,
                'Hours',
                '1,234',
                Icons.access_time,
                Colors.purple,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        CustomButton(
          text: 'View Detailed Analytics',
          style: ButtonStyle.outline,
          icon: Icons.analytics,
          onPressed: () => context.go(AppRoutes.reports),
        ),
      ],
    );
  }

  Widget _buildSection(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    IconData icon,
    List<Widget> children,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: colorScheme.primary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: theme.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    ValueNotifier<bool> isLoading,
    ValueNotifier<bool> isEditing,
    Map<String, String> formData,
  ) {
    return Row(
      children: [
        Expanded(
          child: CustomButton(
            text: 'Cancel',
            style: ButtonStyle.outline,
            onPressed: () {
              isEditing.value = false;
            },
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: CustomButton(
            text: 'Save Changes',
            style: ButtonStyle.primary,
            icon: Icons.save,
            onPressed: () => _saveProfile(context, isLoading, isEditing, formData),
          ),
        ),
      ],
    );
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
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Camera functionality will be implemented soon'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Gallery functionality will be implemented soon'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text('Remove Photo'),
              onTap: () {
                Navigator.pop(context);
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

  void _setupTwoFactor(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Two-factor authentication setup will be implemented soon'),
      ),
    );
  }

  void _saveProfile(
    BuildContext context,
    ValueNotifier<bool> isLoading,
    ValueNotifier<bool> isEditing,
    Map<String, String> formData,
  ) async {
    isLoading.value = true;
    
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      if (context.mounted) {
        isEditing.value = false;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
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
}