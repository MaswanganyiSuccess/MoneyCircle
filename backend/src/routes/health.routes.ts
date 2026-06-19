import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/health/db
 * Detailed database health check
 */
router.get('/db', (req, res) => {
  const state = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isConnected = state === 1;
  res.json({
    status: isConnected ? 'healthy' : 'unhealthy',
    database: {
      status: statusMap[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
      models: Object.keys(mongoose.models),
    },
  });
});

export default router;