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
