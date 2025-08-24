/**
 * Form Template Service
 * Handles dynamic form creation, validation, and management for inspection forms
 */

import { FormTemplateRepository } from '../repositories/form-template.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import {
  FormTemplate,
  CreateFormTemplateDTO,
  UpdateFormTemplateDTO,
  FormField,
  FormFieldType,
  FormValidationRule,
  FormSection,
  FormLogic,
  FormTemplateVersion
} from '../types/form-template';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { validateFormStructure, validateFormLogic } from '../utils/form-validator';
import { generateFormId } from '../utils/id-generator';

export interface FormTemplateSearchFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  createdBy?: string;
  department?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastUsedAfter?: Date;
  lastUsedBefore?: Date;
  complexity?: 'simple' | 'medium' | 'complex';
  hasLogic?: boolean;
  hasValidation?: boolean;
}

export interface FormTemplateStatistics {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  byComplexity: Record<string, number>;
  withLogic: number;
  withValidation: number;
  recentlyUsed: number; // last 30 days
  mostUsed: {
    templateId: string;
    templateName: string;
    usageCount: number;
  }[];
}

export interface FormTemplateUsage {
  templateId: string;
  templateName: string;
  totalUsage: number;
  recentUsage: number; // last 30 days
  averageCompletionTime?: number; // minutes
  completionRate: number; // percentage
  lastUsed?: Date;
  popularFields: {
    fieldId: string;
    fieldLabel: string;
    usageCount: number;
  }[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: {
    fieldId?: string;
    sectionId?: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  warnings: {
    fieldId?: string;
    sectionId?: string;
    message: string;
  }[];
}

export interface FormTemplateCloneOptions {
  newName: string;
  newDescription?: string;
  category?: string;
  department?: string;
  tags?: string[];
  includeLogic?: boolean;
  includeValidation?: boolean;
  modifyFields?: {
    fieldId: string;
    changes: Partial<FormField>;
  }[];
}

export interface BulkFormTemplateOperation {
  templateIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'updateCategory' | 'addTags' | 'removeTags';
  data?: {
    category?: string;
    tags?: string[];
  };
}

export class FormTemplateService {
  private formTemplateRepository: FormTemplateRepository;
  private auditLogRepository: AuditLogRepository;

  constructor(
    formTemplateRepository: FormTemplateRepository,
    auditLogRepository: AuditLogRepository
  ) {
    this.formTemplateRepository = formTemplateRepository;
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Create a new form template
   */
  async createFormTemplate(
    templateData: CreateFormTemplateDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<FormTemplate> {
    try {
      // Validate form structure
      const validationResult = this.validateFormTemplate(templateData);
      if (!validationResult.isValid) {
        throw new AppError(
          `Form template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`,
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Generate unique form ID if not provided
      const formId = templateData.formId || generateFormId(templateData.name);

      // Check if form ID already exists
      const existingTemplate = await this.formTemplateRepository.findByFormId(formId);
      if (existingTemplate) {
        throw new AppError(
          'Form template ID already exists',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Process form fields and sections
      const processedSections = this.processFormSections(templateData.sections);
      const processedLogic = templateData.logic ? this.processFormLogic(templateData.logic) : undefined;

      // Create form template
      const template = await this.formTemplateRepository.create({
        ...templateData,
        formId,
        sections: processedSections,
        logic: processedLogic,
        version: 1,
        createdBy
      });

      // Log audit event
      await this.auditLogRepository.create({
        userId: createdBy,
        action: 'FORM_TEMPLATE_CREATED',
        entityType: 'form_template',
        entityId: template.id,
        details: {
          formId: template.formId,
          templateName: template.name,
          category: template.category,
          fieldCount: this.countFormFields(template.sections),
          sectionCount: template.sections.length,
          hasLogic: !!template.logic,
          hasValidation: this.hasValidationRules(template.sections)
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Form template created successfully', {
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        createdBy
      });

      return template;
    } catch (error) {
      logger.error('Form template creation failed', {
        templateName: templateData.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get form template by ID
   */
  async getFormTemplateById(templateId: string): Promise<FormTemplate> {
    const template = await this.formTemplateRepository.findById(templateId);
    if (!template) {
      throw new AppError(
        'Form template not found',
        404,
        ErrorCodes.FORM_TEMPLATE_NOT_FOUND
      );
    }
    return template;
  }

  /**
   * Get form template by form ID
   */
  async getFormTemplateByFormId(formId: string): Promise<FormTemplate> {
    const template = await this.formTemplateRepository.findByFormId(formId);
    if (!template) {
      throw new AppError(
        'Form template not found',
        404,
        ErrorCodes.FORM_TEMPLATE_NOT_FOUND
      );
    }
    return template;
  }

  /**
   * Update form template
   */
  async updateFormTemplate(
    templateId: string,
    updateData: UpdateFormTemplateDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<FormTemplate> {
    try {
      // Check if template exists
      const existingTemplate = await this.getFormTemplateById(templateId);

      // Validate form structure if sections are being updated
      if (updateData.sections) {
        const validationResult = this.validateFormTemplate({
          ...existingTemplate,
          ...updateData
        } as CreateFormTemplateDTO);
        
        if (!validationResult.isValid) {
          throw new AppError(
            `Form template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`,
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Check if form ID is being changed and if it already exists
      if (updateData.formId && updateData.formId !== existingTemplate.formId) {
        const existingWithNewId = await this.formTemplateRepository.findByFormId(updateData.formId);
        if (existingWithNewId) {
          throw new AppError(
            'Form template ID already exists',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Process updated sections and logic if provided
      const processedSections = updateData.sections ? 
        this.processFormSections(updateData.sections) : undefined;
      const processedLogic = updateData.logic ? 
        this.processFormLogic(updateData.logic) : undefined;

      // Increment version if structure changes
      const shouldIncrementVersion = updateData.sections || updateData.logic;
      const newVersion = shouldIncrementVersion ? existingTemplate.version + 1 : existingTemplate.version;

      // Update template
      const updatedTemplate = await this.formTemplateRepository.update(templateId, {
        ...updateData,
        sections: processedSections,
        logic: processedLogic,
        version: newVersion,
        updatedBy
      });

      // Create version history if structure changed
      if (shouldIncrementVersion) {
        await this.createVersionHistory(existingTemplate, updatedBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'FORM_TEMPLATE_UPDATED',
        entityType: 'form_template',
        entityId: templateId,
        details: {
          updatedFields: Object.keys(updateData),
          previousVersion: existingTemplate.version,
          newVersion,
          structureChanged: shouldIncrementVersion,
          previousValues: this.getChangedFields(existingTemplate, updateData),
          newValues: updateData
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Form template updated successfully', {
        templateId,
        templateName: updatedTemplate.name,
        updatedFields: Object.keys(updateData),
        versionIncremented: shouldIncrementVersion,
        updatedBy
      });

      return updatedTemplate;
    } catch (error) {
      logger.error('Form template update failed', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete form template (soft delete)
   */
  async deleteFormTemplate(
    templateId: string,
    deletedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check if template exists
      const template = await this.getFormTemplateById(templateId);

      // Check if template is being used in active inspections
      const usageCount = await this.formTemplateRepository.getActiveUsageCount(templateId);
      if (usageCount > 0) {
        throw new AppError(
          `Cannot delete form template. It is currently being used in ${usageCount} active inspection(s)`,
          400,
          ErrorCodes.FORM_TEMPLATE_IN_USE
        );
      }

      // Soft delete template
      await this.formTemplateRepository.delete(templateId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: deletedBy,
        action: 'FORM_TEMPLATE_DELETED',
        entityType: 'form_template',
        entityId: templateId,
        details: {
          formId: template.formId,
          templateName: template.name,
          category: template.category,
          version: template.version
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      logger.info('Form template deleted successfully', {
        templateId,
        templateName: template.name,
        deletedBy
      });
    } catch (error) {
      logger.error('Form template deletion failed', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Clone form template
   */
  async cloneFormTemplate(
    templateId: string,
    cloneOptions: FormTemplateCloneOptions,
    clonedBy: string,
    ipAddress?: string
  ): Promise<FormTemplate> {
    try {
      // Get original template
      const originalTemplate = await this.getFormTemplateById(templateId);

      // Prepare cloned data
      const clonedData: CreateFormTemplateDTO = {
        name: cloneOptions.newName,
        description: cloneOptions.newDescription || `Cloned from ${originalTemplate.name}`,
        category: cloneOptions.category || originalTemplate.category,
        department: cloneOptions.department || originalTemplate.department,
        tags: cloneOptions.tags || originalTemplate.tags,
        sections: this.cloneFormSections(
          originalTemplate.sections,
          cloneOptions.modifyFields
        ),
        logic: (cloneOptions.includeLogic !== false && originalTemplate.logic) ? 
          originalTemplate.logic : undefined,
        settings: originalTemplate.settings
      };

      // Create cloned template
      const clonedTemplate = await this.createFormTemplate(
        clonedData,
        clonedBy,
        ipAddress
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: clonedBy,
        action: 'FORM_TEMPLATE_CLONED',
        entityType: 'form_template',
        entityId: clonedTemplate.id,
        details: {
          originalTemplateId: templateId,
          originalTemplateName: originalTemplate.name,
          clonedTemplateName: clonedTemplate.name,
          includeLogic: cloneOptions.includeLogic !== false,
          includeValidation: cloneOptions.includeValidation !== false,
          modifiedFields: cloneOptions.modifyFields?.length || 0
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Form template cloned successfully', {
        originalTemplateId: templateId,
        clonedTemplateId: clonedTemplate.id,
        clonedTemplateName: clonedTemplate.name,
        clonedBy
      });

      return clonedTemplate;
    } catch (error) {
      logger.error('Form template cloning failed', {
        templateId,
        cloneName: cloneOptions.newName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search form templates with filters and pagination
   */
  async searchFormTemplates(
    filters: FormTemplateSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<FormTemplate>> {
    try {
      const result = await this.formTemplateRepository.search(filters, pagination);
      
      logger.debug('Form template search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Form template search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get form templates by category
   */
  async getFormTemplatesByCategory(
    category: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<FormTemplate>> {
    try {
      const result = await this.formTemplateRepository.findByCategory(category, pagination);
      
      logger.debug('Form templates by category retrieved', {
        category,
        templateCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get form templates by category failed', {
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get form template statistics
   */
  async getFormTemplateStatistics(): Promise<FormTemplateStatistics> {
    try {
      const stats = await this.formTemplateRepository.getStatistics();
      
      logger.debug('Form template statistics retrieved', {
        totalTemplates: stats.total,
        activeTemplates: stats.active,
        withLogic: stats.withLogic
      });

      return stats;
    } catch (error) {
      logger.error('Get form template statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get form template usage analytics
   */
  async getFormTemplateUsage(templateId: string): Promise<FormTemplateUsage> {
    try {
      const template = await this.getFormTemplateById(templateId);
      const usage = await this.formTemplateRepository.getUsageAnalytics(templateId);
      
      logger.debug('Form template usage retrieved', {
        templateId,
        templateName: template.name,
        totalUsage: usage.totalUsage
      });

      return {
        templateId,
        templateName: template.name,
        ...usage
      };
    } catch (error) {
      logger.error('Get form template usage failed', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate form template structure
   */
  validateFormTemplate(templateData: CreateFormTemplateDTO): FormValidationResult {
    const errors: FormValidationResult['errors'] = [];
    const warnings: FormValidationResult['warnings'] = [];

    try {
      // Validate basic structure
      if (!templateData.name || templateData.name.trim().length === 0) {
        errors.push({
          message: 'Template name is required',
          severity: 'error'
        });
      }

      if (!templateData.sections || templateData.sections.length === 0) {
        errors.push({
          message: 'At least one section is required',
          severity: 'error'
        });
      }

      // Validate sections and fields
      if (templateData.sections) {
        templateData.sections.forEach((section, sectionIndex) => {
          if (!section.title || section.title.trim().length === 0) {
            errors.push({
              sectionId: section.id,
              message: `Section ${sectionIndex + 1}: Title is required`,
              severity: 'error'
            });
          }

          if (!section.fields || section.fields.length === 0) {
            warnings.push({
              sectionId: section.id,
              message: `Section "${section.title}" has no fields`
            });
          }

          // Validate fields
          section.fields?.forEach((field, fieldIndex) => {
            if (!field.label || field.label.trim().length === 0) {
              errors.push({
                sectionId: section.id,
                fieldId: field.id,
                message: `Section "${section.title}", Field ${fieldIndex + 1}: Label is required`,
                severity: 'error'
              });
            }

            if (!field.type) {
              errors.push({
                sectionId: section.id,
                fieldId: field.id,
                message: `Section "${section.title}", Field "${field.label}": Type is required`,
                severity: 'error'
              });
            }

            // Validate field-specific requirements
            this.validateFieldSpecificRules(field, section, errors, warnings);
          });
        });
      }

      // Validate form logic if present
      if (templateData.logic) {
        this.validateFormLogicRules(templateData.logic, templateData.sections, errors, warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Form template validation error', {
        templateName: templateData.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        errors: [{
          message: 'Validation process failed',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate field-specific rules
   */
  private validateFieldSpecificRules(
    field: FormField,
    section: FormSection,
    errors: FormValidationResult['errors'],
    warnings: FormValidationResult['warnings']
  ): void {
    switch (field.type) {
      case FormFieldType.SELECT:
      case FormFieldType.RADIO:
      case FormFieldType.CHECKBOX:
        if (!field.options || field.options.length === 0) {
          errors.push({
            sectionId: section.id,
            fieldId: field.id,
            message: `Field "${field.label}": Options are required for ${field.type} fields`,
            severity: 'error'
          });
        }
        break;

      case FormFieldType.NUMBER:
        if (field.validation?.min !== undefined && field.validation?.max !== undefined) {
          if (field.validation.min >= field.validation.max) {
            errors.push({
              sectionId: section.id,
              fieldId: field.id,
              message: `Field "${field.label}": Minimum value must be less than maximum value`,
              severity: 'error'
            });
          }
        }
        break;

      case FormFieldType.DATE:
        if (field.validation?.minDate && field.validation?.maxDate) {
          if (new Date(field.validation.minDate) >= new Date(field.validation.maxDate)) {
            errors.push({
              sectionId: section.id,
              fieldId: field.id,
              message: `Field "${field.label}": Minimum date must be before maximum date`,
              severity: 'error'
            });
          }
        }
        break;

      case FormFieldType.FILE:
        if (field.validation?.maxFileSize && field.validation.maxFileSize > 50 * 1024 * 1024) {
          warnings.push({
            sectionId: section.id,
            fieldId: field.id,
            message: `Field "${field.label}": Large file size limit (${Math.round(field.validation.maxFileSize / 1024 / 1024)}MB) may cause performance issues`
          });
        }
        break;
    }

    // Validate common validation rules
    if (field.validation) {
      if (field.validation.minLength !== undefined && field.validation.maxLength !== undefined) {
        if (field.validation.minLength >= field.validation.maxLength) {
          errors.push({
            sectionId: section.id,
            fieldId: field.id,
            message: `Field "${field.label}": Minimum length must be less than maximum length`,
            severity: 'error'
          });
        }
      }

      if (field.validation.pattern) {
        try {
          new RegExp(field.validation.pattern);
        } catch {
          errors.push({
            sectionId: section.id,
            fieldId: field.id,
            message: `Field "${field.label}": Invalid regular expression pattern`,
            severity: 'error'
          });
        }
      }
    }
  }

  /**
   * Validate form logic rules
   */
  private validateFormLogicRules(
    logic: FormLogic[],
    sections: FormSection[],
    errors: FormValidationResult['errors'],
    warnings: FormValidationResult['warnings']
  ): void {
    const allFieldIds = new Set<string>();
    sections.forEach(section => {
      section.fields?.forEach(field => {
        allFieldIds.add(field.id);
      });
    });

    logic.forEach((rule, ruleIndex) => {
      // Validate condition field exists
      if (!allFieldIds.has(rule.condition.fieldId)) {
        errors.push({
          message: `Logic rule ${ruleIndex + 1}: Condition field "${rule.condition.fieldId}" does not exist`,
          severity: 'error'
        });
      }

      // Validate action target fields exist
      rule.actions.forEach((action, actionIndex) => {
        if (action.targetFieldId && !allFieldIds.has(action.targetFieldId)) {
          errors.push({
            message: `Logic rule ${ruleIndex + 1}, Action ${actionIndex + 1}: Target field "${action.targetFieldId}" does not exist`,
            severity: 'error'
          });
        }
      });
    });
  }

  /**
   * Process form sections
   */
  private processFormSections(sections: FormSection[]): FormSection[] {
    return sections.map(section => ({
      ...section,
      fields: section.fields?.map(field => ({
        ...field,
        id: field.id || this.generateFieldId(field.label),
        validation: field.validation ? this.processValidationRules(field.validation) : undefined
      }))
    }));
  }

  /**
   * Process form logic
   */
  private processFormLogic(logic: FormLogic[]): FormLogic[] {
    return logic.map(rule => ({
      ...rule,
      id: rule.id || this.generateLogicRuleId()
    }));
  }

  /**
   * Process validation rules
   */
  private processValidationRules(validation: FormValidationRule): FormValidationRule {
    return {
      ...validation,
      // Add any processing logic for validation rules
    };
  }

  /**
   * Clone form sections with modifications
   */
  private cloneFormSections(
    sections: FormSection[],
    modifyFields?: { fieldId: string; changes: Partial<FormField> }[]
  ): FormSection[] {
    return sections.map(section => ({
      ...section,
      id: this.generateSectionId(section.title),
      fields: section.fields?.map(field => {
        const modification = modifyFields?.find(mod => mod.fieldId === field.id);
        return {
          ...field,
          id: this.generateFieldId(field.label),
          ...modification?.changes
        };
      })
    }));
  }

  /**
   * Create version history
   */
  private async createVersionHistory(
    template: FormTemplate,
    updatedBy: string
  ): Promise<void> {
    try {
      const versionData: FormTemplateVersion = {
        templateId: template.id,
        version: template.version,
        name: template.name,
        description: template.description,
        sections: template.sections,
        logic: template.logic,
        settings: template.settings,
        createdBy: updatedBy,
        createdAt: new Date()
      };

      await this.formTemplateRepository.createVersion(versionData);
    } catch (error) {
      logger.error('Failed to create version history', {
        templateId: template.id,
        version: template.version,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  /**
   * Bulk form template operations
   */
  async bulkFormTemplateOperation(
    operation: BulkFormTemplateOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { templateId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { templateId: string; error: string }[]
    };

    try {
      for (const templateId of operation.templateIds) {
        try {
          switch (operation.operation) {
            case 'activate':
              await this.updateFormTemplate(
                templateId,
                { isActive: true },
                performedBy,
                ipAddress
              );
              break;
            case 'deactivate':
              await this.updateFormTemplate(
                templateId,
                { isActive: false },
                performedBy,
                ipAddress
              );
              break;
            case 'delete':
              await this.deleteFormTemplate(templateId, performedBy, ipAddress);
              break;
            case 'updateCategory':
              if (operation.data?.category) {
                await this.updateFormTemplate(
                  templateId,
                  { category: operation.data.category },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'addTags':
              if (operation.data?.tags) {
                const template = await this.getFormTemplateById(templateId);
                const newTags = [...new Set([...template.tags, ...operation.data.tags])];
                await this.updateFormTemplate(
                  templateId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'removeTags':
              if (operation.data?.tags) {
                const template = await this.getFormTemplateById(templateId);
                const newTags = template.tags.filter(tag => !operation.data!.tags!.includes(tag));
                await this.updateFormTemplate(
                  templateId,
                  { tags: newTags },
                  performedBy,
                  ipAddress
                );
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(templateId);
        } catch (error) {
          results.failed.push({
            templateId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_FORM_TEMPLATE_OPERATION',
        entityType: 'form_template',
        entityId: null,
        details: {
          operation: operation.operation,
          totalTemplates: operation.templateIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk form template operation completed', {
        operation: operation.operation,
        totalTemplates: operation.templateIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk form template operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private countFormFields(sections: FormSection[]): number {
    return sections.reduce((count, section) => count + (section.fields?.length || 0), 0);
  }

  private hasValidationRules(sections: FormSection[]): boolean {
    return sections.some(section => 
      section.fields?.some(field => field.validation && Object.keys(field.validation).length > 0)
    );
  }

  private generateFieldId(label: string): string {
    return `field_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  private generateSectionId(title: string): string {
    return `section_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  private generateLogicRuleId(): string {
    return `logic_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getChangedFields(original: FormTemplate, updates: UpdateFormTemplateDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateFormTemplateDTO;
      if (JSON.stringify(original[typedKey as keyof FormTemplate]) !== JSON.stringify(updates[typedKey])) {
        changed[key] = original[typedKey as keyof FormTemplate];
      }
    });
    
    return changed;
  }
}