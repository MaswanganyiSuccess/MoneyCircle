import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import connectDB from './config/database';
import routes from './routes';

const app = express();

const isTest = process.env.NODE_ENV === 'test';

// Trust proxy – only in production/development (avoids rate‑limit warnings in test)
if (!isTest) {
  app.set('trust proxy', true);
}

// ============================================================
// HEALTH CHECKS – MUST BE FIRST!
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

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

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!isTest) {
  app.use(morgan('combined'));
}

// ============================================================
// RATE LIMITING – COMPLETELY DISABLED IN TEST
// ============================================================
if (!isTest) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// ============================================================
// API ROUTES
// ============================================================

app.use('/api', routes);

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// DATABASE CONNECTION
// ============================================================

connectDB();

export default app;