package com.sdcart.wishlist.dto;

import com.sdcart.product.dto.ProductSummaryResponse;
import com.sdcart.wishlist.WishlistItem;

import java.time.Instant;
import java.util.UUID;

public record WishlistItemResponse(
        UUID publicId,
        ProductSummaryResponse product,
        Instant addedAt) {

    public static WishlistItemResponse from(WishlistItem item) {
        return new WishlistItemResponse(
                item.getPublicId(),
                ProductSummaryResponse.from(item.getProduct()),
                item.getCreatedAt());
    }
}
