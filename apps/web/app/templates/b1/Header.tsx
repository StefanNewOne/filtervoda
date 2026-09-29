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

/** Б-1 header: white blur, Unbounded logo, pill CTA #1156E0. */
export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const t = useT();
  const phone = phones[0] ?? '076/676/819';
  const phoneList = phones.length ? phones : [phone];

  return (
    <header className="sticky top-0 z-[60] border-b border-[#E4EDF9] bg-white/[0.88] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3.5 px-5 py-3.5 md:gap-x-3 lg:flex-nowrap lg:gap-x-4">
        <LocaleLink to="/" className="shrink-0 font-[family-name:Unbounded] text-[15px] font-semibold tracking-[-0.02em] text-[#08182F]">
          filtervoda<span className="text-[#0E7490]">.mk</span>
        </LocaleLink>

        <nav className="ml-auto hidden items-center gap-0.5 md:flex lg:gap-1" aria-label={t('nav.primary')}>
          {NAV.map((n) => (
            <LocaleLink key={n.to} to={n.to} className="whitespace-nowrap rounded-[10px] px-2.5 py-2.5 text-[15px] font-semibold text-[#08182F] hover:bg-[#F2F8FF] lg:px-3">
              {t(n.key)}
            </LocaleLink>
          ))}
        </nav>

        <span className="hidden whitespace-nowrap text-[15px] font-bold tracking-[-0.01em] text-[#08182F] sm:flex sm:items-center sm:gap-2 md:ml-0">
          {phoneList.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#C4D6EC]">·</span>}
              <a href={telHref(p)} className="hover:text-[#0E7490]">{p}</a>
            </span>
          ))}
        </span>

        <div className="hidden shrink-0 md:block">
          <LanguageSwitcher />
        </div>

        <button
          onClick={() => openLead()}
          className="hidden shrink-0 whitespace-nowrap rounded-full bg-[#1156E0] px-5 py-3 text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_6px_18px_rgba(17,86,224,0.28)] transition hover:bg-[#08182F] md:inline-block lg:px-5"
        >
          {t('cta.getOffer')}
        </button>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <a href={telHref(phone)} className="p-2" aria-label={t('cta.call')}><Phone size={22} className="text-[#08182F]" /></a>
          <button className="p-2" aria-label={t('cta.menu')} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={22} className="text-[#08182F]" /> : <Menu size={22} className="text-[#08182F]" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#E4EDF9] px-5 py-3 md:hidden" aria-label={t('nav.mobile')}>
          {NAV.map((n) => (
            <LocaleLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-[#08182F]">{t(n.key)}</LocaleLink>
          ))}
          <button onClick={() => { setOpen(false); openLead(); }} className="mt-2 w-full rounded-full bg-[#1156E0] px-5 py-3 font-bold text-white">
            {t('cta.getOffer')}
          </button>
        </nav>
      )}
    </header>
  );
}
