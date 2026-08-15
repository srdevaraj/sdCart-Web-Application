package com.sdcart.address.dto;

import com.sdcart.address.Address;

import java.util.UUID;

public record AddressResponse(
        UUID publicId,
        String label,
        String recipientName,
        String phone,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country,
        boolean isDefault) {

    public static AddressResponse from(Address address) {
        return new AddressResponse(
                address.getPublicId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefaultAddress());
    }
}
