package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.ProductDTO;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.entity.Wishlist;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import com.parapharmacy.parapharmacy_backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public List<ProductDTO> getWishlist(User user) {
        return wishlistRepository.findByUserId(user.getId()).stream()
                .map(w -> productService.toDTO(w.getProduct()))
                .toList();
    }

    public void addToWishlist(User user, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            var product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
        }
    }

    public void removeFromWishlist(User user, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public boolean isInWishlist(User user, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }
}
