import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:crypto/crypto.dart';

import '../utils/constants.dart';
import '../exceptions/app_exceptions.dart';
import 'storage_service.dart';
import 'network_service.dart';

class AuthService {
  static AuthService? _instance;
  static AuthService get instance => _instance ??= AuthService._();
  
  AuthService._();
  
  final StorageService _storage = StorageService.instance;
  final NetworkService _network = NetworkService.instance;
  
  String? _accessToken;
  String? _refreshToken;
  Map<String, dynamic>? _userInfo;
  DateTime? _tokenExpiry;
  
  // Authentication state
  bool get isAuthenticated => _accessToken != null && !isTokenExpired;
  bool get isTokenExpired {
    if (_tokenExpiry == null) return true;
    return DateTime.now().isAfter(_tokenExpiry!);
  }
  
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  Map<String, dynamic>? get userInfo => _userInfo;
  String? get userId => _userInfo?['id'];
  String? get userEmail => _userInfo?['email'];
  String? get userName => _userInfo?['name'];
  List<String> get userRoles => List<String>.from(_userInfo?['roles'] ?? []);
  
  // Initialize authentication service
  Future<void> initialize() async {
    try {
      await _loadStoredTokens();
      
      if (_accessToken != null) {
        await _validateAndRefreshToken();
      }
      
      debugPrint('AuthService initialized');
    } catch (e) {
      debugPrint('Failed to initialize AuthService: $e');
      await clearAuth();
    }
  }
  
  // Load stored tokens from secure storage
  Future<void> _loadStoredTokens() async {
    try {
      _accessToken = await _storage.getSecureData(AppConstants.accessTokenKey);
      _refreshToken = await _storage.getSecureData(AppConstants.refreshTokenKey);
      
      if (_accessToken != null) {
        _parseTokenInfo(_accessToken!);
        
        // Load user info from storage
        final userInfoJson = await _storage.getSecureJson(AppConstants.userInfoKey);
        if (userInfoJson != null) {
          _userInfo = userInfoJson;
        }
      }
    } catch (e) {
      debugPrint('Failed to load stored tokens: $e');
      throw AuthException('Failed to load authentication data');
    }
  }
  
  // Parse token information
  void _parseTokenInfo(String token) {
    try {
      if (JwtDecoder.isExpired(token)) {
        _tokenExpiry = DateTime.now().subtract(const Duration(seconds: 1));
      } else {
        _tokenExpiry = JwtDecoder.getExpirationDate(token);
      }
      
      final decodedToken = JwtDecoder.decode(token);
      if (_userInfo == null) {
        _userInfo = {
          'id': decodedToken['sub'],
          'email': decodedToken['email'],
          'name': decodedToken['name'],
          'roles': decodedToken['roles'] ?? [],
        };
      }
    } catch (e) {
      debugPrint('Failed to parse token: $e');
      _tokenExpiry = DateTime.now().subtract(const Duration(seconds: 1));
    }
  }
  
  // Validate and refresh token if needed
  Future<bool> _validateAndRefreshToken() async {
    if (_accessToken == null) return false;
    
    try {
      // Check if token is about to expire (within 5 minutes)
      final now = DateTime.now();
      final expiryBuffer = _tokenExpiry?.subtract(const Duration(minutes: 5));
      
      if (expiryBuffer != null && now.isAfter(expiryBuffer)) {
        return await refreshAuthToken();
      }
      
      return true;
    } catch (e) {
      debugPrint('Token validation failed: $e');
      return false;
    }
  }
  
  // Login with email and password
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    try {
      final response = await _network.post(
        ApiEndpoints.login,
        data: {
          'email': email.toLowerCase().trim(),
          'password': password,
          'remember_me': rememberMe,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        await _handleAuthResponse(data);
        
        return {
          'success': true,
          'user': _userInfo,
          'message': 'Login successful',
        };
      } else {
        throw AuthException('Invalid credentials');
      }
    } catch (e) {
      debugPrint('Login failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Login failed: ${e.toString()}');
    }
  }
  
  // Register new user
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    String? phone,
    String? organization,
  }) async {
    try {
      final response = await _network.post(
        ApiEndpoints.register,
        data: {
          'email': email.toLowerCase().trim(),
          'password': password,
          'name': name.trim(),
          if (phone != null) 'phone': phone.trim(),
          if (organization != null) 'organization': organization.trim(),
        },
      );
      
      if (response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        
        // Some APIs return tokens immediately, others require email verification
        if (data.containsKey('access_token')) {
          await _handleAuthResponse(data);
          return {
            'success': true,
            'user': _userInfo,
            'message': 'Registration successful',
            'requires_verification': false,
          };
        } else {
          return {
            'success': true,
            'message': 'Registration successful. Please verify your email.',
            'requires_verification': true,
          };
        }
      } else {
        throw AuthException('Registration failed');
      }
    } catch (e) {
      debugPrint('Registration failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Registration failed: ${e.toString()}');
    }
  }
  
  // Handle authentication response
  Future<void> _handleAuthResponse(Map<String, dynamic> data) async {
    try {
      _accessToken = data['access_token'] as String?;
      _refreshToken = data['refresh_token'] as String?;
      
      if (_accessToken == null) {
        throw AuthException('No access token received');
      }
      
      // Parse token information
      _parseTokenInfo(_accessToken!);
      
      // Extract user info from response or token
      if (data.containsKey('user')) {
        _userInfo = data['user'] as Map<String, dynamic>;
      }
      
      // Store tokens securely
      await _storeTokens();
      
      debugPrint('Authentication successful for user: ${_userInfo?['email']}');
    } catch (e) {
      debugPrint('Failed to handle auth response: $e');
      throw AuthException('Failed to process authentication response');
    }
  }
  
  // Store tokens securely
  Future<void> _storeTokens() async {
    try {
      if (_accessToken != null) {
        await _storage.setSecureData(AppConstants.accessTokenKey, _accessToken!);
      }
      
      if (_refreshToken != null) {
        await _storage.setSecureData(AppConstants.refreshTokenKey, _refreshToken!);
      }
      
      if (_userInfo != null) {
        await _storage.setSecureJson(AppConstants.userInfoKey, _userInfo!);
      }
    } catch (e) {
      debugPrint('Failed to store tokens: $e');
      throw AuthException('Failed to store authentication data');
    }
  }
  
  // Refresh authentication token
  Future<bool> refreshAuthToken() async {
    if (_refreshToken == null) {
      debugPrint('No refresh token available');
      return false;
    }
    
    try {
      final response = await _network.post(
        ApiEndpoints.refreshToken,
        data: {
          'refresh_token': _refreshToken,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        await _handleAuthResponse(data);
        return true;
      } else {
        debugPrint('Token refresh failed: ${response.statusCode}');
        await clearAuth();
        return false;
      }
    } catch (e) {
      debugPrint('Token refresh error: $e');
      await clearAuth();
      return false;
    }
  }
  
  // Logout user
  Future<void> logout() async {
    try {
      // Attempt to logout on server
      if (_accessToken != null) {
        await _network.post(
          ApiEndpoints.logout,
          data: {
            'refresh_token': _refreshToken,
          },
        );
      }
    } catch (e) {
      debugPrint('Server logout failed: $e');
      // Continue with local logout even if server logout fails
    } finally {
      await clearAuth();
    }
  }
  
  // Clear authentication data
  Future<void> clearAuth() async {
    try {
      _accessToken = null;
      _refreshToken = null;
      _userInfo = null;
      _tokenExpiry = null;
      
      // Clear stored tokens
      await Future.wait([
        _storage.clearSecureData(AppConstants.accessTokenKey),
        _storage.clearSecureData(AppConstants.refreshTokenKey),
        _storage.clearSecureData(AppConstants.userInfoKey),
      ]);
      
      debugPrint('Authentication data cleared');
    } catch (e) {
      debugPrint('Failed to clear auth data: $e');
    }
  }
  
  // Forgot password
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await _network.post(
        ApiEndpoints.forgotPassword,
        data: {
          'email': email.toLowerCase().trim(),
        },
      );
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password reset instructions sent to your email',
        };
      } else {
        throw AuthException('Failed to send password reset email');
      }
    } catch (e) {
      debugPrint('Forgot password failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Failed to send password reset email');
    }
  }
  
  // Reset password
  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _network.post(
        ApiEndpoints.resetPassword,
        data: {
          'token': token,
          'password': newPassword,
        },
      );
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password reset successful',
        };
      } else {
        throw AuthException('Failed to reset password');
      }
    } catch (e) {
      debugPrint('Reset password failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Failed to reset password');
    }
  }
  
  // Change password
  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _network.put(
        ApiEndpoints.changePassword,
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password changed successfully',
        };
      } else {
        throw AuthException('Failed to change password');
      }
    } catch (e) {
      debugPrint('Change password failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Failed to change password');
    }
  }
  
  // Verify email
  Future<Map<String, dynamic>> verifyEmail(String token) async {
    try {
      final response = await _network.post(
        ApiEndpoints.verifyEmail,
        data: {
          'token': token,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        
        // If tokens are returned, handle authentication
        if (data.containsKey('access_token')) {
          await _handleAuthResponse(data);
        }
        
        return {
          'success': true,
          'message': 'Email verified successfully',
        };
      } else {
        throw AuthException('Email verification failed');
      }
    } catch (e) {
      debugPrint('Email verification failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Email verification failed');
    }
  }
  
  // Resend verification email
  Future<Map<String, dynamic>> resendVerificationEmail(String email) async {
    try {
      final response = await _network.post(
        ApiEndpoints.resendVerification,
        data: {
          'email': email.toLowerCase().trim(),
        },
      );
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Verification email sent',
        };
      } else {
        throw AuthException('Failed to send verification email');
      }
    } catch (e) {
      debugPrint('Resend verification failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Failed to send verification email');
    }
  }
  
  // Update user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final response = await _network.put(
        ApiEndpoints.updateProfile,
        data: profileData,
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        
        // Update local user info
        if (data.containsKey('user')) {
          _userInfo = data['user'] as Map<String, dynamic>;
          await _storage.setSecureJson(AppConstants.userInfoKey, _userInfo!);
        }
        
        return {
          'success': true,
          'user': _userInfo,
          'message': 'Profile updated successfully',
        };
      } else {
        throw AuthException('Failed to update profile');
      }
    } catch (e) {
      debugPrint('Update profile failed: $e');
      if (e is AuthException) rethrow;
      throw AuthException('Failed to update profile');
    }
  }
  
  // Check if user has specific role
  bool hasRole(String role) {
    return userRoles.contains(role);
  }
  
  // Check if user has any of the specified roles
  bool hasAnyRole(List<String> roles) {
    return roles.any((role) => userRoles.contains(role));
  }
  
  // Check if user has all specified roles
  bool hasAllRoles(List<String> roles) {
    return roles.every((role) => userRoles.contains(role));
  }
  
  // Get authorization header
  Map<String, String> getAuthHeaders() {
    if (_accessToken == null) {
      throw AuthException('No access token available');
    }
    
    return {
      'Authorization': 'Bearer $_accessToken',
    };
  }
  
  // Generate device fingerprint for security
  String _generateDeviceFingerprint() {
    final deviceInfo = {
      'platform': Platform.operatingSystem,
      'version': Platform.operatingSystemVersion,
      'locale': Platform.localeName,
    };
    
    final deviceString = jsonEncode(deviceInfo);
    final bytes = utf8.encode(deviceString);
    final digest = sha256.convert(bytes);
    
    return digest.toString();
  }
  
  // Validate password strength
  static Map<String, dynamic> validatePassword(String password) {
    final errors = <String>[];
    
    if (password.length < 8) {
      errors.add('Password must be at least 8 characters long');
    }
    
    if (!password.contains(RegExp(r'[A-Z]'))) {
      errors.add('Password must contain at least one uppercase letter');
    }
    
    if (!password.contains(RegExp(r'[a-z]'))) {
      errors.add('Password must contain at least one lowercase letter');
    }
    
    if (!password.contains(RegExp(r'[0-9]'))) {
      errors.add('Password must contain at least one number');
    }
    
    if (!password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      errors.add('Password must contain at least one special character');
    }
    
    return {
      'isValid': errors.isEmpty,
      'errors': errors,
      'strength': _calculatePasswordStrength(password),
    };
  }
  
  // Calculate password strength
  static double _calculatePasswordStrength(String password) {
    double strength = 0.0;
    
    // Length
    if (password.length >= 8) strength += 0.2;
    if (password.length >= 12) strength += 0.1;
    
    // Character types
    if (password.contains(RegExp(r'[a-z]'))) strength += 0.2;
    if (password.contains(RegExp(r'[A-Z]'))) strength += 0.2;
    if (password.contains(RegExp(r'[0-9]'))) strength += 0.2;
    if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) strength += 0.2;
    
    // Complexity
    if (password.length >= 16) strength += 0.1;
    
    return strength.clamp(0.0, 1.0);
  }
  
  // Validate email format
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
  
  // Get time until token expires
  Duration? getTimeUntilExpiry() {
    if (_tokenExpiry == null) return null;
    final now = DateTime.now();
    if (now.isAfter(_tokenExpiry!)) return Duration.zero;
    return _tokenExpiry!.difference(now);
  }
  
  // Check if token needs refresh (within 5 minutes of expiry)
  bool get needsRefresh {
    if (_tokenExpiry == null) return true;
    final now = DateTime.now();
    final refreshThreshold = _tokenExpiry!.subtract(const Duration(minutes: 5));
    return now.isAfter(refreshThreshold);
  }
}