import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/providers/auth_provider.dart';
import '../../../../app/router/app_router.dart';

/// Settings page with app configuration and user preferences
class SettingsPage extends HookConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final themeMode = ref.watch(themeModeProvider);
    final authState = ref.watch(authNotifierProvider);
    final isLoading = useState(false);
    
    return ResponsiveScaffold(
      title: 'Settings',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection(
                context,
                theme,
                colorScheme,
                'Appearance',
                Icons.palette,
                [
                  _buildThemeSelector(context, theme, colorScheme, ref, themeMode),
                  _buildLanguageSelector(context, theme, colorScheme),
                ],
              ),
              const SizedBox(height: 32),
              _buildSection(
                context,
                theme,
                colorScheme,
                'Notifications',
                Icons.notifications,
                [
                  _buildNotificationSettings(context, theme, colorScheme),
                ],
              ),
              const SizedBox(height: 32),
              _buildSection(
                context,
                theme,
                colorScheme,
                'Data & Sync',
                Icons.sync,
                [
                  _buildSyncSettings(context, theme, colorScheme),
                  _buildStorageSettings(context, theme, colorScheme),
                ],
              ),
              const SizedBox(height: 32),
              _buildSection(
                context,
                theme,
                colorScheme,
                'Security',
                Icons.security,
                [
                  _buildSecuritySettings(context, theme, colorScheme),
                ],
              ),
              const SizedBox(height: 32),
              _buildSection(
                context,
                theme,
                colorScheme,
                'About',
                Icons.info,
                [
                  _buildAboutSettings(context, theme, colorScheme),
                ],
              ),
              const SizedBox(height: 32),
              _buildDangerZone(context, theme, colorScheme, ref, isLoading),
            ],
          ),
        ),
      ),
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

  Widget _buildThemeSelector(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    WidgetRef ref,
    ThemeMode currentMode,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Theme Mode',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: ThemeMode.values.map((mode) {
            final isSelected = mode == currentMode;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: InkWell(
                  onTap: () => ref.read(themeNotifierProvider.notifier).setThemeMode(mode),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? colorScheme.primary.withOpacity(0.1)
                          : colorScheme.surface,
                      border: Border.all(
                        color: isSelected
                            ? colorScheme.primary
                            : colorScheme.outline.withOpacity(0.3),
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          mode.icon,
                          color: isSelected
                              ? colorScheme.primary
                              : colorScheme.onSurfaceVariant,
                          size: 24,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          mode.displayName,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isSelected
                                ? colorScheme.primary
                                : colorScheme.onSurfaceVariant,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          ),
                        ),
                      ],
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

  Widget _buildLanguageSelector(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          'Language',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: 'en',
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          items: const [
            DropdownMenuItem(value: 'en', child: Text('English')),
            DropdownMenuItem(value: 'es', child: Text('Español')),
            DropdownMenuItem(value: 'fr', child: Text('Français')),
            DropdownMenuItem(value: 'de', child: Text('Deutsch')),
          ],
          onChanged: (value) {
            // TODO: Implement language change
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Language change will be implemented soon'),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildNotificationSettings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final pushNotifications = useState(true);
    final emailNotifications = useState(true);
    final inspectionReminders = useState(true);
    final reportAlerts = useState(false);

    return Column(
      children: [
        _buildSwitchTile(
          theme,
          colorScheme,
          'Push Notifications',
          'Receive push notifications on this device',
          pushNotifications.value,
          (value) => pushNotifications.value = value,
        ),
        _buildSwitchTile(
          theme,
          colorScheme,
          'Email Notifications',
          'Receive notifications via email',
          emailNotifications.value,
          (value) => emailNotifications.value = value,
        ),
        _buildSwitchTile(
          theme,
          colorScheme,
          'Inspection Reminders',
          'Get reminded about upcoming inspections',
          inspectionReminders.value,
          (value) => inspectionReminders.value = value,
        ),
        _buildSwitchTile(
          theme,
          colorScheme,
          'Report Alerts',
          'Get notified when reports are generated',
          reportAlerts.value,
          (value) => reportAlerts.value = value,
        ),
      ],
    );
  }

  Widget _buildSyncSettings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final autoSync = useState(true);
    final wifiOnly = useState(false);

    return Column(
      children: [
        _buildSwitchTile(
          theme,
          colorScheme,
          'Auto Sync',
          'Automatically sync data when online',
          autoSync.value,
          (value) => autoSync.value = value,
        ),
        _buildSwitchTile(
          theme,
          colorScheme,
          'WiFi Only',
          'Only sync when connected to WiFi',
          wifiOnly.value,
          (value) => wifiOnly.value = value,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Sync Now',
                style: ButtonStyle.outline,
                icon: Icons.sync,
                onPressed: () => _handleSyncNow(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomButton(
                text: 'View Sync Status',
                style: ButtonStyle.text,
                onPressed: () => _showSyncStatus(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStorageSettings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          'Storage Management',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        _buildStorageItem(theme, colorScheme, 'Photos & Media', '2.4 GB', 0.6),
        const SizedBox(height: 8),
        _buildStorageItem(theme, colorScheme, 'Inspection Data', '156 MB', 0.2),
        const SizedBox(height: 8),
        _buildStorageItem(theme, colorScheme, 'Reports & Documents', '89 MB', 0.1),
        const SizedBox(height: 16),
        CustomButton(
          text: 'Clear Cache',
          style: ButtonStyle.outline,
          icon: Icons.cleaning_services,
          onPressed: () => _handleClearCache(context),
        ),
      ],
    );
  }

  Widget _buildStorageItem(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String size,
    double progress,
  ) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: theme.textTheme.bodyMedium,
          ),
        ),
        Expanded(
          flex: 3,
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: colorScheme.surfaceVariant,
            valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 60,
          child: Text(
            size,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  Widget _buildSecuritySettings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final biometricAuth = useState(false);
    final autoLock = useState(true);

    return Column(
      children: [
        _buildSwitchTile(
          theme,
          colorScheme,
          'Biometric Authentication',
          'Use fingerprint or face recognition',
          biometricAuth.value,
          (value) => biometricAuth.value = value,
        ),
        _buildSwitchTile(
          theme,
          colorScheme,
          'Auto Lock',
          'Automatically lock app when inactive',
          autoLock.value,
          (value) => autoLock.value = value,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Change Password',
                style: ButtonStyle.outline,
                icon: Icons.lock,
                onPressed: () => _changePassword(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomButton(
                text: 'Security Log',
                style: ButtonStyle.text,
                onPressed: () => _viewSecurityLog(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAboutSettings(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      children: [
        _buildInfoTile(theme, colorScheme, 'Version', '1.0.0 (Build 1)'),
        _buildInfoTile(theme, colorScheme, 'Last Updated', 'December 15, 2023'),
        _buildInfoTile(theme, colorScheme, 'Database Version', '2.1.3'),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Check for Updates',
                style: ButtonStyle.outline,
                icon: Icons.system_update,
                onPressed: () => _checkForUpdates(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomButton(
                text: 'Privacy Policy',
                style: ButtonStyle.text,
                onPressed: () => _viewPrivacyPolicy(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoTile(
    ThemeData theme,
    ColorScheme colorScheme,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodyMedium,
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String subtitle,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildDangerZone(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    WidgetRef ref,
    ValueNotifier<bool> isLoading,
  ) {
    return Card(
      color: Colors.red.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.warning,
                  color: Colors.red,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  'Danger Zone',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    text: 'Reset App Data',
                    style: ButtonStyle.danger,
                    icon: Icons.restore,
                    onPressed: () => _showResetDataDialog(context),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomButton(
                    text: 'Sign Out',
                    style: ButtonStyle.outline,
                    icon: Icons.logout,
                    onPressed: () => _handleSignOut(context, ref, isLoading),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _handleSyncNow(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sync started...'),
      ),
    );
  }

  void _showSyncStatus(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sync Status'),
        content: const Text('Last sync: 2 minutes ago\nStatus: Up to date'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _handleClearCache(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cache'),
        content: const Text('This will clear temporary files and cached data. Continue?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cache cleared successfully'),
                ),
              );
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _changePassword(BuildContext context) {
    context.go(AppRoutes.changePassword);
  }

  void _viewSecurityLog(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Security log will be implemented soon'),
      ),
    );
  }

  void _checkForUpdates(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('You are using the latest version'),
      ),
    );
  }

  void _viewPrivacyPolicy(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Privacy policy will be implemented soon'),
      ),
    );
  }

  void _showResetDataDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset App Data'),
        content: const Text(
          'This will permanently delete all local data including inspections, photos, and settings. This action cannot be undone.\n\nAre you sure you want to continue?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Reset functionality will be implemented soon'),
                ),
              );
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  void _handleSignOut(BuildContext context, WidgetRef ref, ValueNotifier<bool> isLoading) async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              isLoading.value = true;
              
              try {
                await ref.read(authNotifierProvider.notifier).signOut();
                if (context.mounted) {
                  context.go(AppRoutes.login);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Sign out failed: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              } finally {
                isLoading.value = false;
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}