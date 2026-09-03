/**
 * Reusable media picker. Lists media from GET /admin/media, lets the user pick one (or many
 * with `multi`), and can upload a new image inline via the same POST /admin/media the media
 * page uses. onChange returns the selected media ids; previews render from the resolved urls.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useMemo, useRef, useState } from 'react';
import { apiClient } from '../lib/api';
import { Btn } from './ui';

interface Media {
  id: string;
  url: string;
  alt: string;
}

function toArray(value?: string[] | string): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function MediaPicker({
  value,
  multi = false,
  onChange,
}: {
  value?: string[] | string;
  multi?: boolean;
  onChange: (ids: string[]) => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data = [] } = useQuery({ queryKey: ['media'], queryFn: () => apiClient.get<Media[]>('/admin/media') });

  const selected = toArray(value);
  const byId = useMemo(() => new Map(data.map((m) => [m.id, m])), [data]);

  const uploadM = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      return apiClient.upload<Media>('/admin/media', form);
    },
    onSuccess: (media) => {
      setAlt('');
      if (fileRef.current) fileRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['media'] });
      // Auto-select the freshly uploaded image.
      onChange(multi ? [...selected, media.id] : [media.id]);
    },
    onError: (e) => setError((e as Error).message),
  });

  const toggle = (id: string) => {
    if (multi) {
      onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((id) => {
          const m = byId.get(id);
          return (
            <div key={id} className="relative h-16 w-16 overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
              {m ? <img src={m.url} alt={m.alt} className="h-full w-full object-contain p-1" /> : <span className="flex h-full w-full items-center justify-center text-xs text-[var(--color-neutral-400)]">?</span>}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-md bg-[var(--color-danger-600)] text-xs text-white"
                aria-label="Отстрани"
              >
                ×
              </button>
            </div>
          );
        })}
        <Btn type="button" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {selected.length === 0 ? 'Избери слика' : multi ? 'Додај/уреди' : 'Промени'}
        </Btn>
      </div>

      {open && (
        <div className="mt-3 rounded-lg border border-[var(--color-neutral-200)] bg-white p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
            <input
              className="flex-1 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              placeholder="Alt текст"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
            <Btn
              type="button"
              disabled={uploadM.isPending}
              onClick={() => {
                setError(null);
                const f = fileRef.current?.files?.[0];
                if (f) uploadM.mutate(f);
              }}
            >
              {uploadM.isPending ? 'Се прикачува…' : 'Прикачи'}
            </Btn>
          </div>
          {error && <p className="mb-2 text-sm text-[var(--color-danger-600)]">{error}</p>}

          <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
            {data.map((m) => {
              const isSel = selected.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className={clsx(
                    'overflow-hidden rounded-md border-2 bg-[var(--color-neutral-100)] transition',
                    isSel ? 'border-[var(--color-brand-600)]' : 'border-transparent hover:border-[var(--color-neutral-200)]',
                  )}
                  title={m.alt}
                >
                  <img src={m.url} alt={m.alt} className="aspect-square w-full object-contain p-1" />
                </button>
              );
            })}
          </div>
          {data.length === 0 && <p className="text-sm text-[var(--color-neutral-500)]">Сè уште нема слики.</p>}

          <div className="mt-3 flex justify-end">
            <Btn type="button" variant="ghost" onClick={() => setOpen(false)}>Затвори</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
