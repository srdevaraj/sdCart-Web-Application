package com.sdcart.wishlist.dto;

import com.sdcart.wishlist.Wishlist;

import java.util.List;
import java.util.UUID;

public record WishlistResponse(
        UUID publicId,
        List<WishlistItemResponse> items) {

    public static WishlistResponse from(Wishlist wishlist) {
        return new WishlistResponse(
                wishlist.getPublicId(),
                wishlist.getItems().stream().map(WishlistItemResponse::from).toList());
    }
}
