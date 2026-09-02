# Self-hosted fonts (design assets — provided by design/client)

Drop the **cyrillic+latin woff2** variable fonts here (referenced from `app/app.css`). They must
render all Macedonian letters (ѓ ќ ѕ џ љ њ). No Google Fonts CDN (performance + privacy, PRD §10.3).

Required files:

| File | Family | Used by template |
| --- | --- | --- |
| `manrope-var.woff2` | Manrope | b1, b2 (body) |
| `unbounded-var.woff2` | Unbounded | b1 (display) |
| `oswald-var.woff2` | Oswald | b2 (display) |
| `onest-var.woff2` | Onest | b3 (display + body) |
| `jetbrains-mono-var.woff2` | JetBrains Mono | numbers/specs (all) |

Subset to `cyrillic,cyrillic-ext,latin` to keep each file small (hero budget: ≤ 200 KB total fonts
on mobile). Until real files are added, the browser falls back to system fonts.
