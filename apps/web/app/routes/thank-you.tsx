import { telHref, type PublicSettings } from '@filtervoda/shared';
import { Check } from 'lucide-react';
import { useRouteLoaderData } from 'react-router';
import { useSkin } from '../components/PageShell';
import { LocaleLink, useT } from '../i18n/context';
import { stripLocale } from '../i18n/paths';
import { tm } from '../lib/meta';
import type { TKey } from '../i18n/types';
import type { Route } from './+types/thank-you';

export function meta({ location }: Route.MetaArgs) {
  const locale = stripLocale(location.pathname).locale;
  return [
    { title: tm(locale, 'meta.thankyou.title') },
    { name: 'robots', content: 'noindex' },
  ];
}

const STEPS: { n: string; key: TKey }[] = [
  { n: '01', key: 'thankyou.step1' },
  { n: '02', key: 'thankyou.step2' },
  { n: '03', key: 'thankyou.step3' },
];

export default function ThankYou() {
  const s = useSkin();
  const t = useT();
  const root = useRouteLoaderData('root') as { settings?: PublicSettings } | undefined;
  const c = root?.settings?.content;
  const phone = root?.settings?.phones?.[0] ?? '076/676/819';
  return (
    <main className="mx-auto max-w-[780px] px-5 pb-[140px] pt-24 text-center">
      <div className="mx-auto grid size-[74px] place-items-center rounded-full bg-[#16803B] text-white">
        <Check size={34} />
      </div>
      <h1 className={`${s.display} ${s.ink} mt-8 text-[clamp(34px,4.4vw,56px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
        {c?.thankyouTitle ?? t('thankyou.title')}
      </h1>
      <p className={`mt-5 text-[19px] leading-[1.6] ${s.muted}`}>
        {c?.thankyouText ?? t('thankyou.subtitle')}
      </p>

      <div className="mt-[44px] grid gap-3.5 text-left sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className={`border ${s.border} ${s.cardR} p-6`}>
            <div className={`${s.mono} text-[13px] font-bold ${s.accent}`}>{step.n}</div>
            <p className={`mt-3 ${s.display} text-[16px] font-medium ${s.ink}`}>{t(step.key)}</p>
          </div>
        ))}
      </div>

      <p className={`mt-10 text-[17px] ${s.muted}`}>
        {t('thankyou.urgent')}{' '}
        <a href={telHref(phone)} className={`font-semibold ${s.ink}`}>
          {phone}
        </a>
      </p>

      <div className="mt-[30px] flex flex-wrap justify-center gap-3">
        <LocaleLink to="/proizvodi" className={`inline-block min-h-[44px] ${s.cta}`}>
          {t('cta.seeProducts')}
        </LocaleLink>
        <LocaleLink to="/soveti" className={`inline-block min-h-[44px] ${s.outline}`}>
          {t('cta.readTips')}
        </LocaleLink>
      </div>
    </main>
  );
}
