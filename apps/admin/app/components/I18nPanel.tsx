import { LOCALE_LABELS, PREFIXED_LOCALES, type Locale } from '@filtervoda/shared';
import { useState } from 'react';

export type I18nData = Partial<Record<Locale, Record<string, unknown>>>;
export type I18nField = { key: string; label: string; type?: 'text' | 'textarea' | 'list' };

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
const toList = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(', ') : '');
const fromList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

/**
 * Per-locale translation editor (FV-001 M2). Edits the row's `i18n` overlay
 * (`{ en: {field: value…}, sq: {…} }`) for the given fields. Admin UI stays Macedonian;
 * only the content values are translated. Empty fields fall back to the MK base on the site.
 */
export function I18nPanel({
  value,
  onChange,
  fields,
}: {
  value: I18nData | undefined;
  onChange: (next: I18nData) => void;
  fields: I18nField[];
}) {
  const [locale, setLocale] = useState<Locale>(PREFIXED_LOCALES[0]);
  const data = value ?? {};
  const forLocale = data[locale] ?? {};

  const setField = (key: string, raw: unknown) => {
    onChange({ ...data, [locale]: { ...forLocale, [key]: raw } });
  };

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex gap-1.5">
        {PREFIXED_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              l === locale ? 'bg-[var(--color-cyan-600,#0891b2)] text-white' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>

      {fields.map((f) => {
        const v = forLocale[f.key];
        if (f.type === 'textarea') {
          return (
            <label key={f.key} className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">{f.label}</span>
              <textarea className={input} rows={2} value={typeof v === 'string' ? v : ''} onChange={(e) => setField(f.key, e.target.value)} />
            </label>
          );
        }
        if (f.type === 'list') {
          return (
            <label key={f.key} className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">{f.label}</span>
              <input className={input} value={toList(v)} onChange={(e) => setField(f.key, fromList(e.target.value))} placeholder="Одделено со запирки" />
            </label>
          );
        }
        return (
          <label key={f.key} className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">{f.label}</span>
            <input className={input} value={typeof v === 'string' ? v : ''} onChange={(e) => setField(f.key, e.target.value)} />
          </label>
        );
      })}
      <p className="text-xs text-[var(--color-neutral-400)]">
        Празно поле = се прикажува македонскиот текст на тој јазик.
      </p>
    </div>
  );
}
