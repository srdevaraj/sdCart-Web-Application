package com.sdcart.order;

import com.sdcart.address.Address;
import com.sdcart.address.AddressRepository;
import com.sdcart.cart.Cart;
import com.sdcart.cart.CartItem;
import com.sdcart.cart.CartRepository;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.coupon.CouponRepository;
import com.sdcart.coupon.CouponService;
import com.sdcart.coupon.CouponUsageRepository;
import com.sdcart.order.dto.CreateOrderRequest;
import com.sdcart.order.dto.OrderResponse;
import com.sdcart.payment.Payment;
import com.sdcart.payment.PaymentMethod;
import com.sdcart.payment.PaymentRepository;
import com.sdcart.payment.PaymentStatus;
import com.sdcart.product.Product;
import com.sdcart.product.ProductRepository;
import com.sdcart.product.ProductStatus;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private CouponUsageRepository couponUsageRepository;
    @Mock
    private CouponService couponService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private OrderService orderService;

    @Test
    void placeOrder_createsOrderDecrementsStockAndClearsCart() {
        User user = user(1L);
        Product product = product(1L, "Widget", "10.00", 5);
        Cart cart = cartWithItem(user, product, 2);
        Address address = address(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByPublicIdAndUserId(any(), eq(1L))).thenReturn(Optional.of(address));
        when(productRepository.findAllByIdForUpdate(any())).thenReturn(List.of(product));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.placeOrder(1L,
                new CreateOrderRequest(UUID.randomUUID(), PaymentMethod.CARD, null));

        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
        // subtotal 20.00 + flat shipping 5.00 (below free-shipping threshold)
        assertThat(response.totalAmount()).isEqualByComparingTo("25.00");
        assertThat(response.itemsSubtotal()).isEqualByComparingTo("20.00");
        assertThat(response.shippingFee()).isEqualByComparingTo("5.00");
        assertThat(response.items()).hasSize(1);
        assertThat(response.payment()).isNotNull();
        assertThat(response.payment().status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(response.payment().method()).isEqualTo(PaymentMethod.CARD);
        assertThat(product.getStockQuantity()).isEqualTo(3);
        assertThat(cart.getItems()).isEmpty();
    }

    @Test
    void placeOrder_freeShippingAboveThreshold() {
        User user = user(1L);
        Product product = product(1L, "Expensive Widget", "60.00", 5);
        Cart cart = cartWithItem(user, product, 1);
        Address address = address(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByPublicIdAndUserId(any(), eq(1L))).thenReturn(Optional.of(address));
        when(productRepository.findAllByIdForUpdate(any())).thenReturn(List.of(product));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.placeOrder(1L,
                new CreateOrderRequest(UUID.randomUUID(), PaymentMethod.CARD, null));

        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(response.shippingFee()).isEqualByComparingTo("0.00");
        assertThat(response.totalAmount()).isEqualByComparingTo("60.00");
    }

    @Test
    void placeOrder_cashOnDelivery_immediatelyConfirmed() {
        User user = user(1L);
        Product product = product(1L, "Widget", "10.00", 5);
        Cart cart = cartWithItem(user, product, 1);
        Address address = address(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByPublicIdAndUserId(any(), eq(1L))).thenReturn(Optional.of(address));
        when(productRepository.findAllByIdForUpdate(any())).thenReturn(List.of(product));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.placeOrder(1L,
                new CreateOrderRequest(UUID.randomUUID(), PaymentMethod.CASH_ON_DELIVERY, null));

        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.payment()).isNotNull();
        assertThat(response.payment().method()).isEqualTo(PaymentMethod.CASH_ON_DELIVERY);
        assertThat(response.payment().status()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void placeOrder_rejectsWhenStockInsufficient() {
        User user = user(1L);
        Product product = product(1L, "Widget", "10.00", 1);
        Cart cart = cartWithItem(user, product, 2);
        Address address = address(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));
        when(addressRepository.findByPublicIdAndUserId(any(), eq(1L))).thenReturn(Optional.of(address));
        when(productRepository.findAllByIdForUpdate(any())).thenReturn(List.of(product));

        assertThatThrownBy(() -> orderService.placeOrder(1L,
                new CreateOrderRequest(UUID.randomUUID(), PaymentMethod.CARD, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only 1 units");
    }

    @Test
    void placeOrder_rejectsEmptyCart() {
        User user = user(1L);
        Cart cart = Cart.builder().user(user).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findWithItemsByUserId(1L)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() -> orderService.placeOrder(1L,
                new CreateOrderRequest(UUID.randomUUID(), PaymentMethod.CARD, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cart is empty");
    }

    @Test
    void cancelOrder_restoresStock() {
        User user = user(1L);
        Product product = product(1L, "Widget", "10.00", 5);
        Order order = Order.builder()
                .user(user)
                .orderNumber("SD-TEST1234")
                .status(OrderStatus.PENDING)
                .build();
        ReflectionTestUtils.setField(order, "id", 3L);
        order.getItems().add(OrderItem.builder()
                .order(order).product(product).productName("Widget")
                .unitPrice(new BigDecimal("10.00")).quantity(2).subtotal(new BigDecimal("20.00"))
                .build());
        Payment payment = Payment.builder().order(order).transactionId("TXN-1").build();
        ReflectionTestUtils.setField(product, "stockQuantity", 3);

        when(orderRepository.findByPublicIdAndUserId(any(), eq(1L))).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(3L)).thenReturn(Optional.of(payment));

        OrderResponse response = orderService.cancelOrder(1L, UUID.randomUUID());

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStockQuantity()).isEqualTo(5);
    }

    private User user(long id) {
        User user = User.builder().firstName("Jane").lastName("Doe").email("jane@example.com").build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Product product(long id, String name, String price, int stock) {
        Product product = Product.builder()
                .name(name)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .status(ProductStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(product, "id", id);
        return product;
    }

    private Cart cartWithItem(User user, Product product, int quantity) {
        Cart cart = Cart.builder().user(user).build();
        cart.getItems().add(CartItem.builder()
                .cart(cart).product(product).quantity(quantity).unitPrice(product.getPrice())
                .build());
        return cart;
    }

    private Address address(User user) {
        return Address.builder()
                .user(user)
                .recipientName("Jane Doe")
                .phone("555-0100")
                .line1("1 Main Street")
                .city("Springfield")
                .country("US")
                .build();
    }
}
