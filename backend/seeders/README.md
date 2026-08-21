# sdCart — Database Seeder

## What was seeded

**Flyway migration `V7__seed_electronics_catalog.sql`** inserts:

| Entity | Count |
|---|---|
| Categories | 5 (Smartphones, Laptops, Smartwatches, Audio, Tablets) |
| Brands | 9 (Apple, Samsung, Google, Dell, ASUS, Garmin, Sony, Bose, Microsoft) |
| Products | 75 (5 categories × 3 brands × 5 products) |
| Product images | 75 (one placeholder per product) |
| Product specifications | 225 (3 per product) |

---

## How to seed (normal path)

The seeder is a **Flyway SQL migration**. No separate tool is needed.

**Just start the Spring Boot application:**

```bash
# From the project root
cd backend
./mvnw spring-boot:run
```

Flyway picks up `V7__seed_electronics_catalog.sql` automatically on startup and applies it exactly once. You will see a log line like:

```
Flyway - Migrating schema "public" to version 7 - seed electronics catalog
```

Verify via the API:

```bash
curl http://localhost:8080/api/v1/categories
curl http://localhost:8080/api/v1/brands
curl "http://localhost:8080/api/v1/products?size=80"
```

---

## How to seed manually with psql (alternative / CI)

If you want to run the migration directly without starting the application, use `psql`:

```bash
# Using DATABASE_URL env var (same as the application)
psql "$DATABASE_URL" \
  -f backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql
```

Or using individual variables:

```bash
PGPASSWORD=$DATABASE_PASSWORD psql \
  -h $DB_HOST -p ${DB_PORT:-5432} -U $DATABASE_USERNAME -d $DB_NAME \
  -f backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql
```

> **Note:** If you seed via psql directly, Flyway will not record it in
> `flyway_schema_history`. The next application start will attempt to apply V7
> again, but the `ON CONFLICT (slug) DO NOTHING` guards make this safe — no
> duplicate data will be inserted.

---

## How to reset (opt-in, destructive)

> ⚠️ **This permanently deletes the 75 seeded products, 9 brands, and 5 categories.**
> It does **not** touch users, orders, carts, reviews, or coupons.

```bash
# Step 1: Delete seeded catalog data
psql "$DATABASE_URL" -f backend/seeders/reset-catalog.sql

# Step 2: Re-seed (choose one)

# Option A — via application restart (Flyway re-runs if you also remove V7 from history)
psql "$DATABASE_URL" -c "DELETE FROM flyway_schema_history WHERE version = '7';"
./mvnw spring-boot:run   # Flyway will re-apply V7

# Option B — directly with psql (simpler, no Flyway history update needed)
psql "$DATABASE_URL" \
  -f backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql
```

---

## Image placeholder strategy

All images use `https://placehold.co/` URLs — the same pattern established in
`V2__seed_reference_data.sql`. The `cloudinary_public_id` column is `NULL` for
all seeded rows, which is the documented convention in `ProductImage.java`.

To replace a placeholder with a real image, use the admin image upload API — it
will set both `image_url` (Cloudinary CDN URL) and `cloudinary_public_id`.

---

## Files in this directory

| File | Purpose |
|---|---|
| `reset-catalog.sql` | Opt-in delete of only the V7-seeded catalog rows |
| `README.md` | This file |

The actual migration lives at:
`backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql`
