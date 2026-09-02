import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Btn, Card, PageHeader } from './ui';

export interface SettingField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'list';
  hint?: string;
}

/** Edits a curated set of Setting keys with friendly labels. Values are stored as JSON. */
export function SettingsGroup({ title, subtitle, fields }: { title: string; subtitle: string; fields: SettingField[] }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const [vals, setVals] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const map: Record<string, unknown> = {};
    for (const row of data) map[row.key] = row.value;
    setVals(map);
  }, [data]);

  const save = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => apiClient.put(`/admin/settings/${encodeURIComponent(key)}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
  const set = (k: string, v: unknown) => setVals((s) => ({ ...s, [k]: v }));

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="max-w-2xl space-y-4">
        {fields.map((fld) => {
          const v = vals[fld.key];
          return (
            <div key={fld.key}>
              <label className="block text-sm font-medium">{fld.label}</label>
              {fld.hint && <p className="mb-1 text-xs text-[var(--color-neutral-500)]">{fld.hint}</p>}
              {fld.type === 'textarea' ? (
                <textarea className={input} rows={3} value={String(v ?? '')} onChange={(e) => set(fld.key, e.target.value)} />
              ) : fld.type === 'boolean' ? (
                <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(fld.key, e.target.checked)} />
              ) : fld.type === 'number' ? (
                <input type="number" className={input} value={Number(v ?? 0)} onChange={(e) => set(fld.key, Number(e.target.value))} />
              ) : fld.type === 'list' ? (
                <input className={input} value={Array.isArray(v) ? v.join(', ') : ''} onChange={(e) => set(fld.key, e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
              ) : (
                <input className={input} value={String(v ?? '')} onChange={(e) => set(fld.key, e.target.value)} />
              )}
              <div className="mt-1">
                <Btn variant="ghost" onClick={() => save.mutate({ key: fld.key, value: vals[fld.key] })}>Зачувај</Btn>
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
