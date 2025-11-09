/**
 * URL Constants
 * All application URLs in one place
 */

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',

  // Projects
  PROJECTS: '/api/projects',
  PROJECT_DETAIL: (id: string) => `/api/projects/${id}`,
  PROJECT_DELETE: (id: string) => `/api/projects/${id}`,

  // Destinations
  DESTINATIONS_CREATE: (projectId: string) => `/api/projects/${projectId}/destinations`,
  DESTINATIONS_UPDATE: (id: string) => `/api/projects/destinations/${id}`,
  DESTINATIONS_DELETE: (id: string) => `/api/projects/destinations/${id}`,

  // Streams
  STREAMS: (projectId: string) => `/api/projects/${projectId}/streams`,
  STREAM_START: (projectId: string) => `/api/projects/${projectId}/streams/start`,
  STREAM_STOP: (projectId: string) => `/api/projects/${projectId}/streams/stop`,
};

// RTMP URLs
export const RTMP_CONFIG = {
  DEFAULT_SERVER: process.env.NEXT_PUBLIC_RTMP_URL || 'rtmp://localhost/live',
  DEFAULT_PORT: parseInt(process.env.NEXT_PUBLIC_RTMP_PORT || '1935', 10),
  HLS_BASE_URL: process.env.NEXT_PUBLIC_HLS_URL || 'http://localhost:8080/hls',
};

// External Documentation URLs
export const DOCS_URLS = {
  OBS_SETUP: 'https://obsproject.com/wiki/OBS-Studio-Quickstart',
  STREAMLABS_SETUP: 'https://streamlabs.com/content-hub/post/how-to-stream-with-streamlabs-obs',
  VMIX_SETUP: 'https://www.vmix.com/help/',
  XSPLIT_SETUP: 'https://www.xsplit.com/broadcaster/manual',
  ZOOM_SETUP: 'https://support.zoom.us/hc/en-us/articles/115001777826-Live-Streaming-Meetings-or-Webinars-Using-a-Custom-Service',
};

// Social Media URLs
export const SOCIAL_URLS = {
  GITHUB: 'https://github.com',
  TWITTER: 'https://twitter.com',
  DISCORD: 'https://discord.com',
  YOUTUBE: 'https://youtube.com',
};

// App Routes
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

