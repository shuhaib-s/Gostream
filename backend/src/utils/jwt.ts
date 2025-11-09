import jwt from 'jsonwebtoken';
import config from '../config';
import logger from './logger';

export interface JwtPayload {
  userId: string;
}

/**
 * Generate JWT token for authenticated user
 * @param userId - User ID to encode in token
 * @returns JWT token string
 */
export const generateToken = (userId: string): string => {
  try {
    const payload: JwtPayload = { userId };
    
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    } as jwt.SignOptions);

    logger.debug('JWT token generated', { userId });
    return token;
  } catch (error) {
    logger.error('Failed to generate JWT token', error as Error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify and decode JWT token
 * @param token - JWT token string
 * @returns Decoded payload with userId
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired', { error: error.message });
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      throw new Error('Invalid token');
    }
    
    logger.error('JWT verification failed', error as Error);
    throw new Error('Token verification failed');
  }
};

/**
 * Decode JWT token without verification (use cautiously)
 * Useful for debugging or extracting info from expired tokens
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    logger.error('Failed to decode JWT token', error as Error);
    return null;
  }
};

