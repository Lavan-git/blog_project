import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import type { JwtPayload, AuthResponse } from '@repo/shared';
import { UnauthorizedError } from '@repo/shared';
import type { IUserDocument } from '../models/User.js';

export class JwtService {
  /**
   * Generate access token
   */
  static generateAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      userId,
      email,
    };

    return (jwt.sign as any)(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: 'professional-mern-blog',
      audience: 'professional-mern-blog-users',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      userId,
      email,
    };

    return (jwt.sign as any)(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'professional-mern-blog',
      audience: 'professional-mern-blog-users',
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(userId: string, email: string): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret, {
        issuer: 'professional-mern-blog',
        audience: 'professional-mern-blog-users',
      }) as JwtPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'professional-mern-blog',
        audience: 'professional-mern-blog-users',
      }) as JwtPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  /**
   * Create auth response with tokens
   */
  static createAuthResponse(user: IUserDocument): AuthResponse {
    const tokens = this.generateTokens(user._id, user.email);
    
    return {
      user: user.toPublic(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    return expiration.getTime() < Date.now();
  }

  /**
   * Get token payload without verification (for debugging/logging)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export default JwtService;
