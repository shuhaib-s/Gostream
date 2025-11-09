import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Authentication Middleware
 * Verifies JWT token from cookies and attaches userId to request
 * Also supports Authorization header as fallback for API clients
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    // Priority 1: Try to get token from cookie
    token = req.cookies?.[config.jwt.cookieName];

    // Priority 2: Fallback to Authorization header (for API clients, mobile apps, etc.)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify and decode token
    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    logger.debug('Authentication successful', { userId: decoded.userId });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      logger.warn('Authentication failed', { error: (error as Error).message });
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};
