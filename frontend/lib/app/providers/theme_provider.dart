import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../theme/app_theme.dart';

// Theme Mode State
enum AppThemeMode {
  light,
  dark,
  system,
}

// Theme Notifier
class ThemeNotifier extends StateNotifier<AppThemeMode> {
  final SharedPreferences _prefs;
  static const String _themeKey = 'theme_mode';

  ThemeNotifier(this._prefs) : super(AppThemeMode.system) {
    _loadTheme();
  }

  void _loadTheme() {
    final themeIndex = _prefs.getInt(_themeKey) ?? AppThemeMode.system.index;
    state = AppThemeMode.values[themeIndex];
  }

  Future<void> setTheme(AppThemeMode themeMode) async {
    state = themeMode;
    await _prefs.setInt(_themeKey, themeMode.index);
  }

  Future<void> toggleTheme() async {
    switch (state) {
      case AppThemeMode.light:
        await setTheme(AppThemeMode.dark);
        break;
      case AppThemeMode.dark:
        await setTheme(AppThemeMode.system);
        break;
      case AppThemeMode.system:
        await setTheme(AppThemeMode.light);
        break;
    }
  }
}

// Providers
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden');
});

final themeNotifierProvider = StateNotifierProvider<ThemeNotifier, AppThemeMode>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ThemeNotifier(prefs);
});

// Theme Data Providers
final lightThemeProvider = Provider<ThemeData>((ref) {
  return AppTheme.lightTheme;
});

final darkThemeProvider = Provider<ThemeData>((ref) {
  return AppTheme.darkTheme;
});

final currentThemeModeProvider = Provider<ThemeMode>((ref) {
  final appThemeMode = ref.watch(themeNotifierProvider);
  
  switch (appThemeMode) {
    case AppThemeMode.light:
      return ThemeMode.light;
    case AppThemeMode.dark:
      return ThemeMode.dark;
    case AppThemeMode.system:
      return ThemeMode.system;
  }
});

// Helper Providers
final isDarkModeProvider = Provider<bool>((ref) {
  final themeMode = ref.watch(themeNotifierProvider);
  
  switch (themeMode) {
    case AppThemeMode.light:
      return false;
    case AppThemeMode.dark:
      return true;
    case AppThemeMode.system:
      // This would need to be determined by the system
      // For now, default to light
      return false;
  }
});

final currentThemeDataProvider = Provider<ThemeData>((ref) {
  final isDark = ref.watch(isDarkModeProvider);
  return isDark ? AppTheme.darkTheme : AppTheme.lightTheme;
});

// Theme Extensions
extension ThemeModeExtension on AppThemeMode {
  String get displayName {
    switch (this) {
      case AppThemeMode.light:
        return 'Light';
      case AppThemeMode.dark:
        return 'Dark';
      case AppThemeMode.system:
        return 'System';
    }
  }

  IconData get icon {
    switch (this) {
      case AppThemeMode.light:
        return Icons.light_mode;
      case AppThemeMode.dark:
        return Icons.dark_mode;
      case AppThemeMode.system:
        return Icons.brightness_auto;
    }
  }
}