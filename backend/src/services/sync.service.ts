/**
 * Sync Service
 * Handles offline synchronization and conflict resolution
 */

import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../types/errors';
import {
  SyncOperation,
  SyncConflict,
  SyncStatus,
  SyncResult,
  ConflictResolution,
  SyncBatch,
  SyncMetadata,
  EntitySync,
  SyncStrategy,
  SyncPriority,
  OfflineChange,
  SyncQueue,
  SyncStats
} from '../types/sync';
import { User } from '../types/auth';
import { SyncRepository } from '../repositories/sync.repository';
import { InspectionRepository } from '../repositories/inspection.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { FormTemplateRepository } from '../repositories/form-template.repository';
import { FolderRepository } from '../repositories/folder.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import crypto from 'crypto';

export interface SyncOptions {
  strategy?: SyncStrategy;
  priority?: SyncPriority;
  batchSize?: number;
  maxRetries?: number;
  conflictResolution?: ConflictResolution;
  includeDeleted?: boolean;
  entityTypes?: string[];
  lastSyncTime?: Date;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  currentOperation?: string;
  estimatedTimeRemaining?: number;
}

export interface ConflictResolutionResult {
  resolved: boolean;
  resolution: ConflictResolution;
  mergedData?: any;
  error?: string;
}

export class SyncService {
  private syncQueue: Map<string, SyncQueue> = new Map();
  private activeSyncs: Map<string, SyncProgress> = new Map();
  private conflictResolvers: Map<string, (conflict: SyncConflict) => Promise<ConflictResolutionResult>> = new Map();
  private readonly maxBatchSize = 100;
  private readonly defaultRetries = 3;
  private readonly syncTimeout = 30000; // 30 seconds

  constructor(
    private syncRepository: SyncRepository,
    private inspectionRepository: InspectionRepository,
    private assetRepository: AssetRepository,
    private formTemplateRepository: FormTemplateRepository,
    private folderRepository: FolderRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) {
    this.initializeConflictResolvers();
    this.startSyncQueueProcessor();
  }

  /**
   * Synchronize data for a user/device
   */
  async synchronizeData(
    userId: string,
    deviceId: string,
    changes: OfflineChange[],
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const syncId = this.generateSyncId();
    const startTime = Date.now();

    try {
      logger.info('Starting data synchronization', {
        syncId,
        userId,
        deviceId,
        changeCount: changes.length,
        options
      });

      // Initialize sync progress
      this.activeSyncs.set(syncId, {
        total: changes.length,
        completed: 0,
        failed: 0,
        percentage: 0,
        currentOperation: 'Initializing sync'
      });

      // Notify client of sync start
      this.webSocketService.emitToUser(userId, 'sync:started', {
        syncId,
        total: changes.length
      });

      // Get last sync metadata
      const lastSync = await this.syncRepository.getLastSync(userId, deviceId);
      const lastSyncTime = options.lastSyncTime || lastSync?.timestamp || new Date(0);

      // Get server changes since last sync
      const serverChanges = await this.getServerChanges(
        userId,
        lastSyncTime,
        options.entityTypes
      );

      // Process client changes and detect conflicts
      const { applied, conflicts } = await this.processClientChanges(
        changes,
        serverChanges,
        userId,
        syncId
      );

      // Resolve conflicts
      const resolvedConflicts = await this.resolveConflicts(
        conflicts,
        options.conflictResolution || ConflictResolution.SERVER_WINS,
        userId,
        syncId
      );

      // Apply resolved changes
      const finalApplied = [...applied, ...resolvedConflicts.resolved];

      // Create sync batch
      const syncBatch: SyncBatch = {
        id: syncId,
        userId,
        deviceId,
        timestamp: new Date(),
        operations: finalApplied,
        conflicts: resolvedConflicts.unresolved,
        metadata: {
          strategy: options.strategy || SyncStrategy.INCREMENTAL,
          priority: options.priority || SyncPriority.NORMAL,
          clientVersion: '1.0.0', // Would come from client
          serverVersion: process.env.APP_VERSION || '1.0.0'
        }
      };

      // Save sync batch
      await this.syncRepository.saveSyncBatch(syncBatch);

      // Update sync progress
      this.updateSyncProgress(syncId, {
        completed: finalApplied.length,
        failed: resolvedConflicts.unresolved.length,
        percentage: 100,
        currentOperation: 'Sync completed'
      });

      // Prepare response with server changes
      const result: SyncResult = {
        syncId,
        status: resolvedConflicts.unresolved.length > 0 ? SyncStatus.PARTIAL : SyncStatus.SUCCESS,
        appliedChanges: finalApplied,
        serverChanges: serverChanges.filter(change => 
          change.timestamp > lastSyncTime
        ),
        conflicts: resolvedConflicts.unresolved,
        metadata: {
          syncTime: new Date(),
          processingTime: Date.now() - startTime,
          totalOperations: changes.length,
          appliedOperations: finalApplied.length,
          conflictCount: conflicts.length,
          lastSyncTime
        }
      };

      // Notify client of sync completion
      this.webSocketService.emitToUser(userId, 'sync:completed', {
        syncId,
        status: result.status,
        appliedCount: finalApplied.length,
        conflictCount: resolvedConflicts.unresolved.length
      });

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'sync',
        entityId: syncId,
        action: 'synchronize',
        userId,
        metadata: {
          deviceId,
          changeCount: changes.length,
          appliedCount: finalApplied.length,
          conflictCount: conflicts.length,
          processingTime: Date.now() - startTime
        },
        timestamp: new Date()
      });

      logger.info('Data synchronization completed', {
        syncId,
        userId,
        deviceId,
        status: result.status,
        appliedCount: finalApplied.length,
        conflictCount: resolvedConflicts.unresolved.length,
        processingTime: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error('Data synchronization failed', {
        syncId,
        userId,
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Update sync progress with error
      this.updateSyncProgress(syncId, {
        completed: 0,
        failed: changes.length,
        percentage: 100,
        currentOperation: 'Sync failed'
      });

      // Notify client of sync failure
      this.webSocketService.emitToUser(userId, 'sync:failed', {
        syncId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    } finally {
      // Clean up active sync
      this.activeSyncs.delete(syncId);
    }
  }

  /**
   * Get sync status for a user/device
   */
  async getSyncStatus(
    userId: string,
    deviceId: string
  ): Promise<{
    lastSync?: Date;
    pendingChanges: number;
    conflictCount: number;
    syncInProgress: boolean;
    queuedOperations: number;
  }> {
    try {
      const lastSync = await this.syncRepository.getLastSync(userId, deviceId);
      const pendingChanges = await this.syncRepository.getPendingChangesCount(userId, deviceId);
      const conflicts = await this.syncRepository.getUnresolvedConflicts(userId, deviceId);
      const queue = this.syncQueue.get(`${userId}:${deviceId}`);
      
      return {
        lastSync: lastSync?.timestamp,
        pendingChanges,
        conflictCount: conflicts.length,
        syncInProgress: Array.from(this.activeSyncs.keys()).some(syncId => 
          syncId.includes(userId)
        ),
        queuedOperations: queue?.operations.length || 0
      };
    } catch (error) {
      logger.error('Get sync status failed', { userId, deviceId, error });
      throw new AppError(
        'Failed to get sync status',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Queue offline operation for later sync
   */
  async queueOfflineOperation(
    userId: string,
    deviceId: string,
    operation: SyncOperation
  ): Promise<void> {
    try {
      const queueKey = `${userId}:${deviceId}`;
      let queue = this.syncQueue.get(queueKey);
      
      if (!queue) {
        queue = {
          userId,
          deviceId,
          operations: [],
          lastUpdated: new Date()
        };
        this.syncQueue.set(queueKey, queue);
      }
      
      // Add operation to queue
      queue.operations.push(operation);
      queue.lastUpdated = new Date();
      
      // Persist queue to database
      await this.syncRepository.saveOfflineQueue(queue);
      
      logger.debug('Operation queued for offline sync', {
        userId,
        deviceId,
        operation: operation.type,
        entityType: operation.entityType,
        entityId: operation.entityId
      });
    } catch (error) {
      logger.error('Queue offline operation failed', {
        userId,
        deviceId,
        operation,
        error
      });
      throw error;
    }
  }

  /**
   * Get pending offline operations
   */
  async getPendingOperations(
    userId: string,
    deviceId: string
  ): Promise<SyncOperation[]> {
    try {
      const queueKey = `${userId}:${deviceId}`;
      const queue = this.syncQueue.get(queueKey);
      
      if (queue) {
        return queue.operations;
      }
      
      // Load from database if not in memory
      const persistedQueue = await this.syncRepository.getOfflineQueue(userId, deviceId);
      if (persistedQueue) {
        this.syncQueue.set(queueKey, persistedQueue);
        return persistedQueue.operations;
      }
      
      return [];
    } catch (error) {
      logger.error('Get pending operations failed', { userId, deviceId, error });
      throw error;
    }
  }

  /**
   * Resolve sync conflict manually
   */
  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    mergedData?: any,
    userId?: string
  ): Promise<void> {
    try {
      logger.info('Resolving sync conflict manually', {
        conflictId,
        resolution,
        userId
      });

      const conflict = await this.syncRepository.getConflict(conflictId);
      if (!conflict) {
        throw new AppError(
          'Conflict not found',
          404,
          ErrorCodes.SYNC_CONFLICT_NOT_FOUND
        );
      }

      // Apply resolution
      const resolvedData = await this.applyConflictResolution(
        conflict,
        resolution,
        mergedData
      );

      // Update entity with resolved data
      await this.updateEntity(
        conflict.entityType,
        conflict.entityId,
        resolvedData
      );

      // Mark conflict as resolved
      await this.syncRepository.markConflictResolved(
        conflictId,
        resolution,
        userId
      );

      // Notify relevant users
      if (conflict.userId) {
        this.webSocketService.emitToUser(conflict.userId, 'sync:conflict_resolved', {
          conflictId,
          resolution,
          entityType: conflict.entityType,
          entityId: conflict.entityId
        });
      }

      logger.info('Sync conflict resolved', {
        conflictId,
        resolution,
        entityType: conflict.entityType,
        entityId: conflict.entityId
      });
    } catch (error) {
      logger.error('Resolve conflict failed', {
        conflictId,
        resolution,
        error
      });
      throw error;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(
    filter: {
      userId?: string;
      deviceId?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<SyncStats> {
    try {
      const stats = await this.syncRepository.getSyncStats(filter);
      
      return {
        totalSyncs: stats.totalSyncs,
        successfulSyncs: stats.successfulSyncs,
        failedSyncs: stats.failedSyncs,
        averageSyncTime: stats.averageSyncTime,
        totalConflicts: stats.totalConflicts,
        resolvedConflicts: stats.resolvedConflicts,
        pendingConflicts: stats.pendingConflicts,
        syncsByDay: stats.syncsByDay,
        conflictsByType: stats.conflictsByType,
        deviceStats: stats.deviceStats
      };
    } catch (error) {
      logger.error('Get sync stats failed', { filter, error });
      throw new AppError(
        'Failed to get sync statistics',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Force sync for a user/device
   */
  async forceSync(
    userId: string,
    deviceId: string,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    try {
      logger.info('Force sync initiated', { userId, deviceId });

      // Get all pending operations
      const pendingOperations = await this.getPendingOperations(userId, deviceId);
      
      // Convert to offline changes
      const changes: OfflineChange[] = pendingOperations.map(op => ({
        id: op.id,
        entityType: op.entityType,
        entityId: op.entityId,
        operation: op.type,
        data: op.data,
        timestamp: op.timestamp,
        deviceId,
        userId
      }));

      // Perform synchronization
      const result = await this.synchronizeData(
        userId,
        deviceId,
        changes,
        {
          ...options,
          strategy: SyncStrategy.FULL,
          priority: SyncPriority.HIGH
        }
      );

      // Clear queue on successful sync
      if (result.status === SyncStatus.SUCCESS) {
        await this.clearOfflineQueue(userId, deviceId);
      }

      return result;
    } catch (error) {
      logger.error('Force sync failed', { userId, deviceId, error });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async getServerChanges(
    userId: string,
    since: Date,
    entityTypes?: string[]
  ): Promise<OfflineChange[]> {
    const changes: OfflineChange[] = [];
    const types = entityTypes || ['inspection', 'asset', 'form_template', 'folder', 'user'];

    try {
      for (const entityType of types) {
        const entityChanges = await this.getEntityChanges(entityType, userId, since);
        changes.push(...entityChanges);
      }

      return changes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      logger.error('Get server changes failed', { userId, since, entityTypes, error });
      throw error;
    }
  }

  private async getEntityChanges(
    entityType: string,
    userId: string,
    since: Date
  ): Promise<OfflineChange[]> {
    const changes: OfflineChange[] = [];

    try {
      let entities: any[] = [];
      
      switch (entityType) {
        case 'inspection':
          entities = await this.inspectionRepository.findModifiedSince(since, userId);
          break;
        case 'asset':
          entities = await this.assetRepository.findModifiedSince(since, userId);
          break;
        case 'form_template':
          entities = await this.formTemplateRepository.findModifiedSince(since, userId);
          break;
        case 'folder':
          entities = await this.folderRepository.findModifiedSince(since, userId);
          break;
        case 'user':
          entities = await this.userRepository.findModifiedSince(since, userId);
          break;
        default:
          logger.warn('Unknown entity type for sync', { entityType });
          return [];
      }

      for (const entity of entities) {
        changes.push({
          id: `server_${entity.id}_${Date.now()}`,
          entityType,
          entityId: entity.id,
          operation: entity.deletedAt ? 'delete' : (entity.createdAt > since ? 'create' : 'update'),
          data: entity,
          timestamp: entity.updatedAt || entity.createdAt,
          deviceId: 'server',
          userId: entity.createdBy || entity.updatedBy || userId
        });
      }

      return changes;
    } catch (error) {
      logger.error('Get entity changes failed', { entityType, userId, since, error });
      throw error;
    }
  }

  private async processClientChanges(
    changes: OfflineChange[],
    serverChanges: OfflineChange[],
    userId: string,
    syncId: string
  ): Promise<{
    applied: SyncOperation[];
    conflicts: SyncConflict[];
  }> {
    const applied: SyncOperation[] = [];
    const conflicts: SyncConflict[] = [];

    try {
      for (const change of changes) {
        this.updateSyncProgress(syncId, {
          currentOperation: `Processing ${change.entityType} ${change.operation}`
        });

        // Check for conflicts with server changes
        const conflictingServerChange = serverChanges.find(sc => 
          sc.entityType === change.entityType &&
          sc.entityId === change.entityId &&
          sc.timestamp > change.timestamp
        );

        if (conflictingServerChange) {
          // Conflict detected
          conflicts.push({
            id: `conflict_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            entityType: change.entityType,
            entityId: change.entityId,
            clientChange: change,
            serverChange: conflictingServerChange,
            detectedAt: new Date(),
            userId,
            status: 'pending'
          });
        } else {
          // No conflict, apply change
          try {
            await this.applyChange(change);
            applied.push({
              id: change.id,
              type: change.operation,
              entityType: change.entityType,
              entityId: change.entityId,
              data: change.data,
              timestamp: new Date(),
              userId,
              status: 'completed'
            });
          } catch (error) {
            logger.error('Failed to apply change', {
              change,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            // Create a conflict for failed operations
            conflicts.push({
              id: `conflict_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
              entityType: change.entityType,
              entityId: change.entityId,
              clientChange: change,
              serverChange: null,
              detectedAt: new Date(),
              userId,
              status: 'pending',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      return { applied, conflicts };
    } catch (error) {
      logger.error('Process client changes failed', {
        changeCount: changes.length,
        userId,
        syncId,
        error
      });
      throw error;
    }
  }

  private async resolveConflicts(
    conflicts: SyncConflict[],
    defaultResolution: ConflictResolution,
    userId: string,
    syncId: string
  ): Promise<{
    resolved: SyncOperation[];
    unresolved: SyncConflict[];
  }> {
    const resolved: SyncOperation[] = [];
    const unresolved: SyncConflict[] = [];

    try {
      for (const conflict of conflicts) {
        this.updateSyncProgress(syncId, {
          currentOperation: `Resolving conflict for ${conflict.entityType}`
        });

        try {
          // Check if there's a custom resolver for this entity type
          const resolver = this.conflictResolvers.get(conflict.entityType);
          let resolutionResult: ConflictResolutionResult;

          if (resolver) {
            resolutionResult = await resolver(conflict);
          } else {
            resolutionResult = await this.applyConflictResolution(
              conflict,
              defaultResolution
            );
          }

          if (resolutionResult.resolved) {
            // Apply resolved data
            await this.updateEntity(
              conflict.entityType,
              conflict.entityId,
              resolutionResult.mergedData
            );

            resolved.push({
              id: `resolved_${conflict.id}`,
              type: 'update',
              entityType: conflict.entityType,
              entityId: conflict.entityId,
              data: resolutionResult.mergedData,
              timestamp: new Date(),
              userId,
              status: 'completed'
            });

            // Mark conflict as resolved
            await this.syncRepository.markConflictResolved(
              conflict.id,
              resolutionResult.resolution,
              userId
            );
          } else {
            unresolved.push({
              ...conflict,
              error: resolutionResult.error
            });
          }
        } catch (error) {
          logger.error('Conflict resolution failed', {
            conflictId: conflict.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          unresolved.push({
            ...conflict,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return { resolved, unresolved };
    } catch (error) {
      logger.error('Resolve conflicts failed', {
        conflictCount: conflicts.length,
        userId,
        syncId,
        error
      });
      throw error;
    }
  }

  private async applyConflictResolution(
    conflict: SyncConflict,
    resolution: ConflictResolution,
    mergedData?: any
  ): Promise<ConflictResolutionResult> {
    try {
      let resolvedData: any;

      switch (resolution) {
        case ConflictResolution.CLIENT_WINS:
          resolvedData = conflict.clientChange.data;
          break;
          
        case ConflictResolution.SERVER_WINS:
          resolvedData = conflict.serverChange?.data;
          break;
          
        case ConflictResolution.MERGE:
          resolvedData = mergedData || await this.mergeConflictData(
            conflict.clientChange.data,
            conflict.serverChange?.data
          );
          break;
          
        case ConflictResolution.MANUAL:
          // Return unresolved for manual handling
          return {
            resolved: false,
            resolution,
            error: 'Manual resolution required'
          };
          
        default:
          throw new Error(`Unsupported conflict resolution: ${resolution}`);
      }

      return {
        resolved: true,
        resolution,
        mergedData: resolvedData
      };
    } catch (error) {
      return {
        resolved: false,
        resolution,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async mergeConflictData(clientData: any, serverData: any): Promise<any> {
    // Simple merge strategy - prefer client data for most fields,
    // but keep server timestamps and system fields
    const merged = { ...clientData };
    
    if (serverData) {
      // Preserve server system fields
      merged.id = serverData.id;
      merged.createdAt = serverData.createdAt;
      merged.createdBy = serverData.createdBy;
      merged.updatedAt = new Date(); // Use current time for merge
      
      // For arrays, merge unique items
      Object.keys(serverData).forEach(key => {
        if (Array.isArray(serverData[key]) && Array.isArray(clientData[key])) {
          const serverItems = serverData[key];
          const clientItems = clientData[key];
          const mergedItems = [...clientItems];
          
          serverItems.forEach((serverItem: any) => {
            const exists = clientItems.some((clientItem: any) => 
              clientItem.id === serverItem.id
            );
            if (!exists) {
              mergedItems.push(serverItem);
            }
          });
          
          merged[key] = mergedItems;
        }
      });
    }
    
    return merged;
  }

  private async applyChange(change: OfflineChange): Promise<void> {
    try {
      switch (change.operation) {
        case 'create':
          await this.createEntity(change.entityType, change.data);
          break;
        case 'update':
          await this.updateEntity(change.entityType, change.entityId, change.data);
          break;
        case 'delete':
          await this.deleteEntity(change.entityType, change.entityId, change.userId);
          break;
        default:
          throw new Error(`Unsupported operation: ${change.operation}`);
      }
    } catch (error) {
      logger.error('Apply change failed', {
        change,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async createEntity(entityType: string, data: any): Promise<void> {
    switch (entityType) {
      case 'inspection':
        await this.inspectionRepository.create(data);
        break;
      case 'asset':
        await this.assetRepository.create(data);
        break;
      case 'form_template':
        await this.formTemplateRepository.create(data);
        break;
      case 'folder':
        await this.folderRepository.create(data);
        break;
      default:
        throw new Error(`Unsupported entity type for create: ${entityType}`);
    }
  }

  private async updateEntity(entityType: string, entityId: string, data: any): Promise<void> {
    switch (entityType) {
      case 'inspection':
        await this.inspectionRepository.update(entityId, data);
        break;
      case 'asset':
        await this.assetRepository.update(entityId, data);
        break;
      case 'form_template':
        await this.formTemplateRepository.update(entityId, data);
        break;
      case 'folder':
        await this.folderRepository.update(entityId, data);
        break;
      default:
        throw new Error(`Unsupported entity type for update: ${entityType}`);
    }
  }

  private async deleteEntity(entityType: string, entityId: string, userId: string): Promise<void> {
    switch (entityType) {
      case 'inspection':
        await this.inspectionRepository.softDelete(entityId, userId);
        break;
      case 'asset':
        await this.assetRepository.softDelete(entityId, userId);
        break;
      case 'form_template':
        await this.formTemplateRepository.softDelete(entityId, userId);
        break;
      case 'folder':
        await this.folderRepository.softDelete(entityId, userId);
        break;
      default:
        throw new Error(`Unsupported entity type for delete: ${entityType}`);
    }
  }

  private initializeConflictResolvers(): void {
    // Register custom conflict resolvers for specific entity types
    this.conflictResolvers.set('inspection', async (conflict) => {
      // Custom inspection conflict resolution logic
      const clientData = conflict.clientChange.data;
      const serverData = conflict.serverChange?.data;
      
      // For inspections, prefer client responses but keep server metadata
      const merged = {
        ...serverData,
        ...clientData,
        responses: clientData.responses || serverData?.responses || [],
        photos: [...(serverData?.photos || []), ...(clientData.photos || [])],
        updatedAt: new Date()
      };
      
      return {
        resolved: true,
        resolution: ConflictResolution.MERGE,
        mergedData: merged
      };
    });
    
    // Add more custom resolvers as needed
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private updateSyncProgress(syncId: string, update: Partial<SyncProgress>): void {
    const current = this.activeSyncs.get(syncId);
    if (current) {
      const updated = { ...current, ...update };
      if (updated.total > 0) {
        updated.percentage = Math.round((updated.completed / updated.total) * 100);
      }
      this.activeSyncs.set(syncId, updated);
      
      // Emit progress update via WebSocket
      this.webSocketService.emit('sync:progress', {
        syncId,
        progress: updated
      });
    }
  }

  private async clearOfflineQueue(userId: string, deviceId: string): Promise<void> {
    try {
      const queueKey = `${userId}:${deviceId}`;
      this.syncQueue.delete(queueKey);
      await this.syncRepository.clearOfflineQueue(userId, deviceId);
      
      logger.debug('Offline queue cleared', { userId, deviceId });
    } catch (error) {
      logger.error('Clear offline queue failed', { userId, deviceId, error });
    }
  }

  private startSyncQueueProcessor(): void {
    // Process sync queues periodically
    setInterval(async () => {
      try {
        for (const [queueKey, queue] of this.syncQueue.entries()) {
          // Auto-sync if queue has been idle for too long
          const idleTime = Date.now() - queue.lastUpdated.getTime();
          const maxIdleTime = 5 * 60 * 1000; // 5 minutes
          
          if (idleTime > maxIdleTime && queue.operations.length > 0) {
            logger.info('Auto-syncing idle queue', {
              userId: queue.userId,
              deviceId: queue.deviceId,
              operationCount: queue.operations.length,
              idleTime
            });
            
            try {
              await this.forceSync(queue.userId, queue.deviceId, {
                priority: SyncPriority.LOW
              });
            } catch (error) {
              logger.error('Auto-sync failed', {
                userId: queue.userId,
                deviceId: queue.deviceId,
                error
              });
            }
          }
        }
      } catch (error) {
        logger.error('Sync queue processor error', { error });
      }
    }, 60000); // Run every minute
  }
}