import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MediaPicker } from '../components/MediaPicker';
import { Btn, Card, Hint, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface Category { id: number; name: string; slug: string; description?: string; imageId?: string; sortOrder: number }

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
const empty = { name: '', slug: '', description: '', imageId: '', sortOrder: 0 };

export default function Categories() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['categories'], queryFn: () => apiClient.get<Category[]>('/admin/categories') });
  const [form, setForm] = useState<Omit<Category, 'id'>>(empty);
  const [editing, setEditing] = useState<number | null>(null);

  const reset = () => { setForm(empty); setEditing(null); };
  const save = useMutation({
    mutationFn: () => {
      const body = { name: form.name, slug: form.slug, description: form.description || undefined, imageId: form.imageId || undefined, sortOrder: Number(form.sortOrder) || 0 };
      return editing == null ? apiClient.post('/admin/categories', body) : apiClient.patch(`/admin/categories/${editing}`, body);
    },
    onSuccess: () => { reset(); qc.invalidateQueries({ queryKey: ['categories'] }); },
  });
  const remove = useMutation({ mutationFn: (id: number) => apiClient.del(`/admin/categories/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) });

  const startEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', imageId: c.imageId ?? '', sortOrder: c.sortOrder });
    setEditing(c.id);
    if (typeof window !== 'undefined') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader title="Категории" subtitle="Групи на производи — име, редослед, опис и слика" />
      <Table head={['Слика', 'Име', 'Slug', 'Редослед', '']}>
        {[...data].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
          <tr key={c.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5">{c.imageId ? <span className="text-xs text-[var(--color-success-600)]">✓ има</span> : <span className="text-xs text-[var(--color-neutral-400)]">—</span>}</td>
            <td className="px-4 py-2.5 font-medium">{c.name}</td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{c.slug}</td>
            <td className="px-4 py-2.5">{c.sortOrder}</td>
            <td className="whitespace-nowrap px-4 py-2.5 text-right">
              <Btn variant="ghost" onClick={() => startEdit(c)}>Уреди</Btn>
              <Btn variant="ghost" onClick={() => remove.mutate(c.id)}>Избриши</Btn>
            </td>
          </tr>
        ))}
      </Table>

      <Card className="mt-6 max-w-2xl space-y-3">
        <div className="text-sm font-medium">{editing == null ? 'Нова категорија' : 'Уреди категорија'}</div>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Име</span><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Slug</span><input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><Hint>Дел од URL-то (пр. pod-mijalnik). Мали букви, без празни места.</Hint></label>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Опис</span><textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><Hint>Краток текст под категоријата на каталогот.</Hint></label>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Редослед</span><input type="number" className={input} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></label>
        <div className="text-sm">
          <span className="text-[var(--color-neutral-500)]">Слика</span>
          <MediaPicker value={form.imageId} onChange={(ids) => setForm({ ...form, imageId: ids[0] ?? '' })} />
        </div>
        <div className="flex gap-2 pt-1">
          <Btn onClick={() => save.mutate()} disabled={!form.name || !form.slug || save.isPending}>{editing == null ? 'Додај' : 'Зачувај'}</Btn>
          {editing != null && <Btn variant="ghost" onClick={reset}>Откажи</Btn>}
        </div>
      </Card>
    </>
  );
}
