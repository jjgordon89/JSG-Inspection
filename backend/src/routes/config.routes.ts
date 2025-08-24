/**
 * Configuration Routes
 * Defines all system configuration and settings endpoints
 */

import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { ConfigService } from '../services/config.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const configService = new ConfigService();
const configController = new ConfigController(configService);

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Apply rate limiting for configuration operations
const configRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit config requests per minute
  message: 'Too many configuration requests'
});

const heavyConfigRateLimit = rateLimitMiddleware.createLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Very limited heavy config operations
  message: 'Too many heavy configuration requests'
});

// System configuration

/**
 * @route   GET /api/v1/config/system
 * @desc    Get system configuration
 * @access  Private (Admin)
 * @query   section?, includeSecrets?
 */
router.get(
  '/system',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  cacheMiddleware.cache(5 * 60), // Cache for 5 minutes
  validationMiddleware.validateQuery({
    section: { required: false, type: 'string', enum: ['database', 'auth', 'ai', 'storage', 'sync', 'notifications', 'security'] },
    includeSecrets: { required: false, type: 'boolean' }
  }),
  asyncHandler(configController.getSystemConfig)
);

/**
 * @route   PUT /api/v1/config/system
 * @desc    Update system configuration
 * @access  Private (Admin)
 * @body    { section, config }
 */
router.put(
  '/system',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    section: { required: true, type: 'string', enum: ['database', 'auth', 'ai', 'storage', 'sync', 'notifications', 'security'] },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateSystemConfig)
);

/**
 * @route   POST /api/v1/config/system/validate
 * @desc    Validate system configuration
 * @access  Private (Admin)
 * @body    { section, config }
 */
router.post(
  '/system/validate',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    section: { required: true, type: 'string' },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.validateSystemConfig)
);

/**
 * @route   POST /api/v1/config/system/reset
 * @desc    Reset system configuration to defaults
 * @access  Private (Admin)
 * @body    { section?, confirmReset }
 */
router.post(
  '/system/reset',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Very limited reset operations
    message: 'Too many reset requests'
  }),
  validationMiddleware.validateBody({
    section: { required: false, type: 'string' },
    confirmReset: { required: true, type: 'boolean', enum: [true] }
  }),
  asyncHandler(configController.resetSystemConfig)
);

// Application settings

/**
 * @route   GET /api/v1/config/app
 * @desc    Get application settings
 * @access  Private (Manager+)
 * @query   category?
 */
router.get(
  '/app',
  authMiddleware.requireRole(['manager', 'admin']),
  configRateLimit,
  cacheMiddleware.cache(10 * 60),
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', enum: ['general', 'inspection', 'reporting', 'notifications', 'ui', 'workflow'] }
  }),
  asyncHandler(configController.getAppSettings)
);

/**
 * @route   PUT /api/v1/config/app
 * @desc    Update application settings
 * @access  Private (Manager+)
 * @body    { category, settings }
 */
router.put(
  '/app',
  authMiddleware.requireRole(['manager', 'admin']),
  configRateLimit,
  validationMiddleware.validateBody({
    category: { required: true, type: 'string', enum: ['general', 'inspection', 'reporting', 'notifications', 'ui', 'workflow'] },
    settings: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateAppSettings)
);

/**
 * @route   GET /api/v1/config/app/public
 * @desc    Get public application settings (no auth required)
 * @access  Public
 */
router.get(
  '/app/public',
  cacheMiddleware.cache(30 * 60), // Cache for 30 minutes
  asyncHandler(configController.getPublicAppSettings)
);

// User preferences

/**
 * @route   GET /api/v1/config/user/preferences
 * @desc    Get current user's preferences
 * @access  Private
 * @query   category?
 */
router.get(
  '/user/preferences',
  configRateLimit,
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', enum: ['ui', 'notifications', 'workflow', 'reporting', 'mobile'] }
  }),
  asyncHandler(configController.getUserPreferences)
);

/**
 * @route   PUT /api/v1/config/user/preferences
 * @desc    Update current user's preferences
 * @access  Private
 * @body    { category, preferences }
 */
router.put(
  '/user/preferences',
  configRateLimit,
  validationMiddleware.validateBody({
    category: { required: true, type: 'string', enum: ['ui', 'notifications', 'workflow', 'reporting', 'mobile'] },
    preferences: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateUserPreferences)
);

/**
 * @route   DELETE /api/v1/config/user/preferences
 * @desc    Reset user preferences to defaults
 * @access  Private
 * @body    { category? }
 */
router.delete(
  '/user/preferences',
  configRateLimit,
  validationMiddleware.validateBody({
    category: { required: false, type: 'string', enum: ['ui', 'notifications', 'workflow', 'reporting', 'mobile'] }
  }),
  asyncHandler(configController.resetUserPreferences)
);

// Team/Organization settings

/**
 * @route   GET /api/v1/config/organization
 * @desc    Get organization settings
 * @access  Private (Manager+)
 * @query   section?
 */
router.get(
  '/organization',
  authMiddleware.requireRole(['manager', 'admin']),
  configRateLimit,
  cacheMiddleware.cache(15 * 60),
  validationMiddleware.validateQuery({
    section: { required: false, type: 'string', enum: ['profile', 'branding', 'policies', 'integrations', 'billing'] }
  }),
  asyncHandler(configController.getOrganizationSettings)
);

/**
 * @route   PUT /api/v1/config/organization
 * @desc    Update organization settings
 * @access  Private (Admin)
 * @body    { section, settings }
 */
router.put(
  '/organization',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    section: { required: true, type: 'string', enum: ['profile', 'branding', 'policies', 'integrations', 'billing'] },
    settings: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateOrganizationSettings)
);

// Feature flags

/**
 * @route   GET /api/v1/config/features
 * @desc    Get feature flags
 * @access  Private
 * @query   environment?, userId?
 */
router.get(
  '/features',
  configRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    environment: { required: false, type: 'string', enum: ['development', 'staging', 'production'] },
    userId: { required: false, type: 'string' }
  }),
  asyncHandler(configController.getFeatureFlags)
);

/**
 * @route   PUT /api/v1/config/features
 * @desc    Update feature flags
 * @access  Private (Admin)
 * @body    { flags }
 */
router.put(
  '/features',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    flags: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateFeatureFlags)
);

/**
 * @route   POST /api/v1/config/features/toggle
 * @desc    Toggle specific feature flag
 * @access  Private (Admin)
 * @body    { feature, enabled, environment? }
 */
router.post(
  '/features/toggle',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    feature: { required: true, type: 'string' },
    enabled: { required: true, type: 'boolean' },
    environment: { required: false, type: 'string', enum: ['development', 'staging', 'production'] }
  }),
  asyncHandler(configController.toggleFeatureFlag)
);

// AI configuration

/**
 * @route   GET /api/v1/config/ai
 * @desc    Get AI configuration
 * @access  Private (Admin)
 * @query   provider?, includeKeys?
 */
router.get(
  '/ai',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    provider: { required: false, type: 'string', enum: ['openai', 'gemini', 'claude', 'custom'] },
    includeKeys: { required: false, type: 'boolean' }
  }),
  asyncHandler(configController.getAIConfig)
);

/**
 * @route   PUT /api/v1/config/ai
 * @desc    Update AI configuration
 * @access  Private (Admin)
 * @body    { provider, config }
 */
router.put(
  '/ai',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    provider: { required: true, type: 'string', enum: ['openai', 'gemini', 'claude', 'custom'] },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateAIConfig)
);

/**
 * @route   POST /api/v1/config/ai/test
 * @desc    Test AI configuration
 * @access  Private (Admin)
 * @body    { provider, config? }
 */
router.post(
  '/ai/test',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    provider: { required: true, type: 'string', enum: ['openai', 'gemini', 'claude', 'custom'] },
    config: { required: false, type: 'object' }
  }),
  asyncHandler(configController.testAIConfig)
);

// Database configuration

/**
 * @route   GET /api/v1/config/database
 * @desc    Get database configuration
 * @access  Private (Admin)
 * @query   includeConnectionString?
 */
router.get(
  '/database',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateQuery({
    includeConnectionString: { required: false, type: 'boolean' }
  }),
  asyncHandler(configController.getDatabaseConfig)
);

/**
 * @route   PUT /api/v1/config/database
 * @desc    Update database configuration
 * @access  Private (Admin)
 * @body    { config }
 */
router.put(
  '/database',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateDatabaseConfig)
);

/**
 * @route   POST /api/v1/config/database/test
 * @desc    Test database connection
 * @access  Private (Admin)
 * @body    { config? }
 */
router.post(
  '/database/test',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    config: { required: false, type: 'object' }
  }),
  asyncHandler(configController.testDatabaseConnection)
);

// Storage configuration

/**
 * @route   GET /api/v1/config/storage
 * @desc    Get storage configuration
 * @access  Private (Admin)
 * @query   provider?
 */
router.get(
  '/storage',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    provider: { required: false, type: 'string', enum: ['local', 'aws', 'azure', 'gcp', 'custom'] }
  }),
  asyncHandler(configController.getStorageConfig)
);

/**
 * @route   PUT /api/v1/config/storage
 * @desc    Update storage configuration
 * @access  Private (Admin)
 * @body    { provider, config }
 */
router.put(
  '/storage',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    provider: { required: true, type: 'string', enum: ['local', 'aws', 'azure', 'gcp', 'custom'] },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateStorageConfig)
);

/**
 * @route   POST /api/v1/config/storage/test
 * @desc    Test storage configuration
 * @access  Private (Admin)
 * @body    { provider, config? }
 */
router.post(
  '/storage/test',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    provider: { required: true, type: 'string', enum: ['local', 'aws', 'azure', 'gcp', 'custom'] },
    config: { required: false, type: 'object' }
  }),
  asyncHandler(configController.testStorageConfig)
);

// Notification configuration

/**
 * @route   GET /api/v1/config/notifications
 * @desc    Get notification configuration
 * @access  Private (Manager+)
 * @query   channel?
 */
router.get(
  '/notifications',
  authMiddleware.requireRole(['manager', 'admin']),
  configRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    channel: { required: false, type: 'string', enum: ['email', 'sms', 'push', 'webhook', 'slack'] }
  }),
  asyncHandler(configController.getNotificationConfig)
);

/**
 * @route   PUT /api/v1/config/notifications
 * @desc    Update notification configuration
 * @access  Private (Admin)
 * @body    { channel, config }
 */
router.put(
  '/notifications',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    channel: { required: true, type: 'string', enum: ['email', 'sms', 'push', 'webhook', 'slack'] },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateNotificationConfig)
);

/**
 * @route   POST /api/v1/config/notifications/test
 * @desc    Test notification configuration
 * @access  Private (Admin)
 * @body    { channel, config?, recipient? }
 */
router.post(
  '/notifications/test',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateBody({
    channel: { required: true, type: 'string', enum: ['email', 'sms', 'push', 'webhook', 'slack'] },
    config: { required: false, type: 'object' },
    recipient: { required: false, type: 'string' }
  }),
  asyncHandler(configController.testNotificationConfig)
);

// Security configuration

/**
 * @route   GET /api/v1/config/security
 * @desc    Get security configuration
 * @access  Private (Admin)
 * @query   section?
 */
router.get(
  '/security',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  cacheMiddleware.cache(5 * 60),
  validationMiddleware.validateQuery({
    section: { required: false, type: 'string', enum: ['auth', 'encryption', 'access', 'audit', 'compliance'] }
  }),
  asyncHandler(configController.getSecurityConfig)
);

/**
 * @route   PUT /api/v1/config/security
 * @desc    Update security configuration
 * @access  Private (Admin)
 * @body    { section, config }
 */
router.put(
  '/security',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    section: { required: true, type: 'string', enum: ['auth', 'encryption', 'access', 'audit', 'compliance'] },
    config: { required: true, type: 'object' }
  }),
  asyncHandler(configController.updateSecurityConfig)
);

// Configuration backup and restore

/**
 * @route   POST /api/v1/config/backup
 * @desc    Create configuration backup
 * @access  Private (Admin)
 * @body    { sections?, includeSecrets? }
 */
router.post(
  '/backup',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limited backup operations
    message: 'Too many backup requests'
  }),
  validationMiddleware.validateBody({
    sections: { required: false, type: 'array', items: { type: 'string' } },
    includeSecrets: { required: false, type: 'boolean' }
  }),
  asyncHandler(configController.createConfigBackup)
);

/**
 * @route   GET /api/v1/config/backups
 * @desc    Get configuration backups
 * @access  Private (Admin)
 * @query   page?, limit?
 */
router.get(
  '/backups',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 50 }
  }),
  asyncHandler(configController.getConfigBackups)
);

/**
 * @route   POST /api/v1/config/restore
 * @desc    Restore configuration from backup
 * @access  Private (Admin)
 * @body    { backupId, sections?, confirmRestore }
 */
router.post(
  '/restore',
  authMiddleware.requireRole('admin'),
  rateLimitMiddleware.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Very limited restore operations
    message: 'Too many restore requests'
  }),
  validationMiddleware.validateBody({
    backupId: { required: true, type: 'string' },
    sections: { required: false, type: 'array', items: { type: 'string' } },
    confirmRestore: { required: true, type: 'boolean', enum: [true] }
  }),
  asyncHandler(configController.restoreConfigBackup)
);

/**
 * @route   DELETE /api/v1/config/backups/:backupId
 * @desc    Delete configuration backup
 * @access  Private (Admin)
 * @params  backupId
 */
router.delete(
  '/backups/:backupId',
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateParams({
    backupId: { required: true, type: 'string' }
  }),
  asyncHandler(configController.deleteConfigBackup)
);

// Configuration validation and health

/**
 * @route   GET /api/v1/config/health
 * @desc    Get configuration health status
 * @access  Private (Admin)
 * @query   section?
 */
router.get(
  '/health',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  validationMiddleware.validateQuery({
    section: { required: false, type: 'string' }
  }),
  asyncHandler(configController.getConfigHealth)
);

/**
 * @route   POST /api/v1/config/validate-all
 * @desc    Validate all configurations
 * @access  Private (Admin)
 */
router.post(
  '/validate-all',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  asyncHandler(configController.validateAllConfigs)
);

// Configuration templates

/**
 * @route   GET /api/v1/config/templates
 * @desc    Get configuration templates
 * @access  Private (Admin)
 * @query   category?
 */
router.get(
  '/templates',
  authMiddleware.requireRole('admin'),
  configRateLimit,
  cacheMiddleware.cache(30 * 60),
  validationMiddleware.validateQuery({
    category: { required: false, type: 'string', enum: ['deployment', 'security', 'performance', 'compliance'] }
  }),
  asyncHandler(configController.getConfigTemplates)
);

/**
 * @route   POST /api/v1/config/templates/apply
 * @desc    Apply configuration template
 * @access  Private (Admin)
 * @body    { templateId, overrides?, confirmApply }
 */
router.post(
  '/templates/apply',
  authMiddleware.requireRole('admin'),
  heavyConfigRateLimit,
  validationMiddleware.validateBody({
    templateId: { required: true, type: 'string' },
    overrides: { required: false, type: 'object' },
    confirmApply: { required: true, type: 'boolean', enum: [true] }
  }),
  asyncHandler(configController.applyConfigTemplate)
);

// Export the router
export { router as configRoutes };

// Export route information for documentation
export const configRouteInfo = {
  basePath: '/config',
  routes: [
    {
      method: 'GET',
      path: '/system',
      description: 'Get system configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/system',
      description: 'Update system configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/system/validate',
      description: 'Validate system configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/system/reset',
      description: 'Reset system configuration to defaults',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/app',
      description: 'Get application settings',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'PUT',
      path: '/app',
      description: 'Update application settings',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'GET',
      path: '/app/public',
      description: 'Get public application settings',
      auth: false
    },
    {
      method: 'GET',
      path: '/user/preferences',
      description: 'Get current user\'s preferences',
      auth: true
    },
    {
      method: 'PUT',
      path: '/user/preferences',
      description: 'Update current user\'s preferences',
      auth: true
    },
    {
      method: 'DELETE',
      path: '/user/preferences',
      description: 'Reset user preferences to defaults',
      auth: true
    },
    {
      method: 'GET',
      path: '/organization',
      description: 'Get organization settings',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'PUT',
      path: '/organization',
      description: 'Update organization settings',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/features',
      description: 'Get feature flags',
      auth: true
    },
    {
      method: 'PUT',
      path: '/features',
      description: 'Update feature flags',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/features/toggle',
      description: 'Toggle specific feature flag',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/ai',
      description: 'Get AI configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/ai',
      description: 'Update AI configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/ai/test',
      description: 'Test AI configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/database',
      description: 'Get database configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/database',
      description: 'Update database configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/database/test',
      description: 'Test database connection',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/storage',
      description: 'Get storage configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/storage',
      description: 'Update storage configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/storage/test',
      description: 'Test storage configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/notifications',
      description: 'Get notification configuration',
      auth: true,
      permissions: [],
      roles: ['manager', 'admin']
    },
    {
      method: 'PUT',
      path: '/notifications',
      description: 'Update notification configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/notifications/test',
      description: 'Test notification configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/security',
      description: 'Get security configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'PUT',
      path: '/security',
      description: 'Update security configuration',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/backup',
      description: 'Create configuration backup',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/backups',
      description: 'Get configuration backups',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/restore',
      description: 'Restore configuration from backup',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'DELETE',
      path: '/backups/:backupId',
      description: 'Delete configuration backup',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Get configuration health status',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/validate-all',
      description: 'Validate all configurations',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'GET',
      path: '/templates',
      description: 'Get configuration templates',
      auth: true,
      permissions: [],
      roles: ['admin']
    },
    {
      method: 'POST',
      path: '/templates/apply',
      description: 'Apply configuration template',
      auth: true,
      permissions: [],
      roles: ['admin']
    }
  ]
};