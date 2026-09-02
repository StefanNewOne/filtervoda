import { Section } from '../components/ui';

export function meta() {
  return [{ title: 'За нас — SPAR Company | filtervoda.mk' }];
}

const STATS = [
  { n: '10', t: 'години гаранција на секој систем' },
  { n: '17', t: 'производи за дом и бизнис' },
  { n: 'МК', t: 'достава и монтажа низ цела Македонија' },
];

export default function About() {
  return (
    <Section>
      <h1 className="max-w-[22em] text-[clamp(34px,4.6vw,64px)] font-medium text-[var(--color-foreground)]">За нас — SPAR Company</h1>
      <p className="mt-[22px] max-w-[34em] text-[19px] leading-[1.6] text-[var(--color-muted)]">
        SPAR Company продава и монтира системи за филтрација на вода низ цела Македонија — со бесплатна монтажа, 10 години гаранција и достава низ цела држава. Плаќање во готово или на рати.
      </p>
      <div className="mt-[50px] grid gap-[18px] sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.n} className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-[34px]">
            <div className="font-[family-name:var(--font-display)] text-[46px] font-medium tracking-[-0.04em] text-[var(--color-cta)]">{s.n}</div>
            <p className="mt-3 text-[16px] text-[var(--color-muted)]">{s.t}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
