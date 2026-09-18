import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MediaPicker } from '../components/MediaPicker';
import { SaveBar } from '../components/SaveBar';
import { PageHeader, SectionCard } from '../components/ui';
import { apiClient } from '../lib/api';
import { useSaveState } from '../lib/useSaveState';

interface Stat { value: string; label: string }

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
const EMPTY_STATS: Stat[] = [
  { value: '', label: '' },
  { value: '', label: '' },
  { value: '', label: '' },
];

export default function About() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const save = useSaveState();

  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [stats, setStats] = useState<Stat[]>(EMPTY_STATS);
  const [image, setImage] = useState('');
  const [whyTitle, setWhyTitle] = useState('');
  const [whyText1, setWhyText1] = useState('');
  const [whyText2, setWhyText2] = useState('');

  useEffect(() => {
    const val = <T,>(key: string) => settings.find((s) => s.key === key)?.value as T | undefined;
    setTitle(val<string>('about.title') ?? '');
    setIntro(val<string>('about.intro') ?? '');
    setImage(val<string>('about.image') ?? '');
    setWhyTitle(val<string>('about.whyTitle') ?? '');
    setWhyText1(val<string>('about.whyText1') ?? '');
    setWhyText2(val<string>('about.whyText2') ?? '');
    const s = val<Stat[]>('about.stats') ?? [];
    setStats([0, 1, 2].map((i) => ({ value: s[i]?.value ?? '', label: s[i]?.label ?? '' })));
  }, [settings]);

  const setStat = (i: number, patch: Partial<Stat>) => setStats((prev) => prev.map((st, j) => (j === i ? { ...st, ...patch } : st)));

  const saveAll = () =>
    save.run(async () => {
      const put = (key: string, value: unknown) => apiClient.put(`/admin/settings/${key}`, { value });
      await put('about.title', title.trim());
      await put('about.intro', intro.trim());
      await put('about.image', image);
      await put('about.whyTitle', whyTitle.trim());
      await put('about.whyText1', whyText1.trim());
      await put('about.whyText2', whyText2.trim());
      await put(
        'about.stats',
        stats.map((st) => ({ value: st.value.trim(), label: st.label.trim() })).filter((st) => st.value || st.label),
      );
      await qc.invalidateQueries({ queryKey: ['settings'] });
    });

  return (
    <>
      <PageHeader title="За нас" subtitle="Секој текст и сликата на страницата За нас" />

      <div className="space-y-4 pb-4">
        <SectionCard title="Наслов и вовед" hint="Насловот (H1) и воведниот пасус на врвот.">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Наслов (H1)</span>
              <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Вводен текст</span>
              <textarea className={input} rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Три статистики" hint="Три кратки податоци (пр. 10 — години гаранција). Оставете празно за да се сокрие.">
          <div className="space-y-3">
            {stats.map((st, i) => (
              <div key={i} className="grid max-w-xl grid-cols-[120px_1fr] gap-2">
                <input className={input} placeholder="Вредност" value={st.value} onChange={(e) => setStat(i, { value: e.target.value })} />
                <input className={input} placeholder="Опис" value={st.label} onChange={(e) => setStat(i, { label: e.target.value })} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Слика" hint="Сликата десно во средната секција. Празно = стандардната слика.">
          <MediaPicker value={image} onChange={(ids) => setImage(ids[0] ?? '')} />
        </SectionCard>

        <SectionCard title="„Зошто SPAR“ — секција" hint="Насловот и двата пасуси покрај сликата.">
          <div className="max-w-2xl space-y-3">
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Наслов</span>
              <input className={input} value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Прв пасус</span>
              <textarea className={input} rows={3} value={whyText1} onChange={(e) => setWhyText1(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--color-neutral-500)]">Втор пасус</span>
              <textarea className={input} rows={3} value={whyText2} onChange={(e) => setWhyText2(e.target.value)} />
            </label>
          </div>
        </SectionCard>
      </div>

      <SaveBar onSave={saveAll} state={save.state} error={save.error} label="Зачувај сè" previewUrl="/za-nas" />
    </>
  );
}
