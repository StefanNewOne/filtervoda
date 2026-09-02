import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Btn, Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

interface Media {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function MediaLibrary() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data = [] } = useQuery({ queryKey: ['media'], queryFn: () => apiClient.get<Media[]>('/admin/media') });

  const uploadM = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      return apiClient.upload('/admin/media', form);
    },
    onSuccess: () => { setAlt(''); if (fileRef.current) fileRef.current.value = ''; qc.invalidateQueries({ queryKey: ['media'] }); },
    onError: (e) => setError((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: string) => apiClient.del(`/admin/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  return (
    <>
      <PageHeader title="Медиуми" subtitle="Слики со alt текст, автоматски AVIF/WebP варијанти и замена" />
      <Card className="mb-6 max-w-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          <input className="flex-1 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm" placeholder="Alt текст (задолжително)" value={alt} onChange={(e) => setAlt(e.target.value)} />
          <Btn
            disabled={uploadM.isPending}
            onClick={() => { setError(null); const f = fileRef.current?.files?.[0]; if (f) uploadM.mutate(f); }}
          >
            {uploadM.isPending ? 'Се прикачува…' : 'Прикачи'}
          </Btn>
        </div>
        {error && <p className="mt-2 text-sm text-[var(--color-danger-600)]">{error}</p>}
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {data.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white">
            <div className="aspect-square bg-[var(--color-neutral-100)]">
              <img src={m.url} alt={m.alt} className="h-full w-full object-contain p-2" />
            </div>
            <div className="p-2">
              <div className="truncate text-xs text-[var(--color-neutral-500)]" title={m.alt}>{m.alt || '(без alt)'}</div>
              <button onClick={() => del.mutate(m.id)} className="mt-1 text-xs text-[var(--color-danger-600)]">Избриши</button>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && <p className="text-[var(--color-neutral-500)]">Сè уште нема слики.</p>}
    </>
  );
}
