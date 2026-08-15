package com.sdcart.admin;

import com.sdcart.brand.BrandService;
import com.sdcart.brand.dto.BrandRequest;
import com.sdcart.brand.dto.BrandResponse;
import com.sdcart.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/brands")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        BrandResponse brand = brandService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Brand created", brand));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<BrandResponse>> update(@PathVariable UUID publicId,
                                                             @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Brand updated", brandService.update(publicId, request)));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID publicId) {
        brandService.delete(publicId);
        return ResponseEntity.ok(ApiResponse.ok("Brand deleted"));
    }
}
