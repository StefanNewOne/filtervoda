import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../contrast.js';

describe('contrastRatio', () => {
  it('returns ~21 for black on white', () => {
    const r = contrastRatio('#000000', '#ffffff');
    expect(r).not.toBeNull();
    expect(Math.round(r as number)).toBe(21);
  });
  it('is order-independent', () => {
    expect(contrastRatio('#1156e0', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#1156e0') as number, 5);
  });
  it('passes AA (>=4.5) for the b1 CTA on white', () => {
    expect(contrastRatio('#1156e0', '#ffffff') as number).toBeGreaterThanOrEqual(4.5);
  });
  it('returns null for invalid hex', () => {
    expect(contrastRatio('nope', '#fff')).toBeNull();
  });
});
