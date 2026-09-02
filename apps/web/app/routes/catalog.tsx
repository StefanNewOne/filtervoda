import { useState } from 'react';
import { Link } from 'react-router';
import { Section, formatPrice } from '../components/ui';
import { api } from '../lib/api.server';
import { compareRow } from '../templates/compare';
import { useTemplate } from '../templates/registry';
import type { Route } from './+types/catalog';

export function meta() {
  return [
    { title: 'Производи — филтри и системи за вода | filtervoda.mk' },
    { name: 'description', content: 'Системи за филтрација на вода: реверзна осмоза, диспензери, филтрација за цел дом, заштита од бигор, мерачи.' },
  ];
}

export async function loader() {
  const [products, categories] = await Promise.all([api.products(), api.categories()]);
  return { products, categories };
}

export default function Catalog({ loaderData }: Route.ComponentProps) {
  const { products, categories } = loaderData;
  const { ProductCard } = useTemplate();
  const [active, setActive] = useState<string>('all');
  const shown = active === 'all' ? products : products.filter((p) => p.categorySlug === active);

  return (
    <Section title="Производи">
      <nav className="-mt-2 mb-4 text-[13px] font-semibold text-[var(--color-muted)]" aria-label="Патека">
        <Link to="/" className="text-[var(--color-cta)]">Почетна</Link> <span className="mx-1">›</span> <span>Производи</span>
      </nav>
      <p className="mb-6 max-w-[44em] text-[18px] text-[var(--color-muted)]">
        Системи за филтрација на вода: реверзна осмоза, диспензери, филтрација за цел дом, заштита од бигор и мерачи — со бесплатна монтажа и 10 години гаранција.
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive('all')}
          className={`rounded-[var(--radius-chip)] border px-4 py-2 text-sm ${active === 'all' ? 'border-[var(--color-cta)] bg-[var(--color-chip-bg)]' : 'border-[var(--color-border)]'}`}
        >
          Сите
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.slug)}
            className={`rounded-[var(--radius-chip)] border px-4 py-2 text-sm ${active === c.slug ? 'border-[var(--color-cta)] bg-[var(--color-chip-bg)]' : 'border-[var(--color-border)]'}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {shown.length === 0 && <p className="text-[var(--color-muted)]">Нема производи во оваа категорија.</p>}

      {shown.length > 1 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl">Споредба на модели</h2>
          <div className="overflow-x-auto rounded-[18px] border border-[var(--color-border)]">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-chip-bg)] text-left font-[family-name:var(--font-mono)] text-[12px] tracking-[0.06em] text-[var(--color-muted)]">
                  <th className="sticky left-0 bg-[var(--color-chip-bg)] px-4 py-3.5 font-medium">МОДЕЛ</th>
                  <th className="px-4 py-3.5 font-medium">СТЕПЕНИ</th>
                  <th className="px-4 py-3.5 font-medium">РЕЗЕРВОАР</th>
                  <th className="px-4 py-3.5 font-medium">ДИСПЛЕЈ</th>
                  <th className="px-4 py-3.5 font-medium">pH</th>
                  <th className="px-4 py-3.5 font-medium">ГАРАНЦИЈА</th>
                  <th className="px-4 py-3.5 font-medium">ЦЕНА</th>
                </tr>
              </thead>
              <tbody>
                {shown.slice(0, 12).map((p) => {
                  const c = compareRow(p.chips);
                  return (
                    <tr key={p.id} className="border-t border-[var(--color-border)]">
                      <td className="sticky left-0 bg-[var(--color-background)] px-4 py-3.5 font-semibold text-[var(--color-foreground)]">{p.name}</td>
                      <td className="px-4 py-3.5 text-[var(--color-muted)]">{c.stages}</td>
                      <td className="px-4 py-3.5 text-[var(--color-muted)]">{c.tank}</td>
                      <td className="px-4 py-3.5 text-[var(--color-muted)]">{c.display}</td>
                      <td className="px-4 py-3.5 text-[var(--color-muted)]">{c.ph}</td>
                      <td className="px-4 py-3.5 text-[var(--color-muted)]">10 год.</td>
                      <td className="px-4 py-3.5 font-semibold text-[var(--color-foreground)]">{p.showPrice ? formatPrice(p.priceSale ?? p.priceRegular) : 'Побарај цена'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-chip-bg)] p-8">
        <div>
          <h3 className="text-[24px] font-medium text-[var(--color-foreground)]">Не знаете кој систем ви одговара?</h3>
          <p className="mt-1 text-[16px] text-[var(--color-muted)]">Оставете телефон — ќе ве советуваме бесплатно.</p>
        </div>
        <Link to="/kontakt" className="rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-7 py-4 font-bold text-[var(--color-cta-fg)]">Побарај консултација</Link>
      </div>
    </Section>
  );
}
