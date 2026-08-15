package com.sdcart.payment;

import com.sdcart.common.ApiResponse;
import com.sdcart.payment.dto.PaymentResponse;
import com.sdcart.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Simulates the payment gateway redirect/confirmation for a pending order.
     */
    @PostMapping("/orders/{orderPublicId}/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(@PathVariable UUID orderPublicId) {
        return ResponseEntity.ok(ApiResponse.ok("Payment processed",
                paymentService.payOrder(SecurityUtils.currentUserId(), orderPublicId)));
    }
}
