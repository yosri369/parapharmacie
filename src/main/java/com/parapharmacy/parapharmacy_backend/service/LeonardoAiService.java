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
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Calls the Leonardo AI REST API to generate photorealistic product ads.
 *
 * HOW TO GET YOUR FREE API KEY:
 * 1. Go to https://app.leonardo.ai
 * 2. Sign up (free tier gives ~150 tokens/day)
 * 3. Go to https://app.leonardo.ai/settings -> API Keys
 * 4. Create a key and paste it in application.properties as: leonardo.ai.key=KEY_HERE
 *
 * Models used:
 * - Leonardo Phoenix (best quality, fast): b24e16ff-06e3-43eb-8d33-4416c2d75876
 * - Leonardo Diffusion XL (photorealistic): aa77f04e-3eec-4034-9c07-d0f619684628
 */
@Service
@Slf4j
public class LeonardoAiService {

    private static final String BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";

    // Leonardo Phoenix - best quality for product ads
    private static final String MODEL_ID_PHOENIX  = "b24e16ff-06e3-43eb-8d33-4416c2d75876";
    // Leonardo Diffusion XL - photorealistic
    private static final String MODEL_ID_PHOTO_XL = "aa77f04e-3eec-4034-9c07-d0f619684628";

    @Value("${leonardo.ai.key:YOUR_LEONARDO_AI_KEY_HERE}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Returns true if a real Leonardo API key is configured.
     */
    public boolean isConfigured() {
        return apiKey != null
                && !apiKey.isBlank()
                && !apiKey.equals("YOUR_LEONARDO_AI_KEY_HERE");
    }

    /**
     * Request an upload URL from Leonardo AI's /init-image endpoint.
     * Returns a Map containing: "id", "url", and "fields" (as JSON string).
     */
    public Map<String, String> getPresignedUploadUrl(String extension) {
        try {
            Map<String, String> payload = Map.of("extension", extension);
            String body = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/init-image"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("[Leonardo AI] /init-image failed with {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Leonardo AI init-image failed: " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode uploadNode = root.path("uploadInitImage");

            Map<String, String> result = new LinkedHashMap<>();
            result.put("id", uploadNode.path("id").asText(""));
            result.put("url", uploadNode.path("url").asText(""));
            result.put("fields", uploadNode.path("fields").asText(""));
            
            log.info("[Leonardo AI] Got presigned upload URL. Image ID: {}", result.get("id"));
            return result;
        } catch (Exception e) {
            log.error("[Leonardo AI] Error getting presigned upload URL: {}", e.getMessage(), e);
            throw new RuntimeException("Leonardo AI init-image request failed: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads the image bytes to Leonardo AI's presigned S3 URL using multipart/form-data.
     */
    public void uploadImageToS3(String uploadUrl, String fieldsJson, byte[] imageBytes) {
        try {
            log.info("[Leonardo AI] Uploading {} bytes of product cutout to S3...", imageBytes.length);
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Parse S3 fields JSON
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> fields = mapper.readValue(fieldsJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
            
            // Build multipart request
            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            for (Map.Entry<String, String> entry : fields.entrySet()) {
                body.add(entry.getKey(), entry.getValue());
            }
            
            // Add file bytes - S3 expects file to be the last field
            org.springframework.http.HttpEntity<byte[]> fileEntity = new org.springframework.http.HttpEntity<>(imageBytes, new org.springframework.http.HttpHeaders() {{
                setContentType(org.springframework.http.MediaType.IMAGE_PNG);
            }});
            body.add("file", fileEntity);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
            
            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
            
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(uploadUrl, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[Leonardo AI] Product cutout image successfully uploaded to Leonardo S3.");
            } else {
                throw new RuntimeException("S3 upload returned status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[Leonardo AI] Failed to upload image to S3: {}", e.getMessage(), e);
            throw new RuntimeException("S3 upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a cinematic product ad image using Leonardo AI, incorporating the product image via Image Guidance.
     * This method BLOCKS until the generation is complete (or times out after 3 minutes).
     *
     * @param prompt         The positive prompt for the scene
     * @param negativePrompt What to avoid
     * @param width          Output image width (must be multiple of 8)
     * @param height         Output image height (must be multiple of 8)
     * @param usePhotoReal   If true, uses Leonardo's PhotoReal v2 for maximum realism
     * @param initImageId    Optional initial image ID (uploaded product cutout) for Content Reference guidance
     * @return Public CDN URL of the generated image
     */
    public String generateImage(String prompt, String negativePrompt, int width, int height, boolean usePhotoReal, String initImageId) {
        try {
            log.info("[Leonardo AI] Submitting generation: '{}' | Guidance image ID: {}", 
                    prompt.substring(0, Math.min(80, prompt.length())), initImageId);

            // Snap dimensions to nearest multiple of 8 (Leonardo requirement)
            int w = snapTo8(width);
            int h = snapTo8(height);

            // Build payload
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("prompt", prompt);
            payload.put("negative_prompt", negativePrompt);
            payload.put("modelId", usePhotoReal ? MODEL_ID_PHOENIX : MODEL_ID_PHOTO_XL);
            payload.put("width", w);
            payload.put("height", h);
            payload.put("num_images", 1);
            payload.put("guidance_scale", 7);
            payload.put("alchemy", true);               // Leonardo's proprietary upscaler
            payload.put("highResolution", false);        // Keep false for speed (alchemy handles quality)
            
            if (usePhotoReal) {
                payload.put("photoReal", true);
                payload.put("photoRealVersion", "v2"); // Leonardo PhotoReal v2 = cinematic realism
                payload.put("presetStyle", "CINEMATIC");
            }

            // Apply Content Reference Guidance (ControlNet) if an image ID is supplied
            if (initImageId != null && !initImageId.isBlank()) {
                Map<String, Object> controlnet = new LinkedHashMap<>();
                controlnet.put("initImageId", initImageId);
                controlnet.put("initImageType", "UPLOADED");
                controlnet.put("preprocessorId", 133);  // Content Reference preprocessor ID
                controlnet.put("strengthType", "High"); // Preserve shape and labels
                controlnet.put("weight", 1.0);

                payload.put("controlnets", java.util.List.of(controlnet));
            }

            String body = objectMapper.writeValueAsString(payload);

            // POST /generations – enqueue the job
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/generations"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("[Leonardo AI] Submission error {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Leonardo AI submission failed (" + response.statusCode() + "): " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String generationId = root.path("sdGenerationJob").path("generationId").asText();

            if (generationId == null || generationId.isBlank()) {
                throw new RuntimeException("Leonardo AI returned no generationId: " + response.body());
            }

            log.info("[Leonardo AI] Job queued, generationId={}", generationId);

            // Poll GET /generations/{id} every 3 seconds, up to 60 attempts (3 min)
            return pollForResult(generationId);

        } catch (Exception e) {
            log.error("[Leonardo AI] Error: {}", e.getMessage(), e);
            throw new RuntimeException("Leonardo AI generation failed: " + e.getMessage(), e);
        }
    }

    /** Polls Leonardo until the generation is COMPLETE or times out. */
    private String pollForResult(String generationId) throws Exception {
        int maxAttempts = 60;
        int delayMs = 3000;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            Thread.sleep(delayMs);

            HttpRequest poll = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/generations/" + generationId))
                    .header("Authorization", "Bearer " + apiKey)
                    .GET()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> resp = httpClient.send(poll, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(resp.body());
            JsonNode genNode = root.path("generations_by_pk");

            String status = genNode.path("status").asText("");
            log.debug("[Leonardo AI] Poll {} / {} – status={}", attempt, maxAttempts, status);

            if ("COMPLETE".equalsIgnoreCase(status)) {
                JsonNode imgs = genNode.path("generated_images");
                if (imgs.isArray() && imgs.size() > 0) {
                    String url = imgs.get(0).path("url").asText();
                    log.info("[Leonardo AI] Generation complete! URL={}", url);
                    return url;
                }
                throw new RuntimeException("Leonardo AI returned COMPLETE but no images");
            }

            if ("FAILED".equalsIgnoreCase(status)) {
                throw new RuntimeException("Leonardo AI generation FAILED for id=" + generationId);
            }
        }

        throw new RuntimeException("Leonardo AI generation timed out after " + (maxAttempts * delayMs / 1000) + "s");
    }

    private int snapTo8(int val) {
        return (val / 8) * 8;
    }
}
