import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { userRepository } from '../repositories';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { isValidEmail, sanitizeName, validateAndSanitizeEmail } from '../utils/validation';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config';

/**
 * User Signup Controller
 * Creates a new user account with email and password
 */
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();

  try {
    const { email, password, name } = req.body;

    // Validate and sanitize input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    // SECURITY: Sanitize name input
    const sanitizedName = sanitizeName(name);
    if (sanitizedName.length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }

    if (sanitizedName.length > 100) {
      throw new ValidationError('Name must not exceed 100 characters');
    }

    // SECURITY: Validate and sanitize email
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.isValid) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.message || 'Invalid password');
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn('Signup attempt with existing email', { email });
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with sanitized inputs
    const user = await userRepository.create({
      email: emailValidation.sanitized,
      name: sanitizedName,
      passwordHash,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token in httpOnly cookie
    res.cookie(config.jwt.cookieName, token, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
    });

    const duration = Date.now() - startTime;
    logger.info('User signup successful', { userId: user.id, email, duration: `${duration}ms` });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login Controller
 * Authenticates user with email and password
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // SECURITY: Validate and sanitize email
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.isValid) {
      throw new ValidationError('Invalid email format');
    }

    // Find user
    const user = await userRepository.findByEmail(emailValidation.sanitized);
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email: emailValidation.sanitized });
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      logger.warn('Login attempt for OAuth-only user', { email: emailValidation.sanitized, userId: user.id });
      throw new AuthenticationError('This account uses Google Sign-In. Please sign in with Google.');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      logger.warn('Login attempt with incorrect password', { email: emailValidation.sanitized, userId: user.id });
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token in httpOnly cookie
    res.cookie(config.jwt.cookieName, token, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
    });

    const duration = Date.now() - startTime;
    logger.info('User login successful', { userId: user.id, email: emailValidation.sanitized, duration: `${duration}ms` });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Logout Controller
 * Clears the authentication cookie
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear the auth cookie
    res.clearCookie(config.jwt.cookieName, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
    });

    logger.info('User logout successful');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Controller
 * Returns the currently authenticated user's information
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      throw new AuthenticationError('Not authenticated');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth Callback Handler
 * Handles successful Google authentication
 */
export const googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as User;
    
    if (!user) {
      throw new AuthenticationError('Authentication failed');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token in httpOnly cookie
    res.cookie(config.jwt.cookieName, token, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
    });

    logger.info('Google OAuth login successful', { userId: user.id, email: user.email });

    // Redirect to frontend dashboard
    const frontendUrl = config.cors.origin.split(',')[0]; // Get first origin
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    next(error);
  }
};
