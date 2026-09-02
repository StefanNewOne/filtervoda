import { USER_ROLES } from '@filtervoda/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Btn, Card, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLoginAt?: string;
}

export default function Users() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['users'], queryFn: () => apiClient.get<UserRow[]>('/admin/users') });
  const [form, setForm] = useState({ name: '', email: '', role: 'EDITOR', password: '' });
  const create = useMutation({
    mutationFn: () => apiClient.post('/admin/users', form),
    onSuccess: () => { setForm({ name: '', email: '', role: 'EDITOR', password: '' }); qc.invalidateQueries({ queryKey: ['users'] }); },
  });
  const input = 'rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

  return (
    <>
      <PageHeader title="Корисници и улоги" subtitle="ADMIN, EDITOR и CLIENT_VIEWER, заклучување и ресет на лозинка" />
      <Table head={['Име', 'Email', 'Улога', 'Последна најава']}>
        {data.map((u) => (
          <tr key={u.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{u.name}</td>
            <td className="px-4 py-2.5">{u.email}</td>
            <td className="px-4 py-2.5">{u.role}</td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('mk-MK') : '—'}</td>
          </tr>
        ))}
      </Table>

      <Card className="mt-6 max-w-2xl">
        <div className="mb-3 text-sm font-medium">Нов корисник</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={input} placeholder="Име" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className={input} placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select className={input} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className={input} type="password" placeholder="Лозинка (мин. 10)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </div>
        <Btn className="mt-3" onClick={() => create.mutate()} disabled={create.isPending}>Креирај</Btn>
      </Card>
    </>
  );
}
