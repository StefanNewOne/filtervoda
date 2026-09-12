/**
 * One-off: ensure the editable content settings exist (seeded with the storefront defaults) so
 * the admin „Страници и копи" / „За фирми" show real text. create-if-absent — never overwrites a
 * value the client already edited. Run inside the api container: npx tsx prisma/set-content-defaults.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT = 1;

const defaults: Record<string, unknown> = {
  'content.hero.h1': 'Чиста, алкална вода директно од вашата чешма.',
  'content.hero.h2': 'Системи за филтрација со бесплатна монтажа и 10 години гаранција — низ цела Македонија.',
  'content.hero.cta': 'Побарај бесплатна консултација',
  'content.hero.badge': 'Бесплатна монтажа низ цела Македонија',
  'content.hero.chips': ['10 години гаранција', 'Бесплатна монтажа', 'Достава низ Македонија'],
  'content.why.title': 'Зошто филтрирана вода?',
  'content.why.items': [
    { title: 'Без хлор и мирис', text: 'Свежа вода без вкус на хлор.' },
    { title: 'Без бигор на апаратите', text: 'Помалку кварови и трошок.' },
    { title: 'Помалку пластика и трошок', text: 'Крај на галоните и шишињата.' },
    { title: 'Алкална и минерализирана', text: 'pH 8.5+ со додадени минерали.' },
  ],
  'content.featured.title': 'Најбарани системи',
  'content.stages.title': 'Како функционира — 6 степени на филтрација',
  'content.stages.items': [
    { name: 'Седимент филтер (5 микрони)', text: 'Ги задржува песокот, ’рѓата и прашината.' },
    { name: 'Гранулиран активен јаглен', text: 'Апсорбира хлор, мириси и хемикалии.' },
    { name: 'Карбон блок', text: 'Дополнително ги чисти преостанатите хлориди.' },
    { name: 'RO мембрана', text: 'Отстранува 95–99% растворени соли, бактерии, вируси.' },
    { name: 'Пост-карбон (кокосов)', text: 'Свежина и вкус.' },
    { name: 'Алкализатор / минерализатор', text: 'Калциум, магнезиум, pH 8.5+.' },
  ],
  'content.testimonials.title': 'Што велат нашите клиенти',
  'content.articles.title': 'Совети за чиста вода',
  'content.b2bTeaser.title': 'Неограничена чиста вода за вашиот тим.',
  'content.b2bTeaser.bullets': ['Апарат за топла и ладна вода', 'Бесплатна монтажа и сервис', 'Редовна замена на филтри', 'Фиксен месечен износ — без инвестиција'],
  'content.b2bTeaser.cta': 'Побарај понуда за фирма',
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

async function main() {
  let created = 0;
  for (const [key, value] of Object.entries(defaults)) {
    const res = await prisma.setting.upsert({
      where: { tenantId_key: { tenantId: TENANT, key } },
      update: {}, // keep any value the client already set
      create: { tenantId: TENANT, key, value: value as object },
    });
    if (res) created++;
  }
  console.warn(`content defaults ensured (${Object.keys(defaults).length} keys)`);
  await prisma.$disconnect();
}

void main();
