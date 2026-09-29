/**
 * FV-001 M2 — EN+SQ translations for GLOBAL FAQ (Често поставувани прашања). Matches each FAQ by
 * its MK question and sets faq.i18n = { en:{question,answer}, sq:{...} }. Idempotent.
 * Run: `tsx apps/api/prisma/data/i18n-faq.ts`.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT = 1;

type Tr = { question: string; answer: string };
const FAQS: { mk: string; en: Tr; sq: Tr }[] = [
  {
    mk: 'Колку често треба да се менуваат филтрите за прочистување на вода?',
    en: {
      question: 'How often should the water-purification filters be replaced?',
      answer:
        'It depends on the condition and quality of the water from the mains supply. In all cases, we recommend replacing the filters once a year to maintain ideal water quality.',
    },
    sq: {
      question: 'Sa shpesh duhet të ndërrohen filtrat për pastrimin e ujit?',
      answer:
        'Kjo varet nga gjendja dhe cilësia e ujit nga rrjeti kryesor. Në çdo rast, rekomandohet që filtrat të ndërrohen një herë në vit për të ruajtur cilësinë ideale të ujit.',
    },
  },
  {
    mk: 'Не користам многу вода. Дали тоа го менува работниот век на филтерот?',
    en: {
      question: "I don't use much water. Does that change the filter's lifespan?",
      answer:
        'No. The replacement intervals do not change. While water is being filtered, living organisms (microorganisms, bacteria) can occupy space in the filter, so the replacement period begins as soon as the filter comes into contact with water.',
    },
    sq: {
      question: 'Nuk përdor shumë ujë. A e ndryshon kjo jetëgjatësinë e filtrit?',
      answer:
        'Jo. Afatet e ndërrimit nuk ndryshojnë. Ndërsa uji filtrohet, organizmat e gjallë (mikroorganizmat, bakteret) mund të zënë vend në filtër, prandaj periudha e ndërrimit fillon sapo filtri bie në kontakt me ujin.',
    },
  },
  {
    mk: 'Штотуку ги инсталирав филтрите и водата ми е заматена. Дали е тоа нормално?',
    en: {
      question: "I've just installed the filters and my water is cloudy. Is that normal?",
      answer:
        'After installing new filters, you need to let the water run a few times. Because carbon filters are made of natural materials, black, cloudy water may appear at first. About 20–30 liters of water should flow through the new filters before use. Wait 1–2 hours for the system to fill, then leave the tap open for 10–15 minutes until the tank empties (repeat the procedure 3 to 5 times). Wait for the tap water to run until it becomes completely clear.',
    },
    sq: {
      question: 'Sapo i instalova filtrat dhe uji im është i turbullt. A është kjo normale?',
      answer:
        'Pas instalimit të filtrave të rinj, duhet ta lini ujin të rrjedhë disa herë. Meqë filtrat me karbon janë prej materialesh natyrore, në fillim mund të shfaqet ujë i zi dhe i turbullt. Rreth 20–30 litra ujë duhet të kalojnë nëpër filtrat e rinj para përdorimit. Prisni 1–2 orë që sistemi të mbushet, pastaj lëreni rubinetin të hapur 10–15 minuta derisa rezervuari të zbrazet (përsëriteni procedurën 3 deri në 5 herë). Prisni që uji nga rubineti të rrjedhë derisa të bëhet plotësisht i kthjellët.',
    },
  },
  {
    mk: 'Можам ли сам да го инсталирам производот и да ги менувам филтрите?',
    en: {
      question: 'Can I install the product and replace the filters myself?',
      answer:
        'Yes. The product can be installed and the filters replaced on your own. However, any intervention by an unauthorized service will void the warranty. If servicing is done by an authorized service, the device stays under warranty and is used safely.',
    },
    sq: {
      question: 'A mund ta instaloj vetë produktin dhe të ndërroj filtrat?',
      answer:
        'Po. Produkti mund të instalohet dhe filtrat mund të ndërrohen vetë. Megjithatë, çdo ndërhyrje nga një servis i paautorizuar do të shkaktojë humbjen e garancisë. Nëse servisimi kryhet nga një servis i autorizuar, pajisja mbetet nën garanci dhe përdoret në mënyrë të sigurt.',
    },
  },
];

async function main() {
  let applied = 0;
  const missing: string[] = [];
  for (const f of FAQS) {
    const rows = await prisma.faq.findMany({ where: { tenantId: TENANT, question: f.mk } });
    if (!rows.length) {
      missing.push(f.mk.slice(0, 40));
      continue;
    }
    for (const row of rows) {
      await prisma.faq.update({ where: { id: row.id }, data: { i18n: { en: f.en, sq: f.sq } } });
      applied++;
    }
  }
  console.warn(`FAQ i18n applied — ${applied} row(s)${missing.length ? `; no match for: ${missing.join(' | ')}` : ''}`);
  await prisma.$disconnect();
}

void main();
