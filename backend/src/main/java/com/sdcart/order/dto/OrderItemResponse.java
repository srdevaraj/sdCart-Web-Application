package com.sdcart.order.dto;

import com.sdcart.order.OrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID publicId,
        UUID productId,
        String productName,
        String productImage,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal) {

    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getPublicId(),
                item.getProduct() == null ? null : item.getProduct().getPublicId(),
                item.getProductName(),
                item.getProductImage(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSubtotal());
    }
}
