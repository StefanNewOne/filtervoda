/**
 * Audit service (CLAUDE.md Engineering Posture #3). Append-only; before/after snapshots
 * must contain NO PII. For Lead entities, only non-PII fields (status, assigned, reason).
 */
import type { Prisma } from '@prisma/client';
import { prisma, type Tx } from '../lib/prisma.js';

export interface AuditInput {
  actorId?: string;
  actorName: string;
  action: string; // e.g. 'product.update', 'lead.status.change', 'template.activated'
  entity: string;
  entityId: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipHash?: string;
  correlationId?: string;
  tx?: Tx;
}

export async function writeAudit(input: AuditInput): Promise<void> {
  const client = input.tx ?? prisma;
  await client.auditLog.create({
    data: {
      actorId: input.actorId,
      actorName: input.actorName,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      ipHash: input.ipHash,
      correlationId: input.correlationId,
    },
  });
}
