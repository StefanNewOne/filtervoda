# Local development

Prerequisites: Docker Desktop, Node 20+.

## First run

```bash
cp .env.example .env.local          # fill secrets; TURNSTILE_DEV_BYPASS=true is fine locally
npm install                         # installs all workspaces
docker compose up --build           # nginx + web + admin + api + postgres + redis + minio + mailhog
```

Then, in another shell, run migrations + seed against the running Postgres:

```bash
npm run prisma:migrate --workspace apps/api    # creates tables
npm run seed --workspace apps/api              # 17 products, users, settings, redirects
```

## URLs (behind Nginx on http://localhost)

| Surface | URL |
| --- | --- |
| Storefront | http://localhost/ |
| Admin | http://localhost/admin/ |
| API | http://localhost/api/v1/health |
| Swagger | http://localhost/api/docs |
| Mailhog (emails) | http://localhost:8025 |
| MinIO console | http://localhost:9001 |

## Seed logins (dev only — change everywhere else)

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@filtervoda.mk | admin12345 |
| EDITOR | editor@filtervoda.mk | editor12345 |
| CLIENT_VIEWER | client@filtervoda.mk | client12345 |

## Quality gate (same as the pre-push hook)

```bash
npm run lint && npm run typecheck && npm test
```

Fonts: drop the woff2 files into `apps/web/public/fonts/` (see the README there). Until then the
browser falls back to system fonts.
