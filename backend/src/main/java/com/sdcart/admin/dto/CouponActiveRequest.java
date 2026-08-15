package com.sdcart.admin.dto;

import jakarta.validation.constraints.NotNull;

public record CouponActiveRequest(
        @NotNull(message = "active is required")
        Boolean active) {
}
