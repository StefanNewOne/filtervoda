import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { useSkin } from '../components/PageShell';

export function meta() {
  return [
    { title: 'Благодариме | filtervoda.mk' },
    { name: 'robots', content: 'noindex' },
  ];
}

const STEPS = [
  { n: '01', t: 'Ве повикуваме — во рок од еден работен ден.' },
  { n: '02', t: 'Добивате понуда и термин — бесплатна проценка.' },
  { n: '03', t: 'Монтираме бесплатно — и уживате чиста вода.' },
];

export default function ThankYou() {
  const s = useSkin();
  return (
    <main className="mx-auto max-w-[780px] px-5 pb-[140px] pt-24 text-center">
      <div className="mx-auto grid size-[74px] place-items-center rounded-full bg-[#16803B] text-white">
        <Check size={34} />
      </div>
      <h1 className={`${s.display} ${s.ink} mt-8 text-[clamp(34px,4.4vw,56px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
        Благодариме за интересот!
      </h1>
      <p className={`mt-5 text-[19px] leading-[1.6] ${s.muted}`}>
        Вашето барање е примено. Ќе ве контактираме во рок од еден работен ден на телефонот што го оставивте.
      </p>

      <div className="mt-[44px] grid gap-3.5 text-left sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className={`border ${s.border} ${s.cardR} p-6`}>
            <div className={`${s.mono} text-[13px] font-bold ${s.accent}`}>{step.n}</div>
            <p className={`mt-3 ${s.display} text-[16px] font-medium ${s.ink}`}>{step.t}</p>
          </div>
        ))}
      </div>

      <p className={`mt-10 text-[17px] ${s.muted}`}>
        Итно? Повикајте{' '}
        <a href="tel:076676819" className={`font-semibold ${s.ink}`}>
          076/676/819
        </a>
      </p>

      <div className="mt-[30px] flex flex-wrap justify-center gap-3">
        <Link to="/proizvodi" className={`inline-block min-h-[44px] ${s.cta}`}>
          Види ги производите
        </Link>
        <Link to="/soveti" className={`inline-block min-h-[44px] ${s.outline}`}>
          Прочитај совети
        </Link>
      </div>
    </main>
  );
}
