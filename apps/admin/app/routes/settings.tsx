import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Btn, Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

interface SettingRow {
  key: string;
  value: unknown;
}

export default function Settings() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<SettingRow[]>('/admin/settings') });
  const [edits, setEdits] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => apiClient.put(`/admin/settings/${encodeURIComponent(key)}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  return (
    <>
      <PageHeader title="Напредни поставки" subtitle="Директен пристап до сите поставки (сиров JSON) — само за развивач" />
      <div className="mb-4 rounded-md border border-[var(--color-warning-300,#f0c000)] bg-[var(--color-warning-100,#fff7db)] px-4 py-3 text-sm text-[var(--color-neutral-700)]">
        ⚠️ Напредно. Обичните текстови менувај ги во соодветните модули (Страници и копи, За фирми, Контакт, Tracking…). Тука се уредува сиров JSON — погрешен формат може да расипе поставка.
      </div>
      <div className="space-y-2">
        {data.map((s) => {
          const current = edits[s.key] ?? JSON.stringify(s.value);
          return (
            <Card key={s.key} className="flex items-center gap-3">
              <div className="w-64 shrink-0 font-mono text-xs">{s.key}</div>
              <input
                className="flex-1 rounded-md border border-[var(--color-neutral-200)] px-3 py-1.5 font-mono text-xs"
                value={current}
                onChange={(e) => setEdits((v) => ({ ...v, [s.key]: e.target.value }))}
              />
              <Btn
                variant="ghost"
                onClick={() => {
                  try {
                    save.mutate({ key: s.key, value: JSON.parse(current) });
                  } catch {
                    save.mutate({ key: s.key, value: current });
                  }
                }}
              >
                Зачувај
              </Btn>
            </Card>
          );
        })}
      </div>
    </>
  );
}
