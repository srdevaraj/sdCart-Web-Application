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
import com.sdcart.service.CloudinaryService;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;
    private final EntityManager entityManager;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          CloudinaryService cloudinaryService,
                          EntityManager entityManager) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.cloudinaryService = cloudinaryService;
        this.entityManager = entityManager;
    }

    // ------------------------------------------------------------------
    // Public catalog
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listProducts(String categorySlug, String brandSlug, String q,
                                                      BigDecimal minPrice, BigDecimal maxPrice,
                                                      Boolean inStock, Boolean featured, Pageable pageable) {
        Long categoryId = null;
        if (StringUtils.hasText(categorySlug)) {
            String cleanSlug = categorySlug.trim().toLowerCase();
            categoryId = categoryRepository.findBySlug(cleanSlug)
                    .map(Category::getId)
                    .orElseGet(() -> {
                        try {
                            UUID publicId = UUID.fromString(categorySlug.trim());
                            return categoryRepository.findByPublicId(publicId).map(Category::getId).orElse(-1L);
                        } catch (IllegalArgumentException e) {
                            return -1L;
                        }
                    });
        }

        Long brandId = null;
        if (StringUtils.hasText(brandSlug)) {
            String cleanSlug = brandSlug.trim().toLowerCase();
            brandId = brandRepository.findBySlug(cleanSlug)
                    .map(Brand::getId)
                    .orElseGet(() -> {
                        try {
                            UUID publicId = UUID.fromString(brandSlug.trim());
                            return brandRepository.findByPublicId(publicId).map(Brand::getId).orElse(-1L);
                        } catch (IllegalArgumentException e) {
                            return -1L;
                        }
                    });
        }

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

    @Transactional(readOnly = true)
    public List<ProductResponse> listBannerProducts() {
        return productRepository.findByStatusAndBannerImageIsNotNull(ProductStatus.ACTIVE).stream()
                .filter(p -> p.getBannerImage() != null && !p.getBannerImage().trim().isEmpty())
                .map(ProductResponse::from)
                .toList();
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ProductResponse> listBannerProductsAdmin() {
        return productRepository.findByBannerImageIsNotNull().stream()
                .filter(p -> p.getBannerImage() != null && !p.getBannerImage().trim().isEmpty())
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listAllProducts(String q, ProductStatus status, Pageable pageable) {
        Page<Product> products = productRepository.search(status, null, null, q, null, null, null, null, pageable);
        return PageResponse.from(products, ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductAdmin(UUID publicId) {
        return ProductResponse.from(getEntity(publicId));
    }

    /**
     * Creates a product from a JSON body, using URL-based images exactly as
     * before (unchanged contract).
     */
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        return createProduct(request, null, null);
    }

    /**
     * Creates a product, optionally uploading the supplied image files to
     * Cloudinary. When files are provided they become the product's images
     * (first file = primary); otherwise the URL-based images from the request
     * are used. If the database save fails after a successful Cloudinary
     * upload, the freshly uploaded assets are removed again so no orphaned
     * images are left behind.
     */
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request,
                                         List<MultipartFile> images, List<String> altTexts) {
        List<CloudinaryService.UploadedImage> uploads = cloudinaryService.uploadProductImages(images, altTexts);
        try {
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
                    .bannerImage(StringUtils.hasText(request.bannerImage()) ? request.bannerImage().trim() : null)
                    .build();
            if (request.categoryId() != null) {
                product.setCategory(categoryRepository.findByPublicId(request.categoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId())));
            }
            if (request.brandId() != null) {
                product.setBrand(brandRepository.findByPublicId(request.brandId())
                        .orElseThrow(() -> new ResourceNotFoundException("Brand", request.brandId())));
            }
            if (!uploads.isEmpty()) {
                applyCloudinaryImages(product, uploads, altTexts);
            } else {
                applyImages(product, request.images());
            }
            applySpecifications(product, request.specifications());
            Product saved = productRepository.save(product);
            log.info("Created product id={} slug={}", saved.getId(), saved.getSlug());
            return ProductResponse.from(saved);
        } catch (RuntimeException ex) {
            // Compensation: the product was not saved, so the uploaded
            // Cloudinary assets would otherwise become orphans.
            cloudinaryService.deleteUploads(uploads);
            throw ex;
        }
    }

    /**
     * Updates a product from a JSON body, using URL-based images exactly as
     * before (unchanged contract).
     */
    @Transactional
    public ProductResponse updateProduct(UUID publicId, ProductUpdateRequest request) {
        return updateProduct(publicId, request, null, null);
    }

    /**
     * Updates a product, optionally replacing its images with new files
     * uploaded to Cloudinary. The new images are uploaded and the transaction
     * committed before the replaced Cloudinary assets are deleted — an upload
     * or database failure never destroys the currently displayed images, and a
     * rollback removes the freshly uploaded assets instead.
     *
     * <p>When no files are supplied, the product's images stay exactly as they
     * are unless a URL-based {@code images} list is provided in the request
     * (pre-existing JSON behavior).
     */
    @Transactional
    public ProductResponse updateProduct(UUID publicId, ProductUpdateRequest request,
                                         List<MultipartFile> images, List<String> altTexts) {
        Product product = getEntity(publicId);
        List<CloudinaryService.UploadedImage> uploads = List.of();
        List<String> replacedPublicIds = List.of();

        if (images != null && !images.isEmpty()) {
            // Upload the replacement images BEFORE touching the product: a
            // failure here leaves the product and its current images untouched.
            uploads = cloudinaryService.uploadProductImages(images, altTexts);
            replacedPublicIds = product.getImages().stream()
                    .map(ProductImage::getCloudinaryPublicId)
                    .filter(StringUtils::hasText)
                    .toList();
            applyCloudinaryImages(product, uploads, altTexts);
        } else if (request.images() != null) {
            applyImages(product, request.images());
        }

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
        if (request.bannerImage() != null) {
            product.setBannerImage(StringUtils.hasText(request.bannerImage()) ? request.bannerImage().trim() : null);
        }
        if (request.categoryId() != null) {
            product.setCategory(categoryRepository.findByPublicId(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId())));
        }
        if (request.brandId() != null) {
            product.setBrand(brandRepository.findByPublicId(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", request.brandId())));
        }
        if (request.specifications() != null) applySpecifications(product, request.specifications());

        if (!uploads.isEmpty()) {
            deferCloudinaryCleanup(uploads, replacedPublicIds);
        }
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
     * Cloudinary assets are intentionally NOT removed here — the product can
     * be re-activated and existing orders still reference its images.
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

    private void applyCloudinaryImages(Product product, List<CloudinaryService.UploadedImage> uploads,
                                       List<String> altTexts) {
        product.getImages().clear();
        for (int i = 0; i < uploads.size(); i++) {
            CloudinaryService.UploadedImage uploaded = uploads.get(i);
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl(uploaded.secureUrl())
                    .cloudinaryPublicId(uploaded.publicId())
                    .altText(altTexts != null && i < altTexts.size() ? altTexts.get(i) : null)
                    .sortOrder(i)
                    .primary(i == 0)
                    .build());
        }
    }

    private void applySpecifications(Product product, java.util.List<ProductSpecificationRequest> specifications) {
        if (specifications == null) {
            return;
        }
        product.getSpecifications().clear();
        // Flush the pending DELETEs immediately so the orphan rows are removed
        // from the DB before the new rows are inserted. Without this flush,
        // Hibernate's default ordering (INSERTs before orphan DELETEs) causes
        // a transient duplicate-key violation on uk_product_specifications_product_name
        // whenever a spec with the same name is re-added in the same transaction.
        entityManager.flush();
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

    /**
     * Defers Cloudinary cleanup until the surrounding DB transaction settles:
     * replaced assets are deleted only after a successful commit, while a
     * rollback removes the freshly uploaded assets instead — either way the
     * database and Cloudinary never disagree about which images are live.
     */
    private void deferCloudinaryCleanup(List<CloudinaryService.UploadedImage> uploads, List<String> replacedPublicIds) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            cloudinaryService.deleteByPublicIds(replacedPublicIds);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                cloudinaryService.deleteByPublicIds(replacedPublicIds);
            }

            @Override
            public void afterCompletion(int status) {
                if (status == TransactionSynchronization.STATUS_ROLLED_BACK) {
                    cloudinaryService.deleteUploads(uploads);
                }
            }
        });
    }
}
