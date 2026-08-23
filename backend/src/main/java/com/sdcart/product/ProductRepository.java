package com.sdcart.product;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "category", "brand", "specifications"})
    Optional<Product> findByPublicId(UUID publicId);

    @EntityGraph(attributePaths = {"images", "category", "brand", "specifications"})
    Optional<Product> findByPublicIdAndStatus(UUID publicId, ProductStatus status);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @EntityGraph(attributePaths = {"images", "category", "brand"})
    @Query("""
            SELECT p FROM Product p
            WHERE (:status IS NULL OR p.status = :status)
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:brandId IS NULL OR p.brand.id = :brandId)
              AND (:q IS NULL OR :q = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:inStock IS NULL OR :inStock = FALSE OR p.stockQuantity > 0)
              AND (:minPrice IS NULL OR p.price >= :minPrice)
              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
              AND (:featured IS NULL OR :featured = FALSE OR p.featured = TRUE)
            """)
    Page<Product> search(@Param("status") ProductStatus status,
                         @Param("categoryId") Long categoryId,
                         @Param("brandId") Long brandId,
                         @Param("q") String q,
                         @Param("inStock") Boolean inStock,
                         @Param("minPrice") BigDecimal minPrice,
                         @Param("maxPrice") BigDecimal maxPrice,
                         @Param("featured") Boolean featured,
                         Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "brand"})
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "brand"})
    Page<Product> findByBrandId(Long brandId, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "brand"})
    List<Product> findByStatusAndBannerImageIsNotNull(ProductStatus status);

    @EntityGraph(attributePaths = {"images", "category", "brand"})
    List<Product> findByBannerImageIsNotNull();

    /**
     * Locks the product rows so concurrent checkouts cannot oversell stock.
     * The returned instances are the same managed entities already referenced
     * by cart items (same persistence context), so callers validate against
     * and decrement the locked rows.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);
}
