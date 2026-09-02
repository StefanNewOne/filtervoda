/**
 * Prisma client + tenant guard (CLAUDE.md Engineering Posture #10 / PRD §12.6).
 * Every query carries a tenant predicate. The extension injects `tenantId` into where/create
 * for tenant-scoped models so a developer cannot forget it. A guard test asserts this.
 *
 * Single-tenant today (SPAR = 1); the mechanism keeps the code a reusable lead-gen engine.
 */
import { PrismaClient } from '@prisma/client';

export const DEFAULT_TENANT = 1;

// Models that carry tenantId (keep in sync with schema.prisma).
export const TENANT_MODELS = new Set([
  'ProductCategory',
  'Product',
  'Faq',
  'B2bPackage',
  'Testimonial',
  'ClientLogo',
  'PostCategory',
  'Post',
  'Lead',
  'OutboxJob',
  'AuditLog',
  'User',
  'Setting',
  'Redirect',
  'Media',
]);

const base = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !TENANT_MODELS.has(model)) return query(args);

        const a = args as Record<string, unknown>;

        // Reads / updates / deletes / upserts: scope by tenant (incl. singular update/delete).
        if (
          operation.startsWith('find') ||
          operation === 'count' ||
          operation === 'aggregate' ||
          operation === 'updateMany' ||
          operation === 'deleteMany' ||
          operation === 'update' ||
          operation === 'delete'
        ) {
          // Singular update/delete accept extra non-unique filters in Prisma 6 (extended where).
          a.where = { tenantId: DEFAULT_TENANT, ...(a.where as object) };
        }
        // upsert already uses tenant-scoped compound unique keys in this codebase.

        // Creates: default the tenant.
        if (operation === 'create') {
          a.data = { tenantId: DEFAULT_TENANT, ...(a.data as object) };
        }
        if (operation === 'createMany' && Array.isArray((a.data as unknown[]))) {
          a.data = (a.data as Record<string, unknown>[]).map((d) => ({ tenantId: DEFAULT_TENANT, ...d }));
        }

        return query(a);
      },
    },
  },
});

export type ExtendedPrisma = typeof prisma;

/** Interactive-transaction client type for the extended client (what `$transaction(async tx => …)` yields). */
export type Tx = Omit<
  ExtendedPrisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
