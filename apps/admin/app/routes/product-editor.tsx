import { PRODUCT_AUDIENCES } from '@filtervoda/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { MediaPicker } from '../components/MediaPicker';
import { RowsEditor } from '../components/RowsEditor';
import { SaveBar } from '../components/SaveBar';
import { Btn, Hint, PageHeader, SectionCard } from '../components/ui';
import { apiClient } from '../lib/api';
import { useSaveState } from '../lib/useSaveState';

interface Spec { group: string; label: string; value: string; unit?: string | null }
interface Stage { order: number; name: string; removes: string; whyItMatters: string }
interface ProductImage { mediaId: string; alt?: string; sortOrder?: number; isPrimary?: boolean; media?: { id: string; url: string; alt: string } }
interface RelatedRow { relatedId: string; sortOrder?: number }
interface ProductFaq { id: number; question: string; answer: string; scope: string; productId?: string; sortOrder: number }
interface Feature { text: string }
interface Product {
  id: string; name: string; slug: string; tagline?: string; status: string;
  categoryId?: number; audience?: string; showPrice?: boolean; featured?: boolean;
  priceRegular?: number; priceSale?: number; badges: string[]; chips: string[];
  idealFor: string[]; includedInPrice: string[]; maintenanceNote?: string;
  features: Feature[]; seoTitle?: string; seoDescription?: string;
  specs: Spec[]; stages: Stage[]; images: ProductImage[]; related?: RelatedRow[];
}
interface Category { id: number; name: string }
interface ProductRow { id: string; name: string }
interface TestimonialRow { id: string; name: string; city?: string; scope: string; productId?: string | null }

const AUDIENCE_LABELS: Record<(typeof PRODUCT_AUDIENCES)[number], string> = {
  B2C: 'Домаќинства (B2C)',
  B2B: 'Фирми (B2B)',
  BOTH: 'Двете',
};

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
function commaList(arr?: string[]) { return (arr ?? []).join(', '); }
function parseList(s: string) { return s.split(',').map((x) => x.trim()).filter(Boolean); }

export default function ProductEditor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['product', id], queryFn: () => apiClient.get<Product>(`/admin/products/${id}`) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => apiClient.get<Category[]>('/admin/categories') });
  const { data: allProducts = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiClient.get<ProductRow[]>('/admin/products') });
  const { data: allFaqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: () => apiClient.get<ProductFaq[]>('/admin/faqs') });
  const { data: allTestimonials = [] } = useQuery({ queryKey: ['testimonials'], queryFn: () => apiClient.get<TestimonialRow[]>('/admin/testimonials') });

  const [f, setF] = useState<Partial<Product>>({});
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const save = useSaveState();

  useEffect(() => {
    if (data) {
      setF(data);
      setSpecs(data.specs ?? []);
      setStages(data.stages ?? []);
      setImageIds((data.images ?? []).map((i) => i.mediaId));
      setRelatedIds((data.related ?? []).map((r) => r.relatedId));
    }
  }, [data]);

  const productFaqs = allFaqs.filter((q) => q.scope === 'PRODUCT' && q.productId === id);

  // One „Зачувај сè" saves every section: basic fields + specs + stages + gallery + related.
  const saveAll = () =>
    save.run(async () => {
      await apiClient.patch(`/admin/products/${id}`, {
        name: f.name, tagline: f.tagline, categoryId: f.categoryId, audience: f.audience,
        showPrice: f.showPrice, featured: f.featured, priceRegular: f.priceRegular, priceSale: f.priceSale,
        badges: f.badges, chips: f.chips, idealFor: f.idealFor, includedInPrice: f.includedInPrice,
        maintenanceNote: f.maintenanceNote, features: f.features, seoTitle: f.seoTitle, seoDescription: f.seoDescription,
      });
      await apiClient.put(`/admin/products/${id}/specs`, specs.map((s, i) => ({ ...s, sortOrder: i })));
      await apiClient.put(`/admin/products/${id}/stages`, stages.map((s, i) => ({ ...s, order: i + 1 })));
      await apiClient.put(`/admin/products/${id}/images`, imageIds.map((mediaId, i) => ({ mediaId, alt: '', sortOrder: i, isPrimary: i === 0 })));
      await apiClient.put(`/admin/products/${id}/related`, relatedIds.map((relatedId, i) => ({ relatedId, sortOrder: i })));
      await qc.invalidateQueries({ queryKey: ['product', id] });
    });

  const addFaq = useMutation({
    mutationFn: () => apiClient.post('/admin/faqs', { question: faqQ, answer: faqA, scope: 'PRODUCT', productId: id, sortOrder: productFaqs.length }),
    onSuccess: () => { setFaqQ(''); setFaqA(''); qc.invalidateQueries({ queryKey: ['faqs'] }); },
  });
  const delFaq = useMutation({
    mutationFn: (faqId: number) => apiClient.del(`/admin/faqs/${faqId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs'] }),
  });
  const assignTestimonial = useMutation({
    mutationFn: ({ tid, assign }: { tid: string; assign: boolean }) => apiClient.patch(`/admin/testimonials/${tid}`, { productId: assign ? id : null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });
  const publish = useMutation({ mutationFn: (a: 'publish' | 'unpublish') => apiClient.post(`/admin/products/${id}/${a}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['product', id] }) });

  if (!data) return <p className="text-[var(--color-neutral-500)]">Се вчитува…</p>;

  const toggleRelated = (rid: string) => setRelatedIds((cur) => (cur.includes(rid) ? cur.filter((x) => x !== rid) : [...cur, rid]));

  return (
    <>
      <PageHeader
        title={data.name}
        subtitle={data.status === 'PUBLISHED' ? 'Објавено' : 'Нацрт'}
        actions={
          data.status === 'PUBLISHED'
            ? <Btn variant="ghost" onClick={() => publish.mutate('unpublish')}>Врати во нацрт</Btn>
            : <Btn onClick={() => publish.mutate('publish')}>Објави</Btn>
        }
      />

      <div className="space-y-4 pb-4">
        <SectionCard title="Основно" hint="Идентитет и каде се појавува производот на сајтот.">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Име</span><input className={input} value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Tagline</span><input className={input} value={f.tagline ?? ''} onChange={(e) => setF({ ...f, tagline: e.target.value })} /><Hint>Една реченица под името — што го издвојува овој модел.</Hint></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Slug (се генерира автоматски)</span><input className={input} value={f.slug ?? ''} disabled /></label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Категорија</span>
              <select className={input} value={f.categoryId ?? ''} onChange={(e) => setF({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">— Избери —</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Наменето за (каде се прикажува)</span>
              <select className={input} value={f.audience ?? 'B2C'} onChange={(e) => setF({ ...f, audience: e.target.value })}>
                {PRODUCT_AUDIENCES.map((a) => (<option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>))}
              </select>
              <Hint>Определува за кого е производот: „Домаќинства (B2C)“ — каталог за домови; „Фирми (B2B)“ — понудата за бизниси; „Двете“ — и двете. Ова е тоа што порано пишуваше „Публика“.</Hint>
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.showPrice ?? true} onChange={(e) => setF({ ...f, showPrice: e.target.checked })} /><span>Прикажи цена на сајтот</span></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured ?? false} onChange={(e) => setF({ ...f, featured: e.target.checked })} /><span>Истакнат (се прикажува на почетна „Најбарани")</span></label>
          </div>
        </SectionCard>

        <SectionCard title="Цена и беџови" hint="Цени во денари и беџови што се прикажуваат на картичката (пример: −20%, Ново, Бесплатна монтажа).">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Регуларна цена (ден.)</span><input type="number" className={input} value={f.priceRegular ?? ''} onChange={(e) => setF({ ...f, priceRegular: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Акциска цена (ден.) — по избор</span><input type="number" className={input} value={f.priceSale ?? ''} onChange={(e) => setF({ ...f, priceSale: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Беџови</span><input className={input} value={commaList(f.badges)} onChange={(e) => setF({ ...f, badges: parseList(e.target.value) })} /><Hint>Одделени со запирки.</Hint></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Чипови (кратки ознаки за споредба)</span><input className={input} value={commaList(f.chips)} onChange={(e) => setF({ ...f, chips: parseList(e.target.value) })} /><Hint>Кратки ознаки што се прикажуваат на картичката и полнат ги табелите „Споредба на модели“ (пр. 6 степени, Резервоар, pH 8.5+, Дигитален дисплеј).</Hint></label>
          </div>
        </SectionCard>

        <SectionCard title="Придобивки" hint="Продажните поенти — зошто клиентот да го избере токму овој производ.">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Идеален за</span><input className={input} value={commaList(f.idealFor)} onChange={(e) => setF({ ...f, idealFor: parseList(e.target.value) })} /><Hint>За кого е наменет — одделено со запирки (пр. домаќинства, канцеларии).</Hint></label>
            <div className="text-sm">
              <span className="text-[var(--color-neutral-500)]">Клучни придобивки</span>
              <RowsEditor
                rows={(f.features ?? []).map((x) => ({ text: x.text }))}
                columns={[{ key: 'text', label: 'Придобивка' }]}
                onChange={(rows) => setF({ ...f, features: rows.map((r) => ({ text: String(r.text ?? '') })).filter((r) => r.text.trim()) })}
                newRow={() => ({ text: '' })}
                addLabel="+ Придобивка"
              />
              <Hint>Секоја придобивка во посебен ред; се прикажуваат како буллети.</Hint>
            </div>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Што вклучува цената</span><input className={input} value={commaList(f.includedInPrice)} onChange={(e) => setF({ ...f, includedInPrice: parseList(e.target.value) })} /><Hint>Одделено со запирки (пр. монтажа, достава, гаранција).</Hint></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">Одржување и филтри</span><textarea className={input} rows={2} value={f.maintenanceNote ?? ''} onChange={(e) => setF({ ...f, maintenanceNote: e.target.value })} /></label>
          </div>
        </SectionCard>

        <SectionCard title="Како функционира" hint="Чекорите на филтрација (на сајтот секцијата се вика „Како функционира“). Нумерирањето се додава автоматски по редослед.">
          <RowsEditor
            rows={stages as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', label: 'Име на степен' },
              { key: 'removes', label: 'Што отстранува' },
              { key: 'whyItMatters', label: 'Зошто е важно' },
            ]}
            onChange={(rows) => setStages(rows.map((r, i) => ({ order: i + 1, name: String(r.name ?? ''), removes: String(r.removes ?? ''), whyItMatters: String(r.whyItMatters ?? '') })))}
            newRow={() => ({ order: stages.length + 1, name: '', removes: '', whyItMatters: '' })}
            addLabel="+ Степен"
          />
        </SectionCard>

        <SectionCard title="Спецификација" hint="Техничка табела. Полето Група ги групира редовите (пр. Општо, Филтрација, Димензии).">
          <RowsEditor
            rows={specs as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'group', label: 'Група' },
              { key: 'label', label: 'Ознака' },
              { key: 'value', label: 'Вредност' },
              { key: 'unit', label: 'Единица', width: '90px' },
            ]}
            onChange={(rows) => setSpecs(rows.map((r) => ({ group: String(r.group ?? ''), label: String(r.label ?? ''), value: String(r.value ?? ''), unit: r.unit ? String(r.unit) : '' })))}
            newRow={() => ({ group: '', label: '', value: '', unit: '' })}
            addLabel="+ Ред"
          />
        </SectionCard>

        <SectionCard title="Галерија" hint="Слики на производот. Првата е главна (се прикажува на картичката и најгоре).">
          <div className="max-w-2xl"><MediaPicker value={imageIds} multi onChange={setImageIds} /></div>
        </SectionCard>

        <SectionCard title="Поврзани производи" hint="Што да се препорача до овој производ на неговата страница.">
          <div className="max-h-80 max-w-2xl space-y-1 overflow-y-auto">
            {allProducts.filter((p) => p.id !== id).map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={relatedIds.includes(p.id)} onChange={() => toggleRelated(p.id)} />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="ЧПП (за овој производ)" hint="Прашања и одговори специфични за овој производ. Се зачувуваат веднаш.">
          <div className="max-w-2xl space-y-3">
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
          </div>
        </SectionCard>

        <SectionCard title="Искуства (изјави)" hint="Изберете кои изјави да се прикажат прво за овој производ. Ако не изберете ниту една, се прикажуваат 3 стандардни изјави. Се зачувува веднаш.">
          <div className="max-h-72 max-w-2xl space-y-1 overflow-y-auto">
            {allTestimonials.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={t.productId === id} onChange={(e) => assignTestimonial.mutate({ tid: t.id, assign: e.target.checked })} />
                <span>{t.name}{t.city ? `, ${t.city}` : ''} <span className="text-[var(--color-neutral-400)]">· {t.scope}</span></span>
              </label>
            ))}
            {allTestimonials.length === 0 && <p className="text-sm text-[var(--color-neutral-500)]">Нема изјави. Додади во модулот „Искуства“.</p>}
          </div>
        </SectionCard>

        <SectionCard title="SEO" hint="Наслов и опис за Google и за споделување на Facebook/Instagram.">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO наслов (≤70)</span><input className={input} maxLength={70} value={f.seoTitle ?? ''} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} /></label>
            <label className="block text-sm"><span className="text-[var(--color-neutral-500)]">SEO опис (≤160)</span><textarea className={input} maxLength={160} rows={2} value={f.seoDescription ?? ''} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} /></label>
          </div>
        </SectionCard>
      </div>

      <SaveBar onSave={saveAll} state={save.state} error={save.error} label="Зачувај сè" previewUrl={`/proizvodi/${data.slug}`} />
    </>
  );
}
