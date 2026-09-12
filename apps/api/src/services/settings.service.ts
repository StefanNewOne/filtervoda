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

  // Trust logos are stored as media IDs (uploaded via the picker). Resolve each to its URL;
  // pass through any entry that is already a URL/path (backward compatible with pasted links).
  const rawLogos = (s['b2b.trustLogos'] as string[]) ?? [];
  const logoMedia = rawLogos.length ? await prisma.media.findMany({ where: { id: { in: rawLogos }, deletedAt: null } }) : [];
  const logoUrlById = new Map(logoMedia.map((m) => [m.id, m.url]));
  const trustLogos = rawLogos.map((x) => logoUrlById.get(x) ?? x);

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
    trustLogos,
    b2b: {
      problems: s['b2b.problems'] as string[] | undefined,
      included: s['b2b.included'] as string[] | undefined,
      industries: s['b2b.industries'] as string[] | undefined,
      heroLabel: s['b2b.heroLabel'] as string | undefined,
      heroH1: s['b2b.heroH1'] as string | undefined,
      heroSubhead: s['b2b.heroSubhead'] as string | undefined,
      heroCta: s['b2b.heroCta'] as string | undefined,
      heroTrust: s['b2b.heroTrust'] as string | undefined,
      logosTitle: s['b2b.logosTitle'] as string | undefined,
      problemsTitle: s['b2b.problemsTitle'] as string | undefined,
      includedTitle: s['b2b.includedTitle'] as string | undefined,
      calcTitle: s['b2b.calcTitle'] as string | undefined,
      stepsTitle: s['b2b.stepsTitle'] as string | undefined,
      packagesTitle: s['b2b.packagesTitle'] as string | undefined,
      industriesTitle: s['b2b.industriesTitle'] as string | undefined,
      comparisonTitle: s['b2b.comparisonTitle'] as string | undefined,
      faqTitle: s['b2b.faqTitle'] as string | undefined,
      formTitle: s['b2b.formTitle'] as string | undefined,
      formText: s['b2b.formText'] as string | undefined,
      steps: s['b2b.steps'] as { title: string; desc: string }[] | undefined,
      comparison: s['b2b.comparison'] as { label: string; gallons: string; buy: string; rent: string }[] | undefined,
    },
    content: {
      heroH1: s['content.hero.h1'] as string | undefined,
      heroH2: s['content.hero.h2'] as string | undefined,
      heroCta: s['content.hero.cta'] as string | undefined,
      heroBadge: s['content.hero.badge'] as string | undefined,
      heroChips: s['content.hero.chips'] as string[] | undefined,
      whyTitle: s['content.why.title'] as string | undefined,
      whyItems: s['content.why.items'] as { title: string; text: string }[] | undefined,
      featuredTitle: s['content.featured.title'] as string | undefined,
      stagesTitle: s['content.stages.title'] as string | undefined,
      stages: s['content.stages.items'] as { name: string; text: string }[] | undefined,
      testimonialsTitle: s['content.testimonials.title'] as string | undefined,
      articlesTitle: s['content.articles.title'] as string | undefined,
      b2bTeaserTitle: s['content.b2bTeaser.title'] as string | undefined,
      b2bTeaserBullets: s['content.b2bTeaser.bullets'] as string[] | undefined,
      b2bTeaserCta: s['content.b2bTeaser.cta'] as string | undefined,
      advisorTitle: s['content.advisor.title'] as string | undefined,
      advisorText: s['content.advisor.text'] as string | undefined,
      thankyouTitle: s['content.thankyou.title'] as string | undefined,
      thankyouText: s['content.thankyou.text'] as string | undefined,
    },
  };
}
