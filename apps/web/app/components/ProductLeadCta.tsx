import { Phone } from 'lucide-react';
import { useLeadModal } from './LeadModal';
import { Button } from './ui';

/** Product page CTA: opens the lead modal pre-selected to this product + a click-to-call. */
export function ProductLeadCta({ productId, productName }: { productId: string; productName: string }) {
  const { open } = useLeadModal();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button onClick={() => open({ productId, productName, type: 'B2C' })}>Побарај понуда</Button>
      <a href="tel:076676819" className="inline-flex items-center gap-2 font-semibold text-[var(--color-ink)]">
        <Phone size={18} /> Повикај 076/676/819
      </a>
    </div>
  );
}
