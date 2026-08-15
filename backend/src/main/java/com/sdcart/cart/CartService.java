package com.sdcart.cart;

import com.sdcart.cart.dto.AddToCartRequest;
import com.sdcart.cart.dto.CartResponse;
import com.sdcart.cart.dto.UpdateCartItemRequest;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.product.Product;
import com.sdcart.product.ProductRepository;
import com.sdcart.product.ProductStatus;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartResponse getCart(Long userId) {
        return CartResponse.from(getOrCreateCart(userId));
    }

    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Product product = productRepository.findByPublicIdAndStatus(request.productId(), ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).orElse(null);
        int newQuantity = (item == null ? 0 : item.getQuantity()) + request.quantity();
        if (newQuantity > product.getStockQuantity()) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "Only " + product.getStockQuantity() + " units of '" + product.getName() + "' are available");
        }
        if (item == null) {
            cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .unitPrice(product.getPrice())
                    .build());
        } else {
            item.setQuantity(newQuantity);
            item.setUnitPrice(product.getPrice());
        }
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse updateItem(Long userId, UUID itemPublicId, UpdateCartItemRequest request) {
        CartItem item = getOwnedItem(userId, itemPublicId);
        Product product = item.getProduct();
        if (request.quantity() > product.getStockQuantity()) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "Only " + product.getStockQuantity() + " units of '" + product.getName() + "' are available");
        }
        item.setQuantity(request.quantity());
        item.setUnitPrice(product.getPrice());
        return CartResponse.from(item.getCart());
    }

    @Transactional
    public CartResponse removeItem(Long userId, UUID itemPublicId) {
        CartItem item = getOwnedItem(userId, itemPublicId);
        // Removing from the collection lets orphanRemoval delete the row,
        // keeping the response consistent with the persisted state.
        Cart cart = item.getCart();
        cart.getItems().remove(item);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return CartResponse.from(cart);
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findWithItemsByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Cart cart = cartRepository.save(Cart.builder().user(user).build());
                    log.debug("Created cart id={} for user id={}", cart.getId(), userId);
                    return cart;
                });
    }

    private CartItem getOwnedItem(Long userId, UUID itemPublicId) {
        CartItem item = cartItemRepository.findByPublicId(itemPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", itemPublicId));
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You do not own this cart item");
        }
        return item;
    }
}
