package com.sdcart.delivery.dto;

public record UpdateDeliveryPersonRequest(
        String vehicleType,
        String serviceZone,
        Boolean suspended) {
}
