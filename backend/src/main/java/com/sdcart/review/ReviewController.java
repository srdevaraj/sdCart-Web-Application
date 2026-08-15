package com.sdcart.review;

import com.sdcart.common.ApiResponse;
import com.sdcart.common.PageResponse;
import com.sdcart.review.dto.ReviewRequest;
import com.sdcart.review.dto.ReviewResponse;
import com.sdcart.review.dto.UpdateReviewRequest;
import com.sdcart.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productPublicId}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> productReviews(
            @PathVariable UUID productPublicId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getProductReviews(productPublicId, pageable)));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.createReview(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Review submitted", review));
    }

    @PutMapping("/reviews/{reviewPublicId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(@PathVariable UUID reviewPublicId,
                                                              @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Review updated",
                reviewService.updateReview(SecurityUtils.currentUserId(), reviewPublicId, request)));
    }

    @DeleteMapping("/reviews/{reviewPublicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID reviewPublicId) {
        reviewService.deleteReview(SecurityUtils.currentUserId(), reviewPublicId);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted"));
    }
}
