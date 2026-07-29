package com.parapharmacy.parapharmacy_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Calls the fal.ai REST API to run real SDXL image generation on cloud GPUs.
 *
 * HOW TO GET YOUR FREE API KEY:
 * 1. Go to https://fal.ai
 * 2. Sign up (free, no credit card needed for starter credits)
 * 3. Go to https://fal.ai/dashboard/keys
 * 4. Create a key and paste it in application.properties as fal.ai.key=KEY_HERE
 */
@Service
@Slf4j
public class FalAiService {

    @Value("${fal.ai.key}")
    private String falApiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Submits a SDXL image generation request to fal.ai and waits for the result.
     * Uses fal-ai/fast-sdxl which is the fastest free model on fal.ai.
     *
     * @param prompt         The positive prompt describing the scene
     * @param negativePrompt What to avoid in the generation
     * @param imageUrl       Optional image URL for img2img conditioning (the product cutout)
     * @param width          Output image width
     * @param height         Output image height
     * @return The URL of the generated image on fal.ai CDN
     */
    public String generateImage(String prompt, String negativePrompt, String imageUrl, int width, int height) {
        try {
            log.info("Submitting generation to fal.ai: prompt snippet = '{}'", prompt.substring(0, Math.min(80, prompt.length())));

            // Build the request payload
            String payload = objectMapper.writeValueAsString(new java.util.LinkedHashMap<String, Object>() {{
                put("prompt", prompt);
                put("negative_prompt", negativePrompt);
                put("image_size", new java.util.LinkedHashMap<String, Integer>() {{
                    put("width", width);
                    put("height", height);
                }});
                put("num_inference_steps", 28);
                put("guidance_scale", 7.5);
                put("num_images", 1);
                put("enable_safety_checker", false);
            }});

            // POST to fal.ai queue
            // We use fal-ai/fast-sdxl for best speed/quality ratio on free tier
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://fal.run/fal-ai/fast-sdxl"))
                    .header("Authorization", "Key " + falApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .timeout(Duration.ofSeconds(120))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("fal.ai response status: {}", response.statusCode());

            if (response.statusCode() != 200) {
                log.error("fal.ai error response: {}", response.body());
                throw new RuntimeException("fal.ai generation failed with status " + response.statusCode() + ": " + response.body());
            }

            // Parse the result to get the image URL
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode images = root.path("images");

            if (images.isArray() && images.size() > 0) {
                String resultUrl = images.get(0).path("url").asText();
                log.info("fal.ai generation successful. Image URL: {}", resultUrl);
                return resultUrl;
            }

            throw new RuntimeException("fal.ai returned no images in response: " + response.body());

        } catch (Exception e) {
            log.error("fal.ai generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI generation error: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if the fal.ai API key is configured (not the placeholder).
     */
    public boolean isConfigured() {
        return falApiKey != null
                && !falApiKey.isBlank()
                && !falApiKey.equals("YOUR_FAL_AI_KEY_HERE");
    }
}
