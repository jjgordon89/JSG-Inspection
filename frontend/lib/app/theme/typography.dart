import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  // Base Font Family
  static const String fontFamily = 'Roboto';
  
  // Font Weights
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  
  // Material Design 3 Text Theme
  static TextTheme get textTheme {
    return GoogleFonts.robotoTextTheme(
      const TextTheme(
        // Display Styles
        displayLarge: TextStyle(
          fontSize: 57,
          fontWeight: regular,
          letterSpacing: -0.25,
          height: 1.12,
        ),
        displayMedium: TextStyle(
          fontSize: 45,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.16,
        ),
        displaySmall: TextStyle(
          fontSize: 36,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.22,
        ),
        
        // Headline Styles
        headlineLarge: TextStyle(
          fontSize: 32,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.25,
        ),
        headlineMedium: TextStyle(
          fontSize: 28,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.29,
        ),
        headlineSmall: TextStyle(
          fontSize: 24,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.33,
        ),
        
        // Title Styles
        titleLarge: TextStyle(
          fontSize: 22,
          fontWeight: regular,
          letterSpacing: 0,
          height: 1.27,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: medium,
          letterSpacing: 0.15,
          height: 1.50,
        ),
        titleSmall: TextStyle(
          fontSize: 14,
          fontWeight: medium,
          letterSpacing: 0.1,
          height: 1.43,
        ),
        
        // Label Styles
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: medium,
          letterSpacing: 0.1,
          height: 1.43,
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: medium,
          letterSpacing: 0.5,
          height: 1.33,
        ),
        labelSmall: TextStyle(
          fontSize: 11,
          fontWeight: medium,
          letterSpacing: 0.5,
          height: 1.45,
        ),
        
        // Body Styles
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: regular,
          letterSpacing: 0.15,
          height: 1.50,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: regular,
          letterSpacing: 0.25,
          height: 1.43,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: regular,
          letterSpacing: 0.4,
          height: 1.33,
        ),
      ),
    );
  }
  
  // Custom Text Styles for App-Specific Use Cases
  static const TextStyle appBarTitle = TextStyle(
    fontSize: 20,
    fontWeight: medium,
    letterSpacing: 0.15,
  );
  
  static const TextStyle buttonText = TextStyle(
    fontSize: 14,
    fontWeight: medium,
    letterSpacing: 0.1,
  );
  
  static const TextStyle cardTitle = TextStyle(
    fontSize: 16,
    fontWeight: medium,
    letterSpacing: 0.15,
  );
  
  static const TextStyle cardSubtitle = TextStyle(
    fontSize: 14,
    fontWeight: regular,
    letterSpacing: 0.25,
  );
  
  static const TextStyle inputLabel = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.4,
  );
  
  static const TextStyle inputText = TextStyle(
    fontSize: 16,
    fontWeight: regular,
    letterSpacing: 0.15,
  );
  
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: regular,
    letterSpacing: 0.4,
  );
  
  static const TextStyle overline = TextStyle(
    fontSize: 10,
    fontWeight: medium,
    letterSpacing: 1.5,
  );
  
  // Status Text Styles
  static const TextStyle statusActive = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.4,
    color: Color(0xFF4CAF50),
  );
  
  static const TextStyle statusInactive = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.4,
    color: Color(0xFF9E9E9E),
  );
  
  static const TextStyle statusWarning = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.4,
    color: Color(0xFFFF9800),
  );
  
  static const TextStyle statusError = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.4,
    color: Color(0xFFD32F2F),
  );
  
  // Inspection-Specific Text Styles
  static const TextStyle inspectionTitle = TextStyle(
    fontSize: 18,
    fontWeight: semiBold,
    letterSpacing: 0.15,
  );
  
  static const TextStyle inspectionSubtitle = TextStyle(
    fontSize: 14,
    fontWeight: regular,
    letterSpacing: 0.25,
  );
  
  static const TextStyle questionText = TextStyle(
    fontSize: 16,
    fontWeight: medium,
    letterSpacing: 0.15,
  );
  
  static const TextStyle answerText = TextStyle(
    fontSize: 14,
    fontWeight: regular,
    letterSpacing: 0.25,
  );
  
  static const TextStyle scoreText = TextStyle(
    fontSize: 24,
    fontWeight: bold,
    letterSpacing: 0,
  );
  
  // Asset-Specific Text Styles
  static const TextStyle assetName = TextStyle(
    fontSize: 16,
    fontWeight: semiBold,
    letterSpacing: 0.15,
  );
  
  static const TextStyle assetCode = TextStyle(
    fontSize: 14,
    fontWeight: medium,
    letterSpacing: 0.25,
    fontFamily: 'monospace',
  );
  
  static const TextStyle assetLocation = TextStyle(
    fontSize: 12,
    fontWeight: regular,
    letterSpacing: 0.4,
  );
  
  // Navigation Text Styles
  static const TextStyle navigationLabel = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    letterSpacing: 0.5,
  );
  
  static const TextStyle tabLabel = TextStyle(
    fontSize: 14,
    fontWeight: medium,
    letterSpacing: 0.1,
  );
  
  // Form Text Styles
  static const TextStyle formSectionTitle = TextStyle(
    fontSize: 16,
    fontWeight: semiBold,
    letterSpacing: 0.15,
  );
  
  static const TextStyle formFieldLabel = TextStyle(
    fontSize: 14,
    fontWeight: medium,
    letterSpacing: 0.25,
  );
  
  static const TextStyle formHelperText = TextStyle(
    fontSize: 12,
    fontWeight: regular,
    letterSpacing: 0.4,
  );
  
  static const TextStyle formErrorText = TextStyle(
    fontSize: 12,
    fontWeight: regular,
    letterSpacing: 0.4,
    color: Color(0xFFD32F2F),
  );
  
  // Report Text Styles
  static const TextStyle reportTitle = TextStyle(
    fontSize: 20,
    fontWeight: bold,
    letterSpacing: 0.15,
  );
  
  static const TextStyle reportSubtitle = TextStyle(
    fontSize: 16,
    fontWeight: medium,
    letterSpacing: 0.15,
  );
  
  static const TextStyle reportBody = TextStyle(
    fontSize: 14,
    fontWeight: regular,
    letterSpacing: 0.25,
    height: 1.5,
  );
  
  static const TextStyle reportMetadata = TextStyle(
    fontSize: 12,
    fontWeight: regular,
    letterSpacing: 0.4,
  );
}