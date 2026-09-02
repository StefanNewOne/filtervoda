import { Link } from 'react-router';
import { useLeadModal } from './LeadModal';
import { Button } from './ui';

/** Hero CTA pair — primary opens the lead modal, secondary links to the catalogue. */
export function HomeCta() {
  const { open } = useLeadModal();
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button onClick={() => open({ type: 'ADVISOR' })}>Побарај бесплатна консултација</Button>
      <Link
        to="/proizvodi"
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-cta)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)]"
      >
        Види ги производите
      </Link>
    </div>
  );
}
