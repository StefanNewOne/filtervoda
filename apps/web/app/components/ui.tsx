/**
 * Shared UI primitives. All visuals via tokens (no hardcoded colour/radius). Buttons ≥44px.
 */
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-cta)] px-6 py-3 text-base font-semibold transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60',
        variant === 'primary' && 'bg-[var(--color-cta)] text-[var(--color-cta-fg)] hover:brightness-95',
        variant === 'secondary' &&
          'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)]',
        variant === 'ghost' && 'text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)]',
        className,
      )}
      {...props}
    />
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--color-chip-bg)] px-3 py-1 text-sm text-[var(--color-chip-fg)]">
      {children}
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--color-success-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-success-600)]">
      {children}
    </span>
  );
}

export function Section({
  children,
  className,
  title,
  eyebrow,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className={clsx('mx-auto w-full max-w-[var(--content-max)] px-4 py-12 md:px-6 md:py-16', className)}>
      {eyebrow ? (
        <div className="mb-2 font-[family-name:var(--font-mono)] text-xs tracking-[var(--tracking-wider)] text-[var(--color-accent)] uppercase">
          {eyebrow}
        </div>
      ) : null}
      {title ? <h2 className="mb-6 text-2xl md:text-3xl">{title}</h2> : null}
      {children}
    </section>
  );
}

export function formatPrice(denari?: number): string {
  if (denari == null) return '';
  return `${new Intl.NumberFormat('mk-MK').format(denari)} ден.`;
}
