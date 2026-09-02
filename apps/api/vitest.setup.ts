/**
 * Test env — sets the variables the Zod env validator requires so unit tests can import
 * env-coupled modules. Integration tests (INTEGRATION=1) additionally need a live DATABASE_URL.
 */
process.env.NODE_ENV = 'test';
process.env.PUBLIC_SITE_URL ??= 'http://localhost';
process.env.DATABASE_URL ??= 'postgresql://filtervoda:filtervoda@localhost:5432/filtervoda_test?schema=public';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.SESSION_SECRET ??= 'test-session-secret-32-characters-long';
process.env.CRON_SECRET ??= 'test-cron-secret';
process.env.IP_HASH_SECRET ??= 'test-ip-hash-secret';
process.env.PREVIEW_SECRET ??= 'test-preview-secret';
