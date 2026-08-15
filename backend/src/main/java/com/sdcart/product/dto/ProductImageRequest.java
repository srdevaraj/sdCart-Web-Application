package com.sdcart.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank(message = "Image URL is required")
        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String imageUrl,

        @Size(max = 255, message = "Alt text must be at most 255 characters")
        String altText,

        Boolean primary,

        Integer sortOrder) {
}
