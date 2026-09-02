/* help-layer.js — prototype-only explanation layer.
   Not part of the production design. Delete this file and the
   <help-layer> tag to ship.

   Usage: load in <helmet>, then place <help-layer></help-layer> as the
   last element of the template. Optional attributes:
     offset="96"   lift the toggle above a sticky bottom bar (px)
     accent="#A32F4E"  accent colour for dots and titles
     tone="light|dark" tooltip surface, for dark designs

   Mark anything explainable with data-help="key" (see HELP below).
   Add data-help-tour="1..n" to put an element in the guided tour. */

(function () {
  if (window.__helpLayerLoaded) return;
  window.__helpLayerLoaded = true;

  var KEY = 'fv_help_v1';

  var HELP = {
    'lang': { mk: ['Јазик на објаснувањата', 'Ги менува само овие објаснувања. Не го менува текстот на сајтот.'],
              en: ['Explanation language', 'Switches these notes only. It does not change the site copy.'] },

    /* ---------- сајт ---------- */
    'site.logo': { mk: ['Логото води на почетна', 'Каде и да е посетителот, кликот на логото го враќа на почетната страница.'],
                   en: ['The logo goes home', 'Wherever the visitor is, clicking the logo returns them to the home page.'] },
    'site.nav': { mk: ['Главно мени', 'Пет ставки: Производи, За фирми, Совети, За нас, Контакт. На телефон се спушта во копчето за мени.'],
                  en: ['Main menu', 'Five items: Products, For business, Advice, About, Contact. On a phone it collapses into the menu button.'] },
    'site.phone': { mk: ['Телефон во хедерот', 'Дел од посетителите не пополнуваат форма — сакаат да се јават. Кликот директно отвора повик.'],
                    en: ['Phone in the header', 'Some visitors will not fill a form — they want to call. Tapping starts the call directly.'] },
    'site.headerCta': { mk: ['Копче за барање', 'Отвора форма во modal. Стои во хедерот за да е достапно од секоја страница, не само од почетната.'],
                        en: ['Request button', 'Opens the form in a modal. It sits in the header so it is reachable from every page, not just home.'] },
    'site.heroCta': { mk: ['Главното копче на страницата', 'Единственото primary копче тука. Отвора формата за бесплатна консултација — тоа е единствената конверзија на сајтот.'],
                      en: ['The page’s primary button', 'The only primary button here. It opens the free-consultation form — the site’s single conversion.'] },
    'site.heroSecondary': { mk: ['Второто копче', 'Води во каталогот. Намерно е secondary — за да не се натпреварува со главното копче за поглед.'],
                            en: ['The second button', 'Goes to the catalogue. Deliberately secondary so it does not compete with the primary for attention.'] },
    'site.trust': { mk: ['Trust лента', 'Четири работи што ја отстрануваат сомнежот: гаранција, бесплатна монтажа, достава, плаќање. Се уредуваат од админ.'],
                    en: ['Trust band', 'Four things that remove doubt: warranty, free installation, delivery, payment. Editable from the admin panel.'] },
    'site.productCard': { mk: ['Картичка за производ', 'Кликот води на страницата на производот. Сликата е во „contain“, не во „cover“ — апаратите не смеат да се сечат.'],
                          en: ['Product card', 'Clicking opens the product page. The image uses “contain”, not “cover” — the units must not be cropped.'] },
    'site.filters': { mk: ['Филтри во каталогот', 'По категорија и по публика (за дом / за фирми). Изборот влегува во адресата, за да може линкот да се сподели.'],
                      en: ['Catalogue filters', 'By category and by audience (home / business). The choice goes into the URL so the link can be shared.'] },
    'site.gallery': { mk: ['Галерија на производот', 'Првата слика е чистата продуктна фотографија. Останатите се рекламните креативи — се гледаат цели, не кроп.'],
                      en: ['Product gallery', 'The first image is the clean product shot. The rest are ad creatives — shown whole, never cropped.'] },
    'site.stages': { mk: ['Степени на филтрација', 'Секој степен со име и што отстранува. Ова е делот што најмногу убедува технички настроен купувач.'],
                     en: ['Filtration stages', 'Each stage with its name and what it removes. This is the part that convinces a technically minded buyer.'] },
    'site.spec': { mk: ['Техничка спецификација', 'Групирана табела. Сè означено со [потврди] чека вистински податок од производителот — не се измислува.'],
                   en: ['Technical specification', 'A grouped table. Everything marked [потврди] awaits real data from the manufacturer — nothing is invented.'] },
    'site.compare': { mk: ['Споредба со слични модели', 'Се крие сама кога категоријата има само еден производ — за да нема празна секција.'],
                      en: ['Comparison with similar models', 'Hides itself when the category holds only one product — so there is no empty section.'] },
    'site.faq': { mk: ['Често поставувани прашања', 'Одговара на тоа што инаку би влезло како телефонски повик. Секое прашање помалку е една обврска помалку.'],
                  en: ['FAQ', 'Answers what would otherwise arrive as a phone call. Every question answered is one obligation less.'] },
    'site.related': { mk: ['Слични производи', 'Ако сопствената категорија нема доволно, се полни од другите — секцијата никогаш не останува полупразна.'],
                      en: ['Similar products', 'If the category has too few, it fills from others — the section never sits half-empty.'] },
    'site.sticky': { mk: ['Лепливa лента долу (телефон)', 'Повикај · Viber · Барање. Се појавува по 30% скрол и се крие над 900px ширина. На долга страница ова носи најмногу барања.'],
                     en: ['Sticky bottom bar (mobile)', 'Call · Viber · Request. Appears after 30% scroll and hides above 900px. On a long page this drives the most requests.'] },
    'site.form': { mk: ['Форма за барање', 'Кратка намерно. Телефонот е единственото навистина обврзно поле — секое дополнително поле спушта број на барања.'],
                   en: ['Request form', 'Deliberately short. The phone is the only truly required field — every extra field lowers the number of requests.'] },
    'site.consent': { mk: ['Согласност за податоците', 'Чекбокс што посетителот сам го штрика, никогаш претходно означен. Услов и по македонскиот закон и по GDPR.'],
                      en: ['Data consent', 'A checkbox the visitor ticks themselves, never pre-checked. Required by Macedonian law and by GDPR.'] },
    'site.submit': { mk: ['Испраќање', 'Оди на „Благодариме“ со чист URL — таму се пали generate_lead, единствената конверзија за оптимизација на рекламите.'],
                     en: ['Submit', 'Goes to “Thank you” with a clean URL — that is where generate_lead fires, the single conversion ads optimise for.'] },
    'site.calc': { mk: ['Калкулатор за заштеда', 'Влез: број вработени и моментално решение. Сите параметри доаѓаат од админ — ништо не е впишано во код.'],
                   en: ['Savings calculator', 'Inputs: headcount and current solution. All parameters come from the admin panel — nothing is hard-coded.'] },
    'site.calcOut': { mk: ['Резултат од пресметката', 'Сегашен трошок, наш пакет, заштеда. Задолжително стои ознака дека пресметката е ориентациона.'],
                      en: ['Calculation result', 'Current cost, our package, savings. A note that the estimate is indicative is mandatory.'] },
    'site.packages': { mk: ['Пакети за фирми', 'Три, средната истакната. Цените се [потврди] додека клиентот не ги даде — не се погодуваат.'],
                       en: ['Business packages', 'Three, the middle one highlighted. Prices are [потврди] until the client provides them — never guessed.'] },
    'site.cookie': { mk: ['Банер за колачиња', 'Додека посетителот не избере, Meta Pixel и GA4 не се вчитуваат. Изборот е вистински, не украс.'],
                     en: ['Cookie banner', 'Until the visitor chooses, Meta Pixel and GA4 do not load. The choice is real, not decoration.'] },

    /* ---------- админ ---------- */
    'adm.login': { mk: ['Најава', 'Секој корисник има своја сметка. По 3 неуспешни обиди сметката се заклучува прогресивно до 15 минути. Демо лозинка: spar2026.'],
                   en: ['Sign in', 'Every user has their own account. After 3 failed attempts the account locks progressively up to 15 minutes. Demo password: spar2026.'] },
    'adm.nav': { mk: ['Модули на панелот', '19 модула групирани по боја: продажба, содржина, B2B, изглед, мерење, систем. Бројот покажува колку записи има внатре.'],
                 en: ['Panel modules', '19 modules grouped by colour: sales, content, B2B, appearance, measurement, system. The badge counts records inside.'] },
    'adm.save': { mk: ['Зачувај промени', 'Ништо не оди на сајтот автоматски. Промената е чернова додека не се притисне тука.'],
                  en: ['Save changes', 'Nothing reaches the site automatically. A change is a draft until this is pressed.'] },
    'adm.theme': { mk: ['Активен темплејт', 'Кој од трите дизајни го гледа посетителот сега. Се менува во модулот „Дизајн и темплејти“ — без нов deploy.'],
                   en: ['Active template', 'Which of the three designs visitors see right now. Changed in “Design and templates” — no new deploy.'] },
    'adm.kpi': { mk: ['Бројки за преглед', 'Четири мерки за наутро: денес, 7 дена, 30 дена и конверзија од сесија во барање.'],
                 en: ['Numbers at a glance', 'Four measures for the morning: today, 7 days, 30 days, and session-to-lead conversion.'] },
    'adm.outboxCard': { mk: ['Состојба на испораката', 'Барањето е зачувано независно од испораката. Ако Meta CAPI падне, lead-от не се губи — само задачата се повторува.'],
                        en: ['Delivery status', 'The lead is stored independently of delivery. If Meta CAPI fails the lead is not lost — only the job retries.'] },
    'adm.leads.search': { mk: ['Пребарување', 'По име, телефон или фирма. Најчестата работа наутро.'],
                          en: ['Search', 'By name, phone or company. The most common morning task.'] },
    'adm.leads.filter': { mk: ['Филтри', 'По тип (B2C / B2B) и по статус. „Нов“ покажува што чека прв повик денес.'],
                          en: ['Filters', 'By type (B2C / B2B) and by status. “New” shows what awaits a first call today.'] },
    'adm.leads.csv': { mk: ['Извези CSV', 'Ги симнува само тековно филтрираните барања, со UTF-8 BOM за да Excel ја чита кирилицата правилно.'],
                       en: ['Export CSV', 'Downloads only the currently filtered leads, with a UTF-8 BOM so Excel reads Cyrillic correctly.'] },
    'adm.leads.states': { mk: ['Состојби на екранот', 'Прекинувач само за преглед — покажува како изгледа екранот при вчитување, кога нема резултати и кога серверот падне.'],
                          en: ['Screen states', 'A review-only switch — shows the screen while loading, with no results, and when the server fails.'] },
    'adm.leads.row': { mk: ['Ред со барање', 'Сè што е потребно за повик се гледа без отворање. Кликот отвора детал.'],
                       en: ['Lead row', 'Everything needed for the call is visible without opening. Clicking opens the detail.'] },
    'adm.lead.status': { mk: ['Статус на барањето', 'Нов → Контактиран → Понуда → Договорено → Монтирано, плус Изгубено и Спам. „Изгубено“ бара причина — оттука се учи зошто не се продава.'],
                         en: ['Lead status', 'New → Contacted → Quoted → Agreed → Installed, plus Lost and Spam. “Lost” asks for a reason — that is how you learn why deals fail.'] },
    'adm.lead.timeline': { mk: ['Временска линија', 'Што се случило и кога: креиран, email, Meta CAPI, автоматски одговор, промени на статус. Не се пишува рачно.'],
                           en: ['Timeline', 'What happened and when: created, email, Meta CAPI, autoreply, status changes. Not written by hand.'] },
    'adm.lead.note': { mk: ['Белешки', 'Не се гледаат од купувачот. Тука се пишува „не одговара, да пробаме попладне“ — за да знае следниот што ќе го земе повикот.'],
                       en: ['Notes', 'Not visible to the customer. This is where “no answer, try in the afternoon” goes — so the next person knows.'] },
    'adm.lead.anon': { mk: ['Анонимизирај', 'Барањето никогаш не се брише — само личните податоци се отстрануваат. Бара повторно внесување лозинка.'],
                       en: ['Anonymise', 'A lead is never deleted — only the personal data is removed. Requires re-entering the password.'] },
    'adm.prod.row': { mk: ['Производ во листа', 'Слика, име, slug, категорија, цена, статус. Промената на slug автоматски прави 301 редирекција од стариот.'],
                      en: ['Product row', 'Image, name, slug, category, price, status. Changing a slug automatically creates a 301 from the old one.'] },
    'adm.prod.tabs': { mk: ['Табови на уредувачот', 'Девет: основно, галерија, придобивки, степени, спецификација, цена, ЧПП, поврзани, SEO. Секое поле овде се менува и се впишува.'],
                       en: ['Editor tabs', 'Nine: basics, gallery, benefits, stages, spec, price, FAQ, related, SEO. Every field here is editable and typed into.'] },
    'adm.prod.publish': { mk: ['Објави', 'Го пушта производот на сајтот и го инвалидира кешот. „Врати во нацрт“ го крие — страницата враќа 404 за јавност.'],
                          en: ['Publish', 'Pushes the product live and invalidates the cache. “Back to draft” hides it — the page returns 404 publicly.'] },
    'adm.content.tabs': { mk: ['Која страница се уредува', 'Почетна, Каталог, Производ, За фирми, Благодариме, Правни, 404. Секој текст на сајтот е тука.'],
                          en: ['Which page you are editing', 'Home, Catalogue, Product, For business, Thank you, Legal, 404. Every text on the site is here.'] },
    'adm.content.preview': { mk: ['Жив преглед', 'Се менува додека клиентот пишува, во активниот темплејт. Нема потреба да се отвора сајтот за да се види резултатот.'],
                             en: ['Live preview', 'Updates as the client types, in the active template. No need to open the site to see the result.'] },
    'adm.design.card': { mk: ['Дизајн темплејт', 'Еден од трите готови дизајни. „Примени на сајтот“ го менува изгледот веднаш за секој посетител, без deploy.'],
                         en: ['Design template', 'One of the three finished designs. “Apply to site” changes the look at once for every visitor, with no deploy.'] },
    'adm.design.tokens': { mk: ['Tokens на темплејтот', 'CTA боја, ink, акцент, радиус, фонтови. Ниедна вредност не е впишана во код — сè се чита од тука.'],
                           en: ['Template tokens', 'CTA colour, ink, accent, radius, fonts. No value is hard-coded — everything is read from here.'] },
    'adm.design.contrast': { mk: ['Проверка на контраст', 'Пресметува во живо дали бојата поминува WCAG AA (4.5:1). Ако падне под тоа, зачувувањето се блокира — за да не се расипе читливоста.'],
                             en: ['Contrast check', 'Computes live whether the colour passes WCAG AA (4.5:1). Below that, saving is blocked — so readability is not broken.'] },
    'adm.track.ids': { mk: ['ID-а за пратење', 'GTM, GA4, Meta Pixel, CAPI токен, Turnstile. Промената не бара deploy. CAPI токенот е маскиран и никогаш не се враќа во одговор.'],
                       en: ['Tracking IDs', 'GTM, GA4, Meta Pixel, CAPI token, Turnstile. Changing them needs no deploy. The CAPI token is masked and never returned in a response.'] },
    'adm.track.consent': { mk: ['Consent Mode v2', 'Четирите сигнали стојат на „denied“ по default. Pixel и GA4 не се вчитуваат пред посетителот да прифати.'],
                           en: ['Consent Mode v2', 'All four signals default to “denied”. Pixel and GA4 do not load before the visitor accepts.'] },
    'adm.track.conn': { mk: ['Статус на врските', 'Проверува формат на секој ID (GTM-, G-, 10+ цифри). Црвено значи дека рекламата мери погрешно или воопшто не мери.'],
                        en: ['Connection status', 'Validates each ID’s format (GTM-, G-, 10+ digits). Red means ads are measuring wrong, or not at all.'] },
    'adm.track.events': { mk: ['План на настани', 'Кој настан кога се пали. generate_lead се праќа двојно — browser Pixel и server CAPI — со ист event_id за де-дупликација.'],
                          en: ['Event plan', 'Which event fires when. generate_lead is sent twice — browser Pixel and server CAPI — with the same event_id for de-duplication.'] },
    'adm.panel': { mk: ['Модул на панелот', 'Секоја група покажува што содржи и што се менува. Полињата за впишување се во модулите со табови.'],
                   en: ['Panel module', 'Each group shows what it holds and what changes. Editable fields live in the tabbed modules.'] }
  };

  var TOURS = {
    site: [
      { r: 'home', k: 'site.nav' },
      { r: 'home', k: 'site.heroCta' },
      { r: 'home', k: 'site.trust' },
      { r: 'home', k: 'site.productCard' },
      { r: 'catalog', k: 'site.filters' },
      { r: 'product', k: 'site.gallery' },
      { r: 'product', k: 'site.stages' },
      { r: 'product', k: 'site.spec' },
      { r: 'product', k: 'site.faq' },
      { r: 'b2b', k: 'site.calc' },
      { r: 'b2b', k: 'site.packages' },
      { r: 'b2b', k: 'site.form' },
      { r: 'b2b', k: 'site.consent' },
      { r: 'admin', k: 'adm.nav' }
    ],
    admin: [
      { r: 'dash', k: 'adm.nav' },
      { r: 'dash', k: 'adm.kpi' },
      { r: 'dash', k: 'adm.outboxCard' },
      { r: 'leads', k: 'adm.leads.filter' },
      { r: 'leads', k: 'adm.leads.states' },
      { r: 'leads', k: 'adm.leads.row' },
      { r: 'products', k: 'adm.prod.row' },
      { r: 'content', k: 'adm.content.preview' },
      { r: 'design', k: 'adm.design.card' },
      { r: 'design', k: 'adm.design.contrast' },
      { r: 'tracking', k: 'adm.track.ids' },
      { r: 'tracking', k: 'adm.track.consent' },
      { r: 'tracking', k: 'adm.track.events' },
      { r: 'dash', k: 'adm.save' }
    ]
  };

  var UI = {
    mk: { on: 'Објасни ми', off: 'Објасни ми', tour: 'Води ме по ред', next: 'Следно', prev: 'Претходно', done: 'Готово',
          step: 'Чекор', of: 'од', close: 'Затвори', hint: 'Помини со маус или допри елемент со точка.',
          note: 'Слој само за преглед. Не е дел од дизајнот што се програмира.' },
    en: { on: 'Explain', off: 'Explain', tour: 'Walk me through', next: 'Next', prev: 'Back', done: 'Done',
          step: 'Step', of: 'of', close: 'Close', hint: 'Hover or tap any element with a dot.',
          note: 'A review-only layer. Not part of the design to be built.' }
  };


  /* Review-only: the layer finds its own anchors by visible text, so the
     design files carry no markup for it beyond the <help-layer> tag. */
  var TAGS = [
    ['site.logo',        'a,div',           /^filtervoda\.mk$/],
    ['site.nav',         'nav,div',         null, 'navRow'],
    ['site.phone',       'a',               /^076\/676\/819$/],
    ['site.headerCta',   'button',          /^Барање$|^Побарај понуда$/],
    ['site.heroCta',     'button',          /^Побарај бесплатна консултација$/],
    ['site.heroSecondary','button',         /^Види ги производите$/],
    ['site.filters',     'div',             null, 'filterRow'],
    ['site.spec',        'h2',              /^Техничка спецификација$/],
    ['site.compare',     'h2',              /^Споредба со слични модели$/],
    ['site.faq',         'h2',              /^Често поставувани прашања$/],
    ['site.related',     'h2',              /^Слични производи$/],
    ['site.stages',      'h2',              /степени на филтрација/i],
    ['site.packages',    'h2',              /^Пакети/],
    ['site.calc',        'h2',              /Пресметајте колку заштедувате|калкулатор/i],
    ['site.consent',     'button',          /^Се согласувам SPAR Company/],
    ['site.submit',      'button',          /^Испрати барање$|^Побарај понуда$|^Добиј точна понуда$/],
    ['site.cookie',      'button',          /^Прифати сè$/],
    ['adm.save',         'button',          /^Зачувај промени$/],
    ['adm.theme',        'div',             /^Активен темплејт$/],
    ['adm.leads.csv',    'button',          /^Извези CSV$/],
    ['adm.design.contrast','div,strong',    /поминува AA|под AA/],
    ['adm.prod.publish', 'button',          /^Објави$/],
    ['adm.login',        'h2',              /^Најава$/],
    ['adm.lead.anon',    'button',          /^Анонимизирај$/]
  ];

  function txt(n) { return (n.textContent || '').trim().replace(/\s+/g, ' '); }

  function autotag() {
    for (var i = 0; i < TAGS.length; i++) {
      var key = TAGS[i][0], sel = TAGS[i][1], re = TAGS[i][2], special = TAGS[i][3];
      if (document.querySelector('[data-help="' + key + '"]')) continue;
      if (special === 'navRow') {
        var btns = document.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          if (/^Производи$/.test(txt(btns[j])) && btns[j].parentElement) { btns[j].parentElement.setAttribute('data-help', key); break; }
        }
        continue;
      }
      if (special === 'filterRow') {
        var fb = document.querySelectorAll('button');
        for (var m = 0; m < fb.length; m++) {
          if (/^Сите$/.test(txt(fb[m])) && fb[m].parentElement) { fb[m].parentElement.setAttribute('data-help', key); break; }
        }
        continue;
      }
      var nodes = document.querySelectorAll(sel);
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        if (n.hasAttribute('data-help')) continue;
        if (n.closest('[data-help-ui]')) continue;
        if (re && re.test(txt(n))) { n.setAttribute('data-help', key); break; }
      }
    }
    /* Trust band and gallery have no markup hook — find them by content. */
    if (!document.querySelector('[data-help="site.trust"]')) {
      var cand = document.querySelectorAll('section > div, section');
      var best = null;
      for (var t = 0; t < cand.length; t++) {
        var s2 = txt(cand[t]);
        if (s2.length < 400 && /10 години гаранција/.test(s2) && /Бесплатна монтажа/.test(s2) && /Достава/.test(s2)) {
          if (!best || s2.length < txt(best).length) best = cand[t];
        }
      }
      if (best) best.setAttribute('data-help', 'site.trust');
    }
    if (!document.querySelector('[data-help="site.gallery"]')) {
      var thumbs = document.querySelectorAll('button[style*="aspect-ratio"]');
      if (thumbs.length > 1 && thumbs[0].parentElement) {
        var g = thumbs[0].parentElement.parentElement || thumbs[0].parentElement;
        g.setAttribute('data-help', 'site.gallery');
      }
    }

    /* Repeating groups: first instance only, so the page is not covered in dots. */
    var reps = [
      ['site.productCard', 'main article, section article'],
      ['site.sticky', '[data-sticky-bar]'],
      ['adm.nav', '[data-admin-shell] > aside'],
      ['adm.leads.filter', '[data-admin-shell] input'],
      ['site.form', 'form'],
      ['adm.leads.row', '[data-admin-shell] tbody tr'],
      ['adm.panel', '[data-admin-shell] main > div > div > div']
    ];
    for (var p = 0; p < reps.length; p++) {
      if (document.querySelector('[data-help="' + reps[p][0] + '"]')) continue;
      var el = document.querySelector(reps[p][1]);
      if (el && !el.hasAttribute('data-help')) el.setAttribute('data-help', reps[p][0]);
    }
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  class HelpLayer extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;

      var saved = read();
      this._lang = (saved.lang === 'en' || saved.lang === 'mk') ? saved.lang : 'mk';
      this.on = saved.seen ? !!saved.on : true;
      this.accent = this.getAttribute('accent') || '#1156E0';
      this.tone = this.getAttribute('tone') || 'light';
      this.offset = parseInt(this.getAttribute('offset') || '16', 10);
      this.tourAt = -1;

      this.style.cssText = 'position:static;display:block';
      this._make();
      this._bind();
      this._apply();
      this._lift();
      if (!saved.seen) write({ on: true, seen: true, lang: this._lang });
    }

    disconnectedCallback() {
      this._built = false;
      if (this._mo) this._mo.disconnect();
      window.removeEventListener('scroll', this._sync, true);
      window.removeEventListener('resize', this._sync);
      document.removeEventListener('mouseover', this._over, true);
      document.removeEventListener('click', this._click, true);
      if (this._raf) cancelAnimationFrame(this._raf);
      [this.dots, this.tip, this.bar, this.tourCard, this.ring].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
      this.ring = null;
    }

    t() { return UI[this._lang] || UI.mk; }
    entry(k) { var e = HELP[k]; return e ? e[this._lang] || e.mk : null; }

    _surface() {
      return this.tone === 'dark'
        ? { bg: '#231A1D', fg: '#F6EEEA', mut: 'rgba(246,238,234,.62)', line: 'rgba(246,238,234,.16)' }
        : { bg: '#FFFFFF', fg: '#241519', mut: '#7C6A6E', line: 'rgba(36,21,25,.12)' };
    }

    _make() {
      var s = this._surface();
      var z = 2147482000;

      /* A re-mounted layer must not stack a second toolbar on the page. */
      [].slice.call(document.querySelectorAll('[data-help-ui]')).forEach(function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });

      this.dots = document.createElement('div');
      this.dots.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:' + z + ';overflow:hidden';
      document.body.appendChild(this.dots);

      this.tip = document.createElement('div');
      this.tip.style.cssText = 'position:fixed;z-index:' + (z + 3) + ';max-width:290px;background:' + s.bg + ';color:' + s.fg +
        ';border:1px solid ' + s.line + ';border-radius:16px;padding:14px 16px;box-shadow:0 18px 44px rgba(36,21,25,.20);' +
        "font-family:Manrope,system-ui,-apple-system,sans-serif;font-size:13.5px;line-height:1.5;opacity:0;transform:translateY(4px);" +
        'transition:opacity .12s ease,transform .12s ease;pointer-events:none;display:none';
      document.body.appendChild(this.tip);

      this.bar = document.createElement('div');
      this.bar.style.cssText = 'position:fixed;left:16px;bottom:' + this.offset + 'px;z-index:' + (z + 4) +
        ";display:flex;align-items:center;gap:6px;font-family:Manrope,system-ui,-apple-system,sans-serif";
      document.body.appendChild(this.bar);

      this.toggle = document.createElement('button');
      this.tourBtn = document.createElement('button');
      this._langBtn = document.createElement('button');
      [this.toggle, this.tourBtn, this._langBtn].forEach(function (b) {
        b.type = 'button';
        b.style.cssText = 'border:0;cursor:pointer;border-radius:999px;font-weight:700;font-size:13px;min-height:40px;padding:0 15px;' +
          'box-shadow:0 8px 22px rgba(36,21,25,.18);white-space:nowrap';
      });
      this._langBtn.style.padding = '0 12px';
      this.bar.appendChild(this.toggle);
      this.bar.appendChild(this.tourBtn);
      this.bar.appendChild(this._langBtn);

      this.tourCard = document.createElement('div');
      [this.dots, this.tip, this.bar, this.tourCard].forEach(function (n) { n.setAttribute('data-help-ui', '1'); });
      this.tourCard.style.cssText = 'position:fixed;z-index:' + (z + 5) + ';max-width:330px;background:' + s.bg + ';color:' + s.fg +
        ';border:1px solid ' + s.line + ';border-radius:18px;padding:18px;box-shadow:0 22px 54px rgba(36,21,25,.26);' +
        "font-family:Manrope,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;display:none";
      document.body.appendChild(this.tourCard);
    }

    _bind() {
      var self = this;

      this._sync = function () {
        if (self._raf) return;
        self._raf = requestAnimationFrame(function () { self._raf = null; self._lift(); self._drawDots(); self._placeTour(); });
      };
      window.addEventListener('scroll', this._sync, true);
      window.addEventListener('resize', this._sync);

      this._over = function (e) {
        if (!self.on || self.tourAt >= 0) return;
        var el = e.target && e.target.closest ? e.target.closest('[data-help]') : null;
        if (!el) { self._hideTip(); return; }
        self._showTip(el);
      };
      document.addEventListener('mouseover', this._over, true);

      this._click = function (e) {
        if (!self.on || self.tourAt >= 0) return;
        if (!window.matchMedia('(hover: none)').matches) return;
        var el = e.target && e.target.closest ? e.target.closest('[data-help]') : null;
        if (el) { self._showTip(el); }
        else { self._hideTip(); }
      };
      document.addEventListener('click', this._click, true);

      this.toggle.addEventListener('click', function () {
        self.on = !self.on;
        write({ on: self.on, seen: true, lang: self._lang });
        self._endTour();
        self._apply();
      });
      this.tourBtn.addEventListener('click', function () {
        if (self.tourAt >= 0) { self._endTour(); return; }
        if (!self.on) { self.on = true; self._apply(); }
        self._startTour();
      });
      this._langBtn.addEventListener('click', function () {
        self._lang = self._lang === 'mk' ? 'en' : 'mk';
        write({ on: self.on, seen: true, lang: self._lang });
        self._apply();
        if (self.tourAt >= 0) self._renderTour();
      });

      this._mo = new MutationObserver(function () { self._sync(); });
      this._mo.observe(document.body, { childList: true, subtree: true });
    }

    _apply() {
      var t = this.t();
      var s = this._surface();
      this.toggle.textContent = t.on;
      this.toggle.style.background = this.on ? this.accent : s.bg;
      this.toggle.style.color = this.on ? '#fff' : s.fg;
      this.toggle.style.border = this.on ? '0' : '1px solid ' + s.line;
      this.tourBtn.textContent = this.tourAt >= 0 ? t.close : t.tour;
      this.tourBtn.style.background = s.bg;
      this.tourBtn.style.color = s.fg;
      this.tourBtn.style.border = '1px solid ' + s.line;
      this.tourBtn.style.display = this.on ? '' : 'none';
      this._langBtn.textContent = this._lang === 'mk' ? 'EN' : 'МК';
      this._langBtn.style.background = s.bg;
      this._langBtn.style.color = s.mut;
      this._langBtn.style.border = '1px solid ' + s.line;
      this._langBtn.title = this.entry('lang') ? this.entry('lang')[0] : '';
      if (!this.on) this._hideTip();
      this._drawDots();
    }

    /* Sit above whatever fixed bar the design already pins to the bottom. */
    _lift() {
      if (!this.bar) return;
      var vh = window.innerHeight, tallest = 0;
      var nodes = document.body.querySelectorAll('div,aside,footer,nav');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.hasAttribute('data-help-ui')) continue;
        var cs = getComputedStyle(n);
        if (cs.position !== 'fixed') continue;
        var r = n.getBoundingClientRect();
        if (!r.height || r.height > vh * 0.5) continue;
        if (Math.abs(r.bottom - vh) > 2) continue;
        if (r.height > tallest) tallest = r.height;
      }
      var want = Math.max(this.offset, tallest ? Math.round(tallest) + 14 : 0, 16);
      if (want !== this._liftAt) { this._liftAt = want; this.bar.style.bottom = want + 'px'; }
    }

    _drawDots() {
      if (!this.dots) return;
      if (this.on) autotag();
      if (!this.on) { this.dots.innerHTML = ''; return; }
      var nodes = document.querySelectorAll('[data-help]');
      var frag = document.createDocumentFragment();
      var vh = window.innerHeight, vw = window.innerWidth;
      for (var i = 0; i < nodes.length; i++) {
        var r = nodes[i].getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (r.bottom < -8 || r.top > vh + 8 || r.right < -8 || r.left > vw + 8) continue;
        var d = document.createElement('span');
        d.style.cssText = 'position:absolute;width:9px;height:9px;border-radius:999px;background:' + this.accent +
          ';box-shadow:0 0 0 2px rgba(255,255,255,.9);left:' + (r.right - 5) + 'px;top:' + (r.top - 3) + 'px';
        frag.appendChild(d);
      }
      this.dots.innerHTML = '';
      this.dots.appendChild(frag);
    }

    _tipHtml(pair) {
      var s = this._surface();
      return '<p style="margin:0 0 5px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:' +
        this.accent + '">' + pair[0] + '</p><p style="margin:0;color:' + s.fg + '">' + pair[1] + '</p>';
    }

    _showTip(el) {
      var pair = this.entry(el.getAttribute('data-help'));
      if (!pair) return;
      this.tip.innerHTML = this._tipHtml(pair);
      this.tip.style.display = 'block';
      var r = el.getBoundingClientRect();
      var tr = this.tip.getBoundingClientRect();
      var left = Math.min(Math.max(8, r.left), window.innerWidth - tr.width - 8);
      var top = r.bottom + 10;
      if (top + tr.height > window.innerHeight - 8) top = Math.max(8, r.top - tr.height - 10);
      this.tip.style.left = left + 'px';
      this.tip.style.top = top + 'px';
      this.tip.style.opacity = '1';
      this.tip.style.transform = 'none';
    }

    _hideTip() {
      if (!this.tip) return;
      this.tip.style.opacity = '0';
      this.tip.style.transform = 'translateY(4px)';
      var tip = this.tip;
      clearTimeout(this._ht);
      this._ht = setTimeout(function () { tip.style.display = 'none'; }, 140);
    }

    _steps() { return this._live(); }

    _live() {
      var all = TOURS[this.getAttribute('tour') || 'admin'] || [];
      var skip = this._skip || (this._skip = {});
      return all.filter(function (s) { return !skip[s.k]; });
    }

    /* Ask the page to show the screen this step lives on, then find it. */
    _reach(step, done) {
      var self = this;
      var find = function () { return document.querySelector('[data-help="' + step.k + '"]'); };
      if (find()) { done(find()); return; }
      if (step.r && step.r.charAt(0) === '#') {
        if (window.location.hash !== step.r) window.location.hash = step.r;
      } else if (step.r) {
        window.dispatchEvent(new CustomEvent('help-goto', { detail: { route: step.r } }));
      }
      var tries = 0;
      var wait = setInterval(function () {
        tries++;
        var el = find();
        if (el || tries > 24) { clearInterval(wait); done(el); }
      }, 60);
    }

    _startTour() {
      if (!this._steps().length) return;
      this.tourAt = 0;
      this._hideTip();
      this._renderTour();
      this._apply();
    }

    _endTour() {
      this.tourAt = -1;
      this.stepEl = null;
      this.tourCard.style.display = 'none';
      if (this.ring && this.ring.parentNode) { this.ring.parentNode.removeChild(this.ring); this.ring = null; }
      this._apply();
    }

    _renderTour() {
      var self = this;
      var steps = this._steps();
      var step = steps[this.tourAt];
      if (!step) { this._endTour(); return; }
      this._reach(step, function (el) { self._paintTour(step, el); });
    }

    _paintTour(step, el) {
      var steps = this._steps();
      if (!el) {
        /* Anchor missing on this build: drop the step entirely rather than
           advance the counter over the previous step's text. */
        var live = this._live();
        var i = live.indexOf(step);
        this._skip[step.k] = true;
        live = this._live();
        if (!live.length) { this._endTour(); return; }
        this.tourAt = Math.min(i < 0 ? this.tourAt : i, live.length - 1);
        this._renderTour();
        return;
      }
      this.stepEl = el;
      var pair = this.entry(step.k) || ['', ''];
      var t = this.t();
      var s = this._surface();
      var last = this.tourAt === steps.length - 1;

      this.tourCard.innerHTML =
        '<p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:' + this.accent + '">' +
          t.step + ' ' + (this.tourAt + 1) + ' ' + t.of + ' ' + steps.length + '</p>' +
        '<p style="margin:0 0 4px;font-weight:800;font-size:15.5px">' + pair[0] + '</p>' +
        '<p style="margin:0 0 14px;color:' + s.fg + '">' + pair[1] + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          (this.tourAt > 0 ? '<button data-a="prev" type="button" style="border:1px solid ' + s.line + ';background:' + s.bg + ';color:' + s.fg + ';border-radius:999px;min-height:40px;padding:0 16px;font-weight:700;font-size:13px;cursor:pointer">' + t.prev + '</button>' : '') +
          '<button data-a="next" type="button" style="border:0;background:' + this.accent + ';color:#fff;border-radius:999px;min-height:40px;padding:0 18px;font-weight:700;font-size:13px;cursor:pointer">' + (last ? t.done : t.next) + '</button>' +
        '</div>';

      var self = this;
      [].slice.call(this.tourCard.querySelectorAll('button')).forEach(function (b) {
        b.addEventListener('click', function () {
          var a = b.getAttribute('data-a');
          if (a === 'prev') { self.tourAt--; self._renderTour(); return; }
          if (self.tourAt >= self._steps().length - 1) { self._endTour(); return; }
          self.tourAt++;
          self._renderTour();
        });
      });

      this.tourCard.style.display = 'block';
      this._scrollTo(el);
      this._placeTour();
    }

    _scrollTo(el) {
      var r = el.getBoundingClientRect();
      var want = r.top + window.pageYOffset - Math.max(90, window.innerHeight * 0.28);
      window.scrollTo({ top: Math.max(0, want), behavior: 'smooth' });
    }

    _placeTour() {
      if (this.tourAt < 0) return;
      var el = this.stepEl;
      if (!el || !el.isConnected) return;
      var r = el.getBoundingClientRect();

      if (!this.ring) {
        this.ring = document.createElement('div');
        this.ring.style.cssText = 'position:fixed;pointer-events:none;z-index:2147482001;border-radius:14px;transition:all .18s ease';
        document.body.appendChild(this.ring);
      }
      this.ring.style.left = (r.left - 5) + 'px';
      this.ring.style.top = (r.top - 5) + 'px';
      this.ring.style.width = (r.width + 10) + 'px';
      this.ring.style.height = (r.height + 10) + 'px';
      this.ring.style.boxShadow = '0 0 0 2px ' + this.accent + ',0 0 0 9999px rgba(36,21,25,.42)';

      var cr = this.tourCard.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      var left, top;

      if (r.height > vh * 0.45 || r.width > vw * 0.7) {
        /* Tall or full-width target: sit beside it so the highlight stays readable. */
        var rightRoom = vw - r.right - 26;
        left = rightRoom >= cr.width ? r.right + 14 : Math.max(12, r.left - cr.width - 14);
        if (left < 12) left = Math.min(12, vw - cr.width - 12);
        top = Math.min(Math.max(12, r.top), vh - cr.height - 12);
      } else {
        left = Math.min(Math.max(12, r.left), vw - cr.width - 12);
        top = r.bottom + 14;
        if (top + cr.height > vh - 12) top = Math.max(12, r.top - cr.height - 14);
      }
      this.tourCard.style.left = Math.max(12, left) + 'px';
      this.tourCard.style.top = Math.max(12, top) + 'px';
    }
  }

  if (!customElements.get('help-layer')) customElements.define('help-layer', HelpLayer);
})();
