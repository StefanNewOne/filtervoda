import { describe, expect, it } from 'vitest';
import { computeSavings } from '../calc.js';

describe('computeSavings', () => {
  it('computes current vs SPAR monthly and annual saving', () => {
    // 10 employees × 1.5 L × 22 days = 330 L/month → ceil(330/19)=18 gallons × 120 ден = 2160.
    const r = computeSavings({ employees: 10, solution: 'GALLONS', pricePerGallon: 120, sparMonthly: 2900 });
    expect(r.currentMonthly).toBe(2160);
    expect(r.sparMonthly).toBe(2900);
    // SPAR is dearer here → saving clamps to 0.
    expect(r.annualSaving).toBe(0);
  });

  it('produces a positive saving for a large team', () => {
    const r = computeSavings({ employees: 60, solution: 'GALLONS', pricePerGallon: 150, sparMonthly: 4900 });
    expect(r.currentMonthly).toBeGreaterThan(r.sparMonthly);
    expect(r.annualSaving).toBe((r.currentMonthly - r.sparMonthly) * 12);
  });

  it('never returns a negative saving (zero-saving edge)', () => {
    const r = computeSavings({ employees: 1, solution: 'GALLONS', pricePerGallon: 100, sparMonthly: 9999 });
    expect(r.annualSaving).toBe(0);
  });
});
