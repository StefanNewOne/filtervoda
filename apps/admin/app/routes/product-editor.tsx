import { PRODUCT_AUDIENCES } from '@filtervoda/shared';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MediaPicker } from '../components/MediaPicker';
import { Btn, Card, PageHeader } from '../components/ui';
import { apiClient } from '../lib/api';

const TABS = ['Основно', 'Придобивки', 'Степени', 'Спецификација', 'Галерија', 'Поврзани', 'ЧПП', 'Цена и беџови', 'SEO'];
const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

interface Spec { group: string; label: string; value: string; unit?: string }
interface Stage { order: number; name: string; removes: string; whyItMatters: string }
interface ProductImage { mediaId: string; alt?: string; sortOrder?: number; isPrimary?: boolean; media?: { id: string; url: string; alt: string } }
interface RelatedRow { relatedId: string; sortOrder?: number }
interface ProductFaq { id: number; question: string; answer: string; scope: string; productId?: string; sortOrder: number }
interface Product {
  id: string; name: string; slug: string; tagline?: string; status: string;
  categoryId?: number; audience?: string; showPrice?: boolean; featured?: boolean;
  priceRegular?: number; priceSale?: number; badges: string[];
  idealFor: string[]; includedInPrice: string[]; maintenanceNote?: string;
  features: { text: string }[]; seoTitle?: string; seoDescription?: string;
  specs: Spec[]; stages: Stage[]; images: ProductImage[]; related?: RelatedRow[];
}
interface Category { id: number; name: string }
interface ProductRow { id: string; name: string }

const AUDIENCE_LABELS: Record<(typeof PRODUCT_AUDIENCES)[number], string> = {
  B2C: 'Домаќинства (B2C)',
  B2B: 'Фирми (B2B)',
  BOTH: 'Двете',
};

function commaList(arr?: string[]) { return (arr ?? []).join(', '); }
function parseList(s: string) { return s.split(',').map((x) => x.trim()).filter(Boolean); }

export default function ProductEditor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['product', id], queryFn: () => apiClient.get<Product>(`/admin/products/${id}`) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => apiClient.get<Category[]>('/admin/categories') });
  const { data: allProducts = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiClient.get<ProductRow[]>('/admin/products') });
  const { data: allFaqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: () => apiClient.get<ProductFaq[]>('/admin/faqs') });

  const [f, setF] = useState<Partial<Product>>({});
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setF(data);
      setSpecs(data.specs ?? []);
      setStages(data.stages ?? []);
      setImageIds((data.images ?? []).map((i) => i.mediaId));
      setRelatedIds((data.related ?? []).map((r) => r.relatedId));
    }
  }, [data]);

  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const productFaqs = allFaqs.filter((q) => q.scope === 'PRODUCT' && q.productId === id);

  const saveBasic = useMutation({
    mutationFn: () => apiClient.patch(`/admin/products/${id}`, {
      name: f.name, tagline: f.tagline, categoryId: f.categoryId, audience: f.audience,
      showPrice: f.showPrice, featured: f.featured,
      priceRegular: f.priceRegular, priceSale: f.priceSale,
      badges: f.badges, idealFor: f.idealFor, includedInPrice: f.includedInPrice,
      maintenanceNote: f.maintenanceNote, features: f.features, seoTitle: f.seoTitle, seoDescription: f.seoDescription,
    }),
    onSuccess: () => { say('Зачувано'); qc.invalidateQueries({ queryKey: ['product', id] }); },
  });
  const saveSpecs = useMutation({ mutationFn: () => apiClient.put(`/admin/products/${id}/specs`, specs), onSuccess: () => say('Спецификацијата е зачувана') });
  const saveStages = useMutation({ mutationFn: () => apiClient.put(`/admin/products/${id}/stages`, stages), onSuccess: () => say('Степените се зачувани') });
  const saveImages = useMutation({
    mutationFn: () => apiClient.put(`/admin/products/${id}/images`, imageIds.map((mediaId, i) => ({ mediaId, alt: '', sortOrder: i, isPrimary: i === 0 }))),
    onSuccess: () => { say('Галеријата е зачувана'); qc.invalidateQueries({ queryKey: ['product', id] }); },
  });
  const saveRelated = useMutation({
    mutationFn: () => apiClient.put(`/admin/products/${id}/related`, relatedIds.map((relatedId, i) => ({ relatedId, sortOrder: i }))),
    onSuccess: () => { say('Поврзаните производи се зачувани'); qc.invalidateQueries({ queryKey: ['product', id] }); },
  });
  const addFaq = useMutation({
    mutationFn: () => apiClient.post('/admin/faqs', { question: faqQ, answer: faqA, scope: 'PRODUCT', productId: id, sortOrder: productFaqs.length }),
    onSuccess: () => { setFaqQ(''); setFaqA(''); say('Прашањето е додадено'); qc.invalidateQueries({ queryKey: ['faqs'] }); },
  });
  const delFaq = useMutation({
    mutationFn: (faqId: number) => apiClient.del(`/admin/faqs/${faqId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs'] }),
  });
  const publish = useMutation({ mutationFn: (a: 'publish' | 'unpublish') => apiClient.post(`/admin/products/${id}/${a}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['product', id] }) });

  if (!data) return <p className="text-[var(--color-neutral-500)]">Се вчитува…</p>;

  const toggleRelated = (rid: string) => {
    setRelatedIds((cur) => (cur.includes(rid) ? cur.filter((x) => x !== rid) : [...cur, rid]));
  };

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
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Категорија</span>
              <select className={input} value={f.categoryId ?? ''} onChange={(e) => setF({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">— Избери —</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Публика</span>
              <select className={input} value={f.audience ?? 'B2C'} onChange={(e) => setF({ ...f, audience: e.target.value })}>
                {PRODUCT_AUDIENCES.map((a) => (<option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.showPrice ?? true} onChange={(e) => setF({ ...f, showPrice: e.target.checked })} /><span>Прикажи цена</span></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured ?? false} onChange={(e) => setF({ ...f, featured: e.target.checked })} /><span>Истакнат</span></label>
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

        <Tabs.Content value="Галерија">
          <Card className="max-w-2xl space-y-3">
            <span className="block text-sm text-[var(--color-neutral-500)]">Слики (првата е главна)</span>
            <MediaPicker value={imageIds} multi onChange={setImageIds} />
            <Btn onClick={() => saveImages.mutate()}>Зачувај галерија</Btn>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="Поврзани">
          <Card className="max-w-2xl space-y-2">
            <span className="block text-sm text-[var(--color-neutral-500)]">Поврзани производи</span>
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {allProducts.filter((p) => p.id !== id).map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={relatedIds.includes(p.id)} onChange={() => toggleRelated(p.id)} />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
            <Btn onClick={() => saveRelated.mutate()}>Зачувај поврзани</Btn>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="ЧПП">
          <Card className="max-w-2xl space-y-3">
            <ul className="space-y-2">
              {productFaqs.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-2 rounded-md bg-[var(--color-neutral-50)] p-2 text-sm">
                  <div><div className="font-medium">{q.question}</div><div className="text-[var(--color-neutral-500)]">{q.answer}</div></div>
                  <button className="text-[var(--color-danger-600)]" onClick={() => delFaq.mutate(q.id)}>Избриши</button>
                </li>
              ))}
              {productFaqs.length === 0 && <li className="text-sm text-[var(--color-neutral-500)]">Сè уште нема прашања.</li>}
            </ul>
            <div className="space-y-2 border-t border-[var(--color-neutral-200)] pt-3">
              <input className={input} placeholder="Прашање" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} />
              <textarea className={input} rows={2} placeholder="Одговор" value={faqA} onChange={(e) => setFaqA(e.target.value)} />
              <Btn disabled={faqQ.trim().length < 3 || faqA.trim().length < 3 || addFaq.isPending} onClick={() => addFaq.mutate()}>+ Додај прашање</Btn>
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
