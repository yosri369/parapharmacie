package com.parapharmacy.parapharmacy_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer stock;
    private String imageUrl;
    private List<String> images;
    private Long categoryId;
    private String categoryName;
    private String brand;
    private Double rating;
    private Integer reviewCount;
    private String tags;
    private boolean active;
    private boolean featured;
    private boolean onSale;
    private LocalDateTime createdAt;
}
