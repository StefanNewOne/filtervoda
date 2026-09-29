import { LOCALE_LABELS, PREFIXED_LOCALES, type Locale } from '@filtervoda/shared';
import { useState } from 'react';
import type { I18nData } from './I18nPanel';

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** A row (spec/stage) carrying its own per-locale `i18n` overlay. */
export type I18nRow = Record<string, unknown> & { i18n?: I18nData };

/**
 * Per-locale editor for a list of DB rows that each hold their own `i18n` (product specs, stages).
 * Edits `row.i18n[locale][field]` in place, aligned to the MK row it translates, and returns the
 * updated rows via onChange. Admin stays MK; only the translated values are edited.
 */
export function I18nRows({
  rows,
  onChange,
  fields,
  emptyHint,
}: {
  rows: I18nRow[];
  onChange: (rows: I18nRow[]) => void;
  fields: { key: string; label: string }[];
  emptyHint?: string;
}) {
  const [locale, setLocale] = useState<Locale>(PREFIXED_LOCALES[0]);

  const setCell = (rowIdx: number, field: string, val: string) => {
    const next = rows.map((r) => ({ ...r, i18n: r.i18n ? { ...r.i18n } : {} }));
    const row = next[rowIdx];
    if (!row) return;
    const cur = (row.i18n as I18nData)[locale] ?? {};
    (row.i18n as I18nData)[locale] = { ...cur, [field]: val };
    onChange(next);
  };

  if (!rows.length) return <p className="text-sm text-[var(--color-neutral-400)]">{emptyHint ?? 'Нема ставки за преведување.'}</p>;

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
      <div className="space-y-2">
        {rows.map((row, i) => {
          const loc = ((row.i18n as I18nData | undefined)?.[locale] ?? {}) as Record<string, unknown>;
          return (
            <div key={i} className="rounded-md border border-[var(--color-neutral-200)] p-2">
              {fields.map((f) => (
                <div key={f.key} className="mb-1.5 last:mb-0">
                  <div className="truncate text-xs text-[var(--color-neutral-400)]" title={str(row[f.key])}>{f.label} · МК: {str(row[f.key])}</div>
                  <input className={input} value={str(loc[f.key])} placeholder="превод…" onChange={(e) => setCell(i, f.key, e.target.value)} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-neutral-400)]">Празно поле = се прикажува македонскиот текст.</p>
    </div>
  );
}
