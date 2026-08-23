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
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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

    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> listBanners() {
        return ResponseEntity.ok(ApiResponse.ok(productService.listBannerProductsAdmin()));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ProductResponse>> get(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductAdmin(publicId)));
    }

    /**
     * JSON create (unchanged contract): image URLs are stored as-is.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductCreateRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created", product));
    }

    /**
     * Multipart create: the product fields arrive as a JSON part named
     * {@code product}; image files are uploaded to Cloudinary server-side and
     * their HTTPS URLs + public IDs are persisted with the product. The
     * Cloudinary credentials never leave the backend.
     *
     * @param images   one or more image files (part name {@code images})
     * @param altTexts optional JSON array of alt texts parallel to {@code images}
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> createWithImages(
            @RequestPart("product") @Valid ProductCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "altTexts", required = false) List<String> altTexts) {
        ProductResponse product = productService.createProduct(request, images, altTexts);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created", product));
    }

    /**
     * JSON update (unchanged contract): URL-based images replace the set only
     * when an {@code images} list is provided; otherwise images stay unchanged.
     */
    @PutMapping(value = "/{publicId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable UUID publicId,
                                                               @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated", productService.updateProduct(publicId, request)));
    }

    /**
     * Multipart update: uploading new image files replaces the product's image
     * set (the replaced Cloudinary assets are deleted only after the database
     * save commits). With no {@code images} part the existing images are kept
     * untouched.
     */
    @PutMapping(value = "/{publicId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> updateWithImages(
            @PathVariable UUID publicId,
            @RequestPart("product") @Valid ProductUpdateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "altTexts", required = false) List<String> altTexts) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated",
                productService.updateProduct(publicId, request, images, altTexts)));
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
