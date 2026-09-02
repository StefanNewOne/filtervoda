/**
 * Error handling (CLAUDE.md Category 9 + Engineering Posture #5): generic client-facing
 * messages in Macedonian, details stay server-side keyed by correlationId. 404 and 403
 * must not enable enumeration.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

/** Throw this for expected, client-safe failures. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public clientMessage: string,
    public override cause?: unknown,
  ) {
    super(clientMessage);
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Страницата не е пронајдена', correlationId: _req.correlationId });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const correlationId = req.correlationId;

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Проверете ги внесените податоци',
      fields: err.flatten().fieldErrors,
      correlationId,
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err: err.cause ?? err, endpoint: req.path, correlationId }, err.message);
    }
    res.status(err.statusCode).json({ error: err.clientMessage, correlationId });
    return;
  }

  logger.error(
    { err, stack: (err as Error)?.stack, endpoint: req.path, correlationId },
    'unhandled error',
  );
  res.status(500).json({ error: 'Настана грешка. Обидете се повторно.', correlationId });
}
