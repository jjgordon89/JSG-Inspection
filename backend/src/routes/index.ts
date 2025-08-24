/**
 * Main Routes Index
 * Organizes and exports all API routes
 */

import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { assetRoutes } from './asset.routes';
import { inspectionRoutes } from './inspection.routes';
import { folderRoutes } from './folder.routes';
import { formRoutes } from './form.routes';
import { reportRoutes } from './report.routes';
import { syncRoutes } from './sync.routes';
import { notificationRoutes } from './notification.routes';
import { healthRoutes } from './health.routes';
import { uploadRoutes } from './upload.routes';
import { analyticsRoutes } from './analytics.routes';
import { auditRoutes } from './audit.routes';
import { configRoutes } from './config.routes';
import { webhookRoutes } from './webhook.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { corsMiddleware } from '../middleware/cors.middleware';
import { compressionMiddleware } from '../middleware/compression.middleware';
import { helmetMiddleware } from '../middleware/helmet.middleware';
import { loggingMiddleware } from '../middleware/logging.middleware';
import { errorHandlerMiddleware } from '../middleware/error-handler.middleware';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

// Global middleware for all API routes
router.use(helmetMiddleware);
router.use(corsMiddleware);
router.use(compressionMiddleware);
router.use(loggingMiddleware);
router.use(rateLimitMiddleware.global);

// API version prefix
const API_VERSION = '/api/v1';

// Health check routes (no auth required)
router.use('/health', healthRoutes);
router.use('/api/health', healthRoutes);

// Authentication routes (no auth required for most)
router.use(`${API_VERSION}/auth`, authRoutes);

// Webhook routes (special authentication)
router.use(`${API_VERSION}/webhooks`, webhookRoutes);

// Protected routes (require authentication)
router.use(`${API_VERSION}/users`, authMiddleware.authenticate, userRoutes);
router.use(`${API_VERSION}/assets`, authMiddleware.authenticate, assetRoutes);
router.use(`${API_VERSION}/inspections`, authMiddleware.authenticate, inspectionRoutes);
router.use(`${API_VERSION}/folders`, authMiddleware.authenticate, folderRoutes);
router.use(`${API_VERSION}/forms`, authMiddleware.authenticate, formRoutes);
router.use(`${API_VERSION}/reports`, authMiddleware.authenticate, reportRoutes);
router.use(`${API_VERSION}/sync`, authMiddleware.authenticate, syncRoutes);
router.use(`${API_VERSION}/notifications`, authMiddleware.authenticate, notificationRoutes);
router.use(`${API_VERSION}/uploads`, authMiddleware.authenticate, uploadRoutes);
router.use(`${API_VERSION}/analytics`, authMiddleware.authenticate, analyticsRoutes);
router.use(`${API_VERSION}/audit`, authMiddleware.authenticate, auditRoutes);
router.use(`${API_VERSION}/config`, authMiddleware.authenticate, configRoutes);

// API documentation route
router.get('/api/docs', (req, res) => {
  res.redirect('/api-docs');
});

// API info endpoint
router.get('/api', (req, res) => {
  res.json({
    name: 'JSG-Inspections API',
    version: process.env.API_VERSION || '1.0.0',
    description: 'Cross-platform inspection management system API',
    documentation: '/api-docs',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      assets: `${API_VERSION}/assets`,
      inspections: `${API_VERSION}/inspections`,
      folders: `${API_VERSION}/folders`,
      forms: `${API_VERSION}/forms`,
      reports: `${API_VERSION}/reports`,
      sync: `${API_VERSION}/sync`,
      notifications: `${API_VERSION}/notifications`,
      uploads: `${API_VERSION}/uploads`,
      analytics: `${API_VERSION}/analytics`,
      audit: `${API_VERSION}/audit`,
      config: `${API_VERSION}/config`,
      webhooks: `${API_VERSION}/webhooks`,
      health: '/health'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
router.get(`${API_VERSION}`, (req, res) => {
  res.json({
    version: 'v1',
    status: 'active',
    endpoints: {
      auth: '/auth',
      users: '/users',
      assets: '/assets',
      inspections: '/inspections',
      folders: '/folders',
      forms: '/forms',
      reports: '/reports',
      sync: '/sync',
      notifications: '/notifications',
      uploads: '/uploads',
      analytics: '/analytics',
      audit: '/audit',
      config: '/config',
      webhooks: '/webhooks'
    }
  });
});

// Catch-all for undefined API routes
router.all('/api/*', (req, res, next) => {
  const error = new AppError(
    `API endpoint ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(error);
});

// Global error handler (must be last)
router.use(errorHandlerMiddleware);

// Export configured router
export { router as apiRoutes };

// Export individual route modules for testing
export {
  authRoutes,
  userRoutes,
  assetRoutes,
  inspectionRoutes,
  folderRoutes,
  formRoutes,
  reportRoutes,
  syncRoutes,
  notificationRoutes,
  healthRoutes,
  uploadRoutes,
  analyticsRoutes,
  auditRoutes,
  configRoutes,
  webhookRoutes
};

// Route registration helper for testing
export const registerRoutes = (app: any) => {
  app.use('/', router);
  logger.info('API routes registered successfully');
};

// Route information for documentation
export const routeInfo = {
  version: 'v1',
  prefix: API_VERSION,
  routes: [
    {
      path: '/auth',
      description: 'Authentication and authorization endpoints',
      methods: ['POST', 'GET', 'DELETE'],
      protected: false
    },
    {
      path: '/users',
      description: 'User management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/assets',
      description: 'Asset management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/inspections',
      description: 'Inspection management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/folders',
      description: 'Folder organization endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/forms',
      description: 'Form template management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/reports',
      description: 'Report generation and management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/sync',
      description: 'Data synchronization endpoints',
      methods: ['GET', 'POST', 'PUT'],
      protected: true
    },
    {
      path: '/notifications',
      description: 'Notification management endpoints',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      protected: true
    },
    {
      path: '/uploads',
      description: 'File upload and management endpoints',
      methods: ['GET', 'POST', 'DELETE'],
      protected: true
    },
    {
      path: '/analytics',
      description: 'Analytics and reporting endpoints',
      methods: ['GET'],
      protected: true
    },
    {
      path: '/audit',
      description: 'Audit log endpoints',
      methods: ['GET'],
      protected: true
    },
    {
      path: '/config',
      description: 'System configuration endpoints',
      methods: ['GET', 'PUT'],
      protected: true
    },
    {
      path: '/webhooks',
      description: 'Webhook endpoints for external integrations',
      methods: ['POST'],
      protected: false
    },
    {
      path: '/health',
      description: 'Health check endpoints',
      methods: ['GET'],
      protected: false
    }
  ]
};