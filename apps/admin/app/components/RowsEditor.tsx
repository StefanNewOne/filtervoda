import { Btn } from './ui';

export interface RowColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea';
  /** CSS grid track for this column (e.g. '1fr', '80px'). Defaults to '1fr'. */
  width?: string;
}

/**
 * Repeatable-row editor: add / remove / reorder rows of a small object shape, each field
 * labelled. Replaces the raw „по еден во ред" / „a | b | c" textareas so non-technical editors
 * never have to remember a delimiter format (CLAUDE.md admin UX layer).
 */
export function RowsEditor<T extends Record<string, unknown>>({
  rows,
  columns,
  onChange,
  newRow,
  addLabel = '+ Ред',
}: {
  rows: T[];
  columns: RowColumn[];
  onChange: (rows: T[]) => void;
  newRow: () => T;
  addLabel?: string;
}) {
  const set = (i: number, key: string, v: unknown) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) return;
    next[i] = b;
    next[j] = a;
    onChange(next);
  };
  const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-2.5 py-1.5 text-sm';
  const grid = `${columns.map((c) => c.width ?? '1fr').join(' ')} auto`;

  return (
    <div className="space-y-2">
      <div className="hidden gap-2 px-1 text-xs text-[var(--color-neutral-500)] sm:grid" style={{ gridTemplateColumns: grid }}>
        {columns.map((c) => <span key={c.key}>{c.label}</span>)}
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid items-start gap-2" style={{ gridTemplateColumns: grid }}>
          {columns.map((c) =>
            c.type === 'textarea' ? (
              <textarea key={c.key} className={input} rows={2} placeholder={c.label} value={String(r[c.key] ?? '')} onChange={(e) => set(i, c.key, e.target.value)} />
            ) : (
              <input
                key={c.key}
                className={input}
                type={c.type ?? 'text'}
                placeholder={c.label}
                value={r[c.key] == null ? '' : String(r[c.key])}
                onChange={(e) => set(i, c.key, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
              />
            ),
          )}
          <div className="flex items-center gap-1.5 pt-1.5 text-[var(--color-neutral-400)]">
            <button type="button" onClick={() => move(i, -1)} title="Нагоре" className="hover:text-[var(--color-neutral-700)]">↑</button>
            <button type="button" onClick={() => move(i, 1)} title="Надолу" className="hover:text-[var(--color-neutral-700)]">↓</button>
            <button type="button" onClick={() => remove(i)} title="Избриши" className="hover:text-[var(--color-danger-600)]">×</button>
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-[var(--color-neutral-500)]">Сè уште нема ставки.</p>}
      <Btn variant="ghost" onClick={() => onChange([...rows, newRow()])}>{addLabel}</Btn>
    </div>
  );
}
