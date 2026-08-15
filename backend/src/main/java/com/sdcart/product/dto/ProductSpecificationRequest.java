package com.sdcart.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductSpecificationRequest(
        @NotBlank(message = "Specification name is required")
        @Size(max = 100, message = "Specification name must be at most 100 characters")
        String name,

        @NotBlank(message = "Specification value is required")
        @Size(max = 500, message = "Specification value must be at most 500 characters")
        String value,

        Integer sortOrder) {
}
