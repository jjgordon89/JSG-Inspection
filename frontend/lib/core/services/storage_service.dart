import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../utils/constants.dart';
import '../exceptions/app_exceptions.dart';

class StorageService {
  static StorageService? _instance;
  static StorageService get instance => _instance ??= StorageService._();
  
  StorageService._();
  
  SharedPreferences? _prefs;
  FlutterSecureStorage? _secureStorage;
  bool _isInitialized = false;
  
  // Hive boxes
  Box<dynamic>? _settingsBox;
  Box<dynamic>? _cacheBox;
  Box<dynamic>? _userDataBox;
  
  // Initialize storage services
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize Hive
      await Hive.initFlutter();
      
      // Open Hive boxes
      _settingsBox = await Hive.openBox(AppConstants.settingsBoxName);
      _cacheBox = await Hive.openBox(AppConstants.cacheBoxName);
      _userDataBox = await Hive.openBox(AppConstants.userDataBoxName);
      
      // Initialize SharedPreferences
      _prefs = await SharedPreferences.getInstance();
      
      // Initialize FlutterSecureStorage
      _secureStorage = const FlutterSecureStorage(
        aOptions: AndroidOptions(
          encryptedSharedPreferences: true,
        ),
        iOptions: IOSOptions(
          accessibility: KeychainAccessibility.first_unlock_this_device,
        ),
        wOptions: WindowsOptions(),
        lOptions: LinuxOptions(),
      );
      
      _isInitialized = true;
      debugPrint('StorageService initialized successfully');
    } catch (e) {
      debugPrint('Failed to initialize StorageService: $e');
      throw FileException('Failed to initialize storage: $e');
    }
  }
  
  // Ensure service is initialized
  void _ensureInitialized() {
    if (!_isInitialized) {
      throw FileException('StorageService not initialized');
    }
  }
  
  // === SharedPreferences Methods ===
  
  // Store string value
  Future<bool> setString(String key, String value) async {
    _ensureInitialized();
    try {
      return await _prefs!.setString(key, value);
    } catch (e) {
      debugPrint('Failed to store string: $e');
      return false;
    }
  }
  
  // Get string value
  String? getString(String key, [String? defaultValue]) {
    _ensureInitialized();
    try {
      return _prefs!.getString(key) ?? defaultValue;
    } catch (e) {
      debugPrint('Failed to get string: $e');
      return defaultValue;
    }
  }
  
  // Store integer value
  Future<bool> setInt(String key, int value) async {
    _ensureInitialized();
    try {
      return await _prefs!.setInt(key, value);
    } catch (e) {
      debugPrint('Failed to store int: $e');
      return false;
    }
  }
  
  // Get integer value
  int? getInt(String key, [int? defaultValue]) {
    _ensureInitialized();
    try {
      return _prefs!.getInt(key) ?? defaultValue;
    } catch (e) {
      debugPrint('Failed to get int: $e');
      return defaultValue;
    }
  }
  
  // Store boolean value
  Future<bool> setBool(String key, bool value) async {
    _ensureInitialized();
    try {
      return await _prefs!.setBool(key, value);
    } catch (e) {
      debugPrint('Failed to store bool: $e');
      return false;
    }
  }
  
  // Get boolean value
  bool? getBool(String key, [bool? defaultValue]) {
    _ensureInitialized();
    try {
      return _prefs!.getBool(key) ?? defaultValue;
    } catch (e) {
      debugPrint('Failed to get bool: $e');
      return defaultValue;
    }
  }
  
  // Store double value
  Future<bool> setDouble(String key, double value) async {
    _ensureInitialized();
    try {
      return await _prefs!.setDouble(key, value);
    } catch (e) {
      debugPrint('Failed to store double: $e');
      return false;
    }
  }
  
  // Get double value
  double? getDouble(String key, [double? defaultValue]) {
    _ensureInitialized();
    try {
      return _prefs!.getDouble(key) ?? defaultValue;
    } catch (e) {
      debugPrint('Failed to get double: $e');
      return defaultValue;
    }
  }
  
  // Store string list
  Future<bool> setStringList(String key, List<String> value) async {
    _ensureInitialized();
    try {
      return await _prefs!.setStringList(key, value);
    } catch (e) {
      debugPrint('Failed to store string list: $e');
      return false;
    }
  }
  
  // Get string list
  List<String>? getStringList(String key, [List<String>? defaultValue]) {
    _ensureInitialized();
    try {
      return _prefs!.getStringList(key) ?? defaultValue;
    } catch (e) {
      debugPrint('Failed to get string list: $e');
      return defaultValue;
    }
  }
  
  // Store JSON object
  Future<bool> setJson(String key, Map<String, dynamic> value) async {
    _ensureInitialized();
    try {
      final jsonString = jsonEncode(value);
      return await _prefs!.setString(key, jsonString);
    } catch (e) {
      debugPrint('Failed to store JSON: $e');
      return false;
    }
  }
  
  // Get JSON object
  Map<String, dynamic>? getJson(String key, [Map<String, dynamic>? defaultValue]) {
    _ensureInitialized();
    try {
      final jsonString = _prefs!.getString(key);
      if (jsonString == null) return defaultValue;
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Failed to get JSON: $e');
      return defaultValue;
    }
  }
  
  // Remove key
  Future<bool> remove(String key) async {
    _ensureInitialized();
    try {
      return await _prefs!.remove(key);
    } catch (e) {
      debugPrint('Failed to remove key: $e');
      return false;
    }
  }
  
  // Clear all preferences
  Future<bool> clear() async {
    _ensureInitialized();
    try {
      return await _prefs!.clear();
    } catch (e) {
      debugPrint('Failed to clear preferences: $e');
      return false;
    }
  }
  
  // Check if key exists
  bool containsKey(String key) {
    _ensureInitialized();
    try {
      return _prefs!.containsKey(key);
    } catch (e) {
      debugPrint('Failed to check key existence: $e');
      return false;
    }
  }
  
  // Get all keys
  Set<String> getKeys() {
    _ensureInitialized();
    try {
      return _prefs!.getKeys();
    } catch (e) {
      debugPrint('Failed to get keys: $e');
      return <String>{};
    }
  }
  
  // === Secure Storage Methods ===
  
  // Store secure data
  Future<void> setSecureData(String key, String value) async {
    _ensureInitialized();
    try {
      await _secureStorage!.write(key: key, value: value);
    } catch (e) {
      debugPrint('Failed to store secure data: $e');
      throw FileException('Failed to store secure data: $e');
    }
  }
  
  // Get secure data
  Future<String?> getSecureData(String key) async {
    _ensureInitialized();
    try {
      return await _secureStorage!.read(key: key);
    } catch (e) {
      debugPrint('Failed to get secure data: $e');
      return null;
    }
  }
  
  // Store secure JSON
  Future<void> setSecureJson(String key, Map<String, dynamic> value) async {
    _ensureInitialized();
    try {
      final jsonString = jsonEncode(value);
      await _secureStorage!.write(key: key, value: jsonString);
    } catch (e) {
      debugPrint('Failed to store secure JSON: $e');
      throw FileException('Failed to store secure JSON: $e');
    }
  }
  
  // Get secure JSON
  Future<Map<String, dynamic>?> getSecureJson(String key) async {
    _ensureInitialized();
    try {
      final jsonString = await _secureStorage!.read(key: key);
      if (jsonString == null) return null;
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Failed to get secure JSON: $e');
      return null;
    }
  }
  
  // Remove secure data
  Future<void> clearSecureData(String key) async {
    _ensureInitialized();
    try {
      await _secureStorage!.delete(key: key);
    } catch (e) {
      debugPrint('Failed to clear secure data: $e');
    }
  }
  
  // Clear all secure data
  Future<void> clearAllSecureData() async {
    _ensureInitialized();
    try {
      await _secureStorage!.deleteAll();
    } catch (e) {
      debugPrint('Failed to clear all secure data: $e');
    }
  }
  
  // Check if secure key exists
  Future<bool> containsSecureKey(String key) async {
    _ensureInitialized();
    try {
      return await _secureStorage!.containsKey(key: key);
    } catch (e) {
      debugPrint('Failed to check secure key existence: $e');
      return false;
    }
  }
  
  // Get all secure keys
  Future<Map<String, String>> getAllSecureData() async {
    _ensureInitialized();
    try {
      return await _secureStorage!.readAll();
    } catch (e) {
      debugPrint('Failed to get all secure data: $e');
      return <String, String>{};
    }
  }
  
  // === Hive Storage Methods ===
  
  // Settings Box Methods
  Future<void> setSetting(String key, dynamic value) async {
    _ensureInitialized();
    try {
      await _settingsBox!.put(key, value);
    } catch (e) {
      debugPrint('Failed to store setting: $e');
    }
  }
  
  T? getSetting<T>(String key, [T? defaultValue]) {
    _ensureInitialized();
    try {
      return _settingsBox!.get(key, defaultValue: defaultValue) as T?;
    } catch (e) {
      debugPrint('Failed to get setting: $e');
      return defaultValue;
    }
  }
  
  Future<void> removeSetting(String key) async {
    _ensureInitialized();
    try {
      await _settingsBox!.delete(key);
    } catch (e) {
      debugPrint('Failed to remove setting: $e');
    }
  }
  
  Future<void> clearSettings() async {
    _ensureInitialized();
    try {
      await _settingsBox!.clear();
    } catch (e) {
      debugPrint('Failed to clear settings: $e');
    }
  }
  
  // Cache Box Methods
  Future<void> setCache(String key, dynamic value, [Duration? ttl]) async {
    _ensureInitialized();
    try {
      final cacheItem = {
        'value': value,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'ttl': ttl?.inMilliseconds,
      };
      await _cacheBox!.put(key, cacheItem);
    } catch (e) {
      debugPrint('Failed to store cache: $e');
    }
  }
  
  T? getCache<T>(String key) {
    _ensureInitialized();
    try {
      final cacheItem = _cacheBox!.get(key) as Map<dynamic, dynamic>?;
      if (cacheItem == null) return null;
      
      final timestamp = cacheItem['timestamp'] as int;
      final ttl = cacheItem['ttl'] as int?;
      
      // Check if cache has expired
      if (ttl != null) {
        final expiryTime = timestamp + ttl;
        if (DateTime.now().millisecondsSinceEpoch > expiryTime) {
          _cacheBox!.delete(key);
          return null;
        }
      }
      
      return cacheItem['value'] as T?;
    } catch (e) {
      debugPrint('Failed to get cache: $e');
      return null;
    }
  }
  
  Future<void> removeCache(String key) async {
    _ensureInitialized();
    try {
      await _cacheBox!.delete(key);
    } catch (e) {
      debugPrint('Failed to remove cache: $e');
    }
  }
  
  Future<void> clearCache() async {
    _ensureInitialized();
    try {
      await _cacheBox!.clear();
    } catch (e) {
      debugPrint('Failed to clear cache: $e');
    }
  }
  
  Future<void> clearExpiredCache() async {
    _ensureInitialized();
    try {
      final keysToRemove = <dynamic>[];
      final now = DateTime.now().millisecondsSinceEpoch;
      
      for (final key in _cacheBox!.keys) {
        final cacheItem = _cacheBox!.get(key) as Map<dynamic, dynamic>?;
        if (cacheItem != null) {
          final timestamp = cacheItem['timestamp'] as int;
          final ttl = cacheItem['ttl'] as int?;
          
          if (ttl != null && now > timestamp + ttl) {
            keysToRemove.add(key);
          }
        }
      }
      
      await _cacheBox!.deleteAll(keysToRemove);
      debugPrint('Cleared ${keysToRemove.length} expired cache items');
    } catch (e) {
      debugPrint('Failed to clear expired cache: $e');
    }
  }
  
  // User Data Box Methods
  Future<void> setUserData(String key, dynamic value) async {
    _ensureInitialized();
    try {
      await _userDataBox!.put(key, value);
    } catch (e) {
      debugPrint('Failed to store user data: $e');
    }
  }
  
  T? getUserData<T>(String key, [T? defaultValue]) {
    _ensureInitialized();
    try {
      return _userDataBox!.get(key, defaultValue: defaultValue) as T?;
    } catch (e) {
      debugPrint('Failed to get user data: $e');
      return defaultValue;
    }
  }
  
  Future<void> removeUserData(String key) async {
    _ensureInitialized();
    try {
      await _userDataBox!.delete(key);
    } catch (e) {
      debugPrint('Failed to remove user data: $e');
    }
  }
  
  Future<void> clearUserData() async {
    _ensureInitialized();
    try {
      await _userDataBox!.clear();
    } catch (e) {
      debugPrint('Failed to clear user data: $e');
    }
  }
  
  // === Utility Methods ===
  
  // Get storage size information
  Map<String, int> getStorageInfo() {
    _ensureInitialized();
    try {
      return {
        'settings': _settingsBox!.length,
        'cache': _cacheBox!.length,
        'userData': _userDataBox!.length,
      };
    } catch (e) {
      debugPrint('Failed to get storage info: $e');
      return {'settings': 0, 'cache': 0, 'userData': 0};
    }
  }
  
  // Clear all data (except secure storage)
  Future<void> clearAllData() async {
    _ensureInitialized();
    try {
      await Future.wait([
        clear(),
        clearSettings(),
        clearCache(),
        clearUserData(),
      ]);
      debugPrint('All storage data cleared');
    } catch (e) {
      debugPrint('Failed to clear all data: $e');
    }
  }
  
  // Export data for backup
  Future<Map<String, dynamic>> exportData() async {
    _ensureInitialized();
    try {
      final data = <String, dynamic>{};
      
      // Export SharedPreferences
      final prefsKeys = _prefs!.getKeys();
      final prefsData = <String, dynamic>{};
      for (final key in prefsKeys) {
        prefsData[key] = _prefs!.get(key);
      }
      data['preferences'] = prefsData;
      
      // Export Hive boxes
      data['settings'] = Map<String, dynamic>.from(_settingsBox!.toMap());
      data['userData'] = Map<String, dynamic>.from(_userDataBox!.toMap());
      
      // Note: Cache and secure storage are not exported for security reasons
      
      return data;
    } catch (e) {
      debugPrint('Failed to export data: $e');
      throw FileException('Failed to export data: $e');
    }
  }
  
  // Import data from backup
  Future<void> importData(Map<String, dynamic> data) async {
    _ensureInitialized();
    try {
      // Import SharedPreferences
      if (data.containsKey('preferences')) {
        final prefsData = data['preferences'] as Map<String, dynamic>;
        for (final entry in prefsData.entries) {
          final value = entry.value;
          if (value is String) {
            await _prefs!.setString(entry.key, value);
          } else if (value is int) {
            await _prefs!.setInt(entry.key, value);
          } else if (value is double) {
            await _prefs!.setDouble(entry.key, value);
          } else if (value is bool) {
            await _prefs!.setBool(entry.key, value);
          } else if (value is List<String>) {
            await _prefs!.setStringList(entry.key, value);
          }
        }
      }
      
      // Import Hive boxes
      if (data.containsKey('settings')) {
        final settingsData = data['settings'] as Map<String, dynamic>;
        for (final entry in settingsData.entries) {
          await _settingsBox!.put(entry.key, entry.value);
        }
      }
      
      if (data.containsKey('userData')) {
        final userDataData = data['userData'] as Map<String, dynamic>;
        for (final entry in userDataData.entries) {
          await _userDataBox!.put(entry.key, entry.value);
        }
      }
      
      debugPrint('Data imported successfully');
    } catch (e) {
      debugPrint('Failed to import data: $e');
      throw FileException('Failed to import data: $e');
    }
  }
  
  // Check if service is initialized
  bool get isInitialized => _isInitialized;
  
  // Dispose resources
  Future<void> dispose() async {
    try {
      await _settingsBox?.close();
      await _cacheBox?.close();
      await _userDataBox?.close();
      _isInitialized = false;
      debugPrint('StorageService disposed');
    } catch (e) {
      debugPrint('Failed to dispose StorageService: $e');
    }
  }
}