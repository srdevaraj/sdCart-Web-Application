-- ============================================================================
-- PRODUCTION-ONLY migration (see spring.flyway.locations in application-prod.yml)
--
-- V2 seeded WELCOME10 / SAVE20 as DEMO coupons for local development and the
-- API verification suite. In production no discount should go live without an
-- explicit business decision, so they are deactivated here.
--
-- To run a real promotion later, re-activate them (or create fresh coupons)
-- from the admin dashboard — this migration only flips the seeded ones off.
-- ============================================================================

UPDATE coupons
SET active = FALSE,
    description = description || ' (deactivated: demo coupon, see V3__deactivate_demo_coupons)'
WHERE code IN ('WELCOME10', 'SAVE20')
  AND active = TRUE;
