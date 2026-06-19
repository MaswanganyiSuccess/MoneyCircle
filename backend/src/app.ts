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

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Routes
app.use('/api', routes);

// Health check (root level)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
connectDB();

export default app;