/**
 * Generator: reads the migrated „Совети" Markdown in _docs/content/sodrzina/*.md, converts each
 * to HTML, and writes soveti-posts.generated.ts (imported by seed.ts). Re-run after editing the
 * source .md files:  npm run gen:soveti --workspace apps/api
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdToHtml, parseFrontmatter } from './md-to-html.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, '../../../../_docs/content/sodrzina');
const OUT_FILE = resolve(__dirname, 'soveti-posts.generated.ts');

type Post = { legacyId: number; slug: string; title: string; excerpt: string; oldUrl: string; category: string; html: string };

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md');
const posts: Post[] = [];

for (const file of files) {
  const raw = readFileSync(resolve(SRC_DIR, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  if (!data.slug || !data.title || !data.oldUrl) {
    throw new Error(`Missing frontmatter (slug/title/oldUrl) in ${file}`);
  }
  const legacyId = Number(data.oldUrl.replace(/\D/g, ''));
  posts.push({
    legacyId,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? '',
    oldUrl: data.oldUrl,
    category: data.category ?? 'educational',
    html: mdToHtml(body),
  });
}

// Higher legacy id ≈ newer article → keep newest first (matches the old site ordering).
posts.sort((a, b) => b.legacyId - a.legacyId);

const header =
  '// AUTO-GENERATED from _docs/content/sodrzina/*.md by generate-soveti.ts — do not edit by hand.\n' +
  '// Re-run: npm run gen:soveti --workspace apps/api\n\n' +
  'export type SovetiPost = {\n' +
  '  legacyId: number;\n' +
  '  slug: string;\n' +
  '  title: string;\n' +
  '  excerpt: string;\n' +
  '  oldUrl: string;\n' +
  '  category: string;\n' +
  '  html: string;\n' +
  '};\n\n';

const bodyOut = posts.map((p) => '  ' + JSON.stringify(p)).join(',\n');
writeFileSync(OUT_FILE, `${header}export const SOVETI_POSTS: SovetiPost[] = [\n${bodyOut},\n];\n`, 'utf8');

console.log(`Wrote ${posts.length} posts → ${OUT_FILE}`);
