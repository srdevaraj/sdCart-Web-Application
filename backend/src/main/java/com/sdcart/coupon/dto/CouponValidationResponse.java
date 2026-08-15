package com.sdcart.coupon.dto;

import com.sdcart.coupon.CouponType;

import java.math.BigDecimal;

public record CouponValidationResponse(
        boolean valid,
        String code,
        CouponType type,
        BigDecimal discountAmount,
        String message) {
}
