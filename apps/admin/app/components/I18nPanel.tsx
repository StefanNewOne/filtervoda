import { LOCALE_LABELS, PREFIXED_LOCALES, type Locale } from '@filtervoda/shared';
import { useState } from 'react';

export type I18nData = Partial<Record<Locale, Record<string, unknown>>>;
export type I18nField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'list' | 'rows';
  /** For type 'rows': the translatable sub-fields of each object in the array. */
  rowFields?: { key: string; label: string }[];
};

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
const toList = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(', ') : '');
const fromList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
const asArr = (v: unknown) => (Array.isArray(v) ? (v as unknown[]) : []);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Per-locale translation editor (FV-001 M2). Edits the row/setting `i18n` overlay
 * (`{ en: {field: value…}, sq: {…} }`) for the given fields. Admin UI stays Macedonian; only
 * content values are translated. Empty fields fall back to the MK base on the site.
 *
 * Pass `mk` (the base Macedonian values keyed by field) to show the source as a reference and to
 * align `list`/`rows` translations index-by-index with the MK items.
 */
export function I18nPanel({
  value,
  onChange,
  fields,
  mk,
}: {
  value: I18nData | undefined;
  onChange: (next: I18nData) => void;
  fields: I18nField[];
  mk?: Record<string, unknown>;
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
        const ref = mk?.[f.key];

        if (f.type === 'textarea') {
          return (
            <label key={f.key} className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">{f.label}</span>
              {ref ? <p className="mb-1 text-xs text-[var(--color-neutral-400)]">МК: {str(ref)}</p> : null}
              <textarea className={input} rows={2} value={str(v)} onChange={(e) => setField(f.key, e.target.value)} />
            </label>
          );
        }

        if (f.type === 'list') {
          const mkItems = asArr(ref) as string[];
          // Aligned editing when we know the MK items; otherwise a comma-separated fallback.
          if (mkItems.length) {
            const cur = asArr(v) as string[];
            return (
              <div key={f.key} className="text-sm">
                <span className="text-[var(--color-neutral-500)]">{f.label}</span>
                <div className="mt-1 space-y-1.5">
                  {mkItems.map((mkItem, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr] gap-2">
                      <div className="truncate rounded-md bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-400)]" title={mkItem}>{mkItem}</div>
                      <input className={input} value={str(cur[i])} placeholder="превод…" onChange={(e) => { const next = [...cur]; next[i] = e.target.value; setField(f.key, next); }} />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <label key={f.key} className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">{f.label}</span>
              <input className={input} value={toList(v)} onChange={(e) => setField(f.key, fromList(e.target.value))} placeholder="Одделено со запирки" />
            </label>
          );
        }

        if (f.type === 'rows') {
          const mkRows = asArr(ref) as Record<string, unknown>[];
          const cur = asArr(v) as Record<string, unknown>[];
          const sub = f.rowFields ?? [];
          return (
            <div key={f.key} className="text-sm">
              <span className="text-[var(--color-neutral-500)]">{f.label}</span>
              <div className="mt-1 space-y-2">
                {mkRows.map((mkRow, i) => (
                  <div key={i} className="rounded-md border border-[var(--color-neutral-200)] p-2">
                    {sub.map((sf) => (
                      <div key={sf.key} className="mb-1.5 last:mb-0">
                        <div className="truncate text-xs text-[var(--color-neutral-400)]" title={str(mkRow[sf.key])}>{sf.label} · МК: {str(mkRow[sf.key])}</div>
                        <input
                          className={input}
                          value={str(cur[i]?.[sf.key])}
                          placeholder="превод…"
                          onChange={(e) => { const next = cur.map((r) => ({ ...r })); next[i] = { ...(next[i] ?? {}), [sf.key]: e.target.value }; setField(f.key, next); }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // text (default)
        return (
          <label key={f.key} className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">{f.label}</span>
            {ref ? <p className="mb-1 text-xs text-[var(--color-neutral-400)]">МК: {str(ref)}</p> : null}
            <input className={input} value={str(v)} onChange={(e) => setField(f.key, e.target.value)} />
          </label>
        );
      })}
      <p className="text-xs text-[var(--color-neutral-400)]">Празно поле = се прикажува македонскиот текст на тој јазик.</p>
    </div>
  );
}
