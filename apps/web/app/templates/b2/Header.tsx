import { telHref } from '@filtervoda/shared';
import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';

const NAV = [
  { to: '/', label: 'Почетна' },
  { to: '/proizvodi', label: 'Производи' },
  { to: '/za-biznis', label: 'За фирми' },
  { to: '/soveti', label: 'Совети' },
  { to: '/za-nas', label: 'За нас' },
  { to: '/kontakt', label: 'Контакт' },
];

/** Б-2 header: blue gradient, Oswald logo, green CTA #16803B. */
export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const phone = phones[0] ?? '076/676/819';
  const phoneList = phones.length ? phones : [phone];

  return (
    <header className="sticky top-0 z-[60] border-b border-[rgba(111,196,247,0.24)] [background:linear-gradient(100deg,rgba(7,26,58,0.94),rgba(11,60,140,0.94))] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3.5 px-5 py-3.5">
        <Link to="/" className="font-[family-name:Oswald] text-[17px] font-semibold tracking-[0.02em] text-white">
          filtervoda<span className="text-[#7BE0A0]">.mk</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Главна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3.5 py-2.5 text-[15px] font-semibold text-white hover:bg-[rgba(255,255,255,0.14)]">{n.label}</Link>
          ))}
        </nav>
        <span className="hidden items-center gap-2 text-[15px] font-bold text-white sm:flex">
          {phoneList.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && <span className="text-[rgba(255,255,255,0.5)]">·</span>}
              <a href={telHref(p)} className="hover:text-[#7BE0A0]">{p}</a>
            </span>
          ))}
        </span>
        <button onClick={() => openLead()} className="hidden rounded-full bg-[#16803B] px-5 py-3 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(22,128,59,0.34)] transition hover:brightness-110 md:inline-block">Побарај понуда</button>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <a href={telHref(phone)} className="p-2" aria-label="Повикај"><Phone size={22} className="text-white" /></a>
          <button className="p-2" aria-label="Мени" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[rgba(111,196,247,0.24)] px-5 py-3 md:hidden">
          {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-white">{n.label}</Link>)}
          <button onClick={() => { setOpen(false); openLead(); }} className="mt-2 w-full rounded-full bg-[#16803B] px-5 py-3 font-bold text-white">Побарај понуда</button>
        </nav>
      )}
    </header>
  );
}
