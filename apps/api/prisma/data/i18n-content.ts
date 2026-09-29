/**
 * FV-001 M2 — apply the phrase dictionary to row-level content: product specs, filtration stages,
 * card chips, feature bullets, "ideal for" items and testimonials. Idempotent. Merges into any
 * existing product `i18n` (keeps tagline/includedInPrice from i18n-translations.ts). Logs any MK
 * strings missing from the dictionary so the vocabulary can be completed.
 * Run: `tsx apps/api/prisma/data/i18n-content.ts` (after i18n-translations.ts).
 */
import { PrismaClient } from '@prisma/client';
import { PHRASES } from './i18n-phrases.js';

const prisma = new PrismaClient();
const TENANT = 1;
const LOCALES = ['en', 'sq'] as const;
const misses = new Set<string>();

/** Translate one MK string; record a miss and return the MK original as fallback. */
function tr(mk: string | null | undefined, lc: 'en' | 'sq'): string {
  if (mk == null || mk === '' || mk === '—') return mk ?? '';
  const hit = PHRASES[mk];
  if (!hit) {
    misses.add(mk);
    return mk;
  }
  return hit[lc];
}

/** Build a per-locale object from field→MK, dropping fields with no translation (→ MK fallback). */
function overlay(fields: Record<string, string | null | undefined>, lc: 'en' | 'sq'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, mk] of Object.entries(fields)) {
    if (mk == null || mk === '') continue;
    const hit = PHRASES[mk];
    if (hit) out[k] = hit[lc];
    else misses.add(mk);
  }
  return out;
}

async function main() {
  // 1) Product specs.
  const specs = await prisma.productSpec.findMany();
  for (const s of specs) {
    const i18n = Object.fromEntries(
      LOCALES.map((lc) => [lc, overlay({ group: s.group, label: s.label, value: s.value, unit: s.unit }, lc)]),
    );
    await prisma.productSpec.update({ where: { id: s.id }, data: { i18n } });
  }

  // 2) Filtration stages.
  const stages = await prisma.productStage.findMany();
  for (const st of stages) {
    const i18n = Object.fromEntries(
      LOCALES.map((lc) => [lc, overlay({ name: st.name, removes: st.removes, whyItMatters: st.whyItMatters }, lc)]),
    );
    await prisma.productStage.update({ where: { id: st.id }, data: { i18n } });
  }

  // 3) Products: merge chips[] / features[] / idealFor[] into the existing i18n (arrays keep MK
  //    for any untranslated item so positions stay aligned).
  const products = await prisma.product.findMany({ where: { tenantId: TENANT } });
  for (const p of products) {
    const chips = Array.isArray(p.chips) ? (p.chips as string[]) : [];
    const feats = Array.isArray(p.features) ? (p.features as { icon?: string; text: string }[]) : [];
    const ideal = Array.isArray(p.idealFor) ? (p.idealFor as string[]) : [];
    const badges = Array.isArray(p.badges) ? (p.badges as string[]) : [];
    const existing = (p.i18n && typeof p.i18n === 'object' ? (p.i18n as Record<string, Record<string, unknown>>) : {}) ?? {};
    const i18n: Record<string, Record<string, unknown>> = { ...existing };
    for (const lc of LOCALES) {
      i18n[lc] = {
        ...(existing[lc] ?? {}),
        chips: chips.map((c) => tr(c, lc)),
        features: feats.map((f) => ({ ...(f.icon ? { icon: f.icon } : {}), text: tr(f.text, lc) })),
        idealFor: ideal.map((i) => tr(i, lc)),
        badges: badges.map((b) => tr(b, lc)),
      };
    }
    await prisma.product.update({ where: { id: p.id }, data: { i18n } });
  }

  // 4) Testimonials (MERGE — keep name/company from i18n-extra).
  const tst = await prisma.testimonial.findMany({ where: { tenantId: TENANT } });
  for (const t of tst) {
    const base = (t.i18n && typeof t.i18n === 'object' ? (t.i18n as Record<string, Record<string, unknown>>) : {}) ?? {};
    const i18n = Object.fromEntries(LOCALES.map((lc) => [lc, { ...(base[lc] ?? {}), ...overlay({ text: t.text, city: t.city }, lc) }]));
    await prisma.testimonial.update({ where: { id: t.id }, data: { i18n } });
  }

  console.warn(`i18n content applied — specs:${specs.length} stages:${stages.length} products:${products.length} testimonials:${tst.length}`);
  if (misses.size) {
    console.warn(`\n⚠️  ${misses.size} MK strings missing from PHRASES (render MK on /en /sq):`);
    [...misses].sort().forEach((m) => console.warn('   · ' + m));
  } else {
    console.warn('✓ every string had a translation.');
  }
  await prisma.$disconnect();
}

void main();
