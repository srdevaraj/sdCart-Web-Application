package com.sdcart.product.dto;

import com.sdcart.brand.dto.BrandSummaryResponse;
import com.sdcart.category.dto.CategorySummaryResponse;
import com.sdcart.product.Product;
import com.sdcart.product.ProductStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID publicId,
        String name,
        String slug,
        String sku,
        String shortDescription,
        String description,
        BigDecimal price,
        BigDecimal compareAtPrice,
        int stockQuantity,
        ProductStatus status,
        boolean featured,
        BigDecimal averageRating,
        int reviewCount,
        CategorySummaryResponse category,
        BrandSummaryResponse brand,
        List<ProductImageResponse> images,
        List<ProductSpecificationResponse> specifications,
        Instant createdAt) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getPublicId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getShortDescription(),
                product.getDescription(),
                product.getPrice(),
                product.getCompareAtPrice(),
                product.getStockQuantity(),
                product.getStatus(),
                product.isFeatured(),
                product.getAverageRating(),
                product.getReviewCount(),
                CategorySummaryResponse.from(product.getCategory()),
                BrandSummaryResponse.from(product.getBrand()),
                product.getImages().stream().map(ProductImageResponse::from).toList(),
                product.getSpecifications().stream().map(ProductSpecificationResponse::from).toList(),
                product.getCreatedAt());
    }
}
