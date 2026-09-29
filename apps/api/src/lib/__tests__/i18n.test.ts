import { describe, expect, it } from 'vitest';
import { applyLocale, applyLocaleAll, localeFromQuery } from '../i18n.js';

describe('localeFromQuery', () => {
  it('accepts valid locales and defaults to mk', () => {
    expect(localeFromQuery('en')).toBe('en');
    expect(localeFromQuery('sq')).toBe('sq');
    expect(localeFromQuery('mk')).toBe('mk');
    expect(localeFromQuery('xx')).toBe('mk');
    expect(localeFromQuery(undefined)).toBe('mk');
  });
});

describe('applyLocale', () => {
  const row = {
    id: '1',
    name: 'Кристал',
    tagline: 'Чиста вода',
    idealFor: ['дома'],
    i18n: { en: { name: 'Crystal', idealFor: ['home'] }, sq: { name: 'Kristal' } },
  };

  it('returns the base row (minus i18n) for mk', () => {
    const r = applyLocale(row, 'mk');
    expect(r).toEqual({ id: '1', name: 'Кристал', tagline: 'Чиста вода', idealFor: ['дома'] });
    expect('i18n' in r).toBe(false);
  });

  it('overlays present locale fields and falls back to base for missing ones', () => {
    const en = applyLocale(row, 'en');
    expect(en.name).toBe('Crystal');
    expect(en.idealFor).toEqual(['home']);
    expect(en.tagline).toBe('Чиста вода'); // not translated → MK base
    const sq = applyLocale(row, 'sq');
    expect(sq.name).toBe('Kristal');
    expect(sq.idealFor).toEqual(['дома']); // not in sq → MK base
  });

  it('ignores empty/blank overrides (falls back to base)', () => {
    const r = applyLocale({ name: 'Основа', desc: 'Опис', i18n: { en: { name: '  ', desc: '' } } }, 'en');
    expect(r.name).toBe('Основа');
    expect(r.desc).toBe('Опис');
  });

  it('handles rows without i18n', () => {
    const r = applyLocale({ name: 'X', i18n: null }, 'en');
    expect(r).toEqual({ name: 'X' });
  });
});

describe('applyLocaleAll', () => {
  it('localizes every row', () => {
    const rows = [
      { name: 'А', i18n: { en: { name: 'A' } } },
      { name: 'Б', i18n: { en: { name: 'B' } } },
    ];
    expect(applyLocaleAll(rows, 'en').map((r) => r.name)).toEqual(['A', 'B']);
  });
});
