package com.sdcart.admin;

import com.sdcart.admin.dto.OrderStatusUpdateRequest;
import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.order.OrderService;
import com.sdcart.order.OrderStatus;
import com.sdcart.order.dto.OrderResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> list(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.listOrders(status, pageable)));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderAdmin(publicId)));
    }

    @PatchMapping("/{publicId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable UUID publicId,
                                                                   @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order status updated",
                orderService.updateStatus(publicId, request.status())));
    }
}
