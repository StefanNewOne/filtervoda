import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

interface Stats {
  total: number;
  byType: { type: string; _count: number }[];
  byStatus: { status: string; _count: number }[];
}

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['stats', 30],
    queryFn: () => apiClient.get<Stats>('/admin/stats/leads?days=30'),
  });

  const byType = data?.byType.map((r) => ({ name: r.type, count: r._count })) ?? [];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Преглед на lead-ови, извори и состојба на испораката" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-xs text-[var(--color-neutral-500)]">ПОСЛЕДНИ 30 ДЕНА</div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-3xl">{data?.total ?? '—'}</div>
          <div className="text-sm text-[var(--color-neutral-500)]">lead-ови</div>
        </Card>
        <Card className="md:col-span-2">
          <div className="mb-2 text-sm font-medium">По тип</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={byType}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-accent-leads)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
