package com.sdcart.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 120, message = "Slug must be at most 120 characters")
        String slug,

        String description,

        @Size(max = 500, message = "Logo URL must be at most 500 characters")
        String logoUrl,

        Boolean active) {
}
