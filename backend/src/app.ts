import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import config from './config';
import { configurePassport } from './config/passport';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import streamRoutes from './routes/streamRoutes';
import relayRoutes from './routes/relayRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';

/**
 * Express Application Setup
 * 
 * Production-ready configuration:
 * - CORS configured from environment
 * - Request logging for monitoring
 * - Proper error handling
 * - JSON parsing with size limits
 */

const app = express();

// Health check endpoint - MUST be before all middleware (for container health checks)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for HLS player
}));

// Rate limiting to prevent abuse - stricter limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced: Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip health check from rate limiting
  skip: (req) => req.path === '/health',
});

// Apply rate limiter to all routes
app.use(limiter);

// Stricter rate limit for auth routes - prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (increased window)
  max: 15, // Reduced: Limit each IP to 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

// CORS Configuration
// SECURITY: Never allow '*' origins - must specify exact domains
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());

    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // SECURITY: Explicitly reject '*' wildcard
    if (allowedOrigins.includes('*')) {
      console.error('🚨 SECURITY ERROR: CORS_ORIGIN cannot contain "*" wildcard');
      return callback(new Error('CORS configuration error - wildcard not allowed'));
    }

    // Only allow explicitly listed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Cookie parser - must be before routes
app.use(cookieParser());

// Initialize Passport for OAuth
configurePassport();
app.use(passport.initialize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (for production monitoring)
app.use(requestLogger);

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api', relayRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
