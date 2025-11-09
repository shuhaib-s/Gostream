/**
 * Constants Index
 * Central export point for all constants
 */

export * from './platforms';
export * from './urls';
export * from './theme';

// App Configuration
export const APP_CONFIG = {
  NAME: 'GoStream',
  TAGLINE: 'Be seen, everywhere',
  DESCRIPTION: 'Live stream on multiple platforms to reach more viewers faster.',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@gostream.io',
  MAX_DESTINATIONS: 10,
  MAX_PROJECT_NAME_LENGTH: 50,
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: false,
  ENABLE_CHAT: false,
  ENABLE_RECORDINGS: false,
  ENABLE_SCHEDULING: false,
  ENABLE_TEAM_MODE: false,
};

// Cookie Names
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
};

// Local Storage Keys (for non-sensitive data)
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LAST_PROJECT_ID: 'last_project_id',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  DESTINATION_ADDED: 'Destination added successfully!',
  DESTINATION_UPDATED: 'Destination updated successfully!',
  DESTINATION_DELETED: 'Destination deleted successfully!',
  STREAM_STARTED: 'Stream started successfully!',
  STREAM_STOPPED: 'Stream stopped successfully!',
  COPIED: 'Copied to clipboard!',
};

