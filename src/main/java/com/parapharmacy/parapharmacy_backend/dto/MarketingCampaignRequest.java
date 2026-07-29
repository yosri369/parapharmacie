package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class MarketingCampaignRequest {
    private Long productId;
    private String format; // Instagram Post, Instagram Story, etc.
    private String style; // Medical, Luxury, Influencer
    private String customImageUrl; // Optional uploaded image
    private int numberOfVariants = 3;
}
