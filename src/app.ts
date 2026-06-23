import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { env } from './config/env';
import { redis } from './config/redis';
import { prisma } from './config/database';
import { logger } from './config/logger';
import linkRoutes from './routes/linkRoutes';
import authRoutes from './routes/authRoutes';
import redirectRoutes from './routes/redirectRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app: Express = express();

app.use(helmet());

const allowedOrigins = env.NODE_ENV === 'production' 
  ? ['https://your-frontend-domain.com']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.get('/api/v1/health', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  try {
    await redis.ping();
    checks.redis = 'connected';
  } catch {
    checks.redis = 'disconnected';
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
  }

  const isHealthy = checks.redis === 'connected' && checks.database === 'connected';

  if (!isHealthy) {
    logger.warn({ checks }, 'Health check: Degraded');
  }

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    environment: env.NODE_ENV,
    checks,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', apiLimiter, authRoutes);
app.use('/api/v1/links', apiLimiter, linkRoutes);
app.use('/api/v1/analytics', apiLimiter, analyticsRoutes);
app.use('/p', redirectRoutes);

app.use(errorHandler);

export default app;
