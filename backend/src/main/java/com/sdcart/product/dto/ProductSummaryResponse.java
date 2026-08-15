package com.sdcart.product.dto;

import com.sdcart.product.Product;
import com.sdcart.product.ProductImage;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
        UUID publicId,
        String name,
        String slug,
        BigDecimal price,
        String imageUrl,
        int stockQuantity) {

    public static ProductSummaryResponse from(Product product) {
        String imageUrl = product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(product.getImages().stream().map(ProductImage::getImageUrl).findFirst().orElse(null));
        return new ProductSummaryResponse(
                product.getPublicId(),
                product.getName(),
                product.getSlug(),
                product.getPrice(),
                imageUrl,
                product.getStockQuantity());
    }
}
