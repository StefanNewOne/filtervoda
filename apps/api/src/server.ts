/**
 * API entrypoint. Boots the Express app and (later) the outbox cron processor.
 * Env is validated on import of ./config/env — the process exits if a secret is missing.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { startCron } from './jobs/cron.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on :${env.PORT} (${env.NODE_ENV})`);
  startCron();
});

// Graceful shutdown.
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    logger.info(`${sig} received — shutting down`);
    server.close(() => process.exit(0));
  });
}
