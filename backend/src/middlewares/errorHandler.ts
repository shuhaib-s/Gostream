import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config';

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and returns
 * consistent error responses to the client.
 * 
 * Features:
 * - Distinguishes between operational and programming errors
 * - Logs errors appropriately
 * - Sends appropriate HTTP status codes
 * - Hides sensitive information in production
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error with appropriate level
  if (!isOperational || statusCode >= 500) {
    logger.error('Error occurred', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
      userId: (req as any).userId,
    });
  } else {
    logger.warn('Client error', {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Prepare error response
  const errorResponse: any = {
    error: message,
    statusCode,
  };

  // Include stack trace in development mode
  if (config.env === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 * Catches requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn('Route not found', { 
    path: req.path, 
    method: req.method 
  });
  
  res.status(404).json({
    error: 'Route not found',
    statusCode: 404,
    path: req.path,
  });
};


