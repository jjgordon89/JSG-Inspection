import 'package:flutter/material.dart';

class AppColorScheme {
  // JSG Brand Colors
  static const Color jsgPrimary = Color(0xFF1976D2); // Blue
  static const Color jsgSecondary = Color(0xFF388E3C); // Green
  static const Color jsgTertiary = Color(0xFFFF9800); // Orange
  static const Color jsgError = Color(0xFFD32F2F); // Red
  static const Color jsgWarning = Color(0xFFFFC107); // Amber
  static const Color jsgSuccess = Color(0xFF4CAF50); // Green
  static const Color jsgInfo = Color(0xFF2196F3); // Light Blue
  
  // Light Theme Color Scheme
  static const ColorScheme lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    
    // Primary Colors
    primary: jsgPrimary,
    onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFFBBDEFB),
    onPrimaryContainer: Color(0xFF0D47A1),
    
    // Secondary Colors
    secondary: jsgSecondary,
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFFC8E6C9),
    onSecondaryContainer: Color(0xFF1B5E20),
    
    // Tertiary Colors
    tertiary: jsgTertiary,
    onTertiary: Color(0xFFFFFFFF),
    tertiaryContainer: Color(0xFFFFE0B2),
    onTertiaryContainer: Color(0xFFE65100),
    
    // Error Colors
    error: jsgError,
    onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFFFFCDD2),
    onErrorContainer: Color(0xFFB71C1C),
    
    // Background Colors
    background: Color(0xFFFAFAFA),
    onBackground: Color(0xFF1C1B1F),
    
    // Surface Colors
    surface: Color(0xFFFFFFFF),
    onSurface: Color(0xFF1C1B1F),
    surfaceVariant: Color(0xFFE7E0EC),
    onSurfaceVariant: Color(0xFF49454F),
    
    // Outline Colors
    outline: Color(0xFF79747E),
    outlineVariant: Color(0xFFCAC4D0),
    
    // Shadow and Scrim
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    
    // Inverse Colors
    inverseSurface: Color(0xFF313033),
    onInverseSurface: Color(0xFFF4EFF4),
    inversePrimary: Color(0xFF90CAF9),
  );
  
  // Dark Theme Color Scheme
  static const ColorScheme darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    
    // Primary Colors
    primary: Color(0xFF90CAF9),
    onPrimary: Color(0xFF0D47A1),
    primaryContainer: Color(0xFF1565C0),
    onPrimaryContainer: Color(0xFFBBDEFB),
    
    // Secondary Colors
    secondary: Color(0xFFA5D6A7),
    onSecondary: Color(0xFF1B5E20),
    secondaryContainer: Color(0xFF2E7D32),
    onSecondaryContainer: Color(0xFFC8E6C9),
    
    // Tertiary Colors
    tertiary: Color(0xFFFFCC02),
    onTertiary: Color(0xFFE65100),
    tertiaryContainer: Color(0xFFF57C00),
    onTertiaryContainer: Color(0xFFFFE0B2),
    
    // Error Colors
    error: Color(0xFFEF5350),
    onError: Color(0xFFB71C1C),
    errorContainer: Color(0xFFC62828),
    onErrorContainer: Color(0xFFFFCDD2),
    
    // Background Colors
    background: Color(0xFF121212),
    onBackground: Color(0xFFE6E1E5),
    
    // Surface Colors
    surface: Color(0xFF1E1E1E),
    onSurface: Color(0xFFE6E1E5),
    surfaceVariant: Color(0xFF49454F),
    onSurfaceVariant: Color(0xFFCAC4D0),
    
    // Outline Colors
    outline: Color(0xFF938F99),
    outlineVariant: Color(0xFF49454F),
    
    // Shadow and Scrim
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    
    // Inverse Colors
    inverseSurface: Color(0xFFE6E1E5),
    onInverseSurface: Color(0xFF313033),
    inversePrimary: Color(0xFF1976D2),
  );
  
  // Status Colors
  static const Color successLight = Color(0xFF4CAF50);
  static const Color successDark = Color(0xFF81C784);
  
  static const Color warningLight = Color(0xFFFFC107);
  static const Color warningDark = Color(0xFFFFD54F);
  
  static const Color infoLight = Color(0xFF2196F3);
  static const Color infoDark = Color(0xFF64B5F6);
  
  // Inspection Status Colors
  static const Color pendingColor = Color(0xFFFF9800);
  static const Color inProgressColor = Color(0xFF2196F3);
  static const Color completedColor = Color(0xFF4CAF50);
  static const Color failedColor = Color(0xFFD32F2F);
  static const Color draftColor = Color(0xFF9E9E9E);
  
  // Priority Colors
  static const Color lowPriority = Color(0xFF4CAF50);
  static const Color mediumPriority = Color(0xFFFF9800);
  static const Color highPriority = Color(0xFFD32F2F);
  static const Color criticalPriority = Color(0xFF9C27B0);
  
  // Asset Status Colors
  static const Color activeAsset = Color(0xFF4CAF50);
  static const Color inactiveAsset = Color(0xFF9E9E9E);
  static const Color maintenanceAsset = Color(0xFFFF9800);
  static const Color retiredAsset = Color(0xFFD32F2F);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1976D2), Color(0xFF1565C0)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [Color(0xFF388E3C), Color(0xFF2E7D32)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient surfaceGradient = LinearGradient(
    colors: [Color(0xFFFFFFFF), Color(0xFFF5F5F5)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  static const LinearGradient darkSurfaceGradient = LinearGradient(
    colors: [Color(0xFF1E1E1E), Color(0xFF121212)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}