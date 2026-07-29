package com.parapharmacy.parapharmacy_backend.dto;

import com.parapharmacy.parapharmacy_backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
	private Long id;
	private Long orderId;
	private BigDecimal amount;
	private PaymentStatus paymentStatus;
	private String konnectTransactionId;
	private String paymentLink;
	private LocalDateTime createdAt;
	private LocalDateTime completedAt;
}
