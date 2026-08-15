package com.sdcart.admin;

import com.sdcart.admin.dto.CouponActiveRequest;
import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.coupon.CouponService;
import com.sdcart.coupon.dto.CouponRequest;
import com.sdcart.coupon.dto.CouponResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
public class AdminCouponController {

    private final CouponService couponService;

    public AdminCouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CouponResponse>>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.list(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Coupon created", coupon));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<CouponResponse>> update(@PathVariable UUID publicId,
                                                              @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Coupon updated", couponService.update(publicId, request)));
    }

    @PatchMapping("/{publicId}/active")
    public ResponseEntity<ApiResponse<CouponResponse>> setActive(@PathVariable UUID publicId,
                                                                 @Valid @RequestBody CouponActiveRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Coupon status updated",
                couponService.setActive(publicId, request.active())));
    }
}
