# sdCart — Render Deployment Runbook

Deploys the verified sdCart stack on Render:

```
Render PostgreSQL (sdcart-db)
        ↓  fromDatabase wiring
Spring Boot Backend (sdcart-backend, prod profile, Docker)
        ↓  CORS: FRONTEND_URL
React/Nginx Frontend (sdcart-frontend, Docker)
```

Everything below is based on the **existing** `render.yaml`, `backend/Dockerfile`,
`frontend/Dockerfile`, `frontend/nginx.conf`, `application-prod.yml` and the
verified production profile (tested locally end-to-end, including Flyway V1–V4,
coupon deactivation and the no-admin-bootstrap fail-safe).

---

## 0. Prerequisites

- A GitHub account and the ability to create a repository.
- A Render account (free tier works; upgrade the database plan — see step 5).
- The project folder is **not yet a git repository**. Render deploys from
  GitHub, so the first real action is:

```bash
# From the project root (sdCart Website/):
git init
git add .
git status                 # confirm NO .env, *.pem, *.key, credentials.json are staged
git commit -m "sdCart: production release"
git branch -M main
git remote add origin https://github.com/<you>/sdcart.git
git push -u origin main
```

> The `.gitignore` files (root, backend, frontend) already exclude `.env`,
> `.env.*`, `*.pem`, `*.key`, `credentials.json` etc. `git status` above is the
> guard: only `*.env.example` templates should appear from the env category.

---

## 1. Create the Render Blueprint

1. Render Dashboard → **New** → **Blueprint** → select the GitHub repo.
2. Render reads `render.yaml` and provisions three resources:
   - `sdcart-db` — PostgreSQL 16 (free plan initially)
   - `sdcart-backend` — web service (Docker, prod profile)
   - `sdcart-frontend` — web service (Docker + Nginx)
3. Wait for the initial deploy to finish (first build takes several minutes:
   Maven + npm inside Docker).

## 2. Render PostgreSQL (provisioned by the blueprint)

- Database name `sdcart`, user/password are **Render-managed** — the backend
  gets them via `fromDatabase` (host/port/database/user/password) in
  `render.yaml`. Never enter `postgres` / `password` anywhere.
- The blueprint already wires `DB_HOST`, `DB_PORT`, `DB_NAME`,
  `DATABASE_USERNAME`, `DATABASE_PASSWORD` from the database.

## 3. Backend environment (mostly automatic)

`render.yaml` already sets, with **no manual entry needed**:

| Variable | Value set by blueprint |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `fromDatabase` (Render-managed) |
| `JWT_SECRET` | `generateValue: true`, `sync: false` (generated once, never printed) |
| `JWT_ACCESS_EXPIRATION` | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7 days) |
| `FRONTEND_URL` | `https://sdcart-frontend.onrender.com` (CORS) |
| `ADMIN_EMAIL` | `admin@sdcart.com` |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_PER_MINUTE` | defaults apply (`true` / `30`) |

**Manual (required) — set in the backend service → Environment:**

1. `ADMIN_PASSWORD` — a strong random password. The admin user
   (`admin@sdcart.com`) is created **only** when this is set; without it no
   admin exists (fail-safe, verified). After setting it, **deploy/restart** the
   backend once.
2. (Optional, only if you use them) `PAYMENT_PROVIDER` + `STRIPE_SECRET_KEY` +
   `STRIPE_WEBHOOK_SECRET`; `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`;
   `EMAIL_PROVIDER` + `SMTP_*`. Until set, the app runs with the safe defaults
   (mock payment gateway, console email).

Never paste values of secrets into this document or chat — set them directly in
the Dashboard.

## 4. Backend health

1. Open the backend service → **Events/Logs** → confirm "Your service is live".
2. `GET https://sdcart-backend.onrender.com/actuator/health` → `{"status":"UP"}`
3. Flyway runs at startup; with the prod profile the applied set is
   `V1, V2, V3, V4` (V4 = `db/prod-migrations`, deactivates the demo coupons —
   already verified locally). Check with:

   ```bash
   # via the Render database shell (or any psql client with Render credentials)
   SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
   ```

4. Sanity: `WELCOME10` and `SAVE20` should be `active = f` (deactivated by V4).

## 5. Frontend deployment

- `render.yaml` already sets `VITE_API_BASE_URL=https://sdcart-backend.onrender.com`
  (the REAL backend URL — no localhost). It is injected as a Docker build arg
  and baked in at build time; the Dockerfile **fails the build** if it is
  missing.
- Verify after deploy:
  - `https://sdcart-frontend.onrender.com` loads.
  - `https://sdcart-frontend.onrender.com/healthz` → `200 ok`.
  - A deep route (e.g. `/products/anything`) returns the SPA (React Router
    works).
  - Browser dev tools → Network: API calls go to
    `https://sdcart-backend.onrender.com/api/v1/...`, no failed requests;
    Console: no critical errors.

## 6. CORS

- The backend's `FRONTEND_URL` is already `https://sdcart-frontend.onrender.com`
  (no `*`, no localhost — the prod profile **fails startup** otherwise,
  verified locally). If you later add a custom domain to the frontend, update
  `FRONTEND_URL` to that domain (comma-separated list supported) and redeploy
  the backend.

## 7. Post-deploy production smoke test

Run against the real HTTPS URLs (all steps must be real, no fake responses):

1. Open the frontend → homepage renders.
2. Register a new customer (unique email) → auto login.
3. Logout, then login again.
4. Browse products; search + filters; open a product detail.
5. Add items to cart, update quantity, remove.
6. Wishlist add/remove.
7. Add a shipping address.
8. Validate a coupon (no seeded coupons are active in prod — expect "not
   active" for `WELCOME10`; create a real coupon from Admin first if desired).
9. Checkout → place order.
10. Pay the order (mock gateway is the current implementation unless Stripe is
    configured).
11. Order history + order detail; cancel a pending order where allowed.
12. Write/update/delete a review.
13. Logout → login again (refresh token must have been revoked server-side).
14. **Admin:** login as `admin@sdcart.com` with the `ADMIN_PASSWORD` set in
    step 3 → dashboard; product CRUD; category/brand; coupon; user; order
    status; payment listing.
15. **Security checks:**
    - Customer token on `/api/v1/admin/*` → `403`.
    - No token on `/api/v1/users/me` → `401`.
    - Garbage bearer token → `401`.
    - `/auth/refresh` with an already-used refresh token → `401` (reuse
      rejected).
    - `/auth/logout` with the current refresh token → subsequent refresh of
      that token → `401`.
    - Invalid input (e.g. bad email) → `400` with validation errors.
    - Unknown order id → `404`.

The 47-check suite (`scripts/verify-api.sh`) exercises most of this against a
running backend — run it against the deployed API with
`BASE=https://sdcart-backend.onrender.com/api/v1 bash scripts/verify-api.sh`
(note: it expects the dev-only `WELCOME10` coupon and the seeded admin
`password`, so it is a **dev-environment** check; against prod it will report
expected failures on coupon/admin-login steps — do not treat those as app
bugs).

## 8. Backup before you rely on it

Follow `docs/backup-and-recovery.md`: enable Render's automated backups,
schedule an off-site `pg_dump`, and actually exercise a restore once. Emergency
rollback procedure is documented there too.

---

## Environment-variable checklist (summary)

| Variable | Where | Value | Manual? |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | backend | `prod` | no (blueprint) |
| `DB_HOST/DB_PORT/DB_NAME/DATABASE_USERNAME/DATABASE_PASSWORD` | backend | Render-managed (`fromDatabase`) | no |
| `JWT_SECRET` | backend | generated, `sync: false` | no (generated) |
| `JWT_ACCESS_EXPIRATION` | backend | `900000` | no |
| `JWT_REFRESH_EXPIRATION` | backend | `604800000` | no |
| `FRONTEND_URL` | backend | `https://sdcart-frontend.onrender.com` | no (update if custom domain) |
| `ADMIN_EMAIL` | backend | `admin@sdcart.com` | no |
| `ADMIN_PASSWORD` | backend | strong secret | **YES — set in Dashboard** |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_PER_MINUTE` | backend | `true` / `30` (defaults) | no |
| `PAYMENT_PROVIDER` + `STRIPE_*` | backend | unset → mock gateway | **only if using Stripe** |
| `CLOUDINARY_*` | backend | unset → no uploads | **only if using Cloudinary** |
| `EMAIL_PROVIDER` + `SMTP_*` | backend | unset → console sink | **only if using SMTP** |
| `VITE_API_BASE_URL` | frontend | `https://sdcart-backend.onrender.com` (build arg) | no (blueprint) |
| `VITE_APP_URL` | frontend | optional canonical origin | optional |

**Never** printed here or in chat: `JWT_SECRET`, `ADMIN_PASSWORD`, DB password,
Stripe/Cloudinary/SMTP secrets — set them only in the Render Dashboard.

## Order of operations (short version)

1. `git init` + commit + push to GitHub
2. Render Dashboard → New → Blueprint → select repo
3. Wait for provision + first deploy (DB → backend → frontend)
4. Backend service → Environment → set `ADMIN_PASSWORD` → deploy/restart
5. Verify `/actuator/health` = UP and Flyway V1–V4
6. Verify frontend `/healthz` = 200 and SPA routes
7. Run the section 7 smoke test over HTTPS
8. Upgrade the DB plan from `free` (free Postgres expires after 30 days)
9. Optional: configure Stripe/Cloudinary/SMTP, custom domain
