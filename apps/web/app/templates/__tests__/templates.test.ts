import { describe, expect, it } from 'vitest';
import { compareRow } from '../compare';
import { fmtPrice, heroParts } from '../types';

describe('heroParts', () => {
  it('splits the hero title around „директно" for colouring', () => {
    const [a, b, c] = heroParts('Чиста, алкална вода директно од вашата чешма.');
    expect(b).toBe('директно');
    expect(a).toBe('Чиста, алкална вода ');
    expect(c).toBe(' од вашата чешма.');
  });
  it('returns the whole string when the word is absent', () => {
    expect(heroParts('Само наслов')).toEqual(['Само наслов', '', '']);
  });
});

describe('fmtPrice', () => {
  it('formats denari with mk-MK grouping and suffix', () => {
    expect(fmtPrice(36000)).toBe('36.000 ден.');
    expect(fmtPrice(990)).toBe('990 ден.');
  });
  it('returns empty for undefined', () => {
    expect(fmtPrice(undefined)).toBe('');
  });
});

describe('compareRow', () => {
  it('derives stages / tank / display / pH from chips', () => {
    const r = compareRow(['6 степени', 'Директен проток', 'pH 8.5+', 'Дигитален дисплеј']);
    expect(r).toEqual({ stages: '6', tank: 'Директен', display: 'Да', ph: '8.5+' });
  });
  it('marks tank Да when chips mention Резервоар', () => {
    expect(compareRow(['6 степени', 'Резервоар']).tank).toBe('Да');
  });
  it('falls back to em dash when data is missing', () => {
    expect(compareRow(['Цел дом'])).toEqual({ stages: '—', tank: '—', display: '—', ph: '—' });
  });
});
