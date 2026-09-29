import { useSearchParams } from 'react-router';
import { formatPrice } from '../components/ui';
import { PageHeader, useSkin } from '../components/PageShell';
import { useLeadModal } from '../components/LeadModal';
import { useT } from '../i18n/context';
import { stripLocale } from '../i18n/paths';
import { api } from '../lib/api.server';
import { compareRow } from '../templates/compare';
import { useTemplate } from '../templates/registry';
import type { Route } from './+types/catalog';

export function meta({ data }: Route.MetaArgs) {
  const site = data?.siteUrl ?? '';
  const title = 'Производи — филтри и системи за вода | filtervoda.mk';
  const desc = 'Системи за филтрација на вода: реверзна осмоза, диспензери, филтрација за цел дом, заштита од бигор, мерачи.';
  const canonical = site ? `${site}/proizvodi` : undefined;
  return [
    { title },
    { name: 'description', content: desc },
    ...(canonical ? [{ tagName: 'link', rel: 'canonical', href: canonical }] : []),
    { property: 'og:title', content: title },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: 'website' },
    ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  const [products, categories] = await Promise.all([api.products(undefined, locale), api.categories(locale)]);
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return { products, categories, siteUrl };
}

export default function Catalog({ loaderData }: Route.ComponentProps) {
  const { products, categories } = loaderData;
  const { ProductCard } = useTemplate();
  const s = useSkin();
  const { open } = useLeadModal();
  const t = useT();
  // Filter is URL-driven (?cat=slug) so footer/category links deep-link into a filtered view.
  const [params, setParams] = useSearchParams();
  const active = params.get('cat') ?? 'all';
  const setActive = (key: string) =>
    setParams(key === 'all' ? {} : { cat: key }, { preventScrollReset: true });
  const shown = active === 'all' ? products : products.filter((p) => p.categorySlug === active);

  const chips: { key: string; label: string }[] = [
    { key: 'all', label: t('catalog.all') },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ];

  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-[120px]">
      <PageHeader
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.products') }]}
        title={t('nav.products')}
        intro={t('catalog.intro')}
        s={s}
      />

      {/* Category chips */}
      <div className={`mt-[34px] flex flex-wrap gap-2 border-b ${s.border} pb-[18px]`}>
        {chips.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              aria-pressed={isActive}
              className={`min-h-[44px] rounded-full border px-[18px] py-[11px] text-[14px] font-bold transition ${
                isActive
                  ? `${s.accent} border-current ${s.softBg}`
                  : `${s.muted} ${s.border} bg-transparent`
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Product grid — 1-up on mobile, auto-fit above */}
      {shown.length > 0 ? (
        <div className="mt-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className={`mt-[30px] rounded-[var(--radius-card)] border border-dashed ${s.border} px-5 py-[60px] text-center`}>
          <h3 className={`text-[20px] font-medium ${s.ink}`}>{t('catalog.empty')}</h3>
          <p className={`mt-[10px] text-[15px] ${s.muted}`}>{t('catalog.emptyText')}</p>
          <button
            type="button"
            onClick={() => open()}
            className={`mt-5 min-h-[44px] ${s.cta}`}
          >
            {t('cta.getOffer')}
          </button>
        </div>
      )}

      {/* Comparison table */}
      {shown.length > 1 && (
        <section className="mt-20">
          <h2 className={`${s.display} ${s.ink} text-[clamp(26px,2.8vw,38px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
            {t('catalog.compareTitle')}
          </h2>
          <p className={`mt-3 text-[15px] ${s.muted}`}>{t('catalog.compareHint')}</p>
          <div className={`mt-6 overflow-x-auto rounded-[20px] border ${s.border}`}>
            <table className="w-full min-w-[860px] border-collapse text-[14px]">
              <thead>
                <tr className={`${s.softBg} text-left`}>
                  <th className={`sticky left-0 ${s.softBg} px-[18px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.model')}</th>
                  <th className={`px-[14px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.stages')}</th>
                  <th className={`px-[14px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.tank')}</th>
                  <th className={`px-[14px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.display')}</th>
                  <th className={`px-[14px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.ph')}</th>
                  <th className={`px-[14px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.warranty')}</th>
                  <th className={`px-[18px] py-4 ${s.mono} text-[12px] font-medium tracking-[0.06em] ${s.muted}`}>{t('catalog.col.price')}</th>
                </tr>
              </thead>
              <tbody>
                {shown.slice(0, 12).map((p) => {
                  const c = compareRow(p.chips);
                  return (
                    <tr key={p.id} className={`border-t ${s.border}`}>
                      <th className={`sticky left-0 whitespace-nowrap border-r bg-[var(--color-background)] px-[18px] py-4 text-left font-bold ${s.border} ${s.ink}`}>
                        {p.name}
                      </th>
                      <td className={`px-[14px] py-4 ${s.muted}`}>{c.stages}</td>
                      <td className={`px-[14px] py-4 ${s.muted}`}>{c.tank}</td>
                      <td className={`px-[14px] py-4 ${s.muted}`}>{c.display}</td>
                      <td className={`px-[14px] py-4 ${s.muted}`}>{c.ph}</td>
                      <td className={`px-[14px] py-4 ${s.muted}`}>{t('catalog.years10')}</td>
                      <td className={`whitespace-nowrap px-[18px] py-4 font-bold ${s.ink}`}>
                        {p.showPrice ? formatPrice(p.priceSale ?? p.priceRegular) : t('card.askPrice')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Advisor CTA band */}
      <section className={`mt-[70px] flex flex-wrap items-center justify-between gap-6 rounded-[24px] border ${s.border} ${s.softBg} p-10`}>
        <div>
          <h3 className={`${s.display} ${s.ink} text-[24px] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
            {t('catalog.advisorTitle')}
          </h3>
          <p className={`mt-2 text-[16px] ${s.muted}`}>{t('catalog.advisorText')}</p>
        </div>
        <button type="button" onClick={() => open({ type: 'ADVISOR' })} className={`min-h-[44px] ${s.cta}`}>
          {t('catalog.advisorCta')}
        </button>
      </section>
    </main>
  );
}
