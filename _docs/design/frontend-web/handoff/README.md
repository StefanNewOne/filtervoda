# filtervoda.mk — Design Handoff

This folder is the **design source of truth** (CLAUDE.md Category 13). Claude Code reads it
before any frontend ticket and never edits it (changes go back to design).

## Read order

1. `../FilterVoda_Design_Prompt.md` — full design system (principles, palette, type, motion).
2. `tokens.css` — every colour/spacing/radius/shadow/font/motion as a CSS variable. **Never
   hardcode a value covered here.** The 3 templates are `[data-template]` overrides.
3. `components.md` — component inventory → Radix / Tailwind / lucide mapping, props, states, a11y.
4. `screens/<screen>.spec.md` — the screen you are building (same structure for every screen).
5. `emails/` and `og-image.spec.md` when relevant.

## Non-negotiables

- **The delivered design is identical to `filtervoda-handoff/`.** Reproduce pixel-accurately.
- Mobile-first: design at **390×844** first, then 768, then 1280 (content max 1200px).
- Touch targets ≥ 44px; input text ≥ 16px (no iOS zoom); visible focus; semantic headings.
- Contrast **AA**: 4.5:1 text, 3:1 UI. See the contrast pairs below.
- Macedonian Cyrillic UI (copy bank in the Design Brief, Блок Д). No lorem ipsum, no English UI
  (product/brand names excepted). Fonts must render ѓ ќ ѕ џ љ њ.
- Self-hosted woff2 (cyrillic+latin subset), no Google Fonts CDN.
- lucide-react icons only (plus the SPAR brand logo).
- One primary message + one primary CTA per screen. No hero video, no auto-play carousels.
- Nothing resembling the SPAR **supermarket** brand (avoid red + retail estetika).

## The 3 templates (single active, switched from admin „Дизајн и темплејти")

| `data-template` | Name | Character |
| --- | --- | --- |
| `b1` | Б-1 Кристално чисто | Light, airy, big product photo. Unbounded + Manrope. CTA blue, pill radius. |
| `b2` | Б-2 Жива вода | Blue→aqua gradient hero, organic waves. Oswald headings, green CTA, pill chips. |
| `b3` | Б-3 Паметна вода | Navy data panels, gauges, JetBrains Mono numbers, teal CTA, tight radii. |

Set `data-template` on `<html>` from `Setting.design.activeTemplate`; token overrides from
`Setting` per template. All three share content, routes, and copy — only tokens/treatment differ.

## Documented contrast pairs (AA)

| fg on bg | Ratio | Use |
| --- | --- | --- |
| `--color-ink` (#08182F) on white | 15.7:1 | body text, headings (b1/b2) |
| white on `--color-cta` b1 (#1156E0) | 5.9:1 | primary button |
| white on `--color-cta` b2 (#16803B) | 4.9:1 | primary button |
| `--color-ink` on `--color-chip-bg` (#F2F8FF) | 14.8:1 | chips |
| `#C8DCF0` on `--color-trust-bg` b3 (#071A3A) | 11.6:1 | trust text (dark) |
| `#9FE9FA` on b3 chip bg | ≥ 4.5:1 | data chips (verify per exact overlay) |

b3 is dark — verify any new fg/bg pair before shipping; the admin AA checker in
„Дизајн и темплејти" gates token edits.
