/**
 * Meta CAPI, webhook and Telegram handlers. All PII is SHA-256-hashed before CAPI.
 * Handlers no-op when the integration is unconfigured (so the outbox stays clean).
 */
import axios from 'axios';
import { env } from '../../config/env.js';
import { capiHash, capiHashPhone } from '../../lib/hash.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';

interface LeadJobPayload {
  leadId: string;
}

/** Retriable Meta error codes (ADR-002). */
const META_RETRIABLE = new Set([4, 17, 32, 613]);

export async function handleCapiLead(payload: LeadJobPayload): Promise<void> {
  if (!env.META_CAPI_TOKEN) return; // not configured
  const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
  if (!lead) return;

  const [activeTemplate, pixelSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { tenantId_key: { tenantId: 1, key: 'design.activeTemplate' } } }),
    prisma.setting.findUnique({ where: { tenantId_key: { tenantId: 1, key: 'tracking.metaPixelId' } } }),
  ]);
  // Prefer the admin-editable Pixel ID so browser Pixel and server CAPI target the SAME pixel
  // (event_id dedup breaks otherwise). Fall back to the env value.
  const pixelId = (typeof pixelSetting?.value === 'string' && pixelSetting.value) || env.META_PIXEL_ID;
  if (!pixelId) return;

  const body = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(lead.createdAt.getTime() / 1000),
        event_id: lead.id, // shared with the browser Pixel for dedup
        action_source: 'website',
        event_source_url: lead.pageUrl,
        user_data: {
          ph: capiHashPhone(lead.phone) ? [capiHashPhone(lead.phone)] : undefined,
          em: capiHash(lead.email) ? [capiHash(lead.email)] : undefined,
          fn: capiHash(lead.name) ? [capiHash(lead.name)] : undefined,
          ct: capiHash(lead.city) ? [capiHash(lead.city)] : undefined,
          client_ip_address: undefined, // raw IP not stored
          client_user_agent: lead.userAgent ?? undefined,
          fbp: lead.fbp ?? undefined,
          fbc: lead.fbc ?? undefined,
        },
        custom_data: {
          currency: 'MKD',
          lead_type: lead.type,
          template: (activeTemplate?.value as string) ?? 'b1',
        },
      },
    ],
    ...(env.META_TEST_EVENT_CODE ? { test_event_code: env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${env.META_CAPI_TOKEN}`,
      body,
      { timeout: 8000 },
    );
    await prisma.leadEvent.create({ data: { leadId: lead.id, type: 'CAPI_SENT' } });
    logger.info({ leadId: lead.id }, 'lead.capi.sent');
  } catch (err) {
    const code = (err as { response?: { data?: { error?: { code?: number } } } })?.response?.data?.error?.code;
    if (code && META_RETRIABLE.has(code)) {
      logger.warn({ leadId: lead.id, code }, 'capi retriable error');
    }
    throw err; // let the outbox retry with backoff
  }
}

export async function handleWebhookLead(payload: LeadJobPayload): Promise<void> {
  if (!env.WEBHOOK_URL) return;
  const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
  if (!lead) return;
  await axios.post(env.WEBHOOK_URL, { id: lead.id, type: lead.type, createdAt: lead.createdAt }, { timeout: 8000 });
  await prisma.leadEvent.create({ data: { leadId: lead.id, type: 'WEBHOOK_SENT' } });
  logger.info({ leadId: lead.id }, 'lead.webhook.sent');
}

export async function handleTelegramLead(payload: LeadJobPayload): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
  if (!lead) return;
  const text = `Ново барање #${lead.id.slice(-6)} · ${lead.type}`;
  await axios.post(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    { chat_id: env.TELEGRAM_CHAT_ID, text },
    { timeout: 8000 },
  );
}
