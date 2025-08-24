/**
 * Authentication Routes
 * Defines all authentication and authorization endpoints
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { authValidationSchemas } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Initialize services and controller
const authService = new AuthService();
const userService = new UserService();
const authController = new AuthController(authService, userService);

// Public authentication routes (no auth required)

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email/username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             email_login:
 *               summary: Login with email
 *               value:
 *                 email: "inspector@example.com"
 *                 password: "securePassword123"
 *                 rememberMe: true
 *             username_login:
 *               summary: Login with username
 *               value:
 *                 username: "inspector_user"
 *                 password: "securePassword123"
 *                 rememberMe: false
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/login',
  rateLimitMiddleware.auth.login,
  validationMiddleware.validateBody(authValidationSchemas.login),
  asyncHandler(authController.login)
);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: User registration
 *     description: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, acceptTerms]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password (minimum 8 characters)
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               username:
 *                 type: string
 *                 description: Optional username
 *               phone:
 *                 type: string
 *                 description: Optional phone number
 *               company:
 *                 type: string
 *                 description: Optional company name
 *               acceptTerms:
 *                 type: boolean
 *                 description: Must accept terms and conditions
 *           example:
 *             email: "newuser@example.com"
 *             password: "securePassword123"
 *             firstName: "John"
 *             lastName: "Doe"
 *             username: "johndoe"
 *             phone: "+1234567890"
 *             company: "Example Corp"
 *             acceptTerms: true
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/register',
  rateLimitMiddleware.auth.register,
  validationMiddleware.validateBody(authValidationSchemas.register),
  asyncHandler(authController.register)
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (can also be provided via cookie)
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many refresh attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/refresh',
  rateLimitMiddleware.auth.refresh,
  validationMiddleware.validateBody(authValidationSchemas.refreshToken),
  asyncHandler(authController.refreshToken)
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many password reset attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/forgot-password',
  rateLimitMiddleware.auth.passwordReset,
  validationMiddleware.validateBody(authValidationSchemas.forgotPassword),
  asyncHandler(authController.forgotPassword)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token, newPassword }
 */
router.post(
  '/reset-password',
  rateLimitMiddleware.auth.passwordReset,
  validationMiddleware.validateBody(authValidationSchemas.resetPassword),
  asyncHandler(authController.resetPassword)
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 * @body    { token }
 */
router.post(
  '/verify-email',
  rateLimitMiddleware.auth.emailVerification,
  validationMiddleware.validateBody(authValidationSchemas.verifyEmail),
  asyncHandler(authController.verifyEmail)
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 * @body    { email }
 */
router.post(
  '/resend-verification',
  rateLimitMiddleware.auth.emailVerification,
  validationMiddleware.validateBody(authValidationSchemas.resendVerification),
  asyncHandler(authController.resendVerification)
);

// Protected authentication routes (require authentication)

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout (current session)
 *     description: Logout user from current session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (can also be provided via cookie)
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/logout',
  authMiddleware.authenticate,
  asyncHandler(authController.logout)
);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post(
  '/logout-all',
  authMiddleware.authenticate,
  asyncHandler(authController.logoutAll)
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.post(
  '/change-password',
  authMiddleware.authenticate,
  rateLimitMiddleware.auth.passwordChange,
  validationMiddleware.validateBody(authValidationSchemas.changePassword),
  asyncHandler(authController.changePassword)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware.authenticate,
  asyncHandler(authController.getCurrentUser)
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get user sessions
 * @access  Private
 */
router.get(
  '/sessions',
  authMiddleware.authenticate,
  asyncHandler(authController.getUserSessions)
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 * @params  sessionId
 */
router.delete(
  '/sessions/:sessionId',
  authMiddleware.authenticate,
  validationMiddleware.validateParams({
    sessionId: { required: true, type: 'string' }
  }),
  asyncHandler(authController.revokeSession)
);

/**
 * @route   GET /api/v1/auth/validate
 * @desc    Validate current session
 * @access  Private
 */
router.get(
  '/validate',
  authMiddleware.authenticate,
  asyncHandler(authController.validateSession)
);

/**
 * @route   GET /api/v1/auth/permissions/:permission
 * @desc    Check if user has specific permission
 * @access  Private
 * @params  permission
 */
router.get(
  '/permissions/:permission',
  authMiddleware.authenticate,
  validationMiddleware.validateParams({
    permission: { required: true, type: 'string' }
  }),
  asyncHandler(authController.checkPermission)
);

/**
 * @route   GET /api/v1/auth/roles/:role
 * @desc    Check if user has specific role
 * @access  Private
 * @params  role
 */
router.get(
  '/roles/:role',
  authMiddleware.authenticate,
  validationMiddleware.validateParams({
    role: { required: true, type: 'string' }
  }),
  asyncHandler(authController.checkRole)
);

// Admin-only authentication routes

/**
 * @route   GET /api/v1/auth/stats
 * @desc    Get authentication statistics
 * @access  Private (Admin only)
 * @query   timeRange?
 */
router.get(
  '/stats',
  authMiddleware.authenticate,
  authMiddleware.requireRole('admin'),
  validationMiddleware.validateQuery({
    timeRange: { required: false, type: 'string', enum: ['1h', '24h', '7d', '30d', '90d'] }
  }),
  asyncHandler(authController.getAuthStats)
);

// Health check for auth service
/**
 * @route   GET /api/v1/auth/health
 * @desc    Auth service health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Export the router
export { router as authRoutes };

// Export route information for documentation
export const authRouteInfo = {
  basePath: '/auth',
  routes: [
    {
      method: 'POST',
      path: '/login',
      description: 'User login with email/username and password',
      auth: false,
      rateLimit: 'strict'
    },
    {
      method: 'POST',
      path: '/register',
      description: 'User registration with required profile information',
      auth: false,
      rateLimit: 'strict'
    },
    {
      method: 'POST',
      path: '/refresh',
      description: 'Refresh access token using refresh token',
      auth: false,
      rateLimit: 'moderate'
    },
    {
      method: 'POST',
      path: '/forgot-password',
      description: 'Request password reset email',
      auth: false,
      rateLimit: 'strict'
    },
    {
      method: 'POST',
      path: '/reset-password',
      description: 'Reset password using reset token',
      auth: false,
      rateLimit: 'strict'
    },
    {
      method: 'POST',
      path: '/verify-email',
      description: 'Verify email address using verification token',
      auth: false,
      rateLimit: 'moderate'
    },
    {
      method: 'POST',
      path: '/resend-verification',
      description: 'Resend email verification',
      auth: false,
      rateLimit: 'moderate'
    },
    {
      method: 'POST',
      path: '/logout',
      description: 'Logout from current session',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'POST',
      path: '/logout-all',
      description: 'Logout from all devices/sessions',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'POST',
      path: '/change-password',
      description: 'Change user password',
      auth: true,
      rateLimit: 'moderate'
    },
    {
      method: 'GET',
      path: '/me',
      description: 'Get current user profile',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/sessions',
      description: 'Get user active sessions',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'DELETE',
      path: '/sessions/:sessionId',
      description: 'Revoke specific session',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/validate',
      description: 'Validate current session',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/permissions/:permission',
      description: 'Check user permission',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/roles/:role',
      description: 'Check user role',
      auth: true,
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Get authentication statistics (Admin only)',
      auth: true,
      role: 'admin',
      rateLimit: 'none'
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Auth service health check',
      auth: false,
      rateLimit: 'none'
    }
  ]
};