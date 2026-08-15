package com.sdcart.order.dto;

import com.sdcart.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateOrderRequest(
        @NotNull(message = "Shipping address is required")
        UUID addressId,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @Size(max = 50, message = "Coupon code must be at most 50 characters")
        String couponCode) {
}
