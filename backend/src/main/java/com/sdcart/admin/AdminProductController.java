package com.sdcart.admin;

import com.sdcart.admin.dto.ProductStatusRequest;
import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.product.ProductService;
import com.sdcart.product.ProductStatus;
import com.sdcart.product.dto.ProductCreateRequest;
import com.sdcart.product.dto.ProductResponse;
import com.sdcart.product.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ProductStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(productService.listAllProducts(q, status, pageable)));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ProductResponse>> get(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductAdmin(publicId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductCreateRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created", product));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable UUID publicId,
                                                               @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated", productService.updateProduct(publicId, request)));
    }

    @PatchMapping("/{publicId}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(@PathVariable UUID publicId,
                                                                     @Valid @RequestBody ProductStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product status updated",
                productService.updateStatus(publicId, request.status())));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID publicId) {
        productService.deleteProduct(publicId);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated"));
    }
}
