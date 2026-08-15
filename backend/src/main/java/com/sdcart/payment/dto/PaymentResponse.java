package com.sdcart.payment.dto;

import com.sdcart.payment.Payment;
import com.sdcart.payment.PaymentMethod;
import com.sdcart.payment.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID publicId,
        UUID orderPublicId,
        String transactionId,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        String currency,
        String gateway,
        String gatewayReference,
        Instant paidAt,
        String failureReason,
        Instant createdAt) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getPublicId(),
                payment.getOrder().getPublicId(),
                payment.getTransactionId(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getGateway(),
                payment.getGatewayReference(),
                payment.getPaidAt(),
                payment.getFailureReason(),
                payment.getCreatedAt());
    }
}
