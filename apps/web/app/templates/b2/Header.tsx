import { telHref } from '@filtervoda/shared';
import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useLeadModal } from '../../components/LeadModal';
import { LocaleLink, useT } from '../../i18n/context';
import type { TKey } from '../../i18n/types';

const NAV: { to: string; key: TKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/proizvodi', key: 'nav.products' },
  { to: '/za-biznis', key: 'nav.b2b' },
  { to: '/soveti', key: 'nav.blog' },
  { to: '/za-nas', key: 'nav.about' },
  { to: '/kontakt', key: 'nav.contact' },
];

/** Б-2 header: blue gradient, Oswald logo, green CTA #16803B. */
export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const t = useT();
  const phone = phones[0] ?? '076/676/819';
  const phoneList = phones.length ? phones : [phone];

  return (
    <header className="sticky top-0 z-[60] border-b border-[rgba(111,196,247,0.24)] [background:linear-gradient(100deg,rgba(7,26,58,0.94),rgba(11,60,140,0.94))] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3.5 px-5 py-3.5 md:gap-x-3 lg:flex-nowrap lg:gap-x-4">
        <LocaleLink to="/" className="shrink-0 font-[family-name:Oswald] text-[17px] font-semibold tracking-[0.02em] text-white">
          filtervoda<span className="text-[#7BE0A0]">.mk</span>
        </LocaleLink>
        <nav className="ml-auto hidden items-center gap-0.5 md:flex lg:gap-1" aria-label={t('nav.primary')}>
          {NAV.map((n) => (
            <LocaleLink key={n.to} to={n.to} className="whitespace-nowrap rounded-full px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-[rgba(255,255,255,0.14)] lg:px-3.5">{t(n.key)}</LocaleLink>
          ))}
        </nav>
        <span className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-bold text-white sm:flex">
          {phoneList.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && <span className="text-[rgba(255,255,255,0.5)]">·</span>}
              <a href={telHref(p)} className="hover:text-[#7BE0A0]">{p}</a>
            </span>
          ))}
        </span>
        <div className="hidden shrink-0 md:block">
          <LanguageSwitcher tone="light" />
        </div>
        <button onClick={() => openLead()} className="hidden shrink-0 whitespace-nowrap rounded-full bg-[#16803B] px-5 py-3 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(22,128,59,0.34)] transition hover:brightness-110 md:inline-block">{t('cta.getOffer')}</button>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <LanguageSwitcher tone="light" />
          <a href={telHref(phone)} className="p-2" aria-label={t('cta.call')}><Phone size={22} className="text-white" /></a>
          <button className="p-2" aria-label={t('cta.menu')} aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[rgba(111,196,247,0.24)] px-5 py-3 md:hidden" aria-label={t('nav.mobile')}>
          {NAV.map((n) => <LocaleLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-white">{t(n.key)}</LocaleLink>)}
          <button onClick={() => { setOpen(false); openLead(); }} className="mt-2 w-full rounded-full bg-[#16803B] px-5 py-3 font-bold text-white">{t('cta.getOffer')}</button>
        </nav>
      )}
    </header>
  );
}
