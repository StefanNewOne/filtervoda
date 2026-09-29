import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { I18nPanel, type I18nData } from '../components/I18nPanel';
import { MediaPicker } from '../components/MediaPicker';
import { RowsEditor } from '../components/RowsEditor';
import { SaveBar } from '../components/SaveBar';
import { Btn, Card, Hint, PageHeader, SectionCard, Table } from '../components/ui';
import { apiClient } from '../lib/api';
import { useSaveState } from '../lib/useSaveState';

interface Pkg { id: string; name: string; priceFrom: number; description?: string; includes: string[]; active: boolean; i18n?: I18nData }
interface CalcParams { litersPerPersonDay: number; workingDays: number; gallonLiters: number; defaultPricePerGallon: number }
interface Step { title: string; desc: string }
interface CmpRow { label: string; gallons: string; buy: string; rent: string }

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

const STR_KEYS = [
  'heroLabel', 'heroH1', 'heroSubhead', 'heroCta', 'heroTrust', 'logosTitle',
  'problemsTitle', 'includedTitle', 'calcTitle', 'stepsTitle', 'packagesTitle',
  'industriesTitle', 'comparisonTitle', 'faqTitle', 'formTitle', 'formText',
] as const;
type StrKey = (typeof STR_KEYS)[number];
const STR_LABELS: Record<StrKey, string> = {
  heroLabel: 'Hero — ознака', heroH1: 'Hero — наслов', heroSubhead: 'Hero — поднаслов',
  heroCta: 'Hero — копче (CTA)', heroTrust: 'Hero — ред на доверба под копчето', logosTitle: 'Наслов на логоа',
  problemsTitle: 'Наслов — проблеми', includedTitle: 'Наслов — што е вклучено', calcTitle: 'Наслов — калкулатор',
  stepsTitle: 'Наслов — како функционира', packagesTitle: 'Наслов — пакети', industriesTitle: 'Наслов — за кои бизниси',
  comparisonTitle: 'Наслов — споредба', faqTitle: 'Наслов — ЧПП', formTitle: 'Наслов — форма', formText: 'Текст над формата',
};

export default function B2b() {
  const qc = useQueryClient();
  const { data: packages = [] } = useQuery({ queryKey: ['packages'], queryFn: () => apiClient.get<Pkg[]>('/admin/packages') });
  const { data: settings = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const save = useSaveState();

  const [str, setStr] = useState<Record<StrKey, string>>(() => Object.fromEntries(STR_KEYS.map((k) => [k, ''])) as Record<StrKey, string>);
  const [sI18n, setSI18n] = useState<I18nData>({});
  const [calc, setCalc] = useState<CalcParams>({ litersPerPersonDay: 1.5, workingDays: 22, gallonLiters: 19, defaultPricePerGallon: 120 });
  const [logos, setLogos] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');
  const [showComparison, setShowComparison] = useState(true);
  const [problems, setProblems] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [comparison, setComparison] = useState<CmpRow[]>([]);

  // Package add/edit form (entities — saved individually).
  const [np, setNp] = useState({ name: '', priceFrom: 0, description: '', includes: '' });
  const [npI18n, setNpI18n] = useState<I18nData>({});
  const [editingPkg, setEditingPkg] = useState<string | null>(null);

  useEffect(() => {
    const val = <T,>(key: string) => settings.find((s) => s.key === key)?.value as T | undefined;
    setStr(Object.fromEntries(STR_KEYS.map((k) => [k, val<string>(`b2b.${k}`) ?? ''])) as Record<StrKey, string>);
    const loadLoc = (lc: 'en' | 'sq') => ({
      ...Object.fromEntries(STR_KEYS.map((k) => [k, val<string>(`b2b.${k}.${lc}`) ?? ''])),
      ...Object.fromEntries(['problems', 'included', 'industries', 'steps', 'comparison'].map((k) => [k, val<unknown>(`b2b.${k}.${lc}`) ?? []])),
    });
    setSI18n({ en: loadLoc('en'), sq: loadLoc('sq') });
    const c = val<CalcParams>('calculator.params'); if (c) setCalc(c);
    setLogos(val<string[]>('b2b.trustLogos') ?? []);
    setHeroImage(val<string>('b2b.heroImage') ?? '');
    setShowComparison(val<boolean>('feature.compareTable') !== false);
    setProblems(val<string[]>('b2b.problems') ?? []);
    setIncluded(val<string[]>('b2b.included') ?? []);
    setIndustries(val<string[]>('b2b.industries') ?? []);
    setSteps(val<Step[]>('b2b.steps') ?? []);
    setComparison(val<CmpRow[]>('b2b.comparison') ?? []);
  }, [settings]);

  const saveAll = () =>
    save.run(async () => {
      const put = (key: string, value: unknown) => apiClient.put(`/admin/settings/${key}`, { value });
      for (const k of STR_KEYS) await put(`b2b.${k}`, str[k].trim());
      // Per-locale copy (FV-001 M2) — stored under `b2b.<key>.<locale>` (strings + lists/rows).
      for (const lc of ['en', 'sq'] as const) {
        for (const k of STR_KEYS) await put(`b2b.${k}.${lc}`, String((sI18n[lc]?.[k] as string) ?? '').trim());
        for (const k of ['problems', 'included', 'industries', 'steps', 'comparison']) await put(`b2b.${k}.${lc}`, sI18n[lc]?.[k] ?? []);
      }
      await put('calculator.params', calc);
      await put('b2b.trustLogos', logos);
      await put('b2b.heroImage', heroImage);
      await put('feature.compareTable', showComparison);
      await put('b2b.problems', problems);
      await put('b2b.included', included);
      await put('b2b.industries', industries);
      await put('b2b.steps', steps.filter((s) => s.title.trim()));
      await put('b2b.comparison', comparison.filter((c) => c.label.trim()));
      await qc.invalidateQueries({ queryKey: ['settings'] });
    });

  const resetPkg = () => { setNp({ name: '', priceFrom: 0, description: '', includes: '' }); setNpI18n({}); setEditingPkg(null); };
  const savePkg = useMutation({
    mutationFn: () => {
      const body = { name: np.name, priceFrom: Number(np.priceFrom), description: np.description, includes: np.includes.split(',').map((x) => x.trim()).filter(Boolean), active: true, i18n: Object.keys(npI18n).length ? npI18n : undefined };
      return editingPkg ? apiClient.patch(`/admin/packages/${editingPkg}`, body) : apiClient.post('/admin/packages', body);
    },
    onSuccess: () => { resetPkg(); qc.invalidateQueries({ queryKey: ['packages'] }); },
  });
  const editPkg = (p: Pkg) => { setNp({ name: p.name, priceFrom: p.priceFrom, description: p.description ?? '', includes: p.includes.join(', ') }); setNpI18n(p.i18n ?? {}); setEditingPkg(p.id); };
  const delPkg = useMutation({ mutationFn: (id: string) => apiClient.del(`/admin/packages/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }) });

  // Helpers to bridge string[] state ↔ RowsEditor's row shape.
  const asRows = (arr: string[]) => arr.map((v) => ({ text: v }));
  const fromRows = (rows: Record<string, unknown>[]) => rows.map((r) => String(r.text ?? ''));

  return (
    <>
      <PageHeader title="За фирми" subtitle="Секој дел од страницата по редослед — уреди и зачувај" />

      <div className="space-y-4 pb-4">
        <SectionCard title="Hero (најгоре на страницата)" hint="Насловот, поднасловот, копчето и сликата што прв ги гледа посетителот.">
          <div className="mb-4">
            <span className="text-sm text-[var(--color-neutral-500)]">Hero слика</span>
            <MediaPicker value={heroImage} onChange={(ids) => setHeroImage(ids[0] ?? '')} />
            <Hint>Празно = стандардната слика на диспензерот.</Hint>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
            {STR_KEYS.filter((k) => k.startsWith('hero')).map((k) => (
              <label key={k} className="text-sm">
                <span className="text-[var(--color-neutral-500)]">{STR_LABELS[k]}</span>
                {k === 'heroH1' || k === 'heroSubhead' ? (
                  <textarea className={input} rows={2} value={str[k]} onChange={(e) => setStr({ ...str, [k]: e.target.value })} />
                ) : (
                  <input className={input} value={str[k]} onChange={(e) => setStr({ ...str, [k]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Логоа на фирми што ви веруваат" hint="Прикачи или избери логоа од медиумите. Празно остава сиви ЛОГО-полиња.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.logosTitle}</span><input className={`${input} max-w-md`} value={str.logosTitle} onChange={(e) => setStr({ ...str, logosTitle: e.target.value })} /></label>
          <MediaPicker multi value={logos} onChange={setLogos} />
        </SectionCard>

        <SectionCard title="Проблеми со галоните" hint="Листата болки што ги решава изнајмувањето — секоја во посебен ред.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.problemsTitle}</span><input className={`${input} max-w-md`} value={str.problemsTitle} onChange={(e) => setStr({ ...str, problemsTitle: e.target.value })} /></label>
          <RowsEditor rows={asRows(problems)} columns={[{ key: 'text', label: 'Проблем' }]} onChange={(r) => setProblems(fromRows(r))} newRow={() => ({ text: '' })} addLabel="+ Проблем" />
        </SectionCard>

        <SectionCard title="Што е вклучено" hint="Што добива фирмата во месечниот износ.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.includedTitle}</span><input className={`${input} max-w-md`} value={str.includedTitle} onChange={(e) => setStr({ ...str, includedTitle: e.target.value })} /></label>
          <RowsEditor rows={asRows(included)} columns={[{ key: 'text', label: 'Ставка' }]} onChange={(r) => setIncluded(fromRows(r))} newRow={() => ({ text: '' })} addLabel="+ Ставка" />
        </SectionCard>

        <SectionCard title="Параметри на калкулаторот" hint="Влезните претпоставки за пресметката на заштедата.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.calcTitle}</span><input className={`${input} max-w-md`} value={str.calcTitle} onChange={(e) => setStr({ ...str, calcTitle: e.target.value })} /></label>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            <label className="text-sm">Литри/лице/ден<input className={input} type="number" step="0.1" value={calc.litersPerPersonDay} onChange={(e) => setCalc({ ...calc, litersPerPersonDay: Number(e.target.value) })} /></label>
            <label className="text-sm">Работни денови<input className={input} type="number" value={calc.workingDays} onChange={(e) => setCalc({ ...calc, workingDays: Number(e.target.value) })} /></label>
            <label className="text-sm">Литри по галон<input className={input} type="number" value={calc.gallonLiters} onChange={(e) => setCalc({ ...calc, gallonLiters: Number(e.target.value) })} /></label>
            <label className="text-sm">Цена по галон (ден.)<input className={input} type="number" value={calc.defaultPricePerGallon} onChange={(e) => setCalc({ ...calc, defaultPricePerGallon: Number(e.target.value) })} /></label>
          </div>
        </SectionCard>

        <SectionCard title="Како функционира (чекори)" hint="Нумерирањето (01/02/03) се додава автоматски по редослед.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.stepsTitle}</span><input className={`${input} max-w-md`} value={str.stepsTitle} onChange={(e) => setStr({ ...str, stepsTitle: e.target.value })} /></label>
          <RowsEditor
            rows={steps as unknown as Record<string, unknown>[]}
            columns={[{ key: 'title', label: 'Наслов' }, { key: 'desc', label: 'Опис' }]}
            onChange={(r) => setSteps(r.map((x) => ({ title: String(x.title ?? ''), desc: String(x.desc ?? '') })))}
            newRow={() => ({ title: '', desc: '' })}
            addLabel="+ Чекор"
          />
        </SectionCard>

        <SectionCard title="Пакети" hint="Ценовните пакети што се прикажуваат на страницата. Се зачувуваат поединечно.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.packagesTitle}</span><input className={`${input} max-w-md`} value={str.packagesTitle} onChange={(e) => setStr({ ...str, packagesTitle: e.target.value })} /></label>
          <Table head={['Име', 'Од (ден./мес.)', 'Вклучува', '']}>
            {packages.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-neutral-100)]">
                <td className="px-4 py-2.5 font-medium">{p.name}</td>
                <td className="px-4 py-2.5">{p.priceFrom}</td>
                <td className="px-4 py-2.5 text-xs text-[var(--color-neutral-500)]">{p.includes.join(', ')}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <button className="mr-3 text-[var(--color-brand-600)]" onClick={() => editPkg(p)}>Уреди</button>
                  <button className="text-[var(--color-danger-600)]" onClick={() => delPkg.mutate(p.id)}>Избриши</button>
                </td>
              </tr>
            ))}
          </Table>
          <Card className="mt-3 max-w-2xl">
            <div className="mb-2 text-sm font-medium">{editingPkg ? 'Уреди пакет' : 'Нов пакет'}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={input} placeholder="Име" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
              <input className={input} type="number" placeholder="Од (ден./мес.)" value={np.priceFrom || ''} onChange={(e) => setNp({ ...np, priceFrom: Number(e.target.value) })} />
              <input className={input} placeholder="Опис" value={np.description} onChange={(e) => setNp({ ...np, description: e.target.value })} />
              <input className={input} placeholder="Вклучува (запирки)" value={np.includes} onChange={(e) => setNp({ ...np, includes: e.target.value })} />
            </div>
            <div className="mt-3 border-t border-[var(--color-neutral-200)] pt-3">
              <div className="mb-2 text-sm font-medium">Преводи на пакетот (EN / SQ)</div>
              <I18nPanel value={npI18n} onChange={setNpI18n} fields={[{ key: 'name', label: 'Име' }, { key: 'description', label: 'Опис', type: 'textarea' }, { key: 'includes', label: 'Вклучува', type: 'list' }]} />
            </div>
            <div className="mt-3 flex gap-2">
              <Btn onClick={() => savePkg.mutate()} disabled={!np.name || savePkg.isPending}>{editingPkg ? 'Зачувај пакет' : 'Додај пакет'}</Btn>
              {editingPkg && <Btn variant="ghost" onClick={resetPkg}>Откажи</Btn>}
            </div>
          </Card>
        </SectionCard>

        <SectionCard title="За кои бизниси" hint="Индустрии/типови бизниси за кои е погодно.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.industriesTitle}</span><input className={`${input} max-w-md`} value={str.industriesTitle} onChange={(e) => setStr({ ...str, industriesTitle: e.target.value })} /></label>
          <RowsEditor rows={asRows(industries)} columns={[{ key: 'text', label: 'Бизнис/индустрија' }]} onChange={(r) => setIndustries(fromRows(r))} newRow={() => ({ text: '' })} addLabel="+ Бизнис" />
        </SectionCard>

        <SectionCard title="Табела за споредба" hint="Секој ред е една ставка: Ознака · Галони · Купување · Изнајмување.">
          <label className="mb-2 block text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.comparisonTitle}</span><input className={`${input} max-w-md`} value={str.comparisonTitle} onChange={(e) => setStr({ ...str, comparisonTitle: e.target.value })} /></label>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={showComparison} onChange={(e) => setShowComparison(e.target.checked)} />
            Прикажи ја табелата на сајтот
          </label>
          <RowsEditor
            rows={comparison as unknown as Record<string, unknown>[]}
            columns={[{ key: 'label', label: 'Ознака' }, { key: 'gallons', label: 'Галони' }, { key: 'buy', label: 'Купување' }, { key: 'rent', label: 'Изнајмување' }]}
            onChange={(r) => setComparison(r.map((x) => ({ label: String(x.label ?? ''), gallons: String(x.gallons ?? ''), buy: String(x.buy ?? ''), rent: String(x.rent ?? '') })))}
            newRow={() => ({ label: '', gallons: '', buy: '', rent: '' })}
            addLabel="+ Ред"
          />
        </SectionCard>

        <SectionCard title="ЧПП и форма" hint="Насловот на ЧПП и текстовите околу формата за барање понуда.">
          <div className="grid max-w-2xl gap-3">
            <label className="text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.faqTitle}</span><input className={input} value={str.faqTitle} onChange={(e) => setStr({ ...str, faqTitle: e.target.value })} /></label>
            <label className="text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.formTitle}</span><input className={input} value={str.formTitle} onChange={(e) => setStr({ ...str, formTitle: e.target.value })} /></label>
            <label className="text-sm"><span className="text-[var(--color-neutral-500)]">{STR_LABELS.formText}</span><textarea className={input} rows={2} value={str.formText} onChange={(e) => setStr({ ...str, formText: e.target.value })} /></label>
            <Hint>Прашањата на ЧПП се уредуваат во модулот „ЧПП" (опсег: За фирми).</Hint>
          </div>
        </SectionCard>

        <SectionCard title="Преводи на текстовите (EN / SQ)" hint="Превод на насловите и текстовите од оваа страница. Празно поле = се прикажува македонскиот текст. (Листите: проблеми, вклучено, индустрии, чекори, споредба — засега се на македонски на сите јазици.)">
          <I18nPanel
            value={sI18n}
            onChange={setSI18n}
            mk={{ ...str, problems, included, industries, steps, comparison }}
            fields={[
              ...STR_KEYS.map((k) => ({ key: k, label: STR_LABELS[k], type: k === 'heroH1' || k === 'heroSubhead' || k === 'formText' ? ('textarea' as const) : ('text' as const) })),
              { key: 'problems', label: 'Проблеми', type: 'list' as const },
              { key: 'included', label: 'Што е вклучено', type: 'list' as const },
              { key: 'industries', label: 'За кои бизниси', type: 'list' as const },
              { key: 'steps', label: 'Чекори', type: 'rows' as const, rowFields: [{ key: 'title', label: 'Наслов' }, { key: 'desc', label: 'Опис' }] },
              { key: 'comparison', label: 'Споредбена табела', type: 'rows' as const, rowFields: [{ key: 'label', label: 'Ознака' }, { key: 'gallons', label: 'Галони' }, { key: 'buy', label: 'Купување' }, { key: 'rent', label: 'Изнајмување' }] },
            ]}
          />
        </SectionCard>
      </div>

      <SaveBar onSave={saveAll} state={save.state} error={save.error} label="Зачувај сè" previewUrl="/za-biznis" />
    </>
  );
}
