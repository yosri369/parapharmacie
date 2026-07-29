package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCodeIgnoreCaseAndActiveTrue(String code);
    boolean existsByCodeIgnoreCase(String code);
}
