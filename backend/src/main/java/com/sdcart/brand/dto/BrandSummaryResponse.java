package com.sdcart.brand.dto;

import com.sdcart.brand.Brand;

import java.util.UUID;

public record BrandSummaryResponse(
        UUID publicId,
        String name,
        String slug) {

    public static BrandSummaryResponse from(Brand brand) {
        return brand == null ? null : new BrandSummaryResponse(brand.getPublicId(), brand.getName(), brand.getSlug());
    }
}
