import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers/auth_provider.dart';
import 'navigation_sidebar.dart';
import 'responsive_scaffold.dart';

class MainScaffold extends ConsumerWidget {
  final Widget child;

  const MainScaffold({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth > 1200;
    final isTablet = screenWidth > 768 && screenWidth <= 1200;
    final isMobile = screenWidth <= 768;

    if (isDesktop) {
      return _buildDesktopLayout(context, ref);
    } else if (isTablet) {
      return _buildTabletLayout(context, ref);
    } else {
      return _buildMobileLayout(context, ref);
    }
  }

  Widget _buildDesktopLayout(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Row(
        children: [
          const NavigationSidebar(),
          Expanded(
            child: child,
          ),
        ],
      ),
    );
  }

  Widget _buildTabletLayout(BuildContext context, WidgetRef ref) {
    return Scaffold(
      drawer: const Drawer(
        child: NavigationSidebar(),
      ),
      body: child,
    );
  }

  Widget _buildMobileLayout(BuildContext context, WidgetRef ref) {
    return Scaffold(
      drawer: const Drawer(
        child: NavigationSidebar(),
      ),
      body: child,
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Theme.of(context).colorScheme.primary,
      unselectedItemColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment),
          label: 'Inspections',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.inventory),
          label: 'Assets',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.folder),
          label: 'Folders',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.more_horiz),
          label: 'More',
        ),
      ],
      onTap: (index) {
        switch (index) {
          case 0:
            context.go('/dashboard');
            break;
          case 1:
            context.go('/inspections');
            break;
          case 2:
            context.go('/assets');
            break;
          case 3:
            context.go('/folders');
            break;
          case 4:
            _showMoreOptions(context);
            break;
        }
      },
    );
  }

  void _showMoreOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Forms'),
            onTap: () {
              Navigator.pop(context);
              context.go('/forms');
            },
          ),
          ListTile(
            leading: const Icon(Icons.analytics),
            title: const Text('Reports'),
            onTap: () {
              Navigator.pop(context);
              context.go('/reports');
            },
          ),
          ListTile(
            leading: const Icon(Icons.qr_code_scanner),
            title: const Text('QR Scanner'),
            onTap: () {
              Navigator.pop(context);
              context.go('/qr-scanner');
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings'),
            onTap: () {
              Navigator.pop(context);
              context.go('/settings');
            },
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Profile'),
            onTap: () {
              Navigator.pop(context);
              context.go('/profile');
            },
          ),
        ],
      ),
    );
  }
}