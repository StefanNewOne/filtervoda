import { telHref, viberHref } from '@filtervoda/shared';
import { MessageCircle, Phone, Send } from 'lucide-react';
import { useLeadModal } from '../../components/LeadModal';
import { useT } from '../../i18n/context';

/** Б-1 mobile sticky bar: white blur, light-blue outline buttons + blue action. */
export function StickyBar({ phones, viber }: { phones: string[]; viber?: string }) {
  const { open } = useLeadModal();
  const t = useT();
  const phone = phones[0] ?? '076676819';
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#E4EDF9] bg-white/[0.94] px-3 py-2.5 shadow-[0_-8px_30px_rgba(8,24,47,0.08)] backdrop-blur-[14px] md:hidden">
      <div className="grid grid-cols-3 gap-1.5">
        <a href={telHref(phone)} className="flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#D9E9FB] text-[14px] font-bold text-[#08182F]">
          <Phone size={17} className="shrink-0" /> {t('cta.call')}
        </a>
        <a href={viber ? viberHref(viber) : '#'} className="flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#D9E9FB] text-[14px] font-bold text-[#08182F]">
          <MessageCircle size={17} className="shrink-0" /> {t('cta.viber')}
        </a>
        <button onClick={() => open()} className="flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-cta)] text-[14px] font-bold text-[var(--color-cta-fg)]">
          <Send size={17} className="shrink-0" /> {t('cta.request')}
        </button>
      </div>
    </div>
  );
}
