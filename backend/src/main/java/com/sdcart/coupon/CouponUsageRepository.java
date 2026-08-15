package com.sdcart.coupon;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    boolean existsByCouponIdAndOrderId(Long couponId, Long orderId);

    boolean existsByOrderId(Long orderId);
}
