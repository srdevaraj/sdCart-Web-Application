-- ---------------------------------------------------------------------------
-- V5: Cloudinary image management
--
-- Stores the Cloudinary public ID alongside the image URL so the backend can
-- delete or replace the exact remote asset (never stored in the URL alone —
-- the URL is a CDN address, the public ID is the asset key).
-- Existing rows (placehold.co URLs) simply keep a NULL value.
-- ---------------------------------------------------------------------------

ALTER TABLE product_images
    ADD COLUMN cloudinary_public_id VARCHAR(255);
