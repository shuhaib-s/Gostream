import bcrypt from 'bcrypt';
import config from '../config';
import logger from './logger';

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    logger.debug('Password hashed successfully');
    return hash;
  } catch (error) {
    logger.error('Failed to hash password', error as Error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    logger.debug('Password comparison completed', { isMatch });
    return isMatch;
  } catch (error) {
    logger.error('Failed to compare passwords', error as Error);
    throw new Error('Password comparison failed');
  }
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Add more password rules as needed for production
  // Example: require uppercase, lowercase, numbers, special characters
  
  return { isValid: true };
};

