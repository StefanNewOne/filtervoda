/**
 * Auth service: password verification with progressive lockout (5 failures → lock),
 * password reset token issue/consume. bcryptjs cost 12. No PII in logs.
 */
import { PASSWORD_RESET_TTL_MIN } from '@filtervoda/shared';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sha256Hex } from '../lib/hash.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Generic failure — never reveal whether the email exists.
  const genericFail = new AppError(401, 'Погрешен email или лозинка');

  if (!user) {
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv'); // timing
    throw genericFail;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, 'Сметката е привремено заклучена. Обидете се подоцна.');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: lock ? 0 : failed,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    logger.warn({ userId: user.id, failed }, 'auth.loginFailed');
    throw genericFail;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  logger.info({ userId: user.id }, 'auth.login');
  return { id: user.id, role: user.role, name: user.name, email: user.email };
}

export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function issueResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null; // caller returns 200 regardless (no enumeration)
  const token = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MIN * 60 * 1000),
    },
  });
  return token;
}

export async function consumeResetToken(token: string, newPassword: string): Promise<void> {
  const tokenHash = sha256Hex(token);
  const row = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!row) throw new AppError(400, 'Невалиден или истечен линк за ресет.');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
}
