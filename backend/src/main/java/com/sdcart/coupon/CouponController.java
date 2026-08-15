package com.sdcart.coupon;

import com.sdcart.common.ApiResponse;
import com.sdcart.coupon.dto.CouponValidationResponse;
import com.sdcart.coupon.dto.ValidateCouponRequest;
import com.sdcart.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validate(
            @Valid @RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.validate(
                request.code(), request.orderAmount(), SecurityUtils.currentUserId())));
    }
}
