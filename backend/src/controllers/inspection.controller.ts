/**
 * Inspection Controller
 * Handles HTTP requests for inspection management operations
 */

import { Request, Response, NextFunction } from 'express';
import { InspectionService } from '../services/inspection.service';
import { FileService } from '../services/file.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
  InspectionFilters,
  InspectionStatus,
  InspectionPriority,
  CompleteInspectionRequest,
  DuplicateInspectionRequest,
  BulkInspectionOperation
} from '../types/inspection';
import { PaginationQuery, SortQuery } from '../types/common';
import { UploadedFile } from '../types/file';

export class InspectionController {
  constructor(
    private inspectionService: InspectionService,
    private fileService: FileService
  ) {}

  /**
   * Get inspections with filtering and pagination
   * GET /api/inspections
   */
  getInspections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: InspectionFilters = {
        search: req.query.search as string,
        status: req.query.status as InspectionStatus,
        priority: req.query.priority as InspectionPriority,
        assignedTo: req.query.assignedTo as string,
        folderId: req.query.folderId as string,
        assetId: req.query.assetId as string,
        templateId: req.query.templateId as string,
        createdBy: req.query.createdBy as string,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        completedAfter: req.query.completedAfter ? new Date(req.query.completedAfter as string) : undefined,
        completedBefore: req.query.completedBefore ? new Date(req.query.completedBefore as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        hasIssues: req.query.hasIssues === 'true' ? true : req.query.hasIssues === 'false' ? false : undefined,
        scoreMin: req.query.scoreMin ? parseFloat(req.query.scoreMin as string) : undefined,
        scoreMax: req.query.scoreMax ? parseFloat(req.query.scoreMax as string) : undefined
      };

      const result = await this.inspectionService.getInspections(filters, pagination, sort);

      res.json({
        success: true,
        data: result.inspections,
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
   * Get inspection by ID
   * GET /api/inspections/:id
   */
  getInspectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const includeHistory = req.query.includeHistory === 'true';
      const includePhotos = req.query.includePhotos === 'true';
      
      const inspection = await this.inspectionService.getInspectionById(id, {
        includeHistory,
        includePhotos
      });

      if (!inspection) {
        throw new AppError('Inspection not found', 404);
      }

      res.json({
        success: true,
        data: inspection
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new inspection
   * POST /api/inspections
   */
  createInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inspectionData: CreateInspectionDTO = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.createInspection({
        ...inspectionData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: inspection,
        message: 'Inspection created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update inspection
   * PUT /api/inspections/:id
   */
  updateInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateInspectionDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.updateInspection(id, updateData, updatedBy);

      res.json({
        success: true,
        data: inspection,
        message: 'Inspection updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete inspection
   * DELETE /api/inspections/:id
   */
  deleteInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.inspectionService.deleteInspection(id, deletedBy);

      res.json({
        success: true,
        message: 'Inspection deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Complete inspection
   * POST /api/inspections/:id/complete
   */
  completeInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const completionData: CompleteInspectionRequest = req.body;
      const completedBy = req.user?.id;

      if (!completedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.completeInspection(id, {
        ...completionData,
        completedBy
      });

      res.json({
        success: true,
        data: inspection,
        message: 'Inspection completed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel inspection
   * POST /api/inspections/:id/cancel
   */
  cancelInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cancelledBy = req.user?.id;

      if (!cancelledBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.cancelInspection(id, reason, cancelledBy);

      res.json({
        success: true,
        data: inspection,
        message: 'Inspection cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicate inspection
   * POST /api/inspections/:id/duplicate
   */
  duplicateInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const duplicateData: DuplicateInspectionRequest = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.duplicateInspection(id, {
        ...duplicateData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: inspection,
        message: 'Inspection duplicated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload inspection photos
   * POST /api/inspections/:id/photos
   */
  uploadPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files as UploadedFile[];
      const uploadedBy = req.user?.id;

      if (!uploadedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const photos = await this.inspectionService.addPhotos(id, files, uploadedBy);

      res.json({
        success: true,
        data: photos,
        message: `${photos.length} photos uploaded successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete inspection photo
   * DELETE /api/inspections/:id/photos/:photoId
   */
  deletePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, photoId } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.inspectionService.removePhoto(id, photoId, deletedBy);

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inspection analytics
   * GET /api/inspections/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: InspectionFilters = {
        folderId: req.query.folderId as string,
        assetId: req.query.assetId as string,
        assignedTo: req.query.assignedTo as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const analytics = await this.inspectionService.getAnalytics(filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inspection statistics
   * GET /api/inspections/stats
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = req.query.period as string || '30d';
      const groupBy = req.query.groupBy as string || 'day';
      const filters: InspectionFilters = {
        folderId: req.query.folderId as string,
        assetId: req.query.assetId as string,
        assignedTo: req.query.assignedTo as string
      };

      const stats = await this.inspectionService.getStatistics(period, groupBy, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk operations on inspections
   * POST /api/inspections/bulk
   */
  bulkOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: BulkInspectionOperation = req.body;
      const performedBy = req.user?.id;

      if (!performedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(operation.inspectionIds) || operation.inspectionIds.length === 0) {
        throw new AppError('Inspection IDs array is required', 400);
      }

      const result = await this.inspectionService.bulkOperation({
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
   * Export inspections
   * GET /api/inspections/export
   */
  exportInspections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format as string || 'csv';
      const filters: InspectionFilters = {
        search: req.query.search as string,
        status: req.query.status as InspectionStatus,
        priority: req.query.priority as InspectionPriority,
        assignedTo: req.query.assignedTo as string,
        folderId: req.query.folderId as string,
        assetId: req.query.assetId as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const exportData = await this.inspectionService.exportInspections(filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inspections.csv');
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inspections.xlsx');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=inspections.json');
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inspection history
   * GET /api/inspections/:id/history
   */
  getInspectionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const history = await this.inspectionService.getInspectionHistory(id, pagination);

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
   * Get inspections by folder
   * GET /api/folders/:folderId/inspections
   */
  getInspectionsByFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folderId } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: InspectionFilters = {
        folderId,
        status: req.query.status as InspectionStatus,
        priority: req.query.priority as InspectionPriority,
        assignedTo: req.query.assignedTo as string
      };

      const result = await this.inspectionService.getInspections(filters, pagination, sort);

      res.json({
        success: true,
        data: result.inspections,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inspections by asset
   * GET /api/assets/:assetId/inspections
   */
  getInspectionsByAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assetId } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: InspectionFilters = {
        assetId,
        status: req.query.status as InspectionStatus,
        priority: req.query.priority as InspectionPriority
      };

      const result = await this.inspectionService.getInspections(filters, pagination, sort);

      res.json({
        success: true,
        data: result.inspections,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign inspection to user
   * POST /api/inspections/:id/assign
   */
  assignInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignedTo, notes } = req.body;
      const assignedBy = req.user?.id;

      if (!assignedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!assignedTo) {
        throw new AppError('Assigned user ID is required', 400);
      }

      const inspection = await this.inspectionService.assignInspection(id, assignedTo, assignedBy, notes);

      res.json({
        success: true,
        data: inspection,
        message: 'Inspection assigned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unassign inspection
   * POST /api/inspections/:id/unassign
   */
  unassignInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const unassignedBy = req.user?.id;

      if (!unassignedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const inspection = await this.inspectionService.unassignInspection(id, unassignedBy, notes);

      res.json({
        success: true,
        data: inspection,
        message: 'Inspection unassigned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my assigned inspections
   * GET /api/inspections/my-assignments
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

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'dueDate',
        order: req.query.sortOrder as 'asc' | 'desc' || 'asc'
      };

      const filters: InspectionFilters = {
        assignedTo: userId,
        status: req.query.status as InspectionStatus,
        priority: req.query.priority as InspectionPriority,
        folderId: req.query.folderId as string
      };

      const result = await this.inspectionService.getInspections(filters, pagination, sort);

      res.json({
        success: true,
        data: result.inspections,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const inspectionValidationSchemas = {
  createInspection: {
    title: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    templateId: { required: true, type: 'string' },
    assetId: { required: true, type: 'string' },
    folderId: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' },
    priority: { required: false, type: 'string', enum: Object.values(InspectionPriority) },
    dueDate: { required: false, type: 'date' },
    scheduledDate: { required: false, type: 'date' },
    tags: { required: false, type: 'array' },
    customFields: { required: false, type: 'object' }
  },
  updateInspection: {
    title: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' },
    priority: { required: false, type: 'string', enum: Object.values(InspectionPriority) },
    dueDate: { required: false, type: 'date' },
    scheduledDate: { required: false, type: 'date' },
    tags: { required: false, type: 'array' },
    customFields: { required: false, type: 'object' }
  },
  completeInspection: {
    responses: { required: true, type: 'array', minItems: 1 },
    notes: { required: false, type: 'string' },
    photos: { required: false, type: 'array' },
    signature: { required: false, type: 'string' },
    location: { required: false, type: 'object' }
  },
  duplicateInspection: {
    title: { required: false, type: 'string' },
    assetId: { required: false, type: 'string' },
    folderId: { required: false, type: 'string' },
    assignedTo: { required: false, type: 'string' },
    dueDate: { required: false, type: 'date' },
    includeResponses: { required: false, type: 'boolean' },
    includePhotos: { required: false, type: 'boolean' }
  },
  bulkOperation: {
    action: { required: true, type: 'string', enum: ['assign', 'unassign', 'delete', 'complete', 'cancel', 'update'] },
    inspectionIds: { required: true, type: 'array', minItems: 1 },
    data: { required: false, type: 'object' }
  },
  assignInspection: {
    assignedTo: { required: true, type: 'string' },
    notes: { required: false, type: 'string' }
  },
  cancelInspection: {
    reason: { required: true, type: 'string', minLength: 1 }
  }
};