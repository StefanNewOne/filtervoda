# Old Site Reference (read-only) — filtervoda.mk (WordPress)

Analysis of the legacy WordPress + WooCommerce site (as of 2026-08-26, PRD §2). **Read-only** —
never a target to modify. Kept so we preserve SEO value and don't reproduce known problems.

## What it is

WordPress + WooCommerce (Site Kit). Nav: Продавница / Содржина / За нас. Built around „Add to
cart" — which does **not** match the client's real sales process (call → agreement → install).

## What we migrate

- **17 products** with MKD prices (regular + sale) — full inventory in PRD Прилог А → seed.
- **10+ educational articles** on `/NNN/`-style URLs (reverse osmosis, TDS, alkaline water,
  water at work for 5+ employees, bottled water…). SEO value → **migrated with 301s** (Прилог Ѓ).
- **Meta Pixel** `1957593378149639` — kept (same ID).
- Trust messages: 10 години гаранција · Бесплатна монтажа · Достава низ цела Македонија · 24/7 ·
  Плаќање во готово или на рати.
- Contacts: 076/676/819, 070/755/190 · facebook.com/filtervodamk · Instagram @sparcompanymk.

## Known Legacy Bugs / content problems (do NOT reproduce)

1. E-commerce UX without e-commerce sales — cart creates friction and false expectation.
2. No lead form and no conversion tracking → ad spend not measured end-to-end.
3. No B2B offer, despite existing B2B articles and a dispenser in the range.
4. **Inconsistent content:** descriptions copied between products (e.g. „до 90 литри дневно" on
   CRYSTAL DIGITAL 600HF, which is a direct-flow model; the DIGITAL description ends with „SPAR
   CRYSTAL SMART"). Specs not structured. → We write clean, structured, per-product content.
5. Visually dated and slow, not mobile-first — while traffic is mostly mobile from FB/IG in-app
   browsers.

## Migration notes

- Redirect map (Прилог Ѓ) applied at the web-server layer, query params preserved (fbclid,
  utm_*). Data-driven test asserts every old URL → 301 → 200.
- Slugs are cleaned; JSON-LD + OG added per product/article (absent on the old site).
