package com.sdcart.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank(message = "Label is required")
        @Size(max = 50, message = "Label must be at most 50 characters")
        String label,

        @NotBlank(message = "Recipient name is required")
        @Size(max = 100, message = "Recipient name must be at most 100 characters")
        String recipientName,

        @NotBlank(message = "Phone is required")
        @Size(max = 30, message = "Phone must be at most 30 characters")
        String phone,

        @NotBlank(message = "Address line 1 is required")
        @Size(max = 255, message = "Address line 1 must be at most 255 characters")
        String line1,

        @Size(max = 255, message = "Address line 2 must be at most 255 characters")
        String line2,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must be at most 100 characters")
        String city,

        @Size(max = 100, message = "State must be at most 100 characters")
        String state,

        @Size(max = 20, message = "Postal code must be at most 20 characters")
        String postalCode,

        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country must be at most 100 characters")
        String country,

        Boolean isDefault) {
}
