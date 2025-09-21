import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@repo/shared';
import { JwtService } from '../services/jwt.service.js';
import { User, type IUserDocument } from '../models/User.js';
import { logger } from '../utils/logger.js';

// Extend Express Request interface to include user and JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      jwtPayload?: {
        userId: string;
        email: string;
      };
    }
  }
}

// Request with authenticated user - uses the JWT payload structure
export interface AuthRequest extends Request {
  user: IUserDocument;
  jwtPayload: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to authenticate user with JWT
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = JwtService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // Verify the token
    const payload = JwtService.verifyAccessToken(token);
    
    // Find user by ID
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request object
    req.user = user;
    
    // Add JWT payload for AuthRequest compatibility
    (req as any).jwtPayload = {
      userId: payload.userId,
      email: payload.email
    };
    
    logger.debug('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });

    if (error instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = JwtService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Verify the token
    const payload = JwtService.verifyAccessToken(token);
    
    // Find user by ID
    const user = await User.findById(payload.userId);
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is provided but invalid, continue without authentication
    logger.debug('Optional authentication failed, continuing without auth', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });
    next();
  }
}

/**
 * Middleware to check if user owns the resource
 */
export function requireOwnership(resourceUserIdField: string = 'author') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const resourceUserId = req.params.userId || req.body[resourceUserIdField];
      const currentUserId = req.user._id.toString();

      if (resourceUserId && resourceUserId !== currentUserId) {
        throw new ForbiddenError('You can only access your own resources');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Middleware to check user roles (if implementing role-based access)
 */
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // For now, we don't have roles in our user model
      // This is a placeholder for future role-based access control
      const userRole = 'user'; // req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

export default {
  authenticate,
  optionalAuthenticate,
  requireOwnership,
  requireRole,
};
