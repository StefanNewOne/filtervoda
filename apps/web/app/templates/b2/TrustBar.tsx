import { useT } from '../../i18n/context';
import type { TKey } from '../../i18n/types';

const ITEMS: TKey[] = ['trust.warranty10', 'trust.freeInstall', 'trust.delivery', 'trust.payment'];

/** Б-2 trust band: green gradient with light-green dots. */
export function TrustBar() {
  const t = useT();
  return (
    <div className="[background:linear-gradient(90deg,#0E5327_0%,#12692F_55%,#16803B_100%)]">
      <div className="mx-auto grid max-w-[1200px] gap-2.5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((key) => (
          <div key={key} className="flex items-center gap-2.5 text-[14px] font-bold text-white">
            <span className="size-[7px] shrink-0 rounded-full bg-[#7BE0A0]" />
            {t(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
