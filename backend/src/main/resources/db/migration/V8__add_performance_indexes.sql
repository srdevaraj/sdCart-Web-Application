-- ============================================================================
-- sdCart V8: Performance indexes for high-frequency catalog queries & sorting
-- ============================================================================

-- Index for filtering featured products on home & landing pages
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured);

-- Composite index for active featured products
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products (status, is_featured);

-- Indexes for catalog sorting options (Top rated, Most reviewed, Newest)
CREATE INDEX IF NOT EXISTS idx_products_average_rating_desc ON products (average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_review_count_desc ON products (review_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products (created_at DESC);

-- Partial index for products with uploaded banner images (Hero carousel)
CREATE INDEX IF NOT EXISTS idx_products_banner_image ON products (banner_image) WHERE banner_image IS NOT NULL;
