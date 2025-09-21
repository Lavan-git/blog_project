import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    
    logger.info('📦 Connected to MongoDB successfully', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}

/**
 * Clear all data from database (used in tests)
 */
export async function clearDatabase(): Promise<void> {
  if (config.isTest) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    logger.info('Database cleared');
  } else {
    throw new Error('Cannot clear database in non-test environment');
  }
}
