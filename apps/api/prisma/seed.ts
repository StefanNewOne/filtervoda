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

// „Идеален за" cards for under-sink / dispenser RO systems.
const RO_IDEAL_FOR = [
  'Домаќинства што сакаат чиста вода за пиење и готвење',
  'Простории со тврда вода и бигор',
  'Семејства со мали деца',
];

const RO_MAINTENANCE =
  'Степените 1–3 се менуваат на 6–12 месеци, мембраната на 24–36 месеци, пост-карбон и минерализатор на 12 месеци. SPAR доаѓа на замена — не ви треба мајстор.';

// Technical specification groups for RO systems (prototype „Техничка спецификација").
const RO_SPECS: { group: string; label: string; value: string; unit?: string }[] = [
  { group: 'Квалитет на вода', label: 'pH на излез', value: '8,5+' },
  { group: 'Квалитет на вода', label: 'Отстранување на TDS', value: '95–99', unit: '%' },
  { group: 'Квалитет на вода', label: 'Отстранува', value: 'Хлор, бигор, тешки метали, бактерии, вируси' },
  { group: 'Квалитет на вода', label: 'Додадени минерали', value: 'Калциум, магнезиум' },
  { group: 'Технички', label: 'Степени на филтрација', value: '6' },
  { group: 'Технички', label: 'Проток', value: '~600', unit: 'GPD [потврди]' },
  { group: 'Технички', label: 'Работен притисок', value: '3–6', unit: 'бари [потврди]' },
  { group: 'Технички', label: 'Гаранција', value: '10', unit: 'години' },
];


// Detailed specs/stages/idealFor are seeded ONLY for the flagship showcase — otherwise every
// product ends up with identical placeholder specs (they look like clones). The client fills
// real per-product data via the admin.
const FLAGSHIP_SLUG = 'spar-crystal-digital-600hf';

// Product chips (feature tags on cards + comparison table source).
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
        features: (CHIPS[p.slug] ?? []).map((text) => ({ text })),
        idealFor: p.slug === FLAGSHIP_SLUG ? RO_IDEAL_FOR : [],
        includedInPrice: DEFAULT_INCLUDED,
        maintenanceNote: p.slug === FLAGSHIP_SLUG ? RO_MAINTENANCE : null,
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
        features: (CHIPS[p.slug] ?? []).map((text) => ({ text })),
        idealFor: p.slug === FLAGSHIP_SLUG ? RO_IDEAL_FOR : [],
        includedInPrice: DEFAULT_INCLUDED,
        maintenanceNote: p.slug === FLAGSHIP_SLUG ? RO_MAINTENANCE : null,
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

    // Under-sink RO systems get the 6 filtration stages + full technical specs.
    if (p.slug === FLAGSHIP_SLUG) {
      await prisma.productStage.deleteMany({ where: { productId: product.id } });
      await prisma.productStage.createMany({ data: FLAGSHIP_STAGES.map((s) => ({ ...s, productId: product.id })) });
    }
    if (p.slug === FLAGSHIP_SLUG) {
      await prisma.productSpec.deleteMany({ where: { productId: product.id } });
      await prisma.productSpec.createMany({
        data: RO_SPECS.map((s, i) => ({ productId: product.id, group: s.group, label: s.label, value: s.value, unit: s.unit ?? null, sortOrder: i })),
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
