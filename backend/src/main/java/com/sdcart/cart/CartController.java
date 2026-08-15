package com.sdcart.cart;

import com.sdcart.cart.dto.AddToCartRequest;
import com.sdcart.cart.dto.CartResponse;
import com.sdcart.cart.dto.UpdateCartItemRequest;
import com.sdcart.common.ApiResponse;
import com.sdcart.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(SecurityUtils.currentUserId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{itemPublicId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(@PathVariable UUID itemPublicId,
                                                                @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cart updated",
                cartService.updateItem(SecurityUtils.currentUserId(), itemPublicId, request)));
    }

    @DeleteMapping("/items/{itemPublicId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable UUID itemPublicId) {
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart",
                cartService.removeItem(SecurityUtils.currentUserId(), itemPublicId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart() {
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", cartService.clearCart(SecurityUtils.currentUserId())));
    }
}
