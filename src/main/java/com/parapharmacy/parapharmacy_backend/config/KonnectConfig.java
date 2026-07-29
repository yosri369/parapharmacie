package com.parapharmacy.parapharmacy_backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "konnect")
@Data
public class KonnectConfig {
	private String apiKey;
	private String apiSecret;
	private String apiUrl;
	private String webhookSecret;
	private String returnUrl;
}
