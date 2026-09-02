import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Btn, Card, PageHeader, Table } from './ui';

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number';
}

/** Minimal audited CRUD UI over an admin endpoint. Create + delete; matches the API crud factory. */
export function GenericCrud({
  title,
  subtitle,
  endpoint,
  fields,
  queryKey,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  fields: Field[];
  queryKey: string;
}) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: [queryKey], queryFn: () => apiClient.get<Record<string, unknown>[]>(endpoint) });
  const [form, setForm] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {};
      for (const f of fields) payload[f.key] = f.type === 'number' ? Number(form[f.key]) : form[f.key];
      return apiClient.post(endpoint, payload);
    },
    onSuccess: () => { setForm({}); qc.invalidateQueries({ queryKey: [queryKey] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string | number) => apiClient.del(`${endpoint}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

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
            <td className="px-4 py-2.5"><Btn variant="ghost" onClick={() => remove.mutate(row.id as string)}>Избриши</Btn></td>
          </tr>
        ))}
      </Table>

      <Card className="mt-6 max-w-2xl">
        <div className="mb-3 text-sm font-medium">Ново</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {fields.map((f) => (
            <input
              key={f.key}
              className={input}
              type={f.type ?? 'text'}
              placeholder={f.label}
              value={form[f.key] ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          ))}
        </div>
        <Btn className="mt-3" onClick={() => create.mutate()} disabled={create.isPending}>Додај</Btn>
      </Card>
    </>
  );
}
