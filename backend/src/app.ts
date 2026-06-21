import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import SwaggerParser from '@apidevtools/swagger-parser';
import config, { isTest } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import connectDB from './config/database';
import routes from './routes';
import { swaggerOptions } from './config/swagger';

const app = express();

// ───────────────────────────────────────
// Trust proxy (only when configured)
// ───────────────────────────────────────
if (config.trustProxy) {
  app.set('trust proxy', true);
  logger.info('🔒 Trust proxy enabled');
}

// ───────────────────────────────────────
// CORS – MUST COME EARLY
// ───────────────────────────────────────
const corsOptions = {
  origin: config.corsOrigin,          // '*' or array of origins
  credentials: true,
  optionsSuccessStatus: 200,
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// ───────────────────────────────────────
// Security headers (with relaxed cross-origin)
// ───────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  })
);

// ───────────────────────────────────────
// Static files (logos)
// ───────────────────────────────────────
const publicPath = path.join(__dirname, '../../public');
app.use('/static', express.static(publicPath));
logger.info(`📁 Serving static files from ${publicPath}`);

// ───────────────────────────────────────
// Health checks (MUST BE FIRST)
// ───────────────────────────────────────
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

// ───────────────────────────────────────
// Other middleware
// ───────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!isTest) {
  app.use(morgan('combined'));
}

// ───────────────────────────────────────
// Rate limiting (disabled in test)
// ───────────────────────────────────────
if (!isTest) {
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// ───────────────────────────────────────
// Swagger UI
// ───────────────────────────────────────
let swaggerDocument: any = null;

app.get('/api/docs/spec.json', async (req, res) => {
  try {
    const openApiFile = path.join(__dirname, '../../api-docs/openapi.yaml');
    const fileContent = fs.readFileSync(openApiFile, 'utf8');
    const parsed = yaml.parse(fileContent);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load spec' });
  }
});

if (config.enableSwagger) {
  app.use(config.swaggerPath, swaggerUi.serve);

  app.get(config.swaggerPath, async (req, res, next) => {
    if (!swaggerDocument) {
      try {
        const openApiFile = path.join(__dirname, '../../api-docs/openapi.yaml');
        swaggerDocument = await SwaggerParser.bundle(openApiFile);
        logger.info(`📚 Swagger spec bundled successfully at ${config.swaggerPath}`);
      } catch (error) {
        logger.error('Failed to bundle Swagger spec: ' + (error as Error).message);
        return res.status(500).json({ error: 'Swagger spec could not be loaded' });
      }
    }
    return swaggerUi.setup(swaggerDocument, swaggerOptions)(req, res, next);
  });
}

// ───────────────────────────────────────
// API routes
// ───────────────────────────────────────
app.use('/api', routes);

// ───────────────────────────────────────
// Error handling
// ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ───────────────────────────────────────
// Database connection
// ───────────────────────────────────────
connectDB();

export default app;