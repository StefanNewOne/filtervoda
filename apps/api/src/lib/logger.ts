/**
 * Pino structured JSON logger (CLAUDE.md Category 9). No console.log in production code.
 * NEVER log PII (phone, name, email, address) — use leadId only.
 */
import pino from 'pino';
import { env, isProd } from '../config/env.js';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.phone', '*.email', '*.name', '*.city'],
    remove: true,
  },
  base: { env: env.NODE_ENV },
});
