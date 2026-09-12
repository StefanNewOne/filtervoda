import { telHref } from '@filtervoda/shared';
import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';
import { LeadForm } from '../../components/LeadForm';
import { HERO_H1_DEFAULT, HERO_H2_DEFAULT, STAGES, WHY_ITEMS, heroParts, type HomeProps } from '../types';
import { ArticlesSection, B2bTeaser } from '../shared/HomeSections';
import { ProductCard } from './ProductCard';
import { TrustBar } from './TrustBar';

/** Б-2 „Жива вода" — gradient hero, organic blobs, wave divider, uppercase Oswald, green CTA. */
export function Home({ featured, content, testimonials, posts, settings }: HomeProps) {
  const { open } = useLeadModal();
  const [h1a, h1b, h1c] = heroParts(content.heroH1 || HERO_H1_DEFAULT);
  const phone = settings.phones[0] ?? '076/676/819';
  const whyItems = content.whyItems?.length ? content.whyItems.map((w, i) => ({ n: String(i + 1).padStart(2, '0'), title: w.title, text: w.text })) : WHY_ITEMS;
  const stages = content.stages?.length ? content.stages.map((s, i) => ({ n: i + 1, name: s.name, text: s.text })) : STAGES;
  const heroChips = content.heroChips?.length ? content.heroChips : ['10 години гаранција', 'pH 8.5+', '6 степени на филтрација'];
  const heroImg = content.heroImage || featured[0]?.image?.url;
  const heroAlt = featured[0]?.image?.alt || 'Систем за филтрација на вода';

  return (
    <>
      {/* HERO — gradient + blobs + wave bottom */}
      <section className="relative overflow-hidden rounded-b-[70px] px-5 [background:linear-gradient(155deg,#04122B_0%,#0B3C8C_48%,#1E6FE8_100%)]">
        <span className="pointer-events-none absolute -right-[200px] -top-[260px] size-[700px] rounded-full [background:radial-gradient(circle,rgba(111,196,247,0.4),rgba(111,196,247,0)_68%)]" aria-hidden />
        <span className="pointer-events-none absolute -bottom-[200px] -left-[140px] size-[480px] rounded-full [background:radial-gradient(circle,rgba(123,224,160,0.22),rgba(123,224,160,0)_70%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 pb-[90px] pt-[76px] md:grid-cols-2">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(123,224,160,0.5)] bg-[rgba(123,224,160,0.14)] py-[7px] pl-2 pr-3.5 text-[13px] font-bold tracking-[0.02em] text-[#CFF3DC]">
              <span className="size-2 rounded-full bg-[#7BE0A0]" /> {content.heroBadge || 'Бесплатна монтажа низ цела Македонија'}
            </span>
            <h1 className="font-[family-name:Oswald] text-[clamp(42px,5.8vw,82px)] font-semibold uppercase leading-[1.06] text-white">
              {h1a}<span className="text-[#7BE0A0]">{h1b}</span>{h1c}
            </h1>
            <p className="mt-6 max-w-[30em] text-[19px] leading-[1.55] text-[#BFE3FA]">{content.heroH2 || HERO_H2_DEFAULT}</p>
            <div className="mt-[34px] flex flex-wrap gap-3">
              <button onClick={() => open({ type: 'ADVISOR' })} className="rounded-full bg-[#16803B] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(22,128,59,0.34)] transition hover:brightness-110">
                {content.heroCta || 'Побарај бесплатна консултација'}
              </button>
              <Link to="/proizvodi" className="rounded-full border border-[rgba(255,255,255,0.42)] px-7 py-[18px] text-[17px] font-bold text-white transition hover:bg-white/10">Види ги производите</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {heroChips.map((c) => (
                <span key={c} className="rounded-full border border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.1)] px-3.5 py-2.5 text-[13px] font-bold text-[#DCEEFC]">{c}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <span className="absolute -inset-x-6 -bottom-[18px] -top-[26px] [background:radial-gradient(circle_at_50%_40%,rgba(191,227,250,0.35),rgba(191,227,250,0)_70%)] [border-radius:46%_46%_40%_40%/34%_34%_58%_58%]" aria-hidden />
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[40px] [background:linear-gradient(180deg,#FFFFFF,#DFEFFC)] shadow-[0_44px_100px_rgba(0,0,0,0.34)]">
              {heroImg ? <img src={heroImg} alt={heroAlt} className="h-full w-full object-contain p-8" /> : <div aria-hidden />}
              <div className="absolute bottom-[22px] left-[22px] flex flex-wrap gap-2">
                <span className="rounded-full bg-[rgba(4,18,43,0.72)] px-3.5 py-[9px] text-[12px] font-extrabold text-white backdrop-blur-[8px]">6 степени</span>
                <span className="rounded-full bg-[rgba(4,18,43,0.72)] px-3.5 py-[9px] text-[12px] font-extrabold text-[#7BE0A0] backdrop-blur-[8px]">pH 8.5+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* WHY — gradient cards, outlined Oswald numbers */}
      <section className="mx-auto max-w-[1200px] px-5 pb-5 pt-[90px]">
        <h2 className="font-[family-name:Oswald] text-[clamp(30px,3.4vw,46px)] font-medium text-[#08182F]">{content.whyTitle || 'Зошто филтрирана вода?'}</h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((w) => (
            <div key={w.n} className="rounded-[26px] px-6 pb-[30px] pt-7 transition hover:-translate-y-1 [background:linear-gradient(180deg,#F2F8FF,#E2F0FC)]">
              <div className="font-[family-name:Oswald] text-[52px] font-light leading-none text-transparent [-webkit-text-stroke:1px_#0B6076]">{w.n}</div>
              <h3 className="mt-[18px] text-[20px] font-medium text-[#08182F]">{w.title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.55] text-[#56698A]">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1200px] px-5 pt-[84px]">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[family-name:Oswald] text-[clamp(30px,3.4vw,46px)] font-medium text-[#08182F]">{content.featuredTitle || 'Најбарани системи'}</h2>
          <Link to="/proizvodi" className="text-[16px] font-bold text-[#1156E0]">Сите производи →</Link>
        </div>
        <div className="mt-[34px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* STAGES — gradient box, horizontal scroll cards */}
      <section className="px-5 pt-[90px]">
        <div className="mx-auto max-w-[1200px] rounded-[40px] px-5 py-16 text-white [background:linear-gradient(145deg,#071A3A_0%,#0B3C8C_55%,#1E6FE8_100%)]">
          <div className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-[#6FC4F7]">КАКО ФУНКЦИОНИРА</div>
          <h2 className="mt-4 max-w-[22em] font-[family-name:Oswald] text-[clamp(28px,3.2vw,44px)] font-medium">{content.stagesTitle || 'Како функционира — 6 степени на филтрација'}</h2>
          <div className="mt-11 flex gap-3.5 overflow-x-auto pb-2">
            {stages.map((s) => (
              <div key={s.n} className="w-[268px] shrink-0 rounded-[26px] border border-[rgba(191,227,250,0.3)] bg-[rgba(255,255,255,0.08)] px-6 pb-[30px] pt-[26px]">
                <div className="flex items-center gap-3">
                  <span className="grid size-[26px] place-items-center rounded-full bg-[#6FC4F7] font-[family-name:Oswald] text-[12px] font-medium text-[#08182F]">{s.n}</span>
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
          <h2 className="font-[family-name:Oswald] text-[clamp(30px,3.4vw,46px)] font-medium text-[#08182F]">{content.testimonialsTitle || 'Што велат нашите клиенти'}</h2>
          <div className="mt-[34px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="m-0 rounded-[26px] border border-[#E4EDF9] bg-white p-7">
                <div className="text-[14px] tracking-[0.2em] text-[#0B6076]">{'★'.repeat(t.rating)}</div>
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
        <div className="grid gap-11 rounded-[34px] border border-[#D9E9FB] p-12 md:grid-cols-2 [background:linear-gradient(165deg,#F2F8FF,#DFEFFC)]">
          <div>
            <h2 className="font-[family-name:Oswald] text-[clamp(26px,2.8vw,38px)] font-medium text-[#08182F]">{content.advisorTitle || 'Не знаете кој систем ви одговара?'}</h2>
            <p className="mt-3.5 text-[17px] leading-[1.55] text-[#46597A]">{content.advisorText || 'Оставете телефон — ќе ве советуваме бесплатно.'}</p>
            <a href={telHref(phone)} className="mt-5 inline-block font-[family-name:Oswald] text-[22px] font-medium text-[#08182F]">{phone}</a>
          </div>
          <div className="rounded-[26px] border border-[#E4EDF9] bg-white p-[26px]">
            <LeadForm type="ADVISOR" phones={settings.phones} viber={settings.viber} />
          </div>
        </div>
      </section>
    </>
  );
}
