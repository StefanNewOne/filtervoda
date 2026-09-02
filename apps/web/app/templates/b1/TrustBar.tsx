const ITEMS = ['10 години гаранција', 'Бесплатна монтажа', 'Достава низ цела Македонија', 'Плаќање во готово или на рати'];

/** Б-1 trust bar: light #FBFDFF band with teal dots. */
export function TrustBar() {
  return (
    <div className="border-y border-[#E4EDF9] bg-[#FBFDFF]">
      <div className="mx-auto grid max-w-[1200px] gap-2 px-5 py-[22px] sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((t) => (
          <div key={t} className="flex items-center gap-2.5 text-[14px] font-bold text-[#21375A]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#0E7490]" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
