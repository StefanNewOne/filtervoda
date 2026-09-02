import { CalendarClock, ShieldCheck, Truck, Wallet } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, text: '10 години гаранција' },
  { icon: Truck, text: 'Бесплатна монтажа' },
  { icon: CalendarClock, text: 'Достава низ цела Македонија' },
  { icon: Wallet, text: 'Плаќање во готово или на рати' },
];

export function TrustBar() {
  return (
    <div className="bg-[var(--color-trust-bg)] text-[var(--color-trust-fg)]">
      <div className="mx-auto grid max-w-[var(--content-max)] grid-cols-2 gap-3 px-4 py-4 md:grid-cols-4 md:px-6">
        {ITEMS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm font-medium">
            <Icon size={18} className="shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
