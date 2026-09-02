/**
 * Auth integration (CLAUDE.md testing priority #3) — real Postgres. INTEGRATION=1.
 * Covers login success, wrong-password lockout after 5 attempts, and verifyPassword.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { verifyLogin, verifyPassword } from '../auth.service.js';

const run = process.env.INTEGRATION === '1';
const EMAIL = 'authtest@filtervoda.mk';

describe.skipIf(!run)('auth.service (integration)', () => {
  let userId = '';
  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    const u = await prisma.user.create({
      data: { tenantId: 1, email: EMAIL, name: 'Auth Test', role: 'EDITOR', passwordHash: await bcrypt.hash('correct-horse', 12) },
    });
    userId = u.id;
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.$disconnect();
  });

  it('logs in with correct credentials', async () => {
    const user = await verifyLogin(EMAIL, 'correct-horse');
    expect(user.email).toBe(EMAIL);
    expect(user.role).toBe('EDITOR');
  });

  it('rejects wrong password and locks the account after 5 attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(verifyLogin(EMAIL, 'nope')).rejects.toThrow();
    }
    const locked = await prisma.user.findUnique({ where: { id: userId } });
    expect(locked?.lockedUntil).not.toBeNull();
    // Even the correct password is refused while locked.
    await expect(verifyLogin(EMAIL, 'correct-horse')).rejects.toThrow();
  });

  it('verifyPassword confirms the stored hash', async () => {
    expect(await verifyPassword(userId, 'correct-horse')).toBe(true);
    expect(await verifyPassword(userId, 'wrong')).toBe(false);
  });

  it('does not reveal whether an email exists', async () => {
    await expect(verifyLogin('nobody@filtervoda.mk', 'x')).rejects.toThrow(/Погрешен email или лозинка/);
  });
});
