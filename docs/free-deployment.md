# sdCart — Temporary Free/Demo Render Deployment (`render-free.yaml`)

> ⚠️ **Temporary demo hosting only.** This deploys the **exact same application**
> (code, Dockerfiles, PostgreSQL 16 + Flyway, JWT auth, Spring Security, rate
> limiting, security headers, health checks) on Render's **free plans** so you
> can test and demo the stack at $0/month. The paid production configuration in
> `render.yaml` is **untouched** and remains the future production deployment.

---

## 0. Why a separate file

- `render.yaml` (paid Starter web services) stays unchanged as the future
  production blueprint.
- `render-free.yaml` is a second blueprint for the free/demo stack. Render has
  supported **custom blueprint filenames** since Feb 2026, so you can create a
  Blueprint directly from `render-free.yaml`.
- Service names are prefixed `sdcart-demo-*` so the demo stack never collides
  with the future production stack (`sdcart-*`).

---

## 1. Prerequisites

- GitHub repo containing this project (CI runs on push — the blueprint waits
  for checks via `autoDeployTrigger: checksPass`).
- A Render account on the free Hobby workspace.

```bash
git add render-free.yaml docs/free-deployment.md
git commit -m "sdCart: add free/demo Render blueprint (render-free.yaml)"
git push
```

> `git status` before committing: only `*.env.example` templates from the env
> category — never a real `.env` or secret.

---

## 2. Create the Blueprint

1. Render Dashboard → **New** → **Blueprint** → select the repository.
2. In the blueprint setup, set the **Blueprint file** to `render-free.yaml`
   (not the default `render.yaml`).
3. Review the three resources Render will provision:

   | Resource | Type | Plan |
   |---|---|---|
   | `sdcart-demo-db` | PostgreSQL 16 | free (1 GB, expires after 30 days) |
   | `sdcart-demo-backend` | Web service (Docker, prod profile) | free |
   | `sdcart-demo-frontend` | Web service (Docker + Nginx) | free |

4. Confirm and wait for provision + first deploy. The first build is slow
   (Maven + npm inside Docker; free Hobby gives 500 build minutes/month).

---

## 3. Verify the actual URLs (important)

Render derives each service's public URL from its name
(`https://sdcart-demo-backend.onrender.com`,
`https://sdcart-demo-frontend.onrender.com`) but **appends a suffix if the name
is taken**. Open each service page and read the real `https://...onrender.com`
URL. If either differs from the blueprint values:

- **Backend** → Environment → update `FRONTEND_URL` to the real frontend URL
  → Save → Deploy (backend restart; the prod profile fails startup on a
  localhost/unset CORS origin, so the value must be a real https URL).
- **Frontend** → Environment → update `VITE_API_BASE_URL` to the real backend
  URL → Save → Deploy (this is a build-time value — the frontend **must** be
  redeployed, not just restarted).

---

## 4. Environment variables

### Automatically generated / wired by the blueprint (nothing to do)

| Variable | How |
|---|---|
| `SPRING_PROFILES_ACTIVE=prod` | literal in blueprint |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `fromDatabase` → Render-managed credentials (never `postgres`/`password`) |
| `JWT_SECRET` | `generateValue: true` + `sync: false` — strong secret generated **once** by Render, never printed, never in Git |
| `JWT_ACCESS_EXPIRATION=900000` · `JWT_REFRESH_EXPIRATION=604800000` | literals |
| `FRONTEND_URL=https://sdcart-demo-frontend.onrender.com` | literal (verify — see step 3) |
| `ADMIN_EMAIL=admin@sdcart.com` | literal |
| `DB_POOL_MAX_SIZE=5` | literal — free-tier tuning only (Hikari pool cap on the 512 MB instance); the paid `render.yaml` does not set this |
| `VITE_API_BASE_URL=https://sdcart-demo-backend.onrender.com` | build arg (verify — see step 3) |

### Must enter manually in the Dashboard (secrets, never in Git)

| Variable | Where | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | backend → Environment | Strong random password. The admin user (`admin@sdcart.com`) is created **only** when set. Set it, then **Deploy/restart** the backend once. |

Optional integrations (Cloudinary/Stripe/SMTP) are **not** configured on the
free demo — the app runs with its safe defaults (mock payment gateway, console
email). Free services cannot send SMTP email anyway.

---

## 5. Health checks & smoke test

- `GET https://sdcart-demo-backend.onrender.com/actuator/health` → `{"status":"UP"}`
- `GET https://sdcart-demo-frontend.onrender.com/healthz` → `200 ok`
- Frontend loads; a deep route (e.g. `/products/anything`) returns the SPA.
- Browser Network tab: API calls go to
  `https://sdcart-demo-backend.onrender.com/api/v1/...` with no CORS errors.
- Quick flow: register → login → browse/search → cart → checkout (mock
  payment) → order history. Admin: log in as `admin@sdcart.com` with the
  `ADMIN_PASSWORD` you set.

---

## 6. Free-hosting limitations (expect these)

1. **Sleeping / cold starts** — free web services spin down after **15 minutes
   without traffic**; the next request takes ~1 minute to wake up. First page
   load of a demo will be slow after idle.
2. **Instance hours** — 750 free hours/month **shared by both services**
   (backend + frontend). With spin-down this is fine for demo/portfolio use;
   ~24/7 always-on traffic would exhaust the pool and suspend the services
   until the next month.
3. **Resources** — 512 MB RAM / 0.1 CPU per instance. The Spring Boot JVM is
   capped at 75% of container memory (`MaxRAMPercentage`); the Hikari pool is
   capped at 5. Builds also count against 500 free build minutes/month.
4. **Database is temporary** — free Postgres has **1 GB storage, expires
   30 days after creation** (14-day grace, then deleted), and **no automated
   backups**. Do not put anything irreplaceable in the demo DB; `pg_dump` any
   data you want to keep before it expires.
5. **Bandwidth** — 5 GB/month on the free Hobby workspace (Apr 2026 plan
   change); heavy image traffic can hit this.
6. **Email** — free services cannot send SMTP email (app uses the console
   sink by default — expected).
7. **No persistence guarantees** — data/state is ephemeral by design. This is
   a testing/portfolio stack, not production.

---

## 7. Switching back to the paid production `render.yaml`

1. When you're ready to pay, keep `render-free.yaml` in the repo (it's inert —
   Render only provisions what a blueprint file you actually create describes)
   or delete it.
2. Delete the demo resources to free up the workspace's **single free
   Postgres** (Render allows only one free Postgres per workspace): Dashboard →
   delete `sdcart-demo-db`, `sdcart-demo-backend`, `sdcart-demo-frontend`
   (and the demo Blueprint itself). `pg_dump` anything you want to keep first.
3. Create the production Blueprint from **`render.yaml`** (the default file —
   no custom path needed): Dashboard → **New** → **Blueprint** → select the
   repo → keep the default `render.yaml`.
4. Render provisions `sdcart-db`, `sdcart-backend`, `sdcart-frontend`.
   Upgrade the database plan from `free` (the comment in `render.yaml` notes
   this) — the 30-day free Postgres is not suitable for production.
5. Set `ADMIN_PASSWORD` on the backend (and any optional integration secrets),
   then follow `docs/deployment.md` for the full production runbook and
   smoke test.

No application code, Dockerfiles, database schema, security or API behavior
changes between the two deployments — only plans, service names and (for the
demo) the pool-size cap and URLs differ.

---

## 8. Validation

- YAML syntax is checked locally (see `scripts/` or a `js-yaml`/PyYAML parse).
- Full blueprint validation against Render's schema (plans, `fromDatabase`,
  `generateValue`, health-check paths) is done with the Render CLI:

  ```bash
  render blueprints validate   # run from the repo root
  ```

  If you don't have the Render CLI installed, the Dashboard's Blueprint
  preview (step 2) performs the same validation before anything is created.
- **Nothing in this document claims the demo was deployed.** Deploy and verify
  with steps 3–5 before treating it as live.
