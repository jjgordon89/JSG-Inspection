class AppConstants {
  // App Information
  static const String appName = 'JSG Inspections';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Cross-platform inspection management system';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:3000/api/v1';
  static const String websocketUrl = 'ws://localhost:3000';
  
  // Database Configuration
  static const String databaseUrl = 'ws://localhost:8000/rpc';
  static const String databaseNamespace = 'jsg_inspections';
  static const String databaseName = 'inspections';
  static const String surrealDbUrl = 'ws://localhost:8000/rpc';
  static const String surrealDbNamespace = 'jsg_inspections';
  static const String surrealDbDatabase = 'inspections';
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language_code';
  static const String onboardingKey = 'onboarding_completed';
  
  // Hive Box Names
  static const String userBox = 'user_box';
  static const String inspectionBox = 'inspection_box';
  static const String assetBox = 'asset_box';
  static const String folderBox = 'folder_box';
  static const String formTemplateBox = 'form_template_box';
  static const String reportBox = 'report_box';
  static const String syncBox = 'sync_box';
  static const String notificationBox = 'notification_box';
  static const String settingsBox = 'settings_box';
  static const String cacheBox = 'cache_box';
  
  // File Paths
  static const String documentsPath = 'documents';
  static const String imagesPath = 'images';
  static const String reportsPath = 'reports';
  static const String tempPath = 'temp';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Timeouts
  static const Duration networkTimeout = Duration(seconds: 30);
  static const Duration syncInterval = Duration(minutes: 5);
  static const Duration autoSaveInterval = Duration(seconds: 2);
  
  // Image Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const double imageQuality = 0.8;
  static const int maxImageWidth = 1920;
  static const int maxImageHeight = 1080;
  
  // Form Configuration
  static const int maxPhotosPerQuestion = 10;
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Responsive Breakpoints
  static const double mobileBreakpoint = 768;
  static const double tabletBreakpoint = 1024;
  static const double desktopBreakpoint = 1200;
  
  // Error Messages
  static const String networkErrorMessage = 'Network connection error. Please check your internet connection.';
  static const String serverErrorMessage = 'Server error occurred. Please try again later.';
  static const String authErrorMessage = 'Authentication failed. Please login again.';
  static const String validationErrorMessage = 'Please check your input and try again.';
  
  // Success Messages
  static const String loginSuccessMessage = 'Login successful';
  static const String logoutSuccessMessage = 'Logout successful';
  static const String saveSuccessMessage = 'Data saved successfully';
  static const String syncSuccessMessage = 'Data synchronized successfully';
}

class ApiEndpoints {
  // Authentication
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  
  // Users
  static const String currentUser = '/users/me';
  static const String updateProfile = '/users/me';
  static const String changePassword = '/users/me/change-password';
  static const String userPreferences = '/users/me/preferences';
  
  // Assets
  static const String assets = '/assets';
  static const String assetById = '/assets/{id}';
  static const String assetByQr = '/assets/qr/{qrCode}';
  static const String assetPhotos = '/assets/{id}/photos';
  
  // Inspections
  static const String inspections = '/inspections';
  static const String inspectionById = '/inspections/{id}';
  static const String inspectionPhotos = '/inspections/{id}/photos';
  static const String inspectionSignature = '/inspections/{id}/signature';
  
  // Forms
  static const String formTemplates = '/forms/templates';
  static const String formTemplateById = '/forms/templates/{id}';
  static const String formResponses = '/forms/responses';
  
  // Folders
  static const String folders = '/folders';
  static const String folderById = '/folders/{id}';
  static const String folderInspections = '/folders/{id}/inspections';
  
  // Reports
  static const String reports = '/reports';
  static const String reportById = '/reports/{id}';
  static const String generateReport = '/reports/generate';
  
  // Files
  static const String uploadFile = '/files/upload';
  static const String downloadFile = '/files/{id}';
  
  // Sync
  static const String syncStatus = '/sync/status';
  static const String syncData = '/sync/data';
}