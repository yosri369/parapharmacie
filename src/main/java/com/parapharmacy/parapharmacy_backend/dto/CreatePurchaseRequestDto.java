package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreatePurchaseRequestDto {
    private Long supplierId;
    private List<ItemPayload> items;

    @Data
    public static class ItemPayload {
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}
