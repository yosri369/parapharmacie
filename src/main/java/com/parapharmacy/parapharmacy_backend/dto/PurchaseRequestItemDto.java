package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseRequestItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
}
