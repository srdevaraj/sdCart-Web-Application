package com.sdcart.delivery;

import com.sdcart.common.ApiResponse;
import com.sdcart.delivery.dto.ConfirmDeliveryRequest;
import com.sdcart.delivery.dto.DeliveryPersonResponse;
import com.sdcart.delivery.dto.DeliveryStatusUpdateRequest;
import com.sdcart.order.dto.OrderResponse;
import com.sdcart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * REST + SSE endpoints for authenticated delivery persons.
 * All routes require DELIVERY_PERSON role (enforced by SecurityConfig on /api/v1/delivery/**).
 */
@RestController
@RequestMapping("/api/v1/delivery")
public class DeliveryController {

    private final DeliveryPersonService deliveryPersonService;
    private final DeliveryEventService deliveryEventService;

    public DeliveryController(DeliveryPersonService deliveryPersonService,
                               DeliveryEventService deliveryEventService) {
        this.deliveryPersonService = deliveryPersonService;
        this.deliveryEventService = deliveryEventService;
    }

    // -------------------------------------------------------------------------
    // Profile
    // -------------------------------------------------------------------------

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DeliveryPersonResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.getMyProfile(principal.id())));
    }

    @PatchMapping("/profile/availability")
    public ResponseEntity<ApiResponse<DeliveryPersonResponse>> toggleAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam boolean available) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.toggleAvailability(principal.id(), available)));
    }

    // -------------------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------------------

    /**
     * List orders assigned to the logged-in delivery person.
     * @param filter "active" | "delivered" | "all" (default)
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> listOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.listMyOrders(principal.id(), filter, page, size)));
    }

    /** Advance delivery status: ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY (generates OTP). */
    @PatchMapping("/orders/{publicId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> advanceStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId,
            @Valid @RequestBody DeliveryStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.advanceStatus(principal.id(), publicId, request)));
    }

    /** OTP-based delivery confirmation: OUT_FOR_DELIVERY → DELIVERED. */
    @PostMapping("/orders/{publicId}/confirm-delivery")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmDelivery(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId,
            @Valid @RequestBody ConfirmDeliveryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.confirmDelivery(principal.id(), publicId, request)));
    }

    // -------------------------------------------------------------------------
    // SSE stream — delivery person's own channel
    // -------------------------------------------------------------------------

    /**
     * SSE endpoint for the delivery person's dashboard. Receives events like
     * {@code order_assigned} whenever the admin assigns an order to them.
     * The browser's native {@code EventSource} reconnects automatically.
     */
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents(@AuthenticationPrincipal UserPrincipal principal) {
        return deliveryEventService.subscribeDelivery(principal.id());
    }
}
