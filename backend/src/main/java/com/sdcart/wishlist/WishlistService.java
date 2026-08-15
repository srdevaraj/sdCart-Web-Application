package com.sdcart.wishlist;

import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.product.Product;
import com.sdcart.product.ProductRepository;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import com.sdcart.wishlist.dto.WishlistResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WishlistResponse getWishlist(Long userId) {
        return WishlistResponse.from(getOrCreateWishlist(userId));
    }

    @Transactional
    public WishlistResponse addItem(Long userId, UUID productPublicId) {
        Product product = productRepository.findByPublicId(productPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productPublicId));
        Wishlist wishlist = getOrCreateWishlist(userId);
        if (wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), product.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "Product is already in your wishlist");
        }
        wishlist.getItems().add(WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build());
        return WishlistResponse.from(wishlist);
    }

    @Transactional
    public WishlistResponse removeItem(Long userId, UUID productPublicId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        // Removing from the collection lets orphanRemoval delete the row and
        // keeps the response consistent with the persisted state (deleting via
        // the repository alone leaves the managed collection holding the item,
        // so cascade re-inserts it on flush).
        wishlistItemRepository.findByWishlistIdAndProductPublicId(wishlist.getId(), productPublicId)
                .ifPresent(wishlist.getItems()::remove);
        return WishlistResponse.from(wishlist);
    }

    @Transactional
    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findWithItemsByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Wishlist wishlist = wishlistRepository.save(Wishlist.builder().user(user).build());
                    log.debug("Created wishlist id={} for user id={}", wishlist.getId(), userId);
                    return wishlist;
                });
    }
}
