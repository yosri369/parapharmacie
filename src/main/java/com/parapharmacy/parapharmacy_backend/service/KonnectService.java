package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.config.KonnectConfig;
import com.parapharmacy.parapharmacy_backend.dto.PaymentInitiateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KonnectService {

	private final KonnectConfig konnectConfig;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	public PaymentInitiateResponse createPayment(BigDecimal amount, Long orderId, String customerEmail) {
		try {
			Map<String, Object> payload = new HashMap<>();
			payload.put("receiverWalletId", "1234567890"); // Merchant wallet ID - configure this
			payload.put("amount", amount.intValue() * 1000); // Konnect expects amount in millimes
			payload.put("orderId", orderId.toString());
			payload.put("customerEmail", customerEmail);
			payload.put("type", "immediate");
			payload.put("description", "Parapharmacy Order Payment");
			payload.put("returnUrl", konnectConfig.getReturnUrl());

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.set("Authorization", "Bearer " + konnectConfig.getApiKey());

			HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

			String response = restTemplate.postForObject(
					konnectConfig.getApiUrl() + "/api/v2/payments/init-payment",
					request,
					String.class
			);

			JsonNode responseNode = objectMapper.readTree(response);

			if (responseNode.has("paymentUrl") && responseNode.has("paymentRef")) {
				return new PaymentInitiateResponse(
						responseNode.get("paymentUrl").asText(),
						responseNode.get("paymentRef").asText(),
						"Payment link generated successfully"
				);
			} else {
				log.error("Unexpected Konnect response: {}", response);
				return null;
			}
		} catch (Exception e) {
			log.error("Error creating payment with Konnect", e);
			return null;
		}
	}

	public String getPaymentStatus(String transactionId) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", "Bearer " + konnectConfig.getApiKey());

			HttpEntity<String> request = new HttpEntity<>(headers);

			String response = restTemplate.getForObject(
					konnectConfig.getApiUrl() + "/api/v2/payments/" + transactionId,
					String.class
			);

			JsonNode responseNode = objectMapper.readTree(response);
			return responseNode.get("status").asText();
		} catch (Exception e) {
			log.error("Error fetching payment status from Konnect", e);
			return null;
		}
	}
}
