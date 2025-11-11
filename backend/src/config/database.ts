import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import config from './index';
/**
 * Singleton Prisma Client Instance
 * 
 * This ensures we use a single database connection pool throughout the application.
 * Multiple PrismaClient instances can exhaust database connections.
 * 
 * For production with 1000+ concurrent users:
 * - Connection pooling is handled automatically by Prisma
 * - Default pool size is calculated based on: num_physical_cpus * 2 + 1
 * - Can be configured via DATABASE_URL: ?connection_limit=20
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => { 
  process.env.DATABASE_URL = config.database.url;
  return new PrismaClient({ 
    log: ['warn', 'error'],
  });
};

// Use global variable in development to prevent multiple instances during hot reload
const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Connect to database and optionally verify tables exist
 */
export const connectDatabase = async (verifyTables: boolean = true): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Only verify tables if requested (skip on first connection before migrations)
    if (verifyTables) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
        logger.info('Database tables verified');
      } catch (tableError: any) {
        // If tables don't exist, that's okay - migrations will create them
        if (tableError.code === 'P2010' || tableError.meta?.code === '42P01') {
          logger.warn('Database tables not found - migrations will create them');
        } else {
          throw tableError;
        }
      }
    }
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
};

/**
 * Disconnect from database gracefully
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
    throw error;
  }
};

export default prisma;

