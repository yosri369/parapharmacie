package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.MarketingCampaignRequest;
import com.parapharmacy.parapharmacy_backend.entity.GenerationTask;
import com.parapharmacy.parapharmacy_backend.repository.GenerationTaskRepository;
import com.parapharmacy.parapharmacy_backend.service.MarketingStudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/marketing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MarketingStudioController {

    private final MarketingStudioService marketingStudioService;
    private final GenerationTaskRepository generationTaskRepository;

    @PostMapping("/generate")
    public ResponseEntity<?> generateCampaign(@RequestBody MarketingCampaignRequest request) {
        return ResponseEntity.ok(marketingStudioService.enqueueCampaignGeneration(request));
    }

    /** Returns the 40 most recent completed/failed campaigns for the history tab. */
    @GetMapping("/history")
    public ResponseEntity<List<GenerationTask>> getHistory() {
        var page = generationTaskRepository.findAll(
            PageRequest.of(0, 40, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(page.getContent());
    }

    /** Poll a single task status by ID. */
    @GetMapping("/status/{id}")
    public ResponseEntity<GenerationTask> getStatus(@PathVariable UUID id) {
        return generationTaskRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Proxy endpoint: fetches an external image URL server-side and streams it back.
     * This bypasses browser CORS restrictions for images hosted on Pollinations.ai etc.
     * We use a 30-second connect timeout and 60-second read timeout because Pollinations
     * generates images on-the-fly and can be slow.
     * If the external AI service rate-limits or fails, we fall back to a stunning,
     * high-quality premium cosmetic stock image from Unsplash to guarantee a beautiful UI.
     */
    @GetMapping("/proxy-image")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Add a user agent to avoid 403s
            HttpHeaders requestHeaders = new HttpHeaders();
            requestHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestHeaders);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, byte[].class);
            
            byte[] imageBytes = response.getBody();
            if (imageBytes == null) throw new RuntimeException("Empty response");

            HttpHeaders headers = new HttpHeaders();
            MediaType contentType = response.getHeaders().getContentType();
            if (contentType == null) {
                headers.setContentType(MediaType.IMAGE_JPEG);
            } else {
                headers.setContentType(contentType);
            }
            headers.setCacheControl("public, max-age=3600");
            
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("[Proxy Image] Primary fetch failed: " + e.getMessage() + ". Falling back to premium Unsplash backdrop.");
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String fallbackUrl = "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80";
                
                HttpHeaders requestHeaders = new HttpHeaders();
                requestHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestHeaders);
                
                ResponseEntity<byte[]> response = restTemplate.exchange(fallbackUrl, org.springframework.http.HttpMethod.GET, entity, byte[].class);
                byte[] imageBytes = response.getBody();
                if (imageBytes != null) {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.IMAGE_JPEG);
                    headers.setCacheControl("public, max-age=3600");
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}
