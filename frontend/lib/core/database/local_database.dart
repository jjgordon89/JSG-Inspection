import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../utils/constants.dart';
import '../exceptions/app_exceptions.dart';
import '../../shared/models/user.dart';
import '../../shared/models/asset.dart';
import '../../shared/models/inspection.dart';
import '../../shared/models/form_template.dart';
import '../../shared/models/folder.dart';
import '../../shared/models/report.dart';
import '../../shared/models/sync_queue.dart';
import '../../shared/models/notification.dart';
import '../../shared/models/settings.dart';

class LocalDatabase {
  static LocalDatabase? _instance;
  static LocalDatabase get instance => _instance ??= LocalDatabase._();
  
  LocalDatabase._();
  
  bool _isInitialized = false;
  
  // Hive boxes
  Box<User>? _usersBox;
  Box<Asset>? _assetsBox;
  Box<Inspection>? _inspectionsBox;
  Box<FormTemplate>? _formTemplatesBox;
  Box<Folder>? _foldersBox;
  Box<Report>? _reportsBox;
  Box<SyncQueueItem>? _syncQueueBox;
  Box<AppNotification>? _notificationsBox;
  Box<dynamic>? _settingsBox;
  Box<dynamic>? _cacheBox;
  
  /// Initialize the local database
  static Future<void> initialize() async {
    await instance._initialize();
  }
  
  Future<void> _initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize Hive
      await Hive.initFlutter();
      
      // Register adapters for custom types
      await _registerAdapters();
      
      // Open boxes
      await _openBoxes();
      
      _isInitialized = true;
      debugPrint('LocalDatabase initialized successfully');
    } catch (e) {
      debugPrint('Failed to initialize LocalDatabase: $e');
      throw DatabaseException('Failed to initialize local database: $e');
    }
  }
  
  /// Register Hive type adapters
  Future<void> _registerAdapters() async {
    // Register enum adapters
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(UserRoleAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(UserStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(2)) {
      Hive.registerAdapter(AssetStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(3)) {
      Hive.registerAdapter(AssetTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(4)) {
      Hive.registerAdapter(InspectionStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(5)) {
      Hive.registerAdapter(InspectionPriorityAdapter());
    }
    if (!Hive.isAdapterRegistered(6)) {
      Hive.registerAdapter(QuestionTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(7)) {
      Hive.registerAdapter(FormTemplateStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(8)) {
      Hive.registerAdapter(FolderTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(9)) {
      Hive.registerAdapter(ReportStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(10)) {
      Hive.registerAdapter(ReportTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(11)) {
      Hive.registerAdapter(SyncOperationAdapter());
    }
    if (!Hive.isAdapterRegistered(12)) {
      Hive.registerAdapter(SyncQueueStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(13)) {
      Hive.registerAdapter(NotificationTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(14)) {
      Hive.registerAdapter(NotificationPriorityAdapter());
    }
    if (!Hive.isAdapterRegistered(15)) {
      Hive.registerAdapter(NotificationStatusAdapter());
    }
    if (!Hive.isAdapterRegistered(16)) {
      Hive.registerAdapter(DefectSeverityAdapter());
    }
    if (!Hive.isAdapterRegistered(17)) {
      Hive.registerAdapter(ScoreGradeAdapter());
    }
    if (!Hive.isAdapterRegistered(18)) {
      Hive.registerAdapter(ReportFormatAdapter());
    }
    if (!Hive.isAdapterRegistered(19)) {
      Hive.registerAdapter(ReportSectionTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(20)) {
      Hive.registerAdapter(ChartTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(21)) {
      Hive.registerAdapter(RecommendationPriorityAdapter());
    }
    if (!Hive.isAdapterRegistered(22)) {
      Hive.registerAdapter(RecommendationTypeAdapter());
    }
    if (!Hive.isAdapterRegistered(23)) {
      Hive.registerAdapter(ThemeModeAdapter());
    }
    if (!Hive.isAdapterRegistered(24)) {
      Hive.registerAdapter(SyncFrequencyAdapter());
    }
    if (!Hive.isAdapterRegistered(25)) {
      Hive.registerAdapter(ConflictResolutionAdapter());
    }
    if (!Hive.isAdapterRegistered(26)) {
      Hive.registerAdapter(CameraResolutionAdapter());
    }
    if (!Hive.isAdapterRegistered(27)) {
      Hive.registerAdapter(CameraLensAdapter());
    }
    if (!Hive.isAdapterRegistered(28)) {
      Hive.registerAdapter(LocationAccuracyAdapter());
    }
    if (!Hive.isAdapterRegistered(29)) {
      Hive.registerAdapter(DateFormatAdapter());
    }
    if (!Hive.isAdapterRegistered(30)) {
      Hive.registerAdapter(TimeFormatAdapter());
    }
    if (!Hive.isAdapterRegistered(31)) {
      Hive.registerAdapter(ScreenOrientationAdapter());
    }
    
    // Register model adapters
    if (!Hive.isAdapterRegistered(50)) {
      Hive.registerAdapter(UserAdapter());
    }
    if (!Hive.isAdapterRegistered(51)) {
      Hive.registerAdapter(AssetAdapter());
    }
    if (!Hive.isAdapterRegistered(52)) {
      Hive.registerAdapter(AssetLocationAdapter());
    }
    if (!Hive.isAdapterRegistered(53)) {
      Hive.registerAdapter(InspectionAdapter());
    }
    if (!Hive.isAdapterRegistered(54)) {
      Hive.registerAdapter(InspectionResponseAdapter());
    }
    if (!Hive.isAdapterRegistered(55)) {
      Hive.registerAdapter(InspectionPhotoAdapter());
    }
    if (!Hive.isAdapterRegistered(56)) {
      Hive.registerAdapter(PhotoLocationAdapter());
    }
    if (!Hive.isAdapterRegistered(57)) {
      Hive.registerAdapter(InspectionScoreAdapter());
    }
    if (!Hive.isAdapterRegistered(58)) {
      Hive.registerAdapter(FormTemplateAdapter());
    }
    if (!Hive.isAdapterRegistered(59)) {
      Hive.registerAdapter(FormSectionAdapter());
    }
    if (!Hive.isAdapterRegistered(60)) {
      Hive.registerAdapter(FormQuestionAdapter());
    }
    if (!Hive.isAdapterRegistered(61)) {
      Hive.registerAdapter(QuestionOptionAdapter());
    }
    if (!Hive.isAdapterRegistered(62)) {
      Hive.registerAdapter(QuestionValidationAdapter());
    }
    if (!Hive.isAdapterRegistered(63)) {
      Hive.registerAdapter(FolderAdapter());
    }
    if (!Hive.isAdapterRegistered(64)) {
      Hive.registerAdapter(ReportAdapter());
    }
    if (!Hive.isAdapterRegistered(65)) {
      Hive.registerAdapter(ReportParametersAdapter());
    }
    if (!Hive.isAdapterRegistered(66)) {
      Hive.registerAdapter(ReportDataAdapter());
    }
    if (!Hive.isAdapterRegistered(67)) {
      Hive.registerAdapter(ReportSummaryAdapter());
    }
    if (!Hive.isAdapterRegistered(68)) {
      Hive.registerAdapter(ReportSectionAdapter());
    }
    if (!Hive.isAdapterRegistered(69)) {
      Hive.registerAdapter(ReportChartAdapter());
    }
    if (!Hive.isAdapterRegistered(70)) {
      Hive.registerAdapter(ReportTableAdapter());
    }
    if (!Hive.isAdapterRegistered(71)) {
      Hive.registerAdapter(ReportRecommendationAdapter());
    }
    if (!Hive.isAdapterRegistered(72)) {
      Hive.registerAdapter(SyncQueueItemAdapter());
    }
    if (!Hive.isAdapterRegistered(73)) {
      Hive.registerAdapter(AppNotificationAdapter());
    }
    if (!Hive.isAdapterRegistered(74)) {
      Hive.registerAdapter(AppSettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(75)) {
      Hive.registerAdapter(SyncSettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(76)) {
      Hive.registerAdapter(CameraSettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(77)) {
      Hive.registerAdapter(LocationSettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(78)) {
      Hive.registerAdapter(SecuritySettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(79)) {
      Hive.registerAdapter(DisplaySettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(80)) {
      Hive.registerAdapter(DataSettingsAdapter());
    }
    if (!Hive.isAdapterRegistered(81)) {
      Hive.registerAdapter(AccessibilitySettingsAdapter());
    }
  }
  
  /// Open all Hive boxes
  Future<void> _openBoxes() async {
    _usersBox = await Hive.openBox<User>(AppConstants.usersBoxName);
    _assetsBox = await Hive.openBox<Asset>(AppConstants.assetsBoxName);
    _inspectionsBox = await Hive.openBox<Inspection>(AppConstants.inspectionsBoxName);
    _formTemplatesBox = await Hive.openBox<FormTemplate>(AppConstants.formTemplatesBoxName);
    _foldersBox = await Hive.openBox<Folder>(AppConstants.foldersBoxName);
    _reportsBox = await Hive.openBox<Report>(AppConstants.reportsBoxName);
    _syncQueueBox = await Hive.openBox<SyncQueueItem>(AppConstants.syncQueueBoxName);
    _notificationsBox = await Hive.openBox<AppNotification>(AppConstants.notificationsBoxName);
    _settingsBox = await Hive.openBox(AppConstants.settingsBoxName);
    _cacheBox = await Hive.openBox(AppConstants.cacheBoxName);
  }
  
  /// Get users box
  Box<User> get usersBox {
    _ensureInitialized();
    return _usersBox!;
  }
  
  /// Get assets box
  Box<Asset> get assetsBox {
    _ensureInitialized();
    return _assetsBox!;
  }
  
  /// Get inspections box
  Box<Inspection> get inspectionsBox {
    _ensureInitialized();
    return _inspectionsBox!;
  }
  
  /// Get form templates box
  Box<FormTemplate> get formTemplatesBox {
    _ensureInitialized();
    return _formTemplatesBox!;
  }
  
  /// Get folders box
  Box<Folder> get foldersBox {
    _ensureInitialized();
    return _foldersBox!;
  }
  
  /// Get reports box
  Box<Report> get reportsBox {
    _ensureInitialized();
    return _reportsBox!;
  }
  
  /// Get sync queue box
  Box<SyncQueueItem> get syncQueueBox {
    _ensureInitialized();
    return _syncQueueBox!;
  }
  
  /// Get notifications box
  Box<AppNotification> get notificationsBox {
    _ensureInitialized();
    return _notificationsBox!;
  }
  
  /// Get settings box
  Box<dynamic> get settingsBox {
    _ensureInitialized();
    return _settingsBox!;
  }
  
  /// Get cache box
  Box<dynamic> get cacheBox {
    _ensureInitialized();
    return _cacheBox!;
  }
  
  /// Clear all data from local database
  Future<void> clearAllData() async {
    _ensureInitialized();
    
    await Future.wait([
      _usersBox!.clear(),
      _assetsBox!.clear(),
      _inspectionsBox!.clear(),
      _formTemplatesBox!.clear(),
      _foldersBox!.clear(),
      _reportsBox!.clear(),
      _syncQueueBox!.clear(),
      _notificationsBox!.clear(),
      _settingsBox!.clear(),
      _cacheBox!.clear(),
    ]);
    
    debugPrint('All local data cleared');
  }
  
  /// Clear specific box data
  Future<void> clearBoxData(String boxName) async {
    _ensureInitialized();
    
    switch (boxName) {
      case AppConstants.usersBoxName:
        await _usersBox!.clear();
        break;
      case AppConstants.assetsBoxName:
        await _assetsBox!.clear();
        break;
      case AppConstants.inspectionsBoxName:
        await _inspectionsBox!.clear();
        break;
      case AppConstants.formTemplatesBoxName:
        await _formTemplatesBox!.clear();
        break;
      case AppConstants.foldersBoxName:
        await _foldersBox!.clear();
        break;
      case AppConstants.reportsBoxName:
        await _reportsBox!.clear();
        break;
      case AppConstants.syncQueueBoxName:
        await _syncQueueBox!.clear();
        break;
      case AppConstants.notificationsBoxName:
        await _notificationsBox!.clear();
        break;
      case AppConstants.settingsBoxName:
        await _settingsBox!.clear();
        break;
      case AppConstants.cacheBoxName:
        await _cacheBox!.clear();
        break;
      default:
        throw ArgumentError('Unknown box name: $boxName');
    }
    
    debugPrint('Cleared data for box: $boxName');
  }
  
  /// Get database statistics
  Map<String, int> getDatabaseStats() {
    _ensureInitialized();
    
    return {
      'users': _usersBox!.length,
      'assets': _assetsBox!.length,
      'inspections': _inspectionsBox!.length,
      'formTemplates': _formTemplatesBox!.length,
      'folders': _foldersBox!.length,
      'reports': _reportsBox!.length,
      'syncQueue': _syncQueueBox!.length,
      'notifications': _notificationsBox!.length,
      'settings': _settingsBox!.length,
      'cache': _cacheBox!.length,
    };
  }
  
  /// Compact all boxes to optimize storage
  Future<void> compactDatabase() async {
    _ensureInitialized();
    
    await Future.wait([
      _usersBox!.compact(),
      _assetsBox!.compact(),
      _inspectionsBox!.compact(),
      _formTemplatesBox!.compact(),
      _foldersBox!.compact(),
      _reportsBox!.compact(),
      _syncQueueBox!.compact(),
      _notificationsBox!.compact(),
      _settingsBox!.compact(),
      _cacheBox!.compact(),
    ]);
    
    debugPrint('Database compacted successfully');
  }
  
  /// Check if database is initialized
  bool get isInitialized => _isInitialized;
  
  /// Ensure database is initialized
  void _ensureInitialized() {
    if (!_isInitialized) {
      throw DatabaseException('LocalDatabase not initialized');
    }
  }
  
  /// Close all boxes and cleanup
  Future<void> dispose() async {
    if (!_isInitialized) return;
    
    await Future.wait([
      _usersBox?.close() ?? Future.value(),
      _assetsBox?.close() ?? Future.value(),
      _inspectionsBox?.close() ?? Future.value(),
      _formTemplatesBox?.close() ?? Future.value(),
      _foldersBox?.close() ?? Future.value(),
      _reportsBox?.close() ?? Future.value(),
      _syncQueueBox?.close() ?? Future.value(),
      _notificationsBox?.close() ?? Future.value(),
      _settingsBox?.close() ?? Future.value(),
      _cacheBox?.close() ?? Future.value(),
    ]);
    
    _isInitialized = false;
    debugPrint('LocalDatabase disposed');
  }
}