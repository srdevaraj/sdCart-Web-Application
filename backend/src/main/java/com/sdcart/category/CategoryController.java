package com.sdcart.category;

import com.sdcart.category.dto.CategoryResponse;
import com.sdcart.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list(
            @RequestParam(defaultValue = "false") boolean tree) {
        List<CategoryResponse> categories = tree
                ? categoryService.getTree()
                : categoryService.listActive();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> get(@PathVariable UUID publicId) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.get(publicId)));
    }
}
