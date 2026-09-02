/**
 * Session middleware — express-session + connect-pg-simple (sessions in Postgres, NOT Redis;
 * CLAUDE.md §0.4). 30-day sliding cookie, httpOnly + secure + SameSite=Lax.
 */
import { SESSION_DAYS } from '@filtervoda/shared';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { env, isProd } from '../config/env.js';

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  name: 'fv.sid',
  store: new PgStore({
    conString: env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: false, // table is owned by Prisma migrations
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // sliding renewal
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  },
});

// Session payload shape.
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: 'ADMIN' | 'EDITOR' | 'CLIENT_VIEWER';
    lastReauthAt?: number; // epoch ms
  }
}
