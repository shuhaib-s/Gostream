import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { DatabaseError } from '../utils/errors';

/**
 * Base Repository Pattern
 * 
 * Provides common database operations and error handling.
 * All specific repositories extend this class.
 * 
 * Benefits:
 * - Centralized error handling
 * - Consistent logging
 * - Easy to add caching layer in the future
 * - Separation of concerns (business logic vs data access)
 */
export abstract class BaseRepository {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(operation: string, error: any): never {
    logger.error(`${this.modelName} ${operation} failed`, {
      error: error.message,
      code: error.code,
    });
    
    throw new DatabaseError(`Failed to ${operation.toLowerCase()} ${this.modelName.toLowerCase()}`);
  }

  /**
   * Log database operation
   */
  protected logOperation(operation: string, details?: any): void {
    logger.query(operation, this.modelName);
    if (details) {
      logger.debug(`${this.modelName} ${operation}`, details);
    }
  }
}

