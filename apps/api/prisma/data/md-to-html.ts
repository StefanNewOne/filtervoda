/**
 * Minimal, dependency-free Markdown → HTML converter used only to migrate the legacy
 * „Совети" articles (from _docs/content/sodrzina/*.md) into Post.content.html at seed time.
 * It covers exactly the Markdown subset those files use: frontmatter, ATX headings, bullet
 * and ordered lists, GFM tables, blockquotes, images, links, bold/italic/inline-code.
 * It is NOT a general-purpose parser and is intentionally not added as a runtime dependency.
 */

export type Frontmatter = Record<string, string>;

/** Split a raw .md file into its YAML-ish frontmatter map and the Markdown body. */
export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized };
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return { data: {}, body: normalized };
  const fmBlock = normalized.slice(4, end);
  const body = normalized.slice(end + 5);
  const data: Frontmatter = {};
  for (const line of fmBlock.split('\n')) {
    const idx = line.indexOf(': ');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 2).trim();
    if (key) data[key] = value;
  }
  return { data, body };
}

/** Inline-level Markdown (images, links, bold, italic, code). */
function inline(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, url: string) => `<img src="${url}" alt="${alt}" loading="lazy" />`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t: string, url: string) => `<a href="${url}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');
}

function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return t.split('|').map((c) => c.trim());
}

/** Convert a Markdown body to HTML. The first top-level `# H1` (article title) is dropped. */
export function mdToHtml(body: string): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let h1Dropped = false;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' ').trim())}</p>`);
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushPara();
      continue;
    }

    // Horizontal rule / stray separator — ignore.
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushPara();
      continue;
    }

    // Headings.
    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      flushPara();
      const level = h[1].length;
      if (level === 1 && !h1Dropped) {
        h1Dropped = true; // drop the article title H1 (rendered separately)
        continue;
      }
      const tag = level <= 2 ? 'h2' : 'h3';
      out.push(`<${tag}>${inline(h[2].trim())}</${tag}>`);
      continue;
    }

    // Table.
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushPara();
      const header = splitRow(trimmed);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--; // step back; outer loop will advance
      const thead = `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // Blockquote.
    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      i--;
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Unordered list.
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      i--;
      out.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered list.
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      i--;
      out.push(`<ol>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ol>`);
      continue;
    }

    // Default: paragraph text.
    para.push(trimmed);
  }
  flushPara();
  return out.join('\n');
}
