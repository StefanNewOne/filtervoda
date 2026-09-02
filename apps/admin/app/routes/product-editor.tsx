import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Btn, Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

const TABS = ['Основно', 'Придобивки', 'Степени', 'Спецификација', 'Цена и беџови', 'SEO'];
const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

interface Spec { group: string; label: string; value: string; unit?: string }
interface Stage { order: number; name: string; removes: string; whyItMatters: string }
interface Product {
  id: string; name: string; slug: string; tagline?: string; status: string;
  priceRegular?: number; priceSale?: number; badges: string[];
  idealFor: string[]; includedInPrice: string[]; maintenanceNote?: string;
  features: { text: string }[]; seoTitle?: string; seoDescription?: string;
  specs: Spec[]; stages: Stage[];
}

function commaList(arr?: string[]) { return (arr ?? []).join(', '); }
function parseList(s: string) { return s.split(',').map((x) => x.trim()).filter(Boolean); }

export default function ProductEditor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['product', id], queryFn: () => apiClient.get<Product>(`/admin/products/${id}`) });
  const [f, setF] = useState<Partial<Product>>({});
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) { setF(data); setSpecs(data.specs ?? []); setStages(data.stages ?? []); }
  }, [data]);

  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const saveBasic = useMutation({
    mutationFn: () => apiClient.patch(`/admin/products/${id}`, {
      name: f.name, tagline: f.tagline, priceRegular: f.priceRegular, priceSale: f.priceSale,
      badges: f.badges, idealFor: f.idealFor, includedInPrice: f.includedInPrice,
      maintenanceNote: f.maintenanceNote, features: f.features, seoTitle: f.seoTitle, seoDescription: f.seoDescription,
    }),
    onSuccess: () => { say('Зачувано'); qc.invalidateQueries({ queryKey: ['product', id] }); },
  });
  const saveSpecs = useMutation({ mutationFn: () => apiClient.put(`/admin/products/${id}/specs`, specs), onSuccess: () => say('Спецификацијата е зачувана') });
  const saveStages = useMutation({ mutationFn: () => apiClient.put(`/admin/products/${id}/stages`, stages), onSuccess: () => say('Степените се зачувани') });
  const publish = useMutation({ mutationFn: (a: 'publish' | 'unpublish') => apiClient.post(`/admin/products/${id}/${a}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['product', id] }) });

  if (!data) return <p className="text-[var(--color-neutral-500)]">Се вчитува…</p>;

  return (
    <>
      <PageHeader
        title={data.name}
        subtitle={data.status === 'PUBLISHED' ? 'Објавено' : 'Нацрт'}
        actions={
          <div className="flex items-center gap-2">
            {msg && <span className="text-sm text-[var(--color-success-600)]">{msg}</span>}
            {data.status === 'PUBLISHED'
              ? <Btn variant="ghost" onClick={() => publish.mutate('unpublish')}>Врати во нацрт</Btn>
              : <Btn onClick={() => publish.mutate('publish')}>Објави</Btn>}
          </div>
        }
      />
      <Tabs.Root defaultValue="Основно">
        <Tabs.List className="mb-4 flex flex-wrap gap-1 border-b border-[var(--color-neutral-200)]">
          {TABS.map((t) => (
            <Tabs.Trigger key={t} value={t} className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-accent-products)] data-[state=active]:font-semibold">{t}</Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="Основно">
          <Card className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Име</span><input className={input} value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Tagline</span><input className={input} value={f.tagline ?? ''} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Slug</span><input className={input} value={f.slug ?? ''} disabled /></label>
            <Btn onClick={() => saveBasic.mutate()}>Зачувај</Btn>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="Придобивки">
          <Card className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Идеален за (одделено со запирки)</span><input className={input} value={commaList(f.idealFor)} onChange={(e) => setF({ ...f, idealFor: parseList(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Клучни придобивки (по ред)</span>
              <textarea className={input} rows={4} value={(f.features ?? []).map((x) => x.text).join('\n')} onChange={(e) => setF({ ...f, features: e.target.value.split('\n').filter(Boolean).map((text) => ({ text })) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Што вклучува цената (одделено со запирки)</span><input className={input} value={commaList(f.includedInPrice)} onChange={(e) => setF({ ...f, includedInPrice: parseList(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Одржување и филтри</span><textarea className={input} rows={2} value={f.maintenanceNote ?? ''} onChange={(e) => setF({ ...f, maintenanceNote: e.target.value })} /></label>
            <Btn onClick={() => saveBasic.mutate()}>Зачувај</Btn>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="Степени">
          <Card className="space-y-2">
            {stages.map((s, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-2">
                <input className={input} type="number" value={s.order} onChange={(e) => setStages(stages.map((x, j) => j === i ? { ...x, order: Number(e.target.value) } : x))} />
                <input className={input} placeholder="Име" value={s.name} onChange={(e) => setStages(stages.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input className={input} placeholder="Отстранува" value={s.removes} onChange={(e) => setStages(stages.map((x, j) => j === i ? { ...x, removes: e.target.value } : x))} />
                <input className={input} placeholder="Зошто е важно" value={s.whyItMatters} onChange={(e) => setStages(stages.map((x, j) => j === i ? { ...x, whyItMatters: e.target.value } : x))} />
                <button className="text-[var(--color-danger-600)]" onClick={() => setStages(stages.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setStages([...stages, { order: stages.length + 1, name: '', removes: '', whyItMatters: '' }])}>+ Степен</Btn>
              <Btn onClick={() => saveStages.mutate()}>Зачувај степени</Btn>
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="Спецификација">
          <Card className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_80px_auto] items-center gap-2">
                <input className={input} placeholder="Група" value={s.group} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, group: e.target.value } : x))} />
                <input className={input} placeholder="Ознака" value={s.label} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className={input} placeholder="Вредност" value={s.value} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                <input className={input} placeholder="Ед." value={s.unit ?? ''} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))} />
                <button className="text-[var(--color-danger-600)]" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setSpecs([...specs, { group: '', label: '', value: '', unit: '' }])}>+ Ред</Btn>
              <Btn onClick={() => saveSpecs.mutate()}>Зачувај спецификација</Btn>
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="Цена и беџови">
          <Card className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Регуларна цена (ден.)</span><input type="number" className={input} value={f.priceRegular ?? ''} onChange={(e) => setF({ ...f, priceRegular: Number(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Акциска цена (ден.)</span><input type="number" className={input} value={f.priceSale ?? ''} onChange={(e) => setF({ ...f, priceSale: Number(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Беџови (одделено со запирки)</span><input className={input} value={commaList(f.badges)} onChange={(e) => setF({ ...f, badges: parseList(e.target.value) })} /></label>
            <Btn onClick={() => saveBasic.mutate()}>Зачувај</Btn>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="SEO">
          <Card className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO наслов (≤70)</span><input className={input} maxLength={70} value={f.seoTitle ?? ''} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO опис (≤160)</span><textarea className={input} maxLength={160} rows={2} value={f.seoDescription ?? ''} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} /></label>
            <Btn onClick={() => saveBasic.mutate()}>Зачувај</Btn>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
