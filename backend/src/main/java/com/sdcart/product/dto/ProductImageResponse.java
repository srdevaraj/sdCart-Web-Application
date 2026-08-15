package com.sdcart.product.dto;

import com.sdcart.product.ProductImage;

import java.util.UUID;

public record ProductImageResponse(
        UUID publicId,
        String imageUrl,
        String altText,
        boolean primary,
        int sortOrder) {

    public static ProductImageResponse from(ProductImage image) {
        return new ProductImageResponse(
                image.getPublicId(),
                image.getImageUrl(),
                image.getAltText(),
                image.isPrimary(),
                image.getSortOrder());
    }
}
