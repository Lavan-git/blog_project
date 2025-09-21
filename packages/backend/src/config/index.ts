import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('localhost'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_TEST_URI: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  FROM_NAME: z.string().optional(),
  SESSION_SECRET: z.string().min(32).default('your-session-secret-here'),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

// Configuration object
export const config_obj = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProd: env.NODE_ENV === 'production',
  
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  
  database: {
    uri: env.NODE_ENV === 'test' ? env.MONGODB_TEST_URI || env.MONGODB_URI : env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  
  cors: {
    origins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    credentials: true,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    authMaxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromEmail: env.FROM_EMAIL,
    fromName: env.FROM_NAME,
  },
};

// Validate required configuration
if (!config_obj.database.uri) {
  throw new Error('MongoDB URI is required. Please set MONGODB_URI environment variable.');
}

if (config_obj.isProd) {
  if (!config_obj.jwt.accessSecret || config_obj.jwt.accessSecret.includes('your-')) {
    throw new Error('JWT secrets must be set in production environment.');
  }
}

export default config_obj;
