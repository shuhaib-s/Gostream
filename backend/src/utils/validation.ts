/**
 * Input validation utilities for production-ready API
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize string input (remove potentially harmful characters)
 * SECURITY: Enhanced sanitization to prevent XSS and injection attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and JavaScript
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove SQL injection attempts
    .replace(/(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/gi, '')
    // Remove dangerous characters
    .replace(/[<>]/g, '')
    // Limit length to prevent buffer overflow
    .substring(0, 1000);
};

/**
 * Sanitize name input (for user names, project names)
 */
export const sanitizeName = (name: string): string => {
  if (typeof name !== 'string') return '';

  return name
    .trim()
    // Remove HTML and script content
    .replace(/<[^>]*>/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Allow only alphanumeric, spaces, hyphens, underscores, apostrophes
    .replace(/[^a-zA-Z0-9\s\-_']/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Limit length
    .substring(0, 100);
};

/**
 * Validate and sanitize email
 */
export const validateAndSanitizeEmail = (email: string): { isValid: boolean; sanitized: string } => {
  if (typeof email !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  const sanitized = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return {
    isValid: emailRegex.test(sanitized) && sanitized.length <= 254,
    sanitized
  };
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate RTMP URL format
 */
export const isValidRtmpUrl = (url: string): boolean => {
  return url.startsWith('rtmp://') || url.startsWith('rtmps://');
};



