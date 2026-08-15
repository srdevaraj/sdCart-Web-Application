# sdCart Frontend

React + TypeScript storefront for the sdCart e-commerce backend. Built with Vite,
React Router, TanStack Query, Zustand, Axios, Tailwind CSS, shadcn-style Radix
components, Lucide icons, React Hook Form + Zod, and Vitest + React Testing Library.

## Requirements

- Node 20+ (developed against Node 24)
- The sdCart backend running at `http://localhost:8080` (see `backend/README.md`)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Configuration lives in `.env` (copy from `.env.example`):

| Variable            | Default                 | Purpose                       |
|---------------------|-------------------------|-------------------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend base URL (no suffix)  |
| `VITE_APP_URL`      | `http://localhost:3000` | Public origin (canonical URLs)|

The API client appends `/api/v1` automatically and:

- attaches the JWT access token to every request,
- single-flights a `/auth/refresh` and retries on a single 401 per request,
- clears the session and redirects to `/login` when refresh fails.

## Scripts

```bash
npm run dev          # dev server (port 3000, strict)
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint
npm run lint:fix
npm run format       # prettier --write
npm test             # vitest run
npm run build        # typecheck + production build (route-split chunks)
```

## Project structure

```
src/
  app/          # Providers (QueryClient, Toaster) and the route table (lazy)
  components/
    ui/         # Radix + Tailwind primitives (button, dialog, select, table…)
    layout/     # header/footer, customer & admin shells, route guards
    product/    # product card, grid, review form/item
    common/     # error/empty/loading states, confirm dialog, form field…
  features/     # per-domain: auth, products, cart, wishlist, addresses,
                # orders, reviews, coupons, admin (hooks + stores)
  hooks/        # shared hooks (useDebounce)
  lib/          # axios client with interceptors, cn utility
  pages/        # route components (public, account, admin)
  services/     # typed API clients per domain (single source per endpoint)
  types/        # DTO types mirroring the backend (source of truth: the API)
  utils/        # pure helpers (formatting, product summary mapping)
  test/         # vitest setup + render helpers
  __tests__/    # component/integration tests
```

## Notes

- The backend is authoritative for totals, stock and authorization. The cart UI
  refetches after mutations and never trusts client-side math.
- Category and brand filters on `/products` use slugs (`?category=electronics`).
- Admin routes require the `ADMIN` role; the backend enforces it with 403s.
- Public pages that have no backend endpoint yet (password reset, contact form)
  fail gracefully and direct users to support instead of inventing APIs.
