/**
 * Report Service
 * Handles AI-generated comprehensive reports and report management
 */

import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../types/errors';
import {
  Report,
  CreateReportDTO,
  UpdateReportDTO,
  ReportFilter,
  ReportTemplate,
  ReportSection,
  ReportFormat,
  ReportStatus,
  ReportType,
  ReportAnalytics,
  ReportExportOptions,
  ReportSchedule,
  ReportDistribution
} from '../types/report';
import { Inspection, InspectionResponse, Asset, User } from '../types';
import { DefectAnalysis } from '../types/ai';
import { ReportRepository } from '../repositories/report.repository';
import { InspectionRepository } from '../repositories/inspection.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AIService } from './ai.service';
import { FileService } from './file.service';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';
import { ChartService } from './chart.service';
import { PDFService } from './pdf.service';
import puppeteer from 'puppeteer';
import * as XLSX from 'xlsx';
import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';

export interface ReportGenerationContext {
  inspection: Inspection;
  responses: InspectionResponse[];
  defectAnalyses: DefectAnalysis[];
  asset?: Asset;
  inspector?: User;
  template: ReportTemplate;
  format: ReportFormat;
  options: ReportExportOptions;
}

export interface ReportMetrics {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  averageGenerationTime: number;
  popularTemplates: Array<{ templateId: string; count: number }>;
  recentActivity: Array<{
    date: Date;
    generated: number;
    exported: number;
  }>;
}

export interface BulkReportRequest {
  inspectionIds: string[];
  templateId: string;
  format: ReportFormat;
  options: ReportExportOptions;
  distribution?: ReportDistribution;
}

export class ReportService {
  constructor(
    private reportRepository: ReportRepository,
    private inspectionRepository: InspectionRepository,
    private assetRepository: AssetRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository,
    private aiService: AIService,
    private fileService: FileService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private templateService: TemplateService,
    private chartService: ChartService,
    private pdfService: PDFService
  ) {}

  /**
   * Generate a new report
   */
  async generateReport(
    data: CreateReportDTO,
    userId: string
  ): Promise<Report> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting report generation', {
        inspectionId: data.inspectionId,
        templateId: data.templateId,
        format: data.format,
        userId
      });

      // Validate inputs
      await this.validateReportRequest(data);

      // Get inspection data
      const inspection = await this.inspectionRepository.findById(data.inspectionId);
      if (!inspection) {
        throw new AppError(
          'Inspection not found',
          404,
          ErrorCodes.INSPECTION_NOT_FOUND
        );
      }

      // Get template
      const template = await this.templateService.getTemplate(data.templateId);
      if (!template) {
        throw new AppError(
          'Report template not found',
          404,
          ErrorCodes.TEMPLATE_NOT_FOUND
        );
      }

      // Create report record
      const report = await this.reportRepository.create({
        id: `report_${Date.now()}`,
        inspectionId: data.inspectionId,
        templateId: data.templateId,
        name: data.name || `${inspection.name} Report`,
        type: data.type || ReportType.INSPECTION,
        format: data.format,
        status: ReportStatus.GENERATING,
        generatedBy: userId,
        metadata: {
          inspectionName: inspection.name,
          assetId: inspection.assetId,
          templateName: template.name,
          requestedAt: new Date(),
          options: data.options || {}
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Generate report content asynchronously
      this.generateReportContent(report, data, userId)
        .catch(error => {
          logger.error('Report generation failed', {
            reportId: report.id,
            error: error.message
          });
          this.handleGenerationFailure(report.id, error);
        });

      logger.info('Report generation initiated', {
        reportId: report.id,
        inspectionId: data.inspectionId,
        initTime: Date.now() - startTime
      });

      return report;
    } catch (error) {
      logger.error('Report generation initiation failed', {
        inspectionId: data.inspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string, userId: string): Promise<Report | null> {
    try {
      const report = await this.reportRepository.findById(id);
      
      if (!report) {
        return null;
      }

      // Check access permissions
      await this.checkReportAccess(report, userId);

      return report;
    } catch (error) {
      logger.error('Get report by ID failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Get reports with filtering
   */
  async getReports(
    filter: ReportFilter,
    userId: string
  ): Promise<{
    reports: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      logger.debug('Getting reports with filter', { filter, userId });

      // Add user access filter
      const accessFilter = await this.addUserAccessFilter(filter, userId);

      const result = await this.reportRepository.findMany(accessFilter);

      return {
        reports: result.reports,
        total: result.total,
        page: filter.page || 1,
        limit: filter.limit || 20
      };
    } catch (error) {
      logger.error('Get reports failed', { filter, userId, error });
      throw new AppError(
        'Failed to retrieve reports',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update report
   */
  async updateReport(
    id: string,
    data: UpdateReportDTO,
    userId: string
  ): Promise<Report> {
    try {
      logger.info('Updating report', { id, userId });

      const existingReport = await this.reportRepository.findById(id);
      if (!existingReport) {
        throw new AppError(
          'Report not found',
          404,
          ErrorCodes.REPORT_NOT_FOUND
        );
      }

      // Check permissions
      await this.checkReportAccess(existingReport, userId);

      // Validate update data
      await this.validateReportUpdate(data, existingReport);

      // Track changes
      const changes = this.trackReportChanges(existingReport, data);

      // Update report
      const updatedReport = await this.reportRepository.update(id, {
        ...data,
        updatedAt: new Date(),
        updatedBy: userId
      });

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'report',
        entityId: id,
        action: 'update',
        userId,
        changes,
        timestamp: new Date()
      });

      logger.info('Report updated successfully', { id, userId });
      return updatedReport;
    } catch (error) {
      logger.error('Update report failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(id: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting report', { id, userId });

      const report = await this.reportRepository.findById(id);
      if (!report) {
        throw new AppError(
          'Report not found',
          404,
          ErrorCodes.REPORT_NOT_FOUND
        );
      }

      // Check permissions
      await this.checkReportAccess(report, userId);

      // Delete associated files
      if (report.filePath) {
        await this.fileService.deleteFile(report.filePath);
      }

      // Soft delete report
      await this.reportRepository.softDelete(id, userId);

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'report',
        entityId: id,
        action: 'delete',
        userId,
        timestamp: new Date()
      });

      logger.info('Report deleted successfully', { id, userId });
    } catch (error) {
      logger.error('Delete report failed', { id, userId, error });
      throw error;
    }
  }

  /**
   * Export report in specified format
   */
  async exportReport(
    id: string,
    format: ReportFormat,
    options: ReportExportOptions,
    userId: string
  ): Promise<{
    filePath: string;
    fileName: string;
    mimeType: string;
  }> {
    try {
      logger.info('Exporting report', { id, format, userId });

      const report = await this.reportRepository.findById(id);
      if (!report) {
        throw new AppError(
          'Report not found',
          404,
          ErrorCodes.REPORT_NOT_FOUND
        );
      }

      // Check permissions
      await this.checkReportAccess(report, userId);

      if (report.status !== ReportStatus.COMPLETED) {
        throw new AppError(
          'Report is not ready for export',
          400,
          ErrorCodes.REPORT_NOT_READY
        );
      }

      // Generate export based on format
      let exportResult;
      switch (format) {
        case ReportFormat.PDF:
          exportResult = await this.exportToPDF(report, options);
          break;
        case ReportFormat.EXCEL:
          exportResult = await this.exportToExcel(report, options);
          break;
        case ReportFormat.WORD:
          exportResult = await this.exportToWord(report, options);
          break;
        case ReportFormat.HTML:
          exportResult = await this.exportToHTML(report, options);
          break;
        default:
          throw new AppError(
            'Unsupported export format',
            400,
            ErrorCodes.INVALID_FORMAT
          );
      }

      // Update export count
      await this.reportRepository.incrementExportCount(id);

      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'report',
        entityId: id,
        action: 'export',
        userId,
        metadata: { format, options },
        timestamp: new Date()
      });

      logger.info('Report exported successfully', {
        id,
        format,
        fileName: exportResult.fileName,
        userId
      });

      return exportResult;
    } catch (error) {
      logger.error('Export report failed', { id, format, userId, error });
      throw error;
    }
  }

  /**
   * Generate bulk reports
   */
  async generateBulkReports(
    request: BulkReportRequest,
    userId: string
  ): Promise<{
    batchId: string;
    reports: Report[];
  }> {
    try {
      logger.info('Starting bulk report generation', {
        inspectionCount: request.inspectionIds.length,
        templateId: request.templateId,
        userId
      });

      const batchId = `batch_${Date.now()}`;
      const reports: Report[] = [];

      // Validate inspections exist
      const inspections = await this.inspectionRepository.findByIds(request.inspectionIds);
      if (inspections.length !== request.inspectionIds.length) {
        throw new AppError(
          'Some inspections not found',
          404,
          ErrorCodes.INSPECTION_NOT_FOUND
        );
      }

      // Generate reports for each inspection
      for (const inspection of inspections) {
        try {
          const reportData: CreateReportDTO = {
            inspectionId: inspection.id,
            templateId: request.templateId,
            name: `${inspection.name} Report`,
            type: ReportType.INSPECTION,
            format: request.format,
            options: request.options
          };

          const report = await this.generateReport(reportData, userId);
          reports.push(report);
        } catch (error) {
          logger.error('Failed to generate report for inspection', {
            inspectionId: inspection.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          // Continue with other reports
        }
      }

      // Handle distribution if specified
      if (request.distribution) {
        this.handleBulkReportDistribution(batchId, reports, request.distribution, userId)
          .catch(error => {
            logger.error('Bulk report distribution failed', {
              batchId,
              error: error.message
            });
          });
      }

      logger.info('Bulk report generation completed', {
        batchId,
        successCount: reports.length,
        totalRequested: request.inspectionIds.length,
        userId
      });

      return { batchId, reports };
    } catch (error) {
      logger.error('Bulk report generation failed', {
        inspectionCount: request.inspectionIds.length,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get report analytics
   */
  async getReportAnalytics(
    filter: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      teamId?: string;
    },
    userId: string
  ): Promise<ReportAnalytics> {
    try {
      logger.debug('Getting report analytics', { filter, userId });

      const analytics = await this.reportRepository.getAnalytics(filter);

      return {
        totalReports: analytics.totalReports,
        reportsByType: analytics.reportsByType,
        reportsByStatus: analytics.reportsByStatus,
        reportsByFormat: analytics.reportsByFormat,
        averageGenerationTime: analytics.averageGenerationTime,
        popularTemplates: analytics.popularTemplates,
        generationTrends: analytics.generationTrends,
        exportStats: analytics.exportStats,
        userActivity: analytics.userActivity,
        performanceMetrics: analytics.performanceMetrics
      };
    } catch (error) {
      logger.error('Get report analytics failed', { filter, userId, error });
      throw new AppError(
        'Failed to retrieve report analytics',
        500,
        ErrorCodes.DATABASE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Schedule recurring report generation
   */
  async scheduleReport(
    schedule: ReportSchedule,
    userId: string
  ): Promise<ReportSchedule> {
    try {
      logger.info('Scheduling report', {
        templateId: schedule.templateId,
        frequency: schedule.frequency,
        userId
      });

      // Validate schedule data
      await this.validateReportSchedule(schedule);

      // Create schedule record
      const createdSchedule = await this.reportRepository.createSchedule({
        ...schedule,
        id: `schedule_${Date.now()}`,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Set up cron job or scheduler
      await this.setupReportScheduler(createdSchedule);

      logger.info('Report scheduled successfully', {
        scheduleId: createdSchedule.id,
        userId
      });

      return createdSchedule;
    } catch (error) {
      logger.error('Schedule report failed', { schedule, userId, error });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async generateReportContent(
    report: Report,
    data: CreateReportDTO,
    userId: string
  ): Promise<void> {
    try {
      // Update status to generating
      await this.reportRepository.updateStatus(report.id, ReportStatus.GENERATING);

      // Gather all required data
      const context = await this.gatherReportContext(report, data);

      // Generate content using AI service
      const content = await this.aiService.generateInspectionReport({
        inspection: context.inspection,
        responses: context.responses,
        defectAnalyses: context.defectAnalyses,
        templateId: data.templateId,
        format: data.format,
        provider: data.options?.aiProvider
      });

      // Process and format content
      const processedContent = await this.processReportContent(
        content,
        context,
        data.format
      );

      // Save content to file
      const filePath = await this.saveReportContent(
        report.id,
        processedContent,
        data.format
      );

      // Update report with content and file path
      await this.reportRepository.update(report.id, {
        content: processedContent,
        filePath,
        status: ReportStatus.COMPLETED,
        completedAt: new Date(),
        metadata: {
          ...report.metadata,
          generationTime: Date.now() - report.createdAt.getTime(),
          contentLength: processedContent.length
        }
      });

      // Send notification
      await this.notificationService.notifyReportGenerated(report.id, userId);

      logger.info('Report content generated successfully', {
        reportId: report.id,
        contentLength: processedContent.length
      });
    } catch (error) {
      logger.error('Report content generation failed', {
        reportId: report.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      await this.handleGenerationFailure(report.id, error);
      throw error;
    }
  }

  private async gatherReportContext(
    report: Report,
    data: CreateReportDTO
  ): Promise<ReportGenerationContext> {
    // Get inspection
    const inspection = await this.inspectionRepository.findById(report.inspectionId);
    if (!inspection) {
      throw new AppError(
        'Inspection not found',
        404,
        ErrorCodes.INSPECTION_NOT_FOUND
      );
    }

    // Get inspection responses
    const responses = await this.inspectionRepository.getResponses(report.inspectionId);

    // Get defect analyses
    const defectAnalyses = await this.inspectionRepository.getDefectAnalyses(report.inspectionId);

    // Get asset information
    let asset: Asset | undefined;
    if (inspection.assetId) {
      asset = await this.assetRepository.findById(inspection.assetId) || undefined;
    }

    // Get inspector information
    let inspector: User | undefined;
    if (inspection.assignedTo) {
      inspector = await this.userRepository.findById(inspection.assignedTo) || undefined;
    }

    // Get template
    const template = await this.templateService.getTemplate(data.templateId);
    if (!template) {
      throw new AppError(
        'Report template not found',
        404,
        ErrorCodes.TEMPLATE_NOT_FOUND
      );
    }

    return {
      inspection,
      responses,
      defectAnalyses,
      asset,
      inspector,
      template,
      format: data.format,
      options: data.options || {}
    };
  }

  private async processReportContent(
    content: string,
    context: ReportGenerationContext,
    format: ReportFormat
  ): Promise<string> {
    let processedContent = content;

    // Add charts if requested
    if (context.options.includeCharts) {
      processedContent = await this.addChartsToContent(
        processedContent,
        context
      );
    }

    // Add images if requested
    if (context.options.includeImages) {
      processedContent = await this.addImagesToContent(
        processedContent,
        context
      );
    }

    // Format based on output format
    switch (format) {
      case ReportFormat.HTML:
        processedContent = await this.formatAsHTML(processedContent);
        break;
      case ReportFormat.MARKDOWN:
        // Already in markdown format
        break;
      case ReportFormat.PDF:
        processedContent = await this.formatForPDF(processedContent);
        break;
      default:
        // Keep as is
        break;
    }

    return processedContent;
  }

  private async saveReportContent(
    reportId: string,
    content: string,
    format: ReportFormat
  ): Promise<string> {
    const fileName = `report_${reportId}.${this.getFileExtension(format)}`;
    const filePath = path.join('reports', fileName);
    
    await this.fileService.saveFile(filePath, content);
    
    return filePath;
  }

  private async handleGenerationFailure(
    reportId: string,
    error: any
  ): Promise<void> {
    try {
      await this.reportRepository.update(reportId, {
        status: ReportStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date()
      });

      // Notify user of failure
      const report = await this.reportRepository.findById(reportId);
      if (report?.generatedBy) {
        await this.notificationService.notifyReportFailed(reportId, report.generatedBy);
      }
    } catch (updateError) {
      logger.error('Failed to update report failure status', {
        reportId,
        updateError
      });
    }
  }

  private async validateReportRequest(data: CreateReportDTO): Promise<void> {
    if (!data.inspectionId) {
      throw new AppError(
        'Inspection ID is required',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!data.templateId) {
      throw new AppError(
        'Template ID is required',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!Object.values(ReportFormat).includes(data.format)) {
      throw new AppError(
        'Invalid report format',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }

  private async validateReportUpdate(
    data: UpdateReportDTO,
    existingReport: Report
  ): Promise<void> {
    if (data.status && !Object.values(ReportStatus).includes(data.status)) {
      throw new AppError(
        'Invalid report status',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (existingReport.status === ReportStatus.GENERATING && data.status === ReportStatus.COMPLETED) {
      throw new AppError(
        'Cannot manually mark generating report as completed',
        400,
        ErrorCodes.INVALID_OPERATION
      );
    }
  }

  private async validateReportSchedule(schedule: ReportSchedule): Promise<void> {
    if (!schedule.templateId) {
      throw new AppError(
        'Template ID is required for scheduled reports',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!schedule.frequency) {
      throw new AppError(
        'Frequency is required for scheduled reports',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (schedule.startDate && schedule.startDate < new Date()) {
      throw new AppError(
        'Start date cannot be in the past',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }

  private async checkReportAccess(report: Report, userId: string): Promise<void> {
    // Check if user has access to the report
    // This would typically check team membership, permissions, etc.
    // For now, allow access if user is the generator or has admin role
    if (report.generatedBy !== userId) {
      const user = await this.userRepository.findById(userId);
      if (!user || !user.permissions.includes('reports:read')) {
        throw new AppError(
          'Access denied',
          403,
          ErrorCodes.ACCESS_DENIED
        );
      }
    }
  }

  private async addUserAccessFilter(
    filter: ReportFilter,
    userId: string
  ): Promise<ReportFilter> {
    // Add user access restrictions to filter
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }

    // If user has admin permissions, return filter as is
    if (user.permissions.includes('reports:read_all')) {
      return filter;
    }

    // Otherwise, restrict to user's own reports and team reports
    return {
      ...filter,
      accessFilter: {
        userId,
        teamId: user.teamId
      }
    };
  }

  private trackReportChanges(existing: Report, updates: UpdateReportDTO): Record<string, any> {
    const changes: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const oldValue = (existing as any)[key];
      const newValue = (updates as any)[key];
      
      if (oldValue !== newValue) {
        changes[key] = { from: oldValue, to: newValue };
      }
    });
    
    return changes;
  }

  private async exportToPDF(
    report: Report,
    options: ReportExportOptions
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const fileName = `${report.name}_${Date.now()}.pdf`;
    const filePath = await this.pdfService.generatePDF(report.content!, {
      ...options,
      fileName
    });
    
    return {
      filePath,
      fileName,
      mimeType: 'application/pdf'
    };
  }

  private async exportToExcel(
    report: Report,
    options: ReportExportOptions
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    // Convert report content to Excel format
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Report Name', report.name],
      ['Generated', report.createdAt.toLocaleDateString()],
      ['Content', report.content || '']
    ]);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    const fileName = `${report.name}_${Date.now()}.xlsx`;
    const filePath = path.join('exports', fileName);
    
    XLSX.writeFile(workbook, filePath);
    
    return {
      filePath,
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  private async exportToWord(
    report: Report,
    options: ReportExportOptions
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    // This would typically use a library like docx to generate Word documents
    // For now, we'll export as HTML with Word-compatible formatting
    const htmlContent = await this.formatAsHTML(report.content || '');
    
    const fileName = `${report.name}_${Date.now()}.doc`;
    const filePath = path.join('exports', fileName);
    
    await fs.writeFile(filePath, htmlContent);
    
    return {
      filePath,
      fileName,
      mimeType: 'application/msword'
    };
  }

  private async exportToHTML(
    report: Report,
    options: ReportExportOptions
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const htmlContent = await this.formatAsHTML(report.content || '');
    
    const fileName = `${report.name}_${Date.now()}.html`;
    const filePath = path.join('exports', fileName);
    
    await fs.writeFile(filePath, htmlContent);
    
    return {
      filePath,
      fileName,
      mimeType: 'text/html'
    };
  }

  private async formatAsHTML(content: string): Promise<string> {
    // Convert markdown to HTML
    const htmlContent = marked(content);
    
    // Wrap in HTML document structure
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inspection Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1, h2, h3 { color: #333; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }

  private async formatForPDF(content: string): Promise<string> {
    // Add PDF-specific formatting
    return content;
  }

  private async addChartsToContent(
    content: string,
    context: ReportGenerationContext
  ): Promise<string> {
    // Generate charts based on inspection data
    const charts = await this.chartService.generateInspectionCharts(context);
    
    // Insert charts into content
    let updatedContent = content;
    charts.forEach(chart => {
      updatedContent += `\n\n![${chart.title}](${chart.imagePath})\n`;
    });
    
    return updatedContent;
  }

  private async addImagesToContent(
    content: string,
    context: ReportGenerationContext
  ): Promise<string> {
    // Add inspection photos to content
    let updatedContent = content;
    
    if (context.inspection.photos && context.inspection.photos.length > 0) {
      updatedContent += '\n\n## Inspection Photos\n\n';
      
      context.inspection.photos.forEach(photo => {
        updatedContent += `![Inspection Photo](${photo.url})\n\n`;
        if (photo.caption) {
          updatedContent += `*${photo.caption}*\n\n`;
        }
      });
    }
    
    return updatedContent;
  }

  private getFileExtension(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.PDF:
        return 'pdf';
      case ReportFormat.HTML:
        return 'html';
      case ReportFormat.MARKDOWN:
        return 'md';
      case ReportFormat.EXCEL:
        return 'xlsx';
      case ReportFormat.WORD:
        return 'docx';
      default:
        return 'txt';
    }
  }

  private async setupReportScheduler(schedule: ReportSchedule): Promise<void> {
    // This would typically integrate with a job scheduler like node-cron
    // For now, we'll just log the schedule setup
    logger.info('Report scheduler setup', {
      scheduleId: schedule.id,
      frequency: schedule.frequency
    });
  }

  private async handleBulkReportDistribution(
    batchId: string,
    reports: Report[],
    distribution: ReportDistribution,
    userId: string
  ): Promise<void> {
    try {
      // Wait for all reports to complete
      const completedReports = await this.waitForReportsCompletion(reports);
      
      // Send via email if specified
      if (distribution.email && distribution.email.length > 0) {
        await this.emailService.sendBulkReports(
          completedReports,
          distribution.email,
          {
            subject: `Bulk Inspection Reports - Batch ${batchId}`,
            message: distribution.message
          }
        );
      }
      
      // Additional distribution methods can be added here
      
      logger.info('Bulk report distribution completed', {
        batchId,
        reportCount: completedReports.length,
        emailRecipients: distribution.email?.length || 0
      });
    } catch (error) {
      logger.error('Bulk report distribution failed', {
        batchId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async waitForReportsCompletion(reports: Report[]): Promise<Report[]> {
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const checkInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const updatedReports = await Promise.all(
        reports.map(report => this.reportRepository.findById(report.id))
      );
      
      const completedReports = updatedReports.filter(
        report => report && report.status === ReportStatus.COMPLETED
      ) as Report[];
      
      if (completedReports.length === reports.length) {
        return completedReports;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    // Return whatever reports are completed
    const finalReports = await Promise.all(
      reports.map(report => this.reportRepository.findById(report.id))
    );
    
    return finalReports.filter(
      report => report && report.status === ReportStatus.COMPLETED
    ) as Report[];
  }
}