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
  'legal.lastModified': 'Last modified',
  'legal.draftNote':
    'This text is a design draft — the final version is provided by GoDigital together with a lawyer.',

  // Blog / post
  'blog.intro': 'Educational articles on reverse osmosis, limescale, alkaline water and water at the workplace.',
  'blog.empty': 'Articles coming soon.',
  'post.eyebrow': 'EDUCATIONAL',
  'post.sidebarTitle': 'CONTENTS',
  'post.sidebarText': 'Not sure which system suits you? Leave your phone — we’ll advise you for free.',
  'post.consultCta': 'Request a consultation',
  'post.share': 'SHARE',

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
  'thankyou.step1': 'We call you — within one business day.',
  'thankyou.step2': 'You get a quote and an appointment — free assessment.',
  'thankyou.step3': 'We install for free — and you enjoy clean water.',
  'thankyou.urgent': 'Urgent? Call',
  'cta.readTips': 'Read tips',

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
  'nav.breadcrumb': 'Breadcrumb',
  'cta.contactUs': 'Contact us',

  // About page
  'about.imageAlt': 'Water filtration system in a kitchen',
  'about.defaultTitle': 'Clean drinking water = a healthy future.',
  'about.defaultIntro':
    'SPAR Company sells and installs water filtration systems across all of Macedonia. We work with households and businesses — from a single under-sink system to whole-building filtration.',
  'about.whyTitle': 'Why SPAR',
  'about.whyText1':
    'Installation is free and done by our technicians. We replace the filters on-site, per the interval for each stage. Payment is in cash or in installments, with a ten-year warranty.',
  'about.whyText2':
    'Service is available across all of Macedonia — you are always covered, wherever you live or work.',
  'about.stat1': 'years warranty on every system',
  'about.stat2': 'products in the range',
  'about.stat3': 'delivery and installation nationwide',

  // Contact page
  'contact.phone': 'PHONE',
  'contact.viber': 'VIBER',
  'contact.viberWrite': 'Message us',
  'contact.hours': 'WORKING HOURS',
  'contact.email': 'EMAIL',
  'contact.writeToUs': 'Write to us',
  'contact.defaultHours': 'Mon–Sat · 09:00–18:00',
  'contact.defaultAddress': 'Skopje, Macedonia',

  // Home sections
  'home.b2b.eyebrow': 'FOR YOUR BUSINESS',
  'home.b2b.title': 'Unlimited clean water for your team.',
  'home.b2b.b1': 'Hot & cold water dispenser',
  'home.b2b.b2': 'Free installation and service',
  'home.b2b.b3': 'Regular filter replacement',
  'home.b2b.b4': 'Fixed monthly fee — no investment',
  'home.b2b.cta': 'Request a business quote',
  'home.b2b.imageAlt': 'Hot & cold water dispenser for businesses',
  'home.articles.title': 'Tips for clean water',
  'home.articles.all': 'All tips',
  'home.articles.tag': 'TIP',
  'home.stages.eyebrow': 'HOW IT WORKS',
  'home.products.all': 'All products',

  // Trust bar
  'trust.warranty10': '10-year warranty',
  'trust.freeInstall': 'Free installation',
  'trust.delivery': 'Delivery across Macedonia',
  'trust.payment': 'Payment in cash or installments',
  'trust.deliveryShort': 'Delivery in Macedonia',
  'trust.paymentShort': 'Cash or installments',

  // Catalog page
  'catalog.intro':
    'Under-sink systems, dispensers, whole-home filtration, anti-limescale protection and meters — each with free installation and a 10-year warranty.',
  'catalog.all': 'All',
  'catalog.empty': 'No products in this category.',
  'catalog.emptyText': 'Leave your phone and we’ll advise what suits you.',
  'catalog.compareTitle': 'Compare the models',
  'catalog.compareHint': 'Scroll horizontally to see all columns.',
  'catalog.col.model': 'MODEL',
  'catalog.col.stages': 'STAGES',
  'catalog.col.tank': 'TANK',
  'catalog.col.display': 'DISPLAY',
  'catalog.col.ph': 'pH',
  'catalog.col.warranty': 'WARRANTY',
  'catalog.col.price': 'PRICE',
  'catalog.years10': '10 yrs',
  'catalog.advisorTitle': 'Not sure which system suits you?',
  'catalog.advisorText': 'Two questions — and you get a recommendation from us.',
  'catalog.advisorCta': 'Get a recommendation',

  // Product card
  'card.sale': 'Sale',
  'card.image': 'Image',
  'card.askPrice': 'Ask for price',
  'card.details': 'Details',
  'card.offer': 'Quote',
};
