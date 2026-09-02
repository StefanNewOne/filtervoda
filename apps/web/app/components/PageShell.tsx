import { Link } from 'react-router';
import { useTemplateId } from '../templates/context';
import { skinFor, type Skin } from '../templates/skin';

/** Active-template skin for shared route pages (mirrors ProductPage/B2bPage). */
export function useSkin(): Skin {
  return skinFor(useTemplateId());
}

export type Crumb = { label: string; to?: string };

/**
 * Shared page header — breadcrumb + display <h1> (+ optional intro), themed per template.
 * Replaces the generic <Section title> which rendered a small <h2>; the prototypes use a
 * display-scale <h1> and a breadcrumb on every interior page.
 */
export function PageHeader({
  crumbs,
  title,
  intro,
  s,
}: {
  crumbs: Crumb[];
  title: string;
  intro?: string;
  s: Skin;
}) {
  return (
    <>
      {crumbs.length > 0 && (
        <nav className="flex gap-2 pt-[26px] text-[13px] font-semibold text-[var(--color-muted)]" aria-label="Патека">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex gap-2">
              {c.to ? (
                <Link to={c.to} className="text-[var(--color-cta)]">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      )}
      <h1 className={`${s.display} ${s.ink} mt-4 text-[clamp(34px,4.4vw,60px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
        {title}
      </h1>
      {intro && <p className={`mt-4 max-w-[40em] text-[18px] leading-[1.55] ${s.muted}`}>{intro}</p>}
    </>
  );
}

/** Page container matching the prototype interior width/padding. */
export function PageWrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-[1200px] px-5 pb-[120px]">{children}</main>;
}
