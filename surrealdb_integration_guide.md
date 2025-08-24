# SurrealDB Embedded Setup & Integration Guide for JSG-Inspections

## Overview

SurrealDB embedded provides a local-first database solution that enables the JSG-Inspections application to function completely offline while maintaining the power of a full-featured multi-model database. This setup eliminates the need for a separate database server while providing real-time capabilities, complex queries, and seamless data synchronization.

## Architecture Concept

### Embedded vs Traditional Database

```
Traditional Setup:
Flutter App → HTTP/WebSocket → Database Server → SurrealDB

Embedded Setup:
Flutter App → SurrealDB SDK → Embedded SurrealDB Engine → Local Storage
```

### Benefits of Embedded SurrealDB
- **Offline-First**: Complete functionality without internet connection
- **Zero Configuration**: No database server setup required
- **Real-Time**: Live queries and reactive data streams
- **Multi-Model**: Supports documents, graphs, and relational data
- **ACID Compliance**: Full transaction support
- **Cross-Platform**: Works on Windows, Android, iOS, and web

## Installation and Setup

### 1. Dependencies

#### Flutter Dependencies
```yaml
# pubspec.yaml
dependencies:
  surrealdb: ^0.8.0  # Main SurrealDB SDK
  path_provider: ^2.1.0  # For database file location
  
dev_dependencies:
  surrealdb_migrations: ^0.1.0  # For schema migrations
```

#### Backend Dependencies (Node.js)
```json
{
  "dependencies": {
    "surrealdb.js": "^0.11.0",
    "ws": "^8.14.0"
  }
}
```

### 2. Flutter Integration

#### Database Service Setup
```dart
// lib/core/database/surrealdb_service.dart
import 'package:surrealdb/surrealdb.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class SurrealDBService {
  static SurrealDBService? _instance;
  static Surreal? _database;
  
  SurrealDBService._();
  
  static SurrealDBService get instance {
    _instance ??= SurrealDBService._();
    return _instance!;
  }
  
  Future<void> initialize() async {
    if (_database != null) return;
    
    try {
      // Get application documents directory
      final directory = await getApplicationDocumentsDirectory();
      final dbPath = '${directory.path}/jsg_inspections.db';
      
      // Initialize embedded SurrealDB
      _database = Surreal();
      
      // Connect to embedded instance
      await _database!.connect('file://$dbPath');
      
      // Set namespace and database
      await _database!.use(namespace: 'jsg_inspections', database: 'main');
      
      // Run initial setup
      await _setupDatabase();
      
      print('SurrealDB initialized at: $dbPath');
    } catch (e) {
      print('Failed to initialize SurrealDB: $e');
      rethrow;
    }
  }
  
  Future<void> _setupDatabase() async {
    // Create tables and initial schema
    await _database!.query('''
      -- Create users table
      DEFINE TABLE users SCHEMAFULL;
      DEFINE FIELD id ON users TYPE record<users>;
      DEFINE FIELD email ON users TYPE string ASSERT string::is::email(\$value);
      DEFINE FIELD firstName ON users TYPE string;
      DEFINE FIELD lastName ON users TYPE string;
      DEFINE FIELD password ON users TYPE string;
      DEFINE FIELD role ON users TYPE string DEFAULT 'inspector';
      DEFINE FIELD isActive ON users TYPE bool DEFAULT true;
      DEFINE FIELD createdAt ON users TYPE datetime DEFAULT time::now();
      DEFINE FIELD updatedAt ON users TYPE datetime DEFAULT time::now();
      
      -- Create unique index for email
      DEFINE INDEX idx_users_email ON users FIELDS email UNIQUE;
      
      -- Create assets table
      DEFINE TABLE assets SCHEMAFULL;
      DEFINE FIELD id ON assets TYPE record<assets>;
      DEFINE FIELD name ON assets TYPE string;
      DEFINE FIELD type ON assets TYPE string;
      DEFINE FIELD description ON assets TYPE string;
      DEFINE FIELD location ON assets TYPE object;
      DEFINE FIELD coordinates ON assets TYPE object;
      DEFINE FIELD qrCode ON assets TYPE string;
      DEFINE FIELD status ON assets TYPE string DEFAULT 'active';
      DEFINE FIELD createdAt ON assets TYPE datetime DEFAULT time::now();
      DEFINE FIELD updatedAt ON assets TYPE datetime DEFAULT time::now();
      
      -- Create indexes
      DEFINE INDEX idx_assets_qr ON assets FIELDS qrCode;
      DEFINE INDEX idx_assets_type ON assets FIELDS type;
    ''');
  }
  
  Surreal get database {
    if (_database == null) {
      throw Exception('Database not initialized. Call initialize() first.');
    }
    return _database!;
  }
  
  Future<void> close() async {
    await _database?.close();
    _database = null;
  }
  
  // Health check
  Future<bool> isHealthy() async {
    try {
      await _database?.info();
      return true;
    } catch (e) {
      return false;
    }
  }
}
```

#### Repository Implementation
```dart
// lib/data/repositories/inspection_repository_impl.dart
import 'package:surrealdb/surrealdb.dart';
import '../../core/database/surrealdb_service.dart';

class InspectionRepositoryImpl implements InspectionRepository {
  final SurrealDBService _dbService;
  
  InspectionRepositoryImpl() : _dbService = SurrealDBService.instance;
  
  @override
  Future<List<Inspection>> getInspections({
    String? folderId,
    InspectionStatus? status,
    int page = 0,
    int limit = 20,
  }) async {
    try {
      String query = 'SELECT * FROM inspections';
      Map<String, dynamic> params = {};
      List<String> conditions = [];
      
      if (folderId != null) {
        conditions.add('folder = \$folderId');
        params['folderId'] = 'folders:$folderId';
      }
      
      if (status != null) {
        conditions.add('status = \$status');
        params['status'] = status.name;
      }
      
      if (conditions.isNotEmpty) {
        query += ' WHERE ${conditions.join(' AND ')}';
      }
      
      query += ' ORDER BY createdAt DESC LIMIT \$limit START \$start';
      params['limit'] = limit;
      params['start'] = page * limit;
      
      final result = await _dbService.database.query(query, params);
      
      return result
          .map((item) => Inspection.fromJson(item as Map<String, dynamic>))
          .toList();
          
    } catch (e) {
      throw DatabaseException('Failed to get inspections: $e');
    }
  }
  
  @override
  Future<Inspection> createInspection(Inspection inspection) async {
    try {
      final result = await _dbService.database.create(
        'inspections',
        inspection.toJson()..remove('id'), // Remove ID to let SurrealDB generate
      );
      
      if (result.isEmpty) {
        throw DatabaseException('Failed to create inspection');
      }
      
      return Inspection.fromJson(result.first as Map<String, dynamic>);
    } catch (e) {
      throw DatabaseException('Failed to create inspection: $e');
    }
  }
  
  @override
  Future<Inspection> updateInspection(String id, Map<String, dynamic> updates) async {
    try {
      updates['updatedAt'] = DateTime.now().toIso8601String();
      
      final result = await _dbService.database.merge('inspections:$id', updates);
      
      if (result.isEmpty) {
        throw DatabaseException('Inspection not found');
      }
      
      return Inspection.fromJson(result.first as Map<String, dynamic>);
    } catch (e) {
      throw DatabaseException('Failed to update inspection: $e');
    }
  }
  
  @override
  Stream<List<Inspection>> watchInspections({String? folderId}) {
    String query = 'LIVE SELECT * FROM inspections';
    
    if (folderId != null) {
      query += ' WHERE folder = folders:$folderId';
    }
    
    query += ' ORDER BY createdAt DESC';
    
    return _dbService.database.live(query).map(
      (events) => events
          .map((event) => Inspection.fromJson(event.data as Map<String, dynamic>))
          .toList(),
    );
  }
  
  @override
  Future<void> deleteInspection(String id) async {
    try {
      await _dbService.database.delete('inspections:$id');
    } catch (e) {
      throw DatabaseException('Failed to delete inspection: $e');
    }
  }
}
```

### 3. Advanced Query Examples

#### Complex Relationships Query
```dart
// Get inspections with related data
Future<List<InspectionWithDetails>> getInspectionsWithDetails() async {
  const query = '''
    SELECT *,
      asset.* AS asset_details,
      formTemplate.* AS form_details,
      inspector.firstName AS inspector_name,
      folder.name AS folder_name,
      (SELECT COUNT() FROM inspections WHERE folder = \$parent.folder)[0] AS folder_inspection_count
    FROM inspections
    WHERE status != 'deleted'
    ORDER BY createdAt DESC
    LIMIT 50
  ''';
  
  final result = await _dbService.database.query(query);
  return result
      .map((item) => InspectionWithDetails.fromJson(item as Map<String, dynamic>))
      .toList();
}
```

#### Aggregation and Analytics
```dart
// Dashboard analytics query
Future<DashboardStats> getDashboardStats() async {
  const query = '''
    LET \$total_inspections = (SELECT count() FROM inspections WHERE status != 'deleted')[0].count;
    LET \$completed_inspections = (SELECT count() FROM inspections WHERE status = 'completed')[0].count;
    LET \$pending_inspections = (SELECT count() FROM inspections WHERE status = 'pending')[0].count;
    LET \$avg_score = (SELECT math::mean(score) FROM inspections WHERE status = 'completed' AND score IS NOT NULL)[0];
    LET \$priority_breakdown = (
      SELECT priority, count() AS count 
      FROM inspections 
      WHERE status = 'completed' 
      GROUP BY priority
    );
    
    SELECT {
      total_inspections: \$total_inspections,
      completed_inspections: \$completed_inspections,
      pending_inspections: \$pending_inspections,
      completion_rate: math::round((\$completed_inspections / \$total_inspections) * 100),
      average_score: \$avg_score,
      priority_breakdown: \$priority_breakdown
    } AS stats
  ''';
  
  final result = await _dbService.database.query(query);
  return DashboardStats.fromJson(result.first['stats'] as Map<String, dynamic>);
}
```

#### Graph Relationships
```dart
// Find related inspections through asset relationships
Future<List<Inspection>> getRelatedInspections(String assetId) async {
  const query = '''
    SELECT * FROM inspections 
    WHERE asset IN (
      SELECT id FROM assets 
      WHERE id = \$assetId 
      OR location.building = (SELECT location.building FROM assets:\$assetId)
    )
    ORDER BY createdAt DESC
    LIMIT 20
  ''';
  
  final result = await _dbService.database.query(query, {'assetId': assetId});
  return result
      .map((item) => Inspection.fromJson(item as Map<String, dynamic>))
      .toList();
}
```

### 4. Real-Time Features

#### Live Queries Implementation
```dart
// lib/presentation/providers/live_inspections_provider.dart
@riverpod
class LiveInspectionsNotifier extends _$LiveInspectionsNotifier {
  StreamSubscription? _subscription;
  
  @override
  AsyncValue<List<Inspection>> build() {
    ref.onDispose(_cancelSubscription);
    _startListening();
    return const AsyncValue.loading();
  }
  
  void _startListening() {
    try {
      final repository = ref.read(inspectionRepositoryProvider);
      
      _subscription = repository.watchInspections().listen(
        (inspections) {
          state = AsyncValue.data(inspections);
        },
        onError: (error) {
          state = AsyncValue.error(error, StackTrace.current);
        },
      );
    } catch (error) {
      state = AsyncValue.error(error, StackTrace.current);
    }
  }
  
  void _cancelSubscription() {
    _subscription?.cancel();
  }
  
  Future<void> createInspection(CreateInspectionParams params) async {
    // The live query will automatically update the UI
    final repository = ref.read(inspectionRepositoryProvider);
    await repository.createInspection(params.toInspection());
  }
}
```

#### Real-Time UI Updates
```dart
// Widget that responds to real-time changes
class LiveInspectionsList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inspectionsAsync = ref.watch(liveInspectionsProvider);
    
    return inspectionsAsync.when(
      data: (inspections) => ListView.builder(
        itemCount: inspections.length,
        itemBuilder: (context, index) {
          return InspectionCard(
            inspection: inspections[index],
            onTap: () => _navigateToDetails(inspections[index].id),
          );
        },
      ),
      loading: () => const CircularProgressIndicator(),
      error: (error, stack) => ErrorWidget(error),
    );
  }
}
```

### 5. Database Migrations

#### Migration System
```dart
// lib/core/database/migrations.dart
class DatabaseMigrations {
  static const int currentVersion = 2;
  
  static Future<void> runMigrations(Surreal db) async {
    final version = await _getCurrentVersion(db);
    
    if (version < currentVersion) {
      await _runMigration(db, version + 1, currentVersion);
    }
  }
  
  static Future<int> _getCurrentVersion(Surreal db) async {
    try {
      final result = await db.query('SELECT version FROM schema_version LIMIT 1');
      if (result.isNotEmpty) {
        return result.first['version'] as int;
      }
    } catch (e) {
      // Table doesn't exist, this is version 0
    }
    return 0;
  }
  
  static Future<void> _runMigration(Surreal db, int from, int to) async {
    for (int version = from; version <= to; version++) {
      await _runMigrationVersion(db, version);
    }
    
    // Update version
    await db.query('''
      DELETE schema_version;
      CREATE schema_version SET version = \$version;
    ''', {'version': to});
  }
  
  static Future<void> _runMigrationVersion(Surreal db, int version) async {
    switch (version) {
      case 1:
        await _migration_v1(db);
        break;
      case 2:
        await _migration_v2(db);
        break;
    }
  }
  
  static Future<void> _migration_v1(Surreal db) async {
    await db.query('''
      -- Initial schema setup
      DEFINE TABLE schema_version SCHEMAFULL;
      DEFINE FIELD version ON schema_version TYPE number;
      
      -- Add new indexes for performance
      DEFINE INDEX idx_inspections_status ON inspections FIELDS status;
      DEFINE INDEX idx_inspections_date ON inspections FIELDS createdAt;
    ''');
  }
  
  static Future<void> _migration_v2(Surreal db) async {
    await db.query('''
      -- Add AI analysis fields
      DEFINE FIELD aiAnalysis ON inspections TYPE object DEFAULT {};
      DEFINE FIELD aiAnalysis.defectsDetected ON inspections TYPE array DEFAULT [];
      DEFINE FIELD aiAnalysis.confidence ON inspections TYPE number DEFAULT 0;
      DEFINE FIELD aiAnalysis.recommendations ON inspections TYPE array DEFAULT [];
      
      -- Add full-text search
      DEFINE ANALYZER search_analyzer TOKENIZERS blank,class,camel,punct FILTERS lowercase,snowball(english);
      DEFINE INDEX search_inspections ON inspections FIELDS notes SEARCH ANALYZER search_analyzer BM25;
    ''');
  }
}
```

### 6. Backup and Sync Strategy

#### Local Backup
```dart
// lib/core/services/backup_service.dart
class BackupService {
  static const String backupDirectory = 'backups';
  
  static Future<String> createBackup() async {
    final directory = await getApplicationDocumentsDirectory();
    final backupDir = Directory('${directory.path}/$backupDirectory');
    
    if (!backupDir.existsSync()) {
      backupDir.createSync(recursive: true);
    }
    
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final backupPath = '${backupDir.path}/backup_$timestamp.sql';
    
    final db = SurrealDBService.instance.database;
    
    // Export database
    final exportData = await db.export();
    
    // Write to file
    final backupFile = File(backupPath);
    await backupFile.writeAsString(exportData);
    
    return backupPath;
  }
  
  static Future<void> restoreBackup(String backupPath) async {
    final backupFile = File(backupPath);
    
    if (!backupFile.existsSync()) {
      throw Exception('Backup file not found');
    }
    
    final backupData = await backupFile.readAsString();
    final db = SurrealDBService.instance.database;
    
    // Clear existing data
    await db.query('REMOVE DATABASE main');
    
    // Import backup
    await db.import(backupData);
  }
  
  static Future<List<String>> getAvailableBackups() async {
    final directory = await getApplicationDocumentsDirectory();
    final backupDir = Directory('${directory.path}/$backupDirectory');
    
    if (!backupDir.existsSync()) {
      return [];
    }
    
    final files = backupDir
        .listSync()
        .whereType<File>()
        .where((file) => file.path.endsWith('.sql'))
        .map((file) => file.path)
        .toList();
        
    files.sort((a, b) => b.compareTo(a)); // Most recent first
    return files;
  }
}
```

#### Cloud Synchronization
```dart
// lib/core/services/cloud_sync_service.dart
class CloudSyncService {
  final ApiClient _apiClient;
  final SurrealDBService _dbService;
  
  CloudSyncService(this._apiClient) : _dbService = SurrealDBService.instance;
  
  Future<void> syncToCloud() async {
    try {
      // Get changes since last sync
      final lastSync = await _getLastSyncTimestamp();
      const query = '''
        SELECT *, meta::tb(\$this) AS table_name 
        FROM inspections, assets, folders, form_templates 
        WHERE updatedAt > \$lastSync
      ''';
      
      final changes = await _dbService.database.query(query, {
        'lastSync': lastSync?.toIso8601String() ?? '1970-01-01T00:00:00Z'
      });
      
      if (changes.isNotEmpty) {
        // Upload changes
        await _apiClient.post('/api/sync/upload', {
          'changes': changes,
          'timestamp': DateTime.now().toIso8601String(),
        });
        
        // Update last sync timestamp
        await _updateLastSyncTimestamp(DateTime.now());
      }
      
    } catch (e) {
      throw SyncException('Failed to sync to cloud: $e');
    }
  }
  
  Future<void> syncFromCloud() async {
    try {
      final lastSync = await _getLastSyncTimestamp();
      
      final response = await _apiClient.get('/api/sync/download', queryParameters: {
        'since': lastSync?.toIso8601String() ?? '1970-01-01T00:00:00Z',
      });
      
      final changes = response.data['changes'] as List;
      
      // Apply changes locally
      for (final change in changes) {
        await _applyChange(change);
      }
      
      await _updateLastSyncTimestamp(DateTime.now());
      
    } catch (e) {
      throw SyncException('Failed to sync from cloud: $e');
    }
  }
  
  Future<void> _applyChange(Map<String, dynamic> change) async {
    final table = change['table_name'] as String;
    final data = change as Map<String, dynamic>..remove('table_name');
    
    // Upsert the record
    await _dbService.database.upsert('$table:${data['id']}', data);
  }
}
```

### 7. Performance Optimization

#### Query Optimization
```dart
// lib/core/database/query_optimizer.dart
class QueryOptimizer {
  static String optimizeInspectionQuery({
    String? folderId,
    InspectionStatus? status,
    DateRange? dateRange,
    int page = 0,
    int limit = 20,
  }) {
    final conditions = <String>[];
    final params = <String, dynamic>{};
    
    // Build optimized query with proper indexing
    String query = 'SELECT * FROM inspections';
    
    if (folderId != null) {
      conditions.add('folder = \$folderId');
      params['folderId'] = 'folders:$folderId';
    }
    
    if (status != null) {
      conditions.add('status = \$status');
      params['status'] = status.name;
    }
    
    if (dateRange != null) {
      conditions.add('createdAt >= \$startDate AND createdAt <= \$endDate');
      params['startDate'] = dateRange.start.toIso8601String();
      params['endDate'] = dateRange.end.toIso8601String();
    }
    
    if (conditions.isNotEmpty) {
      query += ' WHERE ${conditions.join(' AND ')}';
    }
    
    // Use composite index for better performance
    query += ' ORDER BY createdAt DESC LIMIT \$limit START \$start';
    params['limit'] = limit;
    params['start'] = page * limit;
    
    return query;
  }
  
  static Future<void> createOptimizedIndexes(Surreal db) async {
    await db.query('''
      -- Composite indexes for common queries
      DEFINE INDEX idx_inspections_folder_status ON inspections FIELDS folder, status;
      DEFINE INDEX idx_inspections_status_date ON inspections FIELDS status, createdAt;
      DEFINE INDEX idx_inspections_folder_date ON inspections FIELDS folder, createdAt;
      
      -- Full-text search indexes
      DEFINE INDEX idx_search_assets ON assets FIELDS name, description SEARCH;
      DEFINE INDEX idx_search_inspections ON inspections FIELDS notes SEARCH;
      
      -- Unique constraints
      DEFINE INDEX idx_assets_qr_unique ON assets FIELDS qrCode UNIQUE;
      DEFINE INDEX idx_users_email_unique ON users FIELDS email UNIQUE;
    ''');
  }
}
```

### 8. Error Handling and Recovery

#### Database Error Recovery
```dart
// lib/core/database/error_recovery.dart
class DatabaseErrorRecovery {
  static Future<bool> attemptRecovery() async {
    try {
      final dbService = SurrealDBService.instance;
      
      // Test database connection
      if (!await dbService.isHealthy()) {
        // Try to reinitialize
        await dbService.close();
        await dbService.initialize();
        
        if (!await dbService.isHealthy()) {
          // Database is corrupted, restore from backup
          await _restoreFromBackup();
        }
      }
      
      return true;
    } catch (e) {
      Logger.error('Database recovery failed: $e');
      return false;
    }
  }
  
  static Future<void> _restoreFromBackup() async {
    final backups = await BackupService.getAvailableBackups();
    
    if (backups.isNotEmpty) {
      // Restore from most recent backup
      await BackupService.restoreBackup(backups.first);
      Logger.info('Database restored from backup: ${backups.first}');
    } else {
      // No backups available, reset to fresh state
      await _resetDatabase();
      Logger.warning('No backups available, database reset to initial state');
    }
  }
  
  static Future<void> _resetDatabase() async {
    final dbService = SurrealDBService.instance;
    await dbService.close();
    
    // Delete database file
    final directory = await getApplicationDocumentsDirectory();
    final dbFile = File('${directory.path}/jsg_inspections.db');
    
    if (dbFile.existsSync()) {
      await dbFile.delete();
    }
    
    // Reinitialize with fresh database
    await dbService.initialize();
  }
}
```

## Best Practices and Considerations

### 1. Connection Management
- Always initialize the database before use
- Handle connection failures gracefully
- Implement connection pooling for high-traffic scenarios
- Monitor database health and implement recovery mechanisms

### 2. Query Optimization
- Use proper indexing for frequently queried fields
- Implement pagination for large result sets
- Use LIVE queries sparingly to avoid performance issues
- Cache complex query results when appropriate

### 3. Data Integrity
- Implement proper validation at the database level
- Use transactions for multi-step operations
- Regular backup schedule with automated cleanup
- Implement data consistency checks

### 4. Security
- Never store sensitive data unencrypted
- Implement proper access controls if multi-user
- Regular security audits of database queries
- Sanitize all user inputs to prevent injection attacks

### 5. Performance Monitoring
- Track query execution times
- Monitor database file size growth
- Implement alerts for performance degradation
- Regular performance profiling and optimization

This embedded SurrealDB setup provides JSG-Inspections with a powerful, offline-first database solution that scales with the application's needs while maintaining excellent performance and reliability.