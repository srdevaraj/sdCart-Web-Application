package com.sdcart.category.dto;

import com.sdcart.category.Category;

import java.util.UUID;

public record CategorySummaryResponse(
        UUID publicId,
        String name,
        String slug) {

    public static CategorySummaryResponse from(Category category) {
        return category == null ? null : new CategorySummaryResponse(category.getPublicId(), category.getName(), category.getSlug());
    }
}
