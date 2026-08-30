package com.sdcart.delivery.dto;

import com.sdcart.delivery.DeliveryPerson;

import java.time.Instant;
import java.util.UUID;

public record DeliveryPersonResponse(
        UUID publicId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String vehicleType,
        String serviceZone,
        boolean available,
        boolean suspended,
        long activeOrderCount,
        Instant createdAt) {

    public static DeliveryPersonResponse from(DeliveryPerson dp, long activeOrderCount) {
        var user = dp.getUser();
        return new DeliveryPersonResponse(
                dp.getPublicId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                dp.getVehicleType(),
                dp.getServiceZone(),
                dp.isAvailable(),
                dp.isSuspended(),
                activeOrderCount,
                dp.getCreatedAt());
    }
}
