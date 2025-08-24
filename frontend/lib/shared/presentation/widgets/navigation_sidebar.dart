import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../app/providers/auth_provider.dart';

/// Navigation item data class
class NavigationItem {
  final String label;
  final IconData icon;
  final IconData? selectedIcon;
  final String route;
  final List<NavigationItem>? children;
  final bool requiresAuth;
  final List<String>? requiredRoles;

  const NavigationItem({
    required this.label,
    required this.icon,
    this.selectedIcon,
    required this.route,
    this.children,
    this.requiresAuth = true,
    this.requiredRoles,
  });

  bool get hasChildren => children != null && children!.isNotEmpty;
}

/// Navigation sidebar widget for desktop layout
class NavigationSidebar extends ConsumerStatefulWidget {
  final double width;
  final bool isCollapsed;
  final VoidCallback? onToggleCollapse;

  const NavigationSidebar({
    super.key,
    this.width = 280,
    this.isCollapsed = false,
    this.onToggleCollapse,
  });

  @override
  ConsumerState<NavigationSidebar> createState() => _NavigationSidebarState();
}

class _NavigationSidebarState extends ConsumerState<NavigationSidebar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _widthAnimation;
  final Set<String> _expandedItems = {};

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _widthAnimation = Tween<double>(
      begin: widget.width,
      end: 72,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    if (widget.isCollapsed) {
      _animationController.forward();
    }
  }

  @override
  void didUpdateWidget(NavigationSidebar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isCollapsed != oldWidget.isCollapsed) {
      if (widget.isCollapsed) {
        _animationController.forward();
        _expandedItems.clear();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authNotifierProvider);
    final currentLocation = GoRouterState.of(context).uri.path;

    return AnimatedBuilder(
      animation: _widthAnimation,
      builder: (context, child) {
        final isCollapsed = _animationController.value > 0.5;
        
        return Container(
          width: _widthAnimation.value,
          decoration: BoxDecoration(
            color: colorScheme.surface,
            border: Border(
              right: BorderSide(
                color: colorScheme.outline.withOpacity(0.2),
                width: 1,
              ),
            ),
          ),
          child: Column(
            children: [
              _buildHeader(theme, colorScheme, isCollapsed),
              Expanded(
                child: _buildNavigationList(
                  theme,
                  colorScheme,
                  currentLocation,
                  authState,
                  isCollapsed,
                ),
              ),
              _buildFooter(theme, colorScheme, authState, isCollapsed),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(ThemeData theme, ColorScheme colorScheme, bool isCollapsed) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.assignment_turned_in,
            size: 32,
            color: colorScheme.primary,
          ),
          if (!isCollapsed) ..[
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'JSG Inspections',
                style: theme.textTheme.titleLarge?.copyWith(
                  color: colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
          IconButton(
            onPressed: widget.onToggleCollapse,
            icon: Icon(
              isCollapsed ? Icons.menu_open : Icons.menu,
              color: colorScheme.onSurfaceVariant,
            ),
            tooltip: isCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationList(
    ThemeData theme,
    ColorScheme colorScheme,
    String currentLocation,
    AsyncValue authState,
    bool isCollapsed,
  ) {
    final navigationItems = _getNavigationItems();
    
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: navigationItems.length,
      itemBuilder: (context, index) {
        final item = navigationItems[index];
        
        // Check if user has access to this item
        if (item.requiresAuth && !authState.hasValue) {
          return const SizedBox.shrink();
        }
        
        if (item.requiredRoles != null && authState.hasValue) {
          final user = authState.value;
          if (user?.role == null || !item.requiredRoles!.contains(user!.role)) {
            return const SizedBox.shrink();
          }
        }
        
        return _buildNavigationItem(
          theme,
          colorScheme,
          item,
          currentLocation,
          isCollapsed,
        );
      },
    );
  }

  Widget _buildNavigationItem(
    ThemeData theme,
    ColorScheme colorScheme,
    NavigationItem item,
    String currentLocation,
    bool isCollapsed,
  ) {
    final isSelected = _isItemSelected(item, currentLocation);
    final isExpanded = _expandedItems.contains(item.route);
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: ListTile(
            leading: Icon(
              isSelected && item.selectedIcon != null
                  ? item.selectedIcon!
                  : item.icon,
              color: isSelected
                  ? colorScheme.primary
                  : colorScheme.onSurfaceVariant,
            ),
            title: isCollapsed
                ? null
                : Text(
                    item.label,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isSelected
                          ? colorScheme.primary
                          : colorScheme.onSurface,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
            trailing: isCollapsed
                ? null
                : item.hasChildren
                    ? Icon(
                        isExpanded ? Icons.expand_less : Icons.expand_more,
                        color: colorScheme.onSurfaceVariant,
                      )
                    : null,
            selected: isSelected,
            selectedTileColor: colorScheme.primary.withOpacity(0.1),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            onTap: () => _handleItemTap(item, isCollapsed),
            tooltip: isCollapsed ? item.label : null,
          ),
        ),
        if (!isCollapsed && item.hasChildren && isExpanded)
          ...item.children!.map(
            (child) => Padding(
              padding: const EdgeInsets.only(left: 16),
              child: _buildNavigationItem(
                theme,
                colorScheme,
                child,
                currentLocation,
                false,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildFooter(
    ThemeData theme,
    ColorScheme colorScheme,
    AsyncValue authState,
    bool isCollapsed,
  ) {
    if (!authState.hasValue) {
      return const SizedBox.shrink();
    }

    final user = authState.value!;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: isCollapsed ? 16 : 20,
            backgroundColor: colorScheme.primary,
            child: Text(
              user.firstName.isNotEmpty ? user.firstName[0].toUpperCase() : 'U',
              style: theme.textTheme.titleMedium?.copyWith(
                color: colorScheme.onPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          if (!isCollapsed) ..[
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${user.firstName} ${user.lastName}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurface,
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    user.role ?? 'User',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_vert,
                color: colorScheme.onSurfaceVariant,
              ),
              onSelected: (value) => _handleUserMenuAction(value),
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'profile',
                  child: Row(
                    children: [
                      Icon(Icons.person, color: colorScheme.onSurfaceVariant),
                      const SizedBox(width: 12),
                      const Text('Profile'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'settings',
                  child: Row(
                    children: [
                      Icon(Icons.settings, color: colorScheme.onSurfaceVariant),
                      const SizedBox(width: 12),
                      const Text('Settings'),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                PopupMenuItem(
                  value: 'logout',
                  child: Row(
                    children: [
                      Icon(Icons.logout, color: colorScheme.error),
                      const SizedBox(width: 12),
                      Text(
                        'Logout',
                        style: TextStyle(color: colorScheme.error),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  List<NavigationItem> _getNavigationItems() {
    return [
      const NavigationItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        selectedIcon: Icons.dashboard,
        route: AppRoutes.dashboard,
      ),
      const NavigationItem(
        label: 'Inspections',
        icon: Icons.assignment_outlined,
        selectedIcon: Icons.assignment,
        route: AppRoutes.inspections,
        children: [
          NavigationItem(
            label: 'All Inspections',
            icon: Icons.list_outlined,
            selectedIcon: Icons.list,
            route: AppRoutes.inspections,
          ),
          NavigationItem(
            label: 'New Inspection',
            icon: Icons.add_circle_outline,
            selectedIcon: Icons.add_circle,
            route: AppRoutes.newInspection,
          ),
          NavigationItem(
            label: 'Templates',
            icon: Icons.description_outlined,
            selectedIcon: Icons.description,
            route: AppRoutes.formTemplates,
          ),
        ],
      ),
      const NavigationItem(
        label: 'Assets',
        icon: Icons.inventory_2_outlined,
        selectedIcon: Icons.inventory_2,
        route: AppRoutes.assets,
      ),
      const NavigationItem(
        label: 'Folders',
        icon: Icons.folder_outlined,
        selectedIcon: Icons.folder,
        route: AppRoutes.folders,
      ),
      const NavigationItem(
        label: 'Reports',
        icon: Icons.analytics_outlined,
        selectedIcon: Icons.analytics,
        route: AppRoutes.reports,
      ),
      const NavigationItem(
        label: 'Settings',
        icon: Icons.settings_outlined,
        selectedIcon: Icons.settings,
        route: AppRoutes.settings,
        requiredRoles: ['admin', 'manager'],
      ),
    ];
  }

  bool _isItemSelected(NavigationItem item, String currentLocation) {
    if (currentLocation == item.route) {
      return true;
    }
    
    if (item.hasChildren) {
      return item.children!.any((child) => _isItemSelected(child, currentLocation));
    }
    
    return currentLocation.startsWith(item.route) && item.route != '/';
  }

  void _handleItemTap(NavigationItem item, bool isCollapsed) {
    if (item.hasChildren && !isCollapsed) {
      setState(() {
        if (_expandedItems.contains(item.route)) {
          _expandedItems.remove(item.route);
        } else {
          _expandedItems.add(item.route);
        }
      });
    } else {
      context.go(item.route);
    }
  }

  void _handleUserMenuAction(String action) {
    switch (action) {
      case 'profile':
        context.go(AppRoutes.profile);
        break;
      case 'settings':
        context.go(AppRoutes.settings);
        break;
      case 'logout':
        ref.read(authNotifierProvider.notifier).logout();
        break;
    }
  }
}

/// Bottom navigation bar for mobile layout
class BottomNavigationBarWidget extends ConsumerWidget {
  const BottomNavigationBarWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocation = GoRouterState.of(context).uri.path;
    final authState = ref.watch(authNotifierProvider);
    
    if (!authState.hasValue) {
      return const SizedBox.shrink();
    }

    final items = _getBottomNavigationItems();
    final currentIndex = _getCurrentIndex(currentLocation, items);

    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: (index) {
        if (index < items.length) {
          context.go(items[index].route);
        }
      },
      destinations: items
          .map(
            (item) => NavigationDestination(
              icon: Icon(item.icon),
              selectedIcon: Icon(item.selectedIcon ?? item.icon),
              label: item.label,
            ),
          )
          .toList(),
    );
  }

  List<NavigationItem> _getBottomNavigationItems() {
    return [
      const NavigationItem(
        label: 'Dashboard',
        icon: Icons.dashboard_outlined,
        selectedIcon: Icons.dashboard,
        route: AppRoutes.dashboard,
      ),
      const NavigationItem(
        label: 'Inspections',
        icon: Icons.assignment_outlined,
        selectedIcon: Icons.assignment,
        route: AppRoutes.inspections,
      ),
      const NavigationItem(
        label: 'Assets',
        icon: Icons.inventory_2_outlined,
        selectedIcon: Icons.inventory_2,
        route: AppRoutes.assets,
      ),
      const NavigationItem(
        label: 'Reports',
        icon: Icons.analytics_outlined,
        selectedIcon: Icons.analytics,
        route: AppRoutes.reports,
      ),
    ];
  }

  int _getCurrentIndex(String currentLocation, List<NavigationItem> items) {
    for (int i = 0; i < items.length; i++) {
      if (currentLocation.startsWith(items[i].route) && items[i].route != '/') {
        return i;
      }
    }
    return 0;
  }
}