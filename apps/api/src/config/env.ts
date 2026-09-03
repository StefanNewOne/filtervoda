/**
 * Environment validation (CLAUDE.md Category 3): the API refuses to start if a required
 * secret is missing. Never read process.env directly elsewhere — import `env` from here.
 */
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  PUBLIC_SITE_URL: z.string().url(),
  ADMIN_URL: z.string().url().optional(),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  SESSION_SECRET: z.string().min(16),
  CRON_SECRET: z.string().min(1),
  IP_HASH_SECRET: z.string().min(1),
  PREVIEW_SECRET: z.string().min(1),
  // Shared secret so trusted server-side SSR calls bypass the public read rate limiter
  // (all SSR traffic arrives from one internal container IP, which would otherwise throttle).
  INTERNAL_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  NOTIFY_EMAILS: z.string().optional(), // comma-separated

  META_PIXEL_ID: z.string().optional(),
  META_CAPI_TOKEN: z.string().optional(),
  META_TEST_EVENT_CODE: z.string().optional(),
  GA4_ID: z.string().optional(),
  GTM_ID: z.string().optional(),

  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_DEV_BYPASS: z
    .string()
    .optional()
    .transform((v) => v === 'true'),

  STORAGE_DRIVER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  CDN_BASE_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  WEBHOOK_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed — see errors above.');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Loud warning: the lead form has NO bot protection while Turnstile is bypassed in production.
if (isProd && env.TURNSTILE_DEV_BYPASS) {
  console.warn('⚠️  TURNSTILE_DEV_BYPASS=true in production — the lead form has NO CAPTCHA. Set real Turnstile keys + TURNSTILE_DEV_BYPASS=false before public launch.');
}
