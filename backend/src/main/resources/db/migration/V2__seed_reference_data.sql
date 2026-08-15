-- ============================================================================
-- sdCart reference data (idempotent — safe to re-run on a fresh database)
-- ============================================================================

INSERT INTO roles (public_id, name, description, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Full administrative access', now(), now()),
    ('00000000-0000-0000-0000-000000000002', 'USER',  'Regular store customer',     now(), now());

INSERT INTO categories (public_id, name, slug, description, parent_id, image_url, sort_order, active, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000101', 'Electronics',  'electronics',  'Phones, laptops, audio and more', NULL, 'https://placehold.co/600x400?text=Electronics', 1, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000102', 'Clothing',     'clothing',     'Apparel for every season',        NULL, 'https://placehold.co/600x400?text=Clothing',    2, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000103', 'Home & Kitchen', 'home-kitchen', 'Everything for your home',       NULL, 'https://placehold.co/600x400?text=Home',        3, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000104', 'Sports',       'sports',       'Gear for active living',           NULL, 'https://placehold.co/600x400?text=Sports',      4, TRUE, now(), now());

INSERT INTO brands (public_id, name, slug, description, logo_url, active, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000201', 'Acme Electronics', 'acme-electronics', 'Premium consumer electronics', 'https://placehold.co/200x80?text=Acme', TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000202', 'Urban Threads',    'urban-threads',    'Modern fashion essentials',     'https://placehold.co/200x80?text=Urban', TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000203', 'Nordic Home',      'nordic-home',      'Scandinavian home goods',       'https://placehold.co/200x80?text=Nordic', TRUE, now(), now());

INSERT INTO products (public_id, name, slug, short_description, description, sku, price, compare_at_price, cost_price, stock_quantity, status, is_featured, average_rating, review_count, category_id, brand_id, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000301', 'Wireless Noise-Cancelling Headphones', 'wireless-noise-cancelling-headphones',
     'Immersive sound with adaptive noise cancellation.',
     'Flagship over-ear headphones with 40-hour battery life, multipoint Bluetooth 5.3 and premium memory foam cushions.',
     'ACME-HP-001', 249.99, 299.99, 150.00, 25, 'ACTIVE', TRUE, 4.60, 12,
     (SELECT id FROM categories WHERE slug = 'electronics'), (SELECT id FROM brands WHERE slug = 'acme-electronics'), now(), now()),
    ('00000000-0000-0000-0000-000000000302', '4K Ultra HD Smart TV 55"', '4k-ultra-hd-smart-tv-55',
     'Cinematic 4K picture with built-in streaming apps.',
     '55-inch QLED panel, 120Hz refresh rate, HDR10+ and Dolby Atmos for a true home cinema experience.',
     'ACME-TV-055', 649.99, 799.99, 480.00, 10, 'ACTIVE', TRUE, 4.80, 23,
     (SELECT id FROM categories WHERE slug = 'electronics'), (SELECT id FROM brands WHERE slug = 'acme-electronics'), now(), now()),
    ('00000000-0000-0000-0000-000000000303', 'Classic Cotton T-Shirt', 'classic-cotton-t-shirt',
     'Soft, breathable everyday essential.',
     '100% organic combed cotton, pre-shrunk, available in a range of sizes and colors.',
     'URBN-TS-001', 24.99, NULL, 9.00, 120, 'ACTIVE', FALSE, 4.20, 45,
     (SELECT id FROM categories WHERE slug = 'clothing'), (SELECT id FROM brands WHERE slug = 'urban-threads'), now(), now()),
    ('00000000-0000-0000-0000-000000000304', 'Stainless Steel Cookware Set', 'stainless-steel-cookware-set',
     'Professional-grade 10-piece cookware set.',
     'Tri-ply bonded stainless steel with stay-cool handles, oven safe up to 500°F and dishwasher safe.',
     'NORD-CW-010', 199.99, 249.99, 120.00, 8, 'ACTIVE', FALSE, 4.70, 31,
     (SELECT id FROM categories WHERE slug = 'home-kitchen'), (SELECT id FROM brands WHERE slug = 'nordic-home'), now(), now()),
    ('00000000-0000-0000-0000-000000000305', 'Running Shoes - Trail Edition', 'running-shoes-trail-edition',
     'Grippy, cushioned trail running shoes.',
     'Water-resistant knit upper, responsive foam midsole and aggressive lugged outsole for off-road confidence.',
     'URBN-SH-101', 129.99, 149.99, 70.00, 40, 'ACTIVE', TRUE, 4.40, 18,
     (SELECT id FROM categories WHERE slug = 'sports'), (SELECT id FROM brands WHERE slug = 'urban-threads'), now(), now());

INSERT INTO product_images (public_id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000401', (SELECT id FROM products WHERE slug = 'wireless-noise-cancelling-headphones'), 'https://placehold.co/800x800?text=Headphones+1', 'Headphones front view', 1, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000402', (SELECT id FROM products WHERE slug = 'wireless-noise-cancelling-headphones'), 'https://placehold.co/800x800?text=Headphones+2', 'Headphones side view', 2, FALSE, now(), now()),
    ('00000000-0000-0000-0000-000000000403', (SELECT id FROM products WHERE slug = '4k-ultra-hd-smart-tv-55'), 'https://placehold.co/800x800?text=Smart+TV', 'TV in living room', 1, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000404', (SELECT id FROM products WHERE slug = 'classic-cotton-t-shirt'), 'https://placehold.co/800x800?text=T-Shirt', 'Cotton t-shirt', 1, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000405', (SELECT id FROM products WHERE slug = 'stainless-steel-cookware-set'), 'https://placehold.co/800x800?text=Cookware', 'Cookware set', 1, TRUE, now(), now()),
    ('00000000-0000-0000-0000-000000000406', (SELECT id FROM products WHERE slug = 'running-shoes-trail-edition'), 'https://placehold.co/800x800?text=Trail+Shoes', 'Trail running shoes', 1, TRUE, now(), now());

INSERT INTO product_specifications (public_id, product_id, name, value, sort_order, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000501', (SELECT id FROM products WHERE slug = 'wireless-noise-cancelling-headphones'), 'Battery life', '40 hours', 1, now(), now()),
    ('00000000-0000-0000-0000-000000000502', (SELECT id FROM products WHERE slug = 'wireless-noise-cancelling-headphones'), 'Bluetooth', '5.3', 2, now(), now()),
    ('00000000-0000-0000-0000-000000000503', (SELECT id FROM products WHERE slug = '4k-ultra-hd-smart-tv-55'), 'Screen size', '55 inches', 1, now(), now()),
    ('00000000-0000-0000-0000-000000000504', (SELECT id FROM products WHERE slug = '4k-ultra-hd-smart-tv-55'), 'Refresh rate', '120Hz', 2, now(), now()),
    ('00000000-0000-0000-0000-000000000505', (SELECT id FROM products WHERE slug = 'classic-cotton-t-shirt'), 'Material', '100% organic cotton', 1, now(), now()),
    ('00000000-0000-0000-0000-000000000506', (SELECT id FROM products WHERE slug = 'stainless-steel-cookware-set'), 'Pieces', '10', 1, now(), now()),
    ('00000000-0000-0000-0000-000000000507', (SELECT id FROM products WHERE slug = 'running-shoes-trail-edition'), 'Drop', '8mm', 1, now(), now());

INSERT INTO coupons (public_id, code, type, value, min_order_amount, max_discount_amount, max_usages, used_count, per_user_limit, valid_from, valid_until, active, description, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000601', 'WELCOME10', 'PERCENTAGE', 10.00, 50.00, 25.00, 1000, 0, 1, now(), now() + INTERVAL '1 year', TRUE, '10% off your first order over $50', now(), now()),
    ('00000000-0000-0000-0000-000000000602', 'SAVE20', 'FIXED', 20.00, 100.00, NULL, 500, 0, 1, now(), now() + INTERVAL '6 months', TRUE, '$20 off orders over $100', now(), now());
