import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// ✅ This is the route that handles /api/health
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.get('/db', (req, res) => {
  const state = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnected',
  };
  res.json({
    status: state === 1 ? 'healthy' : 'unhealthy',
    database: {
      status: statusMap[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
    },
  });
});

export default router;