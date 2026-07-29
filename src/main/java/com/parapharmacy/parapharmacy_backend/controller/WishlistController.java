package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.ProductDTO;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getWishlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistService.getWishlist(user));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> addToWishlist(@AuthenticationPrincipal User user,
                                                              @RequestBody Map<String, Long> body) {
        wishlistService.addToWishlist(user, body.get("productId"));
        return ResponseEntity.ok(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal User user,
                                                    @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(@AuthenticationPrincipal User user,
                                                               @PathVariable Long productId) {
        return ResponseEntity.ok(Map.of("inWishlist", wishlistService.isInWishlist(user, productId)));
    }
}
