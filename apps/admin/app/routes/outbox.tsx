import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Btn, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface Job {
  id: string;
  type: string;
  status: string;
  attempts: number;
  lastError?: string;
  updatedAt: string;
}

export default function Outbox() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['outbox'], queryFn: () => apiClient.get<Job[]>('/admin/outbox?status=DEAD') });
  const retry = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/outbox/${id}/retry`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outbox'] }),
  });

  return (
    <>
      <PageHeader title="Проблеми со испорака" subtitle="Задачи што не поминале по 5 обиди — email, Meta CAPI, webhook" />
      <Table head={['Тип', 'Статус', 'Обиди', 'Грешка', 'Ажурирано', '']}>
        {data.map((j) => (
          <tr key={j.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{j.type}</td>
            <td className="px-4 py-2.5"><span className="rounded-full bg-[var(--color-danger-100)] px-2 py-0.5 text-xs text-[var(--color-danger-600)]">{j.status}</span></td>
            <td className="px-4 py-2.5">{j.attempts}</td>
            <td className="px-4 py-2.5 text-xs text-[var(--color-neutral-500)]">{j.lastError ?? '—'}</td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{new Date(j.updatedAt).toLocaleString('mk-MK')}</td>
            <td className="px-4 py-2.5"><Btn variant="ghost" onClick={() => retry.mutate(j.id)}>Обиди повторно</Btn></td>
          </tr>
        ))}
      </Table>
      {data.length === 0 && <p className="mt-4 text-[var(--color-neutral-500)]">Нема проблеми со испорака.</p>}
    </>
  );
}
