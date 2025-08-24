import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/inspection.dart';
import '../../domain/repositories/inspection_repository.dart';
import '../../../../core/services/database_service.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/models/sync_queue_item.dart';
import '../../../../core/exceptions/app_exceptions.dart';

part 'inspection_repository.g.dart';

class InspectionRepositoryImpl implements InspectionRepository {
  final DatabaseService _databaseService;
  final StorageService _storageService;

  InspectionRepositoryImpl({
    required DatabaseService databaseService,
    required StorageService storageService,
  }) : _databaseService = databaseService,
        _storageService = storageService;

  @override
  Future<List<Inspection>> getInspections({
    String? folderId,
    String? assetId,
    InspectionStatus? status,
    int? limit,
    int? offset,
  }) async {
    try {
      final db = await _databaseService.localDatabase;
      
      String query = 'SELECT * FROM inspections';
      final conditions = <String>[];
      
      if (folderId != null) {
        conditions.add('folderId = \$folderId');
      }
      if (assetId != null) {
        conditions.add('assetId = \$assetId');
      }
      if (status != null) {
        conditions.add('status = \$status');
      }
      
      if (conditions.isNotEmpty) {
        query += ' WHERE ${conditions.join(' AND ')}';
      }
      
      query += ' ORDER BY createdAt DESC';
      
      if (limit != null) {
        query += ' LIMIT \$limit';
      }
      if (offset != null) {
        query += ' START \$offset';
      }
      
      final result = await db.query(query, {
        if (folderId != null) 'folderId': folderId,
        if (assetId != null) 'assetId': assetId,
        if (status != null) 'status': status.name,
        if (limit != null) 'limit': limit,
        if (offset != null) 'offset': offset,
      });
      
      return result.map((data) => Inspection.fromJson(data)).toList();
    } catch (e) {
      throw DatabaseException('Failed to fetch inspections: $e');
    }
  }

  @override
  Future<Inspection?> getInspectionById(String id) async {
    try {
      final db = await _databaseService.localDatabase;
      final result = await db.select('inspections:$id');
      
      if (result.isEmpty) return null;
      
      return Inspection.fromJson(result.first);
    } catch (e) {
      throw DatabaseException('Failed to fetch inspection: $e');
    }
  }

  @override
  Future<Inspection> createInspection(CreateInspectionParams params) async {
    try {
      final db = await _databaseService.localDatabase;
      final now = DateTime.now();
      
      final inspectionData = {
        'formTemplateId': params.formTemplateId,
        'assetId': params.assetId,
        'folderId': params.folderId,
        'inspectorId': params.inspectorId,
        'status': InspectionStatus.draft.name,
        'responses': <String, dynamic>{},
        'photos': <String, List<String>>{},
        'score': null,
        'priority': null,
        'notes': params.notes,
        'signature': null,
        'startedAt': params.startedAt ?? now,
        'completedAt': null,
        'createdAt': now,
        'updatedAt': now,
      };
      
      final result = await db.create('inspections', inspectionData);
      final inspection = Inspection.fromJson(result.first);
      
      // Add to sync queue for remote synchronization
      await _addToSyncQueue(inspection.id, 'CREATE', inspectionData);
      
      return inspection;
    } catch (e) {
      throw DatabaseException('Failed to create inspection: $e');
    }
  }

  @override
  Future<Inspection> updateInspection(String id, UpdateInspectionParams params) async {
    try {
      final db = await _databaseService.localDatabase;
      final now = DateTime.now();
      
      final updateData = <String, dynamic>{
        'updatedAt': now,
      };
      
      if (params.responses != null) {
        updateData['responses'] = params.responses;
      }
      if (params.photos != null) {
        updateData['photos'] = params.photos;
      }
      if (params.status != null) {
        updateData['status'] = params.status!.name;
        if (params.status == InspectionStatus.completed) {
          updateData['completedAt'] = now;
        }
      }
      if (params.score != null) {
        updateData['score'] = params.score!.toJson();
      }
      if (params.priority != null) {
        updateData['priority'] = params.priority!.name;
      }
      if (params.notes != null) {
        updateData['notes'] = params.notes;
      }
      if (params.signature != null) {
        updateData['signature'] = params.signature;
      }
      
      final result = await db.update('inspections:$id', updateData);
      final inspection = Inspection.fromJson(result.first);
      
      // Add to sync queue for remote synchronization
      await _addToSyncQueue(id, 'UPDATE', updateData);
      
      return inspection;
    } catch (e) {
      throw DatabaseException('Failed to update inspection: $e');
    }
  }

  @override
  Future<void> deleteInspection(String id) async {
    try {
      final db = await _databaseService.localDatabase;
      await db.delete('inspections:$id');
      
      // Add to sync queue for remote synchronization
      await _addToSyncQueue(id, 'DELETE', {});
    } catch (e) {
      throw DatabaseException('Failed to delete inspection: $e');
    }
  }

  @override
  Future<List<Inspection>> searchInspections(String query) async {
    try {
      final db = await _databaseService.localDatabase;
      
      final result = await db.query(
        'SELECT * FROM inspections WHERE string::lowercase(notes) CONTAINS string::lowercase(\$query) ORDER BY createdAt DESC',
        {'query': query},
      );
      
      return result.map((data) => Inspection.fromJson(data)).toList();
    } catch (e) {
      throw DatabaseException('Failed to search inspections: $e');
    }
  }

  @override
  Future<void> syncInspections() async {
    try {
      if (!_databaseService.isOnline) {
        throw NetworkException('No internet connection available');
      }
      
      // Sync pending changes to remote
      await _syncPendingChanges();
      
      // Fetch latest inspections from remote
      await _fetchRemoteInspections();
    } catch (e) {
      throw SyncException('Failed to sync inspections: $e');
    }
  }

  Future<void> _addToSyncQueue(String entityId, String operation, Map<String, dynamic> data) async {
    final syncItem = SyncQueueItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      entityType: 'inspection',
      entityId: entityId,
      operation: operation,
      data: data,
      createdAt: DateTime.now(),
      retryCount: 0,
    );
    
    final db = await _databaseService.localDatabase;
    await db.create('sync_queue', syncItem.toJson());
  }

  Future<void> _syncPendingChanges() async {
    final db = await _databaseService.localDatabase;
    final pendingItems = await db.query(
      'SELECT * FROM sync_queue WHERE entityType = "inspection" ORDER BY createdAt ASC',
    );
    
    for (final item in pendingItems) {
      final syncItem = SyncQueueItem.fromJson(item);
      
      try {
        // Sync with remote database
        final remoteDb = await _databaseService.remoteDatabase;
        if (remoteDb != null) {
          switch (syncItem.operation) {
            case 'CREATE':
              await remoteDb.create('inspections:${syncItem.entityId}', syncItem.data);
              break;
            case 'UPDATE':
              await remoteDb.update('inspections:${syncItem.entityId}', syncItem.data);
              break;
            case 'DELETE':
              await remoteDb.delete('inspections:${syncItem.entityId}');
              break;
          }
          
          // Remove from sync queue on success
          await db.delete('sync_queue:${syncItem.id}');
        }
      } catch (e) {
        // Increment retry count
        await db.update('sync_queue:${syncItem.id}', {
          'retryCount': syncItem.retryCount + 1,
          'lastError': e.toString(),
        });
      }
    }
  }

  Future<void> _fetchRemoteInspections() async {
    final remoteDb = await _databaseService.remoteDatabase;
    if (remoteDb == null) return;
    
    final remoteInspections = await remoteDb.query('SELECT * FROM inspections');
    final localDb = await _databaseService.localDatabase;
    
    for (final remoteData in remoteInspections) {
      final remoteInspection = Inspection.fromJson(remoteData);
      
      // Check if local version exists
      final localResult = await localDb.select('inspections:${remoteInspection.id}');
      
      if (localResult.isEmpty) {
        // Create new local record
        await localDb.create('inspections:${remoteInspection.id}', remoteData);
      } else {
        // Update if remote is newer
        final localInspection = Inspection.fromJson(localResult.first);
        if (remoteInspection.updatedAt.isAfter(localInspection.updatedAt)) {
          await localDb.update('inspections:${remoteInspection.id}', remoteData);
        }
      }
    }
  }
}

@riverpod
InspectionRepository inspectionRepository(InspectionRepositoryRef ref) {
  final databaseService = ref.read(databaseServiceProvider);
  final storageService = ref.read(storageServiceProvider);
  
  return InspectionRepositoryImpl(
    databaseService: databaseService,
    storageService: storageService,
  );
}