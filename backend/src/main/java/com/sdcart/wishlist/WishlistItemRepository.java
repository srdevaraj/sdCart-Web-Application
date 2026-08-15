package com.sdcart.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    Optional<WishlistItem> findByWishlistIdAndProductId(Long wishlistId, Long productId);

    Optional<WishlistItem> findByWishlistIdAndProductPublicId(Long wishlistId, UUID productPublicId);

    boolean existsByWishlistIdAndProductId(Long wishlistId, Long productId);
}
