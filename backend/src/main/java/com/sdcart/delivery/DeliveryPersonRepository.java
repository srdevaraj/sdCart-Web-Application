package com.sdcart.delivery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DeliveryPersonRepository extends JpaRepository<DeliveryPerson, Long> {

    @EntityGraph(attributePaths = {"user"})
    Optional<DeliveryPerson> findByPublicId(UUID publicId);

    @EntityGraph(attributePaths = {"user"})
    Optional<DeliveryPerson> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT dp FROM DeliveryPerson dp WHERE (:suspended IS NULL OR dp.suspended = :suspended)")
    Page<DeliveryPerson> findAllFiltered(@Param("suspended") Boolean suspended, Pageable pageable);

    boolean existsByUserId(Long userId);
}
