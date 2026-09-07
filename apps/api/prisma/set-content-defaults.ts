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
