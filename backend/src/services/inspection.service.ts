/**
 * Inspection Service
 * Handles core inspection process with responses, photos, and workflow management
 */

import { InspectionRepository } from '../repositories/inspection.repository';
import { FormTemplateRepository } from '../repositories/form-template.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { FolderRepository } from '../repositories/folder.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  Inspection,
  CreateInspectionDTO,
  UpdateInspectionDTO,
  InspectionStatus,
  InspectionPriority,
  InspectionResponse,
  InspectionPhoto,
  InspectionScore,
  InspectionStatistics,
  InspectionAnalytics,
  InspectionWorkflow
} from '../types/inspection';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { NotificationService } from './notification.service';
import { AIService } from './ai.service';
import { FileService } from './file.service';
import { ReportService } from './report.service';

export interface InspectionSearchFilters {
  search?: string;
  status?: InspectionStatus;
  priority?: InspectionPriority;
  folderId?: string;
  assetId?: string;
  formTemplateId?: string;
  assignedTo?: string;
  createdBy?: string;
  inspectorId?: string;
  department?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  completedAfter?: Date;
  completedBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  isOverdue?: boolean;
  hasIssues?: boolean;
  scoreRange?: {
    min: number;
    max: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
}

export interface InspectionBulkOperation {
  inspectionIds: string[];
  operation: 'assign' | 'reassign' | 'complete' | 'cancel' | 'archive' | 'delete' | 'updateStatus' | 'addTags' | 'removeTags';
  data?: {
    assignedTo?: string;
    status?: InspectionStatus;
    tags?: string[];
    notes?: string;
  };
}

export interface InspectionCompletion {
  inspectionId: string;
  responses: InspectionResponse[];
  photos?: InspectionPhoto[];
  notes?: string;
  completedAt?: Date;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  signature?: {
    inspectorName: string;
    signatureData: string; // base64 encoded signature
    timestamp: Date;
  };
}

export interface InspectionDuplication {
  sourceInspectionId: string;
  targetAssetId?: string;
  targetFolderId?: string;
  scheduledDate?: Date;
  assignedTo?: string;
  copyResponses?: boolean;
  copyPhotos?: boolean;
}

export interface InspectionTemplate {
  name: string;
  description?: string;
  formTemplateId: string;
  defaultPriority?: InspectionPriority;
  defaultDuration?: number; // minutes
  requiredPhotos?: string[]; // photo types
  workflow?: InspectionWorkflow;
  tags?: string[];
}

export class InspectionService {
  private inspectionRepository: InspectionRepository;
  private formTemplateRepository: FormTemplateRepository;
  private assetRepository: AssetRepository;
  private folderRepository: FolderRepository;
  private auditLogRepository: AuditLogRepository;
  private notificationService: NotificationService;
  private aiService: AIService;
  private fileService: FileService;
  private reportService: ReportService;

  constructor(
    inspectionRepository: InspectionRepository,
    formTemplateRepository: FormTemplateRepository,
    assetRepository: AssetRepository,
    folderRepository: FolderRepository,
    auditLogRepository: AuditLogRepository,
    notificationService: NotificationService,
    aiService: AIService,
    fileService: FileService,
    reportService: ReportService
  ) {
    this.inspectionRepository = inspectionRepository;
    this.formTemplateRepository = formTemplateRepository;
    this.assetRepository = assetRepository;
    this.folderRepository = folderRepository;
    this.auditLogRepository = auditLogRepository;
    this.notificationService = notificationService;
    this.aiService = aiService;
    this.fileService = fileService;
    this.reportService = reportService;
  }

  /**
   * Create a new inspection
   */
  async createInspection(
    inspectionData: CreateInspectionDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<Inspection> {
    try {
      // Validate form template
      const formTemplate = await this.formTemplateRepository.findById(inspectionData.formTemplateId);
      if (!formTemplate) {
        throw new AppError(
          'Form template not found',
          404,
          ErrorCodes.FORM_TEMPLATE_NOT_FOUND
        );
      }

      if (!formTemplate.isActive) {
        throw new AppError(
          'Form template is not active',
          400,
          ErrorCodes.FORM_TEMPLATE_INACTIVE
        );
      }

      // Validate asset if specified
      if (inspectionData.assetId) {
        const asset = await this.assetRepository.findById(inspectionData.assetId);
        if (!asset) {
          throw new AppError(
            'Asset not found',
            404,
            ErrorCodes.ASSET_NOT_FOUND
          );
        }

        if (!asset.isActive) {
          throw new AppError(
            'Asset is not active',
            400,
            ErrorCodes.ASSET_INACTIVE
          );
        }
      }

      // Validate folder
      const folder = await this.folderRepository.findById(inspectionData.folderId);
      if (!folder) {
        throw new AppError(
          'Folder not found',
          404,
          ErrorCodes.FOLDER_NOT_FOUND
        );
      }

      if (!folder.isActive) {
        throw new AppError(
          'Folder is not active',
          400,
          ErrorCodes.FOLDER_INACTIVE
        );
      }

      // Generate inspection ID
      const inspectionId = await this.generateInspectionId(inspectionData.folderId);

      // Create inspection
      const inspection = await this.inspectionRepository.create({
        ...inspectionData,
        inspectionId,
        createdBy,
        status: inspectionData.status || InspectionStatus.SCHEDULED,
        priority: inspectionData.priority || InspectionPriority.MEDIUM
      });

      // Initialize workflow if specified
      if (inspectionData.workflow) {
        await this.initializeInspectionWorkflow(inspection.id, inspectionData.workflow, createdBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: createdBy,
        action: 'INSPECTION_CREATED',
        entityType: 'inspection',
        entityId: inspection.id,
        details: {
          inspectionId: inspection.inspectionId,
          formTemplateId: inspection.formTemplateId,
          assetId: inspection.assetId,
          folderId: inspection.folderId,
          assignedTo: inspection.assignedTo,
          scheduledDate: inspection.scheduledDate,
          priority: inspection.priority
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      // Send notification to assigned inspector
      if (inspection.assignedTo) {
        await this.notificationService.sendInspectionAssignmentNotification(
          inspection.assignedTo,
          inspection,
          createdBy
        );
      }

      // Update asset last inspection date if applicable
      if (inspection.assetId) {
        await this.assetRepository.updateLastInspectionDate(inspection.assetId, new Date());
      }

      logger.info('Inspection created successfully', {
        inspectionId: inspection.id,
        inspectionNumber: inspection.inspectionId,
        formTemplateId: inspection.formTemplateId,
        assetId: inspection.assetId,
        folderId: inspection.folderId,
        createdBy
      });

      return inspection;
    } catch (error) {
      logger.error('Inspection creation failed', {
        inspectionData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get inspection by ID
   */
  async getInspectionById(inspectionId: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new AppError(
        'Inspection not found',
        404,
        ErrorCodes.INSPECTION_NOT_FOUND
      );
    }
    return inspection;
  }

  /**
   * Get inspection by inspection ID (business ID)
   */
  async getInspectionByInspectionId(inspectionId: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findByInspectionId(inspectionId);
    if (!inspection) {
      throw new AppError(
        'Inspection not found',
        404,
        ErrorCodes.INSPECTION_NOT_FOUND
      );
    }
    return inspection;
  }

  /**
   * Update inspection
   */
  async updateInspection(
    inspectionId: string,
    updateData: UpdateInspectionDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<Inspection> {
    try {
      // Check if inspection exists
      const existingInspection = await this.getInspectionById(inspectionId);

      // Validate status transition
      if (updateData.status && !this.isValidStatusTransition(existingInspection.status, updateData.status)) {
        throw new AppError(
          `Invalid status transition from ${existingInspection.status} to ${updateData.status}`,
          400,
          ErrorCodes.INVALID_STATUS_TRANSITION
        );
      }

      // Validate form template if being changed
      if (updateData.formTemplateId && updateData.formTemplateId !== existingInspection.formTemplateId) {
        const formTemplate = await this.formTemplateRepository.findById(updateData.formTemplateId);
        if (!formTemplate || !formTemplate.isActive) {
          throw new AppError(
            'Form template not found or inactive',
            400,
            ErrorCodes.FORM_TEMPLATE_NOT_FOUND
          );
        }
      }

      // Validate asset if being changed
      if (updateData.assetId && updateData.assetId !== existingInspection.assetId) {
        const asset = await this.assetRepository.findById(updateData.assetId);
        if (!asset || !asset.isActive) {
          throw new AppError(
            'Asset not found or inactive',
            400,
            ErrorCodes.ASSET_NOT_FOUND
          );
        }
      }

      // Update inspection
      const updatedInspection = await this.inspectionRepository.update(inspectionId, {
        ...updateData,
        updatedBy
      });

      // Handle status-specific logic
      if (updateData.status) {
        await this.handleStatusChange(
          updatedInspection,
          existingInspection.status,
          updateData.status,
          updatedBy
        );
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'INSPECTION_UPDATED',
        entityType: 'inspection',
        entityId: inspectionId,
        details: {
          inspectionId: updatedInspection.inspectionId,
          updatedFields: Object.keys(updateData),
          previousValues: this.getChangedFields(existingInspection, updateData),
          newValues: updateData,
          statusChanged: updateData.status && updateData.status !== existingInspection.status,
          assigneeChanged: updateData.assignedTo && updateData.assignedTo !== existingInspection.assignedTo
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      // Send notification if assignee changed
      if (updateData.assignedTo && updateData.assignedTo !== existingInspection.assignedTo) {
        await this.notificationService.sendInspectionReassignmentNotification(
          updateData.assignedTo,
          existingInspection.assignedTo,
          updatedInspection,
          updatedBy
        );
      }

      logger.info('Inspection updated successfully', {
        inspectionId,
        inspectionNumber: updatedInspection.inspectionId,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedInspection;
    } catch (error) {
      logger.error('Inspection update failed', {
        inspectionId,
        updateData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Complete inspection with responses and photos
   */
  async completeInspection(
    completion: InspectionCompletion,
    completedBy: string,
    ipAddress?: string
  ): Promise<Inspection> {
    try {
      // Get inspection
      const inspection = await this.getInspectionById(completion.inspectionId);

      // Validate inspection can be completed
      if (inspection.status === InspectionStatus.COMPLETED) {
        throw new AppError(
          'Inspection is already completed',
          400,
          ErrorCodes.INSPECTION_ALREADY_COMPLETED
        );
      }

      if (inspection.status === InspectionStatus.CANCELLED) {
        throw new AppError(
          'Cannot complete cancelled inspection',
          400,
          ErrorCodes.INSPECTION_CANCELLED
        );
      }

      // Get form template for validation
      const formTemplate = await this.formTemplateRepository.findById(inspection.formTemplateId);
      if (!formTemplate) {
        throw new AppError(
          'Form template not found',
          404,
          ErrorCodes.FORM_TEMPLATE_NOT_FOUND
        );
      }

      // Validate responses against form template
      await this.validateInspectionResponses(completion.responses, formTemplate);

      // Process photos if provided
      let processedPhotos: InspectionPhoto[] = [];
      if (completion.photos && completion.photos.length > 0) {
        processedPhotos = await this.processInspectionPhotos(
          completion.inspectionId,
          completion.photos,
          completedBy
        );
      }

      // Calculate inspection score
      const score = await this.calculateInspectionScore(
        completion.responses,
        formTemplate,
        processedPhotos
      );

      // Update inspection with completion data
      const completedInspection = await this.inspectionRepository.complete(
        completion.inspectionId,
        {
          responses: completion.responses,
          photos: processedPhotos,
          score,
          notes: completion.notes,
          completedAt: completion.completedAt || new Date(),
          gpsLocation: completion.gpsLocation,
          signature: completion.signature,
          completedBy
        }
      );

      // Run AI analysis on photos if available
      if (processedPhotos.length > 0) {
        this.runAIAnalysisAsync(completedInspection.id, processedPhotos, completedBy);
      }

      // Update asset condition if applicable
      if (inspection.assetId) {
        await this.updateAssetCondition(inspection.assetId, score, completedInspection.id);
      }

      // Generate report if configured
      if (inspection.settings?.autoGenerateReport) {
        this.generateInspectionReportAsync(completedInspection.id, completedBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: completedBy,
        action: 'INSPECTION_COMPLETED',
        entityType: 'inspection',
        entityId: completion.inspectionId,
        details: {
          inspectionId: completedInspection.inspectionId,
          responseCount: completion.responses.length,
          photoCount: processedPhotos.length,
          score: score.percentage,
          hasIssues: score.issueCount > 0,
          completedAt: completedInspection.completedAt,
          gpsLocation: completion.gpsLocation,
          hasSignature: !!completion.signature
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      // Send completion notifications
      await this.sendCompletionNotifications(completedInspection, completedBy);

      logger.info('Inspection completed successfully', {
        inspectionId: completion.inspectionId,
        inspectionNumber: completedInspection.inspectionId,
        responseCount: completion.responses.length,
        photoCount: processedPhotos.length,
        score: score.percentage,
        completedBy
      });

      return completedInspection;
    } catch (error) {
      logger.error('Inspection completion failed', {
        inspectionId: completion.inspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Cancel inspection
   */
  async cancelInspection(
    inspectionId: string,
    reason: string,
    cancelledBy: string,
    ipAddress?: string
  ): Promise<Inspection> {
    try {
      // Get inspection
      const inspection = await this.getInspectionById(inspectionId);

      // Validate inspection can be cancelled
      if (inspection.status === InspectionStatus.COMPLETED) {
        throw new AppError(
          'Cannot cancel completed inspection',
          400,
          ErrorCodes.INSPECTION_ALREADY_COMPLETED
        );
      }

      if (inspection.status === InspectionStatus.CANCELLED) {
        throw new AppError(
          'Inspection is already cancelled',
          400,
          ErrorCodes.INSPECTION_ALREADY_CANCELLED
        );
      }

      // Cancel inspection
      const cancelledInspection = await this.inspectionRepository.cancel(
        inspectionId,
        reason,
        cancelledBy
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: cancelledBy,
        action: 'INSPECTION_CANCELLED',
        entityType: 'inspection',
        entityId: inspectionId,
        details: {
          inspectionId: cancelledInspection.inspectionId,
          reason,
          previousStatus: inspection.status,
          cancelledAt: cancelledInspection.cancelledAt
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      // Send cancellation notifications
      await this.sendCancellationNotifications(cancelledInspection, reason, cancelledBy);

      logger.info('Inspection cancelled successfully', {
        inspectionId,
        inspectionNumber: cancelledInspection.inspectionId,
        reason,
        cancelledBy
      });

      return cancelledInspection;
    } catch (error) {
      logger.error('Inspection cancellation failed', {
        inspectionId,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Duplicate inspection
   */
  async duplicateInspection(
    duplication: InspectionDuplication,
    duplicatedBy: string,
    ipAddress?: string
  ): Promise<Inspection> {
    try {
      // Get source inspection
      const sourceInspection = await this.getInspectionById(duplication.sourceInspectionId);

      // Validate target asset if specified
      if (duplication.targetAssetId) {
        const asset = await this.assetRepository.findById(duplication.targetAssetId);
        if (!asset || !asset.isActive) {
          throw new AppError(
            'Target asset not found or inactive',
            400,
            ErrorCodes.ASSET_NOT_FOUND
          );
        }
      }

      // Validate target folder if specified
      if (duplication.targetFolderId) {
        const folder = await this.folderRepository.findById(duplication.targetFolderId);
        if (!folder || !folder.isActive) {
          throw new AppError(
            'Target folder not found or inactive',
            400,
            ErrorCodes.FOLDER_NOT_FOUND
          );
        }
      }

      // Create duplicated inspection data
      const duplicatedData: CreateInspectionDTO = {
        name: `${sourceInspection.name} (Copy)`,
        description: sourceInspection.description,
        formTemplateId: sourceInspection.formTemplateId,
        assetId: duplication.targetAssetId || sourceInspection.assetId,
        folderId: duplication.targetFolderId || sourceInspection.folderId,
        assignedTo: duplication.assignedTo || sourceInspection.assignedTo,
        scheduledDate: duplication.scheduledDate || new Date(),
        dueDate: sourceInspection.dueDate,
        priority: sourceInspection.priority,
        tags: [...sourceInspection.tags],
        settings: { ...sourceInspection.settings },
        workflow: sourceInspection.workflow
      };

      // Create duplicated inspection
      const duplicatedInspection = await this.createInspection(
        duplicatedData,
        duplicatedBy,
        ipAddress
      );

      // Copy responses if requested
      if (duplication.copyResponses && sourceInspection.responses) {
        await this.inspectionRepository.copyResponses(
          duplication.sourceInspectionId,
          duplicatedInspection.id,
          duplicatedBy
        );
      }

      // Copy photos if requested
      if (duplication.copyPhotos && sourceInspection.photos) {
        await this.copyInspectionPhotos(
          duplication.sourceInspectionId,
          duplicatedInspection.id,
          duplicatedBy
        );
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: duplicatedBy,
        action: 'INSPECTION_DUPLICATED',
        entityType: 'inspection',
        entityId: duplicatedInspection.id,
        details: {
          sourceInspectionId: duplication.sourceInspectionId,
          sourceInspectionNumber: sourceInspection.inspectionId,
          duplicatedInspectionNumber: duplicatedInspection.inspectionId,
          targetAssetId: duplication.targetAssetId,
          targetFolderId: duplication.targetFolderId,
          copiedResponses: duplication.copyResponses,
          copiedPhotos: duplication.copyPhotos
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Inspection duplicated successfully', {
        sourceInspectionId: duplication.sourceInspectionId,
        duplicatedInspectionId: duplicatedInspection.id,
        duplicatedInspectionNumber: duplicatedInspection.inspectionId,
        duplicatedBy
      });

      return duplicatedInspection;
    } catch (error) {
      logger.error('Inspection duplication failed', {
        sourceInspectionId: duplication.sourceInspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search inspections with filters and pagination
   */
  async searchInspections(
    filters: InspectionSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Inspection>> {
    try {
      const result = await this.inspectionRepository.search(filters, pagination);
      
      logger.debug('Inspection search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Inspection search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get inspection analytics
   */
  async getInspectionAnalytics(
    filters?: InspectionSearchFilters,
    startDate?: Date,
    endDate?: Date
  ): Promise<InspectionAnalytics> {
    try {
      const analytics = await this.inspectionRepository.getAnalytics(filters, startDate, endDate);
      
      logger.debug('Inspection analytics retrieved', {
        filters,
        startDate,
        endDate,
        totalInspections: analytics.totalInspections,
        completionRate: analytics.completionRate
      });

      return analytics;
    } catch (error) {
      logger.error('Get inspection analytics failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get inspection statistics
   */
  async getInspectionStatistics(): Promise<InspectionStatistics> {
    try {
      const stats = await this.inspectionRepository.getStatistics();
      
      logger.debug('Inspection statistics retrieved', {
        totalInspections: stats.total,
        completedInspections: stats.completed,
        overdueInspections: stats.overdue
      });

      return stats;
    } catch (error) {
      logger.error('Get inspection statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Bulk inspection operations
   */
  async bulkInspectionOperation(
    operation: InspectionBulkOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { inspectionId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { inspectionId: string; error: string }[]
    };

    try {
      for (const inspectionId of operation.inspectionIds) {
        try {
          switch (operation.operation) {
            case 'assign':
            case 'reassign':
              if (operation.data?.assignedTo) {
                await this.updateInspection(
                  inspectionId,
                  { assignedTo: operation.data.assignedTo },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'complete':
              // Note: This is a simplified completion - in practice, you'd need responses
              await this.updateInspection(
                inspectionId,
                { status: InspectionStatus.COMPLETED },
                performedBy,
                ipAddress
              );
              break;
            case 'cancel':
              await this.cancelInspection(
                inspectionId,
                operation.data?.notes || 'Bulk cancellation',
                performedBy,
                ipAddress
              );
              break;
            case 'archive':
              await this.updateInspection(
                inspectionId,
                { status: InspectionStatus.ARCHIVED },
                performedBy,
                ipAddress
              );
              break;
            case 'delete':
              await this.inspectionRepository.delete(inspectionId);
              break;
            case 'updateStatus':
              if (operation.data?.status) {
                await this.updateInspection(
                  inspectionId,
                  { status: operation.data.status },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'addTags':
              if (operation.data?.tags) {
                const inspection = await this.getInspectionById(inspectionId);
                const newTags = [...new Set([...inspection.tags, ...operation.data.tags])];
                await this.updateInspection(
                  inspectionId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'removeTags':
              if (operation.data?.tags) {
                const inspection = await this.getInspectionById(inspectionId);
                const newTags = inspection.tags.filter(tag => !operation.data!.tags!.includes(tag));
                await this.updateInspection(
                  inspectionId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(inspectionId);
        } catch (error) {
          results.failed.push({
            inspectionId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_INSPECTION_OPERATION',
        entityType: 'inspection',
        entityId: null,
        details: {
          operation: operation.operation,
          totalInspections: operation.inspectionIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk inspection operation completed', {
        operation: operation.operation,
        totalInspections: operation.inspectionIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk inspection operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async generateInspectionId(folderId: string): Promise<string> {
    const folder = await this.folderRepository.findById(folderId);
    const prefix = folder?.settings?.inspectionIdPrefix || 'INS';
    const count = await this.inspectionRepository.countByFolderId(folderId);
    const sequence = (count + 1).toString().padStart(4, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    return `${prefix}-${date}-${sequence}`;
  }

  private isValidStatusTransition(currentStatus: InspectionStatus, newStatus: InspectionStatus): boolean {
    const validTransitions: Record<InspectionStatus, InspectionStatus[]> = {
      [InspectionStatus.DRAFT]: [InspectionStatus.SCHEDULED, InspectionStatus.CANCELLED],
      [InspectionStatus.SCHEDULED]: [InspectionStatus.IN_PROGRESS, InspectionStatus.CANCELLED],
      [InspectionStatus.IN_PROGRESS]: [InspectionStatus.COMPLETED, InspectionStatus.CANCELLED],
      [InspectionStatus.COMPLETED]: [InspectionStatus.ARCHIVED],
      [InspectionStatus.CANCELLED]: [InspectionStatus.SCHEDULED],
      [InspectionStatus.ARCHIVED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async handleStatusChange(
    inspection: Inspection,
    previousStatus: InspectionStatus,
    newStatus: InspectionStatus,
    changedBy: string
  ): Promise<void> {
    try {
      switch (newStatus) {
        case InspectionStatus.IN_PROGRESS:
          await this.handleInspectionStarted(inspection, changedBy);
          break;
        case InspectionStatus.COMPLETED:
          await this.handleInspectionCompleted(inspection, changedBy);
          break;
        case InspectionStatus.CANCELLED:
          await this.handleInspectionCancelled(inspection, changedBy);
          break;
        case InspectionStatus.ARCHIVED:
          await this.handleInspectionArchived(inspection, changedBy);
          break;
      }
    } catch (error) {
      logger.error('Status change handling failed', {
        inspectionId: inspection.id,
        previousStatus,
        newStatus,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async validateInspectionResponses(
    responses: InspectionResponse[],
    formTemplate: any
  ): Promise<void> {
    // Validate responses against form template structure
    // This would include checking required fields, data types, validation rules, etc.
    // Implementation depends on form template structure
    
    for (const response of responses) {
      const field = formTemplate.sections
        ?.flatMap((s: any) => s.fields)
        ?.find((f: any) => f.id === response.fieldId);
      
      if (!field) {
        throw new AppError(
          `Field ${response.fieldId} not found in form template`,
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (field.required && (!response.value || response.value === '')) {
        throw new AppError(
          `Field ${field.label} is required`,
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Additional field-specific validation would go here
    }
  }

  private async processInspectionPhotos(
    inspectionId: string,
    photos: InspectionPhoto[],
    processedBy: string
  ): Promise<InspectionPhoto[]> {
    const processedPhotos: InspectionPhoto[] = [];

    for (const photo of photos) {
      try {
        // Process and store photo
        const processedPhoto = await this.fileService.processInspectionPhoto(
          inspectionId,
          photo,
          processedBy
        );
        processedPhotos.push(processedPhoto);
      } catch (error) {
        logger.error('Photo processing failed', {
          inspectionId,
          photoId: photo.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue processing other photos
      }
    }

    return processedPhotos;
  }

  private async calculateInspectionScore(
    responses: InspectionResponse[],
    formTemplate: any,
    photos: InspectionPhoto[]
  ): Promise<InspectionScore> {
    // Calculate score based on responses, form template scoring rules, and photo analysis
    // This is a simplified implementation - actual scoring would be more complex
    
    let totalPoints = 0;
    let maxPoints = 0;
    let issueCount = 0;
    let criticalIssues = 0;

    for (const response of responses) {
      const field = formTemplate.sections
        ?.flatMap((s: any) => s.fields)
        ?.find((f: any) => f.id === response.fieldId);
      
      if (field?.scoring) {
        maxPoints += field.scoring.maxPoints || 0;
        
        if (response.value) {
          const points = this.calculateFieldScore(response, field);
          totalPoints += points;
          
          if (points < (field.scoring.maxPoints || 0)) {
            issueCount++;
            if (field.scoring.critical) {
              criticalIssues++;
            }
          }
        }
      }
    }

    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 100;
    
    return {
      totalPoints,
      maxPoints,
      percentage: Math.round(percentage * 100) / 100,
      grade: this.calculateGrade(percentage),
      issueCount,
      criticalIssues,
      passThreshold: formTemplate.scoring?.passThreshold || 70,
      passed: percentage >= (formTemplate.scoring?.passThreshold || 70)
    };
  }

  private calculateFieldScore(response: InspectionResponse, field: any): number {
    // Field-specific scoring logic
    // This would depend on field type and scoring configuration
    return field.scoring?.maxPoints || 0;
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private async runAIAnalysisAsync(
    inspectionId: string,
    photos: InspectionPhoto[],
    analyzedBy: string
  ): Promise<void> {
    // Run AI analysis asynchronously without blocking the main flow
    setImmediate(async () => {
      try {
        for (const photo of photos) {
          const analysis = await this.aiService.analyzeInspectionPhoto(photo.filePath);
          await this.inspectionRepository.updatePhotoAnalysis(inspectionId, photo.id, analysis);
        }
      } catch (error) {
        logger.error('AI analysis failed', {
          inspectionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  private async generateInspectionReportAsync(
    inspectionId: string,
    generatedBy: string
  ): Promise<void> {
    // Generate report asynchronously
    setImmediate(async () => {
      try {
        await this.reportService.generateInspectionReport(inspectionId, generatedBy);
      } catch (error) {
        logger.error('Report generation failed', {
          inspectionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  private async updateAssetCondition(
    assetId: string,
    score: InspectionScore,
    inspectionId: string
  ): Promise<void> {
    try {
      const condition = this.determineAssetCondition(score);
      await this.assetRepository.updateCondition(assetId, condition, inspectionId);
    } catch (error) {
      logger.error('Asset condition update failed', {
        assetId,
        inspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private determineAssetCondition(score: InspectionScore): string {
    if (score.criticalIssues > 0) return 'Poor';
    if (score.percentage >= 90) return 'Excellent';
    if (score.percentage >= 80) return 'Good';
    if (score.percentage >= 70) return 'Fair';
    return 'Poor';
  }

  private async sendCompletionNotifications(
    inspection: Inspection,
    completedBy: string
  ): Promise<void> {
    try {
      // Send notifications to relevant stakeholders
      await this.notificationService.sendInspectionCompletionNotification(
        inspection,
        completedBy
      );
    } catch (error) {
      logger.error('Completion notification failed', {
        inspectionId: inspection.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async sendCancellationNotifications(
    inspection: Inspection,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    try {
      // Send notifications to relevant stakeholders
      await this.notificationService.sendInspectionCancellationNotification(
        inspection,
        reason,
        cancelledBy
      );
    } catch (error) {
      logger.error('Cancellation notification failed', {
        inspectionId: inspection.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async copyInspectionPhotos(
    sourceInspectionId: string,
    targetInspectionId: string,
    copiedBy: string
  ): Promise<void> {
    try {
      await this.fileService.copyInspectionPhotos(
        sourceInspectionId,
        targetInspectionId,
        copiedBy
      );
    } catch (error) {
      logger.error('Photo copying failed', {
        sourceInspectionId,
        targetInspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async initializeInspectionWorkflow(
    inspectionId: string,
    workflow: InspectionWorkflow,
    createdBy: string
  ): Promise<void> {
    try {
      // Initialize workflow steps and notifications
      // Implementation would depend on workflow structure
    } catch (error) {
      logger.error('Workflow initialization failed', {
        inspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  private async handleInspectionStarted(inspection: Inspection, startedBy: string): Promise<void> {
    // Handle inspection started logic
  }

  private async handleInspectionCompleted(inspection: Inspection, completedBy: string): Promise<void> {
    // Handle inspection completed logic
  }

  private async handleInspectionCancelled(inspection: Inspection, cancelledBy: string): Promise<void> {
    // Handle inspection cancelled logic
  }

  private async handleInspectionArchived(inspection: Inspection, archivedBy: string): Promise<void> {
    // Handle inspection archived logic
  }

  private getChangedFields(original: Inspection, updates: UpdateInspectionDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateInspectionDTO;
      if (JSON.stringify(original[typedKey as keyof Inspection]) !== JSON.stringify(updates[typedKey])) {
        changed[key] = original[typedKey as keyof Inspection];
      }
    });
    
    return changed;
  }
}