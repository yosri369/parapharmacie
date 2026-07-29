package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MarketingCampaignVariant {
    private String backgroundImageUrl;
    private String productCutoutUrl;
    private String headline;
    private String caption;
    private List<String> hashtags;
}
