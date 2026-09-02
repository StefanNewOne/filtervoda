import type { TemplateId } from '@filtervoda/shared';
import { useTemplateId } from './context';
import * as b1 from './b1';
import * as b2 from './b2';
import * as b3 from './b3';

export type TemplateSet = typeof b1;

const SETS: Record<TemplateId, TemplateSet> = { b1, b2, b3 };

/** Return the presentational component set for the active template. */
export function useTemplate(): TemplateSet {
  return SETS[useTemplateId()] ?? b1;
}
