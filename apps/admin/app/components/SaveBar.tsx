import type { ReactNode } from 'react';
import type { SaveState } from '../lib/useSaveState';
import { Btn } from './ui';

/**
 * Sticky bottom save bar for long single-page editors. One consistent status readout plus an
 * optional „Прегледај на сајт" link, so the editor saves everything from one place.
 */
export function SaveBar({
  onSave,
  state,
  error,
  label = 'Зачувај',
  previewUrl,
  dirty,
  children,
}: {
  onSave: () => void;
  state: SaveState;
  error?: string | null;
  label?: string;
  previewUrl?: string;
  dirty?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-neutral-200)] bg-white/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-3 text-sm">
        {state === 'saving' && <span className="text-[var(--color-neutral-500)]">Се зачувува…</span>}
        {state === 'saved' && <span className="text-[var(--color-success-600)]">✓ Зачувано</span>}
        {state === 'error' && <span className="text-[var(--color-danger-600)]">✗ {error}</span>}
        {state === 'idle' && dirty && <span className="text-[var(--color-neutral-500)]">Незачувани промени</span>}
        {children}
      </div>
      <div className="flex items-center gap-2">
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 text-sm hover:bg-[var(--color-neutral-100)]"
          >
            Прегледај на сајт ↗
          </a>
        )}
        <Btn onClick={onSave} disabled={state === 'saving'}>{label}</Btn>
      </div>
    </div>
  );
}
