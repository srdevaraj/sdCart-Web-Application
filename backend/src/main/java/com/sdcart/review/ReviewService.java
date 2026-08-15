package com.sdcart.review;

import com.sdcart.common.PageResponse;
import com.sdcart.common.exception.BusinessException;
import com.sdcart.common.exception.ResourceNotFoundException;
import com.sdcart.product.Product;
import com.sdcart.product.ProductRepository;
import com.sdcart.product.ProductStatus;
import com.sdcart.review.dto.ReviewRequest;
import com.sdcart.review.dto.ReviewResponse;
import com.sdcart.review.dto.UpdateReviewRequest;
import com.sdcart.user.User;
import com.sdcart.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Slf4j
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(UUID productPublicId, Pageable pageable) {
        Product product = productRepository.findByPublicId(productPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productPublicId));
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId(), pageable);
        return PageResponse.from(reviews, ReviewResponse::from);
    }

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        Product product = productRepository.findByPublicIdAndStatus(request.productId(), ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));
        if (reviewRepository.existsByUserIdAndProductId(userId, product.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "You have already reviewed this product");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Review review = reviewRepository.save(Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .title(request.title())
                .comment(request.comment())
                .approved(true)
                .build());
        recomputeRating(product);
        log.info("Review id={} created for product id={} by user id={}", review.getId(), product.getId(), userId);
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse updateReview(Long userId, UUID reviewPublicId, UpdateReviewRequest request) {
        Review review = getOwned(userId, reviewPublicId);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setComment(request.comment());
        recomputeRating(review.getProduct());
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long userId, UUID reviewPublicId) {
        Review review = getOwned(userId, reviewPublicId);
        reviewRepository.delete(review);
        recomputeRating(review.getProduct());
        log.info("Review id={} deleted by user id={}", review.getId(), userId);
    }

    private Review getOwned(Long userId, UUID reviewPublicId) {
        Review review = reviewRepository.findByPublicId(reviewPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewPublicId));
        if (!review.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You do not own this review");
        }
        return review;
    }

    private void recomputeRating(Product product) {
        double average = reviewRepository.averageRatingByProductId(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount((int) count);
    }
}
