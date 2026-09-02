import { computeSavings, type B2bPackageDto, type PublicSettings } from '@filtervoda/shared';
import * as Slider from '@radix-ui/react-slider';
import { useMemo, useState } from 'react';
import { LeadForm } from '../../components/LeadForm';
import { useLeadModal } from '../../components/LeadModal';
import { fmtPrice } from '../types';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

const PROBLEMS = ['Трошок што расте со тимот', 'Нарачки и носење', 'Простор за складирање', 'Хигиена на галоните', 'Нема топла вода за кафе', 'Пластика и имиџ'];
const INCLUDED = ['Апарат за топла и ладна вода', 'Бесплатна монтажа', 'Редовна замена на филтри', 'Сервис и одржување', 'Замена при дефект', 'Без инвестиција'];
const INDUSTRIES = ['Канцеларии', 'Кафулиња и ресторани', 'Ординации', 'Салони', 'Теретани', 'Хотели', 'Градинки и училишта', 'Автосалони', 'Продавници'];

export function B2bPage({ packages, settings }: { packages: B2bPackageDto[]; settings: PublicSettings }) {
  const s = skinFor(useTemplateId());
  const { open } = useLeadModal();
  const [employees, setEmployees] = useState(10);
  const [solution, setSolution] = useState<'GALLONS' | 'BOTTLES'>('GALLONS');
  const sparFrom = packages[0]?.priceFrom ?? 2900;
  const result = useMemo(() => computeSavings({ employees, solution, pricePerGallon: 120, sparMonthly: sparFrom }), [employees, solution, sparFrom]);

  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`${s.display} ${s.ink} text-[clamp(28px,3.2vw,44px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>{children}</h2>
  );

  return (
    <>
      {/* HERO */}
      <section className={`${s.heroDark} px-5`}>
        <div className="mx-auto max-w-[1200px] py-20 text-center">
          <div className={`${s.mono} text-[12px] tracking-[0.14em] text-[#6FC4F7]`}>ЗА ФИРМИ</div>
          <h1 className={`${s.display} mx-auto mt-4 max-w-3xl text-[clamp(36px,4.8vw,68px)] font-semibold text-white ${s.headingUpper ? 'uppercase' : ''}`}>Заборавете на галоните. Неограничена чиста вода за вашиот тим.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-[1.55] text-[#A9BFDC]">Изнајмете апарат од SPAR со сè вклучено — монтажа, филтри, сервис — за фиксен месечен износ.</p>
          <div className="mt-8 flex justify-center">
            <button onClick={() => open({ type: 'B2B' })} className={s.cta}>Побарај понуда за фирма</button>
          </div>
          <p className="mt-4 text-sm text-[#6FC4F7]">Бесплатна проценка · Без скриени трошоци · Брза монтажа</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5">
        <section className="py-14"><H2>Колку навистина ве чинат галоните?</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((p) => <div key={p} className={`rounded-[18px] border ${s.border} p-6 text-[15px]`}>{p}</div>)}
          </div>
        </section>

        <section className="py-6"><H2>Еден месечен износ. Сè вклучено.</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((p) => <div key={p} className={`rounded-[18px] border ${s.border} ${s.softBg} p-6 text-[15px]`}>{p}</div>)}
          </div>
        </section>

        {/* CALCULATOR */}
        <section className="py-10"><H2>Пресметајте колку заштедувате</H2>
          <div className={`mt-8 grid gap-5 rounded-[24px] border ${s.border} p-8 md:grid-cols-2`}>
            <div>
              <label className="text-sm font-medium">Број вработени: <span className={`${s.display} text-xl`}>{employees}</span></label>
              <Slider.Root className="relative mt-4 flex h-5 touch-none items-center" value={[employees]} min={1} max={100} step={1} onValueChange={([v]) => setEmployees(v ?? 1)} aria-label="Број вработени">
                <Slider.Track className="relative h-1.5 grow rounded-full bg-[#E1E9F2]"><Slider.Range className={`absolute h-full rounded-full ${s.cta.includes('#16803B') ? 'bg-[#16803B]' : s.cta.includes('#0E7490') ? 'bg-[#0E7490]' : 'bg-[#1156E0]'}`} /></Slider.Track>
                <Slider.Thumb className="block size-5 rounded-full bg-white shadow ring-2 ring-[#1156E0]" />
              </Slider.Root>
              <div className="mt-5 text-sm font-medium">Моментално решение</div>
              <div className="mt-2 flex gap-2">
                {(['GALLONS', 'BOTTLES'] as const).map((o) => (
                  <button key={o} onClick={() => setSolution(o)} className={`rounded-lg border px-4 py-2 text-sm ${solution === o ? `${s.border} ${s.softBg} font-semibold` : s.border}`}>{o === 'GALLONS' ? 'Галони 19 L' : 'Шишиња 0,5 L'}</button>
                ))}
              </div>
            </div>
            <div className={`rounded-[18px] ${s.panel} p-6 text-white`}>
              <div className="text-sm text-[#A9BFDC]">Сега плаќате ≈</div>
              <div className={`${s.display} text-3xl`}>{fmtPrice(result.currentMonthly)}<span className="text-base text-[#A9BFDC]"> /мес.</span></div>
              <div className="mt-3 text-sm text-[#A9BFDC]">Со SPAR од</div>
              <div className={`${s.display} text-3xl text-[#7BE0A0]`}>{fmtPrice(result.sparMonthly)}<span className="text-base text-[#A9BFDC]"> /мес.</span></div>
              <div className="mt-3 text-sm text-[#A9BFDC]">Годишна заштеда ≈</div>
              <div className={`${s.display} text-2xl text-[#7BE0A0]`}>{fmtPrice(result.annualSaving)}</div>
              <p className="mt-3 text-xs text-[#A9BFDC]">Пресметката е ориентациона.</p>
              <button onClick={() => open({ type: 'B2B' })} className={`mt-4 w-full ${s.cta}`}>Добиј точна понуда</button>
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section className="py-10"><H2>Пакети</H2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packages.map((pkg, i) => (
              <div key={pkg.id} className={`relative rounded-[22px] border p-8 ${i === 1 ? 'border-2 border-[#1156E0] shadow-[0_20px_50px_rgba(17,86,224,0.14)]' : s.border}`}>
                {i === 1 && <span className="absolute -top-3 left-8 rounded-full bg-[#1156E0] px-3 py-1.5 text-[11px] font-extrabold text-white">НАЈБАРАН</span>}
                <div className={`${s.accent} text-sm font-semibold`}>{pkg.name}</div>
                <div className={`${s.display} ${s.ink} mt-2 text-2xl`}>од {fmtPrice(pkg.priceFrom)}<span className="text-sm text-[#55677F]"> /мес.</span></div>
                {pkg.description && <p className="mt-2 text-sm text-[#46597A]">{pkg.description}</p>}
                <ul className="mt-4 space-y-1 text-sm">{pkg.includes.map((x) => <li key={x}>• {x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10"><H2>За кои бизниси</H2>
          <div className="mt-8 flex flex-wrap gap-2">
            {INDUSTRIES.map((x) => <span key={x} className={`rounded-[16px] border ${s.border} px-[18px] py-[22px] text-[15px] font-semibold text-[#21375A]`}>{x}</span>)}
          </div>
        </section>

        <section className="py-10"><H2>Побарај понуда за фирма</H2>
          <div className={`mx-auto mt-8 max-w-xl rounded-[24px] border ${s.border} p-8`}>
            <LeadForm type="B2B" phones={settings.phones} viber={settings.viber} />
          </div>
        </section>
      </div>
    </>
  );
}
