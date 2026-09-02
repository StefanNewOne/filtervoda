import { MessageCircle, Phone, Send } from 'lucide-react';
import { useLeadModal } from '../../components/LeadModal';

/** Б-1 mobile sticky bar: white blur, light-blue outline buttons + blue action. */
export function StickyBar({ phones, viber }: { phones: string[]; viber?: string }) {
  const { open } = useLeadModal();
  const phone = phones[0] ?? '076676819';
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#E4EDF9] bg-white/[0.94] px-3.5 py-2.5 shadow-[0_-8px_30px_rgba(8,24,47,0.08)] backdrop-blur-[14px] md:hidden">
      <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-2">
        <a href={`tel:${phone}`} className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[#D9E9FB] text-[14px] font-bold text-[#08182F]">
          <Phone size={17} /> Повикај
        </a>
        <a href={viber ? `viber://chat?number=${encodeURIComponent(viber)}` : '#'} className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[#D9E9FB] text-[14px] font-bold text-[#08182F]">
          <MessageCircle size={17} /> Viber
        </a>
        <button onClick={() => open()} className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#1156E0] text-[14px] font-bold text-white">
          <Send size={17} /> Барање
        </button>
      </div>
    </div>
  );
}
