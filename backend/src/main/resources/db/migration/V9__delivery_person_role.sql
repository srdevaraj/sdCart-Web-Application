-- ============================================================================
-- V9: Delivery Person role + delivery columns on orders
-- ============================================================================

-- 1. Add the DELIVERY_PERSON role
INSERT INTO roles (public_id, name, description, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'DELIVERY_PERSON', 'Delivery personnel', now(), now());

-- 2. Create delivery_persons profile table
CREATE TABLE delivery_persons (
    id              BIGSERIAL PRIMARY KEY,
    public_id       UUID         NOT NULL UNIQUE,
    user_id         BIGINT       NOT NULL UNIQUE REFERENCES users(id),
    vehicle_type    VARCHAR(50),
    service_zone    VARCHAR(100),
    is_available    BOOLEAN      NOT NULL DEFAULT TRUE,
    is_suspended    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_persons_user_id ON delivery_persons(user_id);
CREATE INDEX idx_delivery_persons_suspended ON delivery_persons(is_suspended);

-- 3. Extend the orders table with delivery tracking columns
ALTER TABLE orders
    ADD COLUMN delivery_person_id      BIGINT       REFERENCES users(id),
    ADD COLUMN assigned_at             TIMESTAMPTZ,
    ADD COLUMN delivery_status         VARCHAR(30)  NOT NULL DEFAULT 'UNASSIGNED',
    ADD COLUMN delivered_at            TIMESTAMPTZ,
    ADD COLUMN delivery_otp_hash       VARCHAR(64),
    ADD COLUMN delivery_otp_expires_at TIMESTAMPTZ;

CREATE INDEX idx_orders_delivery_person_id ON orders(delivery_person_id);
CREATE INDEX idx_orders_delivery_status    ON orders(delivery_status);
