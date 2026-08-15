package com.sdcart.order;

import com.sdcart.address.Address;
import com.sdcart.address.AddressRepository;
import com.sdcart.cart.Cart;
import com.sdcart.cart.CartItem;
import com.sdcart.cart.CartRepository;
import com.sdcart.common.PageResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.coupon.Coupon;
import com.sdcart.coupon.CouponRepository;
import com.sdcart.coupon.CouponService;
import com.sdcart.coupon.CouponUsage;
import com.sdcart.coupon.CouponUsageRepository;
import com.sdcart.order.dto.CreateOrderRequest;
import com.sdcart.order.dto.OrderResponse;
import com.sdcart.payment.Payment;
import com.sdcart.payment.PaymentMethod;
import com.sdcart.payment.PaymentRepository;
import com.sdcart.payment.PaymentStatus;
import com.sdcart.payment.dto.PaymentSummaryResponse;
import com.sdcart.product.Product;
import com.sdcart.product.ProductImage;
import com.sdcart.product.ProductRepository;
import com.sdcart.product.ProductStatus;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");
    private static final BigDecimal FLAT_SHIPPING_FEE = new BigDecimal("5.00");
    private static final Map<OrderStatus, Set<OrderStatus>> STATUS_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.CANCELLED, Set.of());

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CouponService couponService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EntityManager entityManager;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        AddressRepository addressRepository,
                        PaymentRepository paymentRepository,
                        CouponRepository couponRepository,
                        CouponUsageRepository couponUsageRepository,
                        CouponService couponService,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        EntityManager entityManager) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.paymentRepository = paymentRepository;
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.couponService = couponService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.entityManager = entityManager;
    }

    /**
     * Places an order from the user's cart: validates stock, snapshots items
     * and shipping address, applies the coupon, creates the payment record and
     * clears the cart — all in one transaction.
     */
    @Transactional
    public OrderResponse placeOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Cart cart = cartRepository.findWithItemsByUserId(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Your cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Your cart is empty");
        }
        Address address = addressRepository.findByPublicIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.addressId()));

        // Lock the product rows for the remainder of the transaction so
        // concurrent checkouts serialize on the same stock instead of
        // overselling.
        productRepository.findAllByIdForUpdate(
                cart.getItems().stream().map(i -> i.getProduct().getId()).toList());
        // The locking query does not overwrite entities that are already in
        // the persistence context (they were loaded with the cart), so refresh
        // each product to the locked, current values before validating and
        // decrementing — otherwise stale snapshots clobber each other.
        cart.getItems().forEach(item -> entityManager.refresh(item.getProduct()));

        // Validate stock and availability at current prices
        BigDecimal itemsSubtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BusinessException(HttpStatus.CONFLICT,
                        "'" + product.getName() + "' is no longer available");
            }
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BusinessException(HttpStatus.CONFLICT,
                        "Only " + product.getStockQuantity() + " units of '" + product.getName() + "' are available");
            }
            item.setUnitPrice(product.getPrice());
            itemsSubtotal = itemsSubtotal.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Coupon
        Coupon coupon = null;
        BigDecimal discount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.couponCode())) {
            // Lock the coupon row so the usage counter increment below cannot
            // exceed max_usages under concurrent checkouts.
            coupon = couponRepository.findByCodeIgnoreCaseForUpdate(request.couponCode().trim())
                    .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Invalid coupon code"));
            discount = couponService.computeDiscountForOrder(coupon, itemsSubtotal, userId);
        }

        BigDecimal shippingFee = itemsSubtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO : FLAT_SHIPPING_FEE;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal total = itemsSubtotal.subtract(discount).add(shippingFee).add(taxAmount);

        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .itemsSubtotal(itemsSubtotal)
                .discountAmount(discount)
                .shippingFee(shippingFee)
                .taxAmount(taxAmount)
                .totalAmount(total)
                .coupon(coupon)
                .couponCode(coupon == null ? null : coupon.getCode())
                .shippingRecipientName(address.getRecipientName())
                .shippingPhone(address.getPhone())
                .shippingLine1(address.getLine1())
                .shippingLine2(address.getLine2())
                .shippingCity(address.getCity())
                .shippingState(address.getState())
                .shippingPostalCode(address.getPostalCode())
                .shippingCountry(address.getCountry())
                .build();

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            order.getItems().add(com.sdcart.order.OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImage(primaryImageUrl(product))
                    .unitPrice(product.getPrice())
                    .quantity(item.getQuantity())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .build());
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
        }
        order = orderRepository.save(order);

        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponUsageRepository.save(CouponUsage.builder()
                    .coupon(coupon)
                    .user(user)
                    .order(order)
                    .discountAmount(discount)
                    .build());
        }

        Payment payment = paymentRepository.save(Payment.builder()
                .order(order)
                .transactionId(generateTransactionId())
                .method(request.paymentMethod())
                .status(PaymentStatus.PENDING)
                .amount(total)
                .currency("USD")
                .gateway("MOCK")
                .build());

        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order {} placed by user id={}, total={}, payment={}",
                order.getOrderNumber(), userId, total, payment.getTransactionId());
        return OrderResponse.from(order, PaymentSummaryResponse.from(payment));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(orders, order -> OrderResponse.from(order, paymentOf(order)));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, UUID publicId) {
        Order order = orderRepository.findByPublicIdAndUserId(publicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", publicId));
        return OrderResponse.from(order, paymentOf(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, UUID publicId) {
        Order order = orderRepository.findByPublicIdAndUserId(publicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", publicId));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(HttpStatus.CONFLICT, "Only pending orders can be cancelled");
        }
        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        log.info("Order {} cancelled by user id={}", order.getOrderNumber(), userId);
        return OrderResponse.from(order, paymentOf(order));
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findAllFiltered(status, pageable);
        return PageResponse.from(orders, order -> OrderResponse.from(order, paymentOf(order)));
    }

    @Transactional
    public OrderResponse updateStatus(UUID publicId, OrderStatus newStatus) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", publicId));
        Set<OrderStatus> allowed = STATUS_TRANSITIONS.getOrDefault(order.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "Cannot transition order from " + order.getStatus() + " to " + newStatus);
        }
        if (newStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(newStatus);
        log.info("Order {} status -> {} by admin", order.getOrderNumber(), newStatus);
        return OrderResponse.from(order, paymentOf(order));
    }

    private PaymentSummaryResponse paymentOf(Order order) {
        // Prefer the batch-fetched association when the order was loaded with
        // an entity graph; fall back to a lookup for paths loaded otherwise.
        if (order.getPayment() != null) {
            return PaymentSummaryResponse.from(order.getPayment());
        }
        return paymentRepository.findByOrderId(order.getId())
                .map(PaymentSummaryResponse::from)
                .orElse(null);
    }

    private void restoreStock(Order order) {
        for (com.sdcart.order.OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() + item.getQuantity());
            }
        }
    }

    private String primaryImageUrl(Product product) {
        return product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(product.getImages().stream().map(ProductImage::getImageUrl).findFirst().orElse(null));
    }

    private String generateOrderNumber() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("SD-");
            for (int i = 0; i < 8; i++) {
                sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
            }
            String candidate = sb.toString();
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique order number");
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
    }
}
