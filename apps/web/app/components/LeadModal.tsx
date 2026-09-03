/**
 * Global lead modal (conversion core). Radix Dialog + a short name/phone form that POSTs to
 * the public API (nginx proxies /api → api). Fires the `lead_form_open` / `generate_lead`
 * analytics hooks (PRD Прилог Д) via dataLayer when consent allows. Pre-selects a product.
 */
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LeadForm } from './LeadForm';

export type CalcInput = { employees: number; solution: 'GALLONS' | 'BOTTLES'; pricePerUnit?: number };

interface LeadModalContext {
  open: (opts?: { productId?: string; productName?: string; type?: 'B2C' | 'B2B' | 'CONTACT' | 'ADVISOR'; calcInput?: CalcInput }) => void;
}

const Ctx = createContext<LeadModalContext | null>(null);

export function useLeadModal(): LeadModalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLeadModal must be used inside LeadModalProvider');
  return ctx;
}

export function LeadModalProvider({
  children,
  phones,
  viber,
}: {
  children: React.ReactNode;
  phones: string[];
  viber?: string;
}) {
  const [state, setState] = useState<{ open: boolean; productId?: string; productName?: string; type: 'B2C' | 'B2B' | 'CONTACT' | 'ADVISOR'; calcInput?: CalcInput }>(
    { open: false, type: 'B2C' },
  );

  const open = useCallback<LeadModalContext['open']>((opts) => {
    setState({ open: true, productId: opts?.productId, productName: opts?.productName, type: opts?.type ?? 'B2C', calcInput: opts?.calcInput });
    if (typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: 'lead_form_open',
        form_type: opts?.type ?? 'B2C',
        product_id: opts?.productId,
      });
    }
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog.Root open={state.open} onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between">
              <Dialog.Title className="text-xl">Побарај понуда</Dialog.Title>
              <Dialog.Close aria-label="Затвори" className="rounded p-1 hover:bg-[var(--color-neutral-100)]">
                <X size={20} />
              </Dialog.Close>
            </div>
            {state.productName ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{state.productName}</p>
            ) : null}
            <LeadForm
              type={state.type}
              productId={state.productId}
              calcInput={state.calcInput}
              phones={phones}
              viber={viber}
              onSuccess={() => setState((s) => ({ ...s, open: false }))}
              compact
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Ctx.Provider>
  );
}
