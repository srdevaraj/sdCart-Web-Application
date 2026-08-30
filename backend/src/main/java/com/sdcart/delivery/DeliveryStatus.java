package com.sdcart.delivery;

/**
 * Granular delivery lifecycle for a single order assignment.
 * Parallel to {@link com.sdcart.order.OrderStatus} which represents
 * the customer-visible order state.
 */
public enum DeliveryStatus {
    UNASSIGNED,
    ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED
}
