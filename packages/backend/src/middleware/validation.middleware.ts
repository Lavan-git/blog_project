import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError, formatValidationErrors, HTTP_STATUS } from '@repo/shared';
import { logger } from '../utils/logger.js';

/**
 * Validation middleware factory
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      
      // Replace request body with validated data (this removes any extra fields)
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        
        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors: formattedErrors,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }

      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate query parameters
      const validatedQuery = schema.parse(req.query);
      
      // Replace request query with validated data
      req.query = validatedQuery as any;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        
        logger.warn('Query validation failed', {
          path: req.path,
          method: req.method,
          errors: formattedErrors,
          query: req.query,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid query parameters',
          errors: formattedErrors,
        });
        return;
      }

      logger.error('Query validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Validate route parameters
 */
export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate route parameters
      const validatedParams = schema.parse(req.params);
      
      // Replace request params with validated data
      req.params = validatedParams;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        
        logger.warn('Params validation failed', {
          path: req.path,
          method: req.method,
          errors: formattedErrors,
          params: req.params,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid route parameters',
          errors: formattedErrors,
        });
        return;
      }

      logger.error('Params validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * MongoDB ObjectId validation schema
 */
export const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});

/**
 * Common parameter schemas
 */
export const commonSchemas = {
  mongoId: mongoIdSchema,
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
  sorting: z.object({
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  search: z.object({
    search: z.string().optional(),
  }),
};

/**
 * Combine multiple validation middlewares
 */
export function validateAll(options: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  const middlewares = [];

  if (options.params) {
    middlewares.push(validateParams(options.params));
  }

  if (options.query) {
    middlewares.push(validateQuery(options.query));
  }

  if (options.body) {
    middlewares.push(validate(options.body));
  }

  return middlewares;
}

export default {
  validate,
  validateQuery,
  validateParams,
  validateAll,
  commonSchemas,
};
