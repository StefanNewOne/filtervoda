/**
 * Zod schemas — the single source of truth for validation (CLAUDE.md Category 7).
 * Backend validates with these; frontend infers types from them. UI-facing error
 * messages are Macedonian Cyrillic. OpenAPI is generated from these schemas.
 */
import { z } from 'zod';
import {
  FAQ_SCOPES,
  LEAD_STATUSES,
  LEAD_TYPES,
  PRODUCT_AUDIENCES,
  PUBLISH_STATUSES,
  TEMPLATE_IDS,
  USER_ROLES,
} from './constants.js';
import { isValidMkPhone, normalizeMkPhone } from './phone.js';

// ── Reusable fields ──────────────────────────────────────────────────────────
export const mkPhoneSchema = z
  .string()
  .min(1, { message: 'Ова поле е задолжително' })
  .refine((v) => isValidMkPhone(v), { message: 'Внесете телефон во формат 07X XXX XXX' })
  .transform((v) => normalizeMkPhone(v) as string);

export const emailSchema = z
  .string()
  .email({ message: 'Внесете валидна email адреса' })
  .optional()
  .or(z.literal('').transform(() => undefined));

export const consentSchema = z.literal(true, {
  errorMap: () => ({ message: 'Мора да ја прифатите Политиката за приватност' }),
});

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Внесете име и презиме' })
  .max(120, { message: 'Најмногу 120 знаци' });

// Anti-spam honeypot: must be empty (bots fill it).
const honeypotSchema = z.string().max(0).optional().or(z.literal(''));

// Client-collected attribution attached to every lead (server also derives some).
export const leadContextSchema = z.object({
  pageUrl: z.string().url(),
  section: z.string().max(80).optional(),
  utm: z.record(z.string()).optional(),
  referrer: z.string().max(500).optional(),
  fbclid: z.string().max(255).optional(),
  gclid: z.string().max(255).optional(),
  fbp: z.string().max(255).optional(),
  fbc: z.string().max(255).optional(),
  turnstileToken: z.string().optional(),
  hp: honeypotSchema, // honeypot
});

// ── B2B calculator ───────────────────────────────────────────────────────────
export const calculatorInputSchema = z.object({
  employees: z.number().int().min(1).max(1000),
  solution: z.enum(['GALLONS', 'BOTTLES']),
  pricePerUnit: z.number().nonnegative().optional(), // price per gallon/bottle (ден.)
});
export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

export const calculatorResultSchema = z.object({
  currentMonthly: z.number(),
  sparMonthly: z.number(),
  annualSaving: z.number(),
  units: z.number(), // current units (gallons/bottles) consumed per month
});
export type CalculatorResult = z.infer<typeof calculatorResultSchema>;

// ── Lead submission (public POST /leads) ─────────────────────────────────────
const leadBase = {
  name: nameSchema,
  phone: mkPhoneSchema,
  email: emailSchema,
  message: z.string().trim().max(2000).optional(),
  productId: z.string().cuid().optional(),
  consent: consentSchema,
  context: leadContextSchema,
};

export const b2cLeadSchema = z.object({
  type: z.literal('B2C'),
  city: z.string().trim().max(80).optional(),
  ...leadBase,
});

export const advisorLeadSchema = z.object({
  type: z.literal('ADVISOR'),
  advisorAnswers: z.record(z.string()).optional(), // "колку луѓе", "што ви пречи"
  ...leadBase,
});

export const contactLeadSchema = z.object({
  type: z.literal('CONTACT'),
  city: z.string().trim().max(80).optional(),
  ...leadBase,
});

export const b2bLeadSchema = z.object({
  type: z.literal('B2B'),
  company: z.string().trim().min(2, { message: 'Внесете име на фирма' }).max(160),
  city: z.string().trim().min(2, { message: 'Ова поле е задолжително' }).max(80),
  industry: z.string().trim().max(120).optional(),
  employeesRange: z.string().max(40).optional(),
  currentSolution: z.string().max(120).optional(),
  calcInput: calculatorInputSchema.optional(),
  ...leadBase,
});

export const leadSubmissionSchema = z.discriminatedUnion('type', [
  b2cLeadSchema,
  b2bLeadSchema,
  contactLeadSchema,
  advisorLeadSchema,
]);
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

// ── Admin: lead update ───────────────────────────────────────────────────────
export const leadUpdateSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    lostReason: z.string().max(500).optional(),
    assignedToId: z.string().cuid().nullable().optional(),
    isDuplicate: z.boolean().optional(),
  })
  .refine((v) => v.status !== 'LOST' || (v.lostReason && v.lostReason.length > 0), {
    message: 'Внесете причина за „Изгубено“',
    path: ['lostReason'],
  });
export type LeadUpdate = z.infer<typeof leadUpdateSchema>;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export const reauthSchema = z.object({ password: z.string().min(1) });
export const resetRequestSchema = z.object({ email: z.string().email() });
export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(10, { message: 'Најмалку 10 знаци' }),
});

// ── Admin content (core; extend per module) ──────────────────────────────────
export const productSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, { message: 'Само мали букви, бројки и цртички' })
    .max(120),
  name: z.string().min(2).max(160),
  tagline: z.string().max(200).nullish(),
  shortDescription: z.string().max(400).nullish(),
  description: z.unknown().nullish(), // rich JSON
  categoryId: z.number().int().positive(),
  audience: z.enum(PRODUCT_AUDIENCES),
  priceRegular: z.number().int().nonnegative().nullish(),
  priceSale: z.number().int().nonnegative().nullish(),
  showPrice: z.boolean().default(true),
  badges: z.array(z.string()).default([]),
  features: z.array(z.object({ icon: z.string().optional(), text: z.string().max(300) })).default([]),
  idealFor: z.array(z.string().max(160)).default([]),
  includedInPrice: z.array(z.string().max(200)).default([]),
  maintenanceNote: z.string().max(2000).nullish(),
  warrantyYears: z.number().int().min(0).max(50).default(10),
  status: z.enum(PUBLISH_STATUSES).default('DRAFT'),
  featured: z.boolean().default(false),
  comparable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().max(70).nullish(),
  seoDescription: z.string().max(160).nullish(),
  ogImageId: z.string().cuid().nullish(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const postSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Само мали букви, бројки и цртички' }).max(160),
  title: z.string().min(3).max(200),
  excerpt: z.string().max(400).optional(),
  contentHtml: z.string().max(100_000).optional(),
  categoryId: z.number().int().positive().optional(),
  coverMediaId: z.string().cuid().optional(),
  relatedProductId: z.string().cuid().optional(),
  status: z.enum(PUBLISH_STATUSES).default('DRAFT'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});
export type PostInput = z.infer<typeof postSchema>;

export const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(3000),
  scope: z.enum(FAQ_SCOPES),
  productId: z.string().cuid().optional(),
  sortOrder: z.number().int().default(0),
});

export const redirectSchema = z.object({
  fromPath: z.string().startsWith('/'),
  toPath: z.string().startsWith('/'),
  statusCode: z.coerce
    .number()
    .int()
    .refine((v) => v === 301 || v === 302, { message: 'Само 301 или 302' })
    .default(301),
});

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.enum(USER_ROLES),
  password: z.string().min(10).optional(), // required on create, optional on update
});

// ── Templates (Дизајн и темплејти) ───────────────────────────────────────────
export const templateTokensSchema = z.object({
  cta: z.string().optional(),
  ink: z.string().optional(),
  accent: z.string().optional(),
  radius: z.string().optional(),
  font: z.string().optional(),
  mono: z.string().optional(),
});
export const activeTemplateSchema = z.object({
  templateId: z.enum(TEMPLATE_IDS),
});
export type TemplateTokens = z.infer<typeof templateTokensSchema>;

export { LEAD_TYPES };
