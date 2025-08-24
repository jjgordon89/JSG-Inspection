import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'color_scheme.dart';
import 'typography.dart';
import 'component_themes.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: AppColorScheme.lightColorScheme,
      textTheme: AppTypography.textTheme,
      
      // App Bar Theme
      appBarTheme: ComponentThemes.lightAppBarTheme,
      
      // Bottom Navigation Theme
      bottomNavigationBarTheme: ComponentThemes.lightBottomNavigationTheme,
      
      // Card Theme
      cardTheme: ComponentThemes.cardTheme,
      
      // Elevated Button Theme
      elevatedButtonTheme: ComponentThemes.elevatedButtonTheme,
      
      // Outlined Button Theme
      outlinedButtonTheme: ComponentThemes.outlinedButtonTheme,
      
      // Text Button Theme
      textButtonTheme: ComponentThemes.textButtonTheme,
      
      // Input Decoration Theme
      inputDecorationTheme: ComponentThemes.inputDecorationTheme,
      
      // Floating Action Button Theme
      floatingActionButtonTheme: ComponentThemes.floatingActionButtonTheme,
      
      // Navigation Rail Theme
      navigationRailTheme: ComponentThemes.navigationRailTheme,
      
      // Drawer Theme
      drawerTheme: ComponentThemes.drawerTheme,
      
      // Dialog Theme
      dialogTheme: ComponentThemes.dialogTheme,
      
      // Bottom Sheet Theme
      bottomSheetTheme: ComponentThemes.bottomSheetTheme,
      
      // Chip Theme
      chipTheme: ComponentThemes.chipTheme,
      
      // List Tile Theme
      listTileTheme: ComponentThemes.listTileTheme,
      
      // Switch Theme
      switchTheme: ComponentThemes.switchTheme,
      
      // Checkbox Theme
      checkboxTheme: ComponentThemes.checkboxTheme,
      
      // Radio Theme
      radioTheme: ComponentThemes.radioTheme,
      
      // Slider Theme
      sliderTheme: ComponentThemes.sliderTheme,
      
      // Progress Indicator Theme
      progressIndicatorTheme: ComponentThemes.progressIndicatorTheme,
      
      // Divider Theme
      dividerTheme: ComponentThemes.dividerTheme,
      
      // Icon Theme
      iconTheme: ComponentThemes.lightIconTheme,
      primaryIconTheme: ComponentThemes.lightPrimaryIconTheme,
      
      // Scaffold Background
      scaffoldBackgroundColor: AppColorScheme.lightColorScheme.background,
      
      // Visual Density
      visualDensity: VisualDensity.adaptivePlatformDensity,
      
      // Platform Brightness
      brightness: Brightness.light,
      
      // Splash Factory
      splashFactory: InkRipple.splashFactory,
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: AppColorScheme.darkColorScheme,
      textTheme: AppTypography.textTheme,
      
      // App Bar Theme
      appBarTheme: ComponentThemes.darkAppBarTheme,
      
      // Bottom Navigation Theme
      bottomNavigationBarTheme: ComponentThemes.darkBottomNavigationTheme,
      
      // Card Theme
      cardTheme: ComponentThemes.cardTheme,
      
      // Elevated Button Theme
      elevatedButtonTheme: ComponentThemes.elevatedButtonTheme,
      
      // Outlined Button Theme
      outlinedButtonTheme: ComponentThemes.outlinedButtonTheme,
      
      // Text Button Theme
      textButtonTheme: ComponentThemes.textButtonTheme,
      
      // Input Decoration Theme
      inputDecorationTheme: ComponentThemes.inputDecorationTheme,
      
      // Floating Action Button Theme
      floatingActionButtonTheme: ComponentThemes.floatingActionButtonTheme,
      
      // Navigation Rail Theme
      navigationRailTheme: ComponentThemes.navigationRailTheme,
      
      // Drawer Theme
      drawerTheme: ComponentThemes.drawerTheme,
      
      // Dialog Theme
      dialogTheme: ComponentThemes.dialogTheme,
      
      // Bottom Sheet Theme
      bottomSheetTheme: ComponentThemes.bottomSheetTheme,
      
      // Chip Theme
      chipTheme: ComponentThemes.chipTheme,
      
      // List Tile Theme
      listTileTheme: ComponentThemes.listTileTheme,
      
      // Switch Theme
      switchTheme: ComponentThemes.switchTheme,
      
      // Checkbox Theme
      checkboxTheme: ComponentThemes.checkboxTheme,
      
      // Radio Theme
      radioTheme: ComponentThemes.radioTheme,
      
      // Slider Theme
      sliderTheme: ComponentThemes.sliderTheme,
      
      // Progress Indicator Theme
      progressIndicatorTheme: ComponentThemes.progressIndicatorTheme,
      
      // Divider Theme
      dividerTheme: ComponentThemes.dividerTheme,
      
      // Icon Theme
      iconTheme: ComponentThemes.darkIconTheme,
      primaryIconTheme: ComponentThemes.darkPrimaryIconTheme,
      
      // Scaffold Background
      scaffoldBackgroundColor: AppColorScheme.darkColorScheme.background,
      
      // Visual Density
      visualDensity: VisualDensity.adaptivePlatformDensity,
      
      // Platform Brightness
      brightness: Brightness.dark,
      
      // Splash Factory
      splashFactory: InkRipple.splashFactory,
    );
  }
  
  // System UI Overlay Styles
  static SystemUiOverlayStyle get lightSystemUiOverlayStyle {
    return SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: AppColorScheme.lightColorScheme.background,
      systemNavigationBarIconBrightness: Brightness.dark,
    );
  }
  
  static SystemUiOverlayStyle get darkSystemUiOverlayStyle {
    return SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: AppColorScheme.darkColorScheme.background,
      systemNavigationBarIconBrightness: Brightness.light,
    );
  }
}