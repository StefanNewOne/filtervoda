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

/** Б-1 header: white blur, Unbounded logo, pill CTA #1156E0. */
export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const phone = phones[0] ?? '076/676/819';
  const phoneList = phones.length ? phones : [phone];

  return (
    <header className="sticky top-0 z-[60] border-b border-[#E4EDF9] bg-white/[0.88] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3.5 px-5 py-3.5">
        <Link to="/" className="font-[family-name:Unbounded] text-[15px] font-semibold tracking-[-0.02em] text-[#08182F]">
          filtervoda<span className="text-[#0E7490]">.mk</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Главна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-[10px] px-3 py-2.5 text-[15px] font-semibold text-[#08182F] hover:bg-[#F2F8FF]">
              {n.label}
            </Link>
          ))}
        </nav>

        <span className="hidden text-[15px] font-bold tracking-[-0.01em] text-[#08182F] sm:flex sm:items-center sm:gap-2 md:ml-0">
          {phoneList.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && <span className="text-[#C4D6EC]">·</span>}
              <a href={telHref(p)} className="hover:text-[#0E7490]">{p}</a>
            </span>
          ))}
        </span>
        <button
          onClick={() => openLead()}
          className="hidden rounded-full bg-[#1156E0] px-5 py-3 text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_6px_18px_rgba(17,86,224,0.28)] transition hover:bg-[#08182F] md:inline-block"
        >
          Побарај понуда
        </button>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <a href={telHref(phone)} className="p-2" aria-label="Повикај"><Phone size={22} className="text-[#08182F]" /></a>
          <button className="p-2" aria-label="Мени" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={22} className="text-[#08182F]" /> : <Menu size={22} className="text-[#08182F]" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#E4EDF9] px-5 py-3 md:hidden" aria-label="Мобилна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-[#08182F]">{n.label}</Link>
          ))}
          <button onClick={() => { setOpen(false); openLead(); }} className="mt-2 w-full rounded-full bg-[#1156E0] px-5 py-3 font-bold text-white">
            Побарај понуда
          </button>
        </nav>
      )}
    </header>
  );
}
