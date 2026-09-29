import { computeSavings, DEFAULT_LITERS_PER_PERSON_DAY, DEFAULT_WORKING_DAYS, telHref, type B2bPackageDto, type PublicSettings } from '@filtervoda/shared';
import * as Slider from '@radix-ui/react-slider';
import { useMemo, useState } from 'react';
import { LeadForm } from '../../components/LeadForm';
import { useLeadModal } from '../../components/LeadModal';
import { useT } from '../../i18n/context';
import { fmtPrice } from '../types';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

const PROBLEMS = ['Трошок што расте со тимот', 'Нарачки и носење', 'Простор за складирање', 'Хигиена на галоните', 'Нема топла вода за кафе', 'Пластика и имиџ'];
const INCLUDED = ['Апарат за топла и ладна вода', 'Бесплатна монтажа', 'Редовна замена на филтри', 'Сервис и одржување', 'Замена при дефект', 'Без инвестиција'];
const INDUSTRIES = ['Канцеларии', 'Кафулиња и ресторани', 'Ординации', 'Салони', 'Теретани', 'Хотели', 'Градинки и училишта', 'Автосалони', 'Продавници', 'Аптеки', 'Пекари и слаткарници', 'Автосервиси'];

const DEFAULT_STEPS: { title: string; desc: string }[] = [
  { title: 'Побарајте понуда', desc: 'Две минути — формата или еден телефонски повик.' },
  { title: 'Бесплатна проценка и монтажа', desc: 'Доаѓаме, гледаме и монтираме без трошок за вас.' },
  { title: 'Пиете неограничено', desc: 'Ние се грижиме за сè — филтри, сервис, замена.' },
];

const DEFAULT_COMPARISON: { label: string; gallons: string; buy: string; rent: string }[] = [
  { label: 'Месечен трошок', gallons: 'Расте со тимот', buy: 'Без', rent: 'Фиксен, предвидлив' },
  { label: 'Почетна инвестиција', gallons: 'Не', buy: 'Висока', rent: 'Нема' },
  { label: 'Нарачки и носење', gallons: 'Постојано', buy: 'Не', rent: 'Не' },
  { label: 'Топла/ладна вода', gallons: 'Не', buy: 'Зависно', rent: 'Да' },
  { label: 'Замена на филтри и сервис', gallons: 'Не', buy: 'Ваша грижа', rent: 'Вклучено' },
  { label: 'Замена при дефект', gallons: 'Не', buy: 'Ваша грижа', rent: 'Вклучено' },
  { label: 'Договорна обврска', gallons: 'Не', buy: 'Не', rent: '12 месеци [потврди]' },
];

export function B2bPage({ packages, settings, faq = [] }: { packages: B2bPackageDto[]; settings: PublicSettings; faq?: { question: string; answer: string }[] }) {
  const s = skinFor(useTemplateId());
  const { open } = useLeadModal();
  const tr = useT(); // `t` below is settings.b2b (admin CMS copy); `tr` is the i18n translator.
  const [employees, setEmployees] = useState(25);
  const [solution, setSolution] = useState<'GALLONS' | 'BOTTLES'>('GALLONS');
  const [unitPrice, setUnitPrice] = useState(120);
  const sparFrom = packages[0]?.priceFrom ?? 2900;
  const result = useMemo(
    () => computeSavings({ employees, solution, pricePerGallon: unitPrice, sparMonthly: sparFrom }),
    [employees, solution, unitPrice, sparFrom],
  );
  const solLabel = solution === 'GALLONS' ? tr('b2b.unit.gallons') : tr('b2b.unit.bottles');
  // Clamp to 100% — when there's no saving (few employees) SPAR ≥ current, which would otherwise
  // render a bar wider than its container and overflow the viewport.
  const barSpar = `${Math.min(100, Math.max(6, Math.round((result.sparMonthly / Math.max(result.currentMonthly, 1)) * 100)))}%`;
  const avoidedPerYear = result.units * 12;
  const hasSavings = result.annualSaving > 0;
  // Carried into the B2B lead so the shop sees what the visitor calculated.
  const calcInput = { employees, solution, pricePerUnit: unitPrice };
  // Editable-from-admin content with hardcoded fallbacks; calculator behind a feature flag.
  const problems = settings.b2b?.problems?.length ? settings.b2b.problems : PROBLEMS;
  const included = settings.b2b?.included?.length ? settings.b2b.included : INCLUDED;
  const industries = settings.b2b?.industries?.length ? settings.b2b.industries : INDUSTRIES;
  const steps = settings.b2b?.steps?.length ? settings.b2b.steps : DEFAULT_STEPS;
  const comparison = settings.b2b?.comparison?.length ? settings.b2b.comparison : DEFAULT_COMPARISON;
  const t = settings.b2b;
  const showCalculator = settings.featureFlags?.calculator !== false;
  const showComparison = settings.featureFlags?.compareTable !== false;

  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`${s.display} ${s.ink} text-[clamp(28px,3.2vw,44px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>{children}</h2>
  );

  return (
    <>
      {/* HERO — 2-column: content + product image */}
      <section className={`${s.heroDark} px-5`}>
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 py-20 md:grid-cols-[1fr_minmax(0,420px)]">
          <div>
            <div className={`${s.mono} text-[12px] tracking-[0.14em] text-[#6FC4F7]`}>{t?.heroLabel ?? tr('b2b.heroLabel')}</div>
            <h1 className={`${s.display} mt-4 text-[clamp(36px,4.6vw,66px)] font-semibold text-white ${s.headingUpper ? 'uppercase' : ''}`}>{t?.heroH1 ?? tr('b2b.heroH1')}</h1>
            <p className="mt-5 max-w-xl text-[19px] leading-[1.55] text-[#A9BFDC]">{t?.heroSubhead ?? tr('b2b.heroSubhead')}</p>
            <div className="mt-8">
              <button onClick={() => open({ type: 'B2B', calcInput })} className={s.cta}>{t?.heroCta ?? tr('b2b.heroCta')}</button>
            </div>
            <p className="mt-4 text-sm text-[#6FC4F7]">{t?.heroTrust ?? tr('b2b.heroTrust')}</p>
          </div>
          <img
            src={t?.heroImage || '/img/products/dispenzer.jpg'}
            alt={tr('b2b.heroImageAlt')}
            className="w-full rounded-[24px] object-contain"
            style={{ aspectRatio: '4 / 5' }}
            loading="eager"
          />
        </div>
      </section>

      {/* Logo bar — trusted by */}
      <div className={`border-b ${s.border} ${s.softBg}`}>
        <div className="mx-auto max-w-[1200px] px-5 py-6">
          <div className={`${s.mono} mb-3 text-center text-[11px] tracking-[0.14em] ${s.muted}`}>{t?.logosTitle ?? tr('b2b.logosTitle')}</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
            {(settings.trustLogos && settings.trustLogos.length > 0
              ? settings.trustLogos
              : Array.from({ length: 6 }, () => '')
            ).map((url, i) =>
              url ? (
                <div key={i} className={`grid h-16 min-w-0 flex-1 place-items-center rounded-md border ${s.border} bg-white px-3`}>
                  <img src={url} alt={tr('b2b.logo')} className="max-h-12 max-w-full object-contain" loading="lazy" />
                </div>
              ) : (
                <div key={i} className={`grid h-16 min-w-0 flex-1 place-items-center rounded-md border ${s.border} bg-white ${s.mono} text-[11px] ${s.muted}`}>{tr('b2b.logo')}</div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5">
        <section className="py-14"><H2>{t?.problemsTitle ?? tr('b2b.problemsTitle')}</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => <div key={p} className={`rounded-[18px] border ${s.border} p-6 text-[15px]`}>{p}</div>)}
          </div>
        </section>

        <section className="py-6"><H2>{t?.includedTitle ?? tr('b2b.includedTitle')}</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((p) => <div key={p} className={`rounded-[18px] border ${s.border} ${s.softBg} p-6 text-[15px]`}>{p}</div>)}
          </div>
        </section>

        {/* CALCULATOR — behind the feature.calculator flag */}
        {showCalculator && (
        <section className="py-10"><H2>{t?.calcTitle ?? tr('b2b.calc.title')}</H2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* Inputs */}
            <div className={`rounded-[24px] border ${s.border} p-[34px]`}>
              <label className={`block text-[13px] font-extrabold tracking-[0.04em] ${s.muted}`}>{tr('b2b.calc.employees')}</label>
              <div className="mt-2.5 flex items-baseline gap-2.5">
                <span className={`${s.display} ${s.ink} text-[44px] font-medium tracking-[-0.04em]`}>{employees}</span>
                <span className={`text-[15px] ${s.muted}`}>{tr('b2b.calc.people')}</span>
              </div>
              <Slider.Root className="relative mt-3.5 flex h-7 touch-none items-center" value={[employees]} min={5} max={200} step={1} onValueChange={([v]) => setEmployees(v ?? 5)} aria-label={tr('b2b.calc.sliderLabel')}>
                <Slider.Track className="relative h-2.5 grow rounded-full bg-[#E1E9F2]"><Slider.Range className="absolute h-full rounded-full bg-[var(--color-cta)]" /></Slider.Track>
                <Slider.Thumb className="block size-6 rounded-full bg-white shadow ring-2 ring-[var(--color-cta)]" />
              </Slider.Root>
              <div className={`flex justify-between text-[12px] ${s.muted}`}><span>5</span><span>200</span></div>

              <label className={`mt-[30px] block text-[13px] font-extrabold tracking-[0.04em] ${s.muted}`}>{tr('b2b.calc.currentSolution')}</label>
              <div className="mt-3 flex gap-2.5">
                {(['GALLONS', 'BOTTLES'] as const).map((o) => (
                  <button key={o} onClick={() => setSolution(o)} className={`flex-1 rounded-xl border px-4 py-[15px] text-[15px] font-bold ${solution === o ? `border-[var(--color-cta)] ${s.softBg} ${s.ink}` : `${s.border} ${s.muted}`}`}>{o === 'GALLONS' ? tr('b2b.calc.gallons') : tr('b2b.calc.bottles')}</button>
                ))}
              </div>

              <label htmlFor="b2b-unit-price" className={`mt-[30px] block text-[13px] font-extrabold tracking-[0.04em] ${s.muted}`}>{tr('b2b.calc.unitPrice')}</label>
              <input
                id="b2b-unit-price"
                type="number"
                min={1}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(1, Number(e.target.value) || 0))}
                className={`mt-2.5 w-full rounded-xl border ${s.border} ${s.softBg} px-4 py-[15px] font-bold ${s.ink}`}
              />
              <p className={`mt-3.5 text-[13px] leading-[1.5] ${s.muted}`}>{tr('b2b.calc.assumption', { liters: String(DEFAULT_LITERS_PER_PERSON_DAY).replace('.', ','), days: DEFAULT_WORKING_DAYS })}</p>
            </div>

            {/* Result panel */}
            <div className={`rounded-[24px] ${s.panel} p-[34px] text-white`}>
              <div className="text-[13px] font-extrabold tracking-[0.04em] text-[#6FC4F7]">{tr('b2b.calc.nowPay')}</div>
              <div className={`${s.display} mt-2 text-[40px] font-medium tracking-[-0.04em]`}>{fmtPrice(result.currentMonthly)}<span className="text-[16px] font-semibold text-[#A9BFDC]"> {tr('b2b.perMonth')}</span></div>
              <div className="mt-3.5 h-2.5 rounded-full bg-[#6FC4F7]" style={{ width: '100%' }} />

              <div className="mt-[30px] text-[13px] font-extrabold tracking-[0.04em] text-[#6FC4F7]">{tr('b2b.calc.sparFrom')}</div>
              <div className={`${s.display} mt-2 text-[40px] font-medium tracking-[-0.04em] text-[#7BE0A0]`}>{fmtPrice(result.sparMonthly)}<span className="text-[16px] font-semibold text-[#A9BFDC]"> {tr('b2b.perMonth')}</span></div>
              <div className="mt-3.5 h-2.5 rounded-full bg-[#16803B] transition-[width] duration-500" style={{ width: barSpar }} />

              <div className="mt-[30px] border-t border-[rgba(111,196,247,0.24)] pt-[26px]">
                {hasSavings ? (
                  <div>
                    <div className="text-[13px] font-extrabold tracking-[0.04em] text-[#6FC4F7]">{tr('b2b.calc.annualSaving')}</div>
                    <div className={`${s.display} mt-2 text-[34px] font-medium text-[#7BE0A0]`}>{fmtPrice(result.annualSaving)}</div>
                    <p className="mt-3 text-[15px] text-[#A9BFDC]">{tr('b2b.calc.lessPerYear', { count: new Intl.NumberFormat('mk-MK').format(avoidedPerYear), unit: solLabel })}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-[13px] font-extrabold tracking-[0.04em] text-[#6FC4F7]">{tr('b2b.calc.whatYouGet')}</div>
                    <p className="mt-2.5 text-[17px] leading-[1.5] text-white">{tr('b2b.calc.whatYouGetText')}</p>
                  </div>
                )}
              </div>
              <button onClick={() => open({ type: 'B2B', calcInput })} className="mt-7 w-full rounded-[14px] bg-[#16803B] px-6 py-[18px] text-[17px] font-bold text-white transition hover:brightness-110">{tr('b2b.calc.exactOffer')}</button>
            </div>
          </div>
        </section>
        )}

        {/* 3 STEPS */}
        <section className="py-10"><H2>{t?.stepsTitle ?? tr('b2b.stepsTitle')}</H2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((st, i) => (
              <div key={i} className={`rounded-[20px] border ${s.border} p-8`}>
                <div className={`${s.display} ${s.accent} text-[13px]`}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className={`mt-4 text-[19px] font-medium ${s.ink}`}>{st.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.55] text-[#56698A]">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PACKAGES */}
        <section className="py-10"><H2>{t?.packagesTitle ?? tr('b2b.packagesTitle')}</H2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packages.map((pkg, i) => (
              <div key={pkg.id} className={`relative rounded-[22px] border p-8 ${i === 1 ? 'border-2 border-[#1156E0] shadow-[0_20px_50px_rgba(17,86,224,0.14)]' : s.border}`}>
                {i === 1 && <span className="absolute -top-3 left-8 rounded-full bg-[#1156E0] px-3 py-1.5 text-[11px] font-extrabold text-white">{tr('b2b.mostPopular')}</span>}
                <div className={`${s.accent} text-sm font-semibold`}>{pkg.name}</div>
                <div className={`${s.display} ${s.ink} mt-2 text-2xl`}>{tr('common.from')} {fmtPrice(pkg.priceFrom)}<span className="text-sm text-[#55677F]"> {tr('b2b.perMonth')}</span></div>
                {pkg.description && <p className="mt-2 text-sm text-[#46597A]">{pkg.description}</p>}
                <ul className="mt-4 space-y-1 text-sm">{pkg.includes.map((x) => <li key={x}>• {x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10"><H2>{t?.industriesTitle ?? tr('b2b.industriesTitle')}</H2>
          <div className="mt-8 flex flex-wrap gap-2">
            {industries.map((x) => <span key={x} className={`rounded-[16px] border ${s.border} px-[18px] py-[22px] text-[15px] font-semibold text-[#21375A]`}>{x}</span>)}
            <span className={`rounded-[16px] border border-dashed ${s.border} px-[18px] py-[22px] text-[15px] font-semibold ${s.muted}`}>{tr('b2b.industriesOther')}</span>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        {showComparison && (
        <section className="py-10"><H2>{t?.comparisonTitle ?? tr('b2b.comparisonTitle')}</H2>
          <div className={`mt-8 overflow-x-auto rounded-[18px] border ${s.border}`}>
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className={`${s.softBg} text-left ${s.mono} text-[12px] tracking-[0.06em] ${s.muted}`}>
                  <th className={`sticky left-0 ${s.softBg} px-4 py-3.5 font-medium`}></th>
                  <th className="px-4 py-3.5 font-medium">{tr('b2b.cmp.gallons')}</th>
                  <th className="px-4 py-3.5 font-medium">{tr('b2b.cmp.buy')}</th>
                  <th className={`px-4 py-3.5 font-bold ${s.accent}`}>{tr('b2b.cmp.rentSpar')}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r) => (
                  <tr key={r.label} className={`border-t ${s.border}`}>
                    <td className={`sticky left-0 bg-[var(--color-background)] px-4 py-3.5 font-semibold ${s.ink}`}>{r.label}</td>
                    <td className="px-4 py-3.5 text-[#56698A]">{r.gallons}</td>
                    <td className="px-4 py-3.5 text-[#56698A]">{r.buy}</td>
                    <td className={`px-4 py-3.5 font-semibold ${s.accent}`}>{r.rent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="py-10"><H2>{t?.faqTitle ?? tr('b2b.faqTitle')}</H2>
            <div className={`mt-6 divide-y ${s.border} overflow-hidden rounded-[18px] border ${s.border}`}>
              {faq.map((f, i) => (
                <details key={i} className="px-6 py-4"><summary className={`cursor-pointer font-semibold ${s.ink}`}>{f.question}</summary><p className="mt-2 text-[15px] text-[#56698A]">{f.answer}</p></details>
              ))}
            </div>
          </section>
        )}

        {/* FORM — 2-column info + form */}
        <section className="py-10 pb-24"><H2>{t?.formTitle ?? tr('b2b.formTitle')}</H2>
          <div className={`mt-8 grid gap-11 rounded-[var(--radius-card)] border ${s.border} ${s.softBg} p-8 md:grid-cols-2`}>
            <div>
              <p className={`text-[17px] leading-[1.55] ${s.muted}`}>{t?.formText ?? tr('b2b.formText')}</p>
              {/* Carry-over from the calculator above */}
              <div className={`mt-5 rounded-[16px] border ${s.border} bg-white p-4`}>
                <div className={`text-[12px] font-extrabold tracking-[0.04em] ${s.muted}`}>{tr('b2b.carryOver')}</div>
                <p className={`mt-2 text-[15px] ${s.ink}`}>
                  {tr('b2b.carrySummary', { employees, current: fmtPrice(result.currentMonthly) })}
                  {hasSavings && tr('b2b.carrySavings', { saving: fmtPrice(result.annualSaving) })}
                </p>
              </div>
              <a href={telHref(settings.phones[0] ?? '076/676/819')} className={`mt-5 inline-block ${s.display} ${s.ink} text-[22px] font-medium`}>{settings.phones[0] ?? '076/676/819'}</a>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#56698A]">
                <span>{tr('b2b.trust1')}</span> · <span>{tr('b2b.trust2')}</span> · <span>{tr('b2b.trust3')}</span>
              </div>
            </div>
            <div className={`rounded-[var(--radius-card)] border ${s.border} bg-white p-[26px]`}>
              <LeadForm type="B2B" calcInput={calcInput} phones={settings.phones} viber={settings.viber} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
