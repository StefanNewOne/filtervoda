/**
 * node-cron scheduler (ADR-002). Registered from server.ts. Crons do NOT run in the test
 * process. enqueue() also kicks the outbox immediately via registerKick.
 */
import cron from 'node-cron';
import { isTest } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { registerKick } from '../services/outbox.service.js';
import { anonymizeLeads, cleanupOutbox, cleanupSessions, dropOldIpHashes } from './maintenance.js';
import { processOutbox } from './outbox.processor.js';

let kicking = false;
function kick(): void {
  if (kicking) return;
  kicking = true;
  processOutbox()
    .catch((err) => logger.error({ err }, 'outbox kick failed'))
    .finally(() => {
      kicking = false;
    });
}

export function startCron(): void {
  if (isTest) return;
  registerKick(kick);

  // Outbox every 30 seconds (safety net; enqueue kicks immediately).
  cron.schedule('*/30 * * * * *', () => kick());

  // Anonymize leads + drop old ip hashes — daily 03:15.
  cron.schedule('15 3 * * *', () => {
    anonymizeLeads().catch((err) => logger.error({ err }, 'anonymize failed'));
    dropOldIpHashes().catch((err) => logger.error({ err }, 'ip hash cleanup failed'));
  });

  // Session + outbox cleanup — daily 03:30.
  cron.schedule('30 3 * * *', () => {
    cleanupSessions().catch((err) => logger.error({ err }, 'session cleanup failed'));
    cleanupOutbox().catch((err) => logger.error({ err }, 'outbox cleanup failed'));
  });

  logger.info('cron scheduler started');
}
