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
} as const;
