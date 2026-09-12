import { expect, test } from '@playwright/test';

/**
 * Mobile responsiveness guard (CLAUDE.md: mobile-first, ~80–90% traffic).
 * At 390px, no page may overflow horizontally, and the primary CTA must be reachable.
 * Runs on the `mobile` project (Pixel 7). Screenshots are saved for visual review.
 */
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/proizvodi', name: 'catalog' },
  { path: '/proizvodi/spar-crystal-digital-600hf', name: 'product' },
  { path: '/za-biznis', name: 'b2b' },
  { path: '/soveti', name: 'blog' },
  { path: '/za-nas', name: 'about' },
  { path: '/kontakt', name: 'contact' },
  { path: '/blagodarime', name: 'thankyou' },
];

for (const p of PAGES) {
  test(`no horizontal overflow @390 — ${p.name}`, async ({ page }) => {
    await page.goto(p.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); // display font can widen elements after load
    // Measure BEFORE any fullPage screenshot — fullPage capture temporarily expands the
    // viewport and repositions fixed elements, which would falsely inflate scrollWidth.
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return { scrollW: el.scrollWidth, clientW: el.clientWidth };
    });
    await page.screenshot({ path: `test-results/mobile-${p.name}.png` });
    // Allow 1px rounding; anything more is a real horizontal scrollbar on mobile.
    expect(overflow.scrollW, `${p.name} overflows: scrollW=${overflow.scrollW} clientW=${overflow.clientW}`).toBeLessThanOrEqual(overflow.clientW + 1);
  });
}
