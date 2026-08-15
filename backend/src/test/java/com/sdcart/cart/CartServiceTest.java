package com.sdcart.cart;

import com.sdcart.cart.dto.AddToCartRequest;
import com.sdcart.cart.dto.CartResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.product.Product;
import com.sdcart.product.ProductRepository;
import com.sdcart.product.ProductStatus;
import com.sdcart.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void addItem_mergesIntoExistingItem() {
        UUID productPublicId = UUID.randomUUID();
        Product product = product(1L, productPublicId, "Widget", "10.00", 10);
        Cart cart = cart(1L);
        CartItem existing = CartItem.builder()
                .cart(cart).product(product).quantity(2).unitPrice(new BigDecimal("9.99"))
                .build();
        ReflectionTestUtils.setField(existing, "id", 1L);
        cart.getItems().add(existing);

        when(productRepository.findByPublicIdAndStatus(eq(productPublicId), eq(ProductStatus.ACTIVE)))
                .thenReturn(Optional.of(product));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.of(existing));

        CartResponse response = cartService.addItem(1L, new AddToCartRequest(productPublicId, 3));

        assertThat(existing.getQuantity()).isEqualTo(5);
        assertThat(existing.getUnitPrice()).isEqualByComparingTo("10.00");
        assertThat(response.totalQuantity()).isEqualTo(5);
        assertThat(response.totalAmount()).isEqualByComparingTo("50.00");
    }

    @Test
    void addItem_rejectsQuantityBeyondStock() {
        UUID productPublicId = UUID.randomUUID();
        Product product = product(1L, productPublicId, "Widget", "10.00", 4);
        Cart cart = cart(1L);

        when(productRepository.findByPublicIdAndStatus(eq(productPublicId), eq(ProductStatus.ACTIVE)))
                .thenReturn(Optional.of(product));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() -> cartService.addItem(1L, new AddToCartRequest(productPublicId, 5)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only 4 units");
    }

    @Test
    void removeItem_deletesAndReturnsUpdatedCart() {
        com.sdcart.user.User owner = com.sdcart.user.User.builder().email("jane@example.com").build();
        ReflectionTestUtils.setField(owner, "id", 1L);
        Product product = product(1L, UUID.randomUUID(), "Widget", "10.00", 10);
        Cart cart = Cart.builder().user(owner).build();
        ReflectionTestUtils.setField(cart, "id", 1L);
        CartItem item = CartItem.builder().cart(cart).product(product).quantity(2).unitPrice(new BigDecimal("10.00")).build();
        ReflectionTestUtils.setField(item, "id", 9L);
        cart.getItems().add(item);

        when(cartItemRepository.findByPublicId(UUID.fromString("00000000-0000-0000-0000-0000000000aa")))
                .thenReturn(Optional.of(item));

        CartResponse response = cartService.removeItem(1L, UUID.fromString("00000000-0000-0000-0000-0000000000aa"));

        assertThat(response.items()).isEmpty();
        assertThat(response.totalQuantity()).isZero();
    }

    private Cart cart(long id) {
        Cart cart = Cart.builder().build();
        ReflectionTestUtils.setField(cart, "id", id);
        return cart;
    }

    private Product product(long id, UUID publicId, String name, String price, int stock) {
        Product product = Product.builder()
                .name(name)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .status(ProductStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(product, "id", id);
        ReflectionTestUtils.setField(product, "publicId", publicId);
        return product;
    }
}
