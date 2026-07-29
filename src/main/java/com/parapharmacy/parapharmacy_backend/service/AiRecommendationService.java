package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.entity.Product;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiRecommendationService {

    private final ProductRepository productRepository;

    /**
     * MOCK AI Recommendation Engine
     * Later, this will be replaced with a real call to Google Gemini API.
     */
    public List<Product> getRecommendationsForUser(User user) {
        log.info("Generating AI recommendations for user: {} (Age: {}, Gender: {})", user.getEmail(), user.getAge(), user.getGender());

        List<Product> recommendations = new ArrayList<>();
        List<Product> allProducts = productRepository.findAll();
        
        if (allProducts.isEmpty()) {
            return recommendations;
        }

        // Mock AI logic based on Age and Gender for a "Starter Wellness Kit"
        String gender = user.getGender() != null ? user.getGender().toLowerCase() : "unknown";
        int age = user.getAge() != null ? user.getAge() : 30;

        // Everyone gets a Vitamin D supplement as a baseline
        findProductBySlug(allProducts, "vitamine-d3-2000ui", recommendations);

        if (gender.equals("female")) {
            if (age < 35) {
                // Younger female wellness kit
                findProductBySlug(allProducts, "hydra-glow-serum", recommendations);
                findProductBySlug(allProducts, "collagen-beauty-complex", recommendations);
                findProductBySlug(allProducts, "argan-oil-repair-mask", recommendations);
            } else {
                // Mature female wellness kit
                findProductBySlug(allProducts, "retinol-night-repair", recommendations);
                findProductBySlug(allProducts, "rose-petal-moisturizer", recommendations);
                findProductBySlug(allProducts, "collagen-beauty-complex", recommendations);
            }
        } else if (gender.equals("male")) {
            if (age < 35) {
                // Younger male wellness kit
                findProductBySlug(allProducts, "scalp-balance-shampoo", recommendations);
                findProductBySlug(allProducts, "omega-3-fish-oil", recommendations);
                findProductBySlug(allProducts, "spf-50-sunscreen", recommendations);
            } else {
                // Mature male wellness kit
                findProductBySlug(allProducts, "magnesium-glycinate-400mg", recommendations);
                findProductBySlug(allProducts, "omega-3-fish-oil", recommendations);
                findProductBySlug(allProducts, "scalp-balance-shampoo", recommendations);
            }
        } else {
            // Generic fallback wellness kit
            findProductBySlug(allProducts, "lavender-relaxation-oil", recommendations);
            findProductBySlug(allProducts, "omega-3-fish-oil", recommendations);
            findProductBySlug(allProducts, "spf-50-sunscreen", recommendations);
        }

        log.info("AI suggested {} products.", recommendations.size());
        return recommendations;
    }

    private void findProductBySlug(List<Product> allProducts, String slug, List<Product> recommendations) {
        allProducts.stream()
                .filter(p -> p.getSlug().equals(slug))
                .findFirst()
                .ifPresent(recommendations::add);
    }
}
