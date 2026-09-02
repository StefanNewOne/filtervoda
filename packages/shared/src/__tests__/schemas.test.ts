import { describe, expect, it } from 'vitest';
import { leadSubmissionSchema, leadUpdateSchema } from '../schemas.js';

const baseContext = { pageUrl: 'https://filtervoda.mk/proizvodi/spar-crystal-digital-600hf' };

describe('leadSubmissionSchema', () => {
  it('accepts a valid B2C lead and normalizes the phone', () => {
    const parsed = leadSubmissionSchema.parse({
      type: 'B2C',
      name: 'Билјана Стојанова',
      phone: '076 676 819',
      consent: true,
      context: baseContext,
    });
    expect(parsed.phone).toBe('+38976676819');
  });

  it('rejects a bad phone with the MK message', () => {
    const res = leadSubmissionSchema.safeParse({
      type: 'B2C',
      name: 'Тест Тест',
      phone: '02 3123 456',
      consent: true,
      context: baseContext,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(JSON.stringify(res.error.issues)).toContain('07X XXX XXX');
    }
  });

  it('requires consent', () => {
    const res = leadSubmissionSchema.safeParse({
      type: 'B2C',
      name: 'Тест Тест',
      phone: '076676819',
      consent: false,
      context: baseContext,
    });
    expect(res.success).toBe(false);
  });

  it('requires company and city for B2B', () => {
    const res = leadSubmissionSchema.safeParse({
      type: 'B2B',
      name: 'Контакт Лице',
      phone: '076676819',
      consent: true,
      context: baseContext,
    });
    expect(res.success).toBe(false);
  });
});

describe('leadUpdateSchema', () => {
  it('requires a reason when status is LOST', () => {
    expect(leadUpdateSchema.safeParse({ status: 'LOST' }).success).toBe(false);
    expect(leadUpdateSchema.safeParse({ status: 'LOST', lostReason: 'Скапо' }).success).toBe(true);
  });
});
