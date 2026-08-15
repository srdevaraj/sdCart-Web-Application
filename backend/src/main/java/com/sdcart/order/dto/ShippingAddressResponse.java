package com.sdcart.order.dto;

import com.sdcart.order.Order;

public record ShippingAddressResponse(
        String recipientName,
        String phone,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country) {

    public static ShippingAddressResponse from(Order order) {
        return new ShippingAddressResponse(
                order.getShippingRecipientName(),
                order.getShippingPhone(),
                order.getShippingLine1(),
                order.getShippingLine2(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingCountry());
    }
}
