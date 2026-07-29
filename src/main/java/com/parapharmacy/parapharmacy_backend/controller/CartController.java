package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.AddToCartRequest;
import com.parapharmacy.parapharmacy_backend.dto.CartItemDTO;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemDTO> addItem(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(cartService.addToCart(user, req));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal User user,
                                        @PathVariable Long itemId,
                                        @RequestBody Map<String, Integer> body) {
        CartItemDTO updated = cartService.updateQuantity(user, itemId, body.get("quantity"));
        if (updated == null) return ResponseEntity.ok(Map.of("message", "Item removed"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal User user, @PathVariable Long itemId) {
        cartService.removeFromCart(user, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
}
