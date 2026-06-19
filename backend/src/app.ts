import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import connectDB from './config/database';
import routes from './routes';

const app = express();

// ============================================================
// ✅ HEALTH CHECKS – MUST BE FIRST!
// These routes are placed before any middleware to guarantee
// they are never blocked by CORS, authentication, or other
// middleware that might interfere.
// ============================================================

/**
 * GET /api/health
 * Basic health check – returns service status.
 * Used by Render's health checks and GitHub Actions.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health
 * Alias for /api/health – also works at root level.
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// MIDDLEWARE
// ============================================================

// Security headers
app.use(helmet());

// CORS – allow only configured origin
app.use(cors({ origin: config.corsOrigin }));

// Compress responses
app.use(compression());

// JSON and URL-encoded body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (skip in test environment)
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// ============================================================
// API ROUTES
// ============================================================

// Mount all API routes under /api
app.use('/api', routes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================
// DATABASE CONNECTION
// ============================================================

connectDB();

export default app;