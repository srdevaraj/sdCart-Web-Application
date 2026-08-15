package com.sdcart.coupon;

import com.sdcart.common.PageResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.coupon.dto.CouponRequest;
import com.sdcart.coupon.dto.CouponResponse;
import com.sdcart.coupon.dto.CouponValidationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public CouponService(CouponRepository couponRepository, CouponUsageRepository couponUsageRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    // ------------------------------------------------------------------
    // Customer-facing
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public CouponValidationResponse validate(String code, BigDecimal orderAmount, Long userId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Invalid coupon code"));
        assertUsable(coupon, orderAmount, userId);
        BigDecimal discount = computeDiscount(coupon, orderAmount);
        return new CouponValidationResponse(true, coupon.getCode(), coupon.getType(), discount,
                "Coupon applied — you save " + discount.setScale(2, RoundingMode.HALF_UP));
    }

    /**
     * Validates the coupon for the given order amount and returns the discount.
     * Used at checkout; throws with a human-readable reason when unusable.
     */
    @Transactional(readOnly = true)
    public BigDecimal computeDiscountForOrder(Coupon coupon, BigDecimal orderAmount, Long userId) {
        assertUsable(coupon, orderAmount, userId);
        return computeDiscount(coupon, orderAmount);
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<CouponResponse> list(Pageable pageable) {
        Page<Coupon> coupons = couponRepository.findAll(pageable);
        return PageResponse.from(coupons, CouponResponse::from);
    }

    @Transactional
    public CouponResponse create(CouponRequest request) {
        String code = request.code().trim().toUpperCase();
        if (couponRepository.existsByCode(code)) {
            throw new BusinessException(HttpStatus.CONFLICT, "A coupon with code '" + code + "' already exists");
        }
        validateDates(request.validFrom(), request.validUntil());
        Coupon coupon = Coupon.builder()
                .code(code)
                .type(request.type())
                .value(request.value())
                .minOrderAmount(request.minOrderAmount() == null ? BigDecimal.ZERO : request.minOrderAmount())
                .maxDiscountAmount(request.maxDiscountAmount())
                .maxUsages(request.maxUsages() == null ? 0 : request.maxUsages())
                .perUserLimit(request.perUserLimit() == null ? 0 : request.perUserLimit())
                .validFrom(request.validFrom())
                .validUntil(request.validUntil())
                .active(request.active() == null || request.active())
                .description(request.description())
                .build();
        Coupon saved = couponRepository.save(coupon);
        log.info("Created coupon id={} code={}", saved.getId(), saved.getCode());
        return CouponResponse.from(saved);
    }

    @Transactional
    public CouponResponse update(UUID publicId, CouponRequest request) {
        Coupon coupon = getEntity(publicId);
        String code = request.code().trim().toUpperCase();
        if (!code.equals(coupon.getCode()) && couponRepository.existsByCodeAndIdNot(code, coupon.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "A coupon with code '" + code + "' already exists");
        }
        validateDates(request.validFrom(), request.validUntil());
        coupon.setCode(code);
        coupon.setType(request.type());
        coupon.setValue(request.value());
        if (request.minOrderAmount() != null) coupon.setMinOrderAmount(request.minOrderAmount());
        if (request.maxDiscountAmount() != null) coupon.setMaxDiscountAmount(request.maxDiscountAmount());
        if (request.maxUsages() != null) coupon.setMaxUsages(request.maxUsages());
        if (request.perUserLimit() != null) coupon.setPerUserLimit(request.perUserLimit());
        coupon.setValidFrom(request.validFrom());
        coupon.setValidUntil(request.validUntil());
        if (request.active() != null) coupon.setActive(request.active());
        coupon.setDescription(request.description());
        log.info("Updated coupon id={}", coupon.getId());
        return CouponResponse.from(coupon);
    }

    @Transactional
    public CouponResponse setActive(UUID publicId, boolean active) {
        Coupon coupon = getEntity(publicId);
        coupon.setActive(active);
        log.info("Coupon id={} {} ", coupon.getId(), active ? "activated" : "deactivated");
        return CouponResponse.from(coupon);
    }

    public Coupon getEntity(UUID publicId) {
        return couponRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", publicId));
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private void assertUsable(Coupon coupon, BigDecimal orderAmount, Long userId) {
        Instant now = Instant.now();
        if (!coupon.isActive()) {
            throw new BusinessException("Coupon '" + coupon.getCode() + "' is not active");
        }
        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            throw new BusinessException("Coupon '" + coupon.getCode() + "' has expired");
        }
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException("Minimum order amount for coupon '" + coupon.getCode() + "' is $"
                    + coupon.getMinOrderAmount());
        }
        if (coupon.getMaxUsages() > 0 && coupon.getUsedCount() >= coupon.getMaxUsages()) {
            throw new BusinessException("Coupon '" + coupon.getCode() + "' has reached its usage limit");
        }
        if (coupon.getPerUserLimit() > 0 && userId != null) {
            long userUsage = couponRepository.countUsageByCouponAndUser(coupon.getId(), userId);
            if (userUsage >= coupon.getPerUserLimit()) {
                throw new BusinessException("You have already used coupon '" + coupon.getCode() + "'");
            }
        }
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount = switch (coupon.getType()) {
            case PERCENTAGE -> orderAmount.multiply(coupon.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            case FIXED -> coupon.getValue();
        };
        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }
        return discount.min(orderAmount);
    }

    private void validateDates(Instant validFrom, Instant validUntil) {
        if (!validFrom.isBefore(validUntil)) {
            throw new BusinessException("validFrom must be before validUntil");
        }
    }
}
