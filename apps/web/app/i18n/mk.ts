/**
 * Macedonian dictionary — the REFERENCE locale (FV-001).
 * Its shape defines the key union; `en`/`sq` are Partial<> of this and fall back here.
 * Keys are dot-namespaced by area. UI chrome only — DB content is translated separately (M2).
 */
export const mk = {
  // ── Navigation ──
  'nav.home': 'Почетна',
  'nav.products': 'Производи',
  'nav.b2b': 'За фирми',
  'nav.blog': 'Совети',
  'nav.about': 'За нас',
  'nav.contact': 'Контакт',
  'nav.primary': 'Главна навигација',
  'nav.mobile': 'Мобилна навигација',

  // ── Common CTAs / actions ──
  'cta.getOffer': 'Побарај понуда',
  'cta.call': 'Повикај',
  'cta.viber': 'Viber',
  'cta.email': 'Е-пошта',
  'cta.send': 'Испрати',
  'cta.sending': 'Се испраќа…',
  'cta.menu': 'Мени',
  'cta.close': 'Затвори',
  'cta.back': 'Назад',
  'cta.seeProducts': 'Погледни производи',
  'cta.seeMore': 'Дознај повеќе',
  'cta.exactOffer': 'Добиј точна понуда',
  'cta.allProducts': 'Сите производи',
  'cta.readMore': 'Прочитај повеќе',
  'cta.request': 'Барање',

  // ── Language switcher ──
  'lang.label': 'Јазик',
  'lang.select': 'Избери јазик',

  // ── Footer ──
  'footer.rights': 'Сите права задржани.',
  'footer.company': 'СПАР Компанија',
  'footer.nav': 'Навигација',
  'footer.contact': 'Контакт',
  'footer.legal': 'Правни',
  'footer.followUs': 'Следете нè',
  'footer.tagline':
    'Системи за филтрација на вода со бесплатна монтажа и 10 години гаранција — низ цела Македонија.',
  'footer.products': 'ПРОИЗВОДИ',
  'footer.site': 'САЈТ',
  'footer.cat.underSink': 'Системи под мијалник',
  'footer.cat.dispensers': 'Диспензери',
  'footer.cat.wholeHome': 'Филтрација за цел дом',
  'footer.cat.antiLimescale': 'Заштита од бигор',
  'footer.cat.meters': 'Мерачи',
  'footer.cat.accessories': 'Додатоци',

  // ── Legal page links ──
  'legal.privacy': 'Приватност',
  'legal.cookies': 'Колачиња',
  'legal.terms': 'Услови',
  'legal.lastModified': 'Последна измена',
  'legal.draftNote': 'Текстот е нацрт за дизајн — финалната верзија ја обезбедува GoDigital со правник.',

  // ── Blog / post ──
  'blog.intro': 'Едукативни текстови за реверзна осмоза, бигор, алкална вода и вода на работно место.',
  'blog.empty': 'Наскоро додаваме статии.',
  'post.eyebrow': 'ЕДУКАТИВНО',
  'post.sidebarTitle': 'СОДРЖИНА',
  'post.sidebarText': 'Не сте сигурни кој систем ви одговара? Оставете телефон — ќе ве советуваме бесплатно.',
  'post.consultCta': 'Побарај консултација',
  'post.share': 'СПОДЕЛИ',

  // ── Lead form / modal ──
  'lead.title': 'Побарајте бесплатна понуда',
  'lead.subtitle': 'Оставете контакт — ве враќаме со повик набрзо.',
  'lead.name': 'Име и презиме',
  'lead.namePlaceholder': 'Вашето име',
  'lead.phone': 'Телефон',
  'lead.phonePlaceholder': '07x xxx xxx',
  'lead.emailOptional': 'Е-пошта (опционално)',
  'lead.message': 'Порака',
  'lead.messagePlaceholder': 'Вашата порака…',
  'lead.product': 'Производ',
  'lead.consent': 'Се согласувам да бидам контактиран/а во врска со мојата барање.',
  'lead.consentRequired': 'Потребна е согласност.',
  'lead.success': 'Ви благодариме! Ќе ве контактираме набрзо.',
  'lead.error': 'Настана грешка. Обидете се повторно или јавете се.',
  'lead.nameRequired': 'Внесете име.',
  'lead.phoneInvalid': 'Внесете валиден телефонски број.',
  // Lead form (LeadForm.tsx)
  'lead.ph.name': 'Име и презиме',
  'lead.ph.phone': 'Телефон (07X XXX XXX)',
  'lead.ph.company': 'Име на фирма',
  'lead.ph.email': 'Email (опционално)',
  'lead.ph.city': 'Град',
  'lead.ph.message': 'Порака (опционално)',
  'lead.err.name': 'Внесете име и презиме',
  'lead.err.phoneRequired': 'Ова поле е задолжително',
  'lead.err.phoneFormat': 'Внесете телефон во формат 07X XXX XXX',
  'lead.err.company': 'Внесете име на фирма',
  'lead.err.consent': 'Мора да ја прифатите Политиката за приватност',
  'lead.err.server': 'Барањето не помина. Проверете ги полињата и обидете се повторно.',
  'lead.consentPre':
    'Се согласувам SPAR Company да ме контактира во врска со моето барање и да ги обработува моите податоци согласно',
  'lead.consentLink': 'Политиката за приватност',
  'lead.submit': 'Испрати барање',

  // ── Consent / cookie banner ──
  'consent.acceptAll': 'Прифати сè',
  'consent.necessaryOnly': 'Само неопходни',
  'consent.settings': 'Поставки',
  'consent.save': 'Зачувај избор',
  'consent.necessary': 'Неопходни (секогаш активни)',
  'consent.analytics': 'Статистика',
  'consent.marketing': 'Маркетинг',
  'consent.text':
    'Користиме колачиња за да го подобриме искуството и за мерење. Изберете што дозволувате.',

  // ── Errors / 404 ──
  'error.notFoundTitle': 'Оваа страница не постои.',
  'error.genericTitle': 'Настана грешка.',
  'error.help': 'Пробајте од производите или почетната страница.',
  'error.home': 'Почетна страница',

  // ── Thank-you ──
  'thankyou.title': 'Ви благодариме!',
  'thankyou.subtitle': 'Го примивме вашето барање и ќе ве контактираме набрзо.',
  'thankyou.step1': 'Ве повикуваме — во рок од еден работен ден.',
  'thankyou.step2': 'Добивате понуда и термин — бесплатна проценка.',
  'thankyou.step3': 'Монтираме бесплатно — и уживате чиста вода.',
  'thankyou.urgent': 'Итно? Повикајте',
  'cta.readTips': 'Прочитај совети',

  // ── B2B calculator ──
  'calc.title': 'Пресметка на заштеда',
  'calc.employees': 'Број на вработени',
  'calc.currentSolution': 'Сегашно решение',
  'calc.gallons': 'Галони 19Л',
  'calc.bottles': 'Шишиња 0.5Л',
  'calc.pricePerGallon': 'Цена по галон',
  'calc.currentMonthly': 'Сегашно месечно',
  'calc.withSpar': 'Со SPAR',
  'calc.annualSaving': 'Годишна заштеда',
  'calc.perMonth': 'ден./мес.',
  'calc.disclaimer': 'Пресметката е ориентациона.',

  // ── Misc labels ──
  'common.from': 'од',
  'common.price': 'Цена',
  'common.warranty': 'Гаранција',
  'common.freeInstall': 'Бесплатна монтажа',
  'common.loading': 'Се вчитува…',
  'nav.breadcrumb': 'Патека',
  'cta.contactUs': 'Контактирајте нè',

  // ── About page (defaults; admin content overrides — M2) ──
  'about.imageAlt': 'Систем за филтрација во кујна',
  'about.defaultTitle': 'Чиста вода за пиење = здрава иднина.',
  'about.defaultIntro':
    'SPAR Company продава и монтира системи за филтрација на вода низ цела Македонија. Работиме со домаќинства и со фирми — од еден систем под мијалник до филтрација за цел објект.',
  'about.whyTitle': 'Зошто SPAR',
  'about.whyText1':
    'Монтажата е бесплатна и ја вршат наши техничари. Филтрите ги менуваме ние, на терен, според интервалот за секој степен. Плаќањето е во готово или на рати, а гаранцијата е десет години.',
  'about.whyText2':
    'Сервисот е достапен низ цела Македонија — секогаш сте покриени, без разлика каде живеете или работите.',
  'about.stat1': 'години гаранција на секој систем',
  'about.stat2': 'производи во понудата',
  'about.stat3': 'достава и монтажа низ цела држава',

  // ── Contact page ──
  'contact.phone': 'ТЕЛЕФОН',
  'contact.viber': 'ВИБЕР',
  'contact.viberWrite': 'Пишете ни',
  'contact.hours': 'РАБОТНО ВРЕМЕ',
  'contact.email': 'EMAIL',
  'contact.writeToUs': 'Напишете ни',
  'contact.defaultHours': 'Пон–Саб · 09:00–18:00',
  'contact.defaultAddress': 'Скопје, Македонија',

  // ── Home sections (defaults; admin copy overrides — M2) ──
  'home.b2b.eyebrow': 'ЗА ВАШАТА ФИРМА',
  'home.b2b.title': 'Неограничена чиста вода за вашиот тим.',
  'home.b2b.b1': 'Апарат за топла и ладна вода',
  'home.b2b.b2': 'Бесплатна монтажа и сервис',
  'home.b2b.b3': 'Редовна замена на филтри',
  'home.b2b.b4': 'Фиксен месечен износ — без инвестиција',
  'home.b2b.cta': 'Побарај понуда за фирма',
  'home.b2b.imageAlt': 'Диспензер за топла и ладна вода за фирми',
  'home.articles.title': 'Совети за чиста вода',
  'home.articles.all': 'Сите совети',
  'home.articles.tag': 'СОВЕТ',
  'home.stages.eyebrow': 'КАКО ФУНКЦИОНИРА',
  'home.products.all': 'Сите производи',

  // ── Trust bar ──
  'trust.warranty10': '10 години гаранција',
  'trust.freeInstall': 'Бесплатна монтажа',
  'trust.delivery': 'Достава низ цела Македонија',
  'trust.payment': 'Плаќање во готово или на рати',
  'trust.deliveryShort': 'Достава низ Македонија',
  'trust.paymentShort': 'Готово или на рати',

  // ── Catalog page ──
  'catalog.intro':
    'Системи под мијалник, диспензери, филтрација за цел дом, заштита од бигор и мерачи — секој со бесплатна монтажа и 10 години гаранција.',
  'catalog.all': 'Сите',
  'catalog.empty': 'Нема производи во оваа категорија.',
  'catalog.emptyText': 'Оставете телефон и ќе ве советуваме што одговара за вас.',
  'catalog.compareTitle': 'Споредба на моделите',
  'catalog.compareHint': 'Лизгајте хоризонтално за да ги видите сите колони.',
  'catalog.col.model': 'МОДЕЛ',
  'catalog.col.stages': 'СТЕПЕНИ',
  'catalog.col.tank': 'РЕЗЕРВОАР',
  'catalog.col.display': 'ДИСПЛЕЈ',
  'catalog.col.ph': 'pH',
  'catalog.col.warranty': 'ГАРАНЦИЈА',
  'catalog.col.price': 'ЦЕНА',
  'catalog.years10': '10 год.',
  'catalog.advisorTitle': 'Не знаете кој систем ви одговара?',
  'catalog.advisorText': 'Две прашања — и добивате препорака од нас.',
  'catalog.advisorCta': 'Добијте препорака',

  // ── Product card ──
  'card.sale': 'Акција',
  'card.image': 'Слика',
  'card.askPrice': 'Побарај цена',
  'card.details': 'Детали',
  'card.offer': 'Понуда',
} as const;
