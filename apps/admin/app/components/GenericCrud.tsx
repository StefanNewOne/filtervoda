import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '../lib/api';
import { I18nPanel, type I18nData, type I18nField } from './I18nPanel';
import { Btn, Card, PageHeader, Table } from './ui';

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  /** Prefilled value for the "Ново" form (e.g. a sensible enum/number default). */
  defaultValue?: string;
}

/**
 * Minimal audited CRUD UI over an admin endpoint. Create + inline edit + delete; matches the API
 * crud factory (POST / PATCH /:id / DELETE /:id). Empty text fields and blank number fields are
 * omitted from the payload so Zod `.default()` applies and enums never receive '' / NaN (422).
 */
export function GenericCrud({
  title,
  subtitle,
  endpoint,
  fields,
  queryKey,
  i18nFields,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  fields: Field[];
  queryKey: string;
  /** Translatable fields (FV-001 M2). When set, an EN/SQ translation panel is shown. */
  i18nFields?: I18nField[];
}) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: [queryKey], queryFn: () => apiClient.get<Record<string, unknown>[]>(endpoint) });
  const initial = () => Object.fromEntries(fields.filter((f) => f.defaultValue != null).map((f) => [f.key, f.defaultValue as string]));
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [i18n, setI18n] = useState<I18nData>({});
  const [editing, setEditing] = useState<string | number | null>(null);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.key];
      if (raw == null || raw === '') continue; // omit → let the schema default / optional apply
      if (f.type === 'number') {
        const n = Number(raw);
        if (!Number.isNaN(n)) payload[f.key] = n;
      } else {
        payload[f.key] = raw;
      }
    }
    if (i18nFields && Object.keys(i18n).length) payload.i18n = i18n;
    return payload;
  };

  const reset = () => { setForm(initial()); setI18n({}); setEditing(null); };

  const save = useMutation({
    mutationFn: () => (editing == null ? apiClient.post(endpoint, buildPayload()) : apiClient.patch(`${endpoint}/${editing}`, buildPayload())),
    onSuccess: () => { reset(); qc.invalidateQueries({ queryKey: [queryKey] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string | number) => apiClient.del(`${endpoint}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const startEdit = (row: Record<string, unknown>) => {
    const next: Record<string, string> = {};
    for (const f of fields) next[f.key] = row[f.key] == null ? '' : String(row[f.key]);
    setForm(next);
    setI18n((row.i18n as I18nData) ?? {});
    setEditing(row.id as string | number);
    if (typeof window !== 'undefined') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const input = 'rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Table head={[...fields.map((f) => f.label), '']}>
        {data.map((row) => (
          <tr key={String(row.id)} className="border-b border-[var(--color-neutral-100)]">
            {fields.map((f) => (
              <td key={f.key} className="px-4 py-2.5">{String(row[f.key] ?? '')}</td>
            ))}
            <td className="whitespace-nowrap px-4 py-2.5 text-right">
              <Btn variant="ghost" onClick={() => startEdit(row)}>Уреди</Btn>
              <Btn variant="ghost" onClick={() => remove.mutate(row.id as string)}>Избриши</Btn>
            </td>
          </tr>
        ))}
      </Table>

      <Card className="mt-6 max-w-2xl">
        <div className="mb-3 text-sm font-medium">{editing == null ? 'Ново' : 'Уреди'}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {fields.map((f) =>
            f.type === 'select' ? (
              <select
                key={f.key}
                className={input}
                value={form[f.key] ?? ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              >
                <option value="">{f.label}…</option>
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                key={f.key}
                className={input}
                type={f.type ?? 'text'}
                placeholder={f.label}
                value={form[f.key] ?? ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              />
            ),
          )}
        </div>
        {i18nFields && (
          <div className="mt-4 border-t border-[var(--color-neutral-200)] pt-4">
            <div className="mb-2 text-sm font-medium">Преводи (EN / SQ)</div>
            <I18nPanel value={i18n} onChange={setI18n} fields={i18nFields} />
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => save.mutate()} disabled={save.isPending}>{editing == null ? 'Додај' : 'Зачувај'}</Btn>
          {editing != null && <Btn variant="ghost" onClick={reset}>Откажи</Btn>}
        </div>
      </Card>
    </>
  );
}
