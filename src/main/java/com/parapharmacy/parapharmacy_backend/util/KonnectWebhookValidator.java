package com.parapharmacy.parapharmacy_backend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class KonnectWebhookValidator {

	private static final String ALGORITHM = "HmacSHA256";

	public static boolean isValidSignature(String payload, String signature, String webhookSecret) {
		try {
			Mac mac = Mac.getInstance(ALGORITHM);
			SecretKeySpec keySpec = new SecretKeySpec(
					webhookSecret.getBytes(StandardCharsets.UTF_8),
					0,
					webhookSecret.getBytes(StandardCharsets.UTF_8).length,
					ALGORITHM
			);
			mac.init(keySpec);
			byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
			String computedSignature = Base64.getEncoder().encodeToString(rawHmac);
			return computedSignature.equals(signature);
		} catch (Exception e) {
			return false;
		}
	}
}
