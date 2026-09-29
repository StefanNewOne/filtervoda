import { useT } from '../../i18n/context';
import type { TKey } from '../../i18n/types';

const ITEMS: TKey[] = ['trust.warranty10', 'trust.freeInstall', 'trust.deliveryShort', 'trust.paymentShort'];

/** Б-3 trust band: dark navy #071A3A, JetBrains Mono with teal „/" prefix. */
export function TrustBar() {
  const t = useT();
  return (
    <div className="bg-[#071A3A]">
      <div className="mx-auto grid max-w-[1200px] gap-3 px-5 py-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((key) => (
          <div key={key} className="font-[family-name:JetBrains_Mono] text-[12px] font-medium uppercase tracking-[0.1em] text-[#C8DCF0]">
            <span className="text-[#45E0FF]">/</span>{t(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
