package com.sdcart.brand;

import com.sdcart.brand.dto.BrandRequest;
import com.sdcart.brand.dto.BrandResponse;
import com.sdcart.common.SlugUtils;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Transactional(readOnly = true)
    public List<BrandResponse> listActive() {
        return brandRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(BrandResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse get(UUID publicId) {
        return BrandResponse.from(getEntity(publicId));
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional
    public BrandResponse create(BrandRequest request) {
        String slug = resolveUniqueSlug(request.slug(), request.name(), null);
        Brand brand = Brand.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(request.description())
                .logoUrl(request.logoUrl())
                .active(request.active() == null || request.active())
                .build();
        Brand saved = brandRepository.save(brand);
        log.info("Created brand id={} slug={}", saved.getId(), saved.getSlug());
        return BrandResponse.from(saved);
    }

    @Transactional
    public BrandResponse update(UUID publicId, BrandRequest request) {
        Brand brand = getEntity(publicId);
        String slug = resolveUniqueSlug(request.slug(), request.name(), brand.getSlug());
        brand.setName(request.name().trim());
        brand.setSlug(slug);
        brand.setDescription(request.description());
        brand.setLogoUrl(request.logoUrl());
        if (request.active() != null) {
            brand.setActive(request.active());
        }
        log.info("Updated brand id={}", brand.getId());
        return BrandResponse.from(brand);
    }

    @Transactional
    public void delete(UUID publicId) {
        Brand brand = getEntity(publicId);
        brandRepository.delete(brand);
        log.info("Deleted brand id={} slug={}", brand.getId(), brand.getSlug());
    }

    public Brand getEntity(UUID publicId) {
        return brandRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", publicId));
    }

    private String resolveUniqueSlug(String requestedSlug, String name, String currentSlug) {
        String slug = SlugUtils.uniqueSlug(requestedSlug, name);
        if (slug.equals(currentSlug)) {
            return slug;
        }
        if (!brandRepository.existsBySlug(slug)) {
            return slug;
        }
        throw new BusinessException(HttpStatus.CONFLICT, "A brand with slug '" + slug + "' already exists");
    }
}
