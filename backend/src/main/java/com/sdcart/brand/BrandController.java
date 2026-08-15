package com.sdcart.brand;

import com.sdcart.brand.dto.BrandResponse;
import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.product.dto.ProductResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(brandService.listActive()));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<BrandResponse>> get(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(brandService.get(publicId)));
    }
}
