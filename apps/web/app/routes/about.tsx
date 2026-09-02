import { Link } from 'react-router';
import { PageHeader, PageWrap, useSkin } from '../components/PageShell';

export function meta() {
  return [{ title: 'За нас — SPAR Company | filtervoda.mk' }];
}

const STATS = [
  { n: '10', t: 'години гаранција на секој систем' },
  { n: '17', t: 'производи во понудата' },
  { n: 'МК', t: 'достава и монтажа низ цела држава' },
];

export default function About() {
  const s = useSkin();
  return (
    <PageWrap>
      <PageHeader
        crumbs={[{ label: 'Почетна', to: '/' }, { label: 'За нас' }]}
        title="Чиста вода за пиење = здрава иднина."
        intro="SPAR Company продава и монтира системи за филтрација на вода низ цела Македонија. Работиме со домаќинства и со фирми — од еден систем под мијалник до филтрација за цел објект."
        s={s}
      />

      <div className="mt-[50px] grid gap-[18px] sm:grid-cols-3">
        {STATS.map((st) => (
          <div key={st.n} className={`border ${s.border} ${s.cardR} p-[34px]`}>
            <div className={`${s.display} text-[46px] font-medium tracking-[-0.04em] text-[var(--color-cta)]`}>{st.n}</div>
            <p className={`mt-3 text-[16px] ${s.muted}`}>{st.t}</p>
          </div>
        ))}
      </div>

      <div className="mt-[70px] grid items-center gap-[44px] md:grid-cols-2">
        <img
          src="/img/products/cel-dom.png"
          alt="Систем за филтрација во кујна"
          className={`w-full ${s.cardR} object-cover [aspect-ratio:4/3]`}
          loading="lazy"
        />
        <div>
          <h2 className={`${s.display} ${s.ink} text-[clamp(26px,2.8vw,36px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>Зошто SPAR</h2>
          <p className={`mt-[18px] text-[17px] leading-[1.7] ${s.muted}`}>
            Монтажата е бесплатна и ја вршат наши техничари. Филтрите ги менуваме ние, на терен, според интервалот за секој степен. Плаќањето е во готово или на рати, а гаранцијата е десет години.
          </p>
          <p className={`mt-4 text-[17px] leading-[1.7] ${s.muted}`}>
            Сервисот е достапен низ цела Македонија — секогаш сте покриени, без разлика каде живеете или работите.
          </p>
          <Link to="/kontakt" className={`mt-[26px] inline-block min-h-[44px] ${s.cta}`}>
            Контактирајте нè
          </Link>
        </div>
      </div>
    </PageWrap>
  );
}
