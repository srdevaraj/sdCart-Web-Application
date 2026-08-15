# sdCart — Complete Feature & Access Guide

Everything below was derived from the actual source code (frontend `src/`, backend
`src/main/java/com/sdcart`, Flyway migrations). Where a feature is **not**
implemented, it is explicitly marked **"Not implemented"** — nothing here is
invented.

**Stack:** React 19 + Vite 8 + TypeScript (frontend) · Java 21 + Spring Boot 3.5
(backend) · PostgreSQL 16 + Flyway · JWT auth · Docker · Render-ready.

---

## 1. Quick Start

| What | URL |
|---|---|
| Storefront (frontend) | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Backend health | http://localhost:8080/actuator/health |
| Admin area | http://localhost:3000/admin (login as admin first) |

**Dev login credentials** (created automatically by the backend on first start):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sdcart.com` | `password` (dev default; `ADMIN_PASSWORD` env in prod) |
| Customer | register your own at `/register` | — |

**One command for everything:**

```bash
docker compose up --build
# frontend :3000 · backend :8080 · PostgreSQL :5432 (db: sdcart)
```

---

## 2. Website Access

### Public website (no login)
Home (`/`), product listing/search (`/products`, `/search`), product detail
(`/products/:publicId`), categories (`/categories`), brands (filter on
`/products`), About/Contact/Terms/Privacy (static pages), Login, Register,
Forgot/Reset password (UI only — see §3), 404 page.

### Customer website (login required)
`/cart`, `/checkout`, `/order-confirmation/:publicId` and everything under
`/account/*`: Profile, Orders, Order detail, Addresses, Wishlist, My Reviews.

### Admin website (ADMIN role required)
Everything under `/admin/*`: Dashboard, Products, Inventory, Categories,
Brands, Orders, Payments, Coupons, Users, Settings.

Guards (`frontend/src/components/layout/require-auth.tsx`):
- `RequireAuth` → signed-out users are redirected to `/login` (the intended
  route is preserved in navigation state and used after login).
- `RequireAdmin` → signed-out → `/login`; signed-in non-admin → redirected to
  `/` (home). The backend additionally enforces `ROLE_ADMIN` on `/api/v1/admin/**`
  (returns 403) — the frontend guard is UX only.

---

## 3. Customer Features (each verified in code)

| Feature | How to access | Backend API | Notes |
|---|---|---|---|
| **Registration** | `/register` — first name, last name, email, phone (optional), password + confirm | `POST /auth/register` | Auto-login; a cart and wishlist are auto-created; password ≥ 8 chars, BCrypt-hashed |
| **Login** | `/login` — email + password | `POST /auth/login` | Returns access + refresh tokens stored in localStorage |
| **Logout** | Account menu (avatar, top-right) → "Sign out" | `POST /auth/logout` | Sends the refresh token; server revokes it; local tokens cleared; redirects to `/` |
| **Profile** | Account menu → Profile (`/account/profile`) | `GET/PUT /users/me` | Edit first/last name, phone |
| **Password change** | `/account/profile` → "Change password" card | `PUT /users/me/password` | Requires current password; new ≥ 8 chars |
| **Product browsing** | `/products` (nav "Shop") or home sections | `GET /products` | 12 per page |
| **Search** | Header search box (desktop + mobile) | `GET /products?q=` | Navigates to `/products?q=…`; `/search` is the same page |
| **Filters** | `/products` sidebar: category, brand, price min/max, in-stock, featured | `GET /products` query params | Filter state lives in the URL |
| **Sorting** | `/products` sort dropdown: newest, price ↑↓, top rated, most reviewed, name A–Z | `GET /products?sort=` | |
| **Pagination** | `/products` page footer | `GET /products?page=&size=` | |
| **Categories** | `/categories` and home "Shop by category" | `GET /categories?tree=true/false` | Cards link to filtered products |
| **Brands** | shown on product detail + as filter | `GET /brands` | |
| **Product detail** | click any product card | `GET /products/{publicId}` | Image gallery (thumbnail switcher), price + compare-at discount %, stock, description |
| **Specifications** | Product detail → "Specifications" tab | (part of product response) | Name/value list |
| **Ratings/reviews (read)** | Product detail → "Reviews" tab | `GET /products/{id}/reviews` | Public; paginated (10/page) |
| **Add review** | Product detail → Reviews tab → "Write a review" (must be signed in) | `POST /reviews` | Rating 1–5 required, title/comment optional; one review per user per product (409 on duplicate) |
| **Edit/delete review** | On the product detail page, your review shows ✏️/🗑 (owner only) | `PUT /reviews/{id}` · `DELETE /reviews/{id}` | |
| **My Reviews page** | `/account/reviews` | `GET /orders` + `POST /reviews` | **Backend has no "my reviews" endpoint** — this page lists *purchased products* from your orders and lets you write a review for them. It does not list your existing reviews (edit/delete those on the product page) |
| **Cart** | `/cart` (nav cart icon) | `GET /cart` | Lists items, stock warnings |
| **Update quantity** | `/cart` quantity stepper (1–99, capped at stock) | `PUT /cart/items/{itemPublicId}` | |
| **Remove cart item** | `/cart` → "Remove" | `DELETE /cart/items/{itemPublicId}` | |
| **Clear cart** | `/cart` → "Clear cart" (confirm dialog) | `DELETE /cart` | |
| **Wishlist** | Product detail → ♥ button (signed in); list at `/account/wishlist` | `GET/POST/DELETE /wishlist` | |
| **Move wishlist → cart** | `/account/wishlist` → "Move to cart" | `POST /cart/items` + `DELETE /wishlist/items/{productId}` | Adds qty 1, removes from wishlist |
| **Addresses** | `/account/addresses` (Add / Edit / Delete / "Set as default") | `GET/POST/PUT/DELETE /addresses`, `PUT /addresses/{id}/default` | First address auto-becomes default |
| **Add address at checkout** | `/checkout` → "Add new" | `POST /addresses` | Same form as account page |
| **Coupon validation** | `/cart` and `/checkout` coupon box → Apply | `POST /coupons/validate` | Discount shown immediately; re-applied server-side at order creation |
| **Checkout** | `/cart` → "Proceed to checkout" | `POST /orders` | Choose address + payment method + optional coupon |
| **Payment** | `/order-confirmation/:id` or `/account/orders/:id` → "Pay $…" | `POST /payments/orders/{orderPublicId}/pay` | **Mock gateway** (always succeeds, no real charge). CARD/PAYPAL require the pay step; CASH_ON_DELIVERY does not |
| **Orders (list)** | `/account/orders` | `GET /orders` | Own orders only; 8/page |
| **Order details** | `/account/orders/:publicId` | `GET /orders/{publicId}` | Items, totals, coupon, payment, shipping address, status badges |
| **Cancel order** | `/account/orders` or order detail → "Cancel" (only while PENDING) | `POST /orders/{id}/cancel` | Releases stock back |
| **Pending payment** | Order detail/confirmation shows "Complete your payment" banner while `PENDING` | `POST /payments/orders/{id}/pay` | |
| **Email verification** | — | — | **Not implemented** (users table has `email_verified`, no flow) |
| **Forgot/reset password** | `/forgot-password`, `/reset-password` | — | **Not implemented in backend** — the pages collect the email and direct the user to `support@sdcart.com` (no API call) |
| **Contact form** | `/contact` | — | **Not implemented in backend** — opens a pre-filled `mailto:` email |

---

## 4. Admin Access

### How the admin account is created
`backend/src/main/java/com/sdcart/config/AdminInitializer.java` — on backend
startup, **only if** the `ADMIN_PASSWORD` environment variable is set (non-empty),
it creates the user `ADMIN_EMAIL` (default `admin@sdcart.com`) with the `ADMIN`
role. If `ADMIN_PASSWORD` is empty, **no admin is created** (fail-safe).

- **Dev profile** (`SPRING_PROFILES_ACTIVE=dev`, the default): `ADMIN_PASSWORD`
  defaults to `password` → admin exists locally.
- **Production profile**: no default → you must set `ADMIN_PASSWORD` in the
  Render dashboard and restart/deploy the backend once.

### How the frontend detects ADMIN
`isAdminUser(user)` in `frontend/src/features/auth/auth-store.ts` checks
`user.roles.includes('ADMIN')`. The role list comes from the login/register
response and `GET /users/me`.

### How to reach the admin area
1. Log in as `admin@sdcart.com`.
2. Click the avatar (top-right) → **"Admin Dashboard"** — this item only appears
   when the signed-in user has the `ADMIN` role.
3. You land on `/admin` (Dashboard). The admin sidebar has links to all admin
   screens. "← Back to store" returns to the public site.

**If a normal customer opens `/admin`:** the `RequireAdmin` guard redirects them
to `/` (home). If a signed-out user opens it, they get `/login`. If a customer
token is used against an admin API directly, the backend returns **403**.

---

## 5. Admin Feature Map

All admin screens require **ROLE_ADMIN** (frontend guard + backend
`/api/v1/admin/**` enforcement). All list the same backend APIs.

### Dashboard — `/admin`
- **Purpose:** store overview: product/customer/order/pending-order counts,
  recent-orders revenue, low-stock list (≤ 10 units).
- **Actions:** click-through links to Products / Users / Orders / Inventory.
- **APIs:** `GET /admin/products?size=100`, `GET /admin/users`, `GET /admin/orders`, `GET /admin/orders?status=PENDING`.

### Products — `/admin/products`
- **Purpose:** manage the catalog (create/edit/deactivate, search, status filter ACTIVE/INACTIVE/DRAFT).
- **Actions:** "Add product" / edit (✏️) / deactivate (🗑, soft-delete — hides from store).
- **Product form fields:** name, slug (auto from name), SKU, price, compare-at price, stock quantity, status, category, brand, featured flag, short + full description, images (URL + alt text, first = thumbnail), specifications (name/value rows).
- **APIs:** `GET/POST /admin/products`, `PUT /admin/products/{id}`, `DELETE /admin/products/{id}` (deactivate), `PATCH /admin/products/{id}/status`.
- **DB:** `products`, `product_images`, `product_specifications` (+ `categories`, `brands` lookups).

### Inventory — `/admin/inventory`
- **Purpose:** monitor stock levels (OK / Low ≤ 10 / Out) with a level bar; update quantities.
- **Actions:** edit stock via the same product form (opens "Update stock" dialog).
- **APIs:** `GET /admin/products`, `PUT /admin/products/{id}`.
- **DB:** `products.stock_quantity`.

### Categories — `/admin/categories`
- **Purpose:** create/edit/delete categories (tree view with sub-category counts).
- **Form:** name, slug, description, image URL, sort order, active.
- **APIs:** `POST /admin/categories`, `PUT/DELETE /admin/categories/{id}`.
- **DB:** `categories`.

### Brands — `/admin/brands`
- **Purpose:** create/edit/delete brands.
- **Form:** name, slug, description, logo URL, active.
- **APIs:** `POST /admin/brands`, `PUT/DELETE /admin/brands/{id}`.
- **DB:** `brands`.

### Orders — `/admin/orders`
- **Purpose:** list/filter orders by status and advance their lifecycle.
- **Actions:** status filter chips (All/Pending/Confirmed/Shipped/Delivered/Cancelled); per-order "Confirm", "Ship", "Deliver", "Cancel" buttons (only valid transitions shown). Order number links to the customer-facing order page (new tab).
- **Transitions (backend-enforced):** `PENDING → CONFIRMED | CANCELLED`, `CONFIRMED → SHIPPED | CANCELLED`, `SHIPPED → DELIVERED`.
- **APIs:** `GET /admin/orders?status=`, `PATCH /admin/orders/{id}/status`.
- **DB:** `orders` (+ stock restore on cancel via `order_items`, `products`).

### Payments — `/admin/payments`
- **Purpose:** view all payment transactions (method, amount, status, date).
- **Actions:** read-only list (paginated).
- **APIs:** `GET /admin/payments`.
- **DB:** `payments`.

### Coupons — `/admin/coupons`
- **Purpose:** create/edit/activate/deactivate promo codes.
- **Form:** code (auto-uppercase), type (PERCENTAGE/FIXED), value, min order amount, max discount, max usages, per-user limit, valid from/until, active, description.
- **Actions:** "Active/Inactive" toggle button; ✏️ edit; 🗑 (deactivates, keeps history).
- **APIs:** `GET/POST /admin/coupons`, `PUT /admin/coupons/{id}`, `PATCH /admin/coupons/{id}/active`.
- **DB:** `coupons` (`coupon_usage` tracks redemptions).

### Users — `/admin/users`
- **Purpose:** list/search registered users; enable/disable accounts.
- **Actions:** search by name/email; disable/enable via confirm dialog.
- **APIs:** `GET /admin/users?q=`, `PATCH /admin/users/{id}/status`.
- **DB:** `users`, `user_roles`.

### Settings — `/admin/settings`
- **Purpose:** static store overview (currency USD, free shipping ≥ $50, flat fee $5, tax 0%, mock payment gateway, console email) + signed-in admin info.
- **Actions:** links to profile/orders; **no backend settings API exists** — values are read-only documentation.
- **APIs:** none.

---

## 6. Frontend Routes (from `frontend/src/app/router.tsx`)

| Route | Screen | Purpose | Login | Admin |
|---|---|---|---|---|
| `/` | Home | Hero, categories, featured/trending/new/best-sellers, promo banner | — | — |
| `/products` | Products | Listing, search, filters, sort, pagination | — | — |
| `/search` | Products ("Search results") | Same page driven by `?q=` | — | — |
| `/products/:publicId` | Product detail | Gallery, specs, reviews, add-to-cart/buy-now/wishlist | — | — |
| `/categories` | Categories | Category cards → filtered products | — | — |
| `/about` `/contact` `/terms` `/privacy` | Static info pages | Company/support/legal text | — | — |
| `/login` | Login | Sign in form | — | — |
| `/register` | Register | Create account | — | — |
| `/forgot-password` | Forgot password | Collects email → directs to support (**no API**) | — | — |
| `/reset-password` | Reset password | Directs to support (**no API**) | — | — |
| `/cart` | Cart | Items, quantity, remove, clear, coupon, summary | ✅ | — |
| `/checkout` | Checkout | Address + payment method + coupon → place order | ✅ | — |
| `/order-confirmation/:publicId` | Order confirmation | Receipt + pay-now when pending | ✅ | — |
| `/account` | → redirects to `/account/profile` | | ✅ | — |
| `/account/profile` | Profile | Edit info + change password | ✅ | — |
| `/account/orders` | My orders | List + cancel (PENDING only) | ✅ | — |
| `/account/orders/:publicId` | Order detail | Items, totals, pay-now, cancel | ✅ | — |
| `/account/addresses` | Addresses | CRUD + set default | ✅ | — |
| `/account/wishlist` | Wishlist | List, move-to-cart, remove | ✅ | — |
| `/account/reviews` | My reviews | Review purchased products (writes only) | ✅ | — |
| `/admin` | Admin dashboard | Store stats, low stock | ✅ | ✅ |
| `/admin/products` | Products | Catalog CRUD | ✅ | ✅ |
| `/admin/inventory` | Inventory | Stock levels + update | ✅ | ✅ |
| `/admin/categories` | Categories | CRUD | ✅ | ✅ |
| `/admin/brands` | Brands | CRUD | ✅ | ✅ |
| `/admin/orders` | Orders | Filter + status transitions | ✅ | ✅ |
| `/admin/payments` | Payments | Transaction list | ✅ | ✅ |
| `/admin/coupons` | Coupons | CRUD + toggle | ✅ | ✅ |
| `/admin/users` | Users | Search + enable/disable | ✅ | ✅ |
| `/admin/settings` | Settings | Read-only overview | ✅ | ✅ |
| `*` | 404 | Not found | — | — |

All routes are lazy-loaded (route-split bundles).

---

## 7. Backend API Map (actual controllers under `/api/v1`)

Auth (`AuthController`):
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create account + tokens | public |
| POST | `/auth/login` | Login + tokens | public |
| POST | `/auth/refresh` | Rotate refresh token (rejects reused/revoked) | public (token) |
| POST | `/auth/logout` | Revoke refresh token (optional body) | public |

Catalog (public GET):
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | Search/filter/sort/paginate (q, category, brand, minPrice, maxPrice, inStock, featured) |
| GET | `/products/{publicId}` | Product detail |
| GET | `/categories?tree=` | Categories (flat or tree) |
| GET | `/categories/{publicId}` | Category detail |
| GET | `/brands` · `/brands/{publicId}` | Brands |
| GET | `/products/{productPublicId}/reviews` | Product reviews (paginated) |

Customer (authenticated):
| Method | Endpoint | Purpose |
|---|---|---|
| GET/PUT | `/users/me` | Profile get/update |
| PUT | `/users/me/password` | Change password |
| GET | `/cart` | My cart |
| POST | `/cart/items` | Add item |
| PUT/DELETE | `/cart/items/{itemPublicId}` | Update qty / remove |
| DELETE | `/cart` | Clear cart |
| GET | `/wishlist` | My wishlist |
| POST | `/wishlist/items` · DELETE `/wishlist/items/{productPublicId}` | Add / remove |
| GET/POST | `/addresses` | List / create |
| PUT/DELETE | `/addresses/{publicId}` | Update / delete |
| PUT | `/addresses/{publicId}/default` | Set default |
| GET/POST | `/orders` · `/orders/{publicId}` | My orders / place order |
| POST | `/orders/{publicId}/cancel` | Cancel pending order |
| POST | `/payments/orders/{orderPublicId}/pay` | Pay pending order (mock gateway) |
| POST | `/coupons/validate` | Validate coupon for an amount |
| POST | `/reviews` · PUT/DELETE `/reviews/{reviewPublicId}` | Create / edit / delete own review |

Admin (ROLE_ADMIN):
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/products` (+`/{id}`) | List (q/status) / detail |
| POST/PUT/DELETE | `/admin/products` · `/{id}` | Create / update / soft-delete |
| PATCH | `/admin/products/{id}/status` | Change status |
| GET | `/admin/orders` · PATCH `/admin/orders/{id}/status` | List (filter) / transition |
| GET | `/admin/users` · PATCH `/admin/users/{id}/status` | List/search / enable-disable |
| GET/POST/PUT/PATCH | `/admin/coupons` · `/{id}` · `/{id}/active` | Coupon CRUD + toggle |
| POST/PUT/DELETE | `/admin/brands` · `/{id}` | Brand CRUD |
| POST/PUT/DELETE | `/admin/categories` · `/{id}` | Category CRUD |
| GET | `/admin/payments` | Payment list |

Others: `GET /actuator/health`, `/actuator/info` (public) · `/actuator/**` (admin) ·
Swagger at `/swagger-ui.html`, OpenAPI at `/v3/api-docs` (public).

**Security model:** stateless JWT (access 15 min) + rotating refresh tokens
(7 days, DB-backed, revoked on logout, reuse rejected). Passwords BCrypt.
Admin enforced by Spring Security on `/api/v1/admin/**`; customer resources
(cart/wishlist/addresses/orders/reviews) are scoped to the authenticated user.

---

## 8. Database Map (Flyway `V1__init_schema.sql` … `V3__refresh_token_sessions.sql`)

| Table | Purpose | Key relationships | Written by |
|---|---|---|---|
| `users` | Accounts (BCrypt password, active flag) | 1:N addresses/orders; 1:1 cart/wishlist; M:N roles | Register, profile, admin users |
| `roles` / `user_roles` | Role catalog (`ADMIN`, `USER`) + join | — | Seed (V2), admin bootstrap |
| `categories` / `brands` | Catalog taxonomy | 1:N products | Admin categories/brands, seed (V2) |
| `products` | Products (price, stock, status, ratings cache) | N:1 category/brand; 1:N images/specs/order_items/cart_items | Admin products, checkout (stock), reviews (rating) |
| `product_images` / `product_specifications` | Images + spec rows | N:1 product | Admin product form |
| `carts` / `cart_items` | Shopping cart + lines | 1:1 user; N:1 product | Register (auto-create), cart UI, checkout (cleared) |
| `wishlists` / `wishlist_items` | Saved items | 1:1 user; N:1 product | Register (auto-create), wishlist UI |
| `addresses` | Shipping addresses | N:1 user | Address UI, checkout (add new) |
| `coupons` | Promo codes (limits, window) | 1:N coupon_usage; 1:N orders | Admin coupons, seed (V2) |
| `coupon_usage` | Coupon redemptions | N:1 coupon/user, 1:1 order | Checkout (order with coupon) |
| `orders` | Order header (status, totals, shipping snapshot) | N:1 user; 1:N order_items; 1:1 payment | Checkout, cancel, admin status |
| `order_items` | Snapshot lines (name/price at purchase) | N:1 order; N:1 product (nullable) | Checkout |
| `payments` | Payment record per order (mock gateway) | 1:1 order | Checkout (created), pay flow (completed) |
| `reviews` | Ratings + text | N:1 user/product | Review form, edit/delete |
| `refresh_tokens` | Issued refresh tokens (SHA-256 hash only) | N:1 user | Login/register/refresh/logout (rotation) |

**Flyway:** `ddl-auto=validate` — schema is owned by migrations
(`V1` schema, `V2` reference/seed data, `V3` refresh tokens; production adds
`db/prod-migrations/V4` which deactivates the demo coupons). Applied versions:
dev `V1–V3`, prod `V1–V4`.

**How a frontend action lands in the DB (example — checkout):** cart UI reads
`GET /cart` → checkout posts `POST /orders` → transaction validates/locks stock,
snapshots items + shipping address, applies coupon (increments `coupons.used_count`,
writes `coupon_usage`), creates `orders` + `order_items` + `payments` (PENDING),
decrements `products.stock_quantity`, clears `cart_items`. Payment step flips
`payments` to COMPLETED and `orders` to CONFIRMED.

**Seed data (V2):** 2 roles, 4 categories, 3 brands, 5 demo products with
images/specifications, 2 demo coupons (`WELCOME10`, `SAVE20`). No test users —
the only non-customer account is the env-gated admin bootstrap.

---

## 9. Customer Workflows (all steps exist)

**A. New customer:** `/register` → (auto-login) browse `/products` → open a
product → `/cart` (add from detail) → `/account/addresses` (add address) →
`/cart` apply coupon (e.g. `WELCOME10` on ≥ $50) → `/checkout` (pick address +
payment method) → Place order → `/order-confirmation/:id` → Pay (CARD/PAYPAL)
→ see order in `/account/orders` → write a review on the product page → logout
(avatar → Sign out) → login again.

**B. Returning customer:** `/login` → `/account/profile` → `/account/orders`
→ `/account/wishlist` (move items to cart) → `/cart` → `/checkout`.

**C. Admin:** login as admin → `/admin` → `/admin/products` → `/admin/inventory`
→ `/admin/categories` → `/admin/brands` → `/admin/coupons` → `/admin/orders`
(status transitions) → `/admin/users` → `/admin/payments`.

**D. Product management:** `/admin/products` → Add product (name/price/stock,
category, brand, images, specs, status) → customer sees it on `/products`
(status must be ACTIVE).

**E. Order lifecycle:** checkout → order `PENDING` → pay → `CONFIRMED` → admin
"Ship" → `SHIPPED` → admin "Deliver" → `DELIVERED`; cancel while `PENDING`
(customer or admin) → `CANCELLED` + stock restored. Customer sees each status on
`/account/orders/:id` (order detail).

---

## 10. Admin Workflows

**Admin login & navigation:** `/login` → avatar → "Admin Dashboard" (visible only
for `ADMIN` role) → `/admin`. Sidebar lists all 10 screens (§5).

**Create product:** `/admin/products` → "Add product" → fill form → save →
verify on the storefront.

**Change order status:** `/admin/orders` → filter Pending → "Confirm" →
"Ship" → "Deliver"; "Cancel" available on PENDING/CONFIRMED.

**Create coupon:** `/admin/coupons` → "Add coupon" → set limits/dates → customer
applies it at `/cart` or `/checkout`.

**Disable a user:** `/admin/users` → search → toggle Active (confirm dialog).

---

## 11. Local Development (no Docker)

**Prerequisites:** Java 21, Maven (wrappers included), Node 22, PostgreSQL 16 on
`localhost:5432` with a `sdcart` database.

```bash
# Backend
cd backend
cp .env.example .env        # optional; defaults exist
./mvnw spring-boot:run      # Windows: mvnw.cmd spring-boot:run
# -> http://localhost:8080 (Flyway creates schema + seed on first start)

# Frontend (second terminal)
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8080 (default)
npm install
npm run dev
# -> http://localhost:3000
```

| Open | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend / API | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/swagger-ui.html |
| Health | http://localhost:8080/actuator/health |
| Admin | http://localhost:3000/admin (login: `admin@sdcart.com` / `password`) |

**Verification scripts** (backend must be running):
```bash
bash scripts/verify-api.sh          # 47 end-to-end API checks (dev seed required)
bash scripts/concurrency-test.sh    # stock / coupon / double-payment race checks
```

---

## 12. Docker

```bash
docker compose up --build      # full stack: db :5432 → backend :8080 → frontend :3000
docker compose ps              # all three containers should be healthy
docker compose config          # validate the compose file
docker compose down            # stop
docker compose down -v         # stop + wipe the local database volume (LOCAL ONLY)
```

- Backend image: multi-stage Maven build → `eclipse-temurin:21-jre`, non-root,
  `prod` profile by default, health check via curl.
- Frontend image: Node 22 build → `nginx:1.27-alpine`, SPA fallback, gzip,
  immutable asset caching, security headers, `/healthz`.
- The frontend API URL is a **build arg** (`VITE_API_BASE_URL`) — the build
  fails if it is missing.

---

## 13. Render Production

The Render Blueprint (`render.yaml`) provisions: **sdcart-db (PostgreSQL 16) →
sdcart-backend (Docker, prod) → sdcart-frontend (Docker/Nginx)**. Full runbook in
`docs/deployment.md`.

| Resource | URL (placeholder until deployed) |
|---|---|
| Production frontend | `https://sdcart-frontend.onrender.com` |
| Production backend API | `https://sdcart-backend.onrender.com/api/v1` |
| Swagger | `https://sdcart-backend.onrender.com/swagger-ui.html` |
| Backend health | `https://sdcart-backend.onrender.com/actuator/health` |
| Frontend health | `https://sdcart-frontend.onrender.com/healthz` |
| Admin area | `https://sdcart-frontend.onrender.com/admin` |

Everything works identically over HTTPS. Key production differences:
`ADMIN_PASSWORD` must be set in the Render dashboard (creates the admin on
restart); demo coupons `WELCOME10`/`SAVE20` are **deactivated** by the
prod-only Flyway migration; production CORS is pinned to the deployed frontend
URL (startup fails otherwise); the mock payment gateway stays active unless
`STRIPE_SECRET_KEY` etc. are configured.

---

## 14. Troubleshooting

| Symptom | Most likely cause | Check |
|---|---|---|
| "I logged in but cannot open admin" | Account isn't `ADMIN`, or admin was never created | Verify roles in `/admin/users`; ensure `ADMIN_PASSWORD` was set and backend restarted |
| "I don't see an Admin button" | The avatar menu shows "Admin Dashboard" only when `user.roles` includes `ADMIN` | Log out and back in after the role exists; confirm you logged in as `admin@sdcart.com` |
| `/admin` redirects to login | You're signed out | Log in first (`RequireAdmin` sends you to `/login`) |
| `/admin` opens the home page | You're signed in but not ADMIN | `RequireAdmin` redirects non-admins to `/`; backend would return 403 to admin APIs |
| Admin gets 403 on APIs | Token without `ROLE_ADMIN`, or a disabled account | Re-login as admin; check user Active state in `/admin/users` |
| Products don't appear | Product status isn't ACTIVE, or empty catalog | Check `/admin/products` statuses; seed data exists in dev |
| Orders don't appear | Orders are per-user | Check you're viewing `/account/orders` as the account that ordered; orders list only your own |
| Payment doesn't work | Order not PENDING, already paid, or COD | Pay is only offered while `PENDING` + payment `PENDING` + method ≠ COD; repeated pay → 409 |
| Data isn't saved | Backend/DB down, validation error, or CORS | Backend logs (`docker compose logs backend`), `/actuator/health`, HTTP 400 body lists field errors |
| Frontend can't reach backend | `VITE_API_BASE_URL` mismatch (build-time), backend down, wrong port | Dev default `http://localhost:8080`; check browser Network tab |
| CORS error | `FRONTEND_URL` doesn't match the frontend origin | Dev: `http://localhost:3000`; prod: `https://sdcart-frontend.onrender.com` (no `*`, no localhost in prod) |

---

## 15. Complete Feature Checklist

**Implemented ✅** — registration, login/logout (server-revoked refresh token),
profile, password change, product browse/search/filters/sort/pagination,
categories, brands, product detail (gallery/specs/related), reviews
(read/create/edit/delete own), cart (add/update/remove/clear), coupon
validate/apply, wishlist (+ move to cart), addresses (CRUD + default), checkout,
payment (mock), orders (list/detail/cancel/pay-pending), admin
(dashboard/products/inventory/categories/brands/orders/payments/coupons/users),
JWT auth + token refresh, rate limiting, request correlation IDs, backups docs,
Docker/Compose/CI/Render blueprint.

**Not implemented (explicitly) ⚠️** — self-service password reset (backend; the
pages direct to support email), email verification flow, contact form backend
(opens mailto), "my reviews" listing endpoint (the `/account/reviews` page lists
purchased products instead), real payment gateway (mock only), product image
upload (URLs only), user-facing search suggestions, wishlist sharing.
