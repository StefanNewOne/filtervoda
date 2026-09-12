import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MediaPicker } from '../components/MediaPicker';
import { RowsEditor } from '../components/RowsEditor';
import { SaveBar } from '../components/SaveBar';
import { Hint, PageHeader, SectionCard } from '../components/ui';
import { apiClient } from '../lib/api';
import { useSaveState } from '../lib/useSaveState';

interface WhyItem { title: string; text: string }
interface StageItem { name: string; text: string }

const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';

/** Simple single-value string keys → friendly label + whether it's a textarea. */
const STR_FIELDS: { key: string; label: string; area?: boolean }[] = [
  { key: 'content.hero.h1', label: 'Hero — наслов (H1)' },
  { key: 'content.hero.h2', label: 'Hero — поднаслов', area: true },
  { key: 'content.hero.cta', label: 'Hero — примарно копче' },
  { key: 'content.hero.badge', label: 'Hero — зелена ознака над насловот' },
  { key: 'content.why.title', label: 'Наслов — „Зошто филтрирана вода?"' },
  { key: 'content.featured.title', label: 'Наслов — „Најбарани системи"' },
  { key: 'content.stages.title', label: 'Наслов — „Како функционира"' },
  { key: 'content.testimonials.title', label: 'Наслов — „Што велат клиентите"' },
  { key: 'content.articles.title', label: 'Наслов — „Совети"' },
  { key: 'content.b2bTeaser.title', label: 'B2B тизер — наслов' },
  { key: 'content.b2bTeaser.cta', label: 'B2B тизер — копче' },
  { key: 'content.advisor.title', label: 'Советник (финална секција) — наслов' },
  { key: 'content.advisor.text', label: 'Советник — текст', area: true },
  { key: 'content.thankyou.title', label: 'Благодариме — наслов' },
  { key: 'content.thankyou.text', label: 'Благодариме — текст', area: true },
];

export default function Content() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const save = useSaveState();

  const [str, setStr] = useState<Record<string, string>>({});
  const [heroChips, setHeroChips] = useState<string[]>([]);
  const [whyItems, setWhyItems] = useState<WhyItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [teaserBullets, setTeaserBullets] = useState<string[]>([]);
  const [teaserImage, setTeaserImage] = useState<string>('');

  useEffect(() => {
    const val = <T,>(key: string) => settings.find((s) => s.key === key)?.value as T | undefined;
    setStr(Object.fromEntries(STR_FIELDS.map((f) => [f.key, val<string>(f.key) ?? ''])));
    setHeroChips(val<string[]>('content.hero.chips') ?? []);
    setWhyItems(val<WhyItem[]>('content.why.items') ?? []);
    setStages(val<StageItem[]>('content.stages.items') ?? []);
    setTeaserBullets(val<string[]>('content.b2bTeaser.bullets') ?? []);
    setTeaserImage(val<string>('content.b2bTeaser.image') ?? '');
  }, [settings]);

  const asRows = (arr: string[]) => arr.map((v) => ({ text: v }));
  const fromRows = (rows: Record<string, unknown>[]) => rows.map((r) => String(r.text ?? '')).filter((v) => v.trim());

  const saveAll = () =>
    save.run(async () => {
      const put = (key: string, value: unknown) => apiClient.put(`/admin/settings/${key}`, { value });
      for (const f of STR_FIELDS) await put(f.key, str[f.key]?.trim() ?? '');
      await put('content.hero.chips', heroChips);
      await put('content.why.items', whyItems.filter((w) => w.title.trim()));
      await put('content.stages.items', stages.filter((s) => s.name.trim()));
      await put('content.b2bTeaser.bullets', teaserBullets);
      await put('content.b2bTeaser.image', teaserImage);
      await qc.invalidateQueries({ queryKey: ['settings'] });
    });

  const field = (key: string, label: string, area?: boolean) => (
    <label key={key} className="block text-sm">
      <span className="text-[var(--color-neutral-500)]">{label}</span>
      {area
        ? <textarea className={input} rows={2} value={str[key] ?? ''} onChange={(e) => setStr({ ...str, [key]: e.target.value })} />
        : <input className={input} value={str[key] ?? ''} onChange={(e) => setStr({ ...str, [key]: e.target.value })} />}
    </label>
  );
  const strField = (key: string) => {
    const f = STR_FIELDS.find((x) => x.key === key);
    return f ? field(f.key, f.label, f.area) : null;
  };

  return (
    <>
      <PageHeader title="Страници и копи — Почетна" subtitle="Секој текст и секоја секција на почетната страница. Празно поле = стандарден текст." />

      <div className="space-y-4 pb-4">
        <SectionCard title="Hero (најгоре)" hint="Насловот, поднасловот, копчето и ознаката. Чиповите се малите значки под копчето.">
          <div className="max-w-2xl space-y-3">
            {['content.hero.h1', 'content.hero.h2', 'content.hero.cta', 'content.hero.badge'].map(strField)}
            <div>
              <span className="text-sm text-[var(--color-neutral-500)]">Hero чипови</span>
              <RowsEditor rows={asRows(heroChips)} columns={[{ key: 'text', label: 'Чип' }]} onChange={(r) => setHeroChips(fromRows(r))} newRow={() => ({ text: '' })} addLabel="+ Чип" />
              <Hint>Пр. „10 години гаранција", „Бесплатна монтажа". Кратки значки под копчето.</Hint>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Зошто филтрирана вода" hint="Насловот и 4-те картички со причини.">
          <div className="max-w-2xl">{strField('content.why.title')}</div>
          <div className="mt-3">
            <RowsEditor
              rows={whyItems as unknown as Record<string, unknown>[]}
              columns={[{ key: 'title', label: 'Наслов' }, { key: 'text', label: 'Опис' }]}
              onChange={(r) => setWhyItems(r.map((x) => ({ title: String(x.title ?? ''), text: String(x.text ?? '') })))}
              newRow={() => ({ title: '', text: '' })}
              addLabel="+ Картичка"
            />
          </div>
        </SectionCard>

        <SectionCard title="Најбарани системи" hint="Само наслов — производите доаѓаат од модулот Производи (истакнати).">
          <div className="max-w-2xl">{strField('content.featured.title')}</div>
        </SectionCard>

        <SectionCard title="Како функционира (степени)" hint="Насловот и степените на филтрација. Нумерирањето се додава автоматски.">
          <div className="max-w-2xl">{strField('content.stages.title')}</div>
          <div className="mt-3">
            <RowsEditor
              rows={stages as unknown as Record<string, unknown>[]}
              columns={[{ key: 'name', label: 'Име на степен' }, { key: 'text', label: 'Опис' }]}
              onChange={(r) => setStages(r.map((x) => ({ name: String(x.name ?? ''), text: String(x.text ?? '') })))}
              newRow={() => ({ name: '', text: '' })}
              addLabel="+ Степен"
            />
          </div>
        </SectionCard>

        <SectionCard title="B2B тизер" hint="Блокот За вашата фирма на почетната — наслов, буллети и копче.">
          <div className="max-w-2xl space-y-3">
            {strField('content.b2bTeaser.title')}
            <div>
              <span className="text-sm text-[var(--color-neutral-500)]">Буллети</span>
              <RowsEditor rows={asRows(teaserBullets)} columns={[{ key: 'text', label: 'Буллет' }]} onChange={(r) => setTeaserBullets(fromRows(r))} newRow={() => ({ text: '' })} addLabel="+ Буллет" />
            </div>
            {strField('content.b2bTeaser.cta')}
            <div>
              <span className="text-sm text-[var(--color-neutral-500)]">Слика</span>
              <MediaPicker value={teaserImage} onChange={(ids) => setTeaserImage(ids[0] ?? '')} />
              <Hint>Празно = стандардната слика на диспензерот.</Hint>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Искуства и Совети (наслови)" hint="Насловите на секциите; содржината доаѓа од модулите Искуства и Совети.">
          <div className="max-w-2xl space-y-3">
            {strField('content.testimonials.title')}
            {strField('content.articles.title')}
          </div>
        </SectionCard>

        <SectionCard title="Финална секција (Советник)" hint="Последниот блок со форма за консултација.">
          <div className="max-w-2xl space-y-3">
            {strField('content.advisor.title')}
            {strField('content.advisor.text')}
          </div>
        </SectionCard>

        <SectionCard title="Страница Благодариме" hint="Текстот што се гледа по успешно испратено барање.">
          <div className="max-w-2xl space-y-3">
            {strField('content.thankyou.title')}
            {strField('content.thankyou.text')}
          </div>
        </SectionCard>
      </div>

      <SaveBar onSave={saveAll} state={save.state} error={save.error} label="Зачувај сè" previewUrl="/" />
    </>
  );
}
