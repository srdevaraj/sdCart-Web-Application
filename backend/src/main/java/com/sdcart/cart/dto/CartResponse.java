package com.sdcart.cart.dto;

import com.sdcart.cart.Cart;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID publicId,
        List<CartItemResponse> items,
        int totalQuantity,
        BigDecimal totalAmount,
        Instant createdAt,
        Instant updatedAt) {

    public static CartResponse from(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(CartItemResponse::from).toList();
        int totalQuantity = cart.getItems().stream().mapToInt(i -> i.getQuantity()).sum();
        BigDecimal totalAmount = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getPublicId(), items, totalQuantity, totalAmount, cart.getCreatedAt(), cart.getUpdatedAt());
    }
}
