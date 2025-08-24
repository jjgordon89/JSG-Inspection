/**
 * User Routes
 * Defines all user management endpoints
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { userValidationSchemas } from '../controllers/user.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const userService = new UserService();
const authService = new AuthService();
const userController = new UserController(userService, authService);

// Current user routes (self-management)

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 id: "user:12345"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 role: "inspector"
 *                 isActive: true
 *                 createdAt: "2024-01-15T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/me',
  asyncHandler(userController.getCurrentUser)
);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 pattern: "^[+]?[1-9]\\d{1,14}$"
 *                 example: "+1234567890"
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: "JSG Inspections Inc."
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             phone: "+1234567890"
 *             company: "JSG Inspections Inc."
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/me',
  rateLimitMiddleware.user.profileUpdate,
  validationMiddleware.validateBody(userValidationSchemas.updateProfile),
  asyncHandler(userController.updateCurrentUser)
);

/**
 * @swagger
 * /api/v1/users/me/change-password:
 *   post:
 *     summary: Change current user password
 *     description: Change the authenticated user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
 *                 description: New password (min 8 chars, must contain uppercase, lowercase, number, and special character)
 *                 example: "NewPassword123!"
 *           example:
 *             currentPassword: "currentPassword123"
 *             newPassword: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Invalid current password or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_PASSWORD"
 *                 message: "Current password is incorrect"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/me/change-password',
  rateLimitMiddleware.user.passwordChange,
  validationMiddleware.validateBody(userValidationSchemas.changePassword),
  asyncHandler(userController.changePassword)
);

/**
 * @route   PUT /api/v1/users/me/preferences
 * @desc    Update user preferences
 * @access  Private
 * @body    { theme?, language?, notifications?, timezone? }
 */
router.put(
  '/me/preferences',
  validationMiddleware.validateBody(userValidationSchemas.updatePreferences),
  asyncHandler(userController.updatePreferences)
);

/**
 * @route   GET /api/v1/users/me/sessions
 * @desc    Get current user sessions
 * @access  Private
 */
router.get(
  '/me/sessions',
  asyncHandler(userController.getUserSessions)
);

/**
 * @route   DELETE /api/v1/users/me/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 * @params  sessionId
 */
router.delete(
  '/me/sessions/:sessionId',
  validationMiddleware.validateParams({
    sessionId: { required: true, type: 'string' }
  }),
  asyncHandler(userController.revokeSession)
);

/**
 * @route   POST /api/v1/users/me/avatar
 * @desc    Upload user avatar
 * @access  Private
 * @body    FormData with 'avatar' file
 */
router.post(
  '/me/avatar',
  uploadMiddleware.single('avatar'),
  asyncHandler(userController.uploadAvatar)
);

/**
 * @route   DELETE /api/v1/users/me/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
router.delete(
  '/me/avatar',
  asyncHandler(userController.removeAvatar)
);

// Administrative user management routes (require admin permissions)

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin/Manager)
 * @query   page?, limit?, search?, role?, status?, sortBy?, sortOrder?
 */
router.get(
  '/',
  authMiddleware.requirePermission('users.read'),
  validationMiddleware.validateQuery(userValidationSchemas.getUsersQuery),
  asyncHandler(userController.getUsers)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin/Manager)
 * @params  id
 * @query   includeHistory?, includeSessions?
 */
router.get(
  '/:id',
  authMiddleware.requirePermission('users.read'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    includeHistory: { required: false, type: 'boolean' },
    includeSessions: { required: false, type: 'boolean' }
  }),
  asyncHandler(userController.getUserById)
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Private (Admin)
 * @body    { email, password, firstName, lastName, role?, permissions?, company? }
 */
router.post(
  '/',
  authMiddleware.requirePermission('users.create'),
  rateLimitMiddleware.user.creation,
  validationMiddleware.validateBody(userValidationSchemas.createUser),
  asyncHandler(userController.createUser)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin/Manager)
 * @params  id
 * @body    { firstName?, lastName?, email?, role?, permissions?, status? }
 */
router.put(
  '/:id',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(userValidationSchemas.updateUser),
  asyncHandler(userController.updateUser)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 * @params  id
 */
router.delete(
  '/:id',
  authMiddleware.requirePermission('users.delete'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(userController.deleteUser)
);

/**
 * @route   POST /api/v1/users/:id/activate
 * @desc    Activate user account
 * @access  Private (Admin/Manager)
 * @params  id
 */
router.post(
  '/:id/activate',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(userController.activateUser)
);

/**
 * @route   POST /api/v1/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (Admin/Manager)
 * @params  id
 */
router.post(
  '/:id/deactivate',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(userController.deactivateUser)
);

/**
 * @route   POST /api/v1/users/:id/reset-password
 * @desc    Reset user password (admin)
 * @access  Private (Admin)
 * @params  id
 * @body    { newPassword?, sendEmail? }
 */
router.post(
  '/:id/reset-password',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateBody(userValidationSchemas.resetPassword),
  asyncHandler(userController.resetUserPassword)
);

/**
 * @route   POST /api/v1/users/:id/force-logout
 * @desc    Force logout user from all sessions
 * @access  Private (Admin)
 * @params  id
 */
router.post(
  '/:id/force-logout',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  asyncHandler(userController.forceLogoutUser)
);

/**
 * @route   GET /api/v1/users/:id/activity
 * @desc    Get user activity log
 * @access  Private (Admin/Manager)
 * @params  id
 * @query   page?, limit?, startDate?, endDate?, action?
 */
router.get(
  '/:id/activity',
  authMiddleware.requirePermission('users.read'),
  validationMiddleware.validateParams({
    id: { required: true, type: 'string' }
  }),
  validationMiddleware.validateQuery({
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' },
    action: { required: false, type: 'string' }
  }),
  asyncHandler(userController.getUserActivity)
);

// Bulk operations

/**
 * @route   POST /api/v1/users/bulk-update
 * @desc    Bulk update users
 * @access  Private (Admin)
 * @body    { userIds, updates }
 */
router.post(
  '/bulk-update',
  authMiddleware.requirePermission('users.update'),
  validationMiddleware.validateBody(userValidationSchemas.bulkUpdate),
  asyncHandler(userController.bulkUpdateUsers)
);

/**
 * @route   POST /api/v1/users/bulk-delete
 * @desc    Bulk delete users
 * @access  Private (Admin)
 * @body    { userIds }
 */
router.post(
  '/bulk-delete',
  authMiddleware.requirePermission('users.delete'),
  validationMiddleware.validateBody({
    userIds: { required: true, type: 'array', items: { type: 'string' } }
  }),
  asyncHandler(userController.bulkDeleteUsers)
);

// Statistics and analytics

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin/Manager)
 * @query   timeRange?, groupBy?
 */
router.get(
  '/stats',
  authMiddleware.requirePermission('users.read'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['24h', '7d', '30d', '90d', '1y'] },
    groupBy: { required: false, type: 'string', enum: ['day', 'week', 'month'] }
  }),
  asyncHandler(userController.getUserStats)
);

// Import/Export

/**
 * @route   GET /api/v1/users/export
 * @desc    Export users data
 * @access  Private (Admin)
 * @query   format?, filters?
 */
router.get(
  '/export',
  authMiddleware.requirePermission('users.read'),
  validationMiddleware.validateQuery({
    format: { required: false, type: 'string', enum: ['csv', 'xlsx', 'json'] },
    role: { required: false, type: 'string' },
    status: { required: false, type: 'string' },
    startDate: { required: false, type: 'string', format: 'date' },
    endDate: { required: false, type: 'string', format: 'date' }
  }),
  asyncHandler(userController.exportUsers)
);

/**
 * @route   POST /api/v1/users/import
 * @desc    Import users data
 * @access  Private (Admin)
 * @body    FormData with 'file' (CSV/XLSX)
 */
router.post(
  '/import',
  authMiddleware.requirePermission('users.create'),
  uploadMiddleware.single('file'),
  asyncHandler(userController.importUsers)
);

// Team and role management

/**
 * @route   GET /api/v1/users/roles
 * @desc    Get available user roles
 * @access  Private (Admin/Manager)
 */
router.get(
  '/roles',
  authMiddleware.requirePermission('users.read'),
  asyncHandler(userController.getAvailableRoles)
);

/**
 * @route   GET /api/v1/users/permissions
 * @desc    Get available permissions
 * @access  Private (Admin/Manager)
 */
router.get(
  '/permissions',
  authMiddleware.requirePermission('users.read'),
  asyncHandler(userController.getAvailablePermissions)
);

/**
 * @route   GET /api/v1/users/teams
 * @desc    Get users grouped by teams
 * @access  Private
 * @query   includeInactive?
 */
router.get(
  '/teams',
  validationMiddleware.validateQuery({
    includeInactive: { required: false, type: 'boolean' }
  }),
  asyncHandler(userController.getUsersByTeams)
);

// Health check for user service
/**
 * @route   GET /api/v1/users/health
 * @desc    User service health check
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'users',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as userRoutes };

// Export route information for documentation
export const userRouteInfo = {
  basePath: '/users',
  routes: [
    {
      method: 'GET',
      path: '/me',
      description: 'Get current user profile',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/me',
      description: 'Update current user profile',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/me/change-password',
      description: 'Change current user password',
      auth: true,
      permissions: []
    },
    {
      method: 'PUT',
      path: '/me/preferences',
      description: 'Update user preferences',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/me/sessions',
      description: 'Get current user sessions',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/me/sessions/:sessionId',
      description: 'Revoke specific session',
      auth: true,
      permissions: []
    },
    {
      method: 'POST',
      path: '/me/avatar',
      description: 'Upload user avatar',
      auth: true,
      permissions: []
    },
    {
      method: 'DELETE',
      path: '/me/avatar',
      description: 'Remove user avatar',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/',
      description: 'Get all users with filtering',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'GET',
      path: '/:id',
      description: 'Get user by ID',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'POST',
      path: '/',
      description: 'Create new user',
      auth: true,
      permissions: ['users.create']
    },
    {
      method: 'PUT',
      path: '/:id',
      description: 'Update user',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'DELETE',
      path: '/:id',
      description: 'Delete user',
      auth: true,
      permissions: ['users.delete']
    },
    {
      method: 'POST',
      path: '/:id/activate',
      description: 'Activate user account',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'POST',
      path: '/:id/deactivate',
      description: 'Deactivate user account',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'POST',
      path: '/:id/reset-password',
      description: 'Reset user password (admin)',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'POST',
      path: '/:id/force-logout',
      description: 'Force logout user from all sessions',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'GET',
      path: '/:id/activity',
      description: 'Get user activity log',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'POST',
      path: '/bulk-update',
      description: 'Bulk update users',
      auth: true,
      permissions: ['users.update']
    },
    {
      method: 'POST',
      path: '/bulk-delete',
      description: 'Bulk delete users',
      auth: true,
      permissions: ['users.delete']
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get user statistics',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'GET',
      path: '/export',
      description: 'Export users data',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'POST',
      path: '/import',
      description: 'Import users data',
      auth: true,
      permissions: ['users.create']
    },
    {
      method: 'GET',
      path: '/roles',
      description: 'Get available user roles',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'GET',
      path: '/permissions',
      description: 'Get available permissions',
      auth: true,
      permissions: ['users.read']
    },
    {
      method: 'GET',
      path: '/teams',
      description: 'Get users grouped by teams',
      auth: true,
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'User service health check',
      auth: true,
      permissions: []
    }
  ]
};