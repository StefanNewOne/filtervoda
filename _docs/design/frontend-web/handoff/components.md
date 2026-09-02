# Components — inventory & mapping

Each component maps to Radix primitive(s) + Tailwind (tokens only) + lucide icons. Props/states
listed for implementation. Reproduce the handoff visuals identically. a11y is mandatory, not
optional.

## Primitives

| Component | Radix / base | lucide | States | a11y |
| --- | --- | --- | --- | --- |
| Button (primary/secondary/ghost) | `button` | optional leading icon | default, hover (lift), focus-visible ring, active, disabled, loading | ≥44px, `aria-busy` when loading |
| Chip | `span` | — | default, active | decorative; text has contrast |
| Badge (Акција, Ново, Бесплатна монтажа) | `span` | `BadgeCheck`, `Truck` | — | not focusable |
| Input / Textarea / Select | `Label`+`input` / Radix `Select` | `ChevronDown` | default, focus, error, disabled | `<label for>`, `aria-invalid`, `aria-describedby` error id; ≥16px text |
| Checkbox / RadioGroup / Switch | Radix `Checkbox`/`RadioGroup`/`Switch` | `Check` | default, checked, error, disabled | keyboard operable, label association |
| Slider (calculator, employees) | Radix `Slider` | — | default, focus, dragging | `aria-valuenow/min/max`, keyboard |
| Accordion (ЧПП) | Radix `Accordion` | `Plus`/`Minus` | collapsed, expanded | `aria-expanded`, keyboard |
| Tabs (catalogue categories, editor) | Radix `Tabs` | — | active, hover | roving tabindex |
| Dialog / Modal (lead modal) | Radix `Dialog` | `X` | open, closing, error, success | focus trap, `Esc`, labelled |
| Sheet (admin mobile nav / filters) | Radix `Dialog` (side) | `Menu`, `X` | open/closed | focus trap |
| Tooltip | Radix `Tooltip` | — | — | keyboard focus shows |
| Toast | Radix `Toast` | `CheckCircle2`, `AlertTriangle` | success, error, info | `role=status`, auto-dismiss + manual |
| Popover / DropdownMenu | Radix `Popover`/`DropdownMenu` | `MoreVertical` | open/closed | keyboard nav |
| Breadcrumb | `nav`+`ol` | `ChevronRight` | — | `aria-current=page` |
| Pagination | `nav` | `ChevronLeft/Right` | active page, disabled ends | `aria-label` |
| Skeleton | `div` (pulse) | — | loading | `aria-hidden`, `aria-busy` on region |

## Composite — public

| Component | Notes |
| --- | --- |
| Header | logo, nav (Производи · За фирми · Совети · За нас · Контакт), phone click-to-call, „Побарај понуда"; mobile: hamburger (Sheet) + phone icon |
| Trust bar | 4 items; b2 renders as a wave band (`--color-trust-bg` gradient) |
| Product card | image (4:5 systems / 1:1 dispenser+accessories), name, tagline, 3 chips, price or „Побарај цена", badges, CTA |
| Gallery / lightbox | thumbnails + main; Dialog lightbox; keyboard arrows |
| Stepper (6 filtration stages) | numbered nodes, animated on scroll; each: name, removes, why it matters |
| Spec table | grouped rows (group header band), key/value/unit, tabular-nums; mobile stacks |
| Comparison table | sticky first column, horizontal scroll on mobile |
| Calculator (B2B) | employees slider, gallons/bottles choice, price/gallon; outputs current, with-SPAR, annual saving + disclaimer; „water fills" progress; carries `calcInput` to form |
| Lead form (B2C / B2B / contact / advisor) | react-hook-form + Zod (shared schemas), honeypot, Turnstile, consent checkbox; inline errors; success state |
| Sticky bottom bar (mobile) | Повикај · Viber · Барање; hides when a form/modal is open |
| Testimonial slider | horizontal scroll (no carousel lib), name/company/city/rating |
| Logo band | client logos grid |
| Consent banner | Прифати сè / Само неопходни / Поставки; settings panel toggles (statistics, marketing) → Consent Mode v2 |
| Preview bar | „Ова е нацрт — не е објавено" for tokenised draft preview |

## Composite — admin

| Component | Notes |
| --- | --- |
| App shell | sidebar (module list w/ accent dots + badges), topbar (breadcrumb, active-template pill, ⌘K COULD), content |
| Data table | sort, filter chips, search, pagination, row actions, bulk select |
| Lead detail | fields, attribution, timeline (LeadEvent), notes, status select (+ reason on Изгубено), Повикај/Viber/Email, Анонимизирај (re-auth) |
| Editor tabs (product) | Основно · Галерија · Придобивки · Степени · Спецификација · Цена и беџови · ЧПП · Поврзани · SEO; draft/published; preview |
| Template selector | 3 cards, one „Активен темплејт", others „Примени на сајтот"; token editor (CTA/ink/accent/radius/font/mono) with live AA contrast; „Генерирај tokens.css"; „Врати фабрички"; Примени → publish → cache purge |
| Media grid | upload (drag-drop), alt (required), replace-in-place, variants preview |
| Re-auth dialog | password re-entry; explains why; valid 10 min |
| Rich text (TipTap) | headings, lists, images, video embed, tables, links, callout — minimal toolbar |
| Charts (recharts) | leads by day/source/product, delivery state |
