/**
 * Admin API mount. All routes require auth + CSRF + admin rate limit. Role rules:
 *  - CLIENT_VIEWER: leads (read) only — touches no content route (a test proves it).
 *  - EDITOR: content, media, leads.
 *  - ADMIN: everything (users, settings).
 * AuthZ is enforced here AND re-checked in controllers (defense in depth).
 */
import { faqSchema, redirectSchema } from '@filtervoda/shared';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { csrfProtection } from '../../middleware/csrf.js';
import { adminLimiter } from '../../middleware/rateLimit.js';
import { CACHE_NS } from '../../services/cache.js';
import { crudRouter } from './crud.js';
import { adminLeadsRouter } from './leads.js';
import { adminMediaRouter } from './media.js';
import { adminPostsRouter } from './posts.js';
import { adminProductsRouter } from './products.js';
import { adminTemplatesRouter } from './templates.js';
import {
  adminAuditRouter,
  adminCacheRouter,
  adminOutboxRouter,
  adminSettingsRouter,
  adminStatsRouter,
  adminUsersRouter,
} from './system.js';

export const adminRouter = Router();

// Global admin guards.
adminRouter.use(requireAuth, adminLimiter);
// CSRF on state-changing verbs only (GET/HEAD are safe).
adminRouter.use((req, res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : csrfProtection(req, res, next)));

// Leads — all authenticated roles may READ; mutations are ADMIN/EDITOR-only (guarded per-route).
adminRouter.use('/leads', adminLeadsRouter);

// Everything below is content/system — CLIENT_VIEWER is excluded.
const editors = requireRole('ADMIN', 'EDITOR');

adminRouter.use('/products', editors, adminProductsRouter);
adminRouter.use('/media', editors, adminMediaRouter);
adminRouter.use('/posts', editors, adminPostsRouter);
adminRouter.use('/templates', editors, adminTemplatesRouter);
adminRouter.use('/settings', editors, adminSettingsRouter);
adminRouter.use('/outbox', editors, adminOutboxRouter);
adminRouter.use('/audit', editors, adminAuditRouter);
adminRouter.use('/stats', editors, adminStatsRouter);
adminRouter.use('/cache', editors, adminCacheRouter);

// Users — ADMIN only (router self-guards too).
adminRouter.use('/users', adminUsersRouter);

// Simple audited CRUD entities.
const categorySchema = z.object({ slug: z.string().max(120), name: z.string().max(120), description: z.string().optional(), imageId: z.string().optional(), sortOrder: z.number().int().default(0) });
const postCategorySchema = z.object({ slug: z.string().max(120), name: z.string().max(120) });
const packageSchema = z.object({ name: z.string(), priceFrom: z.number().int(), description: z.string().optional(), includes: z.array(z.string()).default([]), employeesMin: z.number().int().optional(), employeesMax: z.number().int().optional(), sortOrder: z.number().int().default(0), active: z.boolean().default(true) });
const testimonialSchema = z.object({ name: z.string(), company: z.string().optional(), city: z.string().optional(), text: z.string(), rating: z.number().int().min(1).max(5).default(5), productId: z.string().optional(), scope: z.enum(['B2C', 'B2B']).default('B2C'), mediaId: z.string().optional(), active: z.boolean().default(true) });

adminRouter.use('/categories', editors, crudRouter({ entity: 'ProductCategory', model: 'productCategory', schema: categorySchema, idType: 'number', orderBy: { sortOrder: 'asc' }, cacheNs: [CACHE_NS.products] }));
adminRouter.use('/post-categories', editors, crudRouter({ entity: 'PostCategory', model: 'postCategory', schema: postCategorySchema, idType: 'number', cacheNs: [CACHE_NS.posts] }));
adminRouter.use('/faqs', editors, crudRouter({ entity: 'Faq', model: 'faq', schema: faqSchema, idType: 'number', orderBy: { sortOrder: 'asc' }, cacheNs: [CACHE_NS.faq, CACHE_NS.products] }));
adminRouter.use('/packages', editors, crudRouter({ entity: 'B2bPackage', model: 'b2bPackage', schema: packageSchema, orderBy: { sortOrder: 'asc' }, cacheNs: [CACHE_NS.packages] }));
adminRouter.use('/testimonials', editors, crudRouter({ entity: 'Testimonial', model: 'testimonial', schema: testimonialSchema, cacheNs: [] }));
adminRouter.use('/redirects', editors, crudRouter({ entity: 'Redirect', model: 'redirect', schema: redirectSchema, idType: 'number', cacheNs: [CACHE_NS.redirects] }));
