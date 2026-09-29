/**
 * Lead form — react-hook-form + shared Zod schema, honeypot, consent, MK phone. POSTs to
 * /api/v1/leads. On success navigates to /blagodarime (or calls onSuccess for the modal).
 * Fires `generate_lead` (PRD Прилог Д). Turnstile widget mounts when a site key is present.
 */
import { isValidMkPhone } from '@filtervoda/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { LocaleLink, useLocalizedPath, useT } from '../i18n/context';
import type { CalcInput } from './LeadModal';
import { Turnstile } from './Turnstile';
import { Button } from './ui';

type LeadType = 'B2C' | 'B2B' | 'CONTACT' | 'ADVISOR';

interface Fields {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  message?: string;
  consent: boolean;
  company?: string;
  hp?: string; // honeypot
}

export function LeadForm({
  type,
  productId,
  calcInput,
  onSuccess,
  compact,
}: {
  type: LeadType;
  productId?: string;
  calcInput?: CalcInput;
  phones?: string[];
  viber?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const t = useT();
  const loc = useLocalizedPath();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>();

  async function onSubmit(values: Fields) {
    setServerError(null);
    const body = {
      type,
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      message: values.message || undefined,
      productId,
      ...(type === 'B2B' ? { company: values.company, city: values.city } : { city: values.city }),
      ...(calcInput ? { calcInput } : {}),
      consent: values.consent,
      context: {
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        hp: values.hp,
        turnstileToken: (typeof window !== 'undefined' && (window as { __turnstileToken?: string }).__turnstileToken) || undefined,
      },
    };
    const res = await fetch('/api/v1/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setServerError(t('lead.err.server'));
      return;
    }
    // Reset the single-use Turnstile token so a second form/submit can't reuse it.
    if (typeof window !== 'undefined') (window as { __turnstileToken?: string }).__turnstileToken = undefined;
    const leadId = (await res.json().catch(() => ({})))?.leadId as string | undefined;
    const w = window as unknown as { dataLayer?: unknown[]; fbq?: (...a: unknown[]) => void };
    w.dataLayer?.push({ event: 'generate_lead', form_type: type, product_id: productId });
    // Browser Pixel Lead uses the lead id as event_id — matches the server CAPI event → deduped.
    if (typeof w.fbq === 'function' && leadId) w.fbq('track', 'Lead', { content_category: type }, { eventID: leadId });
    if (onSuccess) onSuccess();
    navigate(loc('/blagodarime'));
  }

  const inputCls =
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-ink)] focus-visible:outline-2';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
      <div>
        <label htmlFor="lf-name" className="sr-only">{t('lead.ph.name')}</label>
        <input id="lf-name" className={inputCls} placeholder={t('lead.ph.name')} aria-invalid={!!errors.name}
          {...register('name', { required: t('lead.err.name'), minLength: { value: 2, message: t('lead.err.name') } })} />
        {errors.name && <p className="mt-1 text-sm text-[var(--color-danger-600)]">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="lf-phone" className="sr-only">{t('lead.phone')}</label>
        <input id="lf-phone" type="tel" inputMode="tel" className={inputCls} placeholder={t('lead.ph.phone')} aria-invalid={!!errors.phone}
          {...register('phone', { required: t('lead.err.phoneRequired'), validate: (v) => isValidMkPhone(v) || t('lead.err.phoneFormat') })} />
        {errors.phone && <p className="mt-1 text-sm text-[var(--color-danger-600)]">{errors.phone.message}</p>}
      </div>

      {/* Company is required for B2B even in the compact modal (was being dropped). */}
      {type === 'B2B' && (
        <div>
          <input className={inputCls} placeholder={t('lead.ph.company')} aria-invalid={!!errors.company} {...register('company', { required: t('lead.err.company') })} />
          {errors.company && <p className="mt-1 text-sm text-[var(--color-danger-600)]">{errors.company.message}</p>}
        </div>
      )}
      {!compact && (
        <>
          <input className={inputCls} type="email" placeholder={t('lead.ph.email')} {...register('email')} />
          <input className={inputCls} placeholder={t('lead.ph.city')} {...register('city')} />
          <textarea className={inputCls} rows={3} placeholder={t('lead.ph.message')} {...register('message')} />
        </>
      )}

      {/* Honeypot — hidden from users, filled only by bots. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register('hp')} />

      <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
        <input type="checkbox" className="mt-1" {...register('consent', { required: true })} />
        <span>
          {t('lead.consentPre')}{' '}
          <LocaleLink to="/pravni/privatnost" className="underline">{t('lead.consentLink')}</LocaleLink>.
        </span>
      </label>
      {errors.consent && <p className="text-sm text-[var(--color-danger-600)]">{t('lead.err.consent')}</p>}

      <Turnstile />

      {serverError && <p className="text-sm text-[var(--color-danger-600)]">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? t('cta.sending') : t('lead.submit')}
      </Button>
    </form>
  );
}
