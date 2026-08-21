-- ============================================================================
-- reset-catalog.sql — Manual catalog reset script
--
-- USAGE (run explicitly with psql — never run automatically):
--   psql $DATABASE_URL -f backend/seeders/reset-catalog.sql
--
-- WHAT THIS DOES:
--   Deletes only catalog rows seeded by V7__seed_electronics_catalog.sql:
--     • product_specifications (cascade from products)
--     • product_images         (cascade from products)
--     • products               (by category slug match)
--     • brands                 (by slug)
--     • categories             (by slug)
--
-- WHAT THIS DOES NOT TOUCH:
--   users, orders, order_items, cart, cart_items, reviews, coupons,
--   coupon_usage, payments, addresses, wishlists, refresh_tokens, roles
--
-- SAFE TO RUN ONLY WHEN:
--   You want to fully remove and re-seed the V7 catalog.
--   After this script, restart the Spring Boot application so Flyway
--   re-runs V7 (you must also delete the V7 row from flyway_schema_history
--   if you want Flyway to re-apply the migration, OR run the SQL manually
--   with psql again).
-- ============================================================================

BEGIN;

-- 1. Products first (product_images and product_specifications CASCADE DELETE)
DELETE FROM products
WHERE slug IN (
    -- Smartphones – Apple
    'iphone-18-pro', 'iphone-18', 'iphone-18-air', 'iphone-17e', 'iphone-16-2026-refresh',
    -- Smartphones – Samsung
    'galaxy-s27-ultra', 'galaxy-s27', 'galaxy-z-fold-7', 'galaxy-z-flip-7', 'galaxy-a57-5g',
    -- Smartphones – Google
    'pixel-10-pro-xl', 'pixel-10-pro', 'pixel-10', 'pixel-10a', 'pixel-fold-3',
    -- Laptops – Apple
    'macbook-pro-16-m6-max', 'macbook-pro-14-m6-pro', 'macbook-air-15-m5',
    'macbook-air-13-m5', 'macbook-pro-14-m6-base',
    -- Laptops – Dell
    'xps-16-2026', 'xps-14-2026', 'dell-alienware-16-aurora', 'dell-inspiron-15-plus', 'dell-latitude-7450',
    -- Laptops – ASUS
    'rog-zephyrus-g16-2026', 'zenbook-duo-2026', 'rog-ally-2', 'vivobook-s16', 'tuf-gaming-a16',
    -- Smartwatches – Apple
    'apple-watch-ultra-3', 'apple-watch-series-11', 'apple-watch-se-3',
    'apple-watch-ultra-3-titanium-trail-loop', 'apple-watch-series-11-nike',
    -- Smartwatches – Samsung
    'galaxy-watch-8-ultra', 'galaxy-watch-8', 'galaxy-watch-8-classic',
    'galaxy-watch-fe-2', 'galaxy-watch-8-lte',
    -- Smartwatches – Garmin
    'garmin-fenix-9', 'garmin-epix-pro-3', 'garmin-venu-4', 'garmin-forerunner-970', 'garmin-instinct-3',
    -- Audio – Sony
    'wh-1100xm7', 'wf-1000xm6', 'linkbuds-fit', 'wh-ch720n', 'inzone-h9-ii',
    -- Audio – Bose
    'quietcomfort-ultra-headphones-2026', 'quietcomfort-ultra-earbuds-2026',
    'soundlink-max', 'bose-ultra-open-earbuds-2', 'bose-soundsport-free-2',
    -- Audio – Apple
    'airpods-pro-3', 'airpods-5', 'airpods-max-2', 'airpods-pro-3-hearing-health', 'airpods-5-2026-colors',
    -- Tablets – Apple
    'ipad-pro-13-m5', 'ipad-pro-11-m5', 'ipad-air-13-m4', 'ipad-air-11-m4', 'ipad-11th-gen-2026',
    -- Tablets – Samsung
    'galaxy-tab-s11-ultra', 'galaxy-tab-s11-plus', 'galaxy-tab-s11', 'galaxy-tab-s11-fe', 'galaxy-tab-a11',
    -- Tablets – Microsoft
    'surface-pro-12', 'surface-pro-12-5g', 'surface-laptop-studio-3', 'surface-go-5', 'surface-pro-12-business'
);

-- 2. Brands seeded by V7 (only the 9 specific brands — others left untouched)
DELETE FROM brands
WHERE slug IN (
    'apple', 'samsung', 'google', 'dell', 'asus', 'garmin', 'sony', 'bose', 'microsoft'
);

-- 3. Categories seeded by V7
DELETE FROM categories
WHERE slug IN (
    'smartphones', 'laptops', 'smartwatches', 'audio', 'tablets'
);

COMMIT;

-- ============================================================================
-- To re-seed after this reset, run V7 directly (psql approach):
--   psql $DATABASE_URL \
--     -f backend/src/main/resources/db/migration/V7__seed_electronics_catalog.sql
-- ============================================================================
