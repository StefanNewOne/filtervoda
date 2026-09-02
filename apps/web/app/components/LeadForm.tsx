/**
 * Lead form — react-hook-form + shared Zod schema, honeypot, consent, MK phone. POSTs to
 * /api/v1/leads. On success navigates to /blagodarime (or calls onSuccess for the modal).
 * Fires `generate_lead` (PRD Прилог Д). Turnstile widget mounts when a site key is present.
 */
import { isValidMkPhone } from '@filtervoda/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
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
  onSuccess,
  compact,
}: {
  type: LeadType;
  productId?: string;
  phones?: string[];
  viber?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
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
      setServerError('Барањето не помина. Проверете ги полињата и обидете се повторно.');
      return;
    }
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: 'generate_lead', form_type: type, product_id: productId });
    if (onSuccess) onSuccess();
    navigate('/blagodarime');
  }

  const inputCls =
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-ink)] focus-visible:outline-2';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
      <div>
        <label htmlFor="lf-name" className="sr-only">Име и презиме</label>
        <input id="lf-name" className={inputCls} placeholder="Име и презиме" aria-invalid={!!errors.name}
          {...register('name', { required: 'Внесете име и презиме', minLength: { value: 2, message: 'Внесете име и презиме' } })} />
        {errors.name && <p className="mt-1 text-sm text-[var(--color-danger-600)]">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="lf-phone" className="sr-only">Телефон</label>
        <input id="lf-phone" type="tel" inputMode="tel" className={inputCls} placeholder="Телефон (07X XXX XXX)" aria-invalid={!!errors.phone}
          {...register('phone', { required: 'Ова поле е задолжително', validate: (v) => isValidMkPhone(v) || 'Внесете телефон во формат 07X XXX XXX' })} />
        {errors.phone && <p className="mt-1 text-sm text-[var(--color-danger-600)]">{errors.phone.message}</p>}
      </div>

      {!compact && (
        <>
          <input className={inputCls} type="email" placeholder="Email (опционално)" {...register('email')} />
          <input className={inputCls} placeholder="Град" {...register('city')} />
          {type === 'B2B' && <input className={inputCls} placeholder="Име на фирма" {...register('company', { required: 'Внесете име на фирма' })} />}
          <textarea className={inputCls} rows={3} placeholder="Порака (опционално)" {...register('message')} />
        </>
      )}

      {/* Honeypot — hidden from users, filled only by bots. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register('hp')} />

      <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
        <input type="checkbox" className="mt-1" {...register('consent', { required: true })} />
        <span>
          Се согласувам SPAR Company да ме контактира во врска со моето барање и да ги обработува моите податоци согласно{' '}
          <a href="/pravni/privatnost" className="underline">Политиката за приватност</a>.
        </span>
      </label>
      {errors.consent && <p className="text-sm text-[var(--color-danger-600)]">Мора да ја прифатите Политиката за приватност</p>}

      <Turnstile />

      {serverError && <p className="text-sm text-[var(--color-danger-600)]">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Се испраќа…' : 'Испрати барање'}
      </Button>
    </form>
  );
}
