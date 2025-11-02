import mongoose from 'mongoose';
import config from '@/config/env';
import logger from '@/plugins/logger';
import { DatabaseError } from './errors';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDatabase = async (): Promise<void> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      logger.info('Connecting database...');
      await mongoose.connect(config.MONGO_DATABASE_URL);
      logger.info('Database connected');
      return;
    } catch (err) {
      retries++;
      logger.error({ err, retries }, `Database connection attempt ${retries} failed`);

      if (retries >= MAX_RETRIES) {
        throw new DatabaseError(
          `Failed to connect to database after ${MAX_RETRIES} attempts`,
          err,
        );
      }

      // Exponential backoff
      const delay = RETRY_DELAY_MS * Math.pow(2, retries - 1);
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected');
  } catch (err) {
    logger.error({ err }, 'Error disconnecting database');
    throw new DatabaseError('Failed to disconnect from database', err);
  }
};

/**
 * Health check function for database connection
 * Returns a function compatible with HealthCheck interface
 */
export const checkDatabaseHealth = () => {
  return async (): Promise<boolean> => {
    try {
      // Check if mongoose is connected
      if (mongoose.connection.readyState !== 1) {
        logger.warn('Database health check failed: not connected');
        return false;
      }

      // Ping the database to ensure it's responsive
      if (!mongoose.connection.db) {
        logger.warn('Database health check failed: db not available');
        return false;
      }
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (err) {
      logger.error({ err }, 'Database health check failed');
      return false;
    }
  };
};
