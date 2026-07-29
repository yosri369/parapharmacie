package com.parapharmacy.parapharmacy_backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private BigDecimal productSalePrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stock;
}
