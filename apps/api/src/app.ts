/**
 * Express 5 app assembly. Route registration order: security → correlation → parsers →
 * routes → 404 → error handler. AuthN/AuthZ live in route modules (defense in depth).
 */
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { correlationId } from './middleware/correlation.js';
import { docsRouter } from './openapi.js';
import { errorHandler, notFound } from './middleware/error.js';
import { sessionMiddleware } from './middleware/session.js';
import { adminRouter } from './routes/admin/index.js';
import { authRouter } from './routes/auth.js';
import { cronRouter } from './routes/cron.js';
import { healthRouter } from './routes/health.js';
import { publicLeadsRouter } from './routes/leads.public.js';
import { publicRouter } from './routes/public.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // behind Nginx
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(correlationId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as express.Request).correlationId,
      customProps: (req) => ({ correlationId: (req as express.Request).correlationId }),
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(sessionMiddleware);

  // CORS: only the public site and admin may call the API.
  app.use((req, res, next) => {
    const origin = req.header('Origin');
    const allowed = [env.PUBLIC_SITE_URL, env.ADMIN_URL].filter(Boolean);
    if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Correlation-Id, X-CSRF-Token');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Locally-stored media (STORAGE_DRIVER=local); prod uses S3/Cloudinary URLs directly.
  app.use('/api/v1/uploads', express.static(join(process.cwd(), 'apps/api/uploads'), { maxAge: '1y', immutable: true }));

  // Routes (prefix /api/v1).
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', authRouter);
  app.use('/api/v1', publicLeadsRouter);
  app.use('/api/v1', publicRouter);
  app.use('/api/v1', cronRouter);
  app.use('/api/v1/admin', adminRouter);

  // Swagger UI — local only (staging/production: behind admin session or off, PRD §12.7).
  if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'staging') {
    app.use('/api', docsRouter);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
