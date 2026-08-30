package com.sdcart.admin;

import com.sdcart.common.ApiResponse;
import com.sdcart.delivery.DeliveryPersonService;
import com.sdcart.delivery.dto.AssignDeliveryRequest;
import com.sdcart.delivery.dto.CreateDeliveryPersonRequest;
import com.sdcart.delivery.dto.DeliveryPersonResponse;
import com.sdcart.delivery.dto.UpdateDeliveryPersonRequest;
import com.sdcart.order.dto.OrderResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin endpoints for delivery person management and order assignment.
 * All endpoints require ADMIN role (enforced globally by SecurityConfig on /api/v1/admin/**).
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminDeliveryPersonController {

    private final DeliveryPersonService deliveryPersonService;

    public AdminDeliveryPersonController(DeliveryPersonService deliveryPersonService) {
        this.deliveryPersonService = deliveryPersonService;
    }

    /** Create a new delivery person account. */
    @PostMapping("/delivery-persons")
    public ResponseEntity<ApiResponse<DeliveryPersonResponse>> create(
            @Valid @RequestBody CreateDeliveryPersonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(deliveryPersonService.createDeliveryPerson(request)));
    }

    /** List all delivery persons, optionally filtered by suspended status. */
    @GetMapping("/delivery-persons")
    public ResponseEntity<ApiResponse<Page<DeliveryPersonResponse>>> list(
            @RequestParam(required = false) Boolean suspended,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.listDeliveryPersons(suspended, page, size)));
    }

    /** Update a delivery person's profile (vehicle type, zone, suspend/reactivate). */
    @PatchMapping("/delivery-persons/{publicId}")
    public ResponseEntity<ApiResponse<DeliveryPersonResponse>> update(
            @PathVariable String publicId,
            @RequestBody UpdateDeliveryPersonRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.updateDeliveryPerson(publicId, request)));
    }

    /** Assign a delivery person to an order (order must be CONFIRMED or SHIPPED). */
    @PostMapping("/orders/{orderPublicId}/assign")
    public ResponseEntity<ApiResponse<OrderResponse>> assignDelivery(
            @PathVariable String orderPublicId,
            @Valid @RequestBody AssignDeliveryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                deliveryPersonService.assignDeliveryPerson(orderPublicId, request)));
    }
}
