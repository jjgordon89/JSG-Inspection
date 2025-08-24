/**
 * Folder Controller
 * Handles HTTP requests for folder management operations
 */

import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services/folder.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateFolderDTO,
  UpdateFolderDTO,
  FolderFilters,
  FolderType,
  FolderStatus,
  BulkFolderOperation,
  FolderSchedule,
  FolderTemplate
} from '../types/folder';
import { PaginationQuery, SortQuery } from '../types/common';

export class FolderController {
  constructor(private folderService: FolderService) {}

  /**
   * Get folders with filtering and pagination
   * GET /api/folders
   */
  getFolders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: FolderFilters = {
        search: req.query.search as string,
        type: req.query.type as FolderType,
        status: req.query.status as FolderStatus,
        parentId: req.query.parentId as string,
        teamId: req.query.teamId as string,
        assignedTo: req.query.assignedTo as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        hasSchedule: req.query.hasSchedule === 'true' ? true : req.query.hasSchedule === 'false' ? false : undefined,
        isTemplate: req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        dueDateAfter: req.query.dueDateAfter ? new Date(req.query.dueDateAfter as string) : undefined,
        dueDateBefore: req.query.dueDateBefore ? new Date(req.query.dueDateBefore as string) : undefined
      };

      const result = await this.folderService.getFolders(filters, pagination, sort);

      res.json({
        success: true,
        data: result.folders,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        },
        filters: filters
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder by ID
   * GET /api/folders/:id
   */
  getFolderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const includeChildren = req.query.includeChildren === 'true';
      const includeInspections = req.query.includeInspections === 'true';
      const includeHistory = req.query.includeHistory === 'true';
      
      const folder = await this.folderService.getFolderById(id, {
        includeChildren,
        includeInspections,
        includeHistory
      });

      if (!folder) {
        throw new AppError('Folder not found', 404);
      }

      res.json({
        success: true,
        data: folder
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new folder
   * POST /api/folders
   */
  createFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folderData: CreateFolderDTO = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const folder = await this.folderService.createFolder({
        ...folderData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: folder,
        message: 'Folder created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update folder
   * PUT /api/folders/:id
   */
  updateFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateFolderDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const folder = await this.folderService.updateFolder(id, updateData, updatedBy);

      res.json({
        success: true,
        data: folder,
        message: 'Folder updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete folder
   * DELETE /api/folders/:id
   */
  deleteFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      const force = req.query.force === 'true';

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.folderService.deleteFolder(id, deletedBy, force);

      res.json({
        success: true,
        message: 'Folder deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder tree structure
   * GET /api/folders/tree
   */
  getFolderTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rootId = req.query.rootId as string;
      const maxDepth = parseInt(req.query.maxDepth as string) || 5;
      const includeInspectionCounts = req.query.includeInspectionCounts === 'true';

      const tree = await this.folderService.getFolderTree(rootId, {
        maxDepth,
        includeInspectionCounts
      });

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Move folder to new parent
   * PUT /api/folders/:id/move
   */
  moveFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { parentId } = req.body;
      const movedBy = req.user?.id;

      if (!movedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const folder = await this.folderService.moveFolder(id, parentId, movedBy);

      res.json({
        success: true,
        data: folder,
        message: 'Folder moved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Copy folder
   * POST /api/folders/:id/copy
   */
  copyFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { parentId, name, includeInspections } = req.body;
      const copiedBy = req.user?.id;

      if (!copiedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const folder = await this.folderService.copyFolder(id, {
        parentId,
        name,
        includeInspections: includeInspections || false,
        copiedBy
      });

      res.status(201).json({
        success: true,
        data: folder,
        message: 'Folder copied successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder inspections
   * GET /api/folders/:id/inspections
   */
  getFolderInspections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const includeSubfolders = req.query.includeSubfolders === 'true';

      const inspections = await this.folderService.getFolderInspections(id, {
        pagination,
        sort,
        includeSubfolders
      });

      res.json({
        success: true,
        data: inspections.inspections,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: inspections.total,
          pages: Math.ceil(inspections.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set folder schedule
   * PUT /api/folders/:id/schedule
   */
  setSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule: FolderSchedule = req.body;
      const scheduledBy = req.user?.id;

      if (!scheduledBy) {
        throw new AppError('User not authenticated', 401);
      }

      const folder = await this.folderService.setSchedule(id, schedule, scheduledBy);

      res.json({
        success: true,
        data: folder,
        message: 'Folder schedule set successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove folder schedule
   * DELETE /api/folders/:id/schedule
   */
  removeSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const removedBy = req.user?.id;

      if (!removedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.folderService.removeSchedule(id, removedBy);

      res.json({
        success: true,
        message: 'Folder schedule removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign folder to user/team
   * POST /api/folders/:id/assign
   */
  assignFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, teamId, role } = req.body;
      const assignedBy = req.user?.id;

      if (!assignedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!userId && !teamId) {
        throw new AppError('Either userId or teamId must be provided', 400);
      }

      const assignment = await this.folderService.assignFolder(id, {
        userId,
        teamId,
        role: role || 'viewer',
        assignedBy
      });

      res.json({
        success: true,
        data: assignment,
        message: 'Folder assigned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unassign folder from user/team
   * DELETE /api/folders/:id/assign
   */
  unassignFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, teamId } = req.body;
      const unassignedBy = req.user?.id;

      if (!unassignedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!userId && !teamId) {
        throw new AppError('Either userId or teamId must be provided', 400);
      }

      await this.folderService.unassignFolder(id, { userId, teamId }, unassignedBy);

      res.json({
        success: true,
        message: 'Folder unassigned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder assignments
   * GET /api/folders/:id/assignments
   */
  getFolderAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const assignments = await this.folderService.getFolderAssignments(id);

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folders assigned to current user
   * GET /api/folders/my-assignments
   */
  getMyAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const folders = await this.folderService.getUserAssignments(userId, pagination);

      res.json({
        success: true,
        data: folders.folders,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: folders.total,
          pages: Math.ceil(folders.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create folder from template
   * POST /api/folders/from-template
   */
  createFromTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { templateId, name, parentId, customizations } = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!templateId) {
        throw new AppError('Template ID is required', 400);
      }

      const folder = await this.folderService.createFromTemplate({
        templateId,
        name,
        parentId,
        customizations,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: folder,
        message: 'Folder created from template successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Save folder as template
   * POST /api/folders/:id/save-as-template
   */
  saveAsTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, category, isPublic } = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.folderService.saveAsTemplate(id, {
        name,
        description,
        category,
        isPublic: isPublic || false,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Folder saved as template successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder templates
   * GET /api/folders/templates
   */
  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        createdBy: req.query.createdBy as string
      };

      const templates = await this.folderService.getTemplates(filters, pagination);

      res.json({
        success: true,
        data: templates.templates,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: templates.total,
          pages: Math.ceil(templates.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder analytics
   * GET /api/folders/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: FolderFilters = {
        type: req.query.type as FolderType,
        status: req.query.status as FolderStatus,
        teamId: req.query.teamId as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const analytics = await this.folderService.getAnalytics(filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder statistics
   * GET /api/folders/stats
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = req.query.period as string || '30d';
      const groupBy = req.query.groupBy as string || 'day';
      const filters: FolderFilters = {
        type: req.query.type as FolderType,
        status: req.query.status as FolderStatus,
        teamId: req.query.teamId as string
      };

      const stats = await this.folderService.getStatistics(period, groupBy, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk operations on folders
   * POST /api/folders/bulk
   */
  bulkOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: BulkFolderOperation = req.body;
      const performedBy = req.user?.id;

      if (!performedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(operation.folderIds) || operation.folderIds.length === 0) {
        throw new AppError('Folder IDs array is required', 400);
      }

      const result = await this.folderService.bulkOperation({
        ...operation,
        performedBy
      });

      res.json({
        success: true,
        data: result,
        message: `Bulk ${operation.action} completed successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export folders
   * GET /api/folders/export
   */
  exportFolders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format as string || 'csv';
      const filters: FolderFilters = {
        search: req.query.search as string,
        type: req.query.type as FolderType,
        status: req.query.status as FolderStatus,
        teamId: req.query.teamId as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const exportData = await this.folderService.exportFolders(filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=folders.csv');
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=folders.xlsx');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=folders.json');
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get folder history
   * GET /api/folders/:id/history
   */
  getFolderHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const history = await this.folderService.getFolderHistory(id, pagination);

      res.json({
        success: true,
        data: history.entries,
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
   * Get folders due for inspection
   * GET /api/folders/due
   */
  getFoldersDue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const daysAhead = parseInt(req.query.daysAhead as string) || 7;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const folders = await this.folderService.getFoldersDue(daysAhead, pagination);

      res.json({
        success: true,
        data: folders.folders,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: folders.total,
          pages: Math.ceil(folders.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const folderValidationSchemas = {
  createFolder: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    type: { required: true, type: 'string', enum: Object.values(FolderType) },
    parentId: { required: false, type: 'string' },
    teamId: { required: false, type: 'string' },
    tags: { required: false, type: 'array' },
    schedule: { required: false, type: 'object' },
    customFields: { required: false, type: 'object' }
  },
  updateFolder: {
    name: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    type: { required: false, type: 'string', enum: Object.values(FolderType) },
    status: { required: false, type: 'string', enum: Object.values(FolderStatus) },
    tags: { required: false, type: 'array' },
    customFields: { required: false, type: 'object' }
  },
  moveFolder: {
    parentId: { required: false, type: 'string' }
  },
  copyFolder: {
    parentId: { required: false, type: 'string' },
    name: { required: true, type: 'string', minLength: 1 },
    includeInspections: { required: false, type: 'boolean' }
  },
  setSchedule: {
    type: { required: true, type: 'string', enum: ['once', 'recurring'] },
    startDate: { required: true, type: 'date' },
    endDate: { required: false, type: 'date' },
    frequency: { required: false, type: 'string' },
    interval: { required: false, type: 'number' },
    daysOfWeek: { required: false, type: 'array' },
    daysOfMonth: { required: false, type: 'array' },
    timezone: { required: false, type: 'string' }
  },
  assignFolder: {
    userId: { required: false, type: 'string' },
    teamId: { required: false, type: 'string' },
    role: { required: false, type: 'string', enum: ['viewer', 'editor', 'admin'] }
  },
  unassignFolder: {
    userId: { required: false, type: 'string' },
    teamId: { required: false, type: 'string' }
  },
  createFromTemplate: {
    templateId: { required: true, type: 'string' },
    name: { required: true, type: 'string', minLength: 1 },
    parentId: { required: false, type: 'string' },
    customizations: { required: false, type: 'object' }
  },
  saveAsTemplate: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    category: { required: false, type: 'string' },
    isPublic: { required: false, type: 'boolean' }
  },
  bulkOperation: {
    action: { required: true, type: 'string', enum: ['update', 'delete', 'move', 'assign', 'unassign'] },
    folderIds: { required: true, type: 'array', minItems: 1 },
    data: { required: false, type: 'object' }
  }
};