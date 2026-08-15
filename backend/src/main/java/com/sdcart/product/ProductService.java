package com.sdcart.product;

import com.sdcart.brand.Brand;
import com.sdcart.brand.BrandRepository;
import com.sdcart.category.Category;
import com.sdcart.category.CategoryRepository;
import com.sdcart.common.PageResponse;
import com.sdcart.common.SlugUtils;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.product.dto.ProductCreateRequest;
import com.sdcart.product.dto.ProductImageRequest;
import com.sdcart.product.dto.ProductResponse;
import com.sdcart.product.dto.ProductSpecificationRequest;
import com.sdcart.product.dto.ProductUpdateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    // ------------------------------------------------------------------
    // Public catalog
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listProducts(String categorySlug, String brandSlug, String q,
                                                      BigDecimal minPrice, BigDecimal maxPrice,
                                                      Boolean inStock, Boolean featured, Pageable pageable) {
        Long categoryId = categorySlug == null ? null
                : categoryRepository.findBySlug(categorySlug).map(Category::getId).orElse(null);
        Long brandId = brandSlug == null ? null
                : brandRepository.findBySlug(brandSlug).map(Brand::getId).orElse(null);
        Page<Product> products = productRepository.search(
                ProductStatus.ACTIVE, categoryId, brandId, q, inStock, minPrice, maxPrice, featured, pageable);
        return PageResponse.from(products, ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID publicId) {
        Product product = productRepository.findByPublicIdAndStatus(publicId, ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product", publicId));
        return ProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listByCategory(UUID categoryPublicId, Pageable pageable) {
        Category category = categoryRepository.findByPublicId(categoryPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryPublicId));
        Page<Product> products = productRepository.findByCategoryId(category.getId(), pageable);
        return PageResponse.from(products, ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listByBrand(UUID brandPublicId, Pageable pageable) {
        Brand brand = brandRepository.findByPublicId(brandPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", brandPublicId));
        Page<Product> products = productRepository.findByBrandId(brand.getId(), pageable);
        return PageResponse.from(products, ProductResponse::from);
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listAllProducts(String q, ProductStatus status, Pageable pageable) {
        Page<Product> products = productRepository.search(status, null, null, q, null, null, null, null, pageable);
        return PageResponse.from(products, ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductAdmin(UUID publicId) {
        return ProductResponse.from(getEntity(publicId));
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        String slug = resolveUniqueSlug(request.slug(), request.name(), null);
        Product product = Product.builder()
                .name(request.name().trim())
                .slug(slug)
                .sku(request.sku())
                .shortDescription(request.shortDescription())
                .description(request.description())
                .price(request.price())
                .compareAtPrice(request.compareAtPrice())
                .costPrice(request.costPrice())
                .stockQuantity(request.stockQuantity() == null ? 0 : request.stockQuantity())
                .status(request.status() == null ? ProductStatus.ACTIVE : request.status())
                .featured(Boolean.TRUE.equals(request.featured()))
                .build();
        if (request.categoryId() != null) {
            product.setCategory(categoryRepository.findByPublicId(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId())));
        }
        if (request.brandId() != null) {
            product.setBrand(brandRepository.findByPublicId(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", request.brandId())));
        }
        applyImages(product, request.images());
        applySpecifications(product, request.specifications());
        Product saved = productRepository.save(product);
        log.info("Created product id={} slug={}", saved.getId(), saved.getSlug());
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse updateProduct(UUID publicId, ProductUpdateRequest request) {
        Product product = getEntity(publicId);
        if (request.name() != null) {
            product.setName(request.name().trim());
        }
        if (request.slug() != null || request.name() != null) {
            product.setSlug(resolveUniqueSlug(request.slug(), request.name(), product.getSlug()));
        }
        if (request.sku() != null) product.setSku(request.sku());
        if (request.shortDescription() != null) product.setShortDescription(request.shortDescription());
        if (request.description() != null) product.setDescription(request.description());
        if (request.price() != null) product.setPrice(request.price());
        if (request.compareAtPrice() != null) product.setCompareAtPrice(request.compareAtPrice());
        if (request.costPrice() != null) product.setCostPrice(request.costPrice());
        if (request.stockQuantity() != null) product.setStockQuantity(request.stockQuantity());
        if (request.status() != null) product.setStatus(request.status());
        if (request.featured() != null) product.setFeatured(request.featured());
        if (request.categoryId() != null) {
            product.setCategory(categoryRepository.findByPublicId(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId())));
        }
        if (request.brandId() != null) {
            product.setBrand(brandRepository.findByPublicId(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", request.brandId())));
        }
        if (request.images() != null) applyImages(product, request.images());
        if (request.specifications() != null) applySpecifications(product, request.specifications());
        log.info("Updated product id={}", product.getId());
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse updateStatus(UUID publicId, ProductStatus status) {
        Product product = getEntity(publicId);
        product.setStatus(status);
        log.info("Product id={} status -> {}", product.getId(), status);
        return ProductResponse.from(product);
    }

    /**
     * Soft delete: the product is deactivated so it disappears from the public
     * catalog while keeping referential integrity with orders and carts.
     */
    @Transactional
    public void deleteProduct(UUID publicId) {
        Product product = getEntity(publicId);
        product.setStatus(ProductStatus.INACTIVE);
        product.setFeatured(false);
        log.info("Soft-deleted product id={} slug={}", product.getId(), product.getSlug());
    }

    public Product getEntity(UUID publicId) {
        return productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", publicId));
    }

    private String resolveUniqueSlug(String requestedSlug, String name, String currentSlug) {
        String slug = SlugUtils.uniqueSlug(requestedSlug, name);
        if (slug.equals(currentSlug)) {
            return slug;
        }
        if (!productRepository.existsBySlug(slug)) {
            return slug;
        }
        throw new BusinessException(HttpStatus.CONFLICT, "A product with slug '" + slug + "' already exists");
    }

    private void applyImages(Product product, java.util.List<ProductImageRequest> images) {
        if (images == null) {
            return;
        }
        product.getImages().clear();
        for (int i = 0; i < images.size(); i++) {
            ProductImageRequest req = images.get(i);
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl(req.imageUrl())
                    .altText(req.altText())
                    .sortOrder(req.sortOrder() == null ? i : req.sortOrder())
                    .primary(Boolean.TRUE.equals(req.primary()) || (i == 0 && images.stream().noneMatch(r -> Boolean.TRUE.equals(r.primary()))))
                    .build());
        }
    }

    private void applySpecifications(Product product, java.util.List<ProductSpecificationRequest> specifications) {
        if (specifications == null) {
            return;
        }
        product.getSpecifications().clear();
        for (int i = 0; i < specifications.size(); i++) {
            ProductSpecificationRequest req = specifications.get(i);
            product.getSpecifications().add(ProductSpecification.builder()
                    .product(product)
                    .name(req.name())
                    .value(req.value())
                    .sortOrder(req.sortOrder() == null ? i : req.sortOrder())
                    .build());
        }
    }
}
