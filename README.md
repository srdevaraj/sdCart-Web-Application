# sdCart — Production E-Commerce Platform

A full-stack e-commerce application: **React + TypeScript + Vite** storefront and a
**Java 21 + Spring Boot 3.5** REST API backed by **PostgreSQL**, secured with
**Spring Security + JWT** (access + rotating refresh tokens).

This repository is production-deployable through **Docker**, **GitHub Actions**
and **Render** (blueprint in `render.yaml`).

```
┌─────────────────┐   HTTPS / CORS    ┌──────────────────┐        ┌──────────────┐
│  React frontend  │ ───────────────► │  Spring Boot API  │ ─────► │  PostgreSQL  │
│  Vite + Nginx    │  /api/v1         │  :8080 (PORT)     │  JDBC  │  + Flyway    │
│  :80 (Nginx)     │                  │  JWT auth         │        │              │
└─────────────────┘                  └──────────────────┘        └──────────────┘
```

## Stack

| Layer       | Technology                                                              |
|-------------|-------------------------------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Axios, Tailwind CSS, Radix UI, React Hook Form + Zod, Vitest + Testing Library |
| Backend     | Java 21, Spring Boot 3.5, Spring MVC, Spring Data JPA, Spring Security, JWT |
| Database    | PostgreSQL 16, Flyway migrations (`ddl-auto=validate`)                   |
| API         | `/api/v1`, Swagger UI at `/swagger-ui.html`, Actuator health at `/actuator/health` |
| Infra       | Docker / docker compose, GitHub Actions, Render (blueprint)              |

## Repository layout

```
backend/    Spring Boot API (own README: backend/README.md)
frontend/   React storefront (own README: frontend/README.md)
scripts/    API verification script (47 end-to-end checks against a live backend)
.github/    CI workflow
render.yaml Render blueprint (Postgres + backend + frontend)
```

## Quick start

### 1. Docker (full stack — recommended)

Requires Docker with the daemon running.

```bash
cp .env.example .env     # optional — local dev defaults exist
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080 · Swagger: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

> ⚠️ Compose defaults (`postgres/password`, dev JWT secret) are **local-only**.
> Production uses Render-managed credentials — never reuse these.

### 2. Local development (no Docker)

**Backend** — requires PostgreSQL 14+ on `localhost:5432`, database `sdcart`:

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

Flyway creates and seeds the schema on startup (dev admin: `admin@sdcart.com` / `password`).

**Frontend**:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:3000
```

## Environment variables

All configuration comes from environment variables. Never commit real `.env`
files; commit only `.env.example` templates. See `.env.example` (compose),
`backend/.env.example` and `frontend/.env.example`.

| Variable                   | Where        | Purpose                                   | Default (dev)                        |
|----------------------------|--------------|-------------------------------------------|--------------------------------------|
| `DATABASE_URL`             | backend      | JDBC URL (compose)                        | `jdbc:postgresql://localhost:5432/sdcart` |
| `DB_HOST`/`DB_PORT`/`DB_NAME` | backend   | Alternative JDBC composition (Render)     | `localhost`/`5432`/`sdcart`          |
| `DATABASE_USERNAME`        | backend      | DB user                                   | `postgres`                           |
| `DATABASE_PASSWORD`        | backend      | DB password                               | `password` (dev only)                |
| `JWT_SECRET`               | backend      | HMAC key, **≥ 32 chars**, required in prod | dev placeholder (fails in prod)      |
| `JWT_ACCESS_EXPIRATION`    | backend      | Access token TTL (ms)                     | `900000` (15 min)                    |
| `JWT_REFRESH_EXPIRATION`   | backend      | Refresh token TTL (ms)                    | `604800000` (7 days)                 |
| `FRONTEND_URL`             | backend      | CORS allowed origin(s, comma separated)   | `http://localhost:3000`              |
| `SPRING_PROFILES_ACTIVE`   | backend      | `dev` or `prod`                           | `dev`                                |
| `PORT` / `SERVER_PORT`     | backend      | HTTP port (Render sets `PORT`)            | `8080`                               |
| `ADMIN_EMAIL`/`ADMIN_PASSWORD` | backend  | Admin bootstrap (only when password set)  | admin@sdcart.com / `password` (dev)  |
| `VITE_API_BASE_URL`        | frontend     | Backend base URL, **build time**          | `http://localhost:8080`              |
| `VITE_APP_URL`             | frontend     | Public origin (canonical links)           | `http://localhost:3000`              |
| `DATABASE_PASSWORD`        | compose      | Local Postgres container password         | `password` (dev only)                |
| `RATE_LIMIT_ENABLED`       | backend      | Per-IP rate limit on `/api/v1/auth/*`     | `true`                               |
| `RATE_LIMIT_PER_MINUTE`    | backend      | Max auth requests per IP per minute       | `30`                                 |

Optional integrations (all empty by default; see `backend/.env.example`):
Cloudinary (`CLOUDINARY_*`), Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`PAYMENT_PROVIDER`), SMTP (`SMTP_*`, `EMAIL_PROVIDER`).

### Production fail-safes

- `JWT_SECRET` missing/short or the dev default used with the `prod` profile →
  startup fails (`JwtService`).
- `FRONTEND_URL` unset or a localhost origin with the `prod` profile → startup
  fails (`SecurityConfig` CORS guard).
- `ADMIN_PASSWORD` empty in prod → no admin user is created.
- Error responses never include stack traces (`include-stacktrace: never`).
- Actuator exposes only `health`, `info`, `metrics`; `/actuator/**` requires
  `ROLE_ADMIN` except `health`/`info`.

## Commands

### Frontend (`cd frontend`)

```bash
npm install        # install dependencies
npm run dev        # dev server on :3000
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (22 tests: auth, protected routes, products, cart, checkout, admin guard)
npm run build      # typecheck + production build (route-split chunks)
```

### Backend (`cd backend`)

```bash
./mvnw test                 # unit tests
./mvnw -DskipTests package  # build the jar
./mvnw spring-boot:run      # run locally
bash ../scripts/verify-api.sh   # 47 end-to-end API checks against a running backend
```

## Docker

| Command                              | Purpose                                  |
|--------------------------------------|------------------------------------------|
| `docker compose up --build`          | Build & run the full stack               |
| `docker compose up -d`               | Run in the background                    |
| `docker compose config`              | Validate the compose file                |
| `docker build -t sdcart-backend . ./backend`  | Build the backend image          |
| `docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t sdcart-frontend ./frontend` | Build the frontend image |

- Backend image: multi-stage Maven build → `eclipse-temurin:21-jre`, non-root
  user, `prod` profile by default, container-aware JVM settings, health check.
- Frontend image: multi-stage Node 22 build → `nginx:1.27-alpine`, SPA fallback,
  gzip, immutable caching for hashed assets, security headers, `/healthz`.
- The API URL is a **build arg** (`VITE_API_BASE_URL`) — it is never hard-coded
  and the local `.env` is excluded from the build context via `.dockerignore`.
- No secrets are baked into either image.

## GitHub Actions

`.github/workflows/ci.yml` runs on push to `main` and pull requests:

1. **Frontend** — `npm ci`, lint, typecheck, tests, production build.
2. **Backend** — Maven tests, Maven package.
3. **Docker** — builds both production images.

CI fails on any critical error (lint error, type error, failing test, failing
build). The Render services deploy only when CI checks pass
(`autoDeployTrigger: checksPass`).

## Render deployment

`render.yaml` is a Blueprint: push the repo to GitHub → Render Dashboard →
**New → Blueprint → select the repository**. Render provisions:

The full step-by-step runbook (exact order, environment-variable checklist,
manual items such as `ADMIN_PASSWORD`, and the post-deploy smoke test) is in
[`docs/deployment.md`](docs/deployment.md).

```
Render PostgreSQL (sdcart-db, free plan) 
      ──► sdcart-backend  (web, Docker, prod profile, /actuator/health)
            ──► sdcart-frontend (web, Docker + Nginx, /healthz)
```

Wiring done automatically by the blueprint:

- Database host/port/name/user/password via `fromDatabase`.
- `JWT_SECRET` generated once by Render (`generateValue` + `sync: false`).
- `VITE_API_BASE_URL` and `FRONTEND_URL` point at the two deployed services.
- `ADMIN_PASSWORD` is `sync: false` — **set it in the Dashboard** after the
  first deploy to create the admin user (`admin@sdcart.com`).

Post-deploy checklist:

1. Open the backend service → **Environment** → set `ADMIN_PASSWORD` (this also
   creates the admin account on next deploy/restart).
2. Upgrade the database plan from `free` (free databases expire after 30 days).
3. (Optional) Configure Cloudinary, Stripe, SMTP env vars in the Dashboard.
4. (Optional) Add custom domains under each service.

```bash
render blueprints validate   # validate render.yaml with the Render CLI
```

### Temporary free/demo deployment (`render-free.yaml`)

For **testing or portfolio/demo use at $0/month**, a second blueprint
(`render-free.yaml`) deploys the **same application** (same Dockerfiles, same
PostgreSQL/Flyway setup, same JWT/Spring Security protections, same health
checks) on Render's **free plans** — backend and frontend become free web
services (512 MB RAM / 0.1 CPU, spin down after 15 min idle) and the database
stays on the free Postgres plan (1 GB, **expires after 30 days**, no backups).

- `render.yaml` (paid Starter web services) is **unchanged** — the future
  production deployment.
- Deploy: **New → Blueprint → select the repo → set Blueprint file to
  `render-free.yaml`** (custom blueprint filenames supported since Feb 2026).
- Full runbook, env-var checklist, limitations and the switch-back procedure:
  [`docs/free-deployment.md`](docs/free-deployment.md).

## Backup & recovery

Production PostgreSQL backup strategy, restore procedure, migration
recovery and the **local-only** database reset steps are documented in
[`docs/backup-and-recovery.md`](docs/backup-and-recovery.md). In short:
enable Render's automated backups, keep an off-site `pg_dump`, and never run
destructive commands against the production database (`flyway clean` is
disabled in the `prod` profile).

## Deployment order

1. Push to GitHub (CI validates everything).
2. Create the Render Blueprint → database + backend + frontend provision.
3. Set `ADMIN_PASSWORD` (and any optional integration secrets) in the Dashboard.
4. Verify: frontend loads → login works → products/search/cart/checkout work.
5. Point a custom domain at the frontend and update `FRONTEND_URL`.

## Testing

- Frontend: Vitest + React Testing Library (auth, protected routes, products,
  cart, checkout form, admin guard).
- Backend: Spring Boot tests (JWT, coupon, cart, order logic).
- Integration: `scripts/verify-api.sh` exercises 47 real API flows against a
  running backend (register/login/refresh, search/filter, cart, wishlist,
  addresses, coupon, checkout → payment, cancel, reviews, admin CRUD).

## Security notes

- Stateless JWT auth; refresh tokens rotate on every use.
- Passwords are BCrypt-hashed; no secrets ever reach the browser bundle.
- Backend authorization is authoritative — admin endpoints require `ROLE_ADMIN`
  regardless of what the frontend shows.
- CORS is restricted to the configured `FRONTEND_URL` (no wildcard in prod).
- API keys/credentials live only in environment variables / Render Dashboard.
