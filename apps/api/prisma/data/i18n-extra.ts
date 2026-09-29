/**
 * FV-001 M2 — remaining content translations found by the /en /sq scan: descriptive product NAMES
 * (Cyrillic ones), product maintenanceNote, and testimonial name/company. Merges into existing
 * `i18n` (never wipes tagline/specs/etc.). Idempotent. Run: `tsx apps/api/prisma/data/i18n-extra.ts`.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT = 1;

// Product name by slug (only the descriptive/Cyrillic ones; Latin brand names are left as-is).
const NAMES: Record<string, { en: string; sq: string }> = {
  'spar-aqua-pro': { en: 'Spar Aqua Pro', sq: 'Spar Aqua Pro' },
  'spar-aqua-minerals': { en: 'Spar Aqua Minerals', sq: 'Spar Aqua Minerals' },
  'dispenzer-topla-ladna-ro': { en: 'Hot & Cold Water Dispenser (RO)', sq: 'Dispenser uji i ngrohtë dhe i ftohtë (RO)' },
  'sistem-cel-dom': { en: 'Whole-Home Filtration System', sq: 'Sistem filtrimi për të gjithë shtëpinë' },
  'big-blue-2-stepen': { en: 'Big Blue 2-Stage System', sq: 'Big Blue sistem 2-fazësh' },
  'big-blue-3-stepen': { en: 'Big Blue 3-Stage System', sq: 'Big Blue sistem 3-fazësh' },
  'filter-protiv-bigor': { en: 'Anti-Limescale Filter for Heating Elements', sq: 'Filtër kundër gurit të ujit për elementet ngrohëse' },
  'multifunkcionalna-slavina-hrom': { en: 'Multifunctional Faucet (Chrome)', sq: 'Rubinet multifunksional (krom)' },
  'ph-merac': { en: 'Digital pH Meter', sq: 'Matës dixhital pH' },
  'tds-merac': { en: 'TDS Meter', sq: 'Matës TDS' },
  'aparat-elektroliza': { en: 'Electrolysis Device', sq: 'Aparat elektrolize' },
  'mineralen-tus': { en: 'Mineral Shower Head', sq: 'Dush mineral' },
};

// Maintenance note by exact MK value.
const NOTES: Record<string, { en: string; sq: string }> = {
  'Степените 1–3 се менуваат на 6–12 месеци, мембраната на 24–36 месеци, пост-карбон и минерализатор на 12 месеци. SPAR доаѓа на замена — не ви треба мајстор.': {
    en: 'Stages 1–3 are replaced every 6–12 months, the membrane every 24–36 months, and the post-carbon and mineralizer every 12 months. SPAR comes to replace them — you don’t need a technician.',
    sq: 'Fazat 1–3 ndërrohen çdo 6–12 muaj, membrana çdo 24–36 muaj, dhe post-karboni e mineralizuesi çdo 12 muaj. SPAR vjen për t’i ndërruar — nuk ju duhet mjeshtër.',
  },
  'Работи на батерија со авто-исклучување за подолг век.': {
    en: 'Runs on a battery with auto shut-off for a longer life.',
    sq: 'Punon me bateri me fikje automatike për jetëgjatësi më të madhe.',
  },
  'Работи на батерија; препорачано периодично калибрирање.': {
    en: 'Runs on a battery; periodic calibration is recommended.',
    sq: 'Punon me bateri; rekomandohet kalibrim periodik.',
  },
  'Рок на употреба 1–2 години, зависно од условите на користење; замена по потреба.': {
    en: 'Service life of 1–2 years depending on usage conditions; replace as needed.',
    sq: 'Afati i përdorimit 1–2 vjet, në varësi të kushteve të përdorimit; ndërrim sipas nevojës.',
  },
  'Минералните зрнца се потрошен дел — замена на влошокот по потреба.': {
    en: 'The mineral beads are a consumable — replace the cartridge as needed.',
    sq: 'Rruazat minerale janë pjesë harxhuese — ndërrim i kartuşit sipas nevojës.',
  },
  'Филтрите на овој производ се менуваат на 12 месеци. Од нас добивате повик кога се при крај и кога би требало да ги промениме.': {
    en: 'The filters on this product are replaced every 12 months. We call you when they are nearing the end and should be replaced.',
    sq: 'Filtrat e këtij produkti ndërrohen çdo 12 muaj. Ju telefonojmë kur janë afër fundit dhe kur duhet t’i ndërrojmë.',
  },
};

// Maintenance note by SLUG (robust override — avoids fragile MK string matching for prod-edited notes).
const NOTE_BY_SLUG: Record<string, { en: string; sq: string }> = {
  'spar-crystal-digital-600hf': {
    en: 'The filters on this product are replaced every 12 months. We call you when they are nearing the end and should be replaced.',
    sq: 'Filtrat e këtij produkti ndërrohen çdo 12 muaj. Ju telefonojmë kur janë afër fundit dhe kur duhet t’i ndërrojmë.',
  },
};

// Testimonial name/company transliteration.
const TST: Record<string, { name: string; company?: string }> = {
  'Билјана С.': { name: 'Biljana S.' },
  'Дарко И.': { name: 'Darko I.' },
  'Марија П.': { name: 'Marija P.' },
  'Кафе Бар Лума': { name: 'Cafe Bar Luma', company: 'Luma' },
};

// Match maintenance notes tolerant of whitespace/nbsp differences.
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const NOTES_NORM = new Map(Object.entries(NOTES).map(([k, v]) => [norm(k), v]));

type I18n = Record<string, Record<string, unknown>>;
function merge(existing: unknown, add: { en: Record<string, unknown>; sq: Record<string, unknown> }): I18n {
  const base = (existing && typeof existing === 'object' ? (existing as I18n) : {}) ?? {};
  return {
    ...base,
    en: { ...(base.en ?? {}), ...add.en },
    sq: { ...(base.sq ?? {}), ...add.sq },
  };
}

async function main() {
  const products = await prisma.product.findMany({ where: { tenantId: TENANT } });
  let pn = 0;
  for (const p of products) {
    const add = { en: {} as Record<string, unknown>, sq: {} as Record<string, unknown> };
    const nm = NAMES[p.slug];
    if (nm) { add.en.name = nm.en; add.sq.name = nm.sq; }
    const note = NOTE_BY_SLUG[p.slug] || (p.maintenanceNote && NOTES_NORM.get(norm(p.maintenanceNote)));
    if (note) { add.en.maintenanceNote = note.en; add.sq.maintenanceNote = note.sq; }
    if (!Object.keys(add.en).length) continue;
    await prisma.product.update({ where: { id: p.id }, data: { i18n: merge(p.i18n, add) } });
    pn++;
  }

  const tst = await prisma.testimonial.findMany({ where: { tenantId: TENANT } });
  let tn = 0;
  for (const t of tst) {
    const tr = TST[t.name];
    if (!tr) continue;
    const add = {
      en: { name: tr.name, ...(tr.company ? { company: tr.company } : {}) },
      sq: { name: tr.name, ...(tr.company ? { company: tr.company } : {}) },
    };
    await prisma.testimonial.update({ where: { id: t.id }, data: { i18n: merge(t.i18n, add) } });
    tn++;
  }

  console.warn(`i18n extra applied — products:${pn} testimonials:${tn}`);
  await prisma.$disconnect();
}

void main();
