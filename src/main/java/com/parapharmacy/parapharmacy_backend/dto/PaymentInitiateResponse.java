package com.parapharmacy.parapharmacy_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {
	private String paymentLink;
	private String transactionId;
	private String message;
}
