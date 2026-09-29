import type { Dict } from './types';

/** English dictionary (FV-001). Missing keys fall back to `mk`. */
export const en: Partial<Dict> = {
  // Navigation
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.b2b': 'For Business',
  'nav.blog': 'Tips',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.primary': 'Main navigation',
  'nav.mobile': 'Mobile navigation',

  // Common CTAs / actions
  'cta.getOffer': 'Request a quote',
  'cta.call': 'Call',
  'cta.viber': 'Viber',
  'cta.email': 'Email',
  'cta.send': 'Send',
  'cta.sending': 'Sending…',
  'cta.menu': 'Menu',
  'cta.close': 'Close',
  'cta.back': 'Back',
  'cta.seeProducts': 'View products',
  'cta.seeMore': 'Learn more',
  'cta.exactOffer': 'Get an exact quote',
  'cta.allProducts': 'All products',
  'cta.readMore': 'Read more',
  'cta.request': 'Request',

  // Language switcher
  'lang.label': 'Language',
  'lang.select': 'Select language',

  // Footer
  'footer.rights': 'All rights reserved.',
  'footer.company': 'SPAR Company',
  'footer.nav': 'Navigation',
  'footer.contact': 'Contact',
  'footer.legal': 'Legal',
  'footer.followUs': 'Follow us',
  'footer.tagline':
    'Water filtration systems with free installation and a 10-year warranty — across all of Macedonia.',
  'footer.products': 'PRODUCTS',
  'footer.site': 'SITE',
  'footer.cat.underSink': 'Under-sink systems',
  'footer.cat.dispensers': 'Dispensers',
  'footer.cat.wholeHome': 'Whole-home filtration',
  'footer.cat.antiLimescale': 'Anti-limescale protection',
  'footer.cat.meters': 'Meters',
  'footer.cat.accessories': 'Accessories',

  // Legal page links
  'legal.privacy': 'Privacy',
  'legal.cookies': 'Cookies',
  'legal.terms': 'Terms',

  // Lead form / modal
  'lead.title': 'Request a free quote',
  'lead.subtitle': 'Leave your contact — we’ll call you back shortly.',
  'lead.name': 'Full name',
  'lead.namePlaceholder': 'Your name',
  'lead.phone': 'Phone',
  'lead.phonePlaceholder': '07x xxx xxx',
  'lead.emailOptional': 'Email (optional)',
  'lead.message': 'Message',
  'lead.messagePlaceholder': 'Your message…',
  'lead.product': 'Product',
  'lead.consent': 'I agree to be contacted regarding my request.',
  'lead.consentRequired': 'Consent is required.',
  'lead.success': 'Thank you! We’ll contact you shortly.',
  'lead.error': 'Something went wrong. Please try again or call us.',
  'lead.nameRequired': 'Please enter your name.',
  'lead.phoneInvalid': 'Please enter a valid phone number.',
  // Lead form (LeadForm.tsx)
  'lead.ph.name': 'Full name',
  'lead.ph.phone': 'Phone (07X XXX XXX)',
  'lead.ph.company': 'Company name',
  'lead.ph.email': 'Email (optional)',
  'lead.ph.city': 'City',
  'lead.ph.message': 'Message (optional)',
  'lead.err.name': 'Please enter your full name',
  'lead.err.phoneRequired': 'This field is required',
  'lead.err.phoneFormat': 'Enter a phone in the format 07X XXX XXX',
  'lead.err.company': 'Please enter the company name',
  'lead.err.consent': 'You must accept the Privacy Policy',
  'lead.err.server': 'The request did not go through. Check the fields and try again.',
  'lead.consentPre':
    'I agree that SPAR Company may contact me regarding my request and process my data in accordance with the',
  'lead.consentLink': 'Privacy Policy',
  'lead.submit': 'Send request',

  // Consent / cookie banner
  'consent.acceptAll': 'Accept all',
  'consent.necessaryOnly': 'Necessary only',
  'consent.settings': 'Settings',
  'consent.save': 'Save choice',
  'consent.necessary': 'Necessary (always active)',
  'consent.analytics': 'Analytics',
  'consent.marketing': 'Marketing',
  'consent.text':
    'We use cookies to improve your experience and for measurement. Choose what you allow.',

  // Errors / 404
  'error.notFoundTitle': 'This page does not exist.',
  'error.genericTitle': 'Something went wrong.',
  'error.help': 'Try the products or the home page.',
  'error.home': 'Home page',

  // Thank-you
  'thankyou.title': 'Thank you!',
  'thankyou.subtitle': 'We received your request and will contact you shortly.',

  // B2B calculator
  'calc.title': 'Savings calculator',
  'calc.employees': 'Number of employees',
  'calc.currentSolution': 'Current solution',
  'calc.gallons': '19L gallons',
  'calc.bottles': '0.5L bottles',
  'calc.pricePerGallon': 'Price per gallon',
  'calc.currentMonthly': 'Current monthly',
  'calc.withSpar': 'With SPAR',
  'calc.annualSaving': 'Annual saving',
  'calc.perMonth': 'MKD/mo',
  'calc.disclaimer': 'This calculation is indicative.',

  // Misc labels
  'common.from': 'from',
  'common.price': 'Price',
  'common.warranty': 'Warranty',
  'common.freeInstall': 'Free installation',
  'common.loading': 'Loading…',
};
