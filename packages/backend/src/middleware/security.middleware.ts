import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '@repo/shared';

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from unauthorized origin', { origin });
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
  ],
};

/**
 * General rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Authentication routes rate limiting (more strict)
 */
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
    });
  },
});

/**
 * Helmet security middleware configuration
 */
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
};

/**
 * MongoDB injection protection
 */
export const mongoSanitizeOptions = {
  replaceWith: '_',
  onSanitize: ({ req, key }: { req: Request; key: string }) => {
    logger.warn('MongoDB injection attempt detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      suspiciousKey: key,
    });
  },
};

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
    });
  });
  
  next();
}

/**
 * Error handling middleware for security
 */
export function securityErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Don't leak error details in production
  if (config.isProd) {
    logger.error('Security error occurred', {
      error: err.message,
      stack: err.stack,
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Internal server error',
    });
    return;
  }
  
  // In development, show detailed errors
  logger.error('Security error occurred', {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    path: req.path,
    method: req.method,
  });
  
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: err.message,
    stack: config.isDev ? err.stack : undefined,
  });
}

/**
 * Content type validation
 */
export function validateContentType(allowedTypes: string[] = ['application/json']) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }
    
    const contentType = req.get('Content-Type');
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      logger.warn('Invalid content type', {
        contentType,
        allowedTypes,
        ip: req.ip,
        path: req.path,
      });
      
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      });
      return;
    }
    
    next();
  };
}

/**
 * Configure all security middleware
 */
export function configureSecurity(app: any): void {
  // Basic security headers
  app.use(helmet(helmetOptions));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Compression
  app.use(compression());
  
  // MongoDB injection protection
  app.use(mongoSanitize(mongoSanitizeOptions));
  
  // Request logging
  if (config.isDev) {
    app.use(requestLogger);
  }
  
  // Content type validation for API routes
  app.use('/api', validateContentType());
  
  // General rate limiting
  app.use(generalRateLimit);
}

export default {
  corsOptions,
  generalRateLimit,
  authRateLimit,
  helmetOptions,
  mongoSanitizeOptions,
  requestLogger,
  securityErrorHandler,
  validateContentType,
  configureSecurity,
};
