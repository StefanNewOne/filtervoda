/**
 * B2B savings calculator (PRD §8.9). Slider employees + gallons/bottles → current monthly,
 * with-SPAR monthly, annual saving. Orientational disclaimer. „Добиј точна понуда" carries
 * the calc input into the B2B lead modal. Fires `calculator_use` / `calculator_cta`.
 */
import { computeSavings } from '@filtervoda/shared';
import * as Slider from '@radix-ui/react-slider';
import { useMemo, useState } from 'react';
import { useLeadModal } from './LeadModal';
import { Button, formatPrice } from './ui';

export function Calculator({ sparFrom, defaultPricePerGallon }: { sparFrom: number; defaultPricePerGallon: number }) {
  const { open } = useLeadModal();
  const [employees, setEmployees] = useState(10);
  const [solution, setSolution] = useState<'GALLONS' | 'BOTTLES'>('GALLONS');

  const result = useMemo(
    () => computeSavings({ employees, solution, pricePerGallon: defaultPricePerGallon, sparMonthly: sparFrom }),
    [employees, solution, sparFrom, defaultPricePerGallon],
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Број вработени: <span className="font-[family-name:var(--font-display)] text-xl">{employees}</span></label>
          <Slider.Root
            className="relative mt-4 flex h-5 touch-none items-center"
            value={[employees]}
            min={1}
            max={100}
            step={1}
            onValueChange={([v]) => setEmployees(v ?? 1)}
            aria-label="Број вработени"
          >
            <Slider.Track className="relative h-1.5 grow rounded-full bg-[var(--color-neutral-200)]">
              <Slider.Range className="absolute h-full rounded-full bg-[var(--color-cta)]" />
            </Slider.Track>
            <Slider.Thumb className="block size-5 rounded-full bg-[var(--color-cta)] shadow" />
          </Slider.Root>

          <div className="mt-5 text-sm font-medium">Моментално решение</div>
          <div className="mt-2 flex gap-2">
            {(['GALLONS', 'BOTTLES'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSolution(s)}
                className={`rounded-[var(--radius-chip)] border px-4 py-2 text-sm ${
                  solution === s ? 'border-[var(--color-cta)] bg-[var(--color-chip-bg)]' : 'border-[var(--color-border)]'
                }`}
              >
                {s === 'GALLONS' ? 'Галони 19 L' : 'Шишиња 0,5 L'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] bg-[var(--color-trust-bg)] p-5 text-[var(--color-trust-fg)]">
          <div className="text-sm opacity-80">Сега плаќате ≈</div>
          <div className="font-[family-name:var(--font-display)] text-3xl">{formatPrice(result.currentMonthly)}<span className="text-base opacity-70"> /мес.</span></div>
          <div className="mt-3 text-sm opacity-80">Со SPAR од</div>
          <div className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-success-400)]">{formatPrice(result.sparMonthly)}<span className="text-base opacity-70"> /мес.</span></div>
          <div className="mt-3 text-sm opacity-80">Годишна заштеда ≈</div>
          <div className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-success-400)]">{formatPrice(result.annualSaving)}</div>
          <p className="mt-3 text-xs opacity-70">Пресметката е ориентациона.</p>
          <Button
            className="mt-4 w-full"
            onClick={() => open({ type: 'B2B' })}
          >
            Добиј точна понуда
          </Button>
        </div>
      </div>
    </div>
  );
}
