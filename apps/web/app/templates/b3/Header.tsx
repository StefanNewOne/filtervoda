import { telHref } from '@filtervoda/shared';
import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';

const NAV = [
  { to: '/proizvodi', label: 'Производи' },
  { to: '/za-biznis', label: 'За фирми' },
  { to: '/soveti', label: 'Совети' },
  { to: '/za-nas', label: 'За нас' },
  { to: '/kontakt', label: 'Контакт' },
];

/** Б-3 header: white blur, JetBrains Mono logo, teal CTA #0E7490 radius 10px. */
export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const phone = phones[0] ?? '076/676/819';

  return (
    <header className="sticky top-0 z-[60] border-b border-[#DCE4EE] bg-white/[0.92] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3.5 px-5 py-3.5">
        <Link to="/" className="font-[family-name:JetBrains_Mono] text-[15px] font-semibold tracking-[-0.02em] text-[#071A3A]">
          filtervoda<span className="text-[#0E7490]">.mk</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Главна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-[10px] px-3 py-2.5 text-[15px] font-semibold text-[#071A3A] hover:bg-[#F4F7FB]">{n.label}</Link>
          ))}
        </nav>
        <a href={telHref(phone)} className="hidden whitespace-nowrap font-[family-name:JetBrains_Mono] text-[14px] font-bold tracking-[0.02em] text-[#071A3A] sm:block">{phone}</a>
        <button onClick={() => openLead()} className="hidden rounded-[10px] bg-[#0E7490] px-5 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(14,116,144,0.3)] transition hover:brightness-110 md:inline-block">Побарај понуда</button>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <a href={telHref(phone)} className="p-2" aria-label="Повикај"><Phone size={22} className="text-[#071A3A]" /></a>
          <button className="p-2" aria-label="Мени" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X size={22} className="text-[#071A3A]" /> : <Menu size={22} className="text-[#071A3A]" />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[#DCE4EE] px-5 py-3 md:hidden">
          {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-[#071A3A]">{n.label}</Link>)}
          <button onClick={() => { setOpen(false); openLead(); }} className="mt-2 w-full rounded-[10px] bg-[#0E7490] px-5 py-3 font-bold text-white">Побарај понуда</button>
        </nav>
      )}
    </header>
  );
}
