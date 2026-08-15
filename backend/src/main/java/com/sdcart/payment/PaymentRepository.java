package com.sdcart.payment;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPublicId(UUID publicId);

    Optional<Payment> findByOrderId(Long orderId);

    /**
     * Locks the payment row while it transitions to COMPLETED so concurrent
     * pay requests cannot double-charge or double-confirm an order.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderIdForUpdate(@Param("orderId") Long orderId);

    Optional<Payment> findByOrderPublicId(UUID orderPublicId);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
