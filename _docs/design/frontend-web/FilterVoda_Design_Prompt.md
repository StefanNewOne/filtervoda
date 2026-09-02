# FilterVoda — Design System (source of truth)

Distilled from the `filtervoda-handoff/` prototypes and the Design Brief. Governs both the
public site and the admin. Tokens live in `handoff/tokens.css`; components in
`handoff/components.md`; per-screen detail in `handoff/screens/`.

## 1. Principles

1. **Clean, premium, „technology + freshness".** Lots of white space, big product photography,
   water motifs (waves, droplets) only as subtle background — never clutter.
2. **Mobile-first, conversion-first.** The first mobile screen shows a headline, a value, and a
   CTA without scrolling. A sticky bottom bar (Повикај · Viber · Барање) on product & B2B pages,
   hidden when a form is open.
3. **One message, one primary CTA per screen.** The social creatives are a reference for tone,
   not layout — the site is calmer than them.
4. **Trust is structural.** Trust bar on every page: 10 години гаранција · Бесплатна монтажа ·
   Достава низ цела Македонија · Плаќање во готово или на рати.
5. **Every term is explained inline** (RO = „мембрана што ги отстранува растворените соли,
   бактерии и тешки метали"). Address the visitor as „Вие".

## 2. Palette

Base is blue + the water droplet; green is reserved for positive messages („Бесплатна монтажа").
Full scales in `tokens.css`. Never introduce red as a brand colour (SPAR supermarket confusion).
Each of the 3 templates shifts the palette via `[data-template]` overrides but keeps blue + the
droplet.

## 3. Typography

- Fonts with **full Cyrillic** (ѓ ќ ѕ џ љ њ), self-hosted woff2, cyrillic+latin subset.
- Display/body per template: b1 Unbounded+Manrope · b2 Oswald+Manrope · b3 Onest(+JetBrains Mono).
- Headings: `--font-display`, weight 500–600, `--tracking-tight`/`--tracking-tighter`,
  `line-height` ~1.0–1.15, `text-wrap: balance`.
- Numbers in specs/prices/calculator: `--font-mono`, `font-variant-numeric: tabular-nums`.
- Max 2 families per template.

## 4. Spacing, radius, shadow, motion

- Spacing base 4px (`--spacing-*`); content max 1200px; generous section air.
- Radius per template (`--radius-cta`, `--radius-chip`, `--radius-card`).
- Shadows subtle (`--shadow-sm/md/lg`); the product „floats" on a soft shadow (b1).
- Motion **moderate** (framer-motion): fade-up on scroll, hover-lift on cards, stepper
  transitions, count-up numbers (b3), calculator fill. No full-screen loaders, no hero video.
  Respect `prefers-reduced-motion`.

## 5. Conversion elements (required on every template)

Header (phone click-to-call + „Побарај понуда"; mobile hamburger + phone icon) · trust bar ·
global lead modal (pre-selected product; short name+phone form) · product card (image, name,
tagline, 3 chips, price/„Побарај цена", badges, CTA) · product page (gallery, chips, price,
badges, CTA above the fold; Идеален за · Придобивки · Како функционира stepper · спецификација
· што вклучува цената · одржување · споредба · ЧПП · inline form) · B2B landing (hero → problem →
solution → **calculator** → 3 steps → packages → devices → industries → comparison table → FAQ →
form) · catalogue comparison table (mobile horizontal scroll, sticky first column) · thank-you.

## 6. Admin design language

Light theme (dark-mode-ready tokens), functional, dense tables, clear statuses, little colour.
**Accent colour per module** (never mixed) — see `--color-accent-*` in tokens. Radix primitives
(Dialog, Sheet, Tabs, Select, DropdownMenu, Popover, Tooltip, Toast, Checkbox, RadioGroup,
Switch, Slider, NavigationMenu), sortable/filterable/paginated tables, drag-and-drop for image &
spec order, TipTap rich text (minimal toolbar), ⌘K command palette (COULD). Re-auth dialog for
destructive ops. Every admin screen usable read-only on mobile 390 (+ lead status change).

## 7. Required states (design them, don't bolt on)

Consent banner (banner / settings / accepted), cookie settings, 404, thank-you, loading
skeletons, empty states (category with no products, blog with no posts), form validation errors,
success. Preview bar („Ова е нацрт — не е објавено") for draft preview.

## 8. Imagery

Consistent product photos (white/transparent bg, ≥ 2000px, 3+ angles) — placeholders until the
client delivers. Lifestyle scenes (kitchen, office, glass of water) — no faces, no children, no
stock clichés. Alt text mandatory. AVIF/WebP via StorageService.
