const ITEMS = ['10 години гаранција', 'Бесплатна монтажа', 'Достава низ Македонија', 'Готово или на рати'];

/** Б-3 trust band: dark navy #071A3A, JetBrains Mono with teal „/" prefix. */
export function TrustBar() {
  return (
    <div className="bg-[#071A3A]">
      <div className="mx-auto grid max-w-[1200px] gap-3 px-5 py-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((t) => (
          <div key={t} className="font-[family-name:JetBrains_Mono] text-[12px] font-medium uppercase tracking-[0.1em] text-[#C8DCF0]">
            <span className="text-[#45E0FF]">/</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
}
