package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.ReviewCreateRequest;
import com.parapharmacy.parapharmacy_backend.dto.ReviewDTO;
import com.parapharmacy.parapharmacy_backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId, page, size));
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @PathVariable Long productId,
            @RequestBody @Valid ReviewCreateRequest req) {
        return ResponseEntity.ok(reviewService.createReview(productId, req));
    }
}
