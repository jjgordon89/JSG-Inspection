import 'package:flutter/material.dart';
import 'color_scheme.dart';
import 'typography.dart';

class ComponentThemes {
  // App Bar Themes
  static AppBarTheme get lightAppBarTheme {
    return AppBarTheme(
      backgroundColor: AppColorScheme.lightColorScheme.surface,
      foregroundColor: AppColorScheme.lightColorScheme.onSurface,
      elevation: 0,
      scrolledUnderElevation: 1,
      shadowColor: AppColorScheme.lightColorScheme.shadow,
      surfaceTintColor: AppColorScheme.lightColorScheme.surfaceTint,
      titleTextStyle: AppTypography.appBarTitle.copyWith(
        color: AppColorScheme.lightColorScheme.onSurface,
      ),
      iconTheme: IconThemeData(
        color: AppColorScheme.lightColorScheme.onSurface,
        size: 24,
      ),
      actionsIconTheme: IconThemeData(
        color: AppColorScheme.lightColorScheme.onSurface,
        size: 24,
      ),
      centerTitle: false,
      titleSpacing: 16,
    );
  }
  
  static AppBarTheme get darkAppBarTheme {
    return AppBarTheme(
      backgroundColor: AppColorScheme.darkColorScheme.surface,
      foregroundColor: AppColorScheme.darkColorScheme.onSurface,
      elevation: 0,
      scrolledUnderElevation: 1,
      shadowColor: AppColorScheme.darkColorScheme.shadow,
      surfaceTintColor: AppColorScheme.darkColorScheme.surfaceTint,
      titleTextStyle: AppTypography.appBarTitle.copyWith(
        color: AppColorScheme.darkColorScheme.onSurface,
      ),
      iconTheme: IconThemeData(
        color: AppColorScheme.darkColorScheme.onSurface,
        size: 24,
      ),
      actionsIconTheme: IconThemeData(
        color: AppColorScheme.darkColorScheme.onSurface,
        size: 24,
      ),
      centerTitle: false,
      titleSpacing: 16,
    );
  }
  
  // Bottom Navigation Themes
  static BottomNavigationBarThemeData get lightBottomNavigationTheme {
    return BottomNavigationBarThemeData(
      backgroundColor: AppColorScheme.lightColorScheme.surface,
      selectedItemColor: AppColorScheme.lightColorScheme.primary,
      unselectedItemColor: AppColorScheme.lightColorScheme.onSurfaceVariant,
      selectedLabelStyle: AppTypography.navigationLabel,
      unselectedLabelStyle: AppTypography.navigationLabel,
      type: BottomNavigationBarType.fixed,
      elevation: 3,
    );
  }
  
  static BottomNavigationBarThemeData get darkBottomNavigationTheme {
    return BottomNavigationBarThemeData(
      backgroundColor: AppColorScheme.darkColorScheme.surface,
      selectedItemColor: AppColorScheme.darkColorScheme.primary,
      unselectedItemColor: AppColorScheme.darkColorScheme.onSurfaceVariant,
      selectedLabelStyle: AppTypography.navigationLabel,
      unselectedLabelStyle: AppTypography.navigationLabel,
      type: BottomNavigationBarType.fixed,
      elevation: 3,
    );
  }
  
  // Card Theme
  static CardTheme get cardTheme {
    return CardTheme(
      elevation: 1,
      shadowColor: Colors.black.withOpacity(0.1),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      margin: const EdgeInsets.all(8),
      clipBehavior: Clip.antiAlias,
    );
  }
  
  // Button Themes
  static ElevatedButtonThemeData get elevatedButtonTheme {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 1,
        shadowColor: Colors.black.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        textStyle: AppTypography.buttonText,
        minimumSize: const Size(64, 40),
      ),
    );
  }
  
  static OutlinedButtonThemeData get outlinedButtonTheme {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        textStyle: AppTypography.buttonText,
        minimumSize: const Size(64, 40),
        side: const BorderSide(width: 1),
      ),
    );
  }
  
  static TextButtonThemeData get textButtonTheme {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        textStyle: AppTypography.buttonText,
        minimumSize: const Size(48, 40),
      ),
    );
  }
  
  // Input Decoration Theme
  static InputDecorationTheme get inputDecorationTheme {
    return InputDecorationTheme(
      filled: true,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: Colors.grey.withOpacity(0.3),
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: AppColorScheme.jsgPrimary,
          width: 2,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: AppColorScheme.jsgError,
          width: 1,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: AppColorScheme.jsgError,
          width: 2,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      labelStyle: AppTypography.inputLabel,
      hintStyle: AppTypography.inputText.copyWith(
        color: Colors.grey.withOpacity(0.6),
      ),
      errorStyle: AppTypography.formErrorText,
      helperStyle: AppTypography.formHelperText,
    );
  }
  
  // Floating Action Button Theme
  static FloatingActionButtonThemeData get floatingActionButtonTheme {
    return FloatingActionButtonThemeData(
      elevation: 6,
      highlightElevation: 12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      sizeConstraints: const BoxConstraints(
        minWidth: 56,
        minHeight: 56,
      ),
    );
  }
  
  // Navigation Rail Theme
  static NavigationRailThemeData get navigationRailTheme {
    return NavigationRailThemeData(
      elevation: 0,
      groupAlignment: -1.0,
      labelType: NavigationRailLabelType.all,
      useIndicator: true,
      minWidth: 72,
      minExtendedWidth: 256,
      selectedLabelTextStyle: AppTypography.navigationLabel.copyWith(
        color: AppColorScheme.jsgPrimary,
      ),
      unselectedLabelTextStyle: AppTypography.navigationLabel,
    );
  }
  
  // Drawer Theme
  static DrawerThemeData get drawerTheme {
    return DrawerThemeData(
      elevation: 16,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      width: 304,
    );
  }
  
  // Dialog Theme
  static DialogTheme get dialogTheme {
    return DialogTheme(
      elevation: 24,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(28),
      ),
      titleTextStyle: AppTypography.headlineSmall,
      contentTextStyle: AppTypography.bodyMedium,
      actionsPadding: const EdgeInsets.all(24),
      insetPadding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
    );
  }
  
  // Bottom Sheet Theme
  static BottomSheetThemeData get bottomSheetTheme {
    return BottomSheetThemeData(
      elevation: 8,
      modalElevation: 16,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      constraints: const BoxConstraints(
        maxWidth: 640,
      ),
    );
  }
  
  // Chip Theme
  static ChipThemeData get chipTheme {
    return ChipThemeData(
      elevation: 0,
      pressElevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      labelStyle: AppTypography.labelMedium,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      side: BorderSide(
        color: Colors.grey.withOpacity(0.3),
        width: 1,
      ),
    );
  }
  
  // List Tile Theme
  static ListTileThemeData get listTileTheme {
    return ListTileThemeData(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      minLeadingWidth: 40,
      minVerticalPadding: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      titleTextStyle: AppTypography.bodyLarge,
      subtitleTextStyle: AppTypography.bodyMedium,
      leadingAndTrailingTextStyle: AppTypography.labelMedium,
    );
  }
  
  // Switch Theme
  static SwitchThemeData get switchTheme {
    return SwitchThemeData(
      thumbColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColorScheme.jsgPrimary;
        }
        return Colors.grey;
      }),
      trackColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColorScheme.jsgPrimary.withOpacity(0.5);
        }
        return Colors.grey.withOpacity(0.3);
      }),
    );
  }
  
  // Checkbox Theme
  static CheckboxThemeData get checkboxTheme {
    return CheckboxThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColorScheme.jsgPrimary;
        }
        return Colors.transparent;
      }),
      checkColor: MaterialStateProperty.all(Colors.white),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
  
  // Radio Theme
  static RadioThemeData get radioTheme {
    return RadioThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColorScheme.jsgPrimary;
        }
        return Colors.grey;
      }),
    );
  }
  
  // Slider Theme
  static SliderThemeData get sliderTheme {
    return SliderThemeData(
      activeTrackColor: AppColorScheme.jsgPrimary,
      inactiveTrackColor: AppColorScheme.jsgPrimary.withOpacity(0.3),
      thumbColor: AppColorScheme.jsgPrimary,
      overlayColor: AppColorScheme.jsgPrimary.withOpacity(0.1),
      valueIndicatorColor: AppColorScheme.jsgPrimary,
      valueIndicatorTextStyle: AppTypography.labelMedium.copyWith(
        color: Colors.white,
      ),
    );
  }
  
  // Progress Indicator Theme
  static ProgressIndicatorThemeData get progressIndicatorTheme {
    return ProgressIndicatorThemeData(
      color: AppColorScheme.jsgPrimary,
      linearTrackColor: AppColorScheme.jsgPrimary.withOpacity(0.3),
      circularTrackColor: AppColorScheme.jsgPrimary.withOpacity(0.3),
      refreshBackgroundColor: Colors.white,
    );
  }
  
  // Divider Theme
  static DividerThemeData get dividerTheme {
    return DividerThemeData(
      color: Colors.grey.withOpacity(0.2),
      thickness: 1,
      space: 1,
    );
  }
  
  // Icon Themes
  static IconThemeData get lightIconTheme {
    return IconThemeData(
      color: AppColorScheme.lightColorScheme.onSurface,
      size: 24,
    );
  }
  
  static IconThemeData get darkIconTheme {
    return IconThemeData(
      color: AppColorScheme.darkColorScheme.onSurface,
      size: 24,
    );
  }
  
  static IconThemeData get lightPrimaryIconTheme {
    return IconThemeData(
      color: AppColorScheme.lightColorScheme.primary,
      size: 24,
    );
  }
  
  static IconThemeData get darkPrimaryIconTheme {
    return IconThemeData(
      color: AppColorScheme.darkColorScheme.primary,
      size: 24,
    );
  }
}