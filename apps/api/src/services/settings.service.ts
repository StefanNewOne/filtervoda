/**
 * Settings service. `getPublicSettings` exposes ONLY the storefront-safe keys (no CAPI token,
 * no SMTP). Includes the active template + its token overrides so the web app can theme.
 */
import type { PublicSettings, TemplateId } from '@filtervoda/shared';
import type { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { CACHE_NS, purge } from './cache.js';

async function readAll(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await prisma.setting.findUnique({ where: { tenantId_key: { tenantId: 1, key } } });
  return row?.value as T | undefined;
}

export async function setSetting(key: string, value: Prisma.InputJsonValue): Promise<void> {
  await prisma.setting.upsert({
    where: { tenantId_key: { tenantId: 1, key } },
    update: { value },
    create: { tenantId: 1, key, value },
  });
  // Refresh the settings cache + storefront page cache so edits show up immediately.
  await purge(CACHE_NS.settings);
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const s = await readAll();
  const activeTemplate = (s['design.activeTemplate'] as TemplateId) ?? 'b1';
  const allTokens = (s['design.templateTokens'] as Record<string, Record<string, string>>) ?? {};

  const flagKeys = Object.keys(s).filter((k) => k.startsWith('feature.'));
  const featureFlags = Object.fromEntries(flagKeys.map((k) => [k.replace('feature.', ''), Boolean(s[k])]));

  return {
    phones: (s['contact.phones'] as string[]) ?? [],
    viber: s['contact.viber'] as string | undefined,
    emails: (s['contact.emails'] as string[]) ?? [],
    social: (s['contact.social'] as { facebook?: string; instagram?: string }) ?? {},
    address: s['contact.address'] as string | undefined,
    workingHours: s['contact.workingHours'] as string | undefined,
    activeTemplate,
    templateTokens: allTokens[activeTemplate] ?? {},
    cookieBannerText: s['cookie.bannerText'] as string | undefined,
    featureFlags,
    // Settings override env (editable in admin Tracking).
    gtmId: (s['tracking.gtmId'] as string) || env.GTM_ID,
    ga4Id: (s['tracking.ga4Id'] as string) || env.GA4_ID,
    metaPixelId: (s['tracking.metaPixelId'] as string) || env.META_PIXEL_ID,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY,
    trustLogos: (s['b2b.trustLogos'] as string[]) ?? [],
    b2b: {
      problems: s['b2b.problems'] as string[] | undefined,
      included: s['b2b.included'] as string[] | undefined,
      industries: s['b2b.industries'] as string[] | undefined,
    },
    content: {
      heroH1: s['content.hero.h1'] as string | undefined,
      heroH2: s['content.hero.h2'] as string | undefined,
      heroCta: s['content.hero.cta'] as string | undefined,
      advisorTitle: s['content.advisor.title'] as string | undefined,
      advisorText: s['content.advisor.text'] as string | undefined,
      thankyouTitle: s['content.thankyou.title'] as string | undefined,
      thankyouText: s['content.thankyou.text'] as string | undefined,
    },
  };
}
