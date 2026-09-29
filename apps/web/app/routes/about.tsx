import { PageHeader, PageWrap, useSkin } from '../components/PageShell';
import { LocaleLink, useT } from '../i18n/context';
import { stripLocale } from '../i18n/paths';
import { api } from '../lib/api.server';
import type { Route } from './+types/about';

export function meta() {
  return [{ title: 'За нас — SPAR Company | filtervoda.mk' }];
}

const DEFAULT_IMAGE = '/img/products/cel-dom.png';

export async function loader({ request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  const settings = await api.settings(locale);
  return { settings };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const s = useSkin();
  const t = useT();
  const about = loaderData.settings.about ?? {};
  // Defaults (translated) keep the page intact when the admin hasn't filled „За нас" (content = M2).
  const stats =
    about.stats && about.stats.length
      ? about.stats
      : [
          { value: '10', label: t('about.stat1') },
          { value: '17', label: t('about.stat2') },
          { value: 'МК', label: t('about.stat3') },
        ];
  return (
    <PageWrap>
      <PageHeader
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]}
        title={about.title || t('about.defaultTitle')}
        intro={about.intro || t('about.defaultIntro')}
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
          src={about.image || DEFAULT_IMAGE}
          alt={t('about.imageAlt')}
          className={`w-full ${s.cardR} object-cover [aspect-ratio:4/3]`}
          loading="lazy"
        />
        <div>
          <h2 className={`${s.display} ${s.ink} text-[clamp(26px,2.8vw,36px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
            {about.whyTitle || t('about.whyTitle')}
          </h2>
          <p className={`mt-[18px] text-[17px] leading-[1.7] ${s.muted}`}>{about.whyText1 || t('about.whyText1')}</p>
          <p className={`mt-4 text-[17px] leading-[1.7] ${s.muted}`}>{about.whyText2 || t('about.whyText2')}</p>
          <LocaleLink to="/kontakt" className={`mt-[26px] inline-block min-h-[44px] ${s.cta}`}>
            {t('cta.contactUs')}
          </LocaleLink>
        </div>
      </div>
    </PageWrap>
  );
}
