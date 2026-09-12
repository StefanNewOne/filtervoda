/**
 * Seed — SPAR tenant, 6 categories, 17 products (PRD Прилог А), users, settings
 * (3 templates + active b1), B2B packages, flagship filtration stages, redirect map.
 * Idempotent (upserts). Run: npm run seed --workspace apps/api
 */
import { PrismaClient, ProductAudience, PublishStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const TENANT = 1;

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'pod-mijalnik', name: 'Под мијалник', description: 'Реверзна осмоза и минерализација', sortOrder: 1 },
  { slug: 'dispenzeri', name: 'Диспензери', description: 'Топла и ладна вода за дом и фирма', sortOrder: 2 },
  { slug: 'cel-dom', name: 'Цел дом', description: 'Филтрација за целото домаќинство (Биг Блу)', sortOrder: 3 },
  { slug: 'zastita-bigor', name: 'Заштита од бигор', description: 'Заштита на грејни тела и апарати', sortOrder: 4 },
  { slug: 'dodatoci', name: 'Додатоци', description: 'Славини, тушеви и додатоци', sortOrder: 5 },
  { slug: 'meraci', name: 'Мерачи', description: 'pH, TDS и електролиза', sortOrder: 6 },
];

// ── Products (prices in integer денари) ─────────────────────────────────────────
type SeedProduct = {
  slug: string;
  name: string;
  tagline?: string;
  cat: string;
  audience?: ProductAudience;
  priceRegular?: number;
  priceSale?: number;
  showPrice?: boolean;
  badges?: string[];
  featured?: boolean;
  oldUrl: string;
};

const PRODUCTS: SeedProduct[] = [
  { slug: 'spar-crystal-digital-600hf', name: 'SPAR CRYSTAL DIGITAL 600HF', tagline: 'Најнова генерација систем со директен проток — без резервоар, без чекање.', cat: 'pod-mijalnik', priceRegular: 40000, priceSale: 36000, badges: ['Акција', 'Бесплатна монтажа'], featured: true, oldUrl: '/produkt/spar-crystal-digital/' },
  { slug: 'spar-crystal-smart', name: 'SPAR CRYSTAL SMART', tagline: '6 степени на прочистување со дигитален дисплеј.', cat: 'pod-mijalnik', priceRegular: 24000, badges: ['Бесплатна монтажа'], featured: true, oldUrl: '/produkt/spar-crystal-smart/' },
  { slug: 'spar-crystal-pro', name: 'SPAR CRYSTAL PRO', tagline: 'Компактен систем со реверзна осмоза под мијалник.', cat: 'pod-mijalnik', priceRegular: 12000, badges: ['Бесплатна монтажа'], oldUrl: '/produkt/spar-crystal-pro/' },
  { slug: 'spar-aqua-smart', name: 'Spar Aqua SMART', tagline: 'Паметна контрола со вграден дисплеј за квалитет и филтри.', cat: 'pod-mijalnik', priceRegular: 26000, priceSale: 19999, badges: ['Акција', 'Бесплатна монтажа'], featured: true, oldUrl: '/produkt/spar-aqua-smart/' },
  { slug: 'aqua-glass', name: 'AQUA GLASS', tagline: '7 фази прочистување + 9 фази минерализација.', cat: 'pod-mijalnik', priceRegular: 18000, priceSale: 14990, badges: ['Акција', 'Бесплатна монтажа'], oldUrl: '/produkt/aqua-glass-sistem-za-filtracija-na-voda/' },
  { slug: 'spar-aqua-pro', name: 'Спар Аква Про', tagline: 'Реверзна осмоза со поволна цена.', cat: 'pod-mijalnik', priceRegular: 11000, priceSale: 7990, badges: ['Акција'], oldUrl: '/produkt/spar-aqua-pro/' },
  { slug: 'spar-aqua-minerals', name: 'Спар Aqua Minerals', tagline: 'Реверзна осмоза со додаток на минерали.', cat: 'pod-mijalnik', priceRegular: 14000, priceSale: 9900, badges: ['Акција'], oldUrl: '/produkt/spar-aqua-pro-mineral/' },
  { slug: 'dispenzer-topla-ladna-ro', name: 'Диспензер за топла и ладна вода (RO)', tagline: '5 фази филтрација — ладна до 5°C, топла до 90°C.', cat: 'dispenzeri', audience: 'BOTH', priceRegular: 42000, priceSale: 36000, badges: ['Акција', 'За фирми'], featured: true, oldUrl: '/produkt/dispanzer-za-topla-ladna-voda-so-reverzna-osmoza/' },
  { slug: 'sistem-cel-dom', name: 'Систем за филтрација за цело домаќинство', tagline: 'Филтрирана вода на секоја чешма во домот.', cat: 'cel-dom', priceRegular: 1590, showPrice: true, badges: ['Бесплатна монтажа'], oldUrl: '/produkt/sistem-za-filtracija-na-celo-domakinstvo/' },
  { slug: 'big-blue-2-stepen', name: 'Биг Блу 2-степен систем', tagline: 'Двостепена филтрација за целиот дом.', cat: 'cel-dom', priceRegular: 26000, priceSale: 22000, badges: ['Акција'], oldUrl: '/produkt/2-stepen-sistem-za-filtriranje-na-voda/' },
  { slug: 'big-blue-3-stepen', name: 'Биг Блу 3-степен систем', tagline: 'Тростепена филтрација за целиот дом.', cat: 'cel-dom', priceRegular: 37000, priceSale: 29990, badges: ['Акција'], oldUrl: '/produkt/tri-stepen-sistem-filtriranje-voda/' },
  { slug: 'filter-protiv-bigor', name: 'Филтер против бигор на грејни тела', tagline: 'Заштита на бојлери, машини и котлиња.', cat: 'zastita-bigor', priceRegular: 1550, priceSale: 990, badges: ['Акција'], oldUrl: '/produkt/filter-protiv-bigor-na-grejni-tela/' },
  { slug: 'multifunkcionalna-slavina-hrom', name: 'Мултифункционална славина (хром)', tagline: 'Елегантна хром славина за филтрирана вода.', cat: 'dodatoci', priceRegular: 10990, priceSale: 7990, badges: ['Акција'], oldUrl: '/produkt/multi-funkcionalna-slavina-hrom/' },
  { slug: 'ph-merac', name: 'Дигитален pH мерач', tagline: 'Измерете ја киселоста на водата за секунди.', cat: 'meraci', priceRegular: 2000, priceSale: 1500, badges: ['Акција'], oldUrl: '/produkt/merac-ph-vrednost-vo-vodata/' },
  { slug: 'tds-merac', name: 'TDS мерач', tagline: 'Проверете ги растворените материи во водата.', cat: 'meraci', priceRegular: 2000, priceSale: 1500, badges: ['Акција'], oldUrl: '/produkt/tds-merac-za-proverka-na-cistota-na-voda/' },
  { slug: 'aparat-elektroliza', name: 'Апарат за електролиза', tagline: 'Визуелна демонстрација на квалитетот на водата.', cat: 'meraci', priceRegular: 1500, priceSale: 1000, badges: ['Акција'], oldUrl: '/produkt/апарат-за-електролиза/' },
  { slug: 'mineralen-tus', name: 'Минерален туш', tagline: 'Помека вода и кожа со минерален туш.', cat: 'dodatoci', priceRegular: 1500, priceSale: 990, badges: ['Акција'], oldUrl: '/produkt/mineralen-tush/' },
];

// 6 filtration stages for the flagship (copy bank).
const FLAGSHIP_STAGES = [
  { order: 1, name: 'Седимент филтер (5 микрони)', removes: 'песок, ’рѓа и прашина', whyItMatters: 'Го штити остатокот од системот од крупни честички.' },
  { order: 2, name: 'Гранулиран активен јаглен', removes: 'хлор, мириси и хемикалии', whyItMatters: 'Ја враќа природната свежина на водата.' },
  { order: 3, name: 'Карбон блок', removes: 'преостанати хлориди', whyItMatters: 'Дополнително чистење пред мембраната.' },
  { order: 4, name: 'RO мембрана', removes: '95–99% растворени соли, бактерии, вируси и тешки метали', whyItMatters: 'Срцето на системот — најфина филтрација.' },
  { order: 5, name: 'Пост-карбон (кокосов)', removes: 'преостанати мириси', whyItMatters: 'Финално дотерување на вкусот.' },
  { order: 6, name: 'Алкализатор / минерализатор', removes: '—', whyItMatters: 'Додава калциум и магнезиум, pH 8.5+.' },
];

// What every product price includes (prototype „Што вклучува цената").
const DEFAULT_INCLUDED = [
  'Достава низ цела Македонија',
  'Бесплатна монтажа од наш техничар',
  'Обука за користење',
  '10 години гаранција',
  'Плаќање во готово или на рати',
];

const RO_MAINTENANCE =
  'Степените 1–3 се менуваат на 6–12 месеци, мембраната на 24–36 месеци, пост-карбон и минерализатор на 12 месеци. SPAR доаѓа на замена — не ви треба мајстор.';

// Card feature chips — fallback for any product that has no rewritten benefits in PRODUCT_CONTENT.
const CHIPS: Record<string, string[]> = {
  'spar-crystal-digital-600hf': ['6 степени', 'Директен проток', 'pH 8.5+', 'Дигитален дисплеј'],
  'spar-crystal-smart': ['6 степени', 'Резервоар', 'pH 8.5+', 'Дигитален дисплеј'],
  'spar-crystal-pro': ['6 степени', 'Резервоар', 'pH 8.5+'],
  'spar-aqua-smart': ['Реверзна осмоза', 'Дигитален дисплеј', 'pH 8.5+'],
  'aqua-glass': ['7 фази', '9 минерализација', 'Алкална'],
  'spar-aqua-pro': ['Реверзна осмоза', 'Компактен'],
  'spar-aqua-minerals': ['Реверзна осмоза', 'Минерали'],
  'dispenzer-topla-ladna-ro': ['5 фази', 'Топла/ладна', 'Реверзна осмоза'],
  'sistem-cel-dom': ['Цел дом', 'Повеќе точки'],
  'big-blue-2-stepen': ['2 степени', 'Цел дом'],
  'big-blue-3-stepen': ['3 степени', 'Цел дом'],
  'filter-protiv-bigor': ['Против бигор', 'Грејни тела'],
  'multifunkcionalna-slavina-hrom': ['Хром', 'Мултифункционална'],
  'ph-merac': ['pH мерач', 'Дигитален'],
  'tds-merac': ['TDS мерач', 'Дигитален'],
  'aparat-elektroliza': ['Демонстрација', 'Квалитет'],
  'mineralen-tus': ['Минерален', 'Туш'],
};

// ── Per-product content (rewritten & structured from the legacy filtervoda.mk pages) ──────────
// Real facts only; specs the old site never stated are LEFT OUT (the client fills them via the
// friendly admin) — never shown as „[потврди]" on the storefront. See
// _docs/plans/product-content-draft.md for the full extraction + open questions.
interface StageSeed { order: number; name: string; removes: string; whyItMatters: string }
interface SpecSeed { group: string; label: string; value: string; unit?: string }
interface ProductContent {
  idealFor?: string[];
  benefits?: string[];
  includedInPrice?: string[];
  maintenanceNote?: string | null;
  seoDescription?: string;
  stages?: StageSeed[];
  specs?: SpecSeed[];
}

const st = (rows: [string, string, string][]): StageSeed[] => rows.map(([name, removes, whyItMatters], i) => ({ order: i + 1, name, removes, whyItMatters }));

const STAGES_6_STD = FLAGSHIP_STAGES;
const STAGES_AQUA_SMART = st([
  ['Седимент филтер (5 микрони)', 'песок и крупни честички', 'Прва линија на заштита.'],
  ['Карбон филтер', 'хлор и хемиски вкус', 'Појасна и почиста вода.'],
  ['Активен јаглен', 'мириси и органски материи', 'Природна свежина.'],
  ['Реверзна осмоза (0,0001 микрон)', '95–99% соли, тешки метали, бактерии и вируси', 'Најфина филтрација.'],
  ['Пост-карбон филтер', 'преостанати мириси', 'Дотерување на вкусот.'],
  ['Минерален + алкален филтер', '—', 'Додава минерали и алкална вода.'],
]);
const STAGES_AQUA_GLASS = st([
  ['Седимент филтер (двојна филтрација)', 'песок и нечистотии', 'Груба заштита во два слоја.'],
  ['Гранулиран јаглен (двојна филтрација)', 'хлор и мирис', 'Појасен вкус.'],
  ['Карбон блок (двојна филтрација)', 'органски материи', 'Дополнително прочистување.'],
  ['Реверзна осмоза (15 обвивки, 0,001 микрон)', 'тешки метали, соли и бактерии', 'Срцето на системот.'],
  ['Пост-карбон + pH стабилизатор', 'преостанати мириси', 'Стабилен вкус и pH.'],
  ['Минерален филтер', '—', 'Враќа есенцијални минерали.'],
  ['Алкален филтер', '—', 'Подига алкалност за здрава вода.'],
]);
const STAGES_AQUA_PRO = st([
  ['Седимент (5 микрони)', 'песок, камчиња и заматеност', 'Груба механичка филтрација.'],
  ['Карбон филтер', 'непријатен вкус и мирис', 'Појасна вода.'],
  ['Активен јаглен', 'хлор, флуор и бигор', 'Заштита пред мембраната.'],
  ['Реверзна осмоза (0,0001 микрон)', 'арсен, жива, железо, хемикалии, соли, вируси и бактерии', 'Најфина филтрација.'],
  ['Пост-карбон филтер', 'преостанати мириси', 'Подобрен вкус.'],
]);
const STAGES_AQUA_MINERALS = st([
  ['Седимент (5 микрони)', 'песок, камчиња и заматеност', 'Груба механичка филтрација.'],
  ['Карбон филтер', 'непријатен вкус и мирис', 'Појасна вода.'],
  ['Активен јаглен', 'хлор, флуор и бигор', 'Заштита пред мембраната.'],
  ['Реверзна осмоза (0,0001 микрон)', 'арсен, жива, железо, хемикалии, соли, вируси и бактерии', 'Најфина филтрација.'],
  ['Пост-карбон филтер', 'преостанати мириси', 'Подобрен вкус.'],
  ['Минерален + алкален филтер', '—', 'Додава калциум, калиум и магнезиум; pH над 8,5.'],
]);
const STAGES_CEL_DOM = st([
  ['Седимент филтер (5 микрони)', 'песок, нечистотии и заматеност', 'Груба заштита на целиот дом.'],
  ['Филтер со активен јаглен', 'хлор', 'Неутрализира хлор.'],
  ['Филтер со гранулиран јаглен', 'непријатни мириси', 'Подобрен вкус и мирис.'],
]);
const STAGES_BB2 = st([
  ['Седимент филтер (20 микрони)', 'песок, ’рѓа и кал', 'Груба механичка филтрација, штити ги влошките.'],
  ['Карбон блок', 'хлор', 'Подобрува вкус, боја и мирис.'],
]);
const STAGES_BB3 = st([
  ['Седимент филтер (20 микрони)', 'песок, ’рѓа и кал', 'Прва груба филтрација.'],
  ['Карбон блок', 'хлор', 'Подобрува вкус, боја и мирис.'],
  ['Седимент филтер (5 микрони)', 'фини честички', 'Финиш-фаза за поголема бистрина.'],
]);

const INCLUDED_SMALL = ['Достава низ цела Македонија', 'Плаќање во готово или на рати'];

const PRODUCT_CONTENT: Record<string, ProductContent> = {
  'spar-crystal-digital-600hf': {
    idealFor: ['Домаќинства што сакаат врвен модел без резервоар', 'Помал простор под мијалникот', 'Оние што сакаат секогаш свежа вода без складирање'],
    benefits: ['Директен проток — без резервоар и без складирана вода', 'Дигитален дисплеј за чистотата и состојбата на филтрите', 'Алкална и минерализирана вода (pH 8,5+)', 'Без хлор, хемикалии и бигор'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'SPAR Crystal Digital 600HF — реверзна осмоза со директен проток без резервоар и дигитален дисплеј. 6 степени, алкална вода, бесплатна монтажа.',
    stages: STAGES_6_STD,
    specs: [
      { group: 'Општо', label: 'Тип на систем', value: 'Директен проток (без резервоар)' },
      { group: 'Општо', label: 'Степени на филтрација', value: '6' },
      { group: 'Општо', label: 'Дигитален дисплеј', value: 'Да' },
      { group: 'Квалитет на вода', label: 'pH на излез', value: '8,5+' },
      { group: 'Квалитет на вода', label: 'Отстранување на TDS', value: '95–99', unit: '%' },
      { group: 'Гаранција', label: 'Гаранција', value: '10', unit: 'години' },
    ],
  },
  'spar-crystal-smart': {
    idealFor: ['Домаќинства што сакаат резерва прочистена вода', 'Оние што сакаат индикатор за истрошеност на филтрите'],
    benefits: ['Резервоар — секогаш достапна прочистена вода', 'Дигитален дисплеј за чистотата и истрошеноста на филтрите', 'Алкална и минерализирана вода (pH 8,5+)', 'Компактен дизајн под мијалник'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'SPAR Crystal Smart — реверзна осмоза со резервоар и дигитален дисплеј. 6 степени, алкална вода, бесплатна монтажа.',
    stages: STAGES_6_STD,
    specs: [
      { group: 'Општо', label: 'Тип на систем', value: 'Со резервоар' },
      { group: 'Општо', label: 'Степени на филтрација', value: '6' },
      { group: 'Општо', label: 'Дигитален дисплеј', value: 'Да (чистота + истрошеност)' },
      { group: 'Квалитет на вода', label: 'pH на излез', value: '8,5+' },
      { group: 'Квалитет на вода', label: 'Отстранување на TDS', value: '95–99', unit: '%' },
      { group: 'Гаранција', label: 'Гаранција', value: '10', unit: 'години' },
    ],
  },
  'spar-crystal-pro': {
    idealFor: ['Домаќинства со ограничен буџет', 'Прв систем за прочистување', 'Квалитетна филтрација без екстра дисплеј'],
    benefits: ['Најповолен модел во серијата', 'Алкална и минерализирана вода (pH 8,5+)', 'Без хлор, хемикалии и бигор', 'Компактен дизајн под мијалник'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'SPAR Crystal Pro — најповолен систем со реверзна осмоза, 6 степени, алкална вода (pH 8,5+), 10 години гаранција и бесплатна монтажа.',
    stages: STAGES_6_STD,
    specs: [
      { group: 'Општо', label: 'Степени на филтрација', value: '6' },
      { group: 'Општо', label: 'Дигитален дисплеј', value: 'Не' },
      { group: 'Квалитет на вода', label: 'pH на излез', value: '8,5+' },
      { group: 'Квалитет на вода', label: 'Отстранување на TDS', value: '95–99', unit: '%' },
      { group: 'Гаранција', label: 'Гаранција', value: '10', unit: 'години' },
    ],
  },
  'spar-aqua-smart': {
    idealFor: ['Домаќинства што сакаат постојан приказ на чистотата', 'Заинтересирани за фина филтрација'],
    benefits: ['Вграден дисплеј — чистота на водата во реално време', 'RO мембрана до 0,0001 микрон', 'Минерален + алкален завршен филтер', '6 степени филтрација'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'Spar Aqua Smart — паметен прочистувач со реверзна осмоза до 0,0001 микрон и вграден дисплеј. 6 степени, минерален + алкален филтер.',
    stages: STAGES_AQUA_SMART,
    specs: [
      { group: 'Општо', label: 'Степени на филтрација', value: '6' },
      { group: 'Општо', label: 'Дигитален дисплеј', value: 'Да (чистота во реално време)' },
      { group: 'Квалитет на вода', label: 'Фина филтрација (RO)', value: '0,0001', unit: 'микрон' },
    ],
  },
  'aqua-glass': {
    idealFor: ['Домаќинства што сакаат максимален квалитет', 'Оние што бараат алкална минерализирана вода', 'Семејства со поголема потрошувачка'],
    benefits: ['Двојна филтрација на седимент, јаглен и карбон блок', 'Реверзна осмоза со 15 обвивки (0,001 микрон)', 'Минерален + алкален филтер за здрава алкална вода', 'Резервоар од 12 л (јаглероден челик)'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'AQUA GLASS — трета генерација систем со двојна филтрација, реверзна осмоза 0,001 микрон и минерализација за чиста алкална вода. Бесплатна монтажа.',
    stages: STAGES_AQUA_GLASS,
    specs: [
      { group: 'Општо', label: 'Фази на прочистување', value: '7' },
      { group: 'Квалитет на вода', label: 'Реверзна осмоза', value: '0,001 (15 обвивки)', unit: 'микрон' },
      { group: 'Технички', label: 'Резервоар', value: '12', unit: 'литри' },
      { group: 'Технички', label: 'Материјал на резервоар', value: 'Јаглероден челик' },
    ],
  },
  'spar-aqua-pro': {
    idealFor: ['Домаќинства што сакаат чиста вода по достапна цена', 'Оние на кои им е доволна класична осмоза'],
    benefits: ['5-степена реверзна осмоза (0,0001 микрон)', 'Отстранува арсен, жива, железо, хемикалии, соли, вируси и бактерии', 'Задржува хлор, флуор и бигор', 'Компактен и достапен'],
    includedInPrice: ['Достава низ цела Македонија', 'Бесплатна монтажа од наш техничар', '5 години гаранција', 'Плаќање во готово или на рати'],
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'Спар Аква Про — реверзна осмоза во 5 степени со мембрана 0,0001 микрон. Отстранува тешки метали, соли, вируси и бактерии. 5 години гаранција.',
    stages: STAGES_AQUA_PRO,
    specs: [
      { group: 'Општо', label: 'Фази', value: '5' },
      { group: 'Квалитет на вода', label: 'Реверзна осмоза', value: '0,0001', unit: 'микрон' },
      { group: 'Гаранција', label: 'Гаранција', value: '5', unit: 'години' },
    ],
  },
  'spar-aqua-minerals': {
    idealFor: ['Оние што сакаат минерализирана, алкална вода', 'Надградба над класичната осмоза'],
    benefits: ['6 степени со реверзна осмоза (0,0001 микрон)', 'Минерален + алкален филтер (калциум, калиум, магнезиум)', 'Подига pH над 8,5', 'Отстранува тешки метали, соли, вируси и бактерии'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'Спар Aqua Minerals — 6-степенска реверзна осмоза со минерален и алкален филтер. Додава калциум, калиум и магнезиум, pH над 8,5.',
    stages: STAGES_AQUA_MINERALS,
    specs: [
      { group: 'Општо', label: 'Фази', value: '6' },
      { group: 'Квалитет на вода', label: 'Реверзна осмоза', value: '0,0001', unit: 'микрон' },
      { group: 'Квалитет на вода', label: 'pH на излез', value: 'над 8,5' },
      { group: 'Квалитет на вода', label: 'Додадени минерали', value: 'Калциум, калиум, магнезиум' },
    ],
  },
  'dispenzer-topla-ladna-ro': {
    idealFor: ['Канцеларии и работни простори', 'Домаќинства што сакаат веднаш топла и ладна вода', 'Замена за галони и шишиња'],
    benefits: ['Топла вода до 90°C и ладна до 5°C', '5-фазна реверзна осмоза вградена во апаратот', 'Резервоари од не’рѓосувачки челик', 'Идеален за дом и канцеларија'],
    includedInPrice: DEFAULT_INCLUDED,
    maintenanceNote: RO_MAINTENANCE,
    seoDescription: 'Диспензер со реверзна осмоза во 5 фази — ладна вода до 5°C и топла до 90°C, резервоари од не’рѓосувачки челик. Идеален за дом и канцеларија.',
    specs: [
      { group: 'Општо', label: 'Фази на филтрација', value: '5' },
      { group: 'Топла вода', label: 'Температура', value: 'до 90', unit: '°C' },
      { group: 'Ладна вода', label: 'Температура', value: 'до 5', unit: '°C' },
      { group: 'Технички', label: 'Резервоар (ладна)', value: '3,2', unit: 'литри' },
      { group: 'Технички', label: 'Резервоар (топла)', value: '1,2', unit: 'литри' },
      { group: 'Технички', label: 'Материјал на резервоари', value: 'Не’рѓосувачки челик' },
      { group: 'Гаранција', label: 'Гаранција', value: '10', unit: 'години' },
    ],
  },
  'sistem-cel-dom': {
    idealFor: ['Филтрирана вода на влезот за целиот дом', 'Решение по мерка на буџетот (1 до 3 фази)'],
    benefits: ['Три варијанти — од основна до напредна заштита', 'Достапен со приклучок 1/2″, 3/4″ и 1″', 'Отстранува песок, нечистотии и заматеност', 'Неутрализира хлор и подобрува вкус и мирис'],
    includedInPrice: DEFAULT_INCLUDED,
    seoDescription: 'Систем за филтрација на вода за цело домаќинство — 1, 2 или 3 фази, приклучок 1/2″, 3/4″ или 1″. Отстранува седимент, хлор и мириси.',
    stages: STAGES_CEL_DOM,
    specs: [
      { group: 'Општо', label: 'Варијанти', value: '1 / 2 / 3 фази' },
      { group: 'Монтажа', label: 'Димензии на приклучок', value: '1/2″, 3/4″, 1″' },
    ],
  },
  'big-blue-2-stepen': {
    idealFor: ['Домаќинства со песок, ’рѓа и кал во водата', 'Заштита на целиот дом со едноставна монтажа'],
    benefits: ['Двостепена филтрација за целиот дом', 'Седимент 20 микрони + карбон блок', 'Подобрува вкус, боја и мирис на водата', 'Лесна монтажа на ѕид'],
    includedInPrice: DEFAULT_INCLUDED,
    seoDescription: 'Биг Блу 2-степен систем за целиот дом: седимент 20 микрони + карбон блок. Отстранува песок, ’рѓа, кал и хлор.',
    stages: STAGES_BB2,
    specs: [
      { group: 'Влошки', label: 'Степен 1 — седимент', value: '20', unit: 'микрони' },
      { group: 'Влошки', label: 'Степен 2', value: 'Карбон блок' },
      { group: 'Монтажа', label: 'Начин', value: 'На ѕид' },
    ],
  },
  'big-blue-3-stepen': {
    idealFor: ['Домаќинства што сакаат пофина филтрација', 'Вода со повеќе седимент и ’рѓа'],
    benefits: ['Тристепена филтрација за целиот дом', 'Двојна седиментна филтрација (20 → 5 микрони)', 'Плус карбон блок за вкус, боја и мирис', 'Лесна монтажа на ѕид'],
    includedInPrice: DEFAULT_INCLUDED,
    seoDescription: 'Биг Блу тристепен систем за целиот дом: седимент 20 микрони + карбон блок + седимент 5 микрони. Отстранува песок, ’рѓа, кал и хлор.',
    stages: STAGES_BB3,
    specs: [
      { group: 'Влошки', label: 'Степен 1 — седимент', value: '20', unit: 'микрони' },
      { group: 'Влошки', label: 'Степен 2', value: 'Карбон блок' },
      { group: 'Влошки', label: 'Степен 3 — седимент', value: '5', unit: 'микрони' },
      { group: 'Монтажа', label: 'Начин', value: 'На ѕид' },
    ],
  },
  'filter-protiv-bigor': {
    idealFor: ['Машини за алишта', 'Машини за садови', 'Бојлери и уреди со грејни тела'],
    benefits: ['Поли-фосфатни кристали што спречуваат таложење бигор', 'Го продолжува животниот век на грејните тела', 'Значителна заштеда на електрична енергија', 'Долгорочна заштита за домашните уреди'],
    includedInPrice: INCLUDED_SMALL,
    maintenanceNote: 'Рок на употреба 1–2 години, зависно од условите на користење; замена по потреба.',
    seoDescription: 'Филтер против бигор со поли-фосфатни кристали за машини за алишта, садови и бојлери. Спречува таложење бигор и штеди енергија.',
    specs: [
      { group: 'Медиум', label: 'Состав', value: 'Поли-фосфатни кристали' },
      { group: 'Трајност', label: 'Рок на употреба', value: '1–2', unit: 'години' },
      { group: 'Примена', label: 'Уреди', value: 'Машини за алишта, садови, бојлери' },
    ],
  },
  'multifunkcionalna-slavina-hrom': {
    idealFor: ['Домаќинства со реверзно-осмотски систем', 'Кујни без слободен отвор за дополнителна славина'],
    benefits: ['3-насочна — топла, ладна и филтрирана вода од една славина', 'Изработена од висококвалитетен не’рѓосувачки челик', 'Хром завршница за модерна кујна', 'Не бара дополнително дупчење на умивалникот'],
    includedInPrice: INCLUDED_SMALL,
    seoDescription: '3-насочна кујнска славина од не’рѓосувачки челик со хром завршница — топла, ладна и филтрирана вода од една чешма.',
    specs: [
      { group: 'Материјал', label: 'Материјал', value: 'Не’рѓосувачки челик' },
      { group: 'Материјал', label: 'Завршница', value: 'Хром' },
      { group: 'Функција', label: 'Тип', value: '3-насочна (топла/ладна/филтрирана)' },
    ],
  },
  'ph-merac': {
    idealFor: ['Домаќинства што ја следат pH вредноста на водата', 'Сопственици на филтер/RO системи'],
    benefits: ['Прецизно мерење на pH вредноста', 'Јасен LCD дисплеј', 'Автоматска калибрација', 'Компактен и пренослив — за џеб'],
    includedInPrice: INCLUDED_SMALL,
    maintenanceNote: 'Работи на батерија; препорачано периодично калибрирање.',
    seoDescription: 'Дигитален pH мерач со LCD екран и автоматска калибрација — брзо и прецизно ја проверува pH вредноста на водата.',
    specs: [
      { group: 'Мерење', label: 'Големина', value: 'pH' },
      { group: 'Мерење', label: 'Калибрација', value: 'Автоматска' },
      { group: 'Дисплеј', label: 'Екран', value: 'LCD' },
    ],
  },
  'tds-merac': {
    idealFor: ['Проверка на чистотата на филтрирана vs. водоводна вода', 'Сопственици на RO системи'],
    benefits: ['Мери вкупно растворени материи (TDS) во ppm', 'Автоматска температурна компензација', 'Мери и температура', 'Авто-исклучување за заштеда на батерија'],
    includedInPrice: INCLUDED_SMALL,
    maintenanceNote: 'Работи на батерија со авто-исклучување за подолг век.',
    seoDescription: 'TDS мерач за проверка на чистотата на водата — покажува вкупно растворени материи во ppm, со автоматска температурна компензација.',
    specs: [
      { group: 'Мерење', label: 'Големина', value: 'TDS (вкупно растворени материи)' },
      { group: 'Мерење', label: 'Единица', value: 'ppm' },
      { group: 'Мерење', label: 'Температурна компензација', value: 'Автоматска (ATC)' },
      { group: 'Функции', label: 'Авто-исклучување', value: 'Да' },
    ],
  },
  'aparat-elektroliza': {
    idealFor: ['Визуелна демонстрација на разлика меѓу водоводна и филтрирана вода', 'Брз домашен тест на квалитет'],
    benefits: ['Брз тест — резултати за 30–60 секунди', 'Едноставна употреба', 'Компактен и пренослив', 'Промена на боја што ги индицира растворените материи'],
    includedInPrice: INCLUDED_SMALL,
    seoDescription: 'Апарат за електролиза — брз визуелен тест на квалитетот на водата за 30–60 секунди преку промена на бојата на растворените материи.',
    specs: [
      { group: 'Функција', label: 'Тип', value: 'Демонстрациски тест (електролиза)' },
      { group: 'Функција', label: 'Време на тест', value: '30–60', unit: 'секунди' },
      { group: 'Индикација', label: 'Метод', value: 'Промена на боја' },
    ],
  },
  'mineralen-tus': {
    idealFor: ['Корисници со чувствителна кожа и коса', 'Домаќинства што сакаат подобра вода за туширање'],
    benefits: ['Минерална мешавина — турмалин, германиум и глинени зрнца', 'Помага во балансирање на pH нивото', 'Намалување на хлор за поздрава кожа и коса', 'Лесна монтажа на стандардни тушеви, без алати'],
    includedInPrice: INCLUDED_SMALL,
    maintenanceNote: 'Минералните зрнца се потрошен дел — замена на влошокот по потреба.',
    seoDescription: 'Минерален туш со турмалин и германиум — филтрира вода под туш, балансира pH и намалува хлор за поздрава кожа и коса.',
    specs: [
      { group: 'Медиум', label: 'Минерали', value: 'Турмалин, германиум, глинени зрнца' },
      { group: 'Монтажа', label: 'Компатибилност', value: 'Стандардни тушеви, без алати' },
    ],
  },
};

// Product images (copied from the handoff into apps/web/public/img/products, served at /img/products).
const IMG: Record<string, string> = {
  'spar-crystal-digital-600hf': 'digital.png',
  'spar-crystal-smart': 'crystal-smart.png',
  'spar-crystal-pro': 'crystal-pro.png',
  'spar-aqua-smart': 'aqua-smart.png',
  'aqua-glass': 'aqua-glass.png',
  'spar-aqua-pro': 'aqua-pro.png',
  'spar-aqua-minerals': 'aqua-minerals.png',
  'dispenzer-topla-ladna-ro': 'dispenzer.jpg',
  'sistem-cel-dom': 'cel-dom.png',
  'big-blue-2-stepen': 'big-blue-2.jpg',
  'big-blue-3-stepen': 'big-blue-3.jpg',
  'filter-protiv-bigor': 'bigor.png',
  'multifunkcionalna-slavina-hrom': 'slavina.jpg',
  'ph-merac': 'ph-merac.jpg',
  'tds-merac': 'tds.jpg',
  'aparat-elektroliza': 'elektroliza.jpg',
  'mineralen-tus': 'tus.png',
};

// Extra product photos pulled from the legacy filtervoda.mk galleries (different angles/variants
// than the primary). Added as non-primary gallery images so the product page shows more than one
// shot. Only products whose legacy gallery had a genuinely different image appear here.
const IMG_ALT: Record<string, string[]> = {
  'aqua-glass': ['aqua-glass-alt.png'],
  'spar-aqua-pro': ['aqua-pro-alt.png'],
  'spar-aqua-minerals': ['aqua-minerals-alt.png', 'aqua-minerals-alt2.png'],
  'dispenzer-topla-ladna-ro': ['dispenzer-alt.jpg'],
  'sistem-cel-dom': ['cel-dom-alt.png', 'cel-dom-alt2.png'],
  'big-blue-2-stepen': ['big-blue-2-alt.jpg'],
  'big-blue-3-stepen': ['big-blue-3-alt.jpg'],
  'filter-protiv-bigor': ['bigor-alt.png', 'bigor-alt2.png'],
  'multifunkcionalna-slavina-hrom': ['slavina-alt.jpg'],
  'ph-merac': ['ph-merac-alt.jpg', 'ph-merac-alt2.png'],
  'tds-merac': ['tds-alt.jpg'],
  'aparat-elektroliza': ['elektroliza-alt.jpg', 'elektroliza-alt2.jpg'],
};

const B2B_PACKAGES = [
  { name: 'Старт', priceFrom: 2900, description: 'За мали тимови и ординации.', includes: ['Апарат топла/ладна', 'Бесплатна монтажа', 'Замена на филтри'], employeesMin: 1, employeesMax: 10, sortOrder: 1 },
  { name: 'Бизнис', priceFrom: 4900, description: 'За канцеларии и кафулиња.', includes: ['Апарат топла/ладна', 'Бесплатна монтажа', 'Замена на филтри', 'Сервис и одржување'], employeesMin: 10, employeesMax: 30, sortOrder: 2 },
  { name: 'Про', priceFrom: 7900, description: 'За поголеми тимови и хотели.', includes: ['Повеќе апарати', 'Бесплатна монтажа', 'Замена на филтри', 'Приоритетен сервис', 'Замена при дефект'], employeesMin: 30, sortOrder: 3 },
];

async function main() {
  await prisma.tenant.upsert({
    where: { id: TENANT },
    update: {},
    create: { id: TENANT, name: 'SPAR Company' },
  });

  const catIdBySlug = new Map<string, number>();
  for (const c of CATEGORIES) {
    const row = await prisma.productCategory.upsert({
      where: { tenantId_slug: { tenantId: TENANT, slug: c.slug } },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: { tenantId: TENANT, ...c },
    });
    catIdBySlug.set(c.slug, row.id);
  }

  for (const p of PRODUCTS) {
    const categoryId = catIdBySlug.get(p.cat);
    if (!categoryId) throw new Error(`Unknown category ${p.cat} for ${p.slug}`);
    const c = PRODUCT_CONTENT[p.slug];
    // Prefer the rewritten per-product content; fall back to card chips when a product has none.
    const features = (c?.benefits?.length ? c.benefits : (CHIPS[p.slug] ?? [])).map((text) => ({ text }));
    const idealFor = c?.idealFor ?? [];
    const includedInPrice = c?.includedInPrice ?? DEFAULT_INCLUDED;
    const maintenanceNote = c?.maintenanceNote ?? null;
    const seoDescription = c?.seoDescription ?? null;
    const product = await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: TENANT, slug: p.slug } },
      update: {
        name: p.name,
        tagline: p.tagline,
        categoryId,
        priceRegular: p.priceRegular,
        priceSale: p.priceSale ?? null,
        showPrice: p.showPrice ?? true,
        badges: p.badges ?? [],
        features,
        idealFor,
        includedInPrice,
        maintenanceNote,
        seoDescription,
        featured: p.featured ?? false,
        audience: (p.audience ?? 'B2C') as ProductAudience,
      },
      create: {
        tenantId: TENANT,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        categoryId,
        audience: (p.audience ?? 'B2C') as ProductAudience,
        priceRegular: p.priceRegular,
        priceSale: p.priceSale ?? null,
        showPrice: p.showPrice ?? true,
        badges: p.badges ?? [],
        features,
        idealFor,
        includedInPrice,
        maintenanceNote,
        seoDescription,
        featured: p.featured ?? false,
        status: PublishStatus.PUBLISHED,
        warrantyYears: 10,
      },
    });

    // Redirect old WP URL → new product URL.
    await prisma.redirect.upsert({
      where: { tenantId_fromPath: { tenantId: TENANT, fromPath: p.oldUrl } },
      update: { toPath: `/proizvodi/${p.slug}` },
      create: { tenantId: TENANT, fromPath: p.oldUrl, toPath: `/proizvodi/${p.slug}`, statusCode: 301 },
    });

    // Product primary image (from the handoff, served by the web app at /img/products).
    const imgFile = IMG[p.slug];
    if (imgFile) {
      const url = `/img/products/${imgFile}`;
      let media = await prisma.media.findFirst({ where: { url } });
      if (!media) media = await prisma.media.create({ data: { tenantId: TENANT, driver: 'static', key: imgFile, url, alt: p.name, variants: [] } });
      const exists = await prisma.productImage.findFirst({ where: { productId: product.id, mediaId: media.id } });
      if (!exists) {
        await prisma.productImage.deleteMany({ where: { productId: product.id } });
        await prisma.productImage.create({ data: { productId: product.id, mediaId: media.id, alt: p.name, sortOrder: 0, isPrimary: true } });
      }
    }

    // Secondary gallery images from the legacy site (extra angles). Created after the primary,
    // idempotently, as non-primary images — never wiped, never duplicated on reseed.
    const altFiles = IMG_ALT[p.slug] ?? [];
    for (let i = 0; i < altFiles.length; i++) {
      const altFile = altFiles[i];
      const altUrl = `/img/products/${altFile}`;
      let altMedia = await prisma.media.findFirst({ where: { url: altUrl } });
      if (!altMedia) altMedia = await prisma.media.create({ data: { tenantId: TENANT, driver: 'static', key: altFile, url: altUrl, alt: p.name, variants: [] } });
      const altExists = await prisma.productImage.findFirst({ where: { productId: product.id, mediaId: altMedia.id } });
      if (!altExists) {
        await prisma.productImage.create({ data: { productId: product.id, mediaId: altMedia.id, alt: p.name, sortOrder: i + 1, isPrimary: false } });
      }
    }

    // Per-product filtration stages + technical specs (rewritten from the legacy pages).
    // Replace-all so a reseed always reflects the current content; products without stages
    // (accessories/meters) simply get none.
    if (c?.stages?.length) {
      await prisma.productStage.deleteMany({ where: { productId: product.id } });
      await prisma.productStage.createMany({ data: c.stages.map((s) => ({ ...s, productId: product.id })) });
    }
    if (c?.specs?.length) {
      await prisma.productSpec.deleteMany({ where: { productId: product.id } });
      await prisma.productSpec.createMany({
        data: c.specs.map((s, i) => ({ productId: product.id, group: s.group, label: s.label, value: s.value, unit: s.unit ?? null, sortOrder: i })),
      });
    }

    // Note: generic FAQ is seeded ONCE as GLOBAL (see FAQS below) and shown on every product
    // page — NOT duplicated per product (that created 68 identical rows in the admin).
  }

  // Related products — up to 3 others in the same category.
  const allProducts = await prisma.product.findMany({ where: { tenantId: TENANT }, select: { id: true, categoryId: true } });
  const byCategory = new Map<number, string[]>();
  for (const pr of allProducts) {
    const list = byCategory.get(pr.categoryId) ?? [];
    list.push(pr.id);
    byCategory.set(pr.categoryId, list);
  }
  for (const pr of allProducts) {
    const siblings = (byCategory.get(pr.categoryId) ?? []).filter((id) => id !== pr.id).slice(0, 3);
    await prisma.relatedProduct.deleteMany({ where: { productId: pr.id } });
    if (siblings.length > 0) {
      await prisma.relatedProduct.createMany({
        data: siblings.map((relatedId, i) => ({ productId: pr.id, relatedId, sortOrder: i })),
        skipDuplicates: true,
      });
    }
  }

  // B2B packages.
  for (const pkg of B2B_PACKAGES) {
    const existing = await prisma.b2bPackage.findFirst({ where: { tenantId: TENANT, name: pkg.name } });
    if (existing) {
      await prisma.b2bPackage.update({ where: { id: existing.id }, data: pkg });
    } else {
      await prisma.b2bPackage.create({ data: { tenantId: TENANT, active: true, ...pkg } });
    }
  }

  // Posts (Совети) — a couple of migrated-style articles.
  const POSTS = [
    {
      slug: 'reverzna-osmoza-kako-funkcionira',
      title: 'Реверзна осмоза — како функционира и зошто е важна',
      excerpt: 'Објаснуваме што е реверзна осмоза и како ја прочистува водата во вашиот дом.',
      html: '<p>Реверзната осмоза (RO) е технологија што ги отстранува 95–99% од растворените соли, бактерии, вируси и тешки метали.</p><h2>Како работи</h2><p>Водата поминува под притисок низ полупропусна мембрана што ги задржува нечистотиите.</p>',
    },
    {
      slug: 'cista-voda-na-rabota-za-firmi',
      title: 'Чиста вода на работа: решение за компании со 5+ вработени',
      excerpt: 'Зошто изнајмувањето апарат е поисплатливо од галоните.',
      html: '<p>Галоните носат трошок што расте со тимот, нарачки, носење и простор за складирање.</p><h2>Решението</h2><p>Апарат со реверзна осмоза, топла и ладна вода, за фиксен месечен износ — сè вклучено.</p>',
    },
  ];
  // Temporary post cover images (served by web at /img/products) until the CMS holds real covers.
  const POST_COVERS: Record<string, string> = {
    'reverzna-osmoza-kako-funkcionira': 'digital.png',
    'cista-voda-na-rabota-za-firmi': 'dispenzer.jpg',
  };
  for (const p of POSTS) {
    // Resolve a Media row for the temporary cover.
    let coverMediaId: string | null = null;
    const coverFile = POST_COVERS[p.slug];
    if (coverFile) {
      const url = `/img/products/${coverFile}`;
      let media = await prisma.media.findFirst({ where: { url } });
      if (!media) media = await prisma.media.create({ data: { tenantId: TENANT, driver: 'static', key: coverFile, url, alt: p.title, variants: [] } });
      coverMediaId = media.id;
    }
    await prisma.post.upsert({
      where: { tenantId_slug: { tenantId: TENANT, slug: p.slug } },
      update: { title: p.title, excerpt: p.excerpt, content: { html: p.html }, coverMediaId, status: 'PUBLISHED', publishedAt: new Date('2026-08-01') },
      create: { tenantId: TENANT, slug: p.slug, title: p.title, excerpt: p.excerpt, content: { html: p.html }, coverMediaId, status: 'PUBLISHED', publishedAt: new Date('2026-08-01') },
    });
  }

  // Testimonials + global FAQ.
  const TESTIMONIALS = [
    { name: 'Билјана С.', city: 'Скопје', text: 'Монтажата беше бесплатна и брза. Водата е одлична, без вкус на хлор.', rating: 5, scope: 'B2C' as const },
    { name: 'Кафе Бар Лума', company: 'Лума', city: 'Скопје', text: 'Се ослободивме од галоните. Топла и ладна вода за тимот, фиксен трошок.', rating: 5, scope: 'B2B' as const },
    { name: 'Дарко И.', city: 'Тетово', text: 'Дигиталниот дисплеј покажува кога треба замена на филтри — многу практично.', rating: 5, scope: 'B2C' as const },
  ];
  for (const t of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({ where: { tenantId: TENANT, name: t.name } });
    if (!existing) await prisma.testimonial.create({ data: { tenantId: TENANT, active: true, ...t } });
  }

  const FAQS = [
    { question: 'Дали монтажата е навистина бесплатна?', answer: 'Да, монтажата е бесплатна низ цела Македонија при купување на систем.', scope: 'GLOBAL' as const, sortOrder: 1 },
    { question: 'Колку често се менуваат филтрите?', answer: 'Зависно од моделот и потрошувачката, обично на 6–12 месеци. Дигиталните модели ве известуваат.', scope: 'GLOBAL' as const, sortOrder: 2 },
    { question: 'Дали може плаќање на рати?', answer: 'Да, овозможуваме плаќање во готово или на рати.', scope: 'GLOBAL' as const, sortOrder: 3 },
    { question: 'Дали водата останува здрава за пиење?', answer: 'Да. По реверзната осмоза додаваме минерали (калциум, магнезиум) и pH 8,5+ за баланс на вкус и здравје.', scope: 'GLOBAL' as const, sortOrder: 4 },
    { question: 'Што вклучува месечниот износ за фирми?', answer: 'Апарат за топла и ладна вода, бесплатна монтажа, редовна замена на филтри, сервис и замена при дефект.', scope: 'B2B' as const, sortOrder: 1 },
    { question: 'Дали има почетна инвестиција?', answer: 'Не. Кај изнајмувањето нема почетна инвестиција — плаќате фиксен месечен износ.', scope: 'B2B' as const, sortOrder: 2 },
    { question: 'Колку брзо е монтирањето за фирма?', answer: 'По бесплатната проценка, монтажата е брза и без прекин на работата.', scope: 'B2B' as const, sortOrder: 3 },
  ];
  for (const fq of FAQS) {
    const existing = await prisma.faq.findFirst({ where: { tenantId: TENANT, question: fq.question } });
    if (!existing) await prisma.faq.create({ data: { tenantId: TENANT, ...fq } });
  }

  // Users (dev credentials — change in real environments).
  const users = [
    { email: 'admin@filtervoda.mk', name: 'SPAR Admin', role: 'ADMIN' as const, password: 'admin12345' },
    { email: 'editor@filtervoda.mk', name: 'GoDigital Editor', role: 'EDITOR' as const, password: 'editor12345' },
    { email: 'client@filtervoda.mk', name: 'SPAR Client', role: 'CLIENT_VIEWER' as const, password: 'client12345' },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { tenantId: TENANT, email: u.email, name: u.name, role: u.role, passwordHash },
    });
  }

  // Settings — active template + per-template token overrides (empty = shipped defaults) + contact + flags.
  const settings: Record<string, unknown> = {
    'design.activeTemplate': 'b1',
    'design.templateTokens': { b1: {}, b2: {}, b3: {} },
    'contact.phones': ['076/676/819', '070/755/190'],
    'contact.viber': '+38976676819',
    'contact.emails': ['info@filtervoda.mk'],
    'contact.social': { facebook: 'https://facebook.com/filtervodamk', instagram: 'https://instagram.com/sparcompanymk' },
    'contact.address': 'Скопје, Македонија',
    'contact.workingHours': 'Пон–Саб 09:00–17:00',
    'cookie.bannerText':
      'Користиме колачиња за да го подобриме сајтот и за мерење на рекламите. Изберете што дозволувате.',
    'feature.b2bPage': true,
    'feature.calculator': true,
    'feature.compareTable': true,
    'feature.advisorForm': true,
    'calculator.params': { litersPerPersonDay: 1.5, workingDays: 22, gallonLiters: 19, defaultPricePerGallon: 120 },
    // Editable copy — seeded with the storefront defaults so the admin shows real text to edit.
    'content.hero.h1': 'Чиста, алкална вода директно од вашата чешма.',
    'content.hero.h2': 'Системи за филтрација со бесплатна монтажа и 10 години гаранција — низ цела Македонија.',
    'content.hero.cta': 'Побарај бесплатна консултација',
    'content.why.title': 'Зошто филтрирана вода?',
    'content.featured.title': 'Најбарани системи',
    'content.stages.title': 'Како функционира — 6 степени на филтрација',
    'content.testimonials.title': 'Што велат нашите клиенти',
    'content.articles.title': 'Совети за чиста вода',
    'content.advisor.title': 'Не знаете кој систем ви одговара?',
    'content.advisor.text': 'Оставете телефон — ќе ве советуваме бесплатно.',
    'content.thankyou.title': 'Благодариме за интересот!',
    'content.thankyou.text': 'Вашето барање е примено. Ќе ве контактираме во рок од еден работен ден на телефонот што го оставивте.',
    'b2b.problems': ['Трошок што расте со тимот', 'Нарачки и носење', 'Простор за складирање', 'Хигиена на галоните', 'Нема топла вода за кафе', 'Пластика и имиџ'],
    'b2b.included': ['Апарат за топла и ладна вода', 'Бесплатна монтажа', 'Редовна замена на филтри', 'Сервис и одржување', 'Замена при дефект', 'Без инвестиција'],
    'b2b.industries': ['Канцеларии', 'Кафулиња и ресторани', 'Ординации', 'Салони', 'Теретани', 'Хотели', 'Градинки и училишта', 'Автосалони', 'Продавници', 'Аптеки', 'Пекари и слаткарници', 'Автосервиси'],
    'b2b.heroLabel': 'ЗА ФИРМИ',
    'b2b.heroH1': 'Заборавете на галоните. Неограничена чиста вода за вашиот тим.',
    'b2b.heroSubhead': 'Изнајмете апарат од SPAR со сè вклучено — монтажа, филтри, сервис — за фиксен месечен износ.',
    'b2b.heroCta': 'Побарај понуда за фирма',
    'b2b.heroTrust': 'Бесплатна проценка · Без скриени трошоци · Брза монтажа',
    'b2b.logosTitle': 'ИМ ВЕРУВААТ ФИРМИ НИЗ МАКЕДОНИЈА',
    'b2b.problemsTitle': 'Колку навистина ве чинат галоните?',
    'b2b.includedTitle': 'Еден месечен износ. Сè вклучено.',
    'b2b.calcTitle': 'Пресметајте колку заштедувате',
    'b2b.stepsTitle': 'Како функционира',
    'b2b.packagesTitle': 'Пакети',
    'b2b.industriesTitle': 'За кои бизниси',
    'b2b.comparisonTitle': 'Галони · Купување · Изнајмување од SPAR',
    'b2b.faqTitle': 'Често поставувани прашања',
    'b2b.formTitle': 'Побарај понуда за фирма',
    'b2b.formText': 'Оставете податоци за вашата фирма — ќе ве контактираме со точна понуда, бесплатна проценка и термин за монтажа.',
    'b2b.steps': [
      { title: 'Побарајте понуда', desc: 'Две минути — формата или еден телефонски повик.' },
      { title: 'Бесплатна проценка и монтажа', desc: 'Доаѓаме, гледаме и монтираме без трошок за вас.' },
      { title: 'Пиете неограничено', desc: 'Ние се грижиме за сè — филтри, сервис, замена.' },
    ],
    'b2b.comparison': [
      { label: 'Месечен трошок', gallons: 'Расте со тимот', buy: 'Без', rent: 'Фиксен, предвидлив' },
      { label: 'Почетна инвестиција', gallons: 'Не', buy: 'Висока', rent: 'Нема' },
      { label: 'Нарачки и носење', gallons: 'Постојано', buy: 'Не', rent: 'Не' },
      { label: 'Топла/ладна вода', gallons: 'Не', buy: 'Зависно', rent: 'Да' },
      { label: 'Замена на филтри и сервис', gallons: 'Не', buy: 'Ваша грижа', rent: 'Вклучено' },
      { label: 'Замена при дефект', gallons: 'Не', buy: 'Ваша грижа', rent: 'Вклучено' },
      { label: 'Договорна обврска', gallons: 'Не', buy: 'Не', rent: '12 месеци [потврди]' },
    ],
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { tenantId_key: { tenantId: TENANT, key } },
      update: { value: value as object },
      create: { tenantId: TENANT, key, value: value as object },
    });
  }

  // eslint-disable-next-line no-console
  console.warn(`Seed done: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${users.length} users.`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
