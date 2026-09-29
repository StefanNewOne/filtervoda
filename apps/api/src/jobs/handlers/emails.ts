/**
 * Email job handlers. Subject lines are discreet (no product names / explicit words).
 * Templates are plain MK-Cyrillic HTML (full templates live in the web app / design handoff).
 */
import { formatMkPhoneDisplay } from '@filtervoda/shared';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { notifyEmails, sendMail } from '../../lib/mailer.js';
import { prisma } from '../../lib/prisma.js';

interface LeadJobPayload {
  leadId: string;
}

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string);
}

export async function handleEmailNewLead(payload: LeadJobPayload): Promise<void> {
  const recipients = notifyEmails();
  if (!recipients.length) return; // nothing configured — no-op
  const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
  if (!lead) return;
  // Idempotency: if a prior attempt already recorded the send, don't email the operator twice
  // (guards the crash-between-send-and-DONE retry window).
  const already = await prisma.leadEvent.findFirst({ where: { leadId: lead.id, type: 'EMAIL_SENT' } });
  if (already) return;

  const adminLink = `${env.ADMIN_URL ?? env.PUBLIC_SITE_URL}/admin/leads/${lead.id}`;
  const rows = [
    ['Тип', lead.type],
    ['Име', esc(lead.name)],
    ['Телефон', formatMkPhoneDisplay(lead.phone)],
    ['Email', esc(lead.email)],
    ['Град', esc(lead.city)],
    ['Фирма', esc(lead.company)],
    ['Извор', esc(lead.section ?? lead.referrer)],
    ['Порака', esc(lead.message)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#64748b">${k}</td><td style="padding:4px 8px">${v}</td></tr>`)
    .join('');

  await sendMail({
    to: recipients,
    subject: `Ново барање #${lead.id.slice(-6)}`,
    html: `<div style="font-family:sans-serif"><h2>Ново барање од сајтот</h2>
      <table>${rows}</table>
      <p><a href="${adminLink}">Отвори во админ</a> · <a href="tel:${lead.phone}">Повикај</a></p></div>`,
  });
  await prisma.leadEvent.create({ data: { leadId: lead.id, type: 'EMAIL_SENT' } });
  logger.info({ leadId: lead.id }, 'lead.email.sent');
}

export async function handleEmailAutoreply(payload: LeadJobPayload): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
  if (!lead?.email) return;
  await sendMail({
    to: lead.email,
    subject: `Го примивме вашето барање #${lead.id.slice(-6)}`,
    html: `<div style="font-family:sans-serif">
      <p>Почитувани ${esc(lead.name)},</p>
      <p>Ви благодариме за интересот. Вашето барање е примено — ќе ве контактираме во рок од еден работен ден.</p>
      <p>Итно? Повикајте <a href="tel:+38976676819">076/676/819</a>.</p>
      <p>Со почит,<br>SPAR Company</p></div>`,
  });
}

export async function handleEmailPasswordReset(payload: { email: string; token: string }): Promise<void> {
  const link = `${env.ADMIN_URL ?? env.PUBLIC_SITE_URL}/admin/reset?token=${payload.token}`;
  await sendMail({
    to: payload.email,
    subject: 'Ресетирање на лозинка',
    html: `<div style="font-family:sans-serif">
      <p>Побаравте ресетирање на лозинката.</p>
      <p><a href="${link}">Поставете нова лозинка</a> (важи 30 минути).</p>
      <p>Ако не сте вие, игнорирајте ја пораката.</p></div>`,
  });
}
