import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * HTTP Request Logger Middleware
 * 
 * Logs all incoming HTTP requests with timing information.
 * Useful for monitoring and debugging in production.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.http(
      req.method,
      req.path,
      res.statusCode,
      duration
    );
  });

  next();
};


