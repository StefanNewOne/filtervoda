import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../sanitize.js';

describe('sanitizeHtml', () => {
  it('keeps safe formatting', () => {
    const html = '<h2>Наслов</h2><p>Текст <strong>задебелено</strong></p><ul><li>ставка</li></ul>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('strips <script> blocks', () => {
    const out = sanitizeHtml('<p>ок</p><script>alert(1)</script>');
    expect(out).not.toContain('script');
    expect(out).toContain('<p>ок</p>');
  });

  it('strips iframe/object/embed', () => {
    expect(sanitizeHtml('<iframe src="evil"></iframe>')).toBe('');
    expect(sanitizeHtml('<object data="x"></object>')).toBe('');
  });

  it('strips inline event handlers', () => {
    const out = sanitizeHtml('<a href="/x" onclick="steal()">линк</a>');
    expect(out).not.toContain('onclick');
    expect(out).toContain('href="/x"');
  });

  it('neutralizes javascript: URLs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });
});
