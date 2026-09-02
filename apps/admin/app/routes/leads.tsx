import { LEAD_STATUS_LABELS_MK } from '@filtervoda/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { Btn, PageHeader, StatusPill, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface LeadRow {
  id: string;
  type: string;
  name: string;
  phone: string;
  city?: string;
  status: string;
  createdAt: string;
  isDuplicate: boolean;
}

const FILTERS = ['Сите', 'B2C', 'B2B', 'CONTACT', 'ADVISOR'];

export default function Leads() {
  const [filter, setFilter] = useState('Сите');
  const query = filter === 'Сите' ? '' : `?type=${filter}`;
  const { data = [] } = useQuery({ queryKey: ['leads', filter], queryFn: () => apiClient.get<LeadRow[]>(`/admin/leads${query}`) });

  return (
    <>
      <PageHeader
        title="Lead-ови"
        subtitle="Барања од сајтот, повици и Viber — со статус, белешки и извоз"
        actions={
          <a href="/api/v1/admin/leads/export" className="inline-flex min-h-9 items-center rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 text-sm">
            Извези CSV
          </a>
        }
      />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Btn key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>{f}</Btn>
        ))}
      </div>
      <Table head={['Кога', 'Тип', 'Име', 'Телефон', 'Град', 'Статус', '']}>
        {data.map((l) => (
          <tr key={l.id} className={`border-b border-[var(--color-neutral-100)] ${l.status === 'NEW' ? 'border-l-2 border-l-[var(--color-accent-leads)]' : ''}`}>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{new Date(l.createdAt).toLocaleString('mk-MK')}</td>
            <td className="px-4 py-2.5">{l.type}</td>
            <td className="px-4 py-2.5 font-medium">{l.name}{l.isDuplicate && <span className="ml-1 text-xs text-[var(--color-warning-600)]">дупликат</span>}</td>
            <td className="px-4 py-2.5">{l.phone}</td>
            <td className="px-4 py-2.5">{l.city ?? '—'}</td>
            <td className="px-4 py-2.5"><StatusPill status={l.status} /> <span className="text-xs text-[var(--color-neutral-400)]">{LEAD_STATUS_LABELS_MK[l.status as keyof typeof LEAD_STATUS_LABELS_MK]}</span></td>
            <td className="px-4 py-2.5"><Link to={`/leads/${l.id}`} className="text-[var(--color-brand-600)]">Отвори</Link></td>
          </tr>
        ))}
      </Table>
      {data.length === 0 && <p className="mt-4 text-[var(--color-neutral-500)]">Нема lead-ови.</p>}
    </>
  );
}
