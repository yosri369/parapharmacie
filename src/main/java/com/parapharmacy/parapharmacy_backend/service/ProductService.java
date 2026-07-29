package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.ProductCreateRequest;
import com.parapharmacy.parapharmacy_backend.dto.ProductDTO;
import com.parapharmacy.parapharmacy_backend.entity.Category;
import com.parapharmacy.parapharmacy_backend.entity.Product;
import com.parapharmacy.parapharmacy_backend.repository.CategoryRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;

    public Page<ProductDTO> getAllProducts(int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return productRepository.findByActiveTrue(pageable).map(this::toDTO);
    }

    public Page<ProductDTO> getProductsByCategory(Long categoryId, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toDTO);
    }

    public Page<ProductDTO> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rating").descending());
        return productRepository.searchProducts(query, pageable).map(this::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .filter(p -> p.isActive())
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductDTO getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .filter(p -> p.isActive())
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue().stream().map(this::toDTO).toList();
    }

    public List<ProductDTO> getOnSaleProducts() {
        return productRepository.findByOnSaleTrueAndActiveTrue().stream().map(this::toDTO).toList();
    }

    public List<ProductDTO> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId).orElseThrow();
        return productRepository.findRelatedProducts(product.getCategory().getId(),
                PageRequest.of(0, 6)).stream().map(this::toDTO).toList();
    }

    @Transactional
    public ProductDTO createProduct(ProductCreateRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Product product = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .salePrice(req.getSalePrice())
                .stock(req.getStock())
                .imageUrl(req.getImageUrl())
                .images(req.getImages())
                .category(category)
                .brand(req.getBrand())
                .tags(req.getTags())
                .featured(req.isFeatured())
                .onSale(req.isOnSale())
                .active(true)
                .build();
        return toDTO(productRepository.save(product));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductCreateRequest req) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getSalePrice() != null) product.setSalePrice(req.getSalePrice());
        if (req.getStock() != null) product.setStock(req.getStock());
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());
        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId()).orElseThrow();
            product.setCategory(cat);
        }
        product.setFeatured(req.isFeatured());
        product.setOnSale(req.isOnSale());
        return toDTO(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductDTO addImages(Long productId, List<MultipartFile> files) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<String> existing = product.getImages() == null ? new ArrayList<>() : new ArrayList<>(product.getImages());
        for (MultipartFile file : files) {
            String url = cloudinaryService.uploadProductImage(file);
            if (url != null && !url.isBlank()) existing.add(url);
        }
        product.setImages(existing);
        return toDTO(productRepository.save(product));
    }

    public List<Map<String, Object>> getSuggestions(String q) {
        if (q == null || q.trim().length() < 2) return List.of();
        Pageable top6 = PageRequest.of(0, 6, Sort.by("rating").descending());
        return productRepository.searchProducts(q.trim(), top6).getContent().stream()
                .map(p -> Map.<String, Object>of(
                        "id",       p.getId(),
                        "name",     p.getName(),
                        "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "",
                        "price",    p.getSalePrice() != null ? p.getSalePrice() : p.getPrice(),
                        "slug",     p.getSlug() != null ? p.getSlug() : p.getId().toString()
                )).toList();
    }

    public ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .salePrice(p.getSalePrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .images(p.getImages())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brand(p.getBrand())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .tags(p.getTags())
                .active(p.isActive())
                .featured(p.isFeatured())
                .onSale(p.isOnSale())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private Sort parseSort(String sort) {
        if (sort == null) return Sort.by("createdAt").descending();
        return switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending();
        };
    }
}
