package com.sdcart.order;

public enum OrderStatus {
    PENDING,
    AWAITING_PAYMENT,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    PAYMENT_FAILED,
    REFUND_REQUESTED,
    REFUNDED
}