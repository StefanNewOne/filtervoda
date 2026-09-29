import { telHref, viberHref } from '@filtervoda/shared';
import { LeadForm } from '../components/LeadForm';
import { PageHeader, PageWrap, useSkin } from '../components/PageShell';
import { useT } from '../i18n/context';
import { stripLocale } from '../i18n/paths';
import { api } from '../lib/api.server';
import type { Route } from './+types/contact';

export function meta() {
  return [{ title: 'Контакт | filtervoda.mk' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  return { settings: await api.settings(locale) };
}

export default function Contact({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const s = useSkin();
  const t = useT();

  const firstPhone = settings.phones[0];
  const viberTarget = settings.viber ?? (firstPhone ? firstPhone.replace(/\D/g, '') : undefined);
  const viberLink = viberTarget ? viberHref(viberTarget) : undefined;
  const workingHours = settings.workingHours ?? t('contact.defaultHours');

  return (
    <PageWrap>
      <PageHeader crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }]} title={t('nav.contact')} s={s} />

      <div className="mt-[44px] grid items-start gap-12 md:grid-cols-2">
        <div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {settings.phones.map((p, i) => (
              <a key={p} href={telHref(p)} className={`block min-h-[44px] border ${s.border} ${s.cardR} p-6`}>
                <div className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted}`}>{i === 0 ? t('contact.phone') : `${t('contact.phone')} ${i + 1}`}</div>
                <div className={`mt-2.5 ${s.display} text-[20px] font-medium ${s.ink}`}>{p}</div>
              </a>
            ))}
            {viberLink && (
              <a href={viberLink} className={`block min-h-[44px] border ${s.border} ${s.cardR} p-6`}>
                <div className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted}`}>{t('contact.viber')}</div>
                <div className={`mt-2.5 text-[17px] font-bold ${s.ink}`}>{t('contact.viberWrite')}</div>
              </a>
            )}
            <div className={`border ${s.border} ${s.cardR} p-6`}>
              <div className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted}`}>{t('contact.hours')}</div>
              <div className="mt-2.5 text-[15px] font-semibold text-[#21375A]">{workingHours}</div>
            </div>
            {settings.emails.map((e) => (
              <a key={e} href={`mailto:${e}`} className={`block min-h-[44px] border ${s.border} ${s.cardR} p-6`}>
                <div className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted}`}>{t('contact.email')}</div>
                <div className={`mt-2.5 text-[17px] font-semibold ${s.ink}`}>{e}</div>
              </a>
            ))}
          </div>
          {/* Map placeholder — striped dashed box (prototype) */}
          <div
            className={`mt-4 grid aspect-[16/10] place-items-center ${s.cardR} border border-dashed border-[#B7D6F2] [background-image:repeating-linear-gradient(135deg,#E8F2FD_0_10px,#F6FAFF_10px_20px)]`}
            aria-hidden
          >
            <span className={`${s.mono} text-[11px] ${s.muted}`}>{settings.address ?? t('contact.defaultAddress')}</span>
          </div>
        </div>
        <div className={`border ${s.border} ${s.cardR} p-8`}>
          <h2 className={`${s.display} ${s.ink} text-[24px] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>{t('contact.writeToUs')}</h2>
          <div className="mt-4">
            <LeadForm type="CONTACT" phones={settings.phones} viber={settings.viber} />
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
