package com.sdcart.brand.dto;

import com.sdcart.brand.Brand;

import java.util.UUID;

public record BrandResponse(
        UUID publicId,
        String name,
        String slug,
        String description,
        String logoUrl,
        boolean active) {

    public static BrandResponse from(Brand brand) {
        return new BrandResponse(
                brand.getPublicId(),
                brand.getName(),
                brand.getSlug(),
                brand.getDescription(),
                brand.getLogoUrl(),
                brand.isActive());
    }
}
