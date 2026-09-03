import { PRODUCT_AUDIENCES } from '@filtervoda/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Btn, Card, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  priceRegular?: number;
  priceSale?: number;
  category?: { name: string };
}

interface Category {
  id: number;
  name: string;
}

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

const AUDIENCE_LABELS: Record<(typeof PRODUCT_AUDIENCES)[number], string> = {
  B2C: 'Домаќинства (B2C)',
  B2B: 'Фирми (B2B)',
  BOTH: 'Двете',
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function Products() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiClient.get<ProductRow[]>('/admin/products') });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => apiClient.get<Category[]>('/admin/categories') });
  const fmt = (n?: number) => (n == null ? '—' : `${new Intl.NumberFormat('mk-MK').format(n)} ден.`);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [audience, setAudience] = useState<(typeof PRODUCT_AUDIENCES)[number]>('B2C');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      apiClient.post<{ id: string }>('/admin/products', {
        name,
        slug: slug || slugify(name),
        categoryId: Number(categoryId),
        audience,
      }),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate(`/products/${p.id}`);
    },
    onError: (e) => setError((e as Error).message),
  });

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const canCreate = name.trim().length >= 2 && categoryId !== '';

  return (
    <>
      <PageHeader
        title="Производи"
        subtitle="Каталог, спецификации, галерии, цени и беџови"
        actions={<Btn onClick={() => setCreating((c) => !c)}>Нов производ</Btn>}
      />

      {creating && (
        <Card className="mb-6 max-w-2xl space-y-3">
          <label className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">Име</span>
            <input className={input} value={name} onChange={(e) => onName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">Slug</span>
            <input className={input} value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">Категорија</span>
            <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">— Избери —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-[var(--color-neutral-500)]">Публика</span>
            <select className={input} value={audience} onChange={(e) => setAudience(e.target.value as (typeof PRODUCT_AUDIENCES)[number])}>
              {PRODUCT_AUDIENCES.map((a) => (
                <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>
              ))}
            </select>
          </label>
          {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
          <div className="flex gap-2">
            <Btn disabled={!canCreate || create.isPending} onClick={() => { setError(null); create.mutate(); }}>
              {create.isPending ? 'Се создава…' : 'Создај и уреди'}
            </Btn>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Откажи</Btn>
          </div>
        </Card>
      )}

      <Table head={['Име', 'Категорија', 'Цена', 'Статус', '']}>
        {data.map((p) => (
          <tr key={p.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{p.name}</td>
            <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{p.category?.name ?? '—'}</td>
            <td className="px-4 py-2.5">{fmt(p.priceSale ?? p.priceRegular)}</td>
            <td className="px-4 py-2.5">
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'PUBLISHED' ? 'bg-[var(--color-success-100)] text-[var(--color-success-600)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'}`}>
                {p.status === 'PUBLISHED' ? 'Објавено' : 'Нацрт'}
              </span>
            </td>
            <td className="px-4 py-2.5"><Link to={`/products/${p.id}`} className="text-[var(--color-brand-600)]">Уреди</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
