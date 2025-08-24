import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../../core/models/user.dart';
import '../../core/services/auth_service.dart';
import '../../core/exceptions/app_exceptions.dart';

part 'auth_provider.freezed.dart';

// Auth State
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState.initial()) {
    _checkAuthStatus();
  }

  // Check if user is already authenticated
  Future<void> _checkAuthStatus() async {
    try {
      state = const AuthState.loading();
      
      if (_authService.isAuthenticated && _authService.userInfo != null) {
        final user = User.fromJson(_authService.userInfo!);
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  // Login
  Future<void> login(String email, String password) async {
    try {
      state = const AuthState.loading();
      
      await _authService.login(email, password);
      
      if (_authService.isAuthenticated && _authService.userInfo != null) {
        final user = User.fromJson(_authService.userInfo!);
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.error('Login failed');
      }
    } on AppException catch (e) {
      state = AuthState.error(e.message);
    } catch (e) {
      state = AuthState.error('Login failed: ${e.toString()}');
    }
  }

  // Register
  Future<void> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? company,
  }) async {
    try {
      state = const AuthState.loading();
      
      await _authService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        company: company,
      );
      
      if (_authService.isAuthenticated && _authService.userInfo != null) {
        final user = User.fromJson(_authService.userInfo!);
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.error('Registration failed');
      }
    } on AppException catch (e) {
      state = AuthState.error(e.message);
    } catch (e) {
      state = AuthState.error('Registration failed: ${e.toString()}');
    }
  }

  // Forgot Password
  Future<void> forgotPassword(String email) async {
    try {
      state = const AuthState.loading();
      await _authService.forgotPassword(email);
      state = const AuthState.unauthenticated();
    } on AppException catch (e) {
      state = AuthState.error(e.message);
    } catch (e) {
      state = AuthState.error('Failed to send reset email: ${e.toString()}');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      state = const AuthState.loading();
      await _authService.logout();
      state = const AuthState.unauthenticated();
    } catch (e) {
      // Even if logout fails, clear local state
      await _authService.logout();
      state = const AuthState.unauthenticated();
    }
  }

  // Update Profile
  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? company,
    String? phone,
  }) async {
    try {
      state = const AuthState.loading();
      
      await _authService.updateProfile(
        firstName: firstName,
        lastName: lastName,
        company: company,
        phone: phone,
      );
      
      // Refresh user data
      await _checkAuthStatus();
    } on AppException catch (e) {
      state = AuthState.error(e.message);
    } catch (e) {
      state = AuthState.error('Failed to update profile: ${e.toString()}');
    }
  }

  // Change Password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      state = const AuthState.loading();
      
      await _authService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      
      // Refresh user data
      await _checkAuthStatus();
    } on AppException catch (e) {
      state = AuthState.error(e.message);
    } catch (e) {
      state = AuthState.error('Failed to change password: ${e.toString()}');
    }
  }

  // Clear Error
  void clearError() {
    if (state is _Error) {
      state = const AuthState.unauthenticated();
    }
  }
}

// Providers
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService.instance;
});

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Helper Providers
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authNotifierProvider);
  return authState.maybeWhen(
    authenticated: (user) => user,
    orElse: () => null,
  );
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authNotifierProvider);
  return authState.maybeWhen(
    authenticated: (_) => true,
    orElse: () => false,
  );
});

final isLoadingProvider = Provider<bool>((ref) {
  final authState = ref.watch(authNotifierProvider);
  return authState.maybeWhen(
    loading: () => true,
    orElse: () => false,
  );
});