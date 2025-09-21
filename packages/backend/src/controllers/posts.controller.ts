import { Request, Response } from 'express';
import { Post } from '../models/Post.js';
import { logger } from '../utils/logger.js';
import {
  HTTP_STATUS,
  createApiResponse,
  createErrorResponse,
  NotFoundError,
  ForbiddenError,
  type CreatePost,
  type UpdatePost,
  type PostQuery,
} from '@repo/shared';

export class PostsController {
  /**
   * Get all posts with pagination and filters
   */
  static async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const query: PostQuery = req.query as any;
      
      // Build filters (public posts only for non-authenticated users)
      const filters = {
        search: query.search,
        tags: query.tags,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };

      const { query: dbQuery, countQuery } = (Post as any).findWithFilters(filters);
      const [posts, total] = await Promise.all([
        dbQuery.exec(),
        countQuery.exec(),
      ]);

      const totalPages = Math.ceil(total / query.limit);

      res.json(createApiResponse({
        posts: posts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages: totalPages,
          hasNext: query.page < totalPages,
          hasPrev: query.page > 1,
        },
      }));
    } catch (error) {
      logger.error('Get posts failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to retrieve posts')
      );
    }
  }

  /**
   * Get single post by ID
   */
  static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse('Post not found')
        );
        return;
      }

      res.json(createApiResponse(post));
    } catch (error) {
      logger.error('Get post failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postId: req.params.id,
      });

      if (error instanceof Error && error.name === 'CastError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Invalid post ID')
        );
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to retrieve post')
      );
    }
  }

  /**
   * Create new post
   */
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const postData: CreatePost = req.body;
      const userId = req.jwtPayload!.userId;
      
      const post = new Post({
        ...postData,
        author: userId,
      });

      await post.save();
      await post.populate('author', 'name email');

      logger.info('Post created successfully', {
        postId: post._id,
        userId,
        title: post.title,
      });

      res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(post, 'Post created successfully')
      );
    } catch (error) {
      logger.error('Create post failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?._id,
        postData: req.body,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to create post')
      );
    }
  }

  /**
   * Update post
   */
  static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePost = req.body;
      const userId = req.jwtPayload!.userId;

      const post = await Post.findById(id);

      if (!post) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse('Post not found')
        );
        return;
      }

      // Check ownership
      if (post.author.toString() !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json(
          createErrorResponse('Not authorized to update this post')
        );
        return;
      }

      // Update fields
      Object.assign(post, updateData);
      await post.save();
      await post.populate('author', 'name email');

      logger.info('Post updated successfully', {
        postId: post._id,
        userId,
        title: post.title,
      });

      res.json(createApiResponse(post, 'Post updated successfully'));
    } catch (error) {
      logger.error('Update post failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postId: req.params.id,
        userId: req.user?._id,
      });

      if (error instanceof Error && error.name === 'CastError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Invalid post ID')
        );
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to update post')
      );
    }
  }

  /**
   * Delete post
   */
  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.jwtPayload!.userId;

      const post = await Post.findById(id);

      if (!post) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse('Post not found')
        );
        return;
      }

      // Check ownership
      if (post.author.toString() !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json(
          createErrorResponse('Not authorized to delete this post')
        );
        return;
      }

      await post.deleteOne();

      logger.info('Post deleted successfully', {
        postId: post._id,
        userId,
        title: post.title,
      });

      res.json(createApiResponse(null, 'Post deleted successfully'));
    } catch (error) {
      logger.error('Delete post failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        postId: req.params.id,
        userId: req.user?._id,
      });

      if (error instanceof Error && error.name === 'CastError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Invalid post ID')
        );
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to delete post')
      );
    }
  }
  /**
   * Get post statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.jwtPayload!.userId;
      const stats = await (Post as any).getStats(userId);
      
      res.json(createApiResponse(stats[0] || {
        totalPosts: 0,
        totalWords: 0,
        avgWordsPerPost: 0,
        totalTags: 0,
        uniqueTagsCount: 0,
      }));
    } catch (error) {
      logger.error('Get stats failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?._id,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to retrieve statistics')
      );
    }
  }
}

export default PostsController;
