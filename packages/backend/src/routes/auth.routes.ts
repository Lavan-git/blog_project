import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { authRateLimit } from '../middleware/security.js';
import { CreateUserSchema, LoginUserSchema } from '@repo/shared';
import { z } from 'zod';

const router = Router();

// Rate limiting for all auth routes
router.use(authRateLimit);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate(CreateUserSchema),
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(LoginUserSchema),
  AuthController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })),
  AuthController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Public
 */
router.post(
  '/logout',
  validate(z.object({
    refreshToken: z.string().optional(),
  })),
  AuthController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  AuthController.getProfile
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices (invalidate all refresh tokens)
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  AuthController.logoutAll
);

export default router;
