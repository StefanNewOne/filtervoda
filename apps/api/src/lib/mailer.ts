/**
 * nodemailer transport (Mailhog local / SMTP prod). Subject lines are discreet.
 * Sending happens only from the outbox processor, never in the request path.
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST ?? 'mailhog',
  port: env.SMTP_PORT ?? 1025,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export interface MailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendMail(input: MailInput): Promise<void> {
  // No SMTP configured (e.g. preview before [D-7]) → skip cleanly instead of failing the outbox
  // job against a non-existent 'mailhog' host (which would pile up in „Проблеми со испорака").
  if (!env.SMTP_HOST) {
    logger.warn({ subject: input.subject }, 'email.skipped.no_smtp');
    return;
  }
  await transport.sendMail({
    from: env.MAIL_FROM ?? 'SPAR Company <no-reply@filtervoda.mk>',
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
  logger.info({ subject: input.subject }, 'email.sent');
}

export function notifyEmails(): string[] {
  return (env.NOTIFY_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}
