/**
 * FV-001 M2 — content translations (EN + SQ). Populates the `i18n` overlays that the localized
 * read path serves on /en and /sq. Idempotent: re-running overwrites the translation values only
 * (never touches the MK base). Run: `tsx apps/api/prisma/data/i18n-translations.ts`.
 *
 * Coverage: Setting copy (home + B2B + About, incl. list content), product taglines, the shared
 * "what the price includes" list, categories and B2B packages. NOT covered yet (renders MK on
 * /en /sq, to be filled from admin later): per-product technical specs, chips, filtration stages,
 * long descriptions and full blog article bodies (post titles/excerpts ARE translated in admin).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT = 1;

// ── Setting copy: [key]: { en, sq } (strings and arrays mirror the MK base shape) ──────────────
const SETTINGS: Record<string, { en: unknown; sq: unknown }> = {
  // Home hero
  'content.hero.h1': { en: 'Clean, alkaline water straight from your tap.', sq: 'Ujë i pastër, alkalik direkt nga rubineti juaj.' },
  'content.hero.h2': {
    en: 'Filtration systems with free installation and a 10-year warranty — across all of Macedonia.',
    sq: 'Sisteme filtrimi me instalim falas dhe garanci 10-vjeçare — në të gjithë Maqedoninë.',
  },
  'content.hero.cta': { en: 'Request a free consultation', sq: 'Kërko një konsultë falas' },
  'content.hero.badge': { en: 'Free installation across Macedonia', sq: 'Instalim falas në të gjithë Maqedoninë' },
  'content.hero.chips': {
    en: ['10-year warranty', 'Free installation', 'Delivery across Macedonia'],
    sq: ['Garanci 10-vjeçare', 'Instalim falas', 'Dërgesë në Maqedoni'],
  },
  'content.why.title': { en: 'Why filtered water?', sq: 'Pse ujë i filtruar?' },
  'content.why.items': {
    en: [
      { title: 'No chlorine or odor', text: 'Fresh water with no chlorine taste.' },
      { title: 'No limescale on appliances', text: 'Fewer breakdowns and costs.' },
      { title: 'Less plastic and cost', text: 'The end of gallons and bottles.' },
      { title: 'Alkaline and mineralized', text: 'pH 8.5+ with added minerals.' },
    ],
    sq: [
      { title: 'Pa klor dhe erë', text: 'Ujë i freskët pa shije klori.' },
      { title: 'Pa gur uji te pajisjet', text: 'Më pak defekte dhe kosto.' },
      { title: 'Më pak plastikë dhe kosto', text: 'Fundi i galonave dhe shisheve.' },
      { title: 'Alkalik dhe i mineralizuar', text: 'pH 8.5+ me minerale të shtuara.' },
    ],
  },
  'content.featured.title': { en: 'Most popular systems', sq: 'Sistemet më të kërkuara' },
  'content.stages.title': { en: 'How it works — 6 filtration stages', sq: 'Si funksionon — 6 faza filtrimi' },
  'content.stages.items': {
    en: [
      { name: 'Sediment filter (5 micron)', text: 'Holds back sand, rust and dust.' },
      { name: 'Granular activated carbon', text: 'Absorbs chlorine, odors and chemicals.' },
      { name: 'Carbon block', text: 'Further removes remaining chlorides.' },
      { name: 'RO membrane', text: 'Removes 95–99% of dissolved salts, bacteria, viruses.' },
      { name: 'Post-carbon (coconut)', text: 'Freshness and taste.' },
      { name: 'Alkalizer / mineralizer', text: 'Calcium, magnesium, pH 8.5+.' },
    ],
    sq: [
      { name: 'Filtër sedimenti (5 mikron)', text: 'Ndalon rërën, ndryshkun dhe pluhurin.' },
      { name: 'Karbon aktiv i granuluar', text: 'Thith klorin, erërat dhe kimikatet.' },
      { name: 'Bllok karboni', text: 'Pastron më tej kloruret e mbetura.' },
      { name: 'Membranë RO', text: 'Heq 95–99% të kripërave të tretura, baktereve, viruseve.' },
      { name: 'Post-karbon (kokos)', text: 'Freski dhe shije.' },
      { name: 'Alkalizues / mineralizues', text: 'Kalcium, magnez, pH 8.5+.' },
    ],
  },
  'content.testimonials.title': { en: 'What our customers say', sq: 'Çfarë thonë klientët tanë' },
  'content.articles.title': { en: 'Tips for clean water', sq: 'Këshilla për ujë të pastër' },
  'content.b2bTeaser.title': { en: 'Unlimited clean water for your team.', sq: 'Ujë i pastër i pakufizuar për ekipin tuaj.' },
  'content.b2bTeaser.bullets': {
    en: ['Hot & cold water dispenser', 'Free installation and service', 'Regular filter replacement', 'Fixed monthly fee — no investment'],
    sq: ['Aparat për ujë të ngrohtë dhe të ftohtë', 'Instalim dhe servis falas', 'Ndërrim i rregullt i filtrave', 'Tarifë mujore fikse — pa investim'],
  },
  'content.b2bTeaser.cta': { en: 'Request a business quote', sq: 'Kërko ofertë për biznes' },
  'content.advisor.title': { en: 'Not sure which system suits you?', sq: 'Nuk jeni i sigurt cili sistem ju përshtatet?' },
  'content.advisor.text': { en: 'Leave your phone — we’ll advise you for free.', sq: 'Lini telefonin — ju këshillojmë falas.' },
  'content.thankyou.title': { en: 'Thank you for your interest!', sq: 'Faleminderit për interesimin!' },
  'content.thankyou.text': {
    en: 'We received your request. We’ll contact you within one business day on the number you left.',
    sq: 'E morëm kërkesën tuaj. Do t’ju kontaktojmë brenda një dite pune në numrin që latë.',
  },

  // B2B page
  'b2b.problems': {
    en: ['Cost that grows with the team', 'Ordering and carrying', 'Storage space', 'Gallon hygiene', 'No hot water for coffee', 'Plastic and image'],
    sq: ['Kosto që rritet me ekipin', 'Porositë dhe bartja', 'Hapësira për ruajtje', 'Higjiena e galonave', 'Pa ujë të ngrohtë për kafe', 'Plastika dhe imazhi'],
  },
  'b2b.included': {
    en: ['Hot & cold water dispenser', 'Free installation', 'Regular filter replacement', 'Service and maintenance', 'Replacement on breakdown', 'No investment'],
    sq: ['Aparat për ujë të ngrohtë dhe të ftohtë', 'Instalim falas', 'Ndërrim i rregullt i filtrave', 'Servis dhe mirëmbajtje', 'Zëvendësim në rast defekti', 'Pa investim'],
  },
  'b2b.industries': {
    en: ['Offices', 'Cafés and restaurants', 'Clinics', 'Salons', 'Gyms', 'Hotels', 'Kindergartens and schools', 'Car showrooms', 'Shops', 'Pharmacies', 'Bakeries and pastry shops', 'Auto repair shops'],
    sq: ['Zyra', 'Kafene dhe restorante', 'Klinika', 'Sallone', 'Palestra', 'Hotele', 'Kopshte dhe shkolla', 'Autosallone', 'Dyqane', 'Farmaci', 'Furra dhe ëmbëltore', 'Autoservise'],
  },
  'b2b.heroLabel': { en: 'FOR BUSINESS', sq: 'PËR BIZNESE' },
  'b2b.heroH1': { en: 'Forget the gallons. Unlimited clean water for your team.', sq: 'Harroni galonat. Ujë i pastër i pakufizuar për ekipin tuaj.' },
  'b2b.heroSubhead': {
    en: 'Rent a dispenser from SPAR with everything included — installation, filters, service — for a fixed monthly fee.',
    sq: 'Merrni me qira një aparat nga SPAR me gjithçka të përfshirë — instalim, filtra, servis — për një tarifë mujore fikse.',
  },
  'b2b.heroCta': { en: 'Request a business quote', sq: 'Kërko ofertë për biznes' },
  'b2b.heroTrust': { en: 'Free assessment · No hidden costs · Fast installation', sq: 'Vlerësim falas · Pa kosto të fshehura · Instalim i shpejtë' },
  'b2b.logosTitle': { en: 'TRUSTED BY BUSINESSES ACROSS MACEDONIA', sq: 'U BESOJNË BIZNESET NË TË GJITHË MAQEDONINË' },
  'b2b.problemsTitle': { en: 'How much do the gallons really cost you?', sq: 'Sa ju kushtojnë vërtet galonat?' },
  'b2b.includedTitle': { en: 'One monthly fee. Everything included.', sq: 'Një tarifë mujore. Gjithçka e përfshirë.' },
  'b2b.calcTitle': { en: 'Calculate how much you save', sq: 'Llogaritni sa kurseni' },
  'b2b.stepsTitle': { en: 'How it works', sq: 'Si funksionon' },
  'b2b.packagesTitle': { en: 'Packages', sq: 'Paketat' },
  'b2b.industriesTitle': { en: 'For which businesses', sq: 'Për cilat biznese' },
  'b2b.comparisonTitle': { en: 'Gallons · Buying · Renting from SPAR', sq: 'Galona · Blerje · Qira nga SPAR' },
  'b2b.faqTitle': { en: 'Frequently asked questions', sq: 'Pyetjet e bëra shpesh' },
  'b2b.formTitle': { en: 'Request a business quote', sq: 'Kërko ofertë për biznes' },
  'b2b.formText': {
    en: 'Leave your company details — we’ll contact you with an exact quote, a free assessment and an installation appointment.',
    sq: 'Lini të dhënat e firmës suaj — do t’ju kontaktojmë me një ofertë të saktë, vlerësim falas dhe një termin instalimi.',
  },
  'b2b.steps': {
    en: [
      { title: 'Request a quote', desc: 'Two minutes — the form or a single phone call.' },
      { title: 'Free assessment and installation', desc: 'We come, assess and install at no cost to you.' },
      { title: 'Drink unlimited', desc: 'We take care of everything — filters, service, replacement.' },
    ],
    sq: [
      { title: 'Kërkoni një ofertë', desc: 'Dy minuta — formulari ose një telefonatë.' },
      { title: 'Vlerësim dhe instalim falas', desc: 'Vijmë, vlerësojmë dhe instalojmë pa kosto për ju.' },
      { title: 'Pini pa kufi', desc: 'Ne kujdesemi për gjithçka — filtra, servis, zëvendësim.' },
    ],
  },
  'b2b.comparison': {
    en: [
      { label: 'Monthly cost', gallons: 'Grows with the team', buy: 'None', rent: 'Fixed, predictable' },
      { label: 'Upfront investment', gallons: 'No', buy: 'High', rent: 'None' },
      { label: 'Ordering and carrying', gallons: 'Constant', buy: 'No', rent: 'No' },
      { label: 'Hot/cold water', gallons: 'No', buy: 'Depends', rent: 'Yes' },
      { label: 'Filter replacement and service', gallons: 'No', buy: 'Your responsibility', rent: 'Included' },
      { label: 'Replacement on breakdown', gallons: 'No', buy: 'Your responsibility', rent: 'Included' },
      { label: 'Contract term', gallons: 'No', buy: 'No', rent: '12 months [confirm]' },
    ],
    sq: [
      { label: 'Kosto mujore', gallons: 'Rritet me ekipin', buy: 'Asnjë', rent: 'Fikse, e parashikueshme' },
      { label: 'Investim fillestar', gallons: 'Jo', buy: 'I lartë', rent: 'Asnjë' },
      { label: 'Porositë dhe bartja', gallons: 'Vazhdimisht', buy: 'Jo', rent: 'Jo' },
      { label: 'Ujë i ngrohtë/i ftohtë', gallons: 'Jo', buy: 'Varet', rent: 'Po' },
      { label: 'Ndërrim filtrash dhe servis', gallons: 'Jo', buy: 'Përgjegjësia juaj', rent: 'I përfshirë' },
      { label: 'Zëvendësim në defekt', gallons: 'Jo', buy: 'Përgjegjësia juaj', rent: 'I përfshirë' },
      { label: 'Afati i kontratës', gallons: 'Jo', buy: 'Jo', rent: '12 muaj [konfirmo]' },
    ],
  },

  // About page
  'about.title': { en: 'Clean drinking water = a healthy future.', sq: 'Ujë i pastër për pije = e ardhme e shëndetshme.' },
  'about.intro': {
    en: 'SPAR Company sells and installs water filtration systems across all of Macedonia. We work with households and businesses — from a single under-sink system to whole-building filtration.',
    sq: 'SPAR Company shet dhe instalon sisteme filtrimi uji në të gjithë Maqedoninë. Punojmë me familje dhe biznese — nga një sistem nën lavaman deri te filtrimi për të gjithë objektin.',
  },
  'about.whyTitle': { en: 'Why SPAR', sq: 'Pse SPAR' },
  'about.whyText1': {
    en: 'Installation is free and done by our technicians. We replace the filters on-site, per the interval for each stage. Payment is in cash or in installments, with a ten-year warranty.',
    sq: 'Instalimi është falas dhe kryhet nga teknikët tanë. Filtrat i ndërrojmë ne, në terren, sipas intervalit për çdo fazë. Pagesa është me para në dorë ose me këste, me garanci dhjetëvjeçare.',
  },
  'about.whyText2': {
    en: 'Service is available across all of Macedonia — you are always covered, wherever you live or work.',
    sq: 'Shërbimi është i disponueshëm në të gjithë Maqedoninë — jeni gjithmonë të mbuluar, kudo që jetoni ose punoni.',
  },
};

// ── Product taglines (names are brand — kept as-is). slug → { en, sq } ─────────────────────────
const PRODUCT_TAGLINES: Record<string, { en: string; sq: string }> = {
  'spar-crystal-digital-600hf': { en: 'Latest-generation direct-flow system — no tank, no waiting.', sq: 'Sistem i gjeneratës së fundit me rrjedhje direkte — pa rezervuar, pa pritje.' },
  'spar-crystal-smart': { en: '6 purification stages with a digital display.', sq: '6 faza pastrimi me ekran dixhital.' },
  'spar-crystal-pro': { en: 'Compact under-sink reverse-osmosis system.', sq: 'Sistem kompakt me osmozë të kundërt nën lavaman.' },
  'spar-aqua-smart': { en: 'Smart control with a built-in display for water quality and filters.', sq: 'Kontroll inteligjent me ekran të integruar për cilësinë e ujit dhe filtrat.' },
  'aqua-glass': { en: '7 purification stages + 9 mineralization stages.', sq: '7 faza pastrimi + 9 faza mineralizimi.' },
  'spar-aqua-pro': { en: 'Reverse osmosis at an affordable price.', sq: 'Osmozë e kundërt me çmim të favorshëm.' },
  'spar-aqua-minerals': { en: 'Reverse osmosis with added minerals.', sq: 'Osmozë e kundërt me shtesë mineralesh.' },
  'dispenzer-topla-ladna-ro': { en: '5-stage filtration — cold to 5°C, hot to 90°C.', sq: 'Filtrim me 5 faza — e ftohtë deri në 5°C, e ngrohtë deri në 90°C.' },
  'sistem-cel-dom': { en: 'Filtered water at every tap in your home.', sq: 'Ujë i filtruar në çdo rubinet të shtëpisë.' },
  'big-blue-2-stepen': { en: 'Two-stage filtration for the whole home.', sq: 'Filtrim dyfazësh për të gjithë shtëpinë.' },
  'big-blue-3-stepen': { en: 'Three-stage filtration for the whole home.', sq: 'Filtrim trefazësh për të gjithë shtëpinë.' },
  'filter-protiv-bigor': { en: 'Protects boilers, appliances and heaters.', sq: 'Mbron bojlerët, pajisjet dhe kaldajat.' },
  'multifunkcionalna-slavina-hrom': { en: 'Elegant chrome faucet for filtered water.', sq: 'Rubinet elegant krom për ujë të filtruar.' },
  'ph-merac': { en: 'Measure your water’s acidity in seconds.', sq: 'Matni aciditetin e ujit për sekonda.' },
  'tds-merac': { en: 'Check the dissolved solids in your water.', sq: 'Kontrolloni lëndët e tretura në ujë.' },
  'aparat-elektroliza': { en: 'A visual demonstration of water quality.', sq: 'Demonstrim vizual i cilësisë së ujit.' },
  'mineralen-tus': { en: 'Softer water and skin with a mineral shower head.', sq: 'Ujë dhe lëkurë më të buta me dush mineral.' },
};

// Shared "what the price includes" list — applied to every product's i18n.includedInPrice.
const INCLUDED_I18N = {
  en: ['Delivery across Macedonia', 'Free installation by our technician', 'Usage training', '10-year warranty', 'Payment in cash or installments'],
  sq: ['Dërgesë në të gjithë Maqedoninë', 'Instalim falas nga teknik i yni', 'Trajnim për përdorim', 'Garanci 10-vjeçare', 'Pagesë me para në dorë ose me këste'],
};

const CATEGORIES: Record<string, { en: { name: string; description: string }; sq: { name: string; description: string } }> = {
  'pod-mijalnik': { en: { name: 'Under-sink', description: 'Reverse osmosis and mineralization' }, sq: { name: 'Nën lavaman', description: 'Osmozë e kundërt dhe mineralizim' } },
  dispenzeri: { en: { name: 'Dispensers', description: 'Hot and cold water for home and business' }, sq: { name: 'Dispenserë', description: 'Ujë i ngrohtë dhe i ftohtë për shtëpi dhe biznes' } },
  'cel-dom': { en: { name: 'Whole home', description: 'Filtration for the entire household (Big Blue)' }, sq: { name: 'Gjithë shtëpia', description: 'Filtrim për të gjithë shtëpinë (Big Blue)' } },
  'zastita-bigor': { en: { name: 'Anti-limescale', description: 'Protection for heaters and appliances' }, sq: { name: 'Mbrojtje nga guri i ujit', description: 'Mbrojtje për pajisjet ngrohëse' } },
  dodatoci: { en: { name: 'Accessories', description: 'Faucets, showers and accessories' }, sq: { name: 'Aksesorë', description: 'Rubineta, dushe dhe aksesorë' } },
  meraci: { en: { name: 'Meters', description: 'pH, TDS and electrolysis' }, sq: { name: 'Matës', description: 'pH, TDS dhe elektrolizë' } },
};

const PACKAGES: Record<string, { en: { name: string; description: string; includes: string[] }; sq: { name: string; description: string; includes: string[] } }> = {
  Старт: {
    en: { name: 'Start', description: 'For small teams and clinics.', includes: ['Hot/cold dispenser', 'Free installation', 'Filter replacement'] },
    sq: { name: 'Start', description: 'Për ekipe të vogla dhe klinika.', includes: ['Aparat i ngrohtë/i ftohtë', 'Instalim falas', 'Ndërrim i filtrave'] },
  },
  Бизнис: {
    en: { name: 'Business', description: 'For offices and cafés.', includes: ['Hot/cold dispenser', 'Free installation', 'Filter replacement', 'Service and maintenance'] },
    sq: { name: 'Biznes', description: 'Për zyra dhe kafene.', includes: ['Aparat i ngrohtë/i ftohtë', 'Instalim falas', 'Ndërrim i filtrave', 'Servis dhe mirëmbajtje'] },
  },
  Про: {
    en: { name: 'Pro', description: 'For larger teams and hotels.', includes: ['Multiple dispensers', 'Free installation', 'Filter replacement', 'Priority service', 'Replacement on breakdown'] },
    sq: { name: 'Pro', description: 'Për ekipe më të mëdha dhe hotele.', includes: ['Aparate të shumta', 'Instalim falas', 'Ndërrim i filtrave', 'Servis prioritar', 'Zëvendësim në rast defekti'] },
  },
};

async function main() {
  // 1) Settings: write `<key>.<locale>` rows.
  let s = 0;
  for (const [key, { en, sq }] of Object.entries(SETTINGS)) {
    for (const [lc, value] of [['en', en], ['sq', sq]] as const) {
      await prisma.setting.upsert({
        where: { tenantId_key: { tenantId: TENANT, key: `${key}.${lc}` } },
        update: { value: value as object },
        create: { tenantId: TENANT, key: `${key}.${lc}`, value: value as object },
      });
      s++;
    }
  }

  // 2) Products: tagline + shared includedInPrice overlay.
  let p = 0;
  for (const [slug, tl] of Object.entries(PRODUCT_TAGLINES)) {
    const existing = await prisma.product.findFirst({ where: { tenantId: TENANT, slug } });
    if (!existing) continue;
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        i18n: {
          en: { tagline: tl.en, includedInPrice: INCLUDED_I18N.en },
          sq: { tagline: tl.sq, includedInPrice: INCLUDED_I18N.sq },
        },
      },
    });
    p++;
  }

  // 3) Categories.
  let c = 0;
  for (const [slug, tr] of Object.entries(CATEGORIES)) {
    const cat = await prisma.productCategory.findFirst({ where: { tenantId: TENANT, slug } });
    if (!cat) continue;
    await prisma.productCategory.update({ where: { id: cat.id }, data: { i18n: tr } });
    c++;
  }

  // 4) B2B packages (matched by MK name).
  let k = 0;
  for (const [name, tr] of Object.entries(PACKAGES)) {
    const pkgs = await prisma.b2bPackage.findMany({ where: { tenantId: TENANT, name } });
    for (const pkg of pkgs) {
      await prisma.b2bPackage.update({ where: { id: pkg.id }, data: { i18n: tr } });
      k++;
    }
  }

  console.warn(`i18n translations applied — settings:${s} products:${p} categories:${c} packages:${k}`);
  await prisma.$disconnect();
}

void main();
