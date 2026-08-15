package com.sdcart.wishlist;

import com.sdcart.common.ApiResponse;
import com.sdcart.security.SecurityUtils;
import com.sdcart.wishlist.dto.AddWishlistItemRequest;
import com.sdcart.wishlist.dto.WishlistResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist() {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.getWishlist(SecurityUtils.currentUserId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<WishlistResponse>> addItem(@Valid @RequestBody AddWishlistItemRequest request) {
        WishlistResponse wishlist = wishlistService.addItem(SecurityUtils.currentUserId(), request.productId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Added to wishlist", wishlist));
    }

    @DeleteMapping("/items/{productPublicId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeItem(@PathVariable UUID productPublicId) {
        return ResponseEntity.ok(ApiResponse.ok("Removed from wishlist",
                wishlistService.removeItem(SecurityUtils.currentUserId(), productPublicId)));
    }
}
