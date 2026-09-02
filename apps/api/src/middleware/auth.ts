/**
 * AuthN + AuthZ middleware. Re-validated in every controller too (defense in depth).
 * 404/403 are indistinguishable to unauthorized callers to prevent enumeration.
 */
import { REAUTH_WINDOW_MIN, type UserRole } from '@filtervoda/shared';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './error.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    throw new AppError(404, 'Страницата не е пронајдена'); // hide the admin surface
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session.userId) throw new AppError(404, 'Страницата не е пронајдена');
    if (!req.session.role || !roles.includes(req.session.role)) {
      throw new AppError(404, 'Страницата не е пронајдена'); // 403-as-404
    }
    next();
  };
}

/** Fresh re-auth required for destructive operations (password re-entry within 10 min). */
export function requireFreshReauth(req: Request, _res: Response, next: NextFunction): void {
  const last = req.session.lastReauthAt ?? 0;
  const fresh = Date.now() - last < REAUTH_WINDOW_MIN * 60 * 1000;
  if (!fresh) {
    throw new AppError(401, 'За оваа операција внесете ја лозинката повторно.');
  }
  next();
}
