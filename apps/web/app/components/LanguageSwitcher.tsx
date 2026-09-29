import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, type Locale } from '@filtervoda/shared';
import { Check, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocale, useSwitchLocalePath, useT } from '../i18n/context';

/**
 * Header language switcher (FV-001). Minimal, token-based, no extra dependency.
 * Switching keeps you on the same page (path + query preserved) and remembers the
 * choice in a 1-year cookie so a returning visitor's preference can be honored.
 */
export function LanguageSwitcher({
  className = '',
  tone = 'dark',
}: {
  className?: string;
  /** 'light' = light trigger text for dark headers (e.g. Б-2). The menu panel stays light. */
  tone?: 'dark' | 'light';
}) {
  const t = useT();
  const active = useLocale();
  const switchPath = useSwitchLocalePath();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(locale: Locale) {
    setOpen(false);
    if (locale === active) return;
    document.cookie = `fv_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    navigate(switchPath(locale));
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('lang.select')}
        className={`flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-2.5 py-2 text-[15px] font-semibold ${
          tone === 'light'
            ? 'text-white hover:bg-white/15'
            : 'text-[var(--color-foreground)] hover:bg-black/[0.04]'
        }`}
      >
        <Globe size={18} aria-hidden />
        <span>{LOCALE_SHORT[active]}</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t('lang.label')}
          className="absolute right-0 top-full z-[70] mt-1 min-w-[160px] overflow-hidden rounded-[12px] border border-[var(--color-border,#E4EDF9)] bg-[var(--color-background,#fff)] py-1 shadow-[0_10px_30px_rgba(8,24,47,0.14)]"
        >
          {LOCALES.map((locale) => (
            <li key={locale} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === active}
                onClick={() => choose(locale)}
                className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[15px] text-[var(--color-foreground)] hover:bg-[var(--color-surface,#F2F8FF)]"
              >
                <span>
                  <span className="font-semibold">{LOCALE_SHORT[locale]}</span>
                  <span className="ml-2 text-[var(--color-muted,#5b6b82)]">{LOCALE_LABELS[locale]}</span>
                </span>
                {locale === active && <Check size={16} aria-hidden className="text-[var(--color-cta,#1156E0)]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
