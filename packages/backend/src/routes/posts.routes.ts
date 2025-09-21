import { Router } from 'express';
import { PostsController } from '../controllers/posts.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, validateQuery, validateParams } from '../middleware/validation.middleware.js';
import { CreatePostSchema, UpdatePostSchema, PostQuerySchema } from '@repo/shared';
import { z } from 'zod';

const router = Router();

// All post routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination and filters
 * @access  Private
 */
router.get(
  '/',
  validateQuery(PostQuerySchema),
  PostsController.getPosts
);

/**
 * @route   GET /api/posts/stats
 * @desc    Get post statistics for current user
 * @access  Private
 */
router.get(
  '/stats',
  PostsController.getStats
);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateParams(z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID'),
  })),
  PostsController.getPost
);

/**
 * @route   POST /api/posts
 * @desc    Create new post
 * @access  Private
 */
router.post(
  '/',
  validate(CreatePostSchema),
  PostsController.createPost
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private
 */
router.put(
  '/:id',
  validateParams(z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID'),
  })),
  validate(UpdatePostSchema),
  PostsController.updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete(
  '/:id',
  validateParams(z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID'),
  })),
  PostsController.deletePost
);

export default router;
