-- ---------------------------------------------------------------------------
-- V6: Product banner image (homepage hero)
--
-- Optional Cloudinary or CDN URL used specifically for homepage hero banners.
-- Kept separate from standard product thumbnail/gallery images.
-- ---------------------------------------------------------------------------

ALTER TABLE products
    ADD COLUMN banner_image VARCHAR(500);
