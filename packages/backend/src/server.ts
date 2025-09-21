import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { logger, httpLogStream } from './utils/logger.js';
import { corsOptions, generalRateLimit } from './middleware/security.js';
import { HTTP_STATUS, createApiResponse, createErrorResponse } from '@repo/shared';

// Import routes
import authRoutes from './routes/auth.routes.js';
import postsRoutes from './routes/posts.routes.js';

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// MongoDB injection protection
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP request logging
if (config.isDev) {
  app.use(morgan('combined', { stream: httpLogStream }));
}

// Rate limiting
app.use(generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json(
    createApiResponse(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.env,
        version: '1.0.0',
      },
      'Server is running'
    )
  );
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json(
    createApiResponse({
      name: 'Professional MERN Blog API',
      version: '1.0.0',
      description:
        'A professional blog API built with Express.js, MongoDB, and TypeScript',
      documentation: '/api-docs',
      endpoints: {
        auth: '/api/auth',
        posts: '/api/posts',
        health: '/health',
      },
    })
  );
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json(createErrorResponse('API endpoint not found'));
});

// ✅ Serve frontend build (React Vite dist/public)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Fallback for React Router SPA (non-API routes)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res
      .status(HTTP_STATUS.NOT_FOUND)
      .json(createErrorResponse('API endpoint not found'));
  }
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    if (config.isProd) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse('Internal server error'));
      return;
    }

    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse(err.message, undefined));
  }
);

// Start server
async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(
        `🚀 Server running on ${config.server.host}:${config.server.port}`,
        {
          environment: config.env,
          port: config.server.port,
          host: config.server.host,
        }
      );
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

startServer();

export default app;
