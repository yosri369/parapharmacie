package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO;
import com.parapharmacy.parapharmacy_backend.entity.PromoCode;
import com.parapharmacy.parapharmacy_backend.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PromoCodeService {

    private final PromoCodeRepository promoRepo;

    /** Validate a promo code and compute the discount. Throws on invalid. */
    public PromoCodeDTO validate(String code, BigDecimal orderTotal) {
        PromoCode promo = promoRepo.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Code promo invalide ou expiré."));

        if (promo.getExpiresAt() != null && promo.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce code promo a expiré.");
        }
        if (promo.getMaxUses() != null && promo.getCurrentUses() >= promo.getMaxUses()) {
            throw new RuntimeException("Ce code promo a atteint sa limite d'utilisation.");
        }
        if (promo.getMinOrderAmount() != null && orderTotal.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Montant minimum requis : " + promo.getMinOrderAmount() + " TND.");
        }

        BigDecimal discount = computeDiscount(promo, orderTotal);
        PromoCodeDTO dto = toDTO(promo);
        dto.setDiscountAmount(discount);
        dto.setMessage("Code appliqué — vous économisez " + discount + " TND !");
        return dto;
    }

    /** Increment usage count when order is placed. */
    public void incrementUsage(String code) {
        promoRepo.findByCodeIgnoreCaseAndActiveTrue(code).ifPresent(p -> {
            p.setCurrentUses(p.getCurrentUses() + 1);
            promoRepo.save(p);
        });
    }

    public BigDecimal computeDiscount(PromoCode promo, BigDecimal orderTotal) {
        if (promo.getType() == PromoCode.PromoType.PERCENTAGE) {
            return orderTotal.multiply(promo.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            return promo.getValue().min(orderTotal); // can't discount more than total
        }
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    public List<PromoCodeDTO> getAll() {
        return promoRepo.findAll().stream().map(this::toDTO).toList();
    }

    public PromoCodeDTO create(PromoCodeDTO req) {
        if (promoRepo.existsByCodeIgnoreCase(req.getCode()))
            throw new RuntimeException("Un code promo avec ce nom existe déjà.");
        PromoCode p = PromoCode.builder()
                .code(req.getCode().toUpperCase().trim())
                .type(req.getType())
                .value(req.getValue())
                .minOrderAmount(req.getMinOrderAmount())
                .maxUses(req.getMaxUses())
                .expiresAt(req.getExpiresAt())
                .active(true)
                .description(req.getDescription())
                .build();
        return toDTO(promoRepo.save(p));
    }

    public PromoCodeDTO toggleActive(Long id) {
        PromoCode p = promoRepo.findById(id).orElseThrow();
        p.setActive(!p.isActive());
        return toDTO(promoRepo.save(p));
    }

    public void delete(Long id) {
        promoRepo.deleteById(id);
    }

    private PromoCodeDTO toDTO(PromoCode p) {
        return PromoCodeDTO.builder()
                .id(p.getId())
                .code(p.getCode())
                .type(p.getType())
                .value(p.getValue())
                .minOrderAmount(p.getMinOrderAmount())
                .maxUses(p.getMaxUses())
                .currentUses(p.getCurrentUses())
                .expiresAt(p.getExpiresAt())
                .active(p.isActive())
                .description(p.getDescription())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
