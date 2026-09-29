import type { Dict } from './types';

/** Albanian dictionary (FV-001). Missing keys fall back to `mk`. */
export const sq: Partial<Dict> = {
  // Navigation
  'nav.home': 'Ballina',
  'nav.products': 'Produktet',
  'nav.b2b': 'Për biznese',
  'nav.blog': 'Këshilla',
  'nav.about': 'Rreth nesh',
  'nav.contact': 'Kontakt',
  'nav.primary': 'Navigimi kryesor',
  'nav.mobile': 'Navigimi celular',

  // Common CTAs / actions
  'cta.getOffer': 'Kërko një ofertë',
  'cta.call': 'Telefono',
  'cta.viber': 'Viber',
  'cta.email': 'Email',
  'cta.send': 'Dërgo',
  'cta.sending': 'Duke dërguar…',
  'cta.menu': 'Menu',
  'cta.close': 'Mbyll',
  'cta.back': 'Prapa',
  'cta.seeProducts': 'Shiko produktet',
  'cta.seeMore': 'Mëso më shumë',
  'cta.exactOffer': 'Merr ofertë të saktë',
  'cta.allProducts': 'Të gjitha produktet',
  'cta.readMore': 'Lexo më shumë',
  'cta.request': 'Kërkesë',

  // Language switcher
  'lang.label': 'Gjuha',
  'lang.select': 'Zgjidh gjuhën',

  // Footer
  'footer.rights': 'Të gjitha të drejtat e rezervuara.',
  'footer.company': 'SPAR Company',
  'footer.nav': 'Navigimi',
  'footer.contact': 'Kontakt',
  'footer.legal': 'Ligjore',
  'footer.followUs': 'Na ndiqni',
  'footer.tagline':
    'Sisteme filtrimi uji me instalim falas dhe garanci 10-vjeçare — në të gjithë Maqedoninë.',
  'footer.products': 'PRODUKTET',
  'footer.site': 'FAQJA',
  'footer.cat.underSink': 'Sisteme nën lavaman',
  'footer.cat.dispensers': 'Dispenserë',
  'footer.cat.wholeHome': 'Filtrim për të gjithë shtëpinë',
  'footer.cat.antiLimescale': 'Mbrojtje nga guri i ujit',
  'footer.cat.meters': 'Matës',
  'footer.cat.accessories': 'Aksesorë',

  // Legal page links
  'legal.privacy': 'Privatësia',
  'legal.cookies': 'Cookie',
  'legal.terms': 'Kushtet',

  // Lead form / modal
  'lead.title': 'Kërko një ofertë falas',
  'lead.subtitle': 'Lini kontaktin — ju kthejmë me telefon së shpejti.',
  'lead.name': 'Emri dhe mbiemri',
  'lead.namePlaceholder': 'Emri juaj',
  'lead.phone': 'Telefoni',
  'lead.phonePlaceholder': '07x xxx xxx',
  'lead.emailOptional': 'Email (opsionale)',
  'lead.message': 'Mesazhi',
  'lead.messagePlaceholder': 'Mesazhi juaj…',
  'lead.product': 'Produkti',
  'lead.consent': 'Pajtohem të kontaktohem lidhur me kërkesën time.',
  'lead.consentRequired': 'Pëlqimi është i detyrueshëm.',
  'lead.success': 'Faleminderit! Do t’ju kontaktojmë së shpejti.',
  'lead.error': 'Ndodhi një gabim. Provoni përsëri ose na telefononi.',
  'lead.nameRequired': 'Ju lutemi shkruani emrin tuaj.',
  'lead.phoneInvalid': 'Ju lutemi shkruani një numër telefoni të vlefshëm.',
  // Lead form (LeadForm.tsx)
  'lead.ph.name': 'Emri dhe mbiemri',
  'lead.ph.phone': 'Telefoni (07X XXX XXX)',
  'lead.ph.company': 'Emri i firmës',
  'lead.ph.email': 'Email (opsionale)',
  'lead.ph.city': 'Qyteti',
  'lead.ph.message': 'Mesazhi (opsionale)',
  'lead.err.name': 'Ju lutemi shkruani emrin dhe mbiemrin',
  'lead.err.phoneRequired': 'Kjo fushë është e detyrueshme',
  'lead.err.phoneFormat': 'Shkruani telefonin në formatin 07X XXX XXX',
  'lead.err.company': 'Ju lutemi shkruani emrin e firmës',
  'lead.err.consent': 'Duhet të pranoni Politikën e Privatësisë',
  'lead.err.server': 'Kërkesa nuk u krye. Kontrolloni fushat dhe provoni përsëri.',
  'lead.consentPre':
    'Pajtohem që SPAR Company të më kontaktojë lidhur me kërkesën time dhe të përpunojë të dhënat e mia në përputhje me',
  'lead.consentLink': 'Politikën e Privatësisë',
  'lead.submit': 'Dërgo kërkesën',

  // Consent / cookie banner
  'consent.acceptAll': 'Prano të gjitha',
  'consent.necessaryOnly': 'Vetëm të nevojshmet',
  'consent.settings': 'Cilësimet',
  'consent.save': 'Ruaj zgjedhjen',
  'consent.necessary': 'Të nevojshme (gjithmonë aktive)',
  'consent.analytics': 'Statistika',
  'consent.marketing': 'Marketing',
  'consent.text':
    'Përdorim cookie për të përmirësuar përvojën dhe për matje. Zgjidhni çfarë lejoni.',

  // Errors / 404
  'error.notFoundTitle': 'Kjo faqe nuk ekziston.',
  'error.genericTitle': 'Ndodhi një gabim.',
  'error.help': 'Provoni produktet ose faqen kryesore.',
  'error.home': 'Faqja kryesore',

  // Thank-you
  'thankyou.title': 'Faleminderit!',
  'thankyou.subtitle': 'E morëm kërkesën tuaj dhe do t’ju kontaktojmë së shpejti.',

  // B2B calculator
  'calc.title': 'Llogaritësi i kursimeve',
  'calc.employees': 'Numri i punonjësve',
  'calc.currentSolution': 'Zgjidhja aktuale',
  'calc.gallons': 'Galona 19L',
  'calc.bottles': 'Shishe 0.5L',
  'calc.pricePerGallon': 'Çmimi për galon',
  'calc.currentMonthly': 'Aktuale mujore',
  'calc.withSpar': 'Me SPAR',
  'calc.annualSaving': 'Kursimi vjetor',
  'calc.perMonth': 'MKD/muaj',
  'calc.disclaimer': 'Kjo llogaritje është orientuese.',

  // Misc labels
  'common.from': 'nga',
  'common.price': 'Çmimi',
  'common.warranty': 'Garancia',
  'common.freeInstall': 'Instalim falas',
  'common.loading': 'Duke u ngarkuar…',
};
