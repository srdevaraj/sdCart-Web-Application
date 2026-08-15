package com.sdcart.admin.dto;

import com.sdcart.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "status is required")
        OrderStatus status) {
}
