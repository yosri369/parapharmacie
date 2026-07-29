package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.ProductDTO;
import com.parapharmacy.parapharmacy_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search, page, size));
        }
        if (category != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(category, page, size, sort));
        }
        return ResponseEntity.ok(productService.getAllProducts(page, size, sort));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/on-sale")
    public ResponseEntity<List<ProductDTO>> getOnSale() {
        return ResponseEntity.ok(productService.getOnSaleProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDTO> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductDTO>> getRelated(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getRelatedProducts(id));
    }

    /** Autocomplete suggestions — lightweight, top 6 matches */
    @GetMapping("/suggestions")
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(productService.getSuggestions(q));
    }
}
