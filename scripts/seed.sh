#!/usr/bin/env bash
# =============================================================================
# seed.sh — convenience wrapper to apply the electronics catalog seed
#
# Equivalent of "npm run seed" for this Spring Boot / PostgreSQL project.
# Uses the same DATABASE_URL / DB_HOST / DB_PORT / DB_NAME / DATABASE_USERNAME /
# DATABASE_PASSWORD environment variables that the Spring Boot application reads.
#
# USAGE
#   Apply seed (idempotent — safe to run multiple times):
#     bash scripts/seed.sh
#
#   Reset catalog then re-seed (destructive — only touches catalog tables):
#     bash scripts/seed.sh --reset-catalog
#
# REQUIREMENTS
#   psql must be on PATH (PostgreSQL client tools).
#   The target database must already exist and V1–V6 migrations must have run
#   (i.e. the application has been started at least once so Flyway created
#   the schema).
# =============================================================================

set -euo pipefail

SEED_FILE="backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql"
RESET_FILE="backend/seeders/reset-catalog.sql"

# ---------------------------------------------------------------------------
# Resolve connection string
# Priority: DATABASE_URL > composed from DB_HOST / DB_PORT / DB_NAME
# ---------------------------------------------------------------------------
if [[ -n "${DATABASE_URL:-}" ]]; then
    PSQL_URL="$DATABASE_URL"
else
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-sdcart}"
    DB_USER="${DATABASE_USERNAME:-postgres}"
    DB_PASS="${DATABASE_PASSWORD:-password}"

    # Build a psql connection string from components
    PSQL_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
run_psql() {
    local file="$1"
    if ! command -v psql &>/dev/null; then
        echo "ERROR: psql not found on PATH. Install the PostgreSQL client tools first." >&2
        exit 1
    fi
    echo "  → Running: $file"
    psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f "$file"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
RESET=false
for arg in "$@"; do
    [[ "$arg" == "--reset-catalog" ]] && RESET=true
done

echo "============================================================"
echo "  sdCart catalog seed"
echo "  DB : ${PSQL_URL%%:*}://***@$(echo "$PSQL_URL" | sed 's|.*@||')"
echo "============================================================"

if [[ "$RESET" == true ]]; then
    echo ""
    echo "⚠️  --reset-catalog detected."
    echo "   This will DELETE all V7-seeded products, brands, and categories."
    echo "   Users, orders, carts, and reviews are NOT affected."
    echo ""
    read -r -p "   Type 'yes' to continue: " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "Aborted."
        exit 0
    fi
    echo ""
    echo "[1/2] Resetting catalog..."
    run_psql "$RESET_FILE"
    echo "      Reset complete."
    echo ""
    echo "[2/2] Re-seeding catalog..."
    run_psql "$SEED_FILE"
else
    echo ""
    echo "[1/1] Applying catalog seed (idempotent)..."
    run_psql "$SEED_FILE"
fi

echo ""
echo "✅  Done. Verify with:"
echo "    curl http://localhost:8080/api/v1/categories"
echo "    curl http://localhost:8080/api/v1/brands"
echo "    curl 'http://localhost:8080/api/v1/products?size=80'"
echo "============================================================"
