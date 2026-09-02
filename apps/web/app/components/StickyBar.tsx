import { MessageCircle, Phone, Send } from 'lucide-react';
import { useLeadModal } from './LeadModal';

/** Mobile sticky bottom bar: Повикај · Viber · Барање (PRD §А.5). Hidden on md+. */
export function StickyBar({ phones, viber }: { phones: string[]; viber?: string }) {
  const { open } = useLeadModal();
  const phone = phones[0];
  return (
    <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] grid grid-cols-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
      <a href={phone ? `tel:${phone}` : '#'} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs">
        <Phone size={20} /> Повикај
      </a>
      <a
        href={viber ? `viber://chat?number=${encodeURIComponent(viber)}` : '#'}
        className="flex min-h-14 flex-col items-center justify-center gap-0.5 border-x border-[var(--color-border)] text-xs"
      >
        <MessageCircle size={20} /> Viber
      </a>
      <button onClick={() => open()} className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-[var(--color-cta)] text-xs text-[var(--color-cta-fg)]">
        <Send size={20} /> Барање
      </button>
    </div>
  );
}
