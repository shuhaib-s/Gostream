import app from './app';
import config from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import logger from './utils/logger';

/**
 * Server Startup and Lifecycle Management
 * 
 * Production-ready features:
 * - Graceful shutdown handling
 * - Database connection verification
 * - Comprehensive startup logging
 * - Error handling during startup
 * - Process signal handling (SIGINT, SIGTERM)
 */

const PORT = config.port;

/**
 * Display startup banner
 */
function displayStartupBanner(): void {
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('🚀 StreamBridge Backend Starting...');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('Environment Configuration', {
    NODE_ENV: config.env,
    PORT,
    JWT_EXPIRES_IN: config.jwt.expiresIn,
    BCRYPT_ROUNDS: config.bcrypt.saltRounds,
  });
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    displayStartupBanner();

    // Connect to database
    logger.info('🔌 Connecting to database...');
    await connectDatabase();

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('✅ Server Ready!');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info(`🌐 Server running on: http://localhost:${PORT}`);
      logger.info(`📡 Health check: http://localhost:${PORT}/health`);
      logger.info('');
      logger.info('📚 Available endpoints:');
      logger.info('   POST   /api/auth/signup');
      logger.info('   POST   /api/auth/login');
      logger.info('   GET    /api/projects');
      logger.info('   POST   /api/projects');
      logger.info('   GET    /api/projects/:id');
      logger.info('   DELETE /api/projects/:id');
      logger.info('   POST   /api/projects/:projectId/destinations');
      logger.info('   PUT    /api/destinations/:id');
      logger.info('   DELETE /api/destinations/:id');
      logger.info('');
      logger.info('🎬 Ready to accept requests!');
      logger.info('═══════════════════════════════════════════════════════════');
    });
  } catch (error) {
    logger.error('❌ Server startup failed!', error as Error);
    logger.info('');
    logger.info('🔧 Troubleshooting:');
    logger.info('   1. Check if PostgreSQL is running:');
    logger.info('      docker ps | grep postgres');
    logger.info('');
    logger.info('   2. Verify DATABASE_URL in .env file');
    logger.info('');
    logger.info('   3. Run migrations:');
    logger.info('      cd backend && npx prisma migrate deploy');
    logger.info('');
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`🛑 ${signal} received, shutting down gracefully...`);
  
  try {
    // Close database connections
    await disconnectDatabase();
    
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception - Application will terminate', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection - Application will terminate', { reason });
  process.exit(1);
});

// Start the server
startServer();
