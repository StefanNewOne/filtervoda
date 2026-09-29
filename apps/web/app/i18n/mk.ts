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

  // ── Consent / cookie banner ──
  'consent.acceptAll': 'Прифати сè',
  'consent.necessaryOnly': 'Само неопходни',
  'consent.settings': 'Поставки',
  'consent.save': 'Зачувај избор',
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
