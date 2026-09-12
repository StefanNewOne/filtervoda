import { formatMkPhoneDisplay, LEAD_STATUS_LABELS_MK, telHref } from '@filtervoda/shared';
import { useQuery } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import { Link } from 'react-router';
import { Card, PageHeader, StatusPill, Table } from '../components/ui';
import { apiClient } from '../lib/api';
import { useAuth } from '../lib/auth';

interface Breakdown { key: string; count: number }
interface RecentLead {
  id: string; type: string; name: string; phone: string; city?: string | null;
  status: string; createdAt: string; isDuplicate: boolean;
}
interface Overview {
  counts: { today: number; last7: number; prev7: number; last30: number };
  byType: Breakdown[];
  byStatus: Breakdown[];
  bySource: Breakdown[];
  recent: RecentLead[];
}

const TYPE_LABELS: Record<string, string> = {
  B2C: 'Домаќинство', B2B: 'Фирма', CONTACT: 'Контакт', ADVISOR: 'Совет',
};

function Kpi({ label, value, delta }: { label: string; value: number; delta?: number }) {
  return (
    <Card>
      <div className="text-xs text-[var(--color-neutral-500)]">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-3xl">{value}</span>
        {delta != null && delta !== 0 && (
          <span className={delta > 0 ? 'text-sm text-[var(--color-success-600)]' : 'text-sm text-[var(--color-danger-600)]'}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="text-sm text-[var(--color-neutral-500)]">lead-ови</div>
    </Card>
  );
}

/** A compact „label · bar · count" list for the status/source breakdowns. */
function BreakdownList({ title, rows, labelOf }: { title: string; rows: Breakdown[]; labelOf?: (k: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card>
      <div className="mb-3 text-sm font-medium">{title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Нема податоци.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-sm">
              <span className="truncate text-[var(--color-neutral-600)]">{labelOf ? labelOf(r.key) : r.key}</span>
              <span className="h-2 rounded-full bg-[var(--color-neutral-100)]">
                <span className="block h-2 rounded-full bg-[var(--color-accent-leads)]" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums text-[var(--color-neutral-500)]">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { me } = useAuth();
  const isEditor = me?.role === 'ADMIN' || me?.role === 'EDITOR';

  const { data } = useQuery({
    queryKey: ['lead-overview'],
    queryFn: () => apiClient.get<Overview>('/admin/leads/overview'),
  });

  // Delivery problems are ops-only (editors); CLIENT_VIEWER never sees the outbox.
  const { data: dead = [] } = useQuery({
    queryKey: ['outbox-dead'],
    queryFn: () => apiClient.get<unknown[]>('/admin/outbox?status=DEAD'),
    enabled: isEditor,
  });

  const c = data?.counts;
  const delta = c ? c.last7 - c.prev7 : undefined;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Најнови lead-ови, извори и состојба на испораката" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="ДЕНЕС" value={c?.today ?? 0} />
        <Kpi label="ПОСЛЕДНИ 7 ДЕНА" value={c?.last7 ?? 0} delta={delta} />
        <Kpi label="ПОСЛЕДНИ 30 ДЕНА" value={c?.last30 ?? 0} />
      </div>

      {isEditor && dead.length > 0 && (
        <Link to="/outbox" className="mt-4 flex items-center justify-between rounded-lg border border-[var(--color-danger-200,#f3c1bd)] bg-[var(--color-danger-50,#fdf0ef)] px-4 py-3 text-sm">
          <span className="font-medium text-[var(--color-danger-600)]">⚠ {dead.length} проблем(и) со испорака — некое известување не е испратено</span>
          <span className="text-[var(--color-danger-600)]">Отвори →</span>
        </Link>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Најнови lead-ови</div>
            <Link to="/leads" className="text-sm text-[var(--color-brand-600)]">Сите →</Link>
          </div>
          <Table head={['Кога', 'Тип', 'Име', 'Телефон', 'Статус', '']}>
            {(data?.recent ?? []).map((l) => (
              <tr key={l.id} className={`border-b border-[var(--color-neutral-100)] ${l.status === 'NEW' ? 'border-l-2 border-l-[var(--color-accent-leads)]' : ''}`}>
                <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{new Date(l.createdAt).toLocaleString('mk-MK')}</td>
                <td className="px-4 py-2.5">{TYPE_LABELS[l.type] ?? l.type}</td>
                <td className="px-4 py-2.5 font-medium">{l.name}{l.isDuplicate && <span className="ml-1 text-xs text-[var(--color-warning-600)]">дупликат</span>}</td>
                <td className="px-4 py-2.5">
                  <a href={telHref(l.phone)} className="inline-flex items-center gap-1 text-[var(--color-brand-600)]"><Phone size={13} /> {formatMkPhoneDisplay(l.phone)}</a>
                </td>
                <td className="px-4 py-2.5"><StatusPill status={l.status} /></td>
                <td className="px-4 py-2.5"><Link to={`/leads/${l.id}`} className="text-[var(--color-brand-600)]">Отвори</Link></td>
              </tr>
            ))}
          </Table>
          {data && data.recent.length === 0 && <p className="mt-4 text-sm text-[var(--color-neutral-500)]">Сè уште нема lead-ови.</p>}
        </Card>

        <div className="space-y-4">
          <BreakdownList title="По статус (30 дена)" rows={data?.byStatus ?? []} labelOf={(k) => LEAD_STATUS_LABELS_MK[k as keyof typeof LEAD_STATUS_LABELS_MK] ?? k} />
          <BreakdownList title="По извор (30 дена)" rows={data?.bySource ?? []} />
          <BreakdownList title="По тип (30 дена)" rows={data?.byType ?? []} labelOf={(k) => TYPE_LABELS[k] ?? k} />
        </div>
      </div>

      {isEditor && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/products" className="rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 py-2 text-sm hover:bg-[var(--color-neutral-100)]">+ Производи</Link>
          <Link to="/posts" className="rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 py-2 text-sm hover:bg-[var(--color-neutral-100)]">+ Совет</Link>
          <Link to="/b2b" className="rounded-md border border-[var(--color-neutral-200)] bg-white px-3.5 py-2 text-sm hover:bg-[var(--color-neutral-100)]">За фирми</Link>
        </div>
      )}
    </>
  );
}
