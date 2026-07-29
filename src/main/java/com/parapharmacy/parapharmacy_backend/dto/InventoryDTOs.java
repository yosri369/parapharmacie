package com.parapharmacy.parapharmacy_backend.dto;

import com.parapharmacy.parapharmacy_backend.entity.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InventoryDTOs {

    @Data
    public static class AddStockRequest {
        private Long productId;
        private String batchNumber;
        private String supplier;
        private BigDecimal purchasePrice;
        private Integer quantity;
        private LocalDate expirationDate;
    }

    @Data
    public static class AdjustStockRequest {
        private Long productId;
        private Long batchId;
        private TransactionType type; // RETURN or DAMAGED
        private Integer quantity;
        private String reason;
    }
}
