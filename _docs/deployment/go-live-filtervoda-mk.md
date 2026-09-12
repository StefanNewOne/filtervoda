# Go-live: врзување на доменот filtervoda.mk

Тековна состојба: продукцијата работи на прегледниот хост
`https://135.181.156.104.sslip.io` (валиден TLS, без DNS). Кодот е подготвен за
`filtervoda.mk` — доменот се активира со **два чекора** (DNS, па еден деплој).

VPS: `135.181.156.104` (Hetzner). Reverse proxy: Caddy (авто-TLS преку Let's Encrypt).

---

## Чекор 1 — DNS (кај zemi.mk)

Постави кон VPS-от:

| Тип | Име | Вредност |
| --- | --- | --- |
| A | `@` (filtervoda.mk) | `135.181.156.104` |
| A | `www` | `135.181.156.104` |

Почекај пропагација (обично 15 мин – неколку часа). Провери:
`nslookup filtervoda.mk` → треба да враќа `135.181.156.104`.

**Не деплојувај го доменот пред DNS да резолвира** — инаку Caddy не може да извади
TLS сертификат (ACME HTTP-01 предизвикот бара доменот да покажува кон VPS-от).

## Чекор 2 — деплој со доменот

На deploy-машината, во `.env.production` постави ги (вредностите се веќе подготвени —
види долу):

```
SITE_DOMAIN=filtervoda.mk
PUBLIC_SITE_URL=https://filtervoda.mk
ADMIN_URL=https://filtervoda.mk/admin
```

Потоа:

```
bash scripts/deploy-vps.sh
```

Caddy автоматски издава сертификат за `filtervoda.mk` (и `www`), www→apex редиректот
е активен (Caddyfile), а апликацијата почнува да генерира апсолутни OG/canonical URL-и
на `https://filtervoda.mk`.

## Чекор 3 — верификација по go-live

```
curl -sI https://filtervoda.mk/            # 200, валиден TLS
curl -sI https://www.filtervoda.mk/        # 301 → https://filtervoda.mk/
curl -s  https://filtervoda.mk/proizvodi/spar-crystal-digital-600hf | grep og:image
#   → og:image content="https://filtervoda.mk/img/products/digital.png" (апсолутен)
curl -s -o /dev/null -w '%{redirect_url}' "https://filtervoda.mk/produkt/spar-crystal-digital/?fbclid=X"
#   → https://filtervoda.mk/proizvodi/spar-crystal-digital-600hf?fbclid=X (query зачуван)
```

Провери лид-формата (Origin allowlist сега бара `https://filtervoda.mk`) — испрати
тест-барање од сајтот и потврди дека стигнува во admin → Lead-ови.

---

## Зошто овие вредности се важни

- `SITE_DOMAIN` → Caddy авто-TLS + за кој домен служи.
- `PUBLIC_SITE_URL` → (1) **Origin allowlist на `/api/v1/leads`** — само барања од овој
  origin се примаат; (2) апсолутни **OG/canonical** URL-и за FB/IG споделувања.
- `ADMIN_URL` → линкови/редирекции во e-mail и админот.

## Останато пред вистински продукциски сообраќај (одвоено од доменот)

- Смени ги demo-лозинките (`admin@filtervoda.mk/admin12345`, editor, client).
- Пополни: SMTP + `NOTIFY_EMAILS` (лид-известувања), Turnstile клучеви, Meta CAPI
  токен, GA4/GTM ID. Потврди во Meta Test Events + GA4 DebugView.
- Пополни ги `[потврди]` спецификациите преку админот.
