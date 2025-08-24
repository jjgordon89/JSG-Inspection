/**
 * Form Routes
 * Defines all form template management endpoints
 */

import { Router } from 'express';
import { FormController } from '../controllers/form.controller';
import { FormService } from '../services/form.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { formValidationSchemas } from '../controllers/form.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const formService = new FormService();
const formController = new FormController(formService);

// Form template CRUD operations

/**
 * @route   GET /api/v1/forms
 * @desc    Get all form templates with filtering and pagination
 * @access  Private
 * @query   page?, limit?, search?, category?, status?, createdBy?, sortBy?, sortOrder?
 */
router.get(
  '/',
  validationMiddleware.validateQuery(formValidationSchemas.getFormsQuery),
  asyncHandler(formController.getForms)
);

/**
 * @route   GET /api/v1/forms/:id
 * @desc    Get form template by ID
 * @access  Private
 * @params  id
 * @query   includeSubmissions?, includeAnalytics?
 */
router.get(
  '/:id',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    includeSubmissions: { required: false, type: 'boolean' },
    includeAnalytics: { required: false, type: 'boolean' }
  }),
  asyncHandler(formController.getFormById)
);

/**
 * @route   POST /api/v1/forms
 * @desc    Create new form template
 * @access  Private
 * @body    { name, description?, category?, fields, settings?, isActive? }
 */
router.post(
  '/',
  authMiddleware.requirePermission('forms.create'),
  validationMiddleware.validateBody(formValidationSchemas.createForm),
  asyncHandler(formController.createForm)
);

/**
 * @route   PUT /api/v1/forms/:id
 * @desc    Update form template
 * @access  Private
 * @params  id
 * @body    { name?, description?, category?, fields?, settings?, isActive? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(formValidationSchemas.updateForm),
  asyncHandler(formController.updateForm)
);

/**
 * @route   DELETE /api/v1/forms/:id
 * @desc    Delete form template
 * @access  Private
 * @params  id
 * @query   force?
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('forms.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    force: { required: false, type: 'boolean' }
  }),
  asyncHandler(formController.deleteForm)
);

/**
 * @route   POST /api/v1/forms/:id/duplicate
 * @desc    Duplicate form template
 * @access  Private
 * @params  id
 * @body    { name?, description? }
 */
router.post(
  '/:id/duplicate',
  authMiddleware.requirePermission('forms.create'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    name: { required: false, type: 'string', maxLength: 100 },
    description: { required: false, type: 'string', maxLength: 500 }
  }),
  asyncHandler(formController.duplicateForm)
);

// Form validation

/**
 * @route   POST /api/v1/forms/:id/validate
 * @desc    Validate form data against template
 * @access  Private
 * @params  id
 * @body    { data }
 */
router.post(
  '/:id/validate',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    data: { required: true, type: 'object' }
  }),
  asyncHandler(formController.validateFormData)
);

// Form submissions

/**
 * @route   POST /api/v1/forms/:id/submit
 * @desc    Submit form data
 * @access  Private
 * @params  id
 * @body    { data, metadata? }
 */
router.post(
  '/:id/submit',
  authMiddleware.requirePermission('forms.submit'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(formValidationSchemas.submitForm),
  asyncHandler(formController.submitForm)
);

/**
 * @route   GET /api/v1/forms/:id/submissions
 * @desc    Get form submissions
 * @access  Private
 * @params  id
 * @query   page?, limit?, startDate?, endDate?, submittedBy?, sortBy?, sortOrder?
 */
router.get(
  '/:id/submissions',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    submittedBy: { required: false, type: 'string' },
    sortBy: { required: false, type: 'string' },
    sortOrder: { required: false, type: 'string', enum: ['asc', 'desc'] }
  }),
  asyncHandler(formController.getFormSubmissions)
);

/**
 * @route   GET /api/v1/forms/submissions/:submissionId
 * @desc    Get form submission by ID
 * @access  Private
 * @params  submissionId
 */
router.get(
  '/submissions/:submissionId',
  validationMiddleware.validateParams({
    submissionId: { required: true, type: 'string' }
  }),
  asyncHandler(formController.getFormSubmissionById)
);

/**
 * @route   PUT /api/v1/forms/submissions/:submissionId
 * @desc    Update form submission
 * @access  Private
 * @params  submissionId
 * @body    { data, metadata? }
 */
router.put(
  '/submissions/:submissionId',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateParams({
    submissionId: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    data: { required: true, type: 'object' },
    metadata: { required: false, type: 'object' }
  }),
  asyncHandler(formController.updateFormSubmission)
);

/**
 * @route   DELETE /api/v1/forms/submissions/:submissionId
 * @desc    Delete form submission
 * @access  Private
 * @params  submissionId
 */
router.delete(
  '/submissions/:submissionId',
  authMiddleware.requirePermission('forms.delete'),
  validationMiddleware.validateParams({
    submissionId: { required: true, type: 'string' }
  }),
  asyncHandler(formController.deleteFormSubmission)
);

// Form analytics

/**
 * @route   GET /api/v1/forms/:id/analytics
 * @desc    Get form analytics
 * @access  Private
 * @params  id
 * @query   timeRange?, groupBy?
 */
router.get(
  '/:id/analytics',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month', 'user'] }
  }),
  asyncHandler(formController.getFormAnalytics)
);

// Export form submissions

/**
 * @route   GET /api/v1/forms/:id/export
 * @desc    Export form submissions
 * @access  Private
 * @params  id
 * @query   format?, startDate?, endDate?, submittedBy?
 */
router.get(
  '/:id/export',
  authMiddleware.requirePermission('forms.read'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['csv', 'xlsx', 'json'] },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    submittedBy: { required: false, type: 'string' }
  }),
  asyncHandler(formController.exportFormSubmissions)
);

// Import/Export form templates

/**
 * @route   POST /api/v1/forms/import
 * @desc    Import form template
 * @access  Private
 * @body    FormData with 'file' (JSON or YAML)
 */
router.post(
  '/import',
  authMiddleware.requirePermission('forms.create'),
  uploadMiddleware.single('file'),
  asyncHandler(formController.importFormTemplate)
);

/**
 * @route   GET /api/v1/forms/:id/export-template
 * @desc    Export form template
 * @access  Private
 * @params  id
 * @query   format?
 */
router.get(
  '/:id/export-template',
  authMiddleware.requirePermission('forms.read'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['json', 'yaml'] }
  }),
  asyncHandler(formController.exportFormTemplate)
);

// Form field types and validation rules

/**
 * @route   GET /api/v1/forms/field-types
 * @desc    Get available form field types
 * @access  Private
 */
router.get(
  '/field-types',
  asyncHandler(formController.getFormFieldTypes)
);

/**
 * @route   GET /api/v1/forms/validation-rules
 * @desc    Get available validation rules
 * @access  Private
 */
router.get(
  '/validation-rules',
  asyncHandler(formController.getValidationRules)
);

/**
 * @route   GET /api/v1/forms/categories
 * @desc    Get form categories
 * @access  Private
 */
router.get(
  '/categories',
  asyncHandler(formController.getFormCategories)
);

// Form preview and testing

/**
 * @route   POST /api/v1/forms/:id/preview
 * @desc    Preview form template
 * @access  Private
 * @params  id
 * @body    { sampleData? }
 */
router.post(
  '/:id/preview',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    sampleData: { required: false, type: 'object' }
  }),
  asyncHandler(formController.previewForm)
);

/**
 * @route   POST /api/v1/forms/:id/test
 * @desc    Test form template
 * @access  Private
 * @params  id
 * @body    { testData }
 */
router.post(
  '/:id/test',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody({
    testData: { required: true, type: 'object' }
  }),
  asyncHandler(formController.testForm)
);

// Bulk operations

/**
 * @route   POST /api/v1/forms/bulk-activate
 * @desc    Bulk activate form templates
 * @access  Private
 * @body    { formIds }
 */
router.post(
  '/bulk-activate',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateBody({
    formIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(formController.bulkActivateForms)
);

/**
 * @route   POST /api/v1/forms/bulk-deactivate
 * @desc    Bulk deactivate form templates
 * @access  Private
 * @body    { formIds }
 */
router.post(
  '/bulk-deactivate',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateBody({
    formIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(formController.bulkDeactivateForms)
);

/**
 * @route   POST /api/v1/forms/bulk-delete
 * @desc    Bulk delete form templates
 * @access  Private
 * @body    { formIds, force? }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('forms.delete'),
  validationMiddleware.validateBody({
    formIds: { required: true, type: 'array', items: { type: 'string' } },
    force: { required: false, type: 'boolean' }
  }),
  asyncHandler(formController.bulkDeleteForms)
);

/**
 * @route   POST /api/v1/forms/bulk-duplicate
 * @desc    Bulk duplicate form templates
 * @access  Private
 * @body    { formIds, namePrefix? }
 */
router.post(
  '/bulk-duplicate',
  authMiddleware.requirePermission('forms.create'),
  validationMiddleware.validateBody({
    formIds: { required: true, type: 'array', items: { type: 'string' } },
    namePrefix: { required: false, type: 'string', maxLength: 50 }
  }),
  asyncHandler(formController.bulkDuplicateForms)
);

/**
 * @route   POST /api/v1/forms/bulk-export
 * @desc    Bulk export form templates
 * @access  Private
 * @body    { formIds, format? }
 */
router.post(
  '/bulk-export',
  authMiddleware.requirePermission('forms.read'),
  validationMiddleware.validateBody({
    formIds: { required: true, type: 'array', items: { type: 'string' } },
    format: { required: false, type: 'string', enum: ['json', 'yaml'] }
  }),
  asyncHandler(formController.bulkExportForms)
);

// Form versioning

/**
 * @route   GET /api/v1/forms/:id/versions
 * @desc    Get form template versions
 * @access  Private
 * @params  id
 * @query   page?, limit?
 */
router.get(
  '/:id/versions',
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 }
  }),
  asyncHandler(formController.getFormVersions)
);

/**
 * @route   POST /api/v1/forms/:id/versions/:versionId/restore
 * @desc    Restore form template version
 * @access  Private
 * @params  id, versionId
 */
router.post(
  '/:id/versions/:versionId/restore',
  authMiddleware.requirePermission('forms.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' },
    versionId: { required: true, type: 'string' }
  }),
  asyncHandler(formController.restoreFormVersion)
);

// Health check for form service
/**
 * @route   GET /api/v1/forms/health
 * @desc    Form service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'forms',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as formRoutes };

// Export route information for documentation
export const formRouteInfo = {
  basePath: '/forms',
  routes: [
    {
      method: 'GET',
      path: '/',
      description: 'Get all form templates with filtering',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get form template by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/',
      description: 'Create new form template',
      auth: true,
      permissions: ['forms.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update form template',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete form template',
      auth: true,
      permissions: ['forms.delete']
    },
    {
      method: 'POST',
      path: '/:id/duplicate',
      description: 'Duplicate form template',
      auth: true,
      permissions: ['forms.create']
    },
    {
      method: 'POST',
      path: '/:id/validate',
      description: 'Validate form data against template',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/submit',
      description: 'Submit form data',
      auth: true,
      permissions: ['forms.submit']
    },
    {
      method: 'GET',
      path: '/:id/submissions',
      description: 'Get form submissions',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/submissions/:submissionId',
      description: 'Get form submission by ID',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/submissions/:submissionId',
      description: 'Update form submission',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'DELETE',
      path: '/submissions/:submissionId',
      description: 'Delete form submission',
      auth: true,
      permissions: ['forms.delete']
    },
    {
      method: 'GET',
      path: '/:id/analytics',
      description: 'Get form analytics',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/:id/export',
      description: 'Export form submissions',
      auth: true,
      permissions: ['forms.read']
    },
    {
      method: 'POST',
      path: '/import',
      description: 'Import form template',
      auth: true,
      permissions: ['forms.create']
    },
    {
      method: 'GET',
      path: '/:id/export-template',
      description: 'Export form template',
      auth: true,
      permissions: ['forms.read']
    },
    {
      method: 'GET',
      path: '/field-types',
      description: 'Get available form field types',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/validation-rules',
      description: 'Get available validation rules',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/categories',
      description: 'Get form categories',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/preview',
      description: 'Preview form template',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/test',
      description: 'Test form template',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'POST',
      path: '/bulk-activate',
      description: 'Bulk activate form templates',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'POST',
      path: '/bulk-deactivate',
      description: 'Bulk deactivate form templates',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete form templates',
      auth: true,
      permissions: ['forms.delete']
    },
    {
      method: 'POST',
      path: '/bulk-duplicate',
      description: 'Bulk duplicate form templates',
      auth: true,
      permissions: ['forms.create']
    },
    {
      method: 'POST',
      path: '/bulk-export',
      description: 'Bulk export form templates',
      auth: true,
      permissions: ['forms.read']
    },
    {
      method: 'GET',
      path: '/:id/versions',
      description: 'Get form template versions',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/:id/versions/:versionId/restore',
      description: 'Restore form template version',
      auth: true,
      permissions: ['forms.update']
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Form service health check',
      auth: true,
      permissions: []
    }
  ]
};