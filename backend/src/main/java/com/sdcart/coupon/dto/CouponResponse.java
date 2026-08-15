package com.sdcart.coupon.dto;

import com.sdcart.coupon.Coupon;
import com.sdcart.coupon.CouponType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CouponResponse(
        UUID publicId,
        String code,
        CouponType type,
        BigDecimal value,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        int maxUsages,
        int usedCount,
        int perUserLimit,
        Instant validFrom,
        Instant validUntil,
        boolean active,
        String description) {

    public static CouponResponse from(Coupon coupon) {
        return new CouponResponse(
                coupon.getPublicId(),
                coupon.getCode(),
                coupon.getType(),
                coupon.getValue(),
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getMaxUsages(),
                coupon.getUsedCount(),
                coupon.getPerUserLimit(),
                coupon.getValidFrom(),
                coupon.getValidUntil(),
                coupon.isActive(),
                coupon.getDescription());
    }
}
