import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Btn, PageHeader, Table } from '../components/ui';
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

export default function Products() {
  const { data = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiClient.get<ProductRow[]>('/admin/products') });
  const fmt = (n?: number) => (n == null ? '—' : `${new Intl.NumberFormat('mk-MK').format(n)} ден.`);

  return (
    <>
      <PageHeader title="Производи" subtitle="Каталог, спецификации, галерии, цени и беџови" actions={<Btn>Нов производ</Btn>} />
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
