import { describe, expect, it } from 'vitest';
import { mdToHtml, parseFrontmatter } from '../md-to-html.ts';

describe('parseFrontmatter', () => {
  it('extracts frontmatter map and body', () => {
    const raw = '---\ntitle: Наслов\nslug: naslov\noldUrl: /860/\n---\n\n# Наслов\n\nТекст.';
    const { data, body } = parseFrontmatter(raw);
    expect(data.title).toBe('Наслов');
    expect(data.slug).toBe('naslov');
    expect(data.oldUrl).toBe('/860/');
    expect(body.trimStart().startsWith('# Наслов')).toBe(true);
  });

  it('returns empty data when there is no frontmatter', () => {
    const { data, body } = parseFrontmatter('# Само тело');
    expect(data).toEqual({});
    expect(body).toBe('# Само тело');
  });
});

describe('mdToHtml', () => {
  it('drops the first H1 (title rendered separately) and converts other headings', () => {
    const html = mdToHtml('# Наслов\n\n## Поднаслов\n\n### Под-под');
    expect(html).not.toContain('Наслов</h');
    expect(html).toContain('<h2>Поднаслов</h2>');
    expect(html).toContain('<h3>Под-под</h3>');
  });

  it('converts paragraphs, bold, italic, links and images', () => {
    const html = mdToHtml('Ова е **важно** и _накосено_.\n\n[линк](https://a.mk)\n\n![алт](https://a.mk/x.png)');
    expect(html).toContain('<p>Ова е <strong>важно</strong> и <em>накосено</em>.</p>');
    expect(html).toContain('<a href="https://a.mk" target="_blank" rel="noopener">линк</a>');
    expect(html).toContain('<img src="https://a.mk/x.png" alt="алт" loading="lazy" />');
  });

  it('converts unordered and ordered lists', () => {
    expect(mdToHtml('* прво\n* второ')).toBe('<ul><li>прво</li><li>второ</li></ul>');
    expect(mdToHtml('1. прво\n2. второ')).toBe('<ol><li>прво</li><li>второ</li></ol>');
  });

  it('converts a GFM table', () => {
    const html = mdToHtml('| A | B |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<table><thead><tr><th>A</th><th>B</th></tr></thead>');
    expect(html).toContain('<tbody><tr><td>1</td><td>2</td></tr></tbody></table>');
  });

  it('converts blockquotes', () => {
    expect(mdToHtml('> цитат')).toBe('<blockquote>цитат</blockquote>');
  });
});
