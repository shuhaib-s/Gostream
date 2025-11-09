import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

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
 * Connect to database and verify connection
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Verify database tables exist
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    logger.info('Database tables verified');
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

