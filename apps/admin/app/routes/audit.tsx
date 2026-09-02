import { useQuery } from '@tanstack/react-query';
import { PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface AuditRow {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

export default function Audit() {
  const { data = [] } = useQuery({ queryKey: ['audit'], queryFn: () => apiClient.get<AuditRow[]>('/admin/audit') });
  return (
    <>
      <PageHeader title="Audit лог" subtitle="Секоја промена: кој, што, кога — само за читање" />
      <Table head={['Кога', 'Актер', 'Акција', 'Ентитет', 'ID']}>
        {data.map((a) => (
          <tr key={a.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{new Date(a.createdAt).toLocaleString('mk-MK')}</td>
            <td className="px-4 py-2.5">{a.actorName}</td>
            <td className="px-4 py-2.5 font-medium">{a.action}</td>
            <td className="px-4 py-2.5">{a.entity}</td>
            <td className="px-4 py-2.5 text-xs text-[var(--color-neutral-400)]">{a.entityId}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
