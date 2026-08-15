package com.sdcart.order;

import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.order.dto.CreateOrderRequest;
import com.sdcart.order.dto.OrderResponse;
import com.sdcart.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.placeOrder(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Order placed", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> myOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders(SecurityUtils.currentUserId(), pageable)));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(SecurityUtils.currentUserId(), publicId)));
    }

    @PostMapping("/{publicId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled",
                orderService.cancelOrder(SecurityUtils.currentUserId(), publicId)));
    }
}
