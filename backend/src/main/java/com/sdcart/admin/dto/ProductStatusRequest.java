package com.sdcart.admin.dto;

import com.sdcart.product.ProductStatus;
import jakarta.validation.constraints.NotNull;

public record ProductStatusRequest(
        @NotNull(message = "status is required")
        ProductStatus status) {
}
