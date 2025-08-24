import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/database_provider.dart';
import '../widgets/loading_overlay.dart';

/// Splash screen that handles app initialization
class SplashPage extends HookConsumerWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    // Initialize app on first load
    useEffect(() {
      _initializeApp(context, ref);
      return null;
    }, []);

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: colorScheme.primary,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: colorScheme.primary.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Icon(
                Icons.assignment_turned_in,
                size: 60,
                color: colorScheme.onPrimary,
              ),
            ),
            const SizedBox(height: 32),
            
            // App Name
            Text(
              'JSG Inspections',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            
            // App Tagline
            Text(
              'Professional Inspection Management',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 48),
            
            // Loading Indicator
            const LoadingIndicator(),
            const SizedBox(height: 16),
            
            // Loading Text
            Text(
              'Initializing...',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _initializeApp(BuildContext context, WidgetRef ref) async {
    try {
      // Initialize database
      await ref.read(databaseServiceProvider.future);
      
      // Check authentication status
      final authState = await ref.read(authNotifierProvider.future);
      
      // Add a minimum splash duration for better UX
      await Future.delayed(const Duration(seconds: 2));
      
      if (!context.mounted) return;
      
      // Navigate based on auth status
      if (authState.isAuthenticated) {
        context.go(AppRoutes.dashboard);
      } else {
        context.go(AppRoutes.login);
      }
    } catch (error) {
      if (!context.mounted) return;
      
      // Show error and navigate to login
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Initialization failed: ${error.toString()}'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
      
      context.go(AppRoutes.login);
    }
  }
}

/// Splash screen with custom initialization logic
class CustomSplashPage extends HookConsumerWidget {
  final Future<void> Function() onInitialize;
  final String? title;
  final String? subtitle;
  final Widget? logo;

  const CustomSplashPage({
    super.key,
    required this.onInitialize,
    this.title,
    this.subtitle,
    this.logo,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final initializationState = useState<_InitializationState>(_InitializationState.loading);
    final errorMessage = useState<String?>(null);
    
    // Initialize app on first load
    useEffect(() {
      _performInitialization(initializationState, errorMessage);
      return null;
    }, []);

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            logo ?? Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: colorScheme.primary,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: colorScheme.primary.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Icon(
                Icons.assignment_turned_in,
                size: 60,
                color: colorScheme.onPrimary,
              ),
            ),
            const SizedBox(height: 32),
            
            // Title
            if (title != null) ..[
              Text(
                title!,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),
            ],
            
            // Subtitle
            if (subtitle != null) ..[
              Text(
                subtitle!,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 48),
            ],
            
            // State-based content
            _buildStateContent(context, initializationState.value, errorMessage.value),
          ],
        ),
      ),
    );
  }

  Widget _buildStateContent(BuildContext context, _InitializationState state, String? error) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    switch (state) {
      case _InitializationState.loading:
        return Column(
          children: [
            const LoadingIndicator(),
            const SizedBox(height: 16),
            Text(
              'Initializing...',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        );
        
      case _InitializationState.error:
        return Column(
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Initialization Failed',
              style: theme.textTheme.titleMedium?.copyWith(
                color: colorScheme.error,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (error != null) ..[
              const SizedBox(height: 8),
              Text(
                error,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go(AppRoutes.login),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        );
        
      case _InitializationState.success:
        return Column(
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 48,
              color: colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Ready!',
              style: theme.textTheme.titleMedium?.copyWith(
                color: colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        );
    }
  }

  Future<void> _performInitialization(
    ValueNotifier<_InitializationState> state,
    ValueNotifier<String?> errorMessage,
  ) async {
    try {
      state.value = _InitializationState.loading;
      errorMessage.value = null;
      
      await onInitialize();
      
      state.value = _InitializationState.success;
      
      // Show success state briefly before continuing
      await Future.delayed(const Duration(milliseconds: 500));
    } catch (error) {
      state.value = _InitializationState.error;
      errorMessage.value = error.toString();
    }
  }
}

enum _InitializationState {
  loading,
  success,
  error,
}

/// Minimal splash screen for quick transitions
class MinimalSplashPage extends StatelessWidget {
  final Widget? child;
  final Duration duration;
  final VoidCallback? onComplete;

  const MinimalSplashPage({
    super.key,
    this.child,
    this.duration = const Duration(seconds: 1),
    this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    // Auto-complete after duration
    Future.delayed(duration, () {
      if (onComplete != null) {
        onComplete!();
      }
    });
    
    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Center(
        child: child ?? Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.assignment_turned_in,
              size: 80,
              color: colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'JSG Inspections',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}