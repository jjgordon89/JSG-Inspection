import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/presentation/widgets/responsive_scaffold.dart';
import '../../../../shared/presentation/widgets/custom_text_field.dart';
import '../../../../shared/presentation/widgets/custom_button.dart';
import '../../../../shared/presentation/widgets/loading_overlay.dart';
import '../../../../app/providers/auth_provider.dart';
import '../../../../core/utils/constants.dart';
import '../../../../core/utils/validators.dart';

class ForgotPasswordPage extends HookConsumerWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final emailController = useTextEditingController();
    final formKey = useMemoized(() => GlobalKey<FormState>());
    final isEmailSent = useState(false);
    
    final authState = ref.watch(authNotifierProvider);
    final authNotifier = ref.read(authNotifierProvider.notifier);
    
    // Listen to auth state changes
    ref.listen(authNotifierProvider, (previous, next) {
      next.whenOrNull(
        data: (_) {
          if (!isEmailSent.value) {
            isEmailSent.value = true;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Password reset email sent successfully'),
                backgroundColor: Theme.of(context).colorScheme.primary,
              ),
            );
          }
        },
        error: (error, stackTrace) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to send reset email: ${error.toString()}'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        },
      );
    });
    
    Future<void> handleForgotPassword() async {
      if (formKey.currentState?.validate() ?? false) {
        await authNotifier.forgotPassword(
          email: emailController.text.trim(),
        );
      }
    }
    
    return LoadingOverlay(
      isLoading: authState.isLoading,
      child: ResponsiveScaffold(
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Back button
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: () => context.go('/login'),
                        icon: const Icon(Icons.arrow_back),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Icon and title
                    Icon(
                      isEmailSent.value ? Icons.mark_email_read : Icons.lock_reset,
                      size: 80,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      isEmailSent.value ? 'Check Your Email' : 'Reset Password',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isEmailSent.value
                          ? 'We\'ve sent a password reset link to ${emailController.text}'
                          : 'Enter your email address and we\'ll send you a link to reset your password',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    
                    if (!isEmailSent.value) ..[
                      // Email field
                      CustomTextField(
                        controller: emailController,
                        labelText: 'Email',
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: Validators.email,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => handleForgotPassword(),
                      ),
                      const SizedBox(height: 24),
                      
                      // Send reset email button
                      CustomButton(
                        onPressed: handleForgotPassword,
                        text: 'Send Reset Email',
                        isLoading: authState.isLoading,
                      ),
                    ] else ..[
                      // Resend email button
                      CustomButton(
                        onPressed: () {
                          isEmailSent.value = false;
                        },
                        text: 'Send Another Email',
                        variant: ButtonVariant.outline,
                      ),
                      const SizedBox(height: 16),
                      
                      // Back to login button
                      CustomButton(
                        onPressed: () => context.go('/login'),
                        text: 'Back to Login',
                      ),
                    ],
                    
                    const SizedBox(height: 16),
                    
                    // Login link
                    if (!isEmailSent.value)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Remember your password? ',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextButton(
                            onPressed: () => context.go('/login'),
                            child: const Text('Sign In'),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}