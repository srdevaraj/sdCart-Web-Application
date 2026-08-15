package com.sdcart.wishlist.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddWishlistItemRequest(
        @NotNull(message = "Product id is required")
        UUID productId) {
}
