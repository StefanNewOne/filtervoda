/**
 * FV-001 M2 — apply translated Совети posts (from the translate-soveti workflow) to Post.i18n.
 * Reads apps/api/prisma/data/soveti-i18n/*.json ({ slug, en:{title,excerpt,html}, sq:{...} }) and
 * sets each post's `i18n` overlay: title, excerpt and content ({ html }) per locale. Idempotent.
 * Run: `tsx apps/api/prisma/data/apply-soveti-i18n.ts` (after the workflow writes the files).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT = 1;
const DIR = 'apps/api/prisma/data/soveti-i18n';

type Loc = { title?: string; excerpt?: string; html?: string };
type Entry = { slug: string; en?: Loc; sq?: Loc };

function overlay(loc: Loc | undefined) {
  if (!loc) return undefined;
  const o: Record<string, unknown> = {};
  if (loc.title && loc.title.trim()) o.title = loc.title;
  if (loc.excerpt && loc.excerpt.trim()) o.excerpt = loc.excerpt;
  if (loc.html && loc.html.trim()) o.content = { html: loc.html };
  return Object.keys(o).length ? o : undefined;
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
  let applied = 0;
  const missing: string[] = [];
  for (const f of files) {
    const entry = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8').replace(/^﻿/, '')) as Entry;
    const post = await prisma.post.findFirst({ where: { tenantId: TENANT, slug: entry.slug } });
    if (!post) {
      missing.push(entry.slug);
      continue;
    }
    const i18n: Record<string, unknown> = {};
    const en = overlay(entry.en);
    const sq = overlay(entry.sq);
    if (en) i18n.en = en;
    if (sq) i18n.sq = sq;
    if (!Object.keys(i18n).length) continue;
    await prisma.post.update({ where: { id: post.id }, data: { i18n } });
    applied++;
  }
  console.warn(`Совети i18n applied — ${applied}/${files.length} files${missing.length ? `; no post for: ${missing.join(', ')}` : ''}`);
  await prisma.$disconnect();
}

void main();
