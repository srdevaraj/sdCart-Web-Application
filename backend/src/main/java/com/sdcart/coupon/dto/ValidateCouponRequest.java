package com.sdcart.coupon.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ValidateCouponRequest(
        @NotBlank(message = "Coupon code is required")
        @Size(max = 50, message = "Coupon code must be at most 50 characters")
        String code,

        @NotNull(message = "Order amount is required")
        @DecimalMin(value = "0.0", message = "Order amount must be zero or greater")
        BigDecimal orderAmount) {
}
