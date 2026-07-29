package com.parapharmacy.parapharmacy_backend.dto;

import com.parapharmacy.parapharmacy_backend.entity.PromoCode;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PromoCodeDTO {
    private Long id;
    private String code;
    private PromoCode.PromoType type;
    private BigDecimal value;
    private BigDecimal minOrderAmount;
    private Integer maxUses;
    private Integer currentUses;
    private LocalDateTime expiresAt;
    private boolean active;
    private String description;
    private LocalDateTime createdAt;

    // Returned on validate — how much is saved
    private BigDecimal discountAmount;
    private String message;
}
