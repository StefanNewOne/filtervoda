/**
 * Correlation ID middleware (CLAUDE.md Category 9): a UUID per request, echoed on the
 * response as X-Correlation-Id and available on req for logs and outbox jobs.
 */
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    correlationId: string;
  }
}

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Correlation-Id');
  req.correlationId = incoming && incoming.length <= 64 ? incoming : randomUUID();
  res.setHeader('X-Correlation-Id', req.correlationId);
  next();
}
