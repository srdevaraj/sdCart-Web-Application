package com.sdcart.product.dto;

import com.sdcart.product.ProductSpecification;

public record ProductSpecificationResponse(
        String name,
        String value) {

    public static ProductSpecificationResponse from(ProductSpecification specification) {
        return new ProductSpecificationResponse(specification.getName(), specification.getValue());
    }
}
