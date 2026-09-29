# FV-001 — Multilingual storefront (MK · EN · SQ) + status handoff

**Status:** PLAN — not yet approved, implementation NOT started.
**Author:** session 2026-09-29. **Owner decision required before build (see §9).**
**Convention:** written-plan rule (CLAUDE.md) — no code until the developer approves.

> **SCOPE CONFIRMED (2026-09-29):** developer chose **full translation of everything the
> visitor sees** — UI chrome **AND** all admin-managed content (products, descriptions, specs,
> blog, FAQ, testimonials, pages). So this is **M1 + M2 + M3**. The **admin panel UI stays
> Macedonian**, but every content field gets **[МК][EN][SQ] input tabs**. This resolves §9.1
> (scope = full) and §9.6 (admin UI = MK-only). Decisions §9.2–§9.5 + §9.7 still open.

This document has two jobs:
1. **§0 Handoff / current project status** — where we stopped and why (read this first).
2. **§1–§10 The i18n plan** — how to add English + Albanian to the whole storefront with a
   language switcher in the header.

---

## §0 — Current status & PAUSE POINT (read first)

### Live now
- **Production is LIVE** on Hetzner VPS `135.181.156.104`, domain **`filtervoda.mk`**
  (+`www`→apex), valid TLS via **Caddy** (auto-TLS). Storefront `200`, admin at `/admin/`,
  API health `db+redis ok`. Deployed with `bash scripts/deploy-vps.sh` (git archive + `scp`
  of the gitignored `.env.production`; the api container reads mail/secrets via `env_file`).
  > NOTE: prod reverse proxy is **Caddy**, not Nginx/Certbot as the older CLAUDE.md text says.

### Mail (done today, 2026-09-29)
- Provider = **Brevo** SMTP (`smtp-relay.brevo.com:587`, STARTTLS). `SMTP_*` + `MAIL_FROM` +
  `NOTIFY_EMAILS` (3 addresses) set in `.env.production` and confirmed present inside the
  running api container. SMTP auth was tested against Brevo and **succeeds**.
- `apps/api/src/lib/mailer.ts` sends when `SMTP_HOST` is set; skips cleanly
  (`email.skipped.no_smtp`) when empty, so leads are never lost.
- Brevo domain auth DNS at zemi.mk: **brevo-code ✅**, **DKIM1 + DKIM2 CNAMEs ✅**
  (→ `b1/b2.filtervoda-mk.dkim.brevo.com`).

### ⛔ THE PAUSE — blocking issue to resolve before we continue
- **Duplicate DMARC record** on `_dmarc.filtervoda.mk`. Two TXT records exist:
  - `v=DMARC1; p=none;` (old/empty — **DELETE this one at zemi.mk**)
  - `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` (Brevo — **KEEP only this**)
  Two DMARC records = invalid per RFC 7489 → DMARC ignored → hurts deliverability.
- **Action pending on the client/zemi.mk**, then verify all records show green in Brevo, then
  submit a real lead from the site and confirm mail arrives at the 3 inboxes (check spam once).
- **We deliberately stop here and wait for DMARC to be fixed** before starting the i18n build.

### Still open before full public traffic (not blockers for i18n planning)
- Change demo passwords (`admin@filtervoda.mk/admin12345`, editor, client).
- Fill `GA4_ID`, `GTM_ID` (Meta CAPI token + Turnstile already set), verify in GA4 DebugView
  + Meta Test Events.

---

## §1 — Goal

Serve the entire public storefront in **three languages** — Macedonian (`mk`, default),
**English (`en`)**, **Albanian (`sq`)** — with a **language switcher in the header**. Admin
panel stays **Macedonian only** (the SPAR team is MK-speaking) unless the developer says
otherwise.

"Whole website" = both layers:
- **A. UI chrome** — nav, buttons, form labels, section headings, static microcopy, emails,
  404/thank-you, cookie banner, calculator labels. Currently hardcoded MK in ~43 `.tsx` files.
- **B. Admin-managed content** — products (name, description, specs, stages, badges, FAQ),
  categories, blog posts (Совети), B2B packages, testimonials, pages & copy, nav/footer copy,
  SEO meta. Currently single-language columns in Postgres.

---

## §2 — Current state (verified 2026-09-29)

- **No i18n anything**: no dictionary files, no i18n dependency, no `useTranslation`, no locale
  in routing. Confirmed by search across `apps/web`, `apps/admin`, `packages/shared`.
- **Routing** (`apps/web/app/routes.ts`): flat MK slugs — `proizvodi`, `proizvodi/:slug`,
  `za-biznis`, `soveti`, `soveti/:slug`, `za-nas`, `kontakt`, `blagodarime`, `pravni/:slug`,
  `sitemap.xml`, `*`. No locale prefix.
- **~43 of 46** web `.tsx` files contain hardcoded Cyrillic literals.
- **DB content** (Prisma): translatable text lives on `Product` (name, description Json),
  `ProductSpec` (label/value), `ProductStage` (name), `ProductCategory` (name, description),
  `Faq`, `B2bPackage` (name, description), `Testimonial`, `Post` (title, excerpt, content Json),
  `PostCategory` (name), plus copy in `Setting`. All single-language today.
- **Fonts**: self-hosted woff2 with cyrillic + latin subsets (`apps/web/app/fonts.css`).
  ⚠️ Albanian needs `ë` and `ç` — **must verify these glyphs exist** in every family
  (Unbounded, Manrope, Oswald, Onest, JetBrains Mono) or extend the subset via
  `scripts/fetch-fonts.mjs` (latin-ext).

---

## §3 — Recommended architecture

### 3.1 Locales & URL strategy
- Locales: `mk` (default), `en`, `sq`. Single source of truth constant in
  `packages/shared/src/constants.ts` (`LOCALES = ['mk','en','sq']`, `DEFAULT_LOCALE = 'mk'`).
- **URL prefix, default unprefixed** (recommended):
  - `mk` → `/`, `/proizvodi`, … (UNCHANGED — preserves existing SEO + the legacy 301 map
    Прилог Ѓ, which points at MK URLs).
  - `en` → `/en/…`, `sq` → `/sq/…`.
- **Route segments stay the same** across locales for launch (`/en/proizvodi`, `/sq/proizvodi`).
  Translated segments (`/en/products`) are nicer SEO but add slug management + redirect
  complexity — defer to a later iteration. **Product/post slugs are identifiers → stay
  identical in all locales.**
- Implement with a **`($lang)` optional/param layout route** wrapping all pages, or a `($lang)`
  prefix segment. `mk` resolves when the prefix is absent. Root loader detects locale from the
  URL (not cookies/Accept-Language for the canonical URL; a cookie may drive the *initial*
  redirect/switcher default only).

### 3.2 UI chrome dictionary (Layer A)
- Hand-rolled typed dictionary — **no new dependency** (keeps the ≤150 kB JS budget; avoids a
  runtime i18n lib). Structure that could later migrate to `react-i18next` if needed.
- Files: `apps/web/app/i18n/{mk,en,sq}.ts` (or `.json`) with a shared key union type in
  `packages/shared`. `mk` is the reference; missing keys in `en`/`sq` **fall back to `mk`**.
- `LocaleProvider` (context) set from the root loader; `useT()` hook returns `t('key', vars)`
  with simple `{var}` interpolation. Extract every hardcoded string from the ~43 components
  into keys (this is the bulk of Layer-A work).
- Currency stays **MKD** (`36.000 ден.`), dates `dd.mm.yyyy`, numbers MK-formatted in all
  locales (single MK market). Only the surrounding words translate.

### 3.3 Admin content translation (Layer B) — DECISION NEEDED (§9)
Recommended: **JSON i18n sidecar columns** (expand/contract, backward-compatible).
- Add nullable `*_i18n Json?` columns beside translatable fields, e.g. `Product.nameI18n`,
  `Product.descriptionI18n`, `ProductSpec.valueI18n`, `Post.titleI18n`/`excerptI18n`/`contentI18n`,
  category `nameI18n`, FAQ, testimonial, B2B, SEO meta. Shape: `{ "en": "...", "sq": "..." }`.
- The base column keeps **MK** (nothing breaks; trivial fallback: `i18n[locale] ?? base`).
- API read endpoints resolve the requested locale server-side and return already-localized
  fields (so the web app stays locale-agnostic in its rendering). Add `?lang=` / path locale to
  the public read layer; **cache key must include locale** (Redis full-page + data cache).
- Admin editors gain **per-locale tabs** (MK | EN | SQ) on each content field; a "missing
  translation → falls back to MK" indicator. `AuditLog` + cache purge per locale on publish.
- Alternative (not recommended for launch): normalized `Translation(entity,id,field,locale)`
  table — more flexible, more joins/complexity.

### 3.4 SEO
- `hreflang` alternate `<link>`s for all three locales + `x-default` → `mk`, on every page.
- Per-locale `canonical`, translated `<title>`/meta description (stored per locale in SEO meta),
  `og:locale` + `og:locale:alternate`, `<html lang>` set from locale.
- `sitemap.xml` lists each URL with `xhtml:link` alternates per locale.
- JSON-LD `inLanguage` per locale; prices stay MKD.
- Legacy 301 map (Прилог Ѓ) unchanged (MK at root).

### 3.5 Language switcher (header) — DESIGN GAP (§9)
- Placement: header top-right, per the developer's ask. **No handoff spec exists for it**
  (CLAUDE.md Category 13 → warn, don't guess). Need either a design addition or approval of a
  minimal token-based dropdown (МК / EN / SQ, globe icon `lucide` `Globe`/`Languages`, ≥44px
  touch target, AA contrast, keyboard accessible via Radix `DropdownMenu`).
- Switching navigates to the **same page in the target locale** (preserves path + query, incl.
  `fbclid`/`utm_*`). Persist choice in a cookie for the next visit's default only.

### 3.6 Emails
- Lead notification / autoreply / password-reset templates (`_docs/design/.../emails/`) —
  autoreply should match the **lead's locale** (store `locale` on the `Lead`, set from the
  page the form was submitted on). Operator notifications can stay MK.

---

## §4 — Data model changes (if §3.3 sidecar approach approved)
- Prisma **expand** migration: add nullable `*I18n Json?` columns (no data backfill needed;
  null → MK fallback). Reversible down-migration drops them. Same PR as code.
- Add `Lead.locale String?` (which language the lead used).
- Add per-locale SEO meta storage (extend the existing SEO/`Setting` mechanism).
- Immutable-migration rule: new migration file, never edit committed ones.

---

## §5 — Translation content sourcing — DECISION NEEDED (§9)
The translated **text itself is content, not code**. Options:
- (a) Professional human translation (best for legal + product specs, MK→EN, MK→SQ).
- (b) AI-generated first draft (I can produce EN/SQ drafts for UI strings + marketing copy) +
  **human review** (mandatory for legal/spec accuracy).
- Legal pages (`pravni/:slug`): confirm whether translations are legally acceptable or the MK
  text is the binding version (lawyer/client call).

---

## §6 — Milestones (build order, each ships with tests — CLAUDE.md Cat. 6)
- **i18n-M1 — Locale infra + UI chrome.** Constants, `LocaleProvider`, `($lang)` routing,
  header language switcher, extract all Layer-A strings into `mk/en/sq` dictionaries, fallback
  logic, cookie default. Tests: locale resolution, fallback, switcher navigation preserves
  path+query. *(No DB change — shippable on its own; content stays MK until M2.)*
- **i18n-M2 — Content translation.** Prisma expand migration (`*I18n`), API locale resolution
  + locale-aware cache keys, admin per-locale tabs, `Lead.locale`. Tests: API returns localized
  field with MK fallback; admin round-trip; cache key isolation; tenant predicate intact.
- **i18n-M3 — SEO + emails + polish.** hreflang/canonical/sitemap alternates, per-locale meta,
  locale-aware autoreply, font glyph verification (Albanian ë/ç) + subset extension if needed,
  legal decision applied. E2E: switch language in header → nav + content + `<html lang>` +
  canonical all change; product page renders localized name/price; lead autoreply in lead's
  language.

---

## §7 — Testing (Definition of Done for the feature)
- Unit: locale resolver, dictionary fallback, `i18n[locale] ?? base` helper.
- Integration (real Postgres): API returns EN/SQ content with MK fallback; cache keyed by
  locale; `tenantId` predicate still enforced.
- E2E (Playwright, mobile 390 + desktop): language switch changes chrome + content + SEO tags;
  URLs `/en/…` `/sq/…` resolve; `mk` stays at root; query params preserved on switch.
- Coverage targets unchanged (≥70% BE / ≥60% FE).

## §8 — Performance / a11y guardrails
- No i18n runtime lib → protect the ≤150 kB gzip JS budget; ship only the active locale's
  dictionary (code-split per locale if it grows). LCP/INP/CLS NFRs unchanged.
- Switcher: ≥44px target, visible focus, AA contrast, `lang` attribute correct, `hreflang` valid.

---

## §9 — DECISIONS (ALL RESOLVED 2026-09-29)
1. ✅ **Scope = full**: UI chrome + all content. Build M1+M2+M3.
2. ✅ **DB approach = JSON sidecar `*I18n` columns** (expand/contract, MK base + fallback).
3. ✅ **URL scheme = `mk` unprefixed + `/en` + `/sq`**; **MK route segments kept** for all locales
   (`/en/proizvodi`, `/sq/proizvodi`); product/post slugs identical across locales.
4. ✅ **Translation source = Claude writes all EN + SQ drafts** (UI, content, AND legal pages).
   ⚠️ Client/lawyer should still review legal + product-spec accuracy before public launch —
   flag, don't block.
5. ✅ **Switcher = minimal token-based dropdown** (Claude designs it — `lucide` Globe/Languages,
   Radix `DropdownMenu`, МК/EN/SQ, ≥44px, AA, keyboard). No external handoff spec needed.
6. ✅ **Admin UI stays MK-only**; content fields get [МК][EN][SQ] tabs.
7. ✅ **Legal pages: Claude writes EN/SQ**, but **MK remains the binding version** until a lawyer
   confirms otherwise (note this on the translated legal pages / to the client).

**→ Plan is fully specified. Awaiting: (a) DMARC fix + mail verified, (b) explicit go-ahead to
start i18n-M1 on `feature/FV-i18n` off `develop`.**

## §10 — Explicitly out of scope (this plan)
- Admin panel UI translation (stays MK).
- RTL languages. Per-locale pricing/currency. Translated route segments (deferred).
- Geo/Accept-Language auto-redirect (canonical URL is explicit; cookie affects default only).

---

---

## §11 — BUILD PROGRESS LOG

### i18n-M1 — IN PROGRESS (branch `feature/FV-i18n`, started 2026-09-29)
**Foundation DONE + verified (web typecheck ✅, ESLint ✅, 16 web tests ✅):**
- `packages/shared/src/constants.ts`: `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `PREFIXED_LOCALES`,
  `LOCALE_LABELS`/`LOCALE_SHORT`/`LOCALE_BCP47`, `isLocale()`.
- `apps/web/app/i18n/`: `mk.ts` (reference dict), `en.ts` + `sq.ts` (Partial, MK fallback),
  `types.ts` (`Dict`/`TKey`), `index.ts` (`translate()` + `{var}` interpolation),
  `paths.ts` (`stripLocale`, `localizedPath`), `context.tsx`
  (`LocaleProvider`, `useLocale`, `useT`, `useLocalizedPath`, `useSwitchLocalePath`, `LocaleLink`),
  `__tests__/i18n.test.ts`.
- Routing (`routes.ts`): MK at root + `/en` + `/sq` via `prefix()`, same modules with unique id
  prefixes (`mk-`/`en-`/`sq-`). sitemap + `*` stay root-only.
- `root.tsx`: `<html lang>` from URL locale; `LocaleProvider` wraps body; ErrorBoundary translated.
- `components/LanguageSwitcher.tsx`: accessible custom dropdown (NO new dep — radix-dropdown is
  only transitive), cookie `fv_locale`, `tone` prop for dark headers.
- All 3 template headers (b1/b2/b3): nav + CTA via `useT`, `LocaleLink`, switcher added.

**i18n-M1 CHROME COMPLETE (commits 2–10) — web typecheck ✅, ESLint ✅, 16 tests ✅, prod build ✅:**
- Shell: headers b1/b2/b3, Footer + StickyBar, LeadModal + LeadForm, ConsentBanner, switcher, 404/ErrorBoundary.
- Pages: thank-you, not-found, about, contact, catalog, blog, post, legal (chrome), home (pure
  chrome), product page + B2B page incl. the full savings calculator UI.
- Components: PageShell breadcrumbs (locale-aware), all 3 TrustBars + ProductCards, HomeSections.
- Dictionaries `mk/en/sq` grown to cover every extracted chrome string (nav, cta, lead, consent,
  footer, thankyou, error, about, contact, catalog, card, pp.*, b2b.*, home.*, trust.*, legal, post…).

**Intentionally left for M2 (admin-managed CONTENT, not chrome):** product/category names,
descriptions, specs, badges, blog article bodies, testimonials, FAQ, and the shipped default
CONTENT blocks (home hero H1/H2 + WHY_ITEMS + STAGES in `templates/types.ts`; B2B PROBLEMS/
INCLUDED/INDUSTRIES/DEFAULT_STEPS/DEFAULT_COMPARISON; About DEFAULTS overrides) — these render
MK until admin enters per-locale content in M2. Legal BODY text stays MK (binding, §9.7).

**Deferred to M3:** `meta()` SEO titles/descriptions + JSON-LD breadcrumb names (run server-side;
need locale from `location` + `translate()` — pages still emit MK `<title>`); hreflang/canonical
alternates; sitemap locale alternates; locale-aware autoreply; Albanian ë/ç font-glyph check;
optional bare-root redirect from the `fv_locale` cookie.

### i18n-M2 — READ PATH DONE (branch `feature/FV-i18n-m2`, off `feature/FV-i18n`)
**Refinement vs plan:** ONE nullable `i18n Json?` column per model (holds `{ en:{field:val…}, sq:{…} }`)
instead of many `*I18n` columns — simpler migration + admin editing. Migration
`20260929173238_add_i18n_columns` (9 ADD COLUMN JSONB, non-breaking) applied.
- `apps/api/src/lib/i18n.ts`: `applyLocale`/`applyLocaleAll`/`localeFromQuery` (MK fallback, drops `i18n`).
- Public routes honor `?lang=`; product.service localizes product + nested specs/stages/faqs/related;
  categories/posts/faq/packages/testimonials localized inline. Cache key includes locale (prefix
  purge clears all variants). `api.server.ts` + loaders (home/catalog/product/blog/post/b2b) thread
  URL locale. Verified: api+web typecheck, api 25 tests (6 new), web build.

**Admin write path DONE (partial):** shared `i18nOverlaySchema` (null→undefined) added to
product/post/faq + category/post-category/package/testimonial/spec/stage schemas; handlers spread
validated data so `i18n` persists; GET returns it. Reusable `apps/admin/app/components/I18nPanel.tsx`
(EN/SQ sub-tabs; text/textarea/list). Wired: **product editor** (name, tagline, shortDescription,
idealFor, includedInPrice, maintenanceNote, badges, chips, seoTitle, seoDescription) + **GenericCrud
`i18nFields` prop** → **FAQ + testimonials** editors. Verified: shared/api/admin typecheck, ESLint,
api 25 + shared 16 tests, admin build.

**STILL TODO in M2:**
- **Remaining admin editors** — categories, B2B packages, posts, post-categories use CUSTOM forms
  (not GenericCrud); each needs an `I18nPanel` wired in (packages incl. `includes` list; posts incl.
  title/excerpt/seo — per-locale rich body deferred; sanitize any i18n HTML if added later).
- **Setting-based content** — home hero/why/stages, About, B2B copy, cookie banner live in
  `Setting.value` JSON; need a per-locale mechanism in `settings.service` (separate from model
  `i18n` columns). Until then these render MK on /en /sq.
### i18n-M3 — NOT STARTED (hreflang/canonical/sitemap alternates, per-locale meta, locale-aware
autoreply, Albanian ë/ç font glyph check, legal binding note).

**Nothing committed yet** (commit only on the developer's go). Changes live in the working tree
on `feature/FV-i18n`.

---

### Resume checklist for the next agent
1. Confirm **DMARC duplicate removed** at zemi.mk + Brevo shows green + test lead delivered.
2. Continue **i18n-M1** per §11 TODO (chrome extraction), then M2, then M3.
3. Plan stays the source of truth; keep the §11 progress log current.
