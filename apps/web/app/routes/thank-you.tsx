import { Check } from 'lucide-react';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: 'Благодариме | filtervoda.mk' },
    { name: 'robots', content: 'noindex' },
  ];
}

export default function ThankYou() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-[140px] pt-24 text-center">
      <div className="mx-auto grid size-[74px] place-items-center rounded-full bg-[#16803B] text-white">
        <Check size={34} />
      </div>
      <h1 className="mt-8 text-[clamp(34px,4.4vw,56px)] font-medium text-[var(--color-foreground)]">Благодариме за интересот!</h1>
      <p className="mt-4 text-[17px] leading-[1.6] text-[var(--color-muted)]">
        Вашето барање е примено. Ќе ве контактираме во рок од еден работен ден на телефонот што го оставивте.
      </p>
      <p className="mt-2 text-[17px] text-[var(--color-muted)]">
        Итно? Повикајте <a href="tel:076676819" className="font-semibold text-[var(--color-foreground)]">076/676/819</a>
      </p>
      <Link to="/" className="mt-8 inline-block rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-7 py-3.5 font-bold text-[var(--color-cta-fg)]">
        Почетна страница
      </Link>
    </div>
  );
}
