import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import healthRoutes from './routes/health.routes';

// ✅ Explicitly load .env from the backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 🔍 Debug: check if MONGODB_URI is loaded
console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use('/api', healthRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MoneyCircle API', status: 'running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;