import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';
import { LeadForm } from '../../components/LeadForm';
import { HERO_H1_DEFAULT, HERO_H2_DEFAULT, STAGES, WHY_ITEMS, heroParts, type HomeProps } from '../types';
import { ProductCard } from './ProductCard';
import { TrustBar } from './TrustBar';

/** Б-1 „Кристално чисто" home — light, airy, ripple hero, dark navy stages box. */
export function Home({ featured, content, testimonials, faq, settings }: HomeProps) {
  const { open } = useLeadModal();
  const [h1a, h1b, h1c] = heroParts(content.heroH1 || HERO_H1_DEFAULT);
  const phone = settings.phones[0] ?? '076/676/819';

  return (
    <>
      {/* HERO */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-14 pt-[72px] md:grid-cols-2">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9E9FB] py-[7px] pl-2 pr-3.5 text-[13px] font-bold tracking-[0.02em] text-[#3C5375]">
            <span className="size-2 rounded-full bg-[#16803B]" /> Бесплатна монтажа низ цела Македонија
          </span>
          <h1 className="font-[family-name:Unbounded] text-[clamp(40px,5.2vw,74px)] font-medium leading-[1.02] tracking-[-0.03em] text-[#08182F]">
            {h1a}<span className="text-[#1156E0]">{h1b}</span>{h1c}
          </h1>
          <p className="mt-5 max-w-[30em] text-[19px] leading-[1.55] text-[#46597A]">{content.heroH2 || HERO_H2_DEFAULT}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => open({ type: 'ADVISOR' })} className="rounded-full bg-[#1156E0] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(17,86,224,0.3)] transition hover:bg-[#08182F]">
              {content.heroCta || 'Побарај бесплатна консултација'}
            </button>
            <Link to="/proizvodi" className="rounded-full border border-[#CFE2F7] bg-white px-7 py-[18px] text-[17px] font-bold text-[#08182F] transition hover:border-[#08182F]">Види ги производите</Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {['10 години гаранција', 'Бесплатна монтажа', 'Достава низ Македонија'].map((c) => (
              <span key={c} className="rounded-full border border-[#E4EDF9] bg-[#F2F8FF] px-3.5 py-2.5 text-[13px] font-bold text-[#3C5375]">{c}</span>
            ))}
          </div>
        </div>
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[28px] border border-[#E4EDF9] [background:radial-gradient(120%_100%_at_50%_30%,#FFFFFF_0%,#F2F8FF_55%,#E6F2FE_100%)]">
          <span className="fv-ripple absolute aspect-square w-[58%] rounded-full border border-[#9FD6F8]" aria-hidden />
          <span className="fv-ripple-2 absolute aspect-square w-[58%] rounded-full border border-[#9FD6F8]" aria-hidden />
          {featured[0]?.image ? (
            <img src={featured[0].image.url} alt={featured[0].image.alt} className="relative w-[80%] rounded-[18px] shadow-[0_26px_60px_rgba(8,24,47,0.16)]" />
          ) : (
            <div className="relative aspect-[4/5] w-[80%] rounded-[18px] bg-white/60" aria-hidden />
          )}
        </div>
      </section>

      <TrustBar />

      {/* WHY */}
      <section className="mx-auto max-w-[1200px] px-5 pb-5 pt-[90px]">
        <h2 className="font-[family-name:Unbounded] text-[clamp(30px,3.4vw,46px)] font-medium tracking-[-0.03em] text-[#08182F]">Зошто филтрирана вода?</h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_ITEMS.map((w) => (
            <div key={w.n} className="rounded-[20px] border border-[#E4EDF9] bg-white px-[22px] pb-7 pt-[26px] transition hover:-translate-y-[3px] hover:border-[#6FC4F7]">
              <div className="font-[family-name:Unbounded] text-[13px] font-medium tracking-[0.06em] text-[#0E7490]">{w.n}</div>
              <h3 className="mt-[18px] font-[family-name:Unbounded] text-[20px] font-medium text-[#08182F]">{w.title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.55] text-[#56698A]">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1200px] px-5 pt-[84px]">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[family-name:Unbounded] text-[clamp(30px,3.4vw,46px)] font-medium tracking-[-0.03em] text-[#08182F]">Најбарани системи</h2>
          <Link to="/proizvodi" className="text-[16px] font-bold text-[#1156E0]">Сите производи →</Link>
        </div>
        <div className="mt-[34px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 6 STAGES — dark navy box */}
      <section className="px-5 pt-[90px]">
        <div className="mx-auto max-w-[1160px] rounded-[32px] bg-[#08182F] px-5 py-16 text-white">
          <div className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-[#6FC4F7]">КАКО ФУНКЦИОНИРА</div>
          <h2 className="mt-4 max-w-[22em] font-[family-name:Unbounded] text-[clamp(28px,3.2vw,44px)] font-medium">Како функционира — 6 степени на филтрација</h2>
          <div className="mt-11 grid gap-px overflow-hidden rounded-[18px] border border-[rgba(111,196,247,0.22)] bg-[rgba(111,196,247,0.22)] sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.n} className="bg-[#08182F] px-6 pb-[30px] pt-[26px]">
                <div className="flex items-center gap-3">
                  <span className="grid size-[26px] place-items-center rounded-full bg-[#6FC4F7] font-[family-name:Unbounded] text-[12px] font-medium text-[#08182F]">{s.n}</span>
                  <h3 className="text-[17px] font-medium">{s.name}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#A9BFDC]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-5 pt-[90px]">
          <h2 className="font-[family-name:Unbounded] text-[clamp(30px,3.4vw,46px)] font-medium tracking-[-0.03em] text-[#08182F]">Што велат нашите клиенти</h2>
          <div className="mt-[34px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="m-0 rounded-[20px] border border-[#E4EDF9] bg-white p-7">
                <div className="text-[14px] tracking-[0.2em] text-[#0E7490]">{'★'.repeat(t.rating)}</div>
                <blockquote className="mt-4 text-[16px] leading-[1.6] text-[#21375A]">„{t.text}"</blockquote>
                <figcaption className="mt-[18px] text-[13px] font-bold text-[#55677F]">{t.name}{t.city ? `, ${t.city}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-[100px] pt-[90px]">
        <div className="grid gap-11 rounded-[28px] border border-[#D9E9FB] bg-[#F2F8FF] p-12 md:grid-cols-2">
          <div>
            <h2 className="font-[family-name:Unbounded] text-[clamp(26px,2.8vw,38px)] font-medium text-[#08182F]">{content.advisorTitle || 'Не знаете кој систем ви одговара?'}</h2>
            <p className="mt-3.5 text-[17px] leading-[1.55] text-[#46597A]">{content.advisorText || 'Оставете телефон — ќе ве советуваме бесплатно.'}</p>
            <a href={`tel:${phone}`} className="mt-5 inline-block font-[family-name:Unbounded] text-[22px] font-medium tracking-[-0.02em] text-[#08182F]">{phone}</a>
          </div>
          <div className="rounded-[20px] border border-[#E4EDF9] bg-white p-[26px]">
            <LeadForm type="ADVISOR" phones={settings.phones} viber={settings.viber} />
          </div>
        </div>
        {faq.length > 0 && (
          <div className="mx-auto mt-16 max-w-2xl divide-y divide-[#E4EDF9]">
            <h2 className="mb-4 font-[family-name:Unbounded] text-[clamp(26px,2.8vw,38px)] font-medium text-[#08182F]">Често поставувани прашања</h2>
            {faq.map((f, i) => (
              <details key={i} className="py-3">
                <summary className="cursor-pointer text-[17px] font-semibold text-[#08182F]">{f.question}</summary>
                <p className="mt-2 text-[16px] leading-[1.65] text-[#56698A]">{f.answer}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
