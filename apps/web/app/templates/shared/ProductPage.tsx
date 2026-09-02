import type { ProductDetailDto } from '@filtervoda/shared';
import { Phone } from 'lucide-react';
import { useLeadModal } from '../../components/LeadModal';
import { ProductGallery } from '../../components/ProductGallery';
import { fmtPrice } from '../types';
import { useTemplate } from '../registry';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

/** Shared product page — identical structure across templates, styled per skin. */
export function ProductPage({ product: p }: { product: ProductDetailDto }) {
  const s = skinFor(useTemplateId());
  const T = useTemplate();
  const { open } = useLeadModal();
  const price = p.priceSale ?? p.priceRegular;
  const hasSale = p.priceSale != null && p.priceRegular != null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.tagline,
    image: p.gallery.map((g) => g.url),
    brand: { '@type': 'Brand', name: 'SPAR Company' },
    ...(p.showPrice && price ? { offers: { '@type': 'Offer', price, priceCurrency: 'MKD', availability: 'https://schema.org/InStock' } } : {}),
  };

  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`${s.display} ${s.ink} text-[clamp(24px,2.6vw,34px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>{children}</h2>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* Above the fold */}
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-8 md:grid-cols-2">
        <ProductGallery gallery={p.gallery} name={p.name} />
        <div>
          <div className="flex flex-wrap gap-2">
            {p.badges.map((b, i) => (
              <span key={b} className={i === 0 ? s.badgeGreen : s.badgeDark}>{b}</span>
            ))}
          </div>
          <h1 className={`${s.display} ${s.ink} mt-5 text-[clamp(30px,3.6vw,48px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>{p.name}</h1>
          {p.tagline && <p className={`${s.muted} mt-4 text-[19px] leading-[1.5]`}>{p.tagline}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            {p.chips.map((c) => <span key={c} className={s.chip}>{c}</span>)}
          </div>
          <div className={`mt-7 border-t ${s.border} pt-6`}>
            {p.showPrice ? (
              <div className="flex items-baseline gap-3">
                {hasSale && <span className="text-[18px] text-[#64748B] line-through">{fmtPrice(p.priceRegular)}</span>}
                <span className={`${s.priceFont} ${s.ink} text-[40px] font-medium tracking-[-0.04em]`}>{fmtPrice(price)}</span>
              </div>
            ) : <span className={`${s.accent} text-[20px] font-bold`}>Побарај цена</span>}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className={s.cta} onClick={() => open({ productId: p.id, productName: p.name, type: 'B2C' })}>Побарај понуда</button>
            <a href="tel:076676819" className={`inline-flex items-center gap-2 font-bold ${s.ink}`}><Phone size={18} /> Повикај 076/676/819</a>
          </div>
        </div>
      </div>

      <T.TrustBar />

      <div className="mx-auto max-w-[1200px] px-5">
        {p.idealFor.length > 0 && (
          <Section><H2>Идеален за</H2>
            <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {p.idealFor.map((i) => <div key={i} className={`rounded-[18px] border ${s.border} px-6 py-6 text-[16px] font-semibold text-[#21375A]`}>{i}</div>)}
            </div>
          </Section>
        )}

        {p.features.length > 0 && (
          <Section><H2>Клучни придобивки</H2>
            <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
              {p.features.map((f, i) => (
                <div key={i} className={`flex items-start gap-3.5 rounded-[18px] border ${s.border} px-6 py-6`}>
                  <span className={`mt-2 size-2 shrink-0 rounded-full ${s.accent.replace('text-', 'bg-')}`} />
                  <p className="text-[15px] leading-[1.55] text-[#56698A]">{f.text}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {p.stages.length > 0 && (
          <Section><H2>Како функционира</H2>
            <div className={`mt-6 overflow-hidden rounded-[18px] border ${s.border}`}>
              {p.stages.map((st) => (
                <div key={st.order} className={`grid grid-cols-[64px_1fr] border-b ${s.border} last:border-b-0`}>
                  <div className={`grid place-items-center ${s.softBg} ${s.display} ${s.accent} text-[15px] font-medium`}>{st.order}</div>
                  <div className="px-6 py-[22px]">
                    <div className={`font-semibold ${s.ink}`}>{st.name}</div>
                    {st.removes !== '—' && <div className="text-[14px] text-[#56698A]">Отстранува: {st.removes}</div>}
                    <div className="text-[14px] text-[#56698A]">{st.whyItMatters}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {p.specs.length > 0 && (
          <Section><H2>Техничка спецификација</H2>
            <div className={`mt-6 overflow-hidden rounded-[18px] border ${s.border}`}>
              {groupSpecs(p.specs).map((g) => (
                <div key={g.group}>
                  <div className={`${s.specHead} ${s.mono} px-6 py-3.5 text-[12px] tracking-[0.12em]`}>{g.group.toUpperCase()}</div>
                  {g.rows.map((r, i) => (
                    <div key={i} className={`flex justify-between gap-4 border-b ${s.border} px-6 py-3.5 text-sm last:border-b-0`}>
                      <span className="text-[#56698A]">{r.label}</span>
                      <span className={`font-bold ${s.ink}`}>{r.value}{r.unit ? ` ${r.unit}` : ''}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Section>
        )}

        {p.includedInPrice.length > 0 && (
          <Section><H2>Што вклучува цената</H2>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {p.includedInPrice.map((i) => <li key={i} className="flex items-center gap-2 text-[15px]"><span className="text-[#16803B]">✓</span> {i}</li>)}
            </ul>
          </Section>
        )}

        {p.maintenanceNote && (
          <Section><H2>Одржување и филтри</H2><p className={`mt-4 max-w-2xl ${s.muted}`}>{p.maintenanceNote}</p></Section>
        )}

        {p.faqs.length > 0 && (
          <Section><H2>Често поставувани прашања</H2>
            <div className={`mt-6 divide-y ${s.border} overflow-hidden rounded-[18px] border ${s.border}`}>
              {p.faqs.map((f, i) => (
                <details key={i} className="px-6 py-4"><summary className={`cursor-pointer font-semibold ${s.ink}`}>{f.question}</summary><p className="mt-2 text-[15px] text-[#56698A]">{f.answer}</p></details>
              ))}
            </div>
          </Section>
        )}

        {p.related.length > 0 && (
          <Section><H2>Слични производи</H2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.related.map((r) => <T.ProductCard key={r.id} product={r} />)}
            </div>
          </Section>
        )}
      </div>
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="py-10">{children}</section>;
}

function groupSpecs(specs: ProductDetailDto['specs']) {
  const map = new Map<string, ProductDetailDto['specs']>();
  for (const sp of specs) {
    if (!map.has(sp.group)) map.set(sp.group, []);
    map.get(sp.group)!.push(sp);
  }
  return [...map.entries()].map(([group, rows]) => ({ group, rows }));
}
