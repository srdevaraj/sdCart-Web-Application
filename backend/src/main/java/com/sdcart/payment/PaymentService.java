package com.sdcart.payment;

import com.sdcart.common.PageResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.order.Order;
import com.sdcart.order.OrderRepository;
import com.sdcart.order.OrderStatus;
import com.sdcart.payment.dto.PaymentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.UUID;

/**
 * Payment processing against a pluggable gateway. The default {@code MOCK}
 * gateway always succeeds — swap in a real provider (e.g. Stripe) behind the
 * same service boundary.
 */
@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public PaymentResponse payOrder(Long userId, UUID orderPublicId) {
        Order order = orderRepository.findByPublicIdAndUserId(orderPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderPublicId));
        if (order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.AWAITING_PAYMENT
                && order.getStatus() != OrderStatus.PAYMENT_FAILED) {
            throw new BusinessException(HttpStatus.CONFLICT, "Order is not awaiting payment");
        }
        // Lock the payment row so concurrent pay requests cannot double-charge.
        Payment payment = paymentRepository.findByOrderIdForUpdate(order.getId())
                .orElseThrow(() -> new IllegalStateException("Payment record missing for order " + order.getOrderNumber()));
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException(HttpStatus.CONFLICT, "Order has already been paid");
        }

        // Mock gateway: always approves. A real integration would call the
        // provider here and map its response to COMPLETED / FAILED.
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(Instant.now());
        payment.setGatewayReference("MOCK-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase());
        payment.setFailureReason(null);
        order.setStatus(OrderStatus.CONFIRMED);

        log.info("Payment {} completed for order {} (mock gateway)",
                payment.getTransactionId(), order.getOrderNumber());
        return PaymentResponse.from(payment);
    }

    @Transactional
    public PaymentResponse failPayment(Long userId, UUID orderPublicId, String reason) {
        Order order = orderRepository.findByPublicIdAndUserId(orderPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderPublicId));
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new BusinessException(HttpStatus.CONFLICT, "Order is not awaiting payment");
        }
        Payment payment = paymentRepository.findByOrderIdForUpdate(order.getId())
                .orElseThrow(() -> new IllegalStateException("Payment record missing for order " + order.getOrderNumber()));
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException(HttpStatus.CONFLICT, "Order has already been paid");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(StringUtils.hasText(reason) ? reason : "Payment was declined or cancelled");
        order.setStatus(OrderStatus.PAYMENT_FAILED);

        log.info("Payment {} failed for order {}: {}",
                payment.getTransactionId(), order.getOrderNumber(), payment.getFailureReason());
        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> listPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(payments, PaymentResponse::from);
    }
}
