package com.sdcart.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CategoryRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 120, message = "Slug must be at most 120 characters")
        String slug,

        String description,

        UUID parentId,

        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String imageUrl,

        Integer sortOrder,

        Boolean active) {
}
