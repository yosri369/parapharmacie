package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.PromoCodeDTO;
import com.parapharmacy.parapharmacy_backend.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/promo")
@RequiredArgsConstructor
public class PromoController {

    private final PromoCodeService promoService;

    /** Public endpoint — validate a promo code before placing order */
    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, Object> body) {
        try {
            String code = (String) body.get("code");
            BigDecimal total = new BigDecimal(body.get("orderTotal").toString());
            PromoCodeDTO result = promoService.validate(code, total);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
