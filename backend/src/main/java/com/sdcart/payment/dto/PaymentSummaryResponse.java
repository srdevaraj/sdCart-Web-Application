package com.sdcart.payment.dto;

import com.sdcart.payment.Payment;
import com.sdcart.payment.PaymentMethod;
import com.sdcart.payment.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentSummaryResponse(
        UUID publicId,
        String transactionId,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount) {

    public static PaymentSummaryResponse from(Payment payment) {
        return new PaymentSummaryResponse(
                payment.getPublicId(),
                payment.getTransactionId(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getAmount());
    }
}
