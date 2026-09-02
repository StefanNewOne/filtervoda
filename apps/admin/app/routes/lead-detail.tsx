import { LEAD_STATUSES, LEAD_STATUS_LABELS_MK } from '@filtervoda/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { Btn, Card, PageHeader, StatusPill } from '../components/ui';
import { apiClient } from '../lib/api';

interface LeadDetail {
  id: string;
  type: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  company?: string;
  message?: string;
  status: string;
  lostReason?: string;
  section?: string;
  referrer?: string;
  createdAt: string;
  notes: { id: string; text: string; createdAt: string }[];
  events: { id: string; type: string; createdAt: string }[];
}

export default function LeadDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [lostReason, setLostReason] = useState('');

  const { data: lead } = useQuery({ queryKey: ['lead', id], queryFn: () => apiClient.get<LeadDetail>(`/admin/leads/${id}`) });

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      apiClient.patch(`/admin/leads/${id}`, { status, ...(status === 'LOST' ? { lostReason } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const addNote = useMutation({
    mutationFn: () => apiClient.post(`/admin/leads/${id}/notes`, { text: note }),
    onSuccess: () => { setNote(''); qc.invalidateQueries({ queryKey: ['lead', id] }); },
  });

  if (!lead) return <p className="text-[var(--color-neutral-500)]">Се вчитува…</p>;

  return (
    <>
      <PageHeader
        title={lead.name}
        subtitle={`${lead.type} · ${new Date(lead.createdAt).toLocaleString('mk-MK')}`}
        actions={<a href={`tel:${lead.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-3.5 text-sm text-white"><Phone size={16} /> Повикај</a>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {([['Телефон', lead.phone], ['Email', lead.email], ['Град', lead.city], ['Фирма', lead.company], ['Извор', lead.section ?? lead.referrer], ['Порака', lead.message]] as const)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[var(--color-neutral-500)]">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2 text-sm">Статус: <StatusPill status={lead.status} /></div>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map((s) => (
                <Btn key={s} variant={s === lead.status ? 'primary' : 'ghost'} onClick={() => updateStatus.mutate(s)}>
                  {LEAD_STATUS_LABELS_MK[s]}
                </Btn>
              ))}
            </div>
            {(lead.status === 'LOST' || lostReason) && (
              <input
                className="mt-3 w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                placeholder="Причина за „Изгубено“"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            )}
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-medium">Белешки</div>
            <div className="flex gap-2">
              <input className="flex-1 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Додај белешка" />
              <Btn onClick={() => addNote.mutate()} disabled={!note}>Додај</Btn>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {lead.notes.map((n) => (
                <li key={n.id} className="rounded-md bg-[var(--color-neutral-50)] p-2">{n.text}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-sm font-medium">Timeline</div>
          <ol className="space-y-2 text-sm">
            {lead.events.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span>{e.type}</span>
                <span className="text-xs text-[var(--color-neutral-400)]">{new Date(e.createdAt).toLocaleString('mk-MK')}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
