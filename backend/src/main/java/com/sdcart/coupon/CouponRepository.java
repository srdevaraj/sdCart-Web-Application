package com.sdcart.coupon;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByPublicId(UUID publicId);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    /**
     * Locks the coupon row while its usage counters are incremented at
     * checkout so concurrent orders cannot exceed max_usages.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Coupon c WHERE LOWER(c.code) = LOWER(:code)")
    Optional<Coupon> findByCodeIgnoreCaseForUpdate(@Param("code") String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    long countUsageByCouponAndUser(@Param("couponId") Long couponId, @Param("userId") Long userId);
}
