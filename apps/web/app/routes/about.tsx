import { Link } from 'react-router';
import { PageHeader, PageWrap, useSkin } from '../components/PageShell';
import { api } from '../lib/api.server';
import type { Route } from './+types/about';

export function meta() {
  return [{ title: 'За нас — SPAR Company | filtervoda.mk' }];
}

// Defaults keep the page intact when the admin hasn't filled the „За нас" settings yet.
const DEFAULT_STATS = [
  { value: '10', label: 'години гаранција на секој систем' },
  { value: '17', label: 'производи во понудата' },
  { value: 'МК', label: 'достава и монтажа низ цела држава' },
];
const DEFAULTS = {
  title: 'Чиста вода за пиење = здрава иднина.',
  intro:
    'SPAR Company продава и монтира системи за филтрација на вода низ цела Македонија. Работиме со домаќинства и со фирми — од еден систем под мијалник до филтрација за цел објект.',
  image: '/img/products/cel-dom.png',
  whyTitle: 'Зошто SPAR',
  whyText1:
    'Монтажата е бесплатна и ја вршат наши техничари. Филтрите ги менуваме ние, на терен, според интервалот за секој степен. Плаќањето е во готово или на рати, а гаранцијата е десет години.',
  whyText2:
    'Сервисот е достапен низ цела Македонија — секогаш сте покриени, без разлика каде живеете или работите.',
};

export async function loader() {
  const settings = await api.settings();
  return { settings };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const s = useSkin();
  const about = loaderData.settings.about ?? {};
  const stats = about.stats && about.stats.length ? about.stats : DEFAULT_STATS;
  return (
    <PageWrap>
      <PageHeader
        crumbs={[{ label: 'Почетна', to: '/' }, { label: 'За нас' }]}
        title={about.title || DEFAULTS.title}
        intro={about.intro || DEFAULTS.intro}
        s={s}
      />

      <div className="mt-[50px] grid gap-[18px] sm:grid-cols-3">
        {stats.map((st) => (
          <div key={`${st.value}-${st.label}`} className={`border ${s.border} ${s.cardR} p-[34px]`}>
            <div className={`${s.display} text-[46px] font-medium tracking-[-0.04em] text-[var(--color-cta)]`}>{st.value}</div>
            <p className={`mt-3 text-[16px] ${s.muted}`}>{st.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-[70px] grid items-center gap-[44px] md:grid-cols-2">
        <img
          src={about.image || DEFAULTS.image}
          alt="Систем за филтрација во кујна"
          className={`w-full ${s.cardR} object-cover [aspect-ratio:4/3]`}
          loading="lazy"
        />
        <div>
          <h2 className={`${s.display} ${s.ink} text-[clamp(26px,2.8vw,36px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
            {about.whyTitle || DEFAULTS.whyTitle}
          </h2>
          <p className={`mt-[18px] text-[17px] leading-[1.7] ${s.muted}`}>{about.whyText1 || DEFAULTS.whyText1}</p>
          <p className={`mt-4 text-[17px] leading-[1.7] ${s.muted}`}>{about.whyText2 || DEFAULTS.whyText2}</p>
          <Link to="/kontakt" className={`mt-[26px] inline-block min-h-[44px] ${s.cta}`}>
            Контактирајте нè
          </Link>
        </div>
      </div>
    </PageWrap>
  );
}
