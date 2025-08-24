import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../app/providers/auth_provider.dart';
import '../../../../app/router/app_router.dart';

/// Dashboard page showing overview and quick actions
class DashboardPage extends HookConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authNotifierProvider);
    final isLoading = useState(false);

    return ResponsiveScaffold(
      title: 'Dashboard',
      body: LoadingOverlay(
        isLoading: isLoading.value,
        child: authState.when(
          data: (user) => _buildDashboardContent(context, theme, colorScheme, user),
          loading: () => const Center(
            child: LoadingIndicator(text: 'Loading dashboard...'),
          ),
          error: (error, stack) => _buildErrorState(context, theme, error),
        ),
      ),
    );
  }

  Widget _buildDashboardContent(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    dynamic user,
  ) {
    final screenType = context.screenType;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(screenType.isMobile ? 16 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWelcomeSection(theme, colorScheme, user),
          const SizedBox(height: 24),
          _buildQuickStats(context, theme, colorScheme),
          const SizedBox(height: 24),
          _buildQuickActions(context, theme, colorScheme),
          const SizedBox(height: 24),
          _buildRecentActivity(context, theme, colorScheme),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(
    ThemeData theme,
    ColorScheme colorScheme,
    dynamic user,
  ) {
    final now = DateTime.now();
    final hour = now.hour;
    String greeting;
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            colorScheme.primary,
            colorScheme.primary.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$greeting, ${user?.firstName ?? 'User'}!',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.onPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Welcome back to JSG Inspections. Here\'s what\'s happening today.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onPrimary.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(
                Icons.today,
                color: colorScheme.onPrimary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                _formatDate(now),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onPrimary.withOpacity(0.9),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final screenType = context.screenType;
    final isDesktop = screenType.isDesktop;
    
    final stats = [
      _StatCard(
        title: 'Total Inspections',
        value: '156',
        icon: Icons.assignment,
        color: colorScheme.primary,
        trend: '+12%',
        isPositive: true,
      ),
      _StatCard(
        title: 'Pending Reviews',
        value: '23',
        icon: Icons.pending_actions,
        color: colorScheme.secondary,
        trend: '+5',
        isPositive: false,
      ),
      _StatCard(
        title: 'Assets Tracked',
        value: '89',
        icon: Icons.inventory_2,
        color: colorScheme.tertiary,
        trend: '+3',
        isPositive: true,
      ),
      _StatCard(
        title: 'Reports Generated',
        value: '45',
        icon: Icons.analytics,
        color: colorScheme.error,
        trend: '+8%',
        isPositive: true,
      ),
    ];

    if (isDesktop) {
      return Row(
        children: stats
            .map((stat) => Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: _buildStatCard(theme, colorScheme, stat),
                  ),
                ))
            .toList(),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) => _buildStatCard(theme, colorScheme, stats[index]),
    );
  }

  Widget _buildStatCard(ThemeData theme, ColorScheme colorScheme, _StatCard stat) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: stat.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  stat.icon,
                  color: stat.color,
                  size: 24,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: stat.isPositive
                      ? Colors.green.withOpacity(0.1)
                      : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      stat.isPositive ? Icons.trending_up : Icons.trending_flat,
                      size: 12,
                      color: stat.isPositive ? Colors.green : Colors.orange,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      stat.trend,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: stat.isPositive ? Colors.green : Colors.orange,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            stat.value,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            stat.title,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final screenType = context.screenType;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: theme.textTheme.titleLarge?.copyWith(
            color: colorScheme.onSurface,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        if (screenType.isDesktop)
          Row(
            children: [
              Expanded(child: _buildActionCard(
                context, theme, colorScheme,
                'New Inspection',
                'Start a new inspection',
                Icons.add_circle,
                colorScheme.primary,
                () => context.go(AppRoutes.newInspection),
              )),
              const SizedBox(width: 16),
              Expanded(child: _buildActionCard(
                context, theme, colorScheme,
                'Scan QR Code',
                'Scan asset QR code',
                Icons.qr_code_scanner,
                colorScheme.secondary,
                () => _handleQRScan(context),
              )),
              const SizedBox(width: 16),
              Expanded(child: _buildActionCard(
                context, theme, colorScheme,
                'View Reports',
                'Access inspection reports',
                Icons.analytics,
                colorScheme.tertiary,
                () => context.go(AppRoutes.reports),
              )),
            ],
          )
        else
          Column(
            children: [
              _buildActionCard(
                context, theme, colorScheme,
                'New Inspection',
                'Start a new inspection',
                Icons.add_circle,
                colorScheme.primary,
                () => context.go(AppRoutes.newInspection),
              ),
              const SizedBox(height: 12),
              _buildActionCard(
                context, theme, colorScheme,
                'Scan QR Code',
                'Scan asset QR code',
                Icons.qr_code_scanner,
                colorScheme.secondary,
                () => _handleQRScan(context),
              ),
              const SizedBox(height: 12),
              _buildActionCard(
                context, theme, colorScheme,
                'View Reports',
                'Access inspection reports',
                Icons.analytics,
                colorScheme.tertiary,
                () => context.go(AppRoutes.reports),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: color,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: colorScheme.onSurface,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: colorScheme.onSurfaceVariant,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Recent Activity',
              style: theme.textTheme.titleLarge?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go(AppRoutes.inspections),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: colorScheme.outline.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Column(
            children: [
              _buildActivityItem(
                theme, colorScheme,
                'Inspection completed for Asset #A001',
                'Fire extinguisher inspection passed',
                Icons.check_circle,
                Colors.green,
                '2 hours ago',
              ),
              const Divider(height: 1),
              _buildActivityItem(
                theme, colorScheme,
                'New asset registered',
                'Emergency exit light #E045 added',
                Icons.add_circle,
                colorScheme.primary,
                '4 hours ago',
              ),
              const Divider(height: 1),
              _buildActivityItem(
                theme, colorScheme,
                'Report generated',
                'Monthly safety report ready',
                Icons.description,
                colorScheme.secondary,
                '1 day ago',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem(
    ThemeData theme,
    ColorScheme colorScheme,
    String title,
    String subtitle,
    IconData icon,
    Color iconColor,
    String time,
  ) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurface,
                    fontWeight: FontWeight.w600,
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
          Text(
            time,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, ThemeData theme, Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: theme.colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to load dashboard',
            style: theme.textTheme.titleLarge?.copyWith(
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Retry',
            onPressed: () {
              // Refresh the page or retry loading
            },
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  void _handleQRScan(BuildContext context) {
    // TODO: Implement QR code scanning
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('QR code scanning will be implemented soon'),
      ),
    );
  }
}

/// Data class for stat cards
class _StatCard {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;
  final bool isPositive;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
    required this.isPositive,
  });
}