import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-lg border border-[var(--color-neutral-200)] bg-white p-5', className)}>{children}</div>;
}

/** One-line helper text under a field/section — used everywhere to explain what goes where. */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{children}</p>;
}

/** A titled section block with an optional explanation — the building block of single-page editors. */
export function SectionCard({ title, hint, children, id }: { title: string; hint?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-lg border border-[var(--color-neutral-200)] bg-white p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <Hint>{hint}</Hint>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** „Прегледај на сајт" — opens the matching public page in a new tab (same origin). */
export function PreviewLink({ to }: { to: string }) {
  return (
    <a
      href={to}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-9 items-center rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 text-sm hover:bg-[var(--color-neutral-100)]"
    >
      Прегледај на сајт ↗
    </a>
  );
}

export function Btn({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-60',
        variant === 'primary' && 'bg-[var(--color-brand-600)] text-white hover:brightness-95',
        variant === 'ghost' && 'border border-[var(--color-neutral-200)] bg-white hover:bg-[var(--color-neutral-100)]',
        variant === 'danger' && 'bg-[var(--color-danger-600)] text-white hover:brightness-95',
        className,
      )}
      {...props}
    />
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-neutral-200)] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-neutral-200)] text-left text-xs text-[var(--color-neutral-500)]">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
    CONTACTED: 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]',
    OFFER_SENT: 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]',
    WON: 'bg-[var(--color-success-100)] text-[var(--color-success-600)]',
    INSTALLED: 'bg-[var(--color-success-100)] text-[var(--color-success-600)]',
    LOST: 'bg-[var(--color-danger-100)] text-[var(--color-danger-600)]',
    SPAM: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
  };
  return <span className={clsx('inline-block rounded-full px-2 py-0.5 text-xs font-medium', colors[status] ?? 'bg-[var(--color-neutral-100)]')}>{status}</span>;
}
