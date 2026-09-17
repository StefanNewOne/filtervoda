# Совети — содржина извлечена од стариот filtervoda.mk (`/sodrzina/`)

Оваа папка ги содржи **сите 42 едукативни/маркетинг статии** („Совети") од стариот
WordPress сајт filtervoda.mk, извлечени од живите страници на **2026-09-17**.

**Цел:** миграција во `Post` моделот (модул „Совети" во админот) + `301` редиректи од
легаси `/NNN/` URL-и кон новите `/soveti/<slug>` (усогласено со CLAUDE.md → „Redirects &
migration" и PRD Прилог Ѓ).

## Правила / забелешки

- Секој фајл = една статија, именуван `<legacyId>-<slug>.md`.
- Frontmatter носи: `title`, `slug`, `oldUrl` (легаси `/NNN/`), `category`, `excerpt`, `source`.
- Телото е **преземено вербатим** од стариот сајт (наслови, пасуси, листи, табели зачувани).
  Пред објава, содржината треба лекторски преглед — старите текстови имаат повремени
  печатни/OCR грешки и латинични пасажи (пр. „posebito", „descobите"), како и производи со
  наизменични имиња (Aqua Best / Aqua Glass / Aqua Minerals / Aqua Pro / Aqua Lux / Spar
  Mineral) кои треба да се усогласат со актуелниот каталог.
- Телефоните `076 676 819` и `070 755 190` се појавуваат во оригиналите; при миграција да се
  заменат со единствен CTA (lead-модал / клик-за-повик), не хардкодиран текст.
- Категориите се предлог за групирање; финалните `PostCategory` вредности ги одредува тимот.

## Категории (предлог)

| Категорија    | Опис                                                        |
| ------------- | ----------------------------------------------------------- |
| `educational` | Општа едукација за вода, филтрација, здравје (најголем дел) |
| `b2b`         | Наменети за фирми (вода на работно место, изнајмување)      |
| `product`     | Фокус на конкретен производ/бренд (Aqua Glass, Spar…)       |
| `news`        | Вести/настани (пр. саем Aquatech)                           |

## Мапа: легаси URL → нов slug → категорија

| # | Легаси URL | Slug (`/soveti/<slug>`) | Наслов | Кат. |
|---|-----------|--------------------------|--------|------|
| 1 | /860/ | kvalitetna-voda-imunitet | Квалитетна вода за пиење – Основа за силен имунитет | educational |
| 2 | /853/ | 5-ili-7-filtri | Филтрација на водата со 5 или 7 филтри? | educational |
| 3 | /789/ | reverzna-osmoza-zagaduvaci | Како реверзната осмоза ги отстранува опасните загадувачи | educational |
| 4 | /381/ | sto-e-tds-merac | Што е TDS мерач и како се мери квалитет на водата | educational |
| 5 | /378/ | voda-od-cesma-novorodence | Дали водата од чешма е безбедна за новороденче? | educational |
| 6 | /761/ | zdrava-voda-zdravi-vraboteni | Здрава вода = Здрави вработени | b2b |
| 7 | /747/ | cista-voda-na-rabota-5-vraboteni | Чиста вода на работа: компании со 5+ вработени | b2b |
| 8 | /736/ | flasirana-voda-izmama | Флаширана вода: Најголемата измама во историјата | educational |
| 9 | /411/ | kisela-i-alkalna-voda | Што Треба да Знаете за Кисела и Алкална Вода | educational |
| 10 | /721/ | 5-znaci-voda-problem | 5 знаци дека водата во твојот дом е проблем | educational |
| 11 | /714/ | 4-pricini-filter-investicija-2025 | 4 причини зошто филтер за вода е најдобрата инвестиција во 2025 | educational |
| 12 | /706/ | cista-voda-kluc-zdravje | Зошто чистата вода е клучот за вашето здравје? | educational |
| 13 | /700/ | spar-aquatech-amsterdam-2025 | Спар на Aquatech Amsterdam 2025 | news |
| 14 | /682/ | aqua-glass-aqua-best-sojuznici | Aqua Glass & Aqua Best – вашите сојузници за чиста вода | product |
| 15 | /675/ | flasirana-vs-filtrirana-troshoci | Флаширана vs. Филтрирана вода: Колку пари трошите | educational |
| 16 | /671/ | aqua-best-vrvna-tehnologija | Aqua Best: Врвна технологија за чиста и здрава вода | product |
| 17 | /654/ | oznaki-na-plastika-zdravje | Не ги игнорирајте овие симболи! Ознаките на пластиката | educational |
| 18 | /650/ | kako-da-izberete-filter | Како да изберете најдобар филтер за вода за вашиот дом? | educational |
| 19 | /636/ | kako-da-namalite-plastika | Како да го намалите користењето на пластика? | educational |
| 20 | /621/ | prochistuvanje-voda-vo-domot | Прочистување на вода во домот | educational |
| 21 | /616/ | dali-filtrirana-voda-bezbedna | Дали филтрираната вода е безбедна за пиење? | educational |
| 22 | /403/ | voda-od-bunar-bezbedna | Дали е водата од бунар безбедна за пиење? | educational |
| 23 | /606/ | sekoj-dom-cista-minerizirana-voda | Зошто секој дом заслужува чиста и минерализирана вода? | educational |
| 24 | /602/ | voda-bez-kompromisi-spar | Вода без компромиси – Како Spar го подигнува стандардот | product |
| 25 | /586/ | aqua-glass-vrven-sistem | Aqua Glass – Врвен систем за чиста вода | product |
| 26 | /575/ | filtrirana-voda-vkus-kafe-caj | Како филтрираната вода го подобрува вкусот на кафето и чајот? | educational |
| 27 | /567/ | filtriranje-voda-za-gotvenje | Зошто е важно да се филтрира водата за готвење? | educational |
| 28 | /557/ | domashen-test-kvalitet-voda | Како да направите домашен тест за квалитет на водата? | educational |
| 29 | /546/ | top-5-mitovi-filtracija | Топ 5 митови за филтрацијата на вода | educational |
| 30 | /537/ | zastedete-pari-energija-filtracija | Како да заштедите пари и енергија со домашна филтрација? | educational |
| 31 | /529/ | zosto-aqua-glass-najdobar-izbor | Зошто Aqua Glass е најдобриот избор за чиста вода? | product |
| 32 | /499/ | cista-voda-poznacajna-od-bilo-koga | Зошто чистата вода за пиење е поважна од било кога? | educational |
| 33 | /400/ | kako-voda-stanuva-kontaminirana | Како водата за пиење станува контаминирана? | educational |
| 34 | /397/ | fluor-vo-voda-za-pienje | Се што сте сакале да знаете за флуорот во водата за пиење? | educational |
| 35 | /375/ | dali-voda-od-cesma-bezbedna | Дали водата од чешма е безбедна за пиење? | educational |
| 36 | /372/ | hidracija-vo-zima | Зошто е важно да бидете хидрирани во зима? | educational |
| 37 | /362/ | 5-prasanja-reverzna-osmoza | 5 Битни прашања поврзани со реверзна осмоза | educational |
| 38 | /357/ | cista-voda-cist-zivot-aqua-pro | Чиста вода, чист живот: Напредни решенија за филтрирање | product |
| 39 | /296/ | voda-vo-plasticni-shishinja-shtetna | Вода во пластични шишиња, зошто е штетна? | educational |
| 40 | /293/ | 9-zabavni-fakti-za-voda | 9 Забавни Факти За Водата | educational |
| 41 | /269/ | top-10-pricini-spar-company | Топ 10 причини да изберете Spar Company | product |
| 42 | /219/ | skrieni-opasnosti-hlorirana-voda | Кои се скриените опасности од хлорирана вода? | educational |

## Следни чекори (предлог)

1. Лекторски преглед на секој текст (граматика, латинични пасажи, дупликат-содржина).
2. Усогласување на имињата на производите со актуелниот каталог (seed/PRD Прилог А).
3. Seed/import во `Post` (модул „Совети") со `status=PUBLISHED` и оригиналниот датум онаму
   каде што е познат.
4. Внес на 42-те `301` редиректи (`/NNN/` → `/soveti/<slug>`) во redirect-мапата (како
   производите во `apps/api/prisma/seed.ts`).
