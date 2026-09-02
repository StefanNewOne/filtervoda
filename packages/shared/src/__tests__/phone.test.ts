import { describe, expect, it } from 'vitest';
import { formatMkPhoneDisplay, isValidMkPhone, normalizeMkPhone } from '../phone.js';

describe('normalizeMkPhone', () => {
  it('normalizes national format with separators', () => {
    expect(normalizeMkPhone('076 676 819')).toBe('+38976676819');
    expect(normalizeMkPhone('076/676/819')).toBe('+38976676819');
    expect(normalizeMkPhone('076-676-819')).toBe('+38976676819');
    expect(normalizeMkPhone('076676819')).toBe('+38976676819');
  });

  it('normalizes international prefixes', () => {
    expect(normalizeMkPhone('+389 76 676 819')).toBe('+38976676819');
    expect(normalizeMkPhone('0038976676819')).toBe('+38976676819');
    expect(normalizeMkPhone('38976676819')).toBe('+38976676819');
  });

  it('accepts bare subscriber numbers as MK', () => {
    expect(normalizeMkPhone('76676819')).toBe('+38976676819');
  });

  it('accepts every valid mobile prefix', () => {
    for (const p of ['70', '71', '72', '75', '76', '77', '78']) {
      expect(normalizeMkPhone(`0${p}123456`)).toBe(`+389${p}123456`);
    }
  });

  it('rejects invalid numbers', () => {
    expect(normalizeMkPhone('')).toBeNull();
    expect(normalizeMkPhone('02 3123 456')).toBeNull(); // landline prefix
    expect(normalizeMkPhone('073123456')).toBeNull(); // 73 not a mobile prefix
    expect(normalizeMkPhone('0766768')).toBeNull(); // too short
    expect(normalizeMkPhone('0766768199')).toBeNull(); // too long
    expect(normalizeMkPhone('+1 555 123 4567')).toBeNull(); // foreign
  });
});

describe('isValidMkPhone', () => {
  it('reflects normalization', () => {
    expect(isValidMkPhone('076676819')).toBe(true);
    expect(isValidMkPhone('nonsense')).toBe(false);
  });
});

describe('formatMkPhoneDisplay', () => {
  it('formats E.164 to national display', () => {
    expect(formatMkPhoneDisplay('+38976676819')).toBe('076/676/819');
  });
  it('returns input unchanged when invalid', () => {
    expect(formatMkPhoneDisplay('bad')).toBe('bad');
  });
});
