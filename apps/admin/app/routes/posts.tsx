import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { Btn, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface Post { id: string; title: string; slug: string; status: string; publishedAt?: string }

export default function Posts() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['posts'], queryFn: () => apiClient.get<Post[]>('/admin/posts') });
  const [title, setTitle] = useState('');
  const create = useMutation({
    mutationFn: () => apiClient.post<Post>('/admin/posts', { title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'nova-statija' }),
    onSuccess: () => { setTitle(''); qc.invalidateQueries({ queryKey: ['posts'] }); },
  });

  return (
    <>
      <PageHeader title="Совети" subtitle="Статии, категории, поврзан производ и закажано објавување" />
      <div className="mb-4 flex gap-2">
        <input className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm" placeholder="Наслов на нова статија" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Btn onClick={() => create.mutate()} disabled={!title || create.isPending}>Нова статија</Btn>
      </div>
      <Table head={['Наслов', 'Slug', 'Статус', '']}>
        {data.map((p) => (
          <tr key={p.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{p.title}</td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{p.slug}</td>
            <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'PUBLISHED' ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'}`}>{p.status === 'PUBLISHED' ? 'Објавено' : 'Нацрт'}</span></td>
            <td className="px-4 py-2.5"><Link to={`/posts/${p.id}`} className="text-[var(--color-brand-600)]">Уреди</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
