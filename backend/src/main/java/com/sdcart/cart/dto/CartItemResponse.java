package com.sdcart.cart.dto;

import com.sdcart.cart.CartItem;
import com.sdcart.product.dto.ProductSummaryResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID publicId,
        ProductSummaryResponse product,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal) {

    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.getPublicId(),
                ProductSummaryResponse.from(item.getProduct()),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}
