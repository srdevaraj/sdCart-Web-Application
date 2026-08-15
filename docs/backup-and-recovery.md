# sdCart — PostgreSQL Backup & Recovery

This guide covers production data protection for the sdCart PostgreSQL
database (Render managed Postgres or any PostgreSQL 16 instance). It is
intentionally conservative: **never** run destructive commands against
production data. All destructive examples below are explicitly marked
**LOCAL ONLY**.

---

## 1. Backup strategy

| Layer                | Recommendation                                                                        |
|----------------------|----------------------------------------------------------------------------------------|
| Automated backups    | Enable Render's built-in automated daily backups for the managed Postgres instance (Dashboard → your database → Backups). Render retains a rolling window of backups. |
| Point-in-time        | Render's Pro/Starter plans add point-in-time recovery (PITR) — enable it if the data loss window matters. |
| Off-site copy        | Export a logical dump with `pg_dump` on a schedule (e.g. a cron job or GitHub Actions scheduled workflow) and store it in a different region/account (S3, GCS, etc.). Protects against instance-level loss. |
| Application data     | All business state lives in PostgreSQL (users, orders, payments, coupons, reviews, cart/wishlist/addresses). Product images are remote URLs (Cloudinary/placehold.co), so no blob storage backup is needed. |
| Secrets              | Credentials (JWT secret, DB password, Stripe keys) live in Render environment variables — back up your `render.yaml` blueprint and document which `sync: false` values were set in the Dashboard. |

### What a logical dump contains

```bash
# Full logical dump (schema + data) of the sdcart database
pg_dump "postgresql://USER:PASSWORD@HOST:PORT/sdcart" -F c -f sdcart-$(date +%F).dump
```

Compressed custom format (`-F c`) is preferred: it is smaller, restorable
selectively, and supports parallel restore (`pg_restore -j`).

> ⚠️ Flyway owns the schema (`ddl-auto=validate`). A dump taken with
> `pg_dump` is consistent by default (single snapshot), so it is safe to
> restore as a whole. Never mix a partial restore of Flyway-managed tables.

---

## 2. Restore procedure

Restore the latest known-good dump into a **new** database, verify, then
switch the application to it.

```bash
# 1. Create a fresh database (never restore over the live one in place)
createdb "postgresql://USER:PASSWORD@HOST:PORT/sdcart_restore"

# 2. Restore the dump into it
pg_restore -d "postgresql://USER:PASSWORD@HOST:PORT/sdcart_restore" \
  --no-owner --no-privileges sdcart-$(date +%F).dump

# 3. Smoke-check the restored data
psql "postgresql://USER:PASSWORD@HOST:PORT/sdcart_restore" \
  -c "SELECT count(*) FROM orders; SELECT count(*) FROM users;"
```

### Cut-over

1. Put the backend into maintenance (scale to 0, or stop the web service) so
   no writes happen during the switch.
2. Point `DATABASE_URL` / `DB_HOST`+`DB_PORT`+`DB_NAME` (Render) at the
   restored database via the backend service environment, then redeploy or
   restart.
3. Verify health: `GET /actuator/health` → `UP`, then spot-check orders,
   products and a login.
4. Keep the previous database untouched for a few days as a rollback target.

### Restore from Render's automated backups

Use the Render Dashboard (Database → Backups → Restore) which provisions a
fresh instance from the chosen backup snapshot; then follow the cut-over
steps above.

---

## 3. Migration recovery

Flyway records applied migrations in the `flyway_schema_history` table and
validates them on startup (`validate-on-migrate: true` in prod). Recovery
guidance:

- **Failed migration on startup** — the app refuses to start (fail fast is
  intentional). Investigate the migration; fix it in a **new** versioned
  migration (`V3__…`) rather than editing an applied one. Flyway will not
  re-run applied migrations and checksum changes to applied ones are
  rejected on purpose.
- **Rolling back a bad release** — the schema is forward-only by design
  (same as the code). To roll back data-level damage, restore from the
  backup taken **before** the release; do not attempt to rewind individual
  migrations.
- **Verifying schema integrity** — with Flyway in place, the authoritative
  check is the backend's own startup validation plus:

  ```bash
  psql "postgresql://USER:PASSWORD@HOST:PORT/sdcart" \
    -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
  ```

- **Local-only destructive reset** — see section 4. `flyway clean` is
  **disabled in production** (`spring.flyway.clean-disabled: true`).

---

## 3b. Emergency rollback (production)

Used when a release causes data corruption, a breaking bug, or a bad migration
outcome. The schema is forward-only, so **roll back data, not migrations**:

1. **Stop writes** — scale the backend service to 0 instances (or pause it in
   the Render Dashboard) so no new orders/payments land while recovering.
2. **Pick the restore target** — the newest known-good backup taken before the
   bad release (section 2) or a Render snapshot restore.
3. **Restore into a fresh database** and smoke-check it (orders/users counts,
   `flyway_schema_history` shows only successfully applied migrations).
4. **Point the backend at the restored database** (Dashboard → backend →
   Environment → `DB_HOST`/`DB_PORT`/`DB_NAME`/`DATABASE_USERNAME`/
   `DATABASE_PASSWORD`, or `DATABASE_URL`) and redeploy.
5. **Verify** `/actuator/health` = UP, then spot-check login, catalog and one
   order.
6. Keep the broken database around for a few days (it may contain the only
   copy of post-release writes worth salvaging), then delete it.

Never attempt to rewind or edit applied Flyway migrations (`clean` is disabled
in prod; checksum changes fail startup on purpose). If the bad change lives in
code, roll the code back by redeploying the previous image/tag first, then
handle data separately.

## 4. Database reset — LOCAL DEVELOPMENT ONLY

These commands destroy data. They are safe to run against the local Docker
Postgres container only; **never** run them against the Render/managed
database.

```bash
# Option A — wipe the local Docker volume (recommended, resets schema + data)
docker compose down -v
docker compose up -d db          # Flyway recreates schema + seed data on backend start

# Option B — reset schema and re-run migrations + seed
docker compose exec db psql -U postgres -d sdcart -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose restart backend   # Flyway re-migrates on startup
```

After either option the local backend re-creates the schema from
`V1__init_schema.sql`, seeds reference data (`V2__seed_reference_data.sql`)
and bootstraps the dev admin (`admin@sdcart.com` / `password`, dev profile
only).

---

## Checklist before relying on backups

- [ ] Automated backups enabled (Render Dashboard) and a recent backup exists.
- [ ] Off-site `pg_dump` schedule is running and files are being written.
- [ ] Restore was **actually exercised** end-to-end at least once (restore →
      point the backend at it → health check).
- [ ] `JWT_SECRET` and other `sync: false` Render values are recorded
      somewhere safe (a password manager), since a full re-provision needs
      them.
