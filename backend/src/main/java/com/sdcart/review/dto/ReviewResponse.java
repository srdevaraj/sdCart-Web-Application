package com.sdcart.review.dto;

import com.sdcart.review.Review;
import com.sdcart.user.dto.UserSummaryResponse;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID publicId,
        UserSummaryResponse user,
        UUID productId,
        int rating,
        String title,
        String comment,
        boolean approved,
        Instant createdAt,
        Instant updatedAt) {

    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getPublicId(),
                UserSummaryResponse.from(review.getUser()),
                review.getProduct().getPublicId(),
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.isApproved(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
