package com.parapharmacy.parapharmacy_backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductCreateRequest {
    private String name;
    private String barcode;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer stock;
    private String imageUrl;
    private List<String> images;
    private Long categoryId;
    private String brand;
    private String tags;
    private boolean featured;
    private boolean onSale;
}
