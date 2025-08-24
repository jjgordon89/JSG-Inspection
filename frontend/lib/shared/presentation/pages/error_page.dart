import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../widgets/custom_button.dart';
import '../../../app/router/app_router.dart';

/// Error page for handling 404 and other application errors
class ErrorPage extends StatelessWidget {
  final String? error;
  final String? stackTrace;
  final int? statusCode;

  const ErrorPage({
    super.key,
    this.error,
    this.stackTrace,
    this.statusCode,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isNotFound = statusCode == 404;
    
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Error Icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isNotFound ? Icons.search_off : Icons.error_outline,
                  size: 60,
                  color: colorScheme.error,
                ),
              ),
              const SizedBox(height: 32),
              
              // Error Title
              Text(
                _getErrorTitle(isNotFound),
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              // Error Description
              Text(
                _getErrorDescription(isNotFound),
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CustomButton(
                    text: 'Go Home',
                    style: ButtonStyle.primary,
                    icon: Icons.home,
                    onPressed: () => context.go(AppRoutes.dashboard),
                  ),
                  const SizedBox(width: 16),
                  CustomButton(
                    text: 'Go Back',
                    style: ButtonStyle.outline,
                    icon: Icons.arrow_back,
                    onPressed: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go(AppRoutes.dashboard);
                      }
                    },
                  ),
                ],
              ),
              
              // Debug Information (only in debug mode)
              if (error != null && _isDebugMode()) ..[
                const SizedBox(height: 48),
                ExpansionTile(
                  title: Text(
                    'Debug Information',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: colorScheme.surfaceVariant.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: colorScheme.outline.withOpacity(0.3),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (statusCode != null) ..[
                            Text(
                              'Status Code: $statusCode',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontFamily: 'monospace',
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 8),
                          ],
                          Text(
                            'Error: $error',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontFamily: 'monospace',
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                          if (stackTrace != null) ..[
                            const SizedBox(height: 8),
                            Text(
                              'Stack Trace:',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              stackTrace!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontFamily: 'monospace',
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _getErrorTitle(bool isNotFound) {
    if (isNotFound) {
      return 'Page Not Found';
    }
    return 'Oops! Something went wrong';
  }

  String _getErrorDescription(bool isNotFound) {
    if (isNotFound) {
      return 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
    }
    return 'We encountered an unexpected error. Please try again or contact support if the problem persists.';
  }

  bool _isDebugMode() {
    bool debugMode = false;
    assert(debugMode = true);
    return debugMode;
  }
}

/// Specific 404 Not Found page
class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ErrorPage(statusCode: 404);
  }
}

/// Generic error page with custom message
class GenericErrorPage extends StatelessWidget {
  final String message;
  final String? details;
  final VoidCallback? onRetry;

  const GenericErrorPage({
    super.key,
    required this.message,
    this.details,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Error Icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.warning_amber_rounded,
                  size: 60,
                  color: colorScheme.error,
                ),
              ),
              const SizedBox(height: 32),
              
              // Error Message
              Text(
                message,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              
              if (details != null) ..[
                const SizedBox(height: 16),
                Text(
                  details!,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              
              const SizedBox(height: 32),
              
              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (onRetry != null) ..[
                    CustomButton(
                      text: 'Retry',
                      style: ButtonStyle.primary,
                      icon: Icons.refresh,
                      onPressed: onRetry,
                    ),
                    const SizedBox(width: 16),
                  ],
                  CustomButton(
                    text: 'Go Home',
                    style: onRetry != null ? ButtonStyle.outline : ButtonStyle.primary,
                    icon: Icons.home,
                    onPressed: () => context.go(AppRoutes.dashboard),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Network error page
class NetworkErrorPage extends StatelessWidget {
  final VoidCallback? onRetry;

  const NetworkErrorPage({super.key, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Network Error Icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.wifi_off,
                  size: 60,
                  color: colorScheme.error,
                ),
              ),
              const SizedBox(height: 32),
              
              // Error Title
              Text(
                'No Internet Connection',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              // Error Description
              Text(
                'Please check your internet connection and try again. You can still access offline features.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (onRetry != null) ..[
                    CustomButton(
                      text: 'Try Again',
                      style: ButtonStyle.primary,
                      icon: Icons.refresh,
                      onPressed: onRetry,
                    ),
                    const SizedBox(width: 16),
                  ],
                  CustomButton(
                    text: 'Continue Offline',
                    style: onRetry != null ? ButtonStyle.outline : ButtonStyle.primary,
                    icon: Icons.offline_bolt,
                    onPressed: () => context.go(AppRoutes.dashboard),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}