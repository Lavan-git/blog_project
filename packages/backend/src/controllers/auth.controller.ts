import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { JwtService } from '../services/jwt.service.js';
import { logger } from '../utils/logger.js';
import {
  HTTP_STATUS,
  createApiResponse,
  createErrorResponse,
  UnauthorizedError,
  ValidationError,
  type CreateUser,
  type LoginUser,
} from '@repo/shared';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUser = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        res.status(HTTP_STATUS.CONFLICT).json(
          createErrorResponse('User with this email already exists')
        );
        return;
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate tokens
      const authResponse = JwtService.createAuthResponse(user);

      // Store refresh token in user document
      user.refreshTokens.push(authResponse.tokens.refreshToken);
      await user.save();

      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(authResponse, 'User registered successfully')
      );
    } catch (error) {
      logger.error('Registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body?.email,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Registration failed')
      );
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginUser = req.body;

      // Find user with password
      const user = await (User as any).findByEmailWithPassword(email);
      if (!user) {
        logger.warn('Login attempt with non-existent email', {
          email,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid email or password')
        );
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', {
          email,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid email or password')
        );
        return;
      }

      // Generate tokens
      const authResponse = JwtService.createAuthResponse(user);

      // Store refresh token in user document
      user.refreshTokens.push(authResponse.tokens.refreshToken);
      await user.save();

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      res.json(createApiResponse(authResponse, 'Login successful'));
    } catch (error) {
      logger.error('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body?.email,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Login failed')
      );
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Refresh token is required')
        );
        return;
      }

      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Find user and check if refresh token exists
      const user = await (User as any).findByRefreshToken(refreshToken);
      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid refresh token')
        );
        return;
      }

      // Generate new tokens
      const authResponse = JwtService.createAuthResponse(user);

      // Replace old refresh token with new one
      const tokenIndex = user.refreshTokens.indexOf(refreshToken);
      if (tokenIndex !== -1) {
        user.refreshTokens[tokenIndex] = authResponse.tokens.refreshToken;
        await user.save();
      }

      logger.info('Tokens refreshed successfully', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      res.json(createApiResponse(authResponse, 'Tokens refreshed successfully'));
    } catch (error) {
      logger.warn('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip,
      });

      if (error instanceof UnauthorizedError) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(createErrorResponse(error.message));
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Token refresh failed')
      );
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Find user and remove refresh token
        const user = await (User as any).findByRefreshToken(refreshToken);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(
            (token: string) => token !== refreshToken
          );
          await user.save();
        }
      }

      logger.info('User logged out', {
        userId: req.user?._id,
        ip: req.ip,
      });

      res.json(createApiResponse(null, 'Logged out successfully'));
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?._id,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Logout failed')
      );
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Authentication required')
        );
        return;
      }

      res.json(createApiResponse(req.user.toPublic(), 'Profile retrieved successfully'));
    } catch (error) {
      logger.error('Get profile failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?._id,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Failed to retrieve profile')
      );
    }
  }

  /**
   * Logout from all devices (invalidate all refresh tokens)
   */
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Authentication required')
        );
        return;
      }

      // Clear all refresh tokens
      req.user.refreshTokens = [];
      await req.user.save();

      logger.info('User logged out from all devices', {
        userId: req.user._id,
        ip: req.ip,
      });

      res.json(createApiResponse(null, 'Logged out from all devices successfully'));
    } catch (error) {
      logger.error('Logout all failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?._id,
        ip: req.ip,
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse('Logout all failed')
      );
    }
  }
}

export default AuthController;
