import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Btn, Card, PageHeader, Table } from '../components/ui';
import { apiClient } from '../lib/api';

interface Pkg { id: string; name: string; priceFrom: number; description?: string; includes: string[]; employeesMin?: number; employeesMax?: number; active: boolean }
interface CalcParams { litersPerPersonDay: number; workingDays: number; gallonLiters: number; defaultPricePerGallon: number }

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

export default function B2b() {
  const qc = useQueryClient();
  const { data: packages = [] } = useQuery({ queryKey: ['packages'], queryFn: () => apiClient.get<Pkg[]>('/admin/packages') });
  const { data: settings = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const [calc, setCalc] = useState<CalcParams>({ litersPerPersonDay: 1.5, workingDays: 22, gallonLiters: 19, defaultPricePerGallon: 120 });
  const [np, setNp] = useState({ name: '', priceFrom: 0, description: '', includes: '' });
  const [logos, setLogos] = useState('');
  const [txt, setTxt] = useState({ problems: '', included: '', industries: '' });

  // Simple page-copy strings.
  const STR_KEYS = [
    'heroLabel', 'heroH1', 'heroSubhead', 'heroCta', 'heroTrust', 'logosTitle',
    'problemsTitle', 'includedTitle', 'calcTitle', 'stepsTitle', 'packagesTitle',
    'industriesTitle', 'comparisonTitle', 'faqTitle', 'formTitle', 'formText',
  ] as const;
  type StrKey = (typeof STR_KEYS)[number];
  const STR_LABELS: Record<StrKey, string> = {
    heroLabel: 'Hero — ознака',
    heroH1: 'Hero — наслов',
    heroSubhead: 'Hero — поднаслов',
    heroCta: 'Hero — копче (CTA)',
    heroTrust: 'Hero — доверба (ред под копчето)',
    logosTitle: 'Наслов на логоа',
    problemsTitle: 'Наслов — проблеми',
    includedTitle: 'Наслов — што е вклучено',
    calcTitle: 'Наслов — калкулатор',
    stepsTitle: 'Наслов — како функционира',
    packagesTitle: 'Наслов — пакети',
    industriesTitle: 'Наслов — за кои бизниси',
    comparisonTitle: 'Наслов — споредба',
    faqTitle: 'Наслов — ЧПП',
    formTitle: 'Наслов — форма',
    formText: 'Текст над формата',
  };
  const [str, setStr] = useState<Record<StrKey, string>>(() => Object.fromEntries(STR_KEYS.map((k) => [k, ''])) as Record<StrKey, string>);
  const [steps, setSteps] = useState('');
  const [comparison, setComparison] = useState('');

  useEffect(() => {
    const c = settings.find((s) => s.key === 'calculator.params')?.value as CalcParams | undefined;
    if (c) setCalc(c);
    const l = settings.find((s) => s.key === 'b2b.trustLogos')?.value as string[] | undefined;
    if (l) setLogos(l.join('\n'));
    const arr = (key: string) => (settings.find((s) => s.key === key)?.value as string[] | undefined)?.join('\n') ?? '';
    setTxt({ problems: arr('b2b.problems'), included: arr('b2b.included'), industries: arr('b2b.industries') });
    const strVal = (key: string) => (settings.find((s) => s.key === key)?.value as string | undefined) ?? '';
    setStr(Object.fromEntries(STR_KEYS.map((k) => [k, strVal(`b2b.${k}`)])) as Record<StrKey, string>);
    const stepsVal = settings.find((s) => s.key === 'b2b.steps')?.value as { title: string; desc: string }[] | undefined;
    if (stepsVal) setSteps(stepsVal.map((x) => `${x.title} | ${x.desc}`).join('\n'));
    const cmpVal = settings.find((s) => s.key === 'b2b.comparison')?.value as { label: string; gallons: string; buy: string; rent: string }[] | undefined;
    if (cmpVal) setComparison(cmpVal.map((x) => `${x.label} | ${x.gallons} | ${x.buy} | ${x.rent}`).join('\n'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
  const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean);

  const createPkg = useMutation({
    mutationFn: () => apiClient.post('/admin/packages', { name: np.name, priceFrom: Number(np.priceFrom), description: np.description, includes: np.includes.split(',').map((x) => x.trim()).filter(Boolean), active: true }),
    onSuccess: () => { setNp({ name: '', priceFrom: 0, description: '', includes: '' }); qc.invalidateQueries({ queryKey: ['packages'] }); },
  });
  const delPkg = useMutation({ mutationFn: (id: string) => apiClient.del(`/admin/packages/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }) });
  const saveCalc = useMutation({ mutationFn: () => apiClient.put('/admin/settings/calculator.params', { value: calc }), onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) });
  const saveLogos = useMutation({
    mutationFn: () => apiClient.put('/admin/settings/b2b.trustLogos', { value: lines(logos) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
  const saveTxt = useMutation({
    mutationFn: async () => {
      await apiClient.put('/admin/settings/b2b.problems', { value: lines(txt.problems) });
      await apiClient.put('/admin/settings/b2b.included', { value: lines(txt.included) });
      await apiClient.put('/admin/settings/b2b.industries', { value: lines(txt.industries) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
  const saveStrings = useMutation({
    mutationFn: async () => {
      for (const k of STR_KEYS) {
        await apiClient.put(`/admin/settings/b2b.${k}`, { value: str[k].trim() });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
  const saveSteps = useMutation({
    mutationFn: () => {
      const parsed = lines(steps).map((row) => {
        const i = row.indexOf('|');
        const title = i === -1 ? row : row.slice(0, i).trim();
        const desc = i === -1 ? '' : row.slice(i + 1).trim();
        return { title, desc };
      });
      return apiClient.put('/admin/settings/b2b.steps', { value: parsed });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
  const saveComparison = useMutation({
    mutationFn: () => {
      const parsed = lines(comparison).map((row) => {
        const [label = '', gallons = '', buy = '', rent = ''] = row.split('|').map((x) => x.trim());
        return { label, gallons, buy, rent };
      });
      return apiClient.put('/admin/settings/b2b.comparison', { value: parsed });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  return (
    <>
      <PageHeader title="За фирми" subtitle="Пакети, параметри на калкулаторот, логоа и искуства" />

      <h2 className="mb-2 text-sm font-semibold">Пакети</h2>
      <Table head={['Име', 'Од (ден./мес.)', 'Вклучува', '']}>
        {packages.map((p) => (
          <tr key={p.id} className="border-b border-[var(--color-neutral-100)]">
            <td className="px-4 py-2.5 font-medium">{p.name}</td>
            <td className="px-4 py-2.5">{p.priceFrom}</td>
            <td className="px-4 py-2.5 text-xs text-[var(--color-neutral-500)]">{p.includes.join(', ')}</td>
            <td className="px-4 py-2.5"><button className="text-[var(--color-danger-600)]" onClick={() => delPkg.mutate(p.id)}>Избриши</button></td>
          </tr>
        ))}
      </Table>
      <Card className="mt-3 max-w-2xl">
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={input} placeholder="Име" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
          <input className={input} type="number" placeholder="Од (ден./мес.)" value={np.priceFrom || ''} onChange={(e) => setNp({ ...np, priceFrom: Number(e.target.value) })} />
          <input className={input} placeholder="Опис" value={np.description} onChange={(e) => setNp({ ...np, description: e.target.value })} />
          <input className={input} placeholder="Вклучува (запирки)" value={np.includes} onChange={(e) => setNp({ ...np, includes: e.target.value })} />
        </div>
        <Btn className="mt-3" onClick={() => createPkg.mutate()} disabled={!np.name}>Додај пакет</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Параметри на калкулаторот</h2>
      <Card className="max-w-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Литри/лице/ден<input className={input} type="number" step="0.1" value={calc.litersPerPersonDay} onChange={(e) => setCalc({ ...calc, litersPerPersonDay: Number(e.target.value) })} /></label>
          <label className="text-sm">Работни денови<input className={input} type="number" value={calc.workingDays} onChange={(e) => setCalc({ ...calc, workingDays: Number(e.target.value) })} /></label>
          <label className="text-sm">Литри по галон<input className={input} type="number" value={calc.gallonLiters} onChange={(e) => setCalc({ ...calc, gallonLiters: Number(e.target.value) })} /></label>
          <label className="text-sm">Цена по галон (ден.)<input className={input} type="number" value={calc.defaultPricePerGallon} onChange={(e) => setCalc({ ...calc, defaultPricePerGallon: Number(e.target.value) })} /></label>
        </div>
        <Btn className="mt-3" onClick={() => saveCalc.mutate()}>Зачувај параметри</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Логоа „Им веруваат фирми"</h2>
      <Card className="max-w-2xl">
        <p className="mb-2 text-xs text-[var(--color-neutral-500)]">По една URL на лого во ред (качи ги преку Медиуми и залепи ги URL-ата). Празно = сивите „ЛОГО" полиња.</p>
        <textarea className={`${input} font-mono`} rows={6} placeholder="/img/logos/klient1.png&#10;https://res.cloudinary.com/…/klient2.png" value={logos} onChange={(e) => setLogos(e.target.value)} />
        <Btn className="mt-3" onClick={() => saveLogos.mutate()}>Зачувај логоа</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Текстови „За фирми" (по еден во ред)</h2>
      <Card className="max-w-2xl">
        <div className="grid gap-3">
          <label className="text-sm">Проблеми со галоните<textarea className={input} rows={4} value={txt.problems} onChange={(e) => setTxt({ ...txt, problems: e.target.value })} /></label>
          <label className="text-sm">Што е вклучено<textarea className={input} rows={4} value={txt.included} onChange={(e) => setTxt({ ...txt, included: e.target.value })} /></label>
          <label className="text-sm">За кои бизниси<textarea className={input} rows={4} value={txt.industries} onChange={(e) => setTxt({ ...txt, industries: e.target.value })} /></label>
        </div>
        <Btn className="mt-3" onClick={() => saveTxt.mutate()}>Зачувај текстови</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Текстови на страницата</h2>
      <Card className="max-w-2xl">
        <div className="grid gap-3">
          {STR_KEYS.map((k) => (
            <label key={k} className="text-sm">
              {STR_LABELS[k]}
              {k === 'heroH1' || k === 'heroSubhead' || k === 'formText' ? (
                <textarea className={input} rows={2} value={str[k]} onChange={(e) => setStr({ ...str, [k]: e.target.value })} />
              ) : (
                <input className={input} value={str[k]} onChange={(e) => setStr({ ...str, [k]: e.target.value })} />
              )}
            </label>
          ))}
        </div>
        <Btn className="mt-3" onClick={() => saveStrings.mutate()}>Зачувај текстови</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Чекори „Како функционира" (по еден во ред: Наслов | Опис)</h2>
      <Card className="max-w-2xl">
        <p className="mb-2 text-xs text-[var(--color-neutral-500)]">Нумерирањето (01/02/03) се додава автоматски по редослед.</p>
        <textarea className={`${input} font-mono`} rows={4} placeholder="Побарајте понуда | Две минути — формата или еден телефонски повик." value={steps} onChange={(e) => setSteps(e.target.value)} />
        <Btn className="mt-3" onClick={() => saveSteps.mutate()}>Зачувај чекори</Btn>
      </Card>

      <h2 className="mb-2 mt-8 text-sm font-semibold">Табела за споредба (по еден ред: Ознака | Галони | Купување | Изнајмување)</h2>
      <Card className="max-w-2xl">
        <textarea className={`${input} font-mono`} rows={7} placeholder="Месечен трошок | Расте со тимот | Без | Фиксен, предвидлив" value={comparison} onChange={(e) => setComparison(e.target.value)} />
        <Btn className="mt-3" onClick={() => saveComparison.mutate()}>Зачувај споредба</Btn>
      </Card>
    </>
  );
}
