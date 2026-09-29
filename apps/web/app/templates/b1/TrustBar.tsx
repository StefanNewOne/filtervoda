import { useT } from '../../i18n/context';
import type { TKey } from '../../i18n/types';

const ITEMS: TKey[] = ['trust.warranty10', 'trust.freeInstall', 'trust.delivery', 'trust.payment'];

/** Б-1 trust bar: light #FBFDFF band with teal dots. */
export function TrustBar() {
  const t = useT();
  return (
    <div className="border-y border-[#E4EDF9] bg-[#FBFDFF]">
      <div className="mx-auto grid max-w-[1200px] gap-2 px-5 py-[22px] sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((key) => (
          <div key={key} className="flex items-center gap-2.5 text-[14px] font-bold text-[#21375A]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#0E7490]" />
            {t(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
