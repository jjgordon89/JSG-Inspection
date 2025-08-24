import 'package:hive/hive.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'settings.freezed.dart';
part 'settings.g.dart';

@freezed
@HiveType(typeId: 45)
class AppSettings with _$AppSettings {
  const factory AppSettings({
    @HiveField(0) @Default('en') String language,
    @HiveField(1) @Default(ThemeMode.system) ThemeMode themeMode,
    @HiveField(2) @Default('blue') String primaryColor,
    @HiveField(3) @Default(true) bool useMaterial3,
    @HiveField(4) @Default(true) bool enableNotifications,
    @HiveField(5) @Default(true) bool enableSounds,
    @HiveField(6) @Default(true) bool enableVibration,
    @HiveField(7) @Default(SyncSettings()) SyncSettings syncSettings,
    @HiveField(8) @Default(CameraSettings()) CameraSettings cameraSettings,
    @HiveField(9) @Default(LocationSettings()) LocationSettings locationSettings,
    @HiveField(10) @Default(SecuritySettings()) SecuritySettings securitySettings,
    @HiveField(11) @Default(DisplaySettings()) DisplaySettings displaySettings,
    @HiveField(12) @Default(DataSettings()) DataSettings dataSettings,
    @HiveField(13) @Default(AccessibilitySettings()) AccessibilitySettings accessibilitySettings,
    @HiveField(14) @Default({}) Map<String, dynamic> customSettings,
    @HiveField(15) required DateTime lastUpdated,
  }) = _AppSettings;

  factory AppSettings.fromJson(Map<String, dynamic> json) => _$AppSettingsFromJson(json);
  
  factory AppSettings.defaultSettings() {
    return AppSettings(
      lastUpdated: DateTime.now(),
    );
  }
}

@freezed
@HiveType(typeId: 46)
class SyncSettings with _$SyncSettings {
  const factory SyncSettings({
    @HiveField(0) @Default(true) bool autoSync,
    @HiveField(1) @Default(SyncFrequency.every15Minutes) SyncFrequency syncFrequency,
    @HiveField(2) @Default(true) bool syncOnWifiOnly,
    @HiveField(3) @Default(true) bool syncInBackground,
    @HiveField(4) @Default(true) bool syncPhotos,
    @HiveField(5) @Default(true) bool syncReports,
    @HiveField(6) @Default(3) int maxRetries,
    @HiveField(7) @Default(30) int timeoutSeconds,
    @HiveField(8) @Default(ConflictResolution.serverWins) ConflictResolution conflictResolution,
    @HiveField(9) @Default(true) bool compressPhotos,
    @HiveField(10) @Default(80) int photoQuality,
  }) = _SyncSettings;

  factory SyncSettings.fromJson(Map<String, dynamic> json) => _$SyncSettingsFromJson(json);
}

@freezed
@HiveType(typeId: 47)
class CameraSettings with _$CameraSettings {
  const factory CameraSettings({
    @HiveField(0) @Default(CameraResolution.high) CameraResolution resolution,
    @HiveField(1) @Default(true) bool enableFlash,
    @HiveField(2) @Default(true) bool autoFocus,
    @HiveField(3) @Default(true) bool saveToGallery,
    @HiveField(4) @Default(true) bool addLocationToPhotos,
    @HiveField(5) @Default(true) bool addTimestampToPhotos,
    @HiveField(6) @Default(90) int jpegQuality,
    @HiveField(7) @Default(true) bool enableGridLines,
    @HiveField(8) @Default(CameraLens.back) CameraLens defaultLens,
    @HiveField(9) @Default(5) int maxPhotosPerQuestion,
  }) = _CameraSettings;

  factory CameraSettings.fromJson(Map<String, dynamic> json) => _$CameraSettingsFromJson(json);
}

@freezed
@HiveType(typeId: 48)
class LocationSettings with _$LocationSettings {
  const factory LocationSettings({
    @HiveField(0) @Default(true) bool enableLocation,
    @HiveField(1) @Default(LocationAccuracy.high) LocationAccuracy accuracy,
    @HiveField(2) @Default(true) bool enableBackgroundLocation,
    @HiveField(3) @Default(true) bool addLocationToInspections,
    @HiveField(4) @Default(true) bool addLocationToAssets,
    @HiveField(5) @Default(10) int locationUpdateInterval,
    @HiveField(6) @Default(100) double minimumDistanceFilter,
    @HiveField(7) @Default(true) bool showLocationInUI,
  }) = _LocationSettings;

  factory LocationSettings.fromJson(Map<String, dynamic> json) => _$LocationSettingsFromJson(json);
}

@freezed
@HiveType(typeId: 49)
class SecuritySettings with _$SecuritySettings {
  const factory SecuritySettings({
    @HiveField(0) @Default(true) bool enableBiometrics,
    @HiveField(1) @Default(true) bool requireAuthOnLaunch,
    @HiveField(2) @Default(15) int autoLockMinutes,
    @HiveField(3) @Default(true) bool enableScreenshotProtection,
    @HiveField(4) @Default(true) bool enableAppLockOnBackground,
    @HiveField(5) @Default(false) bool enableDebugMode,
    @HiveField(6) @Default(true) bool logUserActions,
    @HiveField(7) @Default(30) int sessionTimeoutMinutes,
  }) = _SecuritySettings;

  factory SecuritySettings.fromJson(Map<String, dynamic> json) => _$SecuritySettingsFromJson(json);
}

@freezed
@HiveType(typeId: 50)
class DisplaySettings with _$DisplaySettings {
  const factory DisplaySettings({
    @HiveField(0) @Default(1.0) double textScale,
    @HiveField(1) @Default(true) bool enableAnimations,
    @HiveField(2) @Default(true) bool enableHapticFeedback,
    @HiveField(3) @Default(true) bool showTutorials,
    @HiveField(4) @Default(DateFormat.ddMMyyyy) DateFormat dateFormat,
    @HiveField(5) @Default(TimeFormat.format24) TimeFormat timeFormat,
    @HiveField(6) @Default(true) bool showStatusBar,
    @HiveField(7) @Default(true) bool enableFullScreen,
    @HiveField(8) @Default(ScreenOrientation.auto) ScreenOrientation orientation,
  }) = _DisplaySettings;

  factory DisplaySettings.fromJson(Map<String, dynamic> json) => _$DisplaySettingsFromJson(json);
}

@freezed
@HiveType(typeId: 51)
class DataSettings with _$DataSettings {
  const factory DataSettings({
    @HiveField(0) @Default(true) bool enableDataSaver,
    @HiveField(1) @Default(100) int maxCacheSize,
    @HiveField(2) @Default(30) int cacheRetentionDays,
    @HiveField(3) @Default(true) bool autoCleanup,
    @HiveField(4) @Default(7) int autoCleanupDays,
    @HiveField(5) @Default(true) bool compressData,
    @HiveField(6) @Default(1000) int maxOfflineInspections,
    @HiveField(7) @Default(500) int maxOfflineAssets,
  }) = _DataSettings;

  factory DataSettings.fromJson(Map<String, dynamic> json) => _$DataSettingsFromJson(json);
}

@freezed
@HiveType(typeId: 52)
class AccessibilitySettings with _$AccessibilitySettings {
  const factory AccessibilitySettings({
    @HiveField(0) @Default(false) bool enableScreenReader,
    @HiveField(1) @Default(false) bool enableHighContrast,
    @HiveField(2) @Default(false) bool enableLargeText,
    @HiveField(3) @Default(false) bool enableReducedMotion,
    @HiveField(4) @Default(false) bool enableVoiceCommands,
    @HiveField(5) @Default(1.0) double buttonSize,
    @HiveField(6) @Default(1.0) double iconSize,
    @HiveField(7) @Default(false) bool enableColorBlindSupport,
  }) = _AccessibilitySettings;

  factory AccessibilitySettings.fromJson(Map<String, dynamic> json) => _$AccessibilitySettingsFromJson(json);
}

// Enums
@HiveType(typeId: 53)
enum ThemeMode {
  @HiveField(0)
  light,
  @HiveField(1)
  dark,
  @HiveField(2)
  system,
}

@HiveType(typeId: 54)
enum SyncFrequency {
  @HiveField(0)
  manual,
  @HiveField(1)
  every5Minutes,
  @HiveField(2)
  every15Minutes,
  @HiveField(3)
  every30Minutes,
  @HiveField(4)
  hourly,
  @HiveField(5)
  daily,
}

@HiveType(typeId: 55)
enum ConflictResolution {
  @HiveField(0)
  serverWins,
  @HiveField(1)
  clientWins,
  @HiveField(2)
  askUser,
  @HiveField(3)
  merge,
}

@HiveType(typeId: 56)
enum CameraResolution {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
  @HiveField(3)
  veryHigh,
}

@HiveType(typeId: 57)
enum CameraLens {
  @HiveField(0)
  back,
  @HiveField(1)
  front,
}

@HiveType(typeId: 58)
enum LocationAccuracy {
  @HiveField(0)
  lowest,
  @HiveField(1)
  low,
  @HiveField(2)
  medium,
  @HiveField(3)
  high,
  @HiveField(4)
  best,
}

@HiveType(typeId: 59)
enum DateFormat {
  @HiveField(0)
  ddMMyyyy,
  @HiveField(1)
  mmDDyyyy,
  @HiveField(2)
  yyyyMMdd,
  @HiveField(3)
  ddMMMyyyy,
}

@HiveType(typeId: 60)
enum TimeFormat {
  @HiveField(0)
  format12,
  @HiveField(1)
  format24,
}

@HiveType(typeId: 61)
enum ScreenOrientation {
  @HiveField(0)
  auto,
  @HiveField(1)
  portrait,
  @HiveField(2)
  landscape,
}

// Extensions
extension ThemeModeExtension on ThemeMode {
  String get displayName {
    switch (this) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }

  String get description {
    switch (this) {
      case ThemeMode.light:
        return 'Always use light theme';
      case ThemeMode.dark:
        return 'Always use dark theme';
      case ThemeMode.system:
        return 'Follow system theme';
    }
  }
}

extension SyncFrequencyExtension on SyncFrequency {
  String get displayName {
    switch (this) {
      case SyncFrequency.manual:
        return 'Manual';
      case SyncFrequency.every5Minutes:
        return 'Every 5 minutes';
      case SyncFrequency.every15Minutes:
        return 'Every 15 minutes';
      case SyncFrequency.every30Minutes:
        return 'Every 30 minutes';
      case SyncFrequency.hourly:
        return 'Hourly';
      case SyncFrequency.daily:
        return 'Daily';
    }
  }

  Duration? get duration {
    switch (this) {
      case SyncFrequency.manual:
        return null;
      case SyncFrequency.every5Minutes:
        return const Duration(minutes: 5);
      case SyncFrequency.every15Minutes:
        return const Duration(minutes: 15);
      case SyncFrequency.every30Minutes:
        return const Duration(minutes: 30);
      case SyncFrequency.hourly:
        return const Duration(hours: 1);
      case SyncFrequency.daily:
        return const Duration(days: 1);
    }
  }
}

extension ConflictResolutionExtension on ConflictResolution {
  String get displayName {
    switch (this) {
      case ConflictResolution.serverWins:
        return 'Server Wins';
      case ConflictResolution.clientWins:
        return 'Client Wins';
      case ConflictResolution.askUser:
        return 'Ask User';
      case ConflictResolution.merge:
        return 'Merge';
    }
  }

  String get description {
    switch (this) {
      case ConflictResolution.serverWins:
        return 'Server data takes precedence';
      case ConflictResolution.clientWins:
        return 'Local data takes precedence';
      case ConflictResolution.askUser:
        return 'Prompt user to choose';
      case ConflictResolution.merge:
        return 'Attempt to merge changes';
    }
  }
}

extension CameraResolutionExtension on CameraResolution {
  String get displayName {
    switch (this) {
      case CameraResolution.low:
        return 'Low (480p)';
      case CameraResolution.medium:
        return 'Medium (720p)';
      case CameraResolution.high:
        return 'High (1080p)';
      case CameraResolution.veryHigh:
        return 'Very High (4K)';
    }
  }

  String get resolution {
    switch (this) {
      case CameraResolution.low:
        return '640x480';
      case CameraResolution.medium:
        return '1280x720';
      case CameraResolution.high:
        return '1920x1080';
      case CameraResolution.veryHigh:
        return '3840x2160';
    }
  }
}

extension LocationAccuracyExtension on LocationAccuracy {
  String get displayName {
    switch (this) {
      case LocationAccuracy.lowest:
        return 'Lowest (~3km)';
      case LocationAccuracy.low:
        return 'Low (~1km)';
      case LocationAccuracy.medium:
        return 'Medium (~100m)';
      case LocationAccuracy.high:
        return 'High (~10m)';
      case LocationAccuracy.best:
        return 'Best (~3m)';
    }
  }

  double get accuracyMeters {
    switch (this) {
      case LocationAccuracy.lowest:
        return 3000;
      case LocationAccuracy.low:
        return 1000;
      case LocationAccuracy.medium:
        return 100;
      case LocationAccuracy.high:
        return 10;
      case LocationAccuracy.best:
        return 3;
    }
  }
}

extension DateFormatExtension on DateFormat {
  String get displayName {
    switch (this) {
      case DateFormat.ddMMyyyy:
        return 'DD/MM/YYYY';
      case DateFormat.mmDDyyyy:
        return 'MM/DD/YYYY';
      case DateFormat.yyyyMMdd:
        return 'YYYY-MM-DD';
      case DateFormat.ddMMMyyyy:
        return 'DD MMM YYYY';
    }
  }

  String get pattern {
    switch (this) {
      case DateFormat.ddMMyyyy:
        return 'dd/MM/yyyy';
      case DateFormat.mmDDyyyy:
        return 'MM/dd/yyyy';
      case DateFormat.yyyyMMdd:
        return 'yyyy-MM-dd';
      case DateFormat.ddMMMyyyy:
        return 'dd MMM yyyy';
    }
  }
}

extension TimeFormatExtension on TimeFormat {
  String get displayName {
    switch (this) {
      case TimeFormat.format12:
        return '12 Hour (AM/PM)';
      case TimeFormat.format24:
        return '24 Hour';
    }
  }

  String get pattern {
    switch (this) {
      case TimeFormat.format12:
        return 'h:mm a';
      case TimeFormat.format24:
        return 'HH:mm';
    }
  }
}

// Settings Manager
class SettingsManager {
  static const String settingsKey = 'app_settings';

  static AppSettings getDefaultSettings() {
    return AppSettings.defaultSettings();
  }

  static AppSettings updateLanguage(AppSettings settings, String language) {
    return settings.copyWith(
      language: language,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateTheme(AppSettings settings, ThemeMode themeMode) {
    return settings.copyWith(
      themeMode: themeMode,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateSyncSettings(AppSettings settings, SyncSettings syncSettings) {
    return settings.copyWith(
      syncSettings: syncSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateCameraSettings(AppSettings settings, CameraSettings cameraSettings) {
    return settings.copyWith(
      cameraSettings: cameraSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateLocationSettings(AppSettings settings, LocationSettings locationSettings) {
    return settings.copyWith(
      locationSettings: locationSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateSecuritySettings(AppSettings settings, SecuritySettings securitySettings) {
    return settings.copyWith(
      securitySettings: securitySettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateDisplaySettings(AppSettings settings, DisplaySettings displaySettings) {
    return settings.copyWith(
      displaySettings: displaySettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateDataSettings(AppSettings settings, DataSettings dataSettings) {
    return settings.copyWith(
      dataSettings: dataSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateAccessibilitySettings(AppSettings settings, AccessibilitySettings accessibilitySettings) {
    return settings.copyWith(
      accessibilitySettings: accessibilitySettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings updateCustomSetting(AppSettings settings, String key, dynamic value) {
    final updatedCustomSettings = Map<String, dynamic>.from(settings.customSettings);
    updatedCustomSettings[key] = value;
    
    return settings.copyWith(
      customSettings: updatedCustomSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static AppSettings removeCustomSetting(AppSettings settings, String key) {
    final updatedCustomSettings = Map<String, dynamic>.from(settings.customSettings);
    updatedCustomSettings.remove(key);
    
    return settings.copyWith(
      customSettings: updatedCustomSettings,
      lastUpdated: DateTime.now(),
    );
  }

  static bool validateSettings(AppSettings settings) {
    // Validate text scale
    if (settings.displaySettings.textScale < 0.5 || settings.displaySettings.textScale > 3.0) {
      return false;
    }
    
    // Validate cache size
    if (settings.dataSettings.maxCacheSize < 10 || settings.dataSettings.maxCacheSize > 1000) {
      return false;
    }
    
    // Validate timeout
    if (settings.syncSettings.timeoutSeconds < 5 || settings.syncSettings.timeoutSeconds > 300) {
      return false;
    }
    
    // Validate photo quality
    if (settings.syncSettings.photoQuality < 10 || settings.syncSettings.photoQuality > 100) {
      return false;
    }
    
    return true;
  }

  static AppSettings sanitizeSettings(AppSettings settings) {
    return settings.copyWith(
      displaySettings: settings.displaySettings.copyWith(
        textScale: settings.displaySettings.textScale.clamp(0.5, 3.0),
      ),
      dataSettings: settings.dataSettings.copyWith(
        maxCacheSize: settings.dataSettings.maxCacheSize.clamp(10, 1000),
      ),
      syncSettings: settings.syncSettings.copyWith(
        timeoutSeconds: settings.syncSettings.timeoutSeconds.clamp(5, 300),
        photoQuality: settings.syncSettings.photoQuality.clamp(10, 100),
      ),
    );
  }
}