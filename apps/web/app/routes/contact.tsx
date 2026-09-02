import { LeadForm } from '../components/LeadForm';
import { Section } from '../components/ui';
import { api } from '../lib/api.server';
import type { Route } from './+types/contact';

export function meta() {
  return [{ title: 'Контакт | filtervoda.mk' }];
}

export async function loader() {
  return { settings: await api.settings() };
}

export default function Contact({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  return (
    <Section title="Контакт">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {settings.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="block rounded-[18px] border border-[var(--color-border)] p-6">
                <div className="text-[12px] font-extrabold tracking-[0.06em] text-[var(--color-muted)]">ТЕЛЕФОН</div>
                <div className="mt-2.5 font-[family-name:var(--font-display)] text-[20px] font-semibold text-[var(--color-foreground)]">{p}</div>
              </a>
            ))}
            {settings.emails.map((e) => (
              <a key={e} href={`mailto:${e}`} className="block rounded-[18px] border border-[var(--color-border)] p-6">
                <div className="text-[12px] font-extrabold tracking-[0.06em] text-[var(--color-muted)]">EMAIL</div>
                <div className="mt-2.5 text-[17px] font-semibold text-[var(--color-foreground)]">{e}</div>
              </a>
            ))}
          </div>
          {/* Map placeholder — striped dashed box (prototype) */}
          <div
            className="mt-3.5 grid aspect-[16/10] place-items-center rounded-[20px] border border-dashed border-[#B7D6F2] [background-image:repeating-linear-gradient(135deg,#E8F2FD_0_10px,#F6FAFF_10px_20px)]"
            aria-hidden
          >
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-muted)]">{settings.address ?? 'Скопје, Македонија'}</span>
          </div>
        </div>
        <div className="rounded-[22px] border border-[var(--color-border)] p-8">
          <h2 className="text-[24px] font-medium text-[var(--color-foreground)]">Оставете барање</h2>
          <div className="mt-4"><LeadForm type="CONTACT" phones={settings.phones} viber={settings.viber} /></div>
        </div>
      </div>
    </Section>
  );
}
