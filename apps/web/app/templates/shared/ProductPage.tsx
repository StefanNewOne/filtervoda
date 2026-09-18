import type { ProductDetailDto, PublicSettings } from '@filtervoda/shared';
import { telHref } from '@filtervoda/shared';
import { Phone } from 'lucide-react';
import { Link } from 'react-router';
import { LeadForm } from '../../components/LeadForm';
import { useLeadModal } from '../../components/LeadModal';
import { ProductGallery } from '../../components/ProductGallery';
import { fmtPrice, type Testimonial } from '../types';
import { compareRow } from '../compare';
import { useTemplate } from '../registry';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

/** Shared product page — identical structure across templates, styled per skin. */
export function ProductPage({ product: p, testimonials = [], settings }: { product: ProductDetailDto; testimonials?: Testimonial[]; settings?: PublicSettings }) {
  const tid = useTemplateId();
  const s = skinFor(tid);
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

      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1200px] px-5 pt-6 text-[13px] font-semibold text-[var(--color-muted)]" aria-label="Патека">
        <Link to="/" className="text-[var(--color-cta)]">Почетна</Link> <span className="mx-1">›</span>
        <Link to="/proizvodi" className="text-[var(--color-cta)]">Производи</Link> <span className="mx-1">›</span>
        <span>{p.name}</span>
      </nav>

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
            <a href={telHref(settings?.phones?.[0] ?? '076/676/819')} className={`inline-flex items-center gap-2 font-bold ${s.ink}`}><Phone size={18} /> Повикај {settings?.phones?.[0] ?? '076/676/819'}</a>
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

        {/* Б-3 „data" gauge panels — the navy dashboard motif that defines Паметна вода */}
        {tid === 'b3' && (
          <Section>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))]">
              {[
                { label: 'pH НА ИЗЛЕЗ', value: '8.6', unit: '', pct: '78%' },
                { label: 'TDS ПО ФИЛТРАЦИЈА', value: '012', unit: 'ppm', pct: '12%' },
                { label: 'ОТСТРАНУВАЊЕ', value: '95–99', unit: '%', pct: '96%' },
                { label: 'СОСТОЈБА НА ФИЛТРИ', value: 'OK', unit: '', pct: '64%' },
              ].map((g) => (
                <div key={g.label} className="rounded-[10px] border border-[#DCE4EE] bg-[#051227] p-[22px]">
                  <div className="font-[family-name:JetBrains_Mono] text-[11px] tracking-[0.14em] text-[#9FE9FA]">{g.label}</div>
                  <div className="mt-2.5 font-[family-name:JetBrains_Mono] text-[34px] font-bold text-[#45E0FF]">
                    {g.value}{g.unit && <span className="text-[14px] text-[#9FE9FA]"> {g.unit}</span>}
                  </div>
                  <div className="mt-3.5 h-1.5 rounded-[3px] bg-white/[0.12]"><div className="h-1.5 rounded-[3px] bg-[#45E0FF]" style={{ width: g.pct }} /></div>
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

        {(p.includedInPrice.length > 0 || p.maintenanceNote || p.filterSetPrice != null) && (
          <Section>
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
              {p.includedInPrice.length > 0 && (
                <div className={`rounded-[20px] border ${s.border} p-[30px]`}>
                  <H2>Што вклучува цената</H2>
                  <div className="mt-[18px] flex flex-col gap-2.5">
                    {p.includedInPrice.map((i) => <div key={i} className="text-[16px] text-[#46597A]">· {i}</div>)}
                  </div>
                </div>
              )}
              {(p.maintenanceNote || p.filterSetPrice != null) && (
                <div className={`rounded-[20px] border ${s.border} p-[30px]`}>
                  <H2>Одржување и филтри</H2>
                  {p.maintenanceNote && <p className="mt-[18px] text-[16px] leading-[1.6] text-[#46597A]">{p.maintenanceNote}</p>}
                  {p.filterSetPrice != null && (
                    <div className={`mt-5 rounded-[14px] ${s.softBg} px-[18px] py-4 text-[15px] font-bold text-[#21375A]`}>Сет филтри: {fmtPrice(p.filterSetPrice)}</div>
                  )}
                </div>
              )}
            </div>
          </Section>
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
          <Section><H2>Споредба со слични модели</H2>
            <div className={`mt-6 overflow-x-auto rounded-[18px] border ${s.border}`}>
              <table className="w-full min-w-[620px] border-collapse text-[15px]">
                <thead>
                  <tr className={`${s.softBg} text-left ${s.mono} text-[12px] tracking-[0.06em] text-[#55677F]`}>
                    <th className="px-[18px] py-[15px] font-medium">МОДЕЛ</th>
                    <th className="px-3.5 py-[15px] font-medium">СТЕПЕНИ</th>
                    <th className="px-3.5 py-[15px] font-medium">РЕЗЕРВОАР</th>
                    <th className="px-3.5 py-[15px] font-medium">ЦЕНА</th>
                    <th className="px-[18px] py-[15px] font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {[{ card: p, current: true }, ...p.related.map((r) => ({ card: r, current: false }))].map(({ card, current }) => {
                    const c = compareRow(card.chips);
                    const price = card.priceSale ?? card.priceRegular;
                    return (
                      <tr key={card.id} className={`border-t ${s.border}`}>
                        <th className={`px-[18px] py-[15px] text-left font-bold ${s.ink}`}>{card.name}</th>
                        <td className="px-3.5 py-[15px] text-[#46597A]">{c.stages}</td>
                        <td className="px-3.5 py-[15px] text-[#46597A]">{c.tank}</td>
                        <td className={`whitespace-nowrap px-3.5 py-[15px] font-bold ${s.ink}`}>{card.showPrice && price ? fmtPrice(price) : 'Побарај цена'}</td>
                        <td className={`px-[18px] py-[15px] text-[13px] font-bold ${s.accent}`}>{current ? 'Овој модел' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {testimonials.length > 0 && (
          <Section><H2>Што велат нашите клиенти</H2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Testimonials assigned to THIS product show first; then fill up to 3 with others. */}
              {[...testimonials]
                .sort((a, b) => Number(b.productId === p.id) - Number(a.productId === p.id))
                .slice(0, 3)
                .map((t) => (
                <figure key={t.id} className={`m-0 rounded-[18px] border ${s.border} p-7`}>
                  <div className="text-[14px] tracking-[0.2em] text-[var(--color-warning-500)]">{'★'.repeat(t.rating)}</div>
                  <blockquote className="mt-4 text-[16px] leading-[1.6] text-[#21375A]">„{t.text}"</blockquote>
                  <figcaption className="mt-4 text-[13px] font-bold text-[#55677F]">{t.name}{t.city ? `, ${t.city}` : ''}</figcaption>
                </figure>
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

        {/* Final CTA with inline form */}
        <section className="pb-24 pt-10">
          <div className={`grid gap-11 rounded-[var(--radius-card)] border ${s.border} ${s.softBg} p-11 md:grid-cols-2`}>
            <div>
              <H2>Побарајте понуда за {p.name}</H2>
              <p className={`mt-3.5 text-[17px] ${s.muted}`}>Оставете телефон — ќе ве контактираме во рок од еден работен ден со точна понуда и термин за бесплатна монтажа.</p>
              <a href={telHref(settings?.phones?.[0] ?? '076/676/819')} className={`mt-5 inline-block ${s.display} ${s.ink} text-[22px] font-medium`}>{settings?.phones?.[0] ?? '076/676/819'}</a>
            </div>
            <div className={`rounded-[var(--radius-card)] border ${s.border} bg-white p-[26px]`}>
              <LeadForm type="B2C" productId={p.id} phones={settings?.phones ?? []} viber={settings?.viber} />
            </div>
          </div>
        </section>
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
