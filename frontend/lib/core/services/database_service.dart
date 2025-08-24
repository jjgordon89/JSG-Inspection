import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:surrealdb/surrealdb.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/constants.dart';
import '../exceptions/app_exceptions.dart';
import '../models/sync_status.dart';

class DatabaseService {
  static DatabaseService? _instance;
  static DatabaseService get instance => _instance ??= DatabaseService._();
  
  DatabaseService._();
  
  SurrealDB? _localDb;
  SurrealDB? _remoteDb;
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  bool _isOnline = false;
  bool _isInitialized = false;
  
  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;
  
  final StreamController<bool> _connectionStatusController = StreamController<bool>.broadcast();
  Stream<bool> get connectionStatusStream => _connectionStatusController.stream;
  
  // Initialize database connections
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize local embedded database
      await _initializeLocalDatabase();
      
      // Initialize remote database connection
      await _initializeRemoteDatabase();
      
      // Setup connectivity monitoring
      await _setupConnectivityMonitoring();
      
      // Start background sync
      _startBackgroundSync();
      
      _isInitialized = true;
      debugPrint('DatabaseService initialized successfully');
    } catch (e) {
      debugPrint('Failed to initialize DatabaseService: $e');
      throw DatabaseException('Failed to initialize database: $e');
    }
  }
  
  // Initialize local embedded SurrealDB
  Future<void> _initializeLocalDatabase() async {
    try {
      _localDb = SurrealDB('memory');
      await _localDb!.connect();
      await _localDb!.use(AppConstants.databaseNamespace, AppConstants.databaseName);
      
      // Setup local database schema
      await _setupLocalSchema();
      
      debugPrint('Local database initialized');
    } catch (e) {
      debugPrint('Failed to initialize local database: $e');
      throw DatabaseException('Failed to initialize local database: $e');
    }
  }
  
  // Initialize remote SurrealDB connection
  Future<void> _initializeRemoteDatabase() async {
    try {
      _remoteDb = SurrealDB(AppConstants.databaseUrl);
      
      // Try to connect to remote database
      await _remoteDb!.connect();
      await _remoteDb!.use(AppConstants.databaseNamespace, AppConstants.databaseName);
      
      // Authenticate with stored credentials
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.authTokenKey);
      
      if (token != null) {
        await _remoteDb!.authenticate(token);
      }
      
      _isOnline = true;
      _connectionStatusController.add(true);
      debugPrint('Remote database connected');
    } catch (e) {
      debugPrint('Failed to connect to remote database: $e');
      _isOnline = false;
      _connectionStatusController.add(false);
      // Don't throw error - app should work offline
    }
  }
  
  // Setup local database schema
  Future<void> _setupLocalSchema() async {
    if (_localDb == null) return;
    
    try {
      // Define tables and relationships
      final schemaQueries = [
        // Users table
        '''DEFINE TABLE users SCHEMAFULL;
           DEFINE FIELD id ON users TYPE record<users>;
           DEFINE FIELD email ON users TYPE string;
           DEFINE FIELD name ON users TYPE string;
           DEFINE FIELD role ON users TYPE string;
           DEFINE FIELD created_at ON users TYPE datetime;
           DEFINE FIELD updated_at ON users TYPE datetime;
           DEFINE FIELD sync_status ON users TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON users TYPE datetime;
           DEFINE INDEX email_idx ON users COLUMNS email UNIQUE;''',
        
        // Assets table
        '''DEFINE TABLE assets SCHEMAFULL;
           DEFINE FIELD id ON assets TYPE record<assets>;
           DEFINE FIELD name ON assets TYPE string;
           DEFINE FIELD code ON assets TYPE string;
           DEFINE FIELD description ON assets TYPE string;
           DEFINE FIELD location ON assets TYPE object;
           DEFINE FIELD qr_code ON assets TYPE string;
           DEFINE FIELD status ON assets TYPE string;
           DEFINE FIELD created_at ON assets TYPE datetime;
           DEFINE FIELD updated_at ON assets TYPE datetime;
           DEFINE FIELD sync_status ON assets TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON assets TYPE datetime;
           DEFINE INDEX code_idx ON assets COLUMNS code UNIQUE;''',
        
        // Form templates table
        '''DEFINE TABLE form_templates SCHEMAFULL;
           DEFINE FIELD id ON form_templates TYPE record<form_templates>;
           DEFINE FIELD name ON form_templates TYPE string;
           DEFINE FIELD description ON form_templates TYPE string;
           DEFINE FIELD questions ON form_templates TYPE array;
           DEFINE FIELD created_by ON form_templates TYPE record<users>;
           DEFINE FIELD created_at ON form_templates TYPE datetime;
           DEFINE FIELD updated_at ON form_templates TYPE datetime;
           DEFINE FIELD sync_status ON form_templates TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON form_templates TYPE datetime;''',
        
        // Inspections table
        '''DEFINE TABLE inspections SCHEMAFULL;
           DEFINE FIELD id ON inspections TYPE record<inspections>;
           DEFINE FIELD form_template_id ON inspections TYPE record<form_templates>;
           DEFINE FIELD asset_id ON inspections TYPE record<assets>;
           DEFINE FIELD folder_id ON inspections TYPE record<folders>;
           DEFINE FIELD inspector_id ON inspections TYPE record<users>;
           DEFINE FIELD status ON inspections TYPE string;
           DEFINE FIELD responses ON inspections TYPE array;
           DEFINE FIELD photos ON inspections TYPE array;
           DEFINE FIELD score ON inspections TYPE object;
           DEFINE FIELD priority ON inspections TYPE string;
           DEFINE FIELD notes ON inspections TYPE string;
           DEFINE FIELD signature ON inspections TYPE string;
           DEFINE FIELD started_at ON inspections TYPE datetime;
           DEFINE FIELD completed_at ON inspections TYPE datetime;
           DEFINE FIELD created_at ON inspections TYPE datetime;
           DEFINE FIELD updated_at ON inspections TYPE datetime;
           DEFINE FIELD sync_status ON inspections TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON inspections TYPE datetime;''',
        
        // Folders table
        '''DEFINE TABLE folders SCHEMAFULL;
           DEFINE FIELD id ON folders TYPE record<folders>;
           DEFINE FIELD name ON folders TYPE string;
           DEFINE FIELD description ON folders TYPE string;
           DEFINE FIELD parent_id ON folders TYPE record<folders>;
           DEFINE FIELD created_by ON folders TYPE record<users>;
           DEFINE FIELD created_at ON folders TYPE datetime;
           DEFINE FIELD updated_at ON folders TYPE datetime;
           DEFINE FIELD sync_status ON folders TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON folders TYPE datetime;''',
        
        // Reports table
        '''DEFINE TABLE reports SCHEMAFULL;
           DEFINE FIELD id ON reports TYPE record<reports>;
           DEFINE FIELD name ON reports TYPE string;
           DEFINE FIELD type ON reports TYPE string;
           DEFINE FIELD filters ON reports TYPE object;
           DEFINE FIELD data ON reports TYPE object;
           DEFINE FIELD generated_by ON reports TYPE record<users>;
           DEFINE FIELD generated_at ON reports TYPE datetime;
           DEFINE FIELD created_at ON reports TYPE datetime;
           DEFINE FIELD updated_at ON reports TYPE datetime;
           DEFINE FIELD sync_status ON reports TYPE string DEFAULT 'synced';
           DEFINE FIELD last_modified ON reports TYPE datetime;''',
        
        // Sync queue table for offline operations
        '''DEFINE TABLE sync_queue SCHEMAFULL;
           DEFINE FIELD id ON sync_queue TYPE record<sync_queue>;
           DEFINE FIELD table_name ON sync_queue TYPE string;
           DEFINE FIELD record_id ON sync_queue TYPE string;
           DEFINE FIELD operation ON sync_queue TYPE string;
           DEFINE FIELD data ON sync_queue TYPE object;
           DEFINE FIELD created_at ON sync_queue TYPE datetime;
           DEFINE FIELD retry_count ON sync_queue TYPE number DEFAULT 0;
           DEFINE FIELD last_error ON sync_queue TYPE string;''',
      ];
      
      for (final query in schemaQueries) {
        await _localDb!.query(query);
      }
      
      debugPrint('Local database schema setup completed');
    } catch (e) {
      debugPrint('Failed to setup local schema: $e');
      throw DatabaseException('Failed to setup local schema: $e');
    }
  }
  
  // Setup connectivity monitoring
  Future<void> _setupConnectivityMonitoring() async {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen(
      (ConnectivityResult result) async {
        final wasOnline = _isOnline;
        _isOnline = result != ConnectivityResult.none;
        
        _connectionStatusController.add(_isOnline);
        
        if (!wasOnline && _isOnline) {
          // Reconnected to internet
          debugPrint('Internet connection restored');
          await _reconnectRemoteDatabase();
          await _syncPendingChanges();
        } else if (wasOnline && !_isOnline) {
          // Lost internet connection
          debugPrint('Internet connection lost');
          _remoteDb?.disconnect();
        }
      },
    );
  }
  
  // Reconnect to remote database
  Future<void> _reconnectRemoteDatabase() async {
    try {
      if (_remoteDb != null) {
        await _remoteDb!.disconnect();
      }
      await _initializeRemoteDatabase();
    } catch (e) {
      debugPrint('Failed to reconnect to remote database: $e');
      _isOnline = false;
      _connectionStatusController.add(false);
    }
  }
  
  // Start background sync process
  void _startBackgroundSync() {
    Timer.periodic(const Duration(minutes: 5), (timer) async {
      if (_isOnline) {
        await _syncPendingChanges();
      }
    });
  }
  
  // Sync pending changes to remote database
  Future<void> _syncPendingChanges() async {
    if (!_isOnline || _localDb == null || _remoteDb == null) return;
    
    try {
      _syncStatusController.add(SyncStatus.syncing);
      
      // Get pending sync operations
      final pendingOps = await _localDb!.select('sync_queue');
      
      for (final op in pendingOps) {
        try {
          await _processSyncOperation(op);
          
          // Remove from sync queue after successful sync
          await _localDb!.delete('sync_queue:${op['id']}');
        } catch (e) {
          debugPrint('Failed to sync operation ${op['id']}: $e');
          
          // Update retry count
          final retryCount = (op['retry_count'] ?? 0) + 1;
          if (retryCount < 3) {
            await _localDb!.merge('sync_queue:${op['id']}', {
              'retry_count': retryCount,
              'last_error': e.toString(),
            });
          } else {
            // Max retries reached, mark as failed
            await _localDb!.delete('sync_queue:${op['id']}');
            debugPrint('Max retries reached for operation ${op['id']}');
          }
        }
      }
      
      _syncStatusController.add(SyncStatus.synced);
      debugPrint('Sync completed successfully');
    } catch (e) {
      debugPrint('Sync failed: $e');
      _syncStatusController.add(SyncStatus.error);
    }
  }
  
  // Process individual sync operation
  Future<void> _processSyncOperation(Map<String, dynamic> operation) async {
    final tableName = operation['table_name'];
    final recordId = operation['record_id'];
    final operationType = operation['operation'];
    final data = operation['data'];
    
    switch (operationType) {
      case 'CREATE':
        await _remoteDb!.create(recordId, data);
        break;
      case 'UPDATE':
        await _remoteDb!.merge(recordId, data);
        break;
      case 'DELETE':
        await _remoteDb!.delete(recordId);
        break;
    }
  }
  
  // Execute query on local database
  Future<List<Map<String, dynamic>>> queryLocal(String query, [Map<String, dynamic>? vars]) async {
    if (_localDb == null) {
      throw DatabaseException('Local database not initialized');
    }
    
    try {
      final result = await _localDb!.query(query, vars);
      return List<Map<String, dynamic>>.from(result);
    } catch (e) {
      debugPrint('Local query failed: $e');
      throw DatabaseException('Local query failed: $e');
    }
  }
  
  // Execute query on remote database
  Future<List<Map<String, dynamic>>> queryRemote(String query, [Map<String, dynamic>? vars]) async {
    if (!_isOnline || _remoteDb == null) {
      throw DatabaseException('Remote database not available');
    }
    
    try {
      final result = await _remoteDb!.query(query, vars);
      return List<Map<String, dynamic>>.from(result);
    } catch (e) {
      debugPrint('Remote query failed: $e');
      throw DatabaseException('Remote query failed: $e');
    }
  }
  
  // Create record with offline support
  Future<Map<String, dynamic>> create(String table, Map<String, dynamic> data) async {
    if (_localDb == null) {
      throw DatabaseException('Local database not initialized');
    }
    
    try {
      // Add metadata
      final now = DateTime.now();
      data['created_at'] = now.toIso8601String();
      data['updated_at'] = now.toIso8601String();
      data['last_modified'] = now.toIso8601String();
      data['sync_status'] = _isOnline ? 'synced' : 'pending';
      
      // Create in local database
      final result = await _localDb!.create(table, data);
      
      // If online, try to sync to remote
      if (_isOnline && _remoteDb != null) {
        try {
          await _remoteDb!.create(table, data);
        } catch (e) {
          // Add to sync queue if remote sync fails
          await _addToSyncQueue(table, result['id'], 'CREATE', data);
        }
      } else {
        // Add to sync queue for later
        await _addToSyncQueue(table, result['id'], 'CREATE', data);
      }
      
      return result;
    } catch (e) {
      debugPrint('Create operation failed: $e');
      throw DatabaseException('Create operation failed: $e');
    }
  }
  
  // Update record with offline support
  Future<Map<String, dynamic>> update(String recordId, Map<String, dynamic> data) async {
    if (_localDb == null) {
      throw DatabaseException('Local database not initialized');
    }
    
    try {
      // Add metadata
      data['updated_at'] = DateTime.now().toIso8601String();
      data['last_modified'] = DateTime.now().toIso8601String();
      data['sync_status'] = _isOnline ? 'synced' : 'pending';
      
      // Update in local database
      final result = await _localDb!.merge(recordId, data);
      
      // If online, try to sync to remote
      if (_isOnline && _remoteDb != null) {
        try {
          await _remoteDb!.merge(recordId, data);
        } catch (e) {
          // Add to sync queue if remote sync fails
          final tableName = recordId.split(':')[0];
          await _addToSyncQueue(tableName, recordId, 'UPDATE', data);
        }
      } else {
        // Add to sync queue for later
        final tableName = recordId.split(':')[0];
        await _addToSyncQueue(tableName, recordId, 'UPDATE', data);
      }
      
      return result;
    } catch (e) {
      debugPrint('Update operation failed: $e');
      throw DatabaseException('Update operation failed: $e');
    }
  }
  
  // Delete record with offline support
  Future<void> delete(String recordId) async {
    if (_localDb == null) {
      throw DatabaseException('Local database not initialized');
    }
    
    try {
      // Delete from local database
      await _localDb!.delete(recordId);
      
      // If online, try to sync to remote
      if (_isOnline && _remoteDb != null) {
        try {
          await _remoteDb!.delete(recordId);
        } catch (e) {
          // Add to sync queue if remote sync fails
          final tableName = recordId.split(':')[0];
          await _addToSyncQueue(tableName, recordId, 'DELETE', {});
        }
      } else {
        // Add to sync queue for later
        final tableName = recordId.split(':')[0];
        await _addToSyncQueue(tableName, recordId, 'DELETE', {});
      }
    } catch (e) {
      debugPrint('Delete operation failed: $e');
      throw DatabaseException('Delete operation failed: $e');
    }
  }
  
  // Add operation to sync queue
  Future<void> _addToSyncQueue(String tableName, String recordId, String operation, Map<String, dynamic> data) async {
    if (_localDb == null) return;
    
    try {
      await _localDb!.create('sync_queue', {
        'table_name': tableName,
        'record_id': recordId,
        'operation': operation,
        'data': data,
        'created_at': DateTime.now().toIso8601String(),
        'retry_count': 0,
      });
    } catch (e) {
      debugPrint('Failed to add to sync queue: $e');
    }
  }
  
  // Get connection status
  bool get isOnline => _isOnline;
  bool get isInitialized => _isInitialized;
  
  // Manual sync trigger
  Future<void> forcSync() async {
    if (_isOnline) {
      await _syncPendingChanges();
    }
  }
  
  // Cleanup resources
  Future<void> dispose() async {
    await _connectivitySubscription?.cancel();
    await _syncStatusController.close();
    await _connectionStatusController.close();
    await _localDb?.disconnect();
    await _remoteDb?.disconnect();
    _isInitialized = false;
  }
}