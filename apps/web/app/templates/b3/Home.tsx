import { telHref } from '@filtervoda/shared';
import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';
import { LeadForm } from '../../components/LeadForm';
import { HERO_H1_DEFAULT, HERO_H2_DEFAULT, STAGES, WHY_ITEMS, heroParts, type HomeProps } from '../types';
import { ArticlesSection, B2bTeaser } from '../shared/HomeSections';
import { ProductCard } from './ProductCard';
import { TrustBar } from './TrustBar';

const GRID_BG =
  'radial-gradient(120% 100% at 50% 25%, transparent, transparent), linear-gradient(rgba(69,224,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(69,224,255,0.05) 1px, transparent 1px)';

/** Б-3 „Паметна вода" — dark navy data theme, grid overlay, mono numbers, teal accents. */
export function Home({ featured, content, testimonials, posts, settings }: HomeProps) {
  const { open } = useLeadModal();
  const [h1a, h1b, h1c] = heroParts(content.heroH1 || HERO_H1_DEFAULT);
  const phone = settings.phones[0] ?? '076/676/819';
  const whyItems = content.whyItems?.length ? content.whyItems.map((w, i) => ({ n: String(i + 1).padStart(2, '0'), title: w.title, text: w.text })) : WHY_ITEMS;
  const stages = content.stages?.length ? content.stages.map((s, i) => ({ n: i + 1, name: s.name, text: s.text })) : STAGES;
  const heroImg = content.heroImage || featured[0]?.image?.url;
  const heroAlt = featured[0]?.image?.alt || 'Систем за филтрација на вода';

  return (
    <>
      {/* HERO — dark navy + grid overlay + data box */}
      <section className="border-b border-[rgba(69,224,255,0.18)] bg-[#051227] px-5" style={{ backgroundImage: GRID_BG, backgroundSize: 'auto, 64px 64px, 64px 64px' }}>
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 py-[76px] md:grid-cols-2">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-[6px] border border-[rgba(69,224,255,0.4)] bg-[rgba(69,224,255,0.08)] px-3.5 py-2 font-[family-name:JetBrains_Mono] text-[12px] font-medium uppercase tracking-[0.12em] text-[#9FE9FA]">
              <span className="size-[7px] rounded-full bg-[#45E0FF] shadow-[0_0_10px_#45E0FF]" /> {content.heroBadge || 'Бесплатна монтажа низ цела Македонија'}
            </span>
            <h1 className="font-[family-name:Onest] text-[clamp(38px,4.9vw,70px)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
              {h1a}<span className="text-[#45E0FF]">{h1b}</span>{h1c}
            </h1>
            <p className="mt-5 max-w-[30em] text-[19px] leading-[1.55] text-[#9BB0CC]">{content.heroH2 || HERO_H2_DEFAULT}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => open({ type: 'ADVISOR' })} className="rounded-[10px] bg-[#0E7490] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(14,116,144,0.32)] transition hover:brightness-110">
                {content.heroCta || 'Побарај бесплатна консултација'}
              </button>
              <Link to="/proizvodi" className="rounded-[10px] border border-[rgba(159,233,250,0.45)] px-7 py-[18px] text-[17px] font-bold text-white transition hover:bg-white/5">Види ги производите</Link>
            </div>
            <div className="mt-7 flex items-center gap-4 font-[family-name:JetBrains_Mono] text-[13px] tracking-[0.1em] text-[#9FE9FA]">
              <span><span className="text-[22px] font-bold text-[#45E0FF]">8.5+</span> pH</span>
              <span className="h-[26px] w-px bg-[rgba(69,224,255,0.28)]" />
              <span><span className="text-[22px] font-bold text-[#45E0FF]">6</span> СТЕПЕНИ</span>
              <span className="h-[26px] w-px bg-[rgba(69,224,255,0.28)]" />
              <span><span className="text-[22px] font-bold text-[#45E0FF]">95–99%</span> TDS</span>
            </div>
          </div>
          <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[12px] border border-[rgba(69,224,255,0.26)] [background:radial-gradient(120%_100%_at_50%_25%,#0C2542_0%,#06152C_70%)]">
            <span className="absolute inset-[14px] rounded-[8px] border border-[rgba(69,224,255,0.18)]" aria-hidden />
            <span className="absolute left-[18px] top-[18px] font-[family-name:JetBrains_Mono] text-[10px] tracking-[0.16em] text-[#45E0FF]">LIVE · TDS 012 ppm</span>
            <span className="absolute bottom-[18px] right-[18px] font-[family-name:JetBrains_Mono] text-[10px] tracking-[0.16em] text-[#45E0FF]">pH 8.6</span>
            {heroImg ? <img src={heroImg} alt={heroAlt} fetchPriority="high" loading="eager" decoding="async" className="w-[76%] rounded-[8px] shadow-[0_26px_60px_rgba(0,0,0,0.45)]" /> : <div aria-hidden />}
          </div>
        </div>
      </section>

      <TrustBar />

      {/* WHY — white cards with teal top border, mono numbers */}
      <section className="mx-auto max-w-[1200px] px-5 pb-5 pt-[90px]">
        <h2 className="text-[clamp(30px,3.4vw,46px)] font-medium text-[#071A3A]">{content.whyTitle || 'Зошто филтрирана вода?'}</h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((w) => (
            <div key={w.n} className="rounded-[10px] border border-[#DCE4EE] border-t-2 border-t-[#45E0FF] bg-white px-[22px] pb-7 pt-[26px] transition hover:border-[#0E7490] hover:shadow-[0_12px_30px_rgba(7,26,58,0.08)]">
              <div className="font-[family-name:JetBrains_Mono] text-[13px] font-medium tracking-[0.06em] text-[#0E7490]">{w.n}</div>
              <h3 className="mt-[18px] text-[20px] font-medium text-[#071A3A]">{w.title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.55] text-[#56698A]">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1200px] px-5 pt-[84px]">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[clamp(30px,3.4vw,46px)] font-medium text-[#071A3A]">{content.featuredTitle || 'Најбарани системи'}</h2>
          <Link to="/proizvodi" className="text-[16px] font-bold text-[#0E7490]">Сите производи →</Link>
        </div>
        <div className="mt-[34px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* STAGES — seamless grid on navy */}
      <section className="px-5 pt-[90px]">
        <div className="mx-auto max-w-[1200px] rounded-[32px] bg-[#071A3A] px-5 py-16 text-white">
          <div className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-[#45E0FF]">КАКО ФУНКЦИОНИРА</div>
          <h2 className="mt-4 max-w-[22em] text-[clamp(28px,3.2vw,44px)] font-medium">{content.stagesTitle || 'Како функционира — 6 степени на филтрација'}</h2>
          <div className="mt-11 grid gap-px overflow-hidden rounded-[10px] border border-[rgba(111,196,247,0.22)] bg-[rgba(111,196,247,0.22)] sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((s) => (
              <div key={s.n} className="bg-[#071A3A] px-6 pb-[30px] pt-[26px]">
                <div className="flex items-center gap-3">
                  <span className="grid size-[26px] place-items-center rounded-full bg-[#45E0FF] font-[family-name:JetBrains_Mono] text-[12px] font-medium text-[#071A3A]">{s.n}</span>
                  <h3 className="text-[17px] font-medium">{s.name}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#A9BFDC]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <B2bTeaser title={content.b2bTeaserTitle} bullets={content.b2bTeaserBullets} cta={content.b2bTeaserCta} image={content.b2bTeaserImage} />

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-5 pt-[90px]">
          <h2 className="text-[clamp(30px,3.4vw,46px)] font-medium text-[#071A3A]">{content.testimonialsTitle || 'Што велат нашите клиенти'}</h2>
          <div className="mt-[34px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="m-0 rounded-[10px] border border-[#DCE4EE] bg-white p-7">
                <div className="text-[14px] tracking-[0.2em] text-[#0E7490]">{'★'.repeat(t.rating)}</div>
                <blockquote className="mt-4 text-[16px] leading-[1.6] text-[#21375A]">„{t.text}"</blockquote>
                <figcaption className="mt-[18px] text-[13px] font-bold text-[#55677F]">{t.name}{t.city ? `, ${t.city}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <ArticlesSection posts={posts} title={content.articlesTitle} />

      {/* FINAL CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-[100px] pt-[90px]">
        <div className="grid gap-11 rounded-[8px] border border-[#CFD9E6] bg-[#F4F7FB] p-12 md:grid-cols-2">
          <div>
            <h2 className="text-[clamp(26px,2.8vw,38px)] font-medium text-[#071A3A]">{content.advisorTitle || 'Не знаете кој систем ви одговара?'}</h2>
            <p className="mt-3.5 text-[17px] leading-[1.55] text-[#46597A]">{content.advisorText || 'Оставете телефон — ќе ве советуваме бесплатно.'}</p>
            <a href={telHref(phone)} className="mt-5 inline-block font-[family-name:JetBrains_Mono] text-[22px] font-medium text-[#071A3A]">{phone}</a>
          </div>
          <div className="rounded-[10px] border border-[#DCE4EE] bg-white p-[26px]">
            <LeadForm type="ADVISOR" phones={settings.phones} viber={settings.viber} />
          </div>
        </div>
      </section>
    </>
  );
}
