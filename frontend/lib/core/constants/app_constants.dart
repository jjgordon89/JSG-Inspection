/// Application-wide constants for JSG Inspections
class AppConstants {
  // App Information
  static const String appName = 'JSG Inspections';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Professional inspection management system';
  
  // API Configuration
  static const String baseUrl = 'https://api.jsg-inspections.com';
  static const String apiVersion = 'v1';
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Database Configuration
  static const String databaseName = 'jsg_inspections.db';
  static const int databaseVersion = 1;
  static const String syncEndpoint = '/sync';
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String settingsKey = 'app_settings';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language_code';
  static const String lastSyncKey = 'last_sync_timestamp';
  static const String offlineModeKey = 'offline_mode';
  
  // File Paths
  static const String documentsFolder = 'documents';
  static const String imagesFolder = 'images';
  static const String reportsFolder = 'reports';
  static const String templatesFolder = 'templates';
  static const String signaturesFolder = 'signatures';
  static const String backupFolder = 'backups';
  
  // Image Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int imageQuality = 85;
  static const int thumbnailSize = 200;
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // Form Configuration
  static const int maxFormSections = 50;
  static const int maxQuestionsPerSection = 100;
  static const int maxChoicesPerQuestion = 20;
  static const int maxTextLength = 1000;
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  
  // Inspection Configuration
  static const Duration inspectionTimeout = Duration(hours: 8);
  static const int maxPhotosPerQuestion = 10;
  static const int maxInspectionDuration = 24; // hours
  static const List<String> inspectionStatuses = [
    'draft',
    'in_progress',
    'completed',
    'reviewed',
    'approved',
    'rejected'
  ];
  
  // Sync Configuration
  static const Duration syncInterval = Duration(minutes: 15);
  static const Duration backgroundSyncInterval = Duration(hours: 1);
  static const int maxRetryAttempts = 3;
  static const Duration retryDelay = Duration(seconds: 5);
  static const int batchSize = 50;
  
  // UI Configuration
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration shortAnimationDuration = Duration(milliseconds: 150);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);
  static const double borderRadius = 12.0;
  static const double smallBorderRadius = 8.0;
  static const double largeBorderRadius = 16.0;
  
  // Responsive Breakpoints
  static const double mobileBreakpoint = 768;
  static const double tabletBreakpoint = 1024;
  static const double desktopBreakpoint = 1200;
  static const double largeDesktopBreakpoint = 1440;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  static const int searchPageSize = 10;
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 50;
  static const String emailRegex = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String phoneRegex = r'^[\+]?[1-9]?[0-9]{7,15}$';
  
  // QR Code Configuration
  static const int qrCodeSize = 200;
  static const double qrCodeBorderWidth = 2.0;
  static const String qrCodePrefix = 'JSG-';
  
  // Location Configuration
  static const double locationAccuracy = 10.0; // meters
  static const Duration locationTimeout = Duration(seconds: 30);
  static const double defaultLatitude = 0.0;
  static const double defaultLongitude = 0.0;
  
  // Notification Configuration
  static const String notificationChannelId = 'jsg_inspections';
  static const String notificationChannelName = 'JSG Inspections';
  static const String notificationChannelDescription = 'Notifications for JSG Inspections app';
  
  // Error Messages
  static const String networkErrorMessage = 'Network connection error. Please check your internet connection.';
  static const String serverErrorMessage = 'Server error occurred. Please try again later.';
  static const String authErrorMessage = 'Authentication failed. Please login again.';
  static const String permissionErrorMessage = 'Permission denied. Please contact your administrator.';
  static const String validationErrorMessage = 'Please check your input and try again.';
  static const String unknownErrorMessage = 'An unexpected error occurred. Please try again.';
  
  // Success Messages
  static const String saveSuccessMessage = 'Data saved successfully.';
  static const String updateSuccessMessage = 'Data updated successfully.';
  static const String deleteSuccessMessage = 'Data deleted successfully.';
  static const String syncSuccessMessage = 'Data synchronized successfully.';
  static const String loginSuccessMessage = 'Login successful.';
  static const String logoutSuccessMessage = 'Logout successful.';
  
  // Feature Flags
  static const bool enableOfflineMode = true;
  static const bool enablePushNotifications = true;
  static const bool enableBiometricAuth = true;
  static const bool enableDarkMode = true;
  static const bool enableAnalytics = false;
  static const bool enableCrashReporting = false;
  static const bool enableDebugMode = false;
  
  // Asset Types
  static const List<String> assetTypes = [
    'Equipment',
    'Vehicle',
    'Building',
    'Infrastructure',
    'Tool',
    'Safety Equipment',
    'Other'
  ];
  
  // Inspection Types
  static const List<String> inspectionTypes = [
    'Safety Inspection',
    'Quality Inspection',
    'Maintenance Inspection',
    'Compliance Inspection',
    'Pre-operational Inspection',
    'Post-operational Inspection',
    'Periodic Inspection',
    'Special Inspection'
  ];
  
  // Priority Levels
  static const List<String> priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Critical',
    'Emergency'
  ];
  
  // Report Types
  static const List<String> reportTypes = [
    'Inspection Report',
    'Summary Report',
    'Detailed Report',
    'Compliance Report',
    'Trend Analysis',
    'Performance Report',
    'Custom Report'
  ];
  
  // Question Types
  static const List<String> questionTypes = [
    'text',
    'number',
    'email',
    'phone',
    'url',
    'date',
    'time',
    'datetime',
    'boolean',
    'single_choice',
    'multiple_choice',
    'rating',
    'slider',
    'photo',
    'signature',
    'location',
    'barcode',
    'qr_code'
  ];
  
  // User Roles
  static const List<String> userRoles = [
    'Super Admin',
    'Admin',
    'Manager',
    'Inspector',
    'Viewer',
    'Guest'
  ];
  
  // Permissions
  static const List<String> permissions = [
    'create_inspections',
    'edit_inspections',
    'delete_inspections',
    'view_inspections',
    'create_assets',
    'edit_assets',
    'delete_assets',
    'view_assets',
    'create_forms',
    'edit_forms',
    'delete_forms',
    'view_forms',
    'create_reports',
    'edit_reports',
    'delete_reports',
    'view_reports',
    'manage_users',
    'manage_settings',
    'export_data',
    'import_data'
  ];
  
  // Date Formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm';
  static const String displayDateFormat = 'MMM dd, yyyy';
  static const String displayTimeFormat = 'h:mm a';
  static const String displayDateTimeFormat = 'MMM dd, yyyy h:mm a';
  
  // Currency and Number Formats
  static const String currencySymbol = '\$';
  static const int decimalPlaces = 2;
  static const String numberFormat = '#,##0.00';
  
  // App URLs
  static const String privacyPolicyUrl = 'https://jsg-inspections.com/privacy';
  static const String termsOfServiceUrl = 'https://jsg-inspections.com/terms';
  static const String supportUrl = 'https://jsg-inspections.com/support';
  static const String documentationUrl = 'https://docs.jsg-inspections.com';
  static const String feedbackUrl = 'https://jsg-inspections.com/feedback';
  
  // Contact Information
  static const String supportEmail = 'support@jsg-inspections.com';
  static const String supportPhone = '+1-800-JSG-HELP';
  static const String companyName = 'JSG Inspections Inc.';
  static const String companyAddress = '123 Business St, Suite 100, City, State 12345';
}

/// Environment-specific constants
class EnvironmentConstants {
  static const String development = 'development';
  static const String staging = 'staging';
  static const String production = 'production';
  
  // Current environment (should be set during build)
  static const String currentEnvironment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: development,
  );
  
  static bool get isDevelopment => currentEnvironment == development;
  static bool get isStaging => currentEnvironment == staging;
  static bool get isProduction => currentEnvironment == production;
  
  // Environment-specific configurations
  static String get apiBaseUrl {
    switch (currentEnvironment) {
      case production:
        return 'https://api.jsg-inspections.com';
      case staging:
        return 'https://staging-api.jsg-inspections.com';
      case development:
      default:
        return 'https://dev-api.jsg-inspections.com';
    }
  }
  
  static bool get enableLogging => !isProduction;
  static bool get enableDebugFeatures => isDevelopment;
}

/// Platform-specific constants
class PlatformConstants {
  // Windows-specific
  static const String windowsAppDataPath = 'JSG Inspections';
  static const String windowsRegistryKey = 'HKEY_CURRENT_USER\\Software\\JSG Inspections';
  
  // Android-specific
  static const String androidPackageName = 'com.jsg.inspections';
  static const String androidNotificationIcon = '@mipmap/ic_launcher';
  
  // File extensions
  static const String reportFileExtension = '.pdf';
  static const String dataFileExtension = '.json';
  static const String backupFileExtension = '.backup';
  static const String templateFileExtension = '.template';
}