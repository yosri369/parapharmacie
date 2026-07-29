package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.config.KonnectConfig;
import com.parapharmacy.parapharmacy_backend.dto.PaymentDTO;
import com.parapharmacy.parapharmacy_backend.service.PaymentService;
import com.parapharmacy.parapharmacy_backend.util.KonnectWebhookValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

	private final PaymentService paymentService;
	private final KonnectConfig konnectConfig;
	private final ObjectMapper objectMapper;

	@PostMapping("/webhook")
	public ResponseEntity<String> handleKonnectWebhook(
			@RequestBody String payload,
			@RequestHeader("X-Konnect-Signature") String signature) {

		try {
			if (!KonnectWebhookValidator.isValidSignature(payload, signature, konnectConfig.getWebhookSecret())) {
				log.warn("Invalid webhook signature received");
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid signature");
			}

			JsonNode webhookData = objectMapper.readTree(payload);

			String status = webhookData.get("status").asText();
			String transactionId = webhookData.get("paymentRef").asText();

			if ("success".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
				paymentService.confirmPayment(transactionId);
				log.info("Payment confirmed via webhook for transaction ID: {}", transactionId);
				return ResponseEntity.ok("Payment confirmed");
			} else {
				log.warn("Payment failed for transaction ID: {} with status: {}", transactionId, status);
				return ResponseEntity.ok("Payment failed");
			}

		} catch (Exception e) {
			log.error("Error processing Konnect webhook", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
		}
	}

	@GetMapping("/{orderId}/status")
	public ResponseEntity<PaymentDTO> getPaymentStatus(@PathVariable Long orderId) {
		PaymentDTO paymentDTO = paymentService.getPaymentStatus(orderId);

		if (paymentDTO == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(paymentDTO);
	}
}
