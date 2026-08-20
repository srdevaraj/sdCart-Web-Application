package com.sdcart.product.dto;

import com.sdcart.product.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductUpdateRequest(
        @Size(max = 255, message = "Name must be at most 255 characters")
        String name,

        @Size(max = 255, message = "Slug must be at most 255 characters")
        String slug,

        @Size(max = 100, message = "SKU must be at most 100 characters")
        String sku,

        @Size(max = 500, message = "Short description must be at most 500 characters")
        String shortDescription,

        String description,

        @DecimalMin(value = "0.0", message = "Price must be zero or greater")
        BigDecimal price,

        @DecimalMin(value = "0.0", message = "Compare-at price must be zero or greater")
        BigDecimal compareAtPrice,

        @DecimalMin(value = "0.0", message = "Cost price must be zero or greater")
        BigDecimal costPrice,

        @jakarta.validation.constraints.Min(value = 0, message = "Stock quantity must be zero or greater")
        Integer stockQuantity,

        ProductStatus status,

        Boolean featured,

        @Size(max = 500, message = "Banner image URL must be at most 500 characters")
        String bannerImage,

        UUID categoryId,

        UUID brandId,

        @Valid
        List<ProductImageRequest> images,

        @Valid
        List<ProductSpecificationRequest> specifications) {
}
