package com.sdcart.coupon;

import com.sdcart.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @InjectMocks
    private CouponService couponService;

    @Test
    void percentageCoupon_computesDiscount() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", null, 0, 0, 0);

        BigDecimal discount = couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L);

        assertThat(discount).isEqualByComparingTo("10.00");
    }

    @Test
    void percentageCoupon_isCappedByMaxDiscount() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", "5.00", 0, 0, 0);

        BigDecimal discount = couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L);

        assertThat(discount).isEqualByComparingTo("5.00");
    }

    @Test
    void fixedCoupon_discountsFlatAmount() {
        Coupon coupon = coupon(CouponType.FIXED, "20.00", "0.00", null, 0, 0, 0);

        BigDecimal discount = couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L);

        assertThat(discount).isEqualByComparingTo("20.00");
    }

    @Test
    void discount_neverExceedsOrderAmount() {
        Coupon coupon = coupon(CouponType.FIXED, "200.00", "0.00", null, 0, 0, 0);

        BigDecimal discount = couponService.computeDiscountForOrder(coupon, new BigDecimal("50.00"), 1L);

        assertThat(discount).isEqualByComparingTo("50.00");
    }

    @Test
    void minOrderAmountNotMet_isRejected() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "50.00", null, 0, 0, 0);

        assertThatThrownBy(() -> couponService.computeDiscountForOrder(coupon, new BigDecimal("30.00"), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Minimum order amount");
    }

    @Test
    void expiredCoupon_isRejected() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", null, 0, 0, 0);
        coupon.setValidFrom(Instant.now().minus(30, ChronoUnit.DAYS));
        coupon.setValidUntil(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void inactiveCoupon_isRejected() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", null, 0, 0, 0);
        coupon.setActive(false);

        assertThatThrownBy(() -> couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void usageLimitReached_isRejected() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", null, 5, 5, 0);

        assertThatThrownBy(() -> couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("usage limit");
    }

    @Test
    void perUserLimitReached_isRejected() {
        Coupon coupon = coupon(CouponType.PERCENTAGE, "10.00", "0.00", null, 0, 0, 1);
        when(couponRepository.countUsageByCouponAndUser(anyLong(), anyLong())).thenReturn(1L);

        assertThatThrownBy(() -> couponService.computeDiscountForOrder(coupon, new BigDecimal("100.00"), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already used");
    }

    private Coupon coupon(CouponType type, String value, String minOrder, String maxDiscount,
                          int maxUsages, int usedCount, int perUserLimit) {
        Coupon coupon = Coupon.builder()
                .code("TEST10")
                .type(type)
                .value(new BigDecimal(value))
                .minOrderAmount(new BigDecimal(minOrder))
                .maxDiscountAmount(maxDiscount == null ? null : new BigDecimal(maxDiscount))
                .maxUsages(maxUsages)
                .usedCount(usedCount)
                .perUserLimit(perUserLimit)
                .validFrom(Instant.now().minus(1, ChronoUnit.DAYS))
                .validUntil(Instant.now().plus(30, ChronoUnit.DAYS))
                .active(true)
                .build();
        ReflectionTestUtils.setField(coupon, "id", 7L);
        return coupon;
    }
}
