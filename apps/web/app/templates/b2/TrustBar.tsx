const ITEMS = ['10 години гаранција', 'Бесплатна монтажа', 'Достава низ цела Македонија', 'Плаќање во готово или на рати'];

/** Б-2 trust band: green gradient with light-green dots. */
export function TrustBar() {
  return (
    <div className="[background:linear-gradient(90deg,#0E5327_0%,#12692F_55%,#16803B_100%)]">
      <div className="mx-auto grid max-w-[1200px] gap-2.5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((t) => (
          <div key={t} className="flex items-center gap-2.5 text-[14px] font-bold text-white">
            <span className="size-[7px] shrink-0 rounded-full bg-[#7BE0A0]" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
