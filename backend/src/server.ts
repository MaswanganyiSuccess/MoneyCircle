import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { closeDB } from './config/database';

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
});

/**
 * Graceful shutdown handler
 */
const shutdown = async (signal: string) => {
  logger.info(`⚠️ Received ${signal}. Shutting down gracefully...`);

  // Close database connection
  await closeDB();

  // Close HTTP server
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('⚠️ Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;