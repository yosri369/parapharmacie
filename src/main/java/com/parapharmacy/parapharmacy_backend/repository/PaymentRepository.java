package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
	Optional<Payment> findByOrderId(Long orderId);

	Optional<Payment> findByKonnectTransactionId(String konnectTransactionId);
}
