package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.AddToCartRequest;
import com.parapharmacy.parapharmacy_backend.dto.CartItemDTO;
import com.parapharmacy.parapharmacy_backend.entity.CartItem;
import com.parapharmacy.parapharmacy_backend.entity.Product;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.repository.CartRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public List<CartItemDTO> getCart(User user) {
        return cartRepository.findByUserId(user.getId()).stream().map(this::toDTO).toList();
    }

    public CartItemDTO addToCart(User user, AddToCartRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Optional<CartItem> existing = cartRepository.findByUserIdAndProductId(user.getId(), product.getId());
        CartItem item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setQuantity(item.getQuantity() + req.getQuantity());
        } else {
            item = CartItem.builder().user(user).product(product).quantity(req.getQuantity()).build();
        }
        return toDTO(cartRepository.save(item));
    }

    public CartItemDTO updateQuantity(User user, Long itemId, int quantity) {
        CartItem item = cartRepository.findById(itemId)
                .filter(i -> i.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity <= 0) {
            cartRepository.delete(item);
            return null;
        }
        item.setQuantity(quantity);
        return toDTO(cartRepository.save(item));
    }

    public void removeFromCart(User user, Long itemId) {
        CartItem item = cartRepository.findById(itemId)
                .filter(i -> i.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartRepository.delete(item);
    }

    public void clearCart(User user) {
        cartRepository.deleteByUserId(user.getId());
    }

    private CartItemDTO toDTO(CartItem item) {
        Product p = item.getProduct();
        BigDecimal effectivePrice = p.getSalePrice() != null ? p.getSalePrice() : p.getPrice();
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImage(p.getImageUrl())
                .productPrice(p.getPrice())
                .productSalePrice(p.getSalePrice())
                .quantity(item.getQuantity())
                .subtotal(effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .stock(p.getStock())
                .build();
    }
}
