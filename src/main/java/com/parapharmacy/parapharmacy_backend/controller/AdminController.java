package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.*;
import com.parapharmacy.parapharmacy_backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserService userService;
    private final BlogService blogService;
    private final PromoCodeService promoCodeService;

    // ── Products ──────────────────────────────────────────────────────────────
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductCreateRequest req) {
        return ResponseEntity.ok(productService.createProduct(req));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductCreateRequest req) {
        return ResponseEntity.ok(productService.updateProduct(id, req));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /** Upload multiple images for a product via Cloudinary */
    @PostMapping("/products/{id}/images")
    public ResponseEntity<ProductDTO> uploadProductImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(productService.addImages(id, files));
    }

    // ── Categories ────────────────────────────────────────────────────────────
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO req) {
        return ResponseEntity.ok(categoryService.createCategory(req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ── Orders ────────────────────────────────────────────────────────────────
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateStatus(id, body.get("status")));
    }

    // ── Users ────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ── Dashboard Stats & Analytics ───────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(orderService.getAnalytics());
    }

    // ── Blog Admin ────────────────────────────────────────────────────────────
    @GetMapping("/blog")
    public ResponseEntity<org.springframework.data.domain.Page<BlogPostDTO>> getAllBlogPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(blogService.getAllPosts(page, size));
    }

    @PostMapping("/blog")
    public ResponseEntity<BlogPostDTO> createBlogPost(@RequestBody BlogPostDTO req) {
        return ResponseEntity.ok(blogService.createPost(req));
    }

    @PutMapping("/blog/{id}")
    public ResponseEntity<BlogPostDTO> updateBlogPost(@PathVariable Long id, @RequestBody BlogPostDTO req) {
        return ResponseEntity.ok(blogService.updatePost(id, req));
    }

    @DeleteMapping("/blog/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // ── Promo Codes ───────────────────────────────────────────────────────────
    @GetMapping("/promo")
    public ResponseEntity<java.util.List<com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO>> getAllPromos() {
        return ResponseEntity.ok(promoCodeService.getAll());
    }

    @PostMapping("/promo")
    public ResponseEntity<com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO> createPromo(
            @RequestBody com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO req) {
        return ResponseEntity.ok(promoCodeService.create(req));
    }

    @PatchMapping("/promo/{id}/toggle")
    public ResponseEntity<com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO> togglePromo(@PathVariable Long id) {
        return ResponseEntity.ok(promoCodeService.toggleActive(id));
    }

    @DeleteMapping("/promo/{id}")
    public ResponseEntity<Void> deletePromo(@PathVariable Long id) {
        promoCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
