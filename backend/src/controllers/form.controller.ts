/**
 * Form Controller
 * Handles HTTP requests for form template management operations
 */

import { Request, Response, NextFunction } from 'express';
import { FormService } from '../services/form.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateFormTemplateDTO,
  UpdateFormTemplateDTO,
  FormTemplateFilters,
  FormFieldType,
  FormValidationRule,
  BulkFormOperation,
  FormSubmissionData,
  FormAnalyticsFilters
} from '../types/form';
import { PaginationQuery, SortQuery } from '../types/common';

export class FormController {
  constructor(private formService: FormService) {}

  /**
   * Get form templates with filtering and pagination
   * GET /api/forms
   */
  getFormTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: FormTemplateFilters = {
        search: req.query.search as string,
        category: req.query.category as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        createdBy: req.query.createdBy as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        hasConditionalLogic: req.query.hasConditionalLogic === 'true' ? true : req.query.hasConditionalLogic === 'false' ? false : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined
      };

      const result = await this.formService.getFormTemplates(filters, pagination, sort);

      res.json({
        success: true,
        data: result.templates,
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
   * Get form template by ID
   * GET /api/forms/:id
   */
  getFormTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const includeSubmissions = req.query.includeSubmissions === 'true';
      const includeAnalytics = req.query.includeAnalytics === 'true';
      
      const template = await this.formService.getFormTemplateById(id, {
        includeSubmissions,
        includeAnalytics
      });

      if (!template) {
        throw new AppError('Form template not found', 404);
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new form template
   * POST /api/forms
   */
  createFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templateData: CreateFormTemplateDTO = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.formService.createFormTemplate({
        ...templateData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Form template created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update form template
   * PUT /api/forms/:id
   */
  updateFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateFormTemplateDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.formService.updateFormTemplate(id, updateData, updatedBy);

      res.json({
        success: true,
        data: template,
        message: 'Form template updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete form template
   * DELETE /api/forms/:id
   */
  deleteFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      const force = req.query.force === 'true';

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.formService.deleteFormTemplate(id, deletedBy, force);

      res.json({
        success: true,
        message: 'Form template deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicate form template
   * POST /api/forms/:id/duplicate
   */
  duplicateFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const duplicatedBy = req.user?.id;

      if (!duplicatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.formService.duplicateFormTemplate(id, {
        name,
        description,
        duplicatedBy
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Form template duplicated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate form data against template
   * POST /api/forms/:id/validate
   */
  validateFormData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formData = req.body;

      const validation = await this.formService.validateFormData(id, formData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Submit form data
   * POST /api/forms/:id/submit
   */
  submitForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const submissionData: FormSubmissionData = req.body;
      const submittedBy = req.user?.id;

      if (!submittedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const submission = await this.formService.submitForm(id, {
        ...submissionData,
        submittedBy
      });

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Form submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form submissions
   * GET /api/forms/:id/submissions
   */
  getFormSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'submittedAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters = {
        submittedBy: req.query.submittedBy as string,
        submittedAfter: req.query.submittedAfter ? new Date(req.query.submittedAfter as string) : undefined,
        submittedBefore: req.query.submittedBefore ? new Date(req.query.submittedBefore as string) : undefined,
        inspectionId: req.query.inspectionId as string
      };

      const submissions = await this.formService.getFormSubmissions(id, filters, pagination, sort);

      res.json({
        success: true,
        data: submissions.submissions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: submissions.total,
          pages: Math.ceil(submissions.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form submission by ID
   * GET /api/forms/:formId/submissions/:submissionId
   */
  getFormSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formId, submissionId } = req.params;
      
      const submission = await this.formService.getFormSubmissionById(formId, submissionId);

      if (!submission) {
        throw new AppError('Form submission not found', 404);
      }

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update form submission
   * PUT /api/forms/:formId/submissions/:submissionId
   */
  updateFormSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formId, submissionId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const submission = await this.formService.updateFormSubmission(
        formId,
        submissionId,
        updateData,
        updatedBy
      );

      res.json({
        success: true,
        data: submission,
        message: 'Form submission updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete form submission
   * DELETE /api/forms/:formId/submissions/:submissionId
   */
  deleteFormSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formId, submissionId } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.formService.deleteFormSubmission(formId, submissionId, deletedBy);

      res.json({
        success: true,
        message: 'Form submission deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form analytics
   * GET /api/forms/:id/analytics
   */
  getFormAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const filters: FormAnalyticsFilters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        submittedBy: req.query.submittedBy as string,
        inspectionId: req.query.inspectionId as string
      };

      const analytics = await this.formService.getFormAnalytics(id, filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export form submissions
   * GET /api/forms/:id/export
   */
  exportFormSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const format = req.query.format as string || 'csv';
      const filters = {
        submittedBy: req.query.submittedBy as string,
        submittedAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        submittedBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        inspectionId: req.query.inspectionId as string
      };

      const exportData = await this.formService.exportFormSubmissions(id, filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=form-${id}-submissions.csv`);
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=form-${id}-submissions.xlsx`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=form-${id}-submissions.json`);
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Import form template
   * POST /api/forms/import
   */
  importFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templateData = req.body;
      const importedBy = req.user?.id;

      if (!importedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.formService.importFormTemplate(templateData, importedBy);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Form template imported successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export form template
   * GET /api/forms/:id/export-template
   */
  exportFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const format = req.query.format as string || 'json';

      const exportData = await this.formService.exportFormTemplate(id, format);

      // Set appropriate headers based on format
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=form-template-${id}.json`);
      } else if (format === 'yaml') {
        res.setHeader('Content-Type', 'application/x-yaml');
        res.setHeader('Content-Disposition', `attachment; filename=form-template-${id}.yaml`);
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form field types
   * GET /api/forms/field-types
   */
  getFieldTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fieldTypes = await this.formService.getFieldTypes();

      res.json({
        success: true,
        data: fieldTypes
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form validation rules
   * GET /api/forms/validation-rules
   */
  getValidationRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationRules = await this.formService.getValidationRules();

      res.json({
        success: true,
        data: validationRules
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Preview form template
   * GET /api/forms/:id/preview
   */
  previewFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const preview = await this.formService.previewFormTemplate(id);

      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Test form template
   * POST /api/forms/:id/test
   */
  testFormTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const testData = req.body;

      const testResult = await this.formService.testFormTemplate(id, testData);

      res.json({
        success: true,
        data: testResult
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get form categories
   * GET /api/forms/categories
   */
  getFormCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.formService.getFormCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk operations on form templates
   * POST /api/forms/bulk
   */
  bulkOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: BulkFormOperation = req.body;
      const performedBy = req.user?.id;

      if (!performedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(operation.formIds) || operation.formIds.length === 0) {
        throw new AppError('Form IDs array is required', 400);
      }

      const result = await this.formService.bulkOperation({
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
   * Get form template versions
   * GET /api/forms/:id/versions
   */
  getFormVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const versions = await this.formService.getFormVersions(id, pagination);

      res.json({
        success: true,
        data: versions.versions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: versions.total,
          pages: Math.ceil(versions.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restore form template version
   * POST /api/forms/:id/versions/:versionId/restore
   */
  restoreFormVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, versionId } = req.params;
      const restoredBy = req.user?.id;

      if (!restoredBy) {
        throw new AppError('User not authenticated', 401);
      }

      const template = await this.formService.restoreFormVersion(id, versionId, restoredBy);

      res.json({
        success: true,
        data: template,
        message: 'Form template version restored successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const formValidationSchemas = {
  createFormTemplate: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    category: { required: false, type: 'string' },
    fields: { required: true, type: 'array', minItems: 1 },
    isActive: { required: false, type: 'boolean' },
    isPublic: { required: false, type: 'boolean' },
    tags: { required: false, type: 'array' },
    conditionalLogic: { required: false, type: 'array' },
    settings: { required: false, type: 'object' }
  },
  updateFormTemplate: {
    name: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    category: { required: false, type: 'string' },
    fields: { required: false, type: 'array' },
    isActive: { required: false, type: 'boolean' },
    isPublic: { required: false, type: 'boolean' },
    tags: { required: false, type: 'array' },
    conditionalLogic: { required: false, type: 'array' },
    settings: { required: false, type: 'object' }
  },
  duplicateFormTemplate: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' }
  },
  submitForm: {
    data: { required: true, type: 'object' },
    inspectionId: { required: false, type: 'string' },
    metadata: { required: false, type: 'object' }
  },
  updateFormSubmission: {
    data: { required: false, type: 'object' },
    metadata: { required: false, type: 'object' }
  },
  testFormTemplate: {
    testData: { required: true, type: 'object' },
    scenarios: { required: false, type: 'array' }
  },
  bulkOperation: {
    action: { required: true, type: 'string', enum: ['activate', 'deactivate', 'delete', 'duplicate', 'export'] },
    formIds: { required: true, type: 'array', minItems: 1 },
    data: { required: false, type: 'object' }
  }
};