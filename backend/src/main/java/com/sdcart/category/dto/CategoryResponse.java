package com.sdcart.category.dto;

import com.sdcart.category.Category;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID publicId,
        String name,
        String slug,
        String description,
        String imageUrl,
        int sortOrder,
        boolean active,
        CategorySummaryResponse parent,
        List<CategoryResponse> children) {

    public static CategoryResponse from(Category category) {
        return from(category, false);
    }

    public static CategoryResponse from(Category category, boolean includeChildren) {
        List<CategoryResponse> children = includeChildren
                ? category.getChildren().stream().map(c -> from(c, true)).toList()
                : List.of();
        return new CategoryResponse(
                category.getPublicId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getSortOrder(),
                category.isActive(),
                CategorySummaryResponse.from(category.getParent()),
                children);
    }
}
