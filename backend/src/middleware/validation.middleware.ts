/**
 * Validation Middleware
 * Handles request data validation using Joi schemas
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types/errors';
import { logger } from '../utils/logger';

export interface ValidationOptions {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  abortEarly?: boolean;
}

export class ValidationMiddleware {
  /**
   * Validate request data against Joi schemas
   */
  static validate(options: ValidationOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validationOptions = {
          allowUnknown: options.allowUnknown ?? false,
          stripUnknown: options.stripUnknown ?? true,
          abortEarly: options.abortEarly ?? false
        };

        const errors: string[] = [];

        // Validate body
        if (options.body) {
          const { error, value } = options.body.validate(req.body, validationOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Body: ${detail.message}`));
          } else {
            req.body = value;
          }
        }

        // Validate params
        if (options.params) {
          const { error, value } = options.params.validate(req.params, validationOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Params: ${detail.message}`));
          } else {
            req.params = value;
          }
        }

        // Validate query
        if (options.query) {
          const { error, value } = options.query.validate(req.query, validationOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Query: ${detail.message}`));
          } else {
            req.query = value;
          }
        }

        // Validate headers
        if (options.headers) {
          const { error, value } = options.headers.validate(req.headers, validationOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Headers: ${detail.message}`));
          } else {
            req.headers = { ...req.headers, ...value };
          }
        }

        if (errors.length > 0) {
          logger.api('Validation failed', {
            errors,
            method: req.method,
            url: req.url,
            correlationId: req.correlationId
          });

          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: errors
            }
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Validation middleware error', {
          error: error.message,
          correlationId: req.correlationId
        });

        res.status(500).json({
          success: false,
          error: {
            code: 'VALIDATION_MIDDLEWARE_ERROR',
            message: 'Internal validation error'
          }
        });
      }
    };
  }

  /**
   * Validate body only
   */
  static validateBody(schema: Joi.ObjectSchema, options?: Partial<ValidationOptions>) {
    return this.validate({ body: schema, ...options });
  }

  /**
   * Validate params only
   */
  static validateParams(schema: Joi.ObjectSchema, options?: Partial<ValidationOptions>) {
    return this.validate({ params: schema, ...options });
  }

  /**
   * Validate query only
   */
  static validateQuery(schema: Joi.ObjectSchema, options?: Partial<ValidationOptions>) {
    return this.validate({ query: schema, ...options });
  }
}

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required(),
  optionalId: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).optional(),

  // Email validation
  email: Joi.string().email().required(),
  optionalEmail: Joi.string().email().optional(),

  // Password validation
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),

  // Phone validation
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),

  // Date validation
  date: Joi.date().iso().required(),
  optionalDate: Joi.date().iso().optional(),
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Search
  search: Joi.object({
    q: Joi.string().min(1).max(255).optional(),
    filters: Joi.object().optional()
  }),

  // File upload
  fileUpload: Joi.object({
    filename: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().integer().min(1).max(10 * 1024 * 1024).required() // 10MB max
  }),

  // Coordinates
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }),

  // Status
  status: Joi.string().valid('active', 'inactive', 'pending', 'completed', 'cancelled').required(),
  optionalStatus: Joi.string().valid('active', 'inactive', 'pending', 'completed', 'cancelled').optional(),

  // Priority
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  optionalPriority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),

  // Role
  role: Joi.string().valid('user', 'inspector', 'manager', 'admin', 'super_admin').required(),
  optionalRole: Joi.string().valid('user', 'inspector', 'manager', 'admin', 'super_admin').optional(),

  // Asset type
  assetType: Joi.string().valid('equipment', 'building', 'vehicle', 'tool', 'person', 'other').required(),
  optionalAssetType: Joi.string().valid('equipment', 'building', 'vehicle', 'tool', 'person', 'other').optional(),

  // Form field types
  fieldType: Joi.string().valid(
    'text', 'textarea', 'number', 'email', 'phone', 'date', 'time', 'datetime',
    'select', 'multiselect', 'radio', 'checkbox', 'file', 'image', 'signature',
    'rating', 'slider', 'location', 'barcode', 'qr_code'
  ).required(),

  // Inspection status
  inspectionStatus: Joi.string().valid('draft', 'in_progress', 'completed', 'cancelled', 'overdue').required(),
  optionalInspectionStatus: Joi.string().valid('draft', 'in_progress', 'completed', 'cancelled', 'overdue').optional(),

  // Report type
  reportType: Joi.string().valid('inspection', 'asset', 'performance', 'compliance', 'custom').required(),
  optionalReportType: Joi.string().valid('inspection', 'asset', 'performance', 'compliance', 'custom').optional(),

  // Notification type
  notificationType: Joi.string().valid(
    'inspection_assigned', 'inspection_completed', 'inspection_overdue',
    'asset_updated', 'report_generated', 'system_alert', 'user_mention'
  ).required()
};

// Entity-specific validation schemas
export const validationSchemas = {
  // User schemas
  createUser: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    role: commonSchemas.role,
    teamId: commonSchemas.optionalId,
    phone: commonSchemas.phone,
    department: Joi.string().max(100).optional(),
    position: Joi.string().max(100).optional(),
    permissions: Joi.array().items(Joi.string()).optional()
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    phone: commonSchemas.phone,
    department: Joi.string().max(100).optional(),
    position: Joi.string().max(100).optional(),
    preferences: Joi.object().optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
  }),

  // Authentication schemas
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: commonSchemas.password
  }),

  // Team schemas
  createTeam: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    department: Joi.string().max(100).optional(),
    managerId: commonSchemas.optionalId
  }),

  updateTeam: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    department: Joi.string().max(100).optional(),
    managerId: commonSchemas.optionalId
  }),

  // Asset schemas
  createAsset: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    assetCode: Joi.string().min(1).max(50).required(),
    type: commonSchemas.assetType,
    description: Joi.string().max(1000).optional(),
    location: Joi.string().max(200).optional(),
    department: Joi.string().max(100).optional(),
    coordinates: commonSchemas.coordinates.optional(),
    qrCode: Joi.string().max(100).optional(),
    barcode: Joi.string().max(100).optional(),
    customFields: Joi.object().optional()
  }),

  updateAsset: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    location: Joi.string().max(200).optional(),
    department: Joi.string().max(100).optional(),
    coordinates: commonSchemas.coordinates.optional(),
    customFields: Joi.object().optional()
  }),

  // Form template schemas
  createFormTemplate: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().max(100).optional(),
    fields: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: commonSchemas.fieldType,
        label: Joi.string().required(),
        required: Joi.boolean().default(false),
        options: Joi.array().items(Joi.string()).optional(),
        validation: Joi.object().optional(),
        defaultValue: Joi.any().optional()
      })
    ).min(1).required(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  updateFormTemplate: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().max(100).optional(),
    fields: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: commonSchemas.fieldType,
        label: Joi.string().required(),
        required: Joi.boolean().default(false),
        options: Joi.array().items(Joi.string()).optional(),
        validation: Joi.object().optional(),
        defaultValue: Joi.any().optional()
      })
    ).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  // Folder schemas
  createFolder: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    parentId: commonSchemas.optionalId,
    type: Joi.string().valid('inspection', 'asset', 'report', 'general').required(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: Joi.string().max(50).optional()
  }),

  updateFolder: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    parentId: commonSchemas.optionalId,
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: Joi.string().max(50).optional()
  }),

  // Inspection schemas
  createInspection: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    assetId: commonSchemas.id,
    formTemplateId: commonSchemas.id,
    folderId: commonSchemas.optionalId,
    inspectorId: commonSchemas.optionalId,
    scheduledDate: commonSchemas.optionalDate,
    priority: commonSchemas.priority,
    location: Joi.string().max(200).optional(),
    coordinates: commonSchemas.coordinates.optional()
  }),

  updateInspection: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    inspectorId: commonSchemas.optionalId,
    scheduledDate: commonSchemas.optionalDate,
    priority: commonSchemas.optionalPriority,
    location: Joi.string().max(200).optional(),
    coordinates: commonSchemas.coordinates.optional(),
    status: commonSchemas.optionalInspectionStatus
  }),

  submitInspectionResponse: Joi.object({
    responses: Joi.object().required(),
    notes: Joi.string().max(2000).optional(),
    photos: Joi.array().items(Joi.string()).optional(),
    signature: Joi.string().optional(),
    location: Joi.string().max(200).optional(),
    coordinates: commonSchemas.coordinates.optional()
  }),

  // Report schemas
  generateReport: Joi.object({
    type: commonSchemas.reportType,
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    filters: Joi.object({
      dateRange: commonSchemas.dateRange.optional(),
      assetIds: Joi.array().items(commonSchemas.id).optional(),
      inspectorIds: Joi.array().items(commonSchemas.id).optional(),
      folderIds: Joi.array().items(commonSchemas.id).optional(),
      status: Joi.array().items(commonSchemas.inspectionStatus).optional(),
      priority: Joi.array().items(commonSchemas.priority).optional()
    }).optional(),
    format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
    includePhotos: Joi.boolean().default(true),
    includeCharts: Joi.boolean().default(true)
  }),

  // Notification schemas
  createNotification: Joi.object({
    userId: commonSchemas.id,
    type: commonSchemas.notificationType,
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(1000).required(),
    priority: commonSchemas.priority,
    relatedEntityType: Joi.string().optional(),
    relatedEntityId: commonSchemas.optionalId,
    actionUrl: Joi.string().uri().optional(),
    expiresAt: commonSchemas.optionalDate
  }),

  // Common parameter schemas
  idParam: Joi.object({
    id: commonSchemas.id
  }),

  // Common query schemas
  paginationQuery: commonSchemas.pagination,
  searchQuery: commonSchemas.search,

  // File upload schemas
  fileUploadQuery: Joi.object({
    type: Joi.string().valid('image', 'document', 'signature').default('image'),
    maxSize: Joi.number().integer().min(1).max(10 * 1024 * 1024).optional()
  })
};

// Export validation middleware functions
export const validate = ValidationMiddleware.validate;
export const validateBody = ValidationMiddleware.validateBody;
export const validateParams = ValidationMiddleware.validateParams;
export const validateQuery = ValidationMiddleware.validateQuery;