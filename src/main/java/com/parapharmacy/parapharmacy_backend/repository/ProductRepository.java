package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    List<Product> findByFeaturedTrueAndActiveTrue();
    List<Product> findByOnSaleTrueAndActiveTrue();
    Optional<Product> findBySlug(String slug);
    Optional<Product> findByBarcode(String barcode);

    @Query("SELECT p FROM Product p WHERE p.active = true AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> searchProducts(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :catId ORDER BY p.rating DESC")
    List<Product> findRelatedProducts(@Param("catId") Long categoryId, Pageable pageable);

    long countByCategoryId(Long categoryId);
}
