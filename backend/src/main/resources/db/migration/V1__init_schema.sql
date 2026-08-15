-- ============================================================================
-- sdCart initial schema (PostgreSQL)
-- Schema is owned exclusively by Flyway. Hibernate runs with ddl-auto=validate
-- and only verifies that its mappings match the tables below.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Identity & access
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       UUID        NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    description TEXT,
    parent_id   BIGINT REFERENCES categories (id) ON DELETE SET NULL,
    image_url   VARCHAR(500),
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_categories_slug UNIQUE (slug)
);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);

CREATE TABLE brands (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    description TEXT,
    logo_url    VARCHAR(500),
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_brands_slug UNIQUE (slug)
);

CREATE TABLE products (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id         UUID          NOT NULL,
    name              VARCHAR(255)  NOT NULL,
    slug              VARCHAR(255)  NOT NULL,
    short_description VARCHAR(500),
    description       TEXT,
    sku               VARCHAR(100),
    price             NUMERIC(12, 2) NOT NULL,
    compare_at_price  NUMERIC(12, 2),
    cost_price        NUMERIC(12, 2),
    stock_quantity    INTEGER       NOT NULL DEFAULT 0,
    status            VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    is_featured       BOOLEAN       NOT NULL DEFAULT FALSE,
    average_rating    NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count      INTEGER       NOT NULL DEFAULT 0,
    category_id       BIGINT REFERENCES categories (id) ON DELETE SET NULL,
    brand_id          BIGINT REFERENCES brands (id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uk_products_slug UNIQUE (slug),
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_stock CHECK (stock_quantity >= 0),
    CONSTRAINT chk_products_rating CHECK (average_rating >= 0 AND average_rating <= 5)
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_brand_id ON products (brand_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_price ON products (price);

CREATE TABLE product_images (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    product_id  BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(255),
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);

CREATE TABLE product_specifications (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    product_id  BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    value       VARCHAR(500) NOT NULL,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_product_specifications_product_name UNIQUE (product_id, name)
);

CREATE INDEX idx_product_specifications_product_id ON product_specifications (product_id);

-- ---------------------------------------------------------------------------
-- Cart & wishlist
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    user_id     BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_carts_user_id UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID          NOT NULL,
    cart_id     BIGINT        NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_id  BIGINT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity    INTEGER       NOT NULL,
    unit_price  NUMERIC(12, 2) NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uk_cart_items_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);

CREATE TABLE wishlists (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    user_id     BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_wishlists_user_id UNIQUE (user_id)
);

CREATE TABLE wishlist_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    wishlist_id BIGINT      NOT NULL REFERENCES wishlists (id) ON DELETE CASCADE,
    product_id  BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_wishlist_items_wishlist_product UNIQUE (wishlist_id, product_id)
);

CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items (wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items (product_id);

-- ---------------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------------
CREATE TABLE addresses (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id      UUID         NOT NULL,
    user_id        BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    label          VARCHAR(50)  NOT NULL DEFAULT 'Home',
    recipient_name VARCHAR(100) NOT NULL,
    phone          VARCHAR(30)  NOT NULL,
    line1          VARCHAR(255) NOT NULL,
    line2          VARCHAR(255),
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100),
    postal_code    VARCHAR(20),
    country        VARCHAR(100) NOT NULL,
    is_default     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);

-- ---------------------------------------------------------------------------
-- Coupons (created before orders, which reference them)
-- ---------------------------------------------------------------------------
CREATE TABLE coupons (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id           UUID          NOT NULL,
    code                VARCHAR(50)   NOT NULL,
    type                VARCHAR(20)   NOT NULL,
    value               NUMERIC(12, 2) NOT NULL,
    min_order_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(12, 2),
    max_usages          INTEGER       NOT NULL DEFAULT 0,
    used_count          INTEGER       NOT NULL DEFAULT 0,
    per_user_limit      INTEGER       NOT NULL DEFAULT 0,
    valid_from          TIMESTAMPTZ   NOT NULL,
    valid_until         TIMESTAMPTZ   NOT NULL,
    active              BOOLEAN       NOT NULL DEFAULT TRUE,
    description         VARCHAR(255),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uk_coupons_code UNIQUE (code),
    CONSTRAINT chk_coupons_value CHECK (value > 0)
);

-- ---------------------------------------------------------------------------
-- Orders & payments
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id              UUID          NOT NULL,
    order_number           VARCHAR(20)   NOT NULL,
    user_id                BIGINT        NOT NULL REFERENCES users (id),
    status                 VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    items_subtotal         NUMERIC(12, 2) NOT NULL,
    discount_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_fee           NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount           NUMERIC(12, 2) NOT NULL,
    coupon_id              BIGINT REFERENCES coupons (id) ON DELETE SET NULL,
    coupon_code            VARCHAR(50),
    shipping_recipient_name VARCHAR(100) NOT NULL,
    shipping_phone         VARCHAR(30)  NOT NULL,
    shipping_line1         VARCHAR(255) NOT NULL,
    shipping_line2         VARCHAR(255),
    shipping_city          VARCHAR(100) NOT NULL,
    shipping_state         VARCHAR(100),
    shipping_postal_code   VARCHAR(20),
    shipping_country       VARCHAR(100) NOT NULL,
    notes                  VARCHAR(500),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_orders_order_number UNIQUE (order_number),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);

CREATE TABLE order_items (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id     UUID          NOT NULL,
    order_id      BIGINT        NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id    BIGINT        REFERENCES products (id) ON DELETE SET NULL,
    product_name  VARCHAR(255)  NOT NULL,
    product_image VARCHAR(500),
    unit_price    NUMERIC(12, 2) NOT NULL,
    quantity      INTEGER       NOT NULL,
    subtotal      NUMERIC(12, 2) NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

CREATE TABLE payments (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id         UUID          NOT NULL,
    order_id          BIGINT        NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    transaction_id    VARCHAR(64)   NOT NULL,
    method            VARCHAR(30)   NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    amount            NUMERIC(12, 2) NOT NULL,
    currency          VARCHAR(3)    NOT NULL DEFAULT 'USD',
    gateway           VARCHAR(50)   NOT NULL DEFAULT 'MOCK',
    gateway_reference VARCHAR(255),
    paid_at           TIMESTAMPTZ,
    failure_reason    VARCHAR(255),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uk_payments_order_id UNIQUE (order_id),
    CONSTRAINT uk_payments_transaction_id UNIQUE (transaction_id)
);

CREATE INDEX idx_payments_status ON payments (status);

-- ---------------------------------------------------------------------------
-- Coupon usage (after orders, which it references)
-- ---------------------------------------------------------------------------
CREATE TABLE coupon_usage (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id       UUID          NOT NULL,
    coupon_id       BIGINT        NOT NULL REFERENCES coupons (id) ON DELETE CASCADE,
    user_id         BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    order_id        BIGINT        NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    discount_amount NUMERIC(12, 2) NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uk_coupon_usage_coupon_order UNIQUE (coupon_id, order_id)
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage (coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage (user_id);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id   UUID        NOT NULL,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id  BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    rating      INTEGER     NOT NULL,
    title       VARCHAR(150),
    comment     TEXT,
    is_approved BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_reviews_user_product UNIQUE (user_id, product_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_product_id ON reviews (product_id);
