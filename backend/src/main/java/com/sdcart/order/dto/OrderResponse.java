package com.sdcart.order.dto;

import com.sdcart.order.Order;
import com.sdcart.order.OrderStatus;
import com.sdcart.payment.dto.PaymentSummaryResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID publicId,
        String orderNumber,
        OrderStatus status,
        List<OrderItemResponse> items,
        BigDecimal itemsSubtotal,
        BigDecimal discountAmount,
        BigDecimal shippingFee,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String couponCode,
        ShippingAddressResponse shippingAddress,
        PaymentSummaryResponse payment,
        Instant createdAt,
        Instant updatedAt) {

    public static OrderResponse from(Order order, PaymentSummaryResponse payment) {
        return new OrderResponse(
                order.getPublicId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getItemsSubtotal(),
                order.getDiscountAmount(),
                order.getShippingFee(),
                order.getTaxAmount(),
                order.getTotalAmount(),
                order.getCouponCode(),
                ShippingAddressResponse.from(order),
                payment,
                order.getCreatedAt(),
                order.getUpdatedAt());
    }
}
