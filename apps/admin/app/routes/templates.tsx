import { TEMPLATE_IDS, TEMPLATE_LABELS_MK, type TemplateId } from '@filtervoda/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Btn, Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';
import { contrastRatio } from '../lib/contrast';

interface TemplatesResponse {
  templates: readonly TemplateId[];
  active: TemplateId;
  tokens: Record<string, Record<string, string>>;
}

const DESCRIPTIONS: Record<TemplateId, string> = {
  b1: 'Бела основа, многу воздух, голема продукт фотографија. Unbounded + Manrope.',
  b2: 'Темен градиентен hero, органски форми, uppercase Oswald наслови, зелено CTA.',
  b3: 'Морнарски „data“ панели, JetBrains Mono за бројки, тесни радиуси, тил CTA.',
};

export default function Templates() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['templates'], queryFn: () => apiClient.get<TemplatesResponse>('/admin/templates') });
  const [editing, setEditing] = useState<TemplateId | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});

  const activate = useMutation({
    mutationFn: (templateId: TemplateId) => apiClient.post('/admin/templates/activate', { templateId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
  const saveTokens = useMutation({
    mutationFn: (templateId: TemplateId) => apiClient.put(`/admin/templates/${templateId}/tokens`, tokens),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['templates'] }); },
  });

  const active = data?.active;
  const ratio = tokens.cta ? contrastRatio(tokens.cta, '#ffffff') : null;

  return (
    <>
      <PageHeader title="Дизајн и темплејти" subtitle="Изберете една од трите насоки и уредете ги нејзините tokens" />
      <div className="grid gap-4 md:grid-cols-3">
        {TEMPLATE_IDS.map((t) => {
          const on = active === t;
          return (
            <Card key={t} className={on ? 'ring-2 ring-[var(--color-accent-layout)]' : ''}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{TEMPLATE_LABELS_MK[t]}</div>
                {on && <span className="rounded-full bg-[var(--color-success-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-success-600)]">АКТИВЕН</span>}
              </div>
              <p className="mt-2 text-sm text-[var(--color-neutral-500)]">{DESCRIPTIONS[t]}</p>
              <div className="mt-4 flex gap-2">
                <Btn
                  variant={on ? 'ghost' : 'primary'}
                  disabled={on || activate.isPending}
                  onClick={() => activate.mutate(t)}
                >
                  {on ? 'Активен темплејт' : 'Примени на сајтот'}
                </Btn>
                <Btn variant="ghost" onClick={() => { setEditing(t); setTokens(data?.tokens?.[t] ?? {}); }}>Уреди tokens</Btn>
              </div>

              {editing === t && (
                <div className="mt-4 space-y-2 border-t border-[var(--color-neutral-200)] pt-4">
                  {(['cta', 'ink', 'accent', 'radius', 'font', 'mono'] as const).map((k) => (
                    <label key={k} className="block text-sm">
                      <span className="text-[var(--color-neutral-500)]">{k}</span>
                      <input
                        className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-1.5"
                        value={tokens[k] ?? ''}
                        onChange={(e) => setTokens((s) => ({ ...s, [k]: e.target.value }))}
                        placeholder="фабричка вредност"
                      />
                    </label>
                  ))}
                  {ratio != null && (
                    <p className={`text-xs ${ratio >= 4.5 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                      Контраст CTA/бело: {ratio.toFixed(2)}:1 · {ratio >= 4.5 ? 'поминува AA' : 'под AA 4.5:1'}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Btn onClick={() => saveTokens.mutate(t)}>Зачувај</Btn>
                    <Btn variant="ghost" onClick={() => setEditing(null)}>Откажи</Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-[var(--color-neutral-500)]">
        Точно еден темплејт е активен наеднаш. „Примени на сајтот“ го објавува веднаш за сите посетители и го чисти кешот.
      </p>
    </>
  );
}
