import { LEAD_STATUSES, LEAD_STATUS_LABELS_MK, LEAD_TYPES } from '@filtervoda/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader, StatusPill, Table } from '../components/ui';
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

const input = 'rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

export default function Leads() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (type) params.set('type', type);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();

  const { data = [] } = useQuery({
    queryKey: ['leads', qs],
    queryFn: () => apiClient.get<LeadRow[]>(`/admin/leads${qs ? `?${qs}` : ''}`),
  });

  return (
    <>
      <PageHeader
        title="Lead-ови"
        subtitle="Барања од сајтот, повици и Viber — со статус, белешки и извоз"
        actions={
          <a href={`/api/v1/admin/leads/export${qs ? `?${qs}` : ''}`} className="inline-flex min-h-9 items-center rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 text-sm">
            Извези CSV
          </a>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className={`${input} min-w-56 flex-1`} placeholder="Пребарувај (име, телефон, фирма)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Сите типови</option>
          {LEAD_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Сите статуси</option>
          {LEAD_STATUSES.map((s) => (<option key={s} value={s}>{LEAD_STATUS_LABELS_MK[s]}</option>))}
        </select>
        <label className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">Од<input type="date" className={input} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="flex items-center gap-1 text-sm text-[var(--color-neutral-500)]">До<input type="date" className={input} value={to} onChange={(e) => setTo(e.target.value)} /></label>
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
