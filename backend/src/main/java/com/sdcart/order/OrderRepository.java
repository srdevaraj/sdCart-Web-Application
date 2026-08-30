package com.sdcart.order;

import com.sdcart.delivery.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "payment"})
    Optional<Order> findByPublicId(UUID publicId);

    @EntityGraph(attributePaths = {"items", "payment"})
    Optional<Order> findByPublicIdAndUserId(UUID publicId, Long userId);

    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "user", "payment"})
    @Query("SELECT o FROM Order o WHERE (:status IS NULL OR o.status = :status)")
    Page<Order> findAllFiltered(@Param("status") OrderStatus status, Pageable pageable);

    boolean existsByOrderNumber(String orderNumber);

    // -------------------------------------------------------------------------
    // Delivery person queries
    // -------------------------------------------------------------------------

    @EntityGraph(attributePaths = {"items", "payment", "deliveryPerson"})
    @Query("SELECT o FROM Order o WHERE o.deliveryPerson.id = :deliveryPersonId" +
           " AND o.deliveryStatus IN :statuses ORDER BY o.assignedAt DESC")
    Page<Order> findByDeliveryPersonAndStatuses(
            @Param("deliveryPersonId") Long deliveryPersonId,
            @Param("statuses") List<DeliveryStatus> statuses,
            Pageable pageable);

    @EntityGraph(attributePaths = {"items", "payment"})
    Optional<Order> findByPublicIdAndDeliveryPersonId(UUID publicId, Long deliveryPersonId);
}
