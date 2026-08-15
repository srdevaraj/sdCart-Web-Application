package com.sdcart.category;

import com.sdcart.category.dto.CategoryRequest;
import com.sdcart.category.dto.CategoryResponse;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getTree() {
        return categoryRepository.findRootsWithChildren().stream()
                .map(c -> CategoryResponse.from(c, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse get(UUID publicId) {
        return CategoryResponse.from(getEntity(publicId));
    }

    // ------------------------------------------------------------------
    // Admin operations
    // ------------------------------------------------------------------

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String slug = resolveUniqueSlug(request.slug(), request.name(), null);
        Category category = Category.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .sortOrder(request.sortOrder() == null ? 0 : request.sortOrder())
                .active(request.active() == null || request.active())
                .build();
        if (request.parentId() != null) {
            category.setParent(getEntity(request.parentId()));
        }
        Category saved = categoryRepository.save(category);
        log.info("Created category id={} slug={}", saved.getId(), saved.getSlug());
        return CategoryResponse.from(saved);
    }

    @Transactional
    public CategoryResponse update(UUID publicId, CategoryRequest request) {
        Category category = getEntity(publicId);
        String slug = resolveUniqueSlug(request.slug(), request.name(), category.getSlug());
        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }
        if (request.active() != null) {
            category.setActive(request.active());
        }
        if (request.parentId() != null) {
            Category parent = getEntity(request.parentId());
            if (parent.getId().equals(category.getId())) {
                throw new BusinessException("A category cannot be its own parent");
            }
            category.setParent(parent);
        }
        log.info("Updated category id={}", category.getId());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(UUID publicId) {
        Category category = getEntity(publicId);
        categoryRepository.delete(category);
        log.info("Deleted category id={} slug={}", category.getId(), category.getSlug());
    }

    public Category getEntity(UUID publicId) {
        return categoryRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", publicId));
    }

    private String resolveUniqueSlug(String requestedSlug, String name, String currentSlug) {
        String slug = SlugUtils.uniqueSlug(requestedSlug, name);
        if (slug.equals(currentSlug)) {
            return slug;
        }
        if (!categoryRepository.existsBySlug(slug)) {
            return slug;
        }
        throw new BusinessException(HttpStatus.CONFLICT, "A category with slug '" + slug + "' already exists");
    }
}
