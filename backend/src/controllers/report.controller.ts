/**
 * Report Controller
 * Handles HTTP requests for report generation and management operations
 */

import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateReportDTO,
  UpdateReportDTO,
  ReportFilters,
  ReportType,
  ReportFormat,
  ReportSchedule,
  BulkReportOperation,
  ReportAnalyticsFilters,
  ReportGenerationOptions
} from '../types/report';
import { PaginationQuery, SortQuery } from '../types/common';

export class ReportController {
  constructor(private reportService: ReportService) {}

  /**
   * Get reports with filtering and pagination
   * GET /api/reports
   */
  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: ReportFilters = {
        search: req.query.search as string,
        type: req.query.type as ReportType,
        status: req.query.status as string,
        createdBy: req.query.createdBy as string,
        format: req.query.format as ReportFormat,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        isScheduled: req.query.isScheduled === 'true' ? true : req.query.isScheduled === 'false' ? false : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        inspectionId: req.query.inspectionId as string,
        assetId: req.query.assetId as string,
        folderId: req.query.folderId as string
      };

      const result = await this.reportService.getReports(filters, pagination, sort);

      res.json({
        success: true,
        data: result.reports,
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
   * Get report by ID
   * GET /api/reports/:id
   */
  getReportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const includeContent = req.query.includeContent === 'true';
      const includeAnalytics = req.query.includeAnalytics === 'true';
      
      const report = await this.reportService.getReportById(id, {
        includeContent,
        includeAnalytics
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate new report
   * POST /api/reports/generate
   */
  generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reportData: CreateReportDTO = req.body;
      const generatedBy = req.user?.id;

      if (!generatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const options: ReportGenerationOptions = {
        async: req.query.async === 'true',
        priority: req.query.priority as 'low' | 'normal' | 'high' || 'normal',
        notifyOnComplete: req.query.notifyOnComplete === 'true'
      };

      const report = await this.reportService.generateReport({
        ...reportData,
        generatedBy
      }, options);

      const statusCode = options.async ? 202 : 201;
      const message = options.async ? 'Report generation started' : 'Report generated successfully';

      res.status(statusCode).json({
        success: true,
        data: report,
        message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update report
   * PUT /api/reports/:id
   */
  updateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateReportDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const report = await this.reportService.updateReport(id, updateData, updatedBy);

      res.json({
        success: true,
        data: report,
        message: 'Report updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete report
   * DELETE /api/reports/:id
   */
  deleteReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      const force = req.query.force === 'true';

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.reportService.deleteReport(id, deletedBy, force);

      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download report
   * GET /api/reports/:id/download
   */
  downloadReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const format = req.query.format as ReportFormat || 'pdf';
      
      const reportData = await this.reportService.downloadReport(id, format);

      if (!reportData) {
        throw new AppError('Report not found or not ready for download', 404);
      }

      // Set appropriate headers based on format
      const contentTypes = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        json: 'application/json',
        html: 'text/html'
      };

      const fileExtensions = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv',
        json: 'json',
        html: 'html'
      };

      res.setHeader('Content-Type', contentTypes[format]);
      res.setHeader('Content-Disposition', `attachment; filename=report-${id}.${fileExtensions[format]}`);
      res.send(reportData.content);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Preview report
   * GET /api/reports/:id/preview
   */
  previewReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const format = req.query.format as ReportFormat || 'html';
      
      const preview = await this.reportService.previewReport(id, format);

      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Share report
   * POST /api/reports/:id/share
   */
  shareReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { recipients, message, expiresAt, permissions } = req.body;
      const sharedBy = req.user?.id;

      if (!sharedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const shareResult = await this.reportService.shareReport(id, {
        recipients,
        message,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        permissions,
        sharedBy
      });

      res.json({
        success: true,
        data: shareResult,
        message: 'Report shared successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Schedule report generation
   * POST /api/reports/:id/schedule
   */
  scheduleReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const scheduleData: ReportSchedule = req.body;
      const scheduledBy = req.user?.id;

      if (!scheduledBy) {
        throw new AppError('User not authenticated', 401);
      }

      const schedule = await this.reportService.scheduleReport(id, {
        ...scheduleData,
        scheduledBy
      });

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Report scheduled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get report schedules
   * GET /api/reports/:id/schedules
   */
  getReportSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const schedules = await this.reportService.getReportSchedules(id);

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update report schedule
   * PUT /api/reports/:id/schedules/:scheduleId
   */
  updateReportSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, scheduleId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const schedule = await this.reportService.updateReportSchedule(
        id,
        scheduleId,
        updateData,
        updatedBy
      );

      res.json({
        success: true,
        data: schedule,
        message: 'Report schedule updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete report schedule
   * DELETE /api/reports/:id/schedules/:scheduleId
   */
  deleteReportSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, scheduleId } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.reportService.deleteReportSchedule(id, scheduleId, deletedBy);

      res.json({
        success: true,
        message: 'Report schedule deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get report analytics
   * GET /api/reports/analytics
   */
  getReportAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ReportAnalyticsFilters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        type: req.query.type as ReportType,
        createdBy: req.query.createdBy as string,
        status: req.query.status as string,
        format: req.query.format as ReportFormat
      };

      const analytics = await this.reportService.getReportAnalytics(filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get report templates
   * GET /api/reports/templates
   */
  getReportTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = req.query.type as ReportType;
      const category = req.query.category as string;
      
      const templates = await this.reportService.getReportTemplates({
        type,
        category
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create report template
   * POST /api/reports/templates
   */
  createReportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templateData = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.reportService.createReportTemplate({
        ...templateData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Report template created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update report template
   * PUT /api/reports/templates/:id
   */
  updateReportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.reportService.updateReportTemplate(id, updateData, updatedBy);

      res.json({
        success: true,
        data: template,
        message: 'Report template updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete report template
   * DELETE /api/reports/templates/:id
   */
  deleteReportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.reportService.deleteReportTemplate(id, deletedBy);

      res.json({
        success: true,
        message: 'Report template deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicate report
   * POST /api/reports/:id/duplicate
   */
  duplicateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const duplicatedBy = req.user?.id;

      if (!duplicatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const report = await this.reportService.duplicateReport(id, {
        name,
        description,
        duplicatedBy
      });

      res.status(201).json({
        success: true,
        data: report,
        message: 'Report duplicated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get report generation status
   * GET /api/reports/:id/status
   */
  getReportStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const status = await this.reportService.getReportStatus(id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel report generation
   * POST /api/reports/:id/cancel
   */
  cancelReportGeneration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const cancelledBy = req.user?.id;

      if (!cancelledBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.reportService.cancelReportGeneration(id, cancelledBy);

      res.json({
        success: true,
        message: 'Report generation cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Regenerate report
   * POST /api/reports/:id/regenerate
   */
  regenerateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const regeneratedBy = req.user?.id;
      const options = req.body;

      if (!regeneratedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const report = await this.reportService.regenerateReport(id, {
        ...options,
        regeneratedBy
      });

      res.json({
        success: true,
        data: report,
        message: 'Report regeneration started'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export reports
   * GET /api/reports/export
   */
  exportReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format as string || 'csv';
      const filters: ReportFilters = {
        search: req.query.search as string,
        type: req.query.type as ReportType,
        status: req.query.status as string,
        createdBy: req.query.createdBy as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const exportData = await this.reportService.exportReports(filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.json');
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk operations on reports
   * POST /api/reports/bulk
   */
  bulkOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: BulkReportOperation = req.body;
      const performedBy = req.user?.id;

      if (!performedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(operation.reportIds) || operation.reportIds.length === 0) {
        throw new AppError('Report IDs array is required', 400);
      }

      const result = await this.reportService.bulkOperation({
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
   * Get report history
   * GET /api/reports/:id/history
   */
  getReportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const history = await this.reportService.getReportHistory(id, pagination);

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
}

// Validation schemas for request bodies
export const reportValidationSchemas = {
  generateReport: {
    name: { required: true, type: 'string', minLength: 1 },
    type: { required: true, type: 'string', enum: ['inspection', 'asset', 'compliance', 'performance', 'custom'] },
    format: { required: false, type: 'string', enum: ['pdf', 'excel', 'csv', 'json', 'html'] },
    parameters: { required: true, type: 'object' },
    description: { required: false, type: 'string' },
    tags: { required: false, type: 'array' },
    templateId: { required: false, type: 'string' }
  },
  updateReport: {
    name: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    tags: { required: false, type: 'array' },
    parameters: { required: false, type: 'object' }
  },
  shareReport: {
    recipients: { required: true, type: 'array', minItems: 1 },
    message: { required: false, type: 'string' },
    expiresAt: { required: false, type: 'string' },
    permissions: { required: false, type: 'array' }
  },
  scheduleReport: {
    name: { required: true, type: 'string', minLength: 1 },
    cronExpression: { required: true, type: 'string' },
    isActive: { required: false, type: 'boolean' },
    recipients: { required: false, type: 'array' },
    format: { required: false, type: 'string', enum: ['pdf', 'excel', 'csv', 'json', 'html'] },
    parameters: { required: false, type: 'object' }
  },
  createReportTemplate: {
    name: { required: true, type: 'string', minLength: 1 },
    type: { required: true, type: 'string', enum: ['inspection', 'asset', 'compliance', 'performance', 'custom'] },
    description: { required: false, type: 'string' },
    template: { required: true, type: 'object' },
    category: { required: false, type: 'string' },
    isPublic: { required: false, type: 'boolean' }
  },
  updateReportTemplate: {
    name: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    template: { required: false, type: 'object' },
    category: { required: false, type: 'string' },
    isPublic: { required: false, type: 'boolean' }
  },
  duplicateReport: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' }
  },
  regenerateReport: {
    format: { required: false, type: 'string', enum: ['pdf', 'excel', 'csv', 'json', 'html'] },
    parameters: { required: false, type: 'object' },
    async: { required: false, type: 'boolean' }
  },
  bulkOperation: {
    action: { required: true, type: 'string', enum: ['delete', 'regenerate', 'share', 'export'] },
    reportIds: { required: true, type: 'array', minItems: 1 },
    data: { required: false, type: 'object' }
  }
};