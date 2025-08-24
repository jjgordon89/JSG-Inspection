/**
 * Sync Controller
 * Handles HTTP requests for data synchronization and offline operations
 */

import { Request, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  SyncRequest,
  SyncResponse,
  ConflictResolution,
  OfflineOperation,
  SyncStatus,
  SyncStats,
  EntityType,
  SyncFilters
} from '../types/sync';
import { PaginationQuery } from '../types/common';

export class SyncController {
  constructor(private syncService: SyncService) {}

  /**
   * Synchronize data between client and server
   * POST /api/sync
   */
  synchronizeData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syncRequest: SyncRequest = req.body;
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const clientVersion = req.headers['x-client-version'] as string;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      // Validate sync request
      if (!syncRequest.lastSyncTime && !syncRequest.isInitialSync) {
        throw new AppError('Last sync time is required for non-initial sync', 400);
      }

      const syncResponse: SyncResponse = await this.syncService.synchronizeData({
        ...syncRequest,
        userId,
        deviceId,
        clientVersion
      });

      res.json({
        success: true,
        data: syncResponse,
        message: 'Synchronization completed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get synchronization status
   * GET /api/sync/status
   */
  getSyncStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      const status: SyncStatus = await this.syncService.getSyncStatus(userId, deviceId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Queue offline operation
   * POST /api/sync/queue
   */
  queueOfflineOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: OfflineOperation = req.body;
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      // Validate operation
      if (!operation.entityType || !operation.action || !operation.entityId) {
        throw new AppError('Entity type, action, and entity ID are required', 400);
      }

      const queuedOperation = await this.syncService.queueOfflineOperation({
        ...operation,
        userId,
        deviceId
      });

      res.status(201).json({
        success: true,
        data: queuedOperation,
        message: 'Operation queued successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get pending operations
   * GET /api/sync/pending
   */
  getPendingOperations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const entityType = req.query.entityType as EntityType;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      const operations = await this.syncService.getPendingOperations(
        userId,
        deviceId,
        entityType,
        limit
      );

      res.json({
        success: true,
        data: operations
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve conflict
   * POST /api/sync/conflicts/:conflictId/resolve
   */
  resolveConflict = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conflictId } = req.params;
      const resolution: ConflictResolution = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Validate resolution
      if (!resolution.strategy) {
        throw new AppError('Resolution strategy is required', 400);
      }

      const resolvedConflict = await this.syncService.resolveConflict(conflictId, {
        ...resolution,
        resolvedBy: userId
      });

      res.json({
        success: true,
        data: resolvedConflict,
        message: 'Conflict resolved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sync conflicts
   * GET /api/sync/conflicts
   */
  getSyncConflicts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const entityType = req.query.entityType as EntityType;
      const status = req.query.status as string;
      
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const filters: SyncFilters = {
        userId,
        deviceId,
        entityType,
        status
      };

      const conflicts = await this.syncService.getSyncConflicts(filters, pagination);

      res.json({
        success: true,
        data: conflicts.conflicts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: conflicts.total,
          pages: Math.ceil(conflicts.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sync statistics
   * GET /api/sync/stats
   */
  getSyncStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const timeRange = req.query.timeRange as string || '24h';

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const stats: SyncStats = await this.syncService.getSyncStats(userId, deviceId, timeRange);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Force full synchronization
   * POST /api/sync/force
   */
  forceSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const { entityTypes, clearLocal } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      const syncResponse = await this.syncService.forceSync(userId, deviceId, {
        entityTypes,
        clearLocal: clearLocal || false
      });

      res.json({
        success: true,
        data: syncResponse,
        message: 'Force synchronization completed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset sync state
   * POST /api/sync/reset
   */
  resetSyncState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const { confirmReset } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!deviceId) {
        throw new AppError('Device ID is required', 400);
      }

      if (!confirmReset) {
        throw new AppError('Reset confirmation is required', 400);
      }

      await this.syncService.resetSyncState(userId, deviceId);

      res.json({
        success: true,
        message: 'Sync state reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sync history
   * GET /api/sync/history
   */
  getSyncHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        status: req.query.status as string,
        entityType: req.query.entityType as EntityType
      };

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const history = await this.syncService.getSyncHistory(
        userId,
        deviceId,
        filters,
        pagination
      );

      res.json({
        success: true,
        data: history.history,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: history.total,
          pages: Math.ceil(history.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check server changes
   * GET /api/sync/changes
   */
  checkServerChanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const lastSyncTime = req.query.lastSyncTime as string;
      const entityTypes = req.query.entityTypes ? 
        (req.query.entityTypes as string).split(',') as EntityType[] : undefined;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!lastSyncTime) {
        throw new AppError('Last sync time is required', 400);
      }

      const changes = await this.syncService.getServerChanges(
        userId,
        new Date(lastSyncTime),
        entityTypes
      );

      res.json({
        success: true,
        data: changes
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate sync data
   * POST /api/sync/validate
   */
  validateSyncData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entities, operations } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const validation = await this.syncService.validateSyncData({
        entities,
        operations,
        userId
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get device sync info
   * GET /api/sync/devices
   */
  getDeviceSyncInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const devices = await this.syncService.getDeviceSyncInfo(userId);

      res.json({
        success: true,
        data: devices
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove device sync data
   * DELETE /api/sync/devices/:deviceId
   */
  removeDeviceSyncData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deviceId } = req.params;
      const userId = req.user?.id;
      const { confirmRemoval } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!confirmRemoval) {
        throw new AppError('Removal confirmation is required', 400);
      }

      await this.syncService.removeDeviceSyncData(userId, deviceId);

      res.json({
        success: true,
        message: 'Device sync data removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sync health check
   * GET /api/sync/health
   */
  getSyncHealthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const health = await this.syncService.getSyncHealthCheck(userId, deviceId);

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Optimize sync performance
   * POST /api/sync/optimize
   */
  optimizeSyncPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const deviceId = req.headers['x-device-id'] as string;
      const { options } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const optimization = await this.syncService.optimizeSyncPerformance(
        userId,
        deviceId,
        options
      );

      res.json({
        success: true,
        data: optimization,
        message: 'Sync performance optimization completed'
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const syncValidationSchemas = {
  synchronizeData: {
    lastSyncTime: { required: false, type: 'string' },
    isInitialSync: { required: false, type: 'boolean' },
    clientChanges: { required: false, type: 'array' },
    conflictResolutions: { required: false, type: 'array' },
    entityTypes: { required: false, type: 'array' },
    batchSize: { required: false, type: 'number', min: 1, max: 1000 }
  },
  queueOfflineOperation: {
    entityType: { required: true, type: 'string', enum: ['inspection', 'asset', 'form', 'user', 'folder'] },
    action: { required: true, type: 'string', enum: ['create', 'update', 'delete'] },
    entityId: { required: true, type: 'string' },
    data: { required: false, type: 'object' },
    timestamp: { required: false, type: 'string' },
    priority: { required: false, type: 'string', enum: ['low', 'normal', 'high'] }
  },
  resolveConflict: {
    strategy: { required: true, type: 'string', enum: ['client_wins', 'server_wins', 'merge', 'manual'] },
    mergedData: { required: false, type: 'object' },
    reason: { required: false, type: 'string' }
  },
  forceSync: {
    entityTypes: { required: false, type: 'array' },
    clearLocal: { required: false, type: 'boolean' }
  },
  resetSyncState: {
    confirmReset: { required: true, type: 'boolean', enum: [true] }
  },
  validateSyncData: {
    entities: { required: false, type: 'array' },
    operations: { required: false, type: 'array' }
  },
  removeDeviceSyncData: {
    confirmRemoval: { required: true, type: 'boolean', enum: [true] }
  },
  optimizeSyncPerformance: {
    options: { required: false, type: 'object' }
  }
};