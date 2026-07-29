package com.parapharmacy.parapharmacy_backend.dto;

import com.parapharmacy.parapharmacy_backend.entity.PurchaseRequestStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestDto {
    private Long id;
    private SupplierDto supplier;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private PurchaseRequestStatus status;
    private BigDecimal totalAmount;
    private List<PurchaseRequestItemDto> items;
}
