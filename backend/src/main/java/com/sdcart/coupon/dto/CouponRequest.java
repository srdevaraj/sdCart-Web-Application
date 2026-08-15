package com.sdcart.coupon.dto;

import com.sdcart.coupon.CouponType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponRequest(
        @NotBlank(message = "Code is required")
        @Size(max = 50, message = "Code must be at most 50 characters")
        String code,

        @NotNull(message = "Type is required")
        CouponType type,

        @NotNull(message = "Value is required")
        @DecimalMin(value = "0.01", message = "Value must be greater than zero")
        BigDecimal value,

        @DecimalMin(value = "0.0", message = "Minimum order amount must be zero or greater")
        BigDecimal minOrderAmount,

        @DecimalMin(value = "0.0", message = "Maximum discount must be zero or greater")
        BigDecimal maxDiscountAmount,

        @Min(value = 0, message = "Max usages must be zero or greater")
        Integer maxUsages,

        @Min(value = 0, message = "Per-user limit must be zero or greater")
        Integer perUserLimit,

        @NotNull(message = "Valid from is required")
        Instant validFrom,

        @NotNull(message = "Valid until is required")
        Instant validUntil,

        Boolean active,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description) {
}
