import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`⚠️ Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;