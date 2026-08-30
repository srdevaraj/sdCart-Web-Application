package com.sdcart.delivery;

import com.sdcart.common.exception.BusinessException;
import com.sdcart.delivery.dto.AssignDeliveryRequest;
import com.sdcart.delivery.dto.ConfirmDeliveryRequest;
import com.sdcart.delivery.dto.CreateDeliveryPersonRequest;
import com.sdcart.delivery.dto.DeliveryPersonResponse;
import com.sdcart.delivery.dto.DeliveryStatusUpdateRequest;
import com.sdcart.delivery.dto.UpdateDeliveryPersonRequest;
import com.sdcart.order.Order;
import com.sdcart.order.OrderRepository;
import com.sdcart.order.OrderStatus;
import com.sdcart.order.dto.OrderResponse;
import com.sdcart.payment.dto.PaymentSummaryResponse;
import com.sdcart.user.Role;
import com.sdcart.user.RoleName;
import com.sdcart.user.RoleRepository;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class DeliveryPersonService {

    private static final List<DeliveryStatus> ACTIVE_STATUSES =
            List.of(DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY);

    private final DeliveryPersonRepository deliveryPersonRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final DeliveryEventService eventService;
    private final SecureRandom secureRandom = new SecureRandom();

    public DeliveryPersonService(DeliveryPersonRepository deliveryPersonRepository,
                                  OrderRepository orderRepository,
                                  UserRepository userRepository,
                                  RoleRepository roleRepository,
                                  PasswordEncoder passwordEncoder,
                                  DeliveryEventService eventService) {
        this.deliveryPersonRepository = deliveryPersonRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventService = eventService;
    }

    // =========================================================================
    // Admin operations
    // =========================================================================

    @Transactional
    public DeliveryPersonResponse createDeliveryPerson(CreateDeliveryPersonRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Role dpRole = roleRepository.findByName(RoleName.DELIVERY_PERSON)
                .orElseThrow(() -> new IllegalStateException("DELIVERY_PERSON role missing — run V9 migration"));

        User user = User.builder()
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .active(true)
                .build();
        user.getRoles().add(dpRole);
        user = userRepository.save(user);

        DeliveryPerson dp = DeliveryPerson.builder()
                .user(user)
                .vehicleType(req.vehicleType())
                .serviceZone(req.serviceZone())
                .build();
        dp = deliveryPersonRepository.save(dp);

        log.info("Created delivery person userId={} dpId={}", user.getId(), dp.getId());
        return DeliveryPersonResponse.from(dp, 0L);
    }

    @Transactional(readOnly = true)
    public Page<DeliveryPersonResponse> listDeliveryPersons(Boolean suspended, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return deliveryPersonRepository.findAllFiltered(suspended, pageable)
                .map(dp -> {
                    long active = orderRepository.findByDeliveryPersonAndStatuses(
                            dp.getUser().getId(), ACTIVE_STATUSES,
                            PageRequest.of(0, 1)).getTotalElements();
                    return DeliveryPersonResponse.from(dp, active);
                });
    }

    @Transactional
    public DeliveryPersonResponse updateDeliveryPerson(String publicId, UpdateDeliveryPersonRequest req) {
        DeliveryPerson dp = findDpByPublicId(publicId);
        if (req.vehicleType() != null) dp.setVehicleType(req.vehicleType());
        if (req.serviceZone() != null) dp.setServiceZone(req.serviceZone());
        if (req.suspended() != null) {
            dp.setSuspended(req.suspended());
            // Disable login for suspended accounts
            dp.getUser().setActive(!req.suspended());
        }
        deliveryPersonRepository.save(dp);
        long active = orderRepository.findByDeliveryPersonAndStatuses(
                dp.getUser().getId(), ACTIVE_STATUSES, PageRequest.of(0, 1)).getTotalElements();
        return DeliveryPersonResponse.from(dp, active);
    }

    @Transactional
    public OrderResponse assignDeliveryPerson(String orderPublicId, AssignDeliveryRequest req) {
        Order order = orderRepository.findByPublicId(UUID.fromString(orderPublicId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.SHIPPED) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Only CONFIRMED or SHIPPED orders can be assigned to a delivery person");
        }

        DeliveryPerson dp = findDpByPublicId(req.deliveryPersonPublicId());
        if (dp.isSuspended()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Cannot assign to a suspended delivery person");
        }

        order.setDeliveryPerson(dp.getUser());
        order.setAssignedAt(Instant.now());
        order.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        order.setStatus(OrderStatus.SHIPPED); // customer-visible status → Shipped
        Order saved = orderRepository.save(order);

        // Push SSE event to delivery person's dashboard
        eventService.pushToDeliveryPerson(dp.getUser().getId(), "order_assigned", Map.of(
                "orderPublicId", order.getPublicId().toString(),
                "orderNumber", order.getOrderNumber()
        ));

        log.info("Assigned order {} to delivery person userId={}", order.getOrderNumber(), dp.getUser().getId());
        return toResponse(saved);
    }

    // =========================================================================
    // Delivery person operations
    // =========================================================================

    @Transactional(readOnly = true)
    public Page<OrderResponse> listMyOrders(Long userId, String filter, int page, int size) {
        List<DeliveryStatus> statuses = switch (filter) {
            case "active" -> ACTIVE_STATUSES;
            case "delivered" -> List.of(DeliveryStatus.DELIVERED);
            default -> List.of(DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP,
                    DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED);
        };
        var pageable = PageRequest.of(page, size);
        return orderRepository.findByDeliveryPersonAndStatuses(userId, statuses, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public OrderResponse advanceStatus(Long userId, String orderPublicId, DeliveryStatusUpdateRequest req) {
        Order order = findOrderForDeliveryPerson(orderPublicId, userId);

        DeliveryStatus requested = req.status();
        DeliveryStatus current = order.getDeliveryStatus();

        // Validate transition
        boolean valid = switch (current) {
            case ASSIGNED -> requested == DeliveryStatus.PICKED_UP;
            case PICKED_UP -> requested == DeliveryStatus.OUT_FOR_DELIVERY;
            default -> false;
        };
        if (!valid) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Invalid transition: " + current + " → " + requested);
        }

        order.setDeliveryStatus(requested);

        if (requested == DeliveryStatus.OUT_FOR_DELIVERY) {
            // Generate OTP and store hash
            String otp = generateOtp();
            order.setDeliveryOtpHash(sha256(otp));
            order.setDeliveryOtpExpiresAt(Instant.now().plusSeconds(15 * 60));
            // Log OTP (console email provider will also print it; real email provider sends it)
            log.info("OTP for order {} : {} (expires in 15 min)", order.getOrderNumber(), otp);
        }

        Order saved = orderRepository.save(order);

        // Push delivery status update to order channel watchers
        eventService.pushToOrderSubscribers(orderPublicId, "delivery_status_updated", Map.of(
                "orderPublicId", orderPublicId,
                "deliveryStatus", requested.name()
        ));

        return toResponse(saved);
    }

    @Transactional
    public OrderResponse confirmDelivery(Long userId, String orderPublicId, ConfirmDeliveryRequest req) {
        Order order = findOrderForDeliveryPerson(orderPublicId, userId);

        if (order.getDeliveryStatus() != DeliveryStatus.OUT_FOR_DELIVERY) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Order must be OUT_FOR_DELIVERY before confirming delivery");
        }
        if (order.getDeliveryOtpHash() == null || order.getDeliveryOtpExpiresAt() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "No OTP exists for this order");
        }
        if (Instant.now().isAfter(order.getDeliveryOtpExpiresAt())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "OTP has expired — request a new one");
        }
        if (!sha256(req.otp()).equals(order.getDeliveryOtpHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        order.setDeliveryStatus(DeliveryStatus.DELIVERED);
        order.setDeliveredAt(Instant.now());
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveryOtpHash(null);
        order.setDeliveryOtpExpiresAt(null);
        Order saved = orderRepository.save(order);

        eventService.pushToOrderSubscribers(orderPublicId, "delivery_status_updated", Map.of(
                "orderPublicId", orderPublicId,
                "deliveryStatus", "DELIVERED"
        ));

        log.info("Order {} delivered by userId={}", order.getOrderNumber(), userId);
        return toResponse(saved);
    }

    @Transactional
    public DeliveryPersonResponse toggleAvailability(Long userId, boolean available) {
        DeliveryPerson dp = deliveryPersonRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Delivery profile not found"));
        dp.setAvailable(available);
        deliveryPersonRepository.save(dp);
        long active = orderRepository.findByDeliveryPersonAndStatuses(
                userId, ACTIVE_STATUSES, PageRequest.of(0, 1)).getTotalElements();
        return DeliveryPersonResponse.from(dp, active);
    }

    @Transactional(readOnly = true)
    public DeliveryPersonResponse getMyProfile(Long userId) {
        DeliveryPerson dp = deliveryPersonRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Delivery profile not found"));
        long active = orderRepository.findByDeliveryPersonAndStatuses(
                userId, ACTIVE_STATUSES, PageRequest.of(0, 1)).getTotalElements();
        return DeliveryPersonResponse.from(dp, active);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private DeliveryPerson findDpByPublicId(String publicId) {
        return deliveryPersonRepository.findByPublicId(UUID.fromString(publicId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Delivery person not found"));
    }

    private Order findOrderForDeliveryPerson(String orderPublicId, Long userId) {
        return orderRepository.findByPublicIdAndDeliveryPersonId(UUID.fromString(orderPublicId), userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "Order not found or not assigned to you"));
    }

    private OrderResponse toResponse(Order order) {
        PaymentSummaryResponse payment = order.getPayment() != null
                ? PaymentSummaryResponse.from(order.getPayment()) : null;
        return OrderResponse.from(order, payment);
    }

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private static String sha256(String input) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
