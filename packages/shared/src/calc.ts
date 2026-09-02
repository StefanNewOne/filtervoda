/**
 * B2B savings calculator formula (PRD §8.9). Pure + tested so the web component and any
 * server-side use share one source of truth. Zero-saving edge is clamped to 0.
 */
import { BOTTLE_LITERS, DEFAULT_LITERS_PER_PERSON_DAY, DEFAULT_WORKING_DAYS, GALLON_LITERS } from './constants.js';
import type { CalculatorResult } from './schemas.js';

export interface SavingsParams {
  employees: number;
  solution: 'GALLONS' | 'BOTTLES';
  pricePerGallon: number; // денари per 19L gallon
  sparMonthly: number; // cheapest package priceFrom
  litersPerPersonDay?: number;
  workingDays?: number;
}

export function computeSavings(p: SavingsParams): CalculatorResult {
  const litersPerPersonDay = p.litersPerPersonDay ?? DEFAULT_LITERS_PER_PERSON_DAY;
  const workingDays = p.workingDays ?? DEFAULT_WORKING_DAYS;

  const litersMonth = p.employees * litersPerPersonDay * workingDays;
  const unitLiters = p.solution === 'GALLONS' ? GALLON_LITERS : BOTTLE_LITERS;
  const pricePerUnit = p.solution === 'GALLONS' ? p.pricePerGallon : p.pricePerGallon / (GALLON_LITERS / BOTTLE_LITERS);

  const units = Math.ceil(litersMonth / unitLiters);
  const currentMonthly = Math.round(units * pricePerUnit);
  const annualSaving = Math.max(0, (currentMonthly - p.sparMonthly) * 12);

  return { currentMonthly, sparMonthly: p.sparMonthly, annualSaving };
}
