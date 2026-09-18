import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLeadModal } from './LeadModal';
import { Button } from './ui';

const NAV = [
  { to: '/', label: 'Почетна' },
  { to: '/proizvodi', label: 'Производи' },
  { to: '/za-biznis', label: 'За фирми' },
  { to: '/soveti', label: 'Совети' },
  { to: '/za-nas', label: 'За нас' },
  { to: '/kontakt', label: 'Контакт' },
];

export function Header({ phones }: { phones: string[] }) {
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const phone = phones[0];

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--content-max)] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
          filtervoda<span className="text-[var(--color-accent)]">.mk</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Главна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)]">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {phones.length > 0 && (
            <span className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] sm:flex">
              <Phone size={16} />
              {phones.map((p, i) => (
                <span key={p} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[var(--color-border)]">·</span>}
                  <a href={`tel:${p.replace(/[^\d+]/g, '')}`} aria-label={`Повикај ${p}`} className="hover:text-[var(--color-accent)]">
                    {p}
                  </a>
                </span>
              ))}
            </span>
          )}
          <Button className="hidden md:inline-flex" onClick={() => openLead()}>
            Побарај понуда
          </Button>
          <a href={phone ? `tel:${phone}` : '#'} className="p-2 md:hidden" aria-label="Повикај">
            <Phone size={22} />
          </a>
          <button className="p-2 md:hidden" aria-label="Мени" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--color-border)] px-4 py-3 md:hidden" aria-label="Мобилна навигација">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-[var(--color-ink)]">
              {n.label}
            </Link>
          ))}
          <Button className="mt-2 w-full" onClick={() => { setOpen(false); openLead(); }}>
            Побарај понуда
          </Button>
        </nav>
      )}
    </header>
  );
}
