import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import { Btn, Card, PageHeader } from './ui';

export interface SettingField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'list' | 'object';
  hint?: string;
  /** For type 'object': the editable sub-keys (e.g. facebook / instagram). */
  subFields?: { key: string; label: string }[];
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** The editable in-form representation of a stored value (list → comma text, object → object). */
function toEditable(field: SettingField, value: unknown): unknown {
  if (field.type === 'list') return Array.isArray(value) ? value.join(', ') : '';
  if (field.type === 'object') return value && typeof value === 'object' ? value : {};
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'number') return typeof value === 'number' ? value : (value ?? '');
  return value ?? '';
}

/** Convert the editable representation back into the value we persist. */
function toStored(field: SettingField, edited: unknown): unknown {
  if (field.type === 'list') return String(edited ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (field.type === 'number') return Number(edited);
  return edited;
}

/**
 * Edits a curated set of Setting keys with friendly labels. Each field saves independently and
 * shows an explicit status. Refetches (e.g. after saving another field) NEVER overwrite a field
 * you are still editing — only untouched fields are reseeded from the server.
 */
export function SettingsGroup({ title, subtitle, fields }: { title: string; subtitle: string; fields: SettingField[] }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get<{ key: string; value: unknown }[]>('/admin/settings') });
  const serverMap = useMemo(() => Object.fromEntries(data.map((r) => [r.key, r.value])), [data]);

  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, SaveState>>({});
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});

  // Seed the form from the server, but keep any field the user is currently editing (dirty).
  useEffect(() => {
    setVals((prev) => {
      const next = { ...prev };
      for (const f of fields) {
        if (!dirty[f.key]) next[f.key] = toEditable(f, serverMap[f.key]);
      }
      return next;
    });
    // `dirty` is intentionally read but not a dependency — reseeding reacts to server data only.
  }, [serverMap, fields]);

  const save = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => apiClient.put(`/admin/settings/${encodeURIComponent(key)}`, { value }),
  });

  const input = 'w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm';
  const set = (k: string, v: unknown) => {
    setVals((s) => ({ ...s, [k]: v }));
    setDirty((s) => ({ ...s, [k]: true }));
    setStatus((s) => ({ ...s, [k]: 'idle' }));
  };

  const onSave = async (field: SettingField) => {
    setStatus((s) => ({ ...s, [field.key]: 'saving' }));
    try {
      await save.mutateAsync({ key: field.key, value: toStored(field, vals[field.key]) });
      setDirty((s) => ({ ...s, [field.key]: false }));
      setStatus((s) => ({ ...s, [field.key]: 'saved' }));
      await qc.invalidateQueries({ queryKey: ['settings'] });
    } catch (e) {
      setErrorMsg((s) => ({ ...s, [field.key]: (e as Error).message || 'Грешка при зачувување' }));
      setStatus((s) => ({ ...s, [field.key]: 'error' }));
    }
  };

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="max-w-2xl space-y-4">
        {fields.map((fld) => {
          const v = vals[fld.key];
          const st = status[fld.key] ?? 'idle';
          return (
            <div key={fld.key}>
              <label className="block text-sm font-medium">{fld.label}</label>
              {fld.hint && <p className="mb-1 text-xs text-[var(--color-neutral-500)]">{fld.hint}</p>}
              {fld.type === 'textarea' ? (
                <textarea className={input} rows={3} value={String(v ?? '')} onChange={(e) => set(fld.key, e.target.value)} />
              ) : fld.type === 'boolean' ? (
                <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(fld.key, e.target.checked)} />
              ) : fld.type === 'number' ? (
                <input type="number" className={input} value={v === '' || v == null ? '' : Number(v)} onChange={(e) => set(fld.key, e.target.value === '' ? '' : Number(e.target.value))} />
              ) : fld.type === 'list' ? (
                <input className={input} value={String(v ?? '')} onChange={(e) => set(fld.key, e.target.value)} />
              ) : fld.type === 'object' ? (
                <div className="space-y-2">
                  {(fld.subFields ?? []).map((sub) => {
                    const obj = (v && typeof v === 'object' ? (v as Record<string, unknown>) : {}) as Record<string, unknown>;
                    return (
                      <input
                        key={sub.key}
                        className={input}
                        placeholder={sub.label}
                        value={String(obj[sub.key] ?? '')}
                        onChange={(e) => set(fld.key, { ...obj, [sub.key]: e.target.value })}
                      />
                    );
                  })}
                </div>
              ) : (
                <input className={input} value={String(v ?? '')} onChange={(e) => set(fld.key, e.target.value)} />
              )}
              <div className="mt-1 flex items-center gap-3">
                <Btn variant="ghost" onClick={() => onSave(fld)} disabled={st === 'saving'}>
                  {st === 'saving' ? 'Се зачувува…' : 'Зачувај'}
                </Btn>
                {st === 'saved' && <span className="text-sm text-[var(--color-success-600,#0a7d34)]">✓ Зачувано</span>}
                {st === 'error' && <span className="text-sm text-[var(--color-danger-600)]">✗ {errorMsg[fld.key]}</span>}
                {dirty[fld.key] && st !== 'saving' && <span className="text-xs text-[var(--color-neutral-500)]">незачувано</span>}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
