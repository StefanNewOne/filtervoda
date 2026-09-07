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
  const [pw, setPw] = useState('');
  const [reauthed, setReauthed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => apiClient.post('/admin/users', form),
    onSuccess: () => { setForm({ name: '', email: '', role: 'EDITOR', password: '' }); qc.invalidateQueries({ queryKey: ['users'] }); },
  });
  // Destructive user ops need a fresh re-auth (valid ~10 min); confirm the password once.
  const reauth = useMutation({
    mutationFn: () => apiClient.post('/auth/reauth', { password: pw }),
    onSuccess: () => { setReauthed(true); setPw(''); setErr(null); },
    onError: () => setErr('Погрешна лозинка.'),
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiClient.patch(`/admin/users/${id}`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => setErr((e as Error).message || 'Измената не успеа (потврдете ја лозинката повторно).'),
  });
  const del = useMutation({
    mutationFn: (id: string) => apiClient.del(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => setErr((e as Error).message || 'Бришењето не успеа (потврдете ја лозинката повторно).'),
  });

  const input = 'rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

  return (
    <>
      <PageHeader title="Корисници и улоги" subtitle="ADMIN, EDITOR и CLIENT_VIEWER — промена на улога и бришење" />

      {!reauthed && (
        <Card className="mb-4 max-w-2xl border-[var(--color-warning-300,#f0c000)] bg-[var(--color-warning-100,#fff7db)]">
          <div className="mb-2 text-sm font-medium">Потврдете ја вашата лозинка за да менувате улоги или да бришете корисници</div>
          <div className="flex gap-2">
            <input className={input} type="password" placeholder="Лозинка" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Btn onClick={() => reauth.mutate()} disabled={!pw || reauth.isPending}>Потврди</Btn>
          </div>
          {err && <p className="mt-2 text-sm text-[var(--color-danger-600)]">{err}</p>}
        </Card>
      )}

      <Table head={['Име', 'Email', 'Улога', 'Последна најава', '']}>
        {data.map((u) => (
          <tr key={u.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{u.name}</td>
            <td className="px-4 py-2.5">{u.email}</td>
            <td className="px-4 py-2.5">
              {reauthed ? (
                <select className={input} value={u.role} onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value })}>
                  {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                u.role
              )}
            </td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('mk-MK') : '—'}</td>
            <td className="px-4 py-2.5 text-right">
              {reauthed && (
                <button
                  className="text-[var(--color-danger-600)]"
                  onClick={() => { if (window.confirm(`Избриши го корисникот ${u.email}?`)) del.mutate(u.id); }}
                >
                  Избриши
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
      {reauthed && err && <p className="mt-2 text-sm text-[var(--color-danger-600)]">{err}</p>}

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
