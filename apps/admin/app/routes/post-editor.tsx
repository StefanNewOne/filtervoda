import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MediaPicker } from '../components/MediaPicker';
import { RichText } from '../components/RichText';
import { Btn, Card, Hint, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

interface Post {
  id: string; title: string; slug: string; excerpt?: string; status: string;
  content?: { html?: string } | null; coverMediaId?: string | null; seoTitle?: string; seoDescription?: string;
}
const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

export default function PostEditor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['post', id], queryFn: () => apiClient.get<Post>(`/admin/posts/${id}`) });
  const [f, setF] = useState<Partial<Post>>({});
  const [html, setHtml] = useState('');
  const [cover, setCover] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { if (data) { setF(data); setHtml(data.content?.html ?? ''); setCover(data.coverMediaId ?? ''); } }, [data]);
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const save = useMutation({
    mutationFn: () => apiClient.patch(`/admin/posts/${id}`, { title: f.title, slug: f.slug, excerpt: f.excerpt, contentHtml: html, coverMediaId: cover || undefined, seoTitle: f.seoTitle, seoDescription: f.seoDescription, status: f.status }),
    onSuccess: () => { say('Зачувано'); qc.invalidateQueries({ queryKey: ['post', id] }); },
  });
  const publish = useMutation({ mutationFn: (a: 'publish' | 'unpublish') => apiClient.post(`/admin/posts/${id}/${a}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['post', id] }) });

  if (!data) return <p className="text-[var(--color-neutral-500)]">Се вчитува…</p>;

  return (
    <>
      <PageHeader
        title={data.title}
        subtitle={data.status === 'PUBLISHED' ? 'Објавено' : 'Нацрт'}
        actions={
          <div className="flex items-center gap-2">
            {msg && <span className="text-sm text-[var(--color-success-600)]">{msg}</span>}
            <Btn variant="ghost" onClick={() => save.mutate()}>Зачувај</Btn>
            {data.status === 'PUBLISHED'
              ? <Btn variant="ghost" onClick={() => publish.mutate('unpublish')}>Врати во нацрт</Btn>
              : <Btn onClick={() => publish.mutate('publish')}>Објави</Btn>}
          </div>
        }
      />
      <Card className="max-w-3xl space-y-3">
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Наслов</span><input className={input} value={f.title ?? ''} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Slug</span><input className={input} value={f.slug ?? ''} onChange={(e) => setF({ ...f, slug: e.target.value })} /></label>
        <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Извадок</span><textarea className={input} rows={2} value={f.excerpt ?? ''} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></label>
        <div className="text-sm">
          <span className="text-[var(--color-neutral-500)]">Насловна слика</span>
          <MediaPicker value={cover} onChange={(ids) => setCover(ids[0] ?? '')} />
          <Hint>Се прикажува на листата „Совети“ и на врвот на статијата.</Hint>
        </div>
        <div className="text-sm"><span className="text-[var(--color-neutral-500)]">Содржина</span><div className="mt-1"><RichText value={html} onChange={setHtml} /></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO наслов</span><input className={input} maxLength={70} value={f.seoTitle ?? ''} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} /></label>
          <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO опис</span><input className={input} maxLength={160} value={f.seoDescription ?? ''} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} /></label>
        </div>
      </Card>
    </>
  );
}
