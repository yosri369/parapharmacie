package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.ReviewCreateRequest;
import com.parapharmacy.parapharmacy_backend.dto.ReviewDTO;
import com.parapharmacy.parapharmacy_backend.entity.Product;
import com.parapharmacy.parapharmacy_backend.entity.Review;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import com.parapharmacy.parapharmacy_backend.repository.ReviewRepository;
import com.parapharmacy.parapharmacy_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public Page<ReviewDTO> getReviewsForProduct(Long productId, int page, int size) {
        return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId, PageRequest.of(page, size))
                         .map(this::toDTO);
    }

    @Transactional
    public ReviewDTO createReview(Long productId, ReviewCreateRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        if (reviewRepo.existsByProductIdAndUserId(productId, user.getId())) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(req.getRating())
                .title(req.getTitle())
                .comment(req.getComment())
                .verified(false)
                .build();

        Review saved = reviewRepo.save(review);

        // Update product average rating
        Double avg = reviewRepo.findAverageRatingByProductId(productId);
        long count = reviewRepo.countByProductId(productId);
        if (avg != null) {
            product.setRating(Math.round(avg * 10.0) / 10.0);
            product.setReviewCount((int) count);
            productRepo.save(product);
        }

        return toDTO(saved);
    }

    public boolean hasUserReviewed(Long productId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null) return false;
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return false;
        return reviewRepo.existsByProductIdAndUserId(productId, user.getId());
    }

    private ReviewDTO toDTO(Review r) {
        return ReviewDTO.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .userId(r.getUser().getId())
                .userFirstName(r.getUser().getFirstName())
                .userLastName(r.getUser().getLastName())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .verified(r.isVerified())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
