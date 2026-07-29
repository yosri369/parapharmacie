package com.parapharmacy.parapharmacy_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromoType type; // PERCENTAGE or FIXED_AMOUNT

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value; // e.g. 10 (= 10% or 10 TND)

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount; // minimum cart total to apply

    @Column
    private Integer maxUses; // null = unlimited

    @Builder.Default
    @Column(nullable = false)
    private Integer currentUses = 0;

    private LocalDateTime expiresAt; // null = no expiry

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    private String description; // admin note

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        code = code.toUpperCase().trim();
    }

    public enum PromoType {
        PERCENTAGE, FIXED_AMOUNT
    }
}
