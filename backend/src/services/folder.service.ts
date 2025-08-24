/**
 * Folder Service
 * Handles workflow organization, scheduling, and folder management for inspections
 */

import { FolderRepository } from '../repositories/folder.repository';
import { InspectionRepository } from '../repositories/inspection.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  Folder,
  CreateFolderDTO,
  UpdateFolderDTO,
  FolderType,
  FolderStatus,
  FolderSchedule,
  FolderPermission,
  FolderStatistics,
  FolderWorkflow
} from '../types/folder';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { NotificationService } from './notification.service';
import { SchedulerService } from './scheduler.service';

export interface FolderSearchFilters {
  search?: string;
  type?: FolderType;
  status?: FolderStatus;
  parentId?: string;
  assignedTo?: string;
  createdBy?: string;
  department?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  hasSchedule?: boolean;
  isOverdue?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface FolderTreeNode {
  folder: Folder;
  children: FolderTreeNode[];
  inspectionCount: number;
  completedInspections: number;
  pendingInspections: number;
  overdueInspections: number;
  depth: number;
}

export interface FolderAnalytics {
  folderId: string;
  folderName: string;
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  overdueInspections: number;
  averageCompletionTime: number; // hours
  completionRate: number; // percentage
  onTimeCompletionRate: number; // percentage
  assigneePerformance: {
    userId: string;
    userName: string;
    assignedCount: number;
    completedCount: number;
    averageTime: number;
    onTimeRate: number;
  }[];
  timelineData: {
    date: Date;
    created: number;
    completed: number;
    overdue: number;
  }[];
  issuesSummary: {
    totalIssues: number;
    criticalIssues: number;
    resolvedIssues: number;
    averageResolutionTime: number;
  };
}

export interface BulkFolderOperation {
  folderIds: string[];
  operation: 'activate' | 'deactivate' | 'archive' | 'delete' | 'updateStatus' | 'reassign' | 'addTags' | 'removeTags';
  data?: {
    status?: FolderStatus;
    assignedTo?: string;
    tags?: string[];
  };
}

export interface FolderMoveOperation {
  folderId: string;
  newParentId?: string; // null for root level
  newPosition?: number;
}

export interface FolderCopyOperation {
  sourceFolderId: string;
  targetParentId?: string;
  newName: string;
  copyInspections?: boolean;
  copySchedule?: boolean;
  copyPermissions?: boolean;
}

export class FolderService {
  private folderRepository: FolderRepository;
  private inspectionRepository: InspectionRepository;
  private auditLogRepository: AuditLogRepository;
  private notificationService: NotificationService;
  private schedulerService: SchedulerService;

  constructor(
    folderRepository: FolderRepository,
    inspectionRepository: InspectionRepository,
    auditLogRepository: AuditLogRepository,
    notificationService: NotificationService,
    schedulerService: SchedulerService
  ) {
    this.folderRepository = folderRepository;
    this.inspectionRepository = inspectionRepository;
    this.auditLogRepository = auditLogRepository;
    this.notificationService = notificationService;
    this.schedulerService = schedulerService;
  }

  /**
   * Create a new folder
   */
  async createFolder(
    folderData: CreateFolderDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<Folder> {
    try {
      // Validate parent folder if specified
      if (folderData.parentId) {
        const parentFolder = await this.folderRepository.findById(folderData.parentId);
        if (!parentFolder) {
          throw new AppError(
            'Parent folder not found',
            404,
            ErrorCodes.FOLDER_NOT_FOUND
          );
        }

        // Check if parent folder allows subfolders
        if (parentFolder.type === FolderType.INSPECTION) {
          throw new AppError(
            'Cannot create subfolders under inspection folders',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Validate folder name uniqueness within parent
      const existingFolder = await this.folderRepository.findByNameAndParent(
        folderData.name,
        folderData.parentId
      );
      if (existingFolder) {
        throw new AppError(
          'Folder name already exists in this location',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Create folder
      const folder = await this.folderRepository.create({
        ...folderData,
        createdBy,
        status: folderData.status || FolderStatus.ACTIVE
      });

      // Set up schedule if provided
      if (folderData.schedule) {
        await this.setupFolderSchedule(folder.id, folderData.schedule, createdBy);
      }

      // Set up permissions if provided
      if (folderData.permissions && folderData.permissions.length > 0) {
        await this.setFolderPermissions(folder.id, folderData.permissions, createdBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: createdBy,
        action: 'FOLDER_CREATED',
        entityType: 'folder',
        entityId: folder.id,
        details: {
          folderName: folder.name,
          folderType: folder.type,
          parentId: folder.parentId,
          hasSchedule: !!folderData.schedule,
          hasPermissions: !!(folderData.permissions && folderData.permissions.length > 0)
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      // Send notification to assigned users
      if (folder.assignedTo) {
        await this.notificationService.sendFolderAssignmentNotification(
          folder.assignedTo,
          folder,
          createdBy
        );
      }

      logger.info('Folder created successfully', {
        folderId: folder.id,
        folderName: folder.name,
        folderType: folder.type,
        createdBy
      });

      return folder;
    } catch (error) {
      logger.error('Folder creation failed', {
        folderName: folderData.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get folder by ID
   */
  async getFolderById(folderId: string): Promise<Folder> {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) {
      throw new AppError(
        'Folder not found',
        404,
        ErrorCodes.FOLDER_NOT_FOUND
      );
    }
    return folder;
  }

  /**
   * Update folder
   */
  async updateFolder(
    folderId: string,
    updateData: UpdateFolderDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<Folder> {
    try {
      // Check if folder exists
      const existingFolder = await this.getFolderById(folderId);

      // Validate parent folder if being changed
      if (updateData.parentId !== undefined && updateData.parentId !== existingFolder.parentId) {
        if (updateData.parentId) {
          const parentFolder = await this.folderRepository.findById(updateData.parentId);
          if (!parentFolder) {
            throw new AppError(
              'Parent folder not found',
              404,
              ErrorCodes.FOLDER_NOT_FOUND
            );
          }

          // Check for circular reference
          if (await this.wouldCreateCircularReference(folderId, updateData.parentId)) {
            throw new AppError(
              'Cannot move folder: would create circular reference',
              400,
              ErrorCodes.VALIDATION_FAILED
            );
          }
        }
      }

      // Validate folder name uniqueness if name is being changed
      if (updateData.name && updateData.name !== existingFolder.name) {
        const existingWithName = await this.folderRepository.findByNameAndParent(
          updateData.name,
          updateData.parentId ?? existingFolder.parentId
        );
        if (existingWithName && existingWithName.id !== folderId) {
          throw new AppError(
            'Folder name already exists in this location',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Update folder
      const updatedFolder = await this.folderRepository.update(folderId, {
        ...updateData,
        updatedBy
      });

      // Update schedule if provided
      if (updateData.schedule) {
        await this.updateFolderSchedule(folderId, updateData.schedule, updatedBy);
      }

      // Update permissions if provided
      if (updateData.permissions) {
        await this.setFolderPermissions(folderId, updateData.permissions, updatedBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'FOLDER_UPDATED',
        entityType: 'folder',
        entityId: folderId,
        details: {
          updatedFields: Object.keys(updateData),
          previousValues: this.getChangedFields(existingFolder, updateData),
          newValues: updateData,
          parentChanged: updateData.parentId !== undefined && updateData.parentId !== existingFolder.parentId,
          assigneeChanged: updateData.assignedTo !== undefined && updateData.assignedTo !== existingFolder.assignedTo
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      // Send notification if assignee changed
      if (updateData.assignedTo && updateData.assignedTo !== existingFolder.assignedTo) {
        await this.notificationService.sendFolderReassignmentNotification(
          updateData.assignedTo,
          existingFolder.assignedTo,
          updatedFolder,
          updatedBy
        );
      }

      logger.info('Folder updated successfully', {
        folderId,
        folderName: updatedFolder.name,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedFolder;
    } catch (error) {
      logger.error('Folder update failed', {
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(
    folderId: string,
    deletedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check if folder exists
      const folder = await this.getFolderById(folderId);

      // Check if folder has subfolders
      const subfolders = await this.folderRepository.findByParentId(folderId);
      if (subfolders.length > 0) {
        throw new AppError(
          'Cannot delete folder with subfolders. Please delete or move subfolders first.',
          400,
          ErrorCodes.FOLDER_HAS_CHILDREN
        );
      }

      // Check if folder has active inspections
      const activeInspections = await this.inspectionRepository.countActiveByFolderId(folderId);
      if (activeInspections > 0) {
        throw new AppError(
          `Cannot delete folder with ${activeInspections} active inspection(s). Please complete or move inspections first.`,
          400,
          ErrorCodes.FOLDER_HAS_ACTIVE_INSPECTIONS
        );
      }

      // Cancel scheduled tasks
      if (folder.schedule) {
        await this.schedulerService.cancelFolderSchedule(folderId);
      }

      // Soft delete folder
      await this.folderRepository.delete(folderId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: deletedBy,
        action: 'FOLDER_DELETED',
        entityType: 'folder',
        entityId: folderId,
        details: {
          folderName: folder.name,
          folderType: folder.type,
          parentId: folder.parentId,
          hadSchedule: !!folder.schedule
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      logger.info('Folder deleted successfully', {
        folderId,
        folderName: folder.name,
        deletedBy
      });
    } catch (error) {
      logger.error('Folder deletion failed', {
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Move folder to new parent
   */
  async moveFolder(
    operation: FolderMoveOperation,
    movedBy: string,
    ipAddress?: string
  ): Promise<Folder> {
    try {
      // Check if folder exists
      const folder = await this.getFolderById(operation.folderId);

      // Validate new parent if specified
      if (operation.newParentId) {
        const newParent = await this.folderRepository.findById(operation.newParentId);
        if (!newParent) {
          throw new AppError(
            'Target parent folder not found',
            404,
            ErrorCodes.FOLDER_NOT_FOUND
          );
        }

        // Check for circular reference
        if (await this.wouldCreateCircularReference(operation.folderId, operation.newParentId)) {
          throw new AppError(
            'Cannot move folder: would create circular reference',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Check name uniqueness in new location
      const existingWithName = await this.folderRepository.findByNameAndParent(
        folder.name,
        operation.newParentId
      );
      if (existingWithName && existingWithName.id !== operation.folderId) {
        throw new AppError(
          'Folder name already exists in target location',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Move folder
      const movedFolder = await this.folderRepository.move(
        operation.folderId,
        operation.newParentId,
        operation.newPosition
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: movedBy,
        action: 'FOLDER_MOVED',
        entityType: 'folder',
        entityId: operation.folderId,
        details: {
          folderName: folder.name,
          previousParentId: folder.parentId,
          newParentId: operation.newParentId,
          newPosition: operation.newPosition
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Folder moved successfully', {
        folderId: operation.folderId,
        folderName: folder.name,
        previousParentId: folder.parentId,
        newParentId: operation.newParentId,
        movedBy
      });

      return movedFolder;
    } catch (error) {
      logger.error('Folder move failed', {
        folderId: operation.folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Copy folder with options
   */
  async copyFolder(
    operation: FolderCopyOperation,
    copiedBy: string,
    ipAddress?: string
  ): Promise<Folder> {
    try {
      // Get source folder
      const sourceFolder = await this.getFolderById(operation.sourceFolderId);

      // Validate target parent if specified
      if (operation.targetParentId) {
        const targetParent = await this.folderRepository.findById(operation.targetParentId);
        if (!targetParent) {
          throw new AppError(
            'Target parent folder not found',
            404,
            ErrorCodes.FOLDER_NOT_FOUND
          );
        }
      }

      // Check name uniqueness in target location
      const existingWithName = await this.folderRepository.findByNameAndParent(
        operation.newName,
        operation.targetParentId
      );
      if (existingWithName) {
        throw new AppError(
          'Folder name already exists in target location',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Create copied folder
      const copiedFolderData: CreateFolderDTO = {
        name: operation.newName,
        description: `Copy of ${sourceFolder.name}`,
        type: sourceFolder.type,
        parentId: operation.targetParentId,
        assignedTo: sourceFolder.assignedTo,
        dueDate: sourceFolder.dueDate,
        priority: sourceFolder.priority,
        tags: [...sourceFolder.tags],
        settings: { ...sourceFolder.settings },
        schedule: operation.copySchedule ? sourceFolder.schedule : undefined,
        permissions: operation.copyPermissions ? sourceFolder.permissions : undefined
      };

      const copiedFolder = await this.createFolder(copiedFolderData, copiedBy, ipAddress);

      // Copy inspections if requested
      if (operation.copyInspections) {
        await this.copyFolderInspections(operation.sourceFolderId, copiedFolder.id, copiedBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: copiedBy,
        action: 'FOLDER_COPIED',
        entityType: 'folder',
        entityId: copiedFolder.id,
        details: {
          sourceFolderId: operation.sourceFolderId,
          sourceFolderName: sourceFolder.name,
          copiedFolderName: operation.newName,
          targetParentId: operation.targetParentId,
          copiedInspections: operation.copyInspections,
          copiedSchedule: operation.copySchedule,
          copiedPermissions: operation.copyPermissions
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Folder copied successfully', {
        sourceFolderId: operation.sourceFolderId,
        copiedFolderId: copiedFolder.id,
        copiedFolderName: operation.newName,
        copiedBy
      });

      return copiedFolder;
    } catch (error) {
      logger.error('Folder copy failed', {
        sourceFolderId: operation.sourceFolderId,
        newName: operation.newName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get folder tree structure
   */
  async getFolderTree(
    parentId?: string,
    includeInspectionCounts: boolean = true
  ): Promise<FolderTreeNode[]> {
    try {
      const folders = await this.folderRepository.findByParentId(parentId);
      const tree: FolderTreeNode[] = [];

      for (const folder of folders) {
        const children = await this.getFolderTree(folder.id, includeInspectionCounts);
        
        let inspectionCounts = {
          inspectionCount: 0,
          completedInspections: 0,
          pendingInspections: 0,
          overdueInspections: 0
        };

        if (includeInspectionCounts) {
          inspectionCounts = await this.getFolderInspectionCounts(folder.id);
        }

        tree.push({
          folder,
          children,
          ...inspectionCounts,
          depth: this.calculateFolderDepth(folder.id)
        });
      }

      return tree.sort((a, b) => {
        // Sort by position if available, then by name
        if (a.folder.position !== undefined && b.folder.position !== undefined) {
          return a.folder.position - b.folder.position;
        }
        return a.folder.name.localeCompare(b.folder.name);
      });
    } catch (error) {
      logger.error('Get folder tree failed', {
        parentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search folders with filters and pagination
   */
  async searchFolders(
    filters: FolderSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Folder>> {
    try {
      const result = await this.folderRepository.search(filters, pagination);
      
      logger.debug('Folder search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Folder search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get folder analytics
   */
  async getFolderAnalytics(
    folderId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FolderAnalytics> {
    try {
      const folder = await this.getFolderById(folderId);
      const analytics = await this.folderRepository.getAnalytics(folderId, startDate, endDate);
      
      logger.debug('Folder analytics retrieved', {
        folderId,
        folderName: folder.name,
        totalInspections: analytics.totalInspections,
        completionRate: analytics.completionRate
      });

      return {
        folderId,
        folderName: folder.name,
        ...analytics
      };
    } catch (error) {
      logger.error('Get folder analytics failed', {
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStatistics(): Promise<FolderStatistics> {
    try {
      const stats = await this.folderRepository.getStatistics();
      
      logger.debug('Folder statistics retrieved', {
        totalFolders: stats.total,
        activeFolders: stats.active,
        overdueFolders: stats.overdue
      });

      return stats;
    } catch (error) {
      logger.error('Get folder statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Bulk folder operations
   */
  async bulkFolderOperation(
    operation: BulkFolderOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { folderId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { folderId: string; error: string }[]
    };

    try {
      for (const folderId of operation.folderIds) {
        try {
          switch (operation.operation) {
            case 'activate':
              await this.updateFolder(
                folderId,
                { status: FolderStatus.ACTIVE },
                performedBy,
                ipAddress
              );
              break;
            case 'deactivate':
              await this.updateFolder(
                folderId,
                { status: FolderStatus.INACTIVE },
                performedBy,
                ipAddress
              );
              break;
            case 'archive':
              await this.updateFolder(
                folderId,
                { status: FolderStatus.ARCHIVED },
                performedBy,
                ipAddress
              );
              break;
            case 'delete':
              await this.deleteFolder(folderId, performedBy, ipAddress);
              break;
            case 'updateStatus':
              if (operation.data?.status) {
                await this.updateFolder(
                  folderId,
                  { status: operation.data.status },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'reassign':
              if (operation.data?.assignedTo) {
                await this.updateFolder(
                  folderId,
                  { assignedTo: operation.data.assignedTo },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'addTags':
              if (operation.data?.tags) {
                const folder = await this.getFolderById(folderId);
                const newTags = [...new Set([...folder.tags, ...operation.data.tags])];
                await this.updateFolder(
                  folderId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'removeTags':
              if (operation.data?.tags) {
                const folder = await this.getFolderById(folderId);
                const newTags = folder.tags.filter(tag => !operation.data!.tags!.includes(tag));
                await this.updateFolder(
                  folderId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(folderId);
        } catch (error) {
          results.failed.push({
            folderId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_FOLDER_OPERATION',
        entityType: 'folder',
        entityId: null,
        details: {
          operation: operation.operation,
          totalFolders: operation.folderIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk folder operation completed', {
        operation: operation.operation,
        totalFolders: operation.folderIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk folder operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async wouldCreateCircularReference(
    folderId: string,
    newParentId: string
  ): Promise<boolean> {
    let currentParentId: string | undefined = newParentId;
    
    while (currentParentId) {
      if (currentParentId === folderId) {
        return true;
      }
      
      const parent = await this.folderRepository.findById(currentParentId);
      currentParentId = parent?.parentId;
    }
    
    return false;
  }

  private async calculateFolderDepth(folderId: string): Promise<number> {
    let depth = 0;
    let currentId: string | undefined = folderId;
    
    while (currentId) {
      const folder = await this.folderRepository.findById(currentId);
      if (!folder || !folder.parentId) break;
      
      depth++;
      currentId = folder.parentId;
    }
    
    return depth;
  }

  private async getFolderInspectionCounts(folderId: string) {
    const counts = await this.inspectionRepository.getCountsByFolderId(folderId);
    return {
      inspectionCount: counts.total,
      completedInspections: counts.completed,
      pendingInspections: counts.pending,
      overdueInspections: counts.overdue
    };
  }

  private async setupFolderSchedule(
    folderId: string,
    schedule: FolderSchedule,
    createdBy: string
  ): Promise<void> {
    try {
      await this.schedulerService.createFolderSchedule(folderId, schedule, createdBy);
    } catch (error) {
      logger.error('Failed to setup folder schedule', {
        folderId,
        schedule,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async updateFolderSchedule(
    folderId: string,
    schedule: FolderSchedule,
    updatedBy: string
  ): Promise<void> {
    try {
      await this.schedulerService.updateFolderSchedule(folderId, schedule, updatedBy);
    } catch (error) {
      logger.error('Failed to update folder schedule', {
        folderId,
        schedule,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async setFolderPermissions(
    folderId: string,
    permissions: FolderPermission[],
    setBy: string
  ): Promise<void> {
    try {
      await this.folderRepository.setPermissions(folderId, permissions, setBy);
    } catch (error) {
      logger.error('Failed to set folder permissions', {
        folderId,
        permissionCount: permissions.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async copyFolderInspections(
    sourceFolderId: string,
    targetFolderId: string,
    copiedBy: string
  ): Promise<void> {
    try {
      await this.inspectionRepository.copyByFolderId(sourceFolderId, targetFolderId, copiedBy);
    } catch (error) {
      logger.error('Failed to copy folder inspections', {
        sourceFolderId,
        targetFolderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private getChangedFields(original: Folder, updates: UpdateFolderDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateFolderDTO;
      if (JSON.stringify(original[typedKey as keyof Folder]) !== JSON.stringify(updates[typedKey])) {
        changed[key] = original[typedKey as keyof Folder];
      }
    });
    
    return changed;
  }
}