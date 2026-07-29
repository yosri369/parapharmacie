package com.parapharmacy.parapharmacy_backend.service;

import org.springframework.stereotype.Service;

/**
 * Builds highly optimized, cinematic prompts for SDXL based on
 * product name, brand, and chosen campaign style.
 *
 * Prompt strategy follows the "Nano Banana / Flair.ai" approach:
 * - Anchors the product in a specific environment
 * - Specifies lighting direction and quality
 * - References established photography/ad aesthetics
 * - Uses strong negative prompts to kill amateur-looking artifacts
 */
@Service
public class PromptEngineeringService {

    private static final String GLOBAL_QUALITY_SUFFIX =
            ", professional commercial photography, 8k resolution, " +
            "ultra-realistic, hyperdetailed, shot on Hasselblad H6D, " +
            "award-winning advertisement, perfect composition, " +
            "cinematic color grading, photorealistic, tack sharp focus";

    private static final String GLOBAL_NEGATIVE =
            "illustration, painting, 3d render, cartoon, anime, " +
            "blurry, low quality, distorted, deformed, ugly, noise, " +
            "grain, oversaturated, amateur photo, stock photo, watermark, " +
            "text on image, logo, signature, bad anatomy, floating objects, " +
            "unnatural shadows, flat lighting, overexposed, dark, muddy colors";

    // Leonardo AI-specific quality suffix (optimized for PhotoReal v2 & Alchemy)
    private static final String LEONARDO_QUALITY_SUFFIX =
            ", cinematic product advertisement, editorial photography, " +
            "f/1.8 aperture, perfect bokeh, commercial lighting, " +
            "Vogue magazine quality, luxury brand campaign, 4k uhd";

    /**
     * Builds the positive SDXL prompt for a given style.
     */
    public String buildPositivePrompt(String productName, String brandName, String style, int variantIndex) {
        String subject = String.format(
            "A single bottle of %s skincare product by %s",
            productName, brandName != null ? brandName : "a premium brand"
        );

        switch (style.toLowerCase()) {
            case "luxury":
                return buildLuxuryPrompt(subject, variantIndex);
            case "medical":
                return buildMedicalPrompt(subject, variantIndex);
            case "cinematic":
                return buildCinematicPrompt(subject, variantIndex);
            case "influencer":
            default:
                return buildInfluencerPrompt(subject, variantIndex);
        }
    }

    /**
     * Returns the universal negative prompt to avoid all amateur artifacts.
     */
    public String buildNegativePrompt() {
        return GLOBAL_NEGATIVE;
    }

    // ─── Luxury Style ────────────────────────────────────────────────────────

    private String buildLuxuryPrompt(String subject, int index) {
        String[] luxuryScenes = {
            // Variant 0 – Dark marble with dramatic rim lighting
            subject + " centered on a dark black marble pedestal, " +
            "dramatic golden rim lighting from behind, soft bokeh background, " +
            "black marble veins texture, luxury perfume ad aesthetic, " +
            "Chanel advertisement style, deep shadows, one sharp spotlight, " +
            "product perfectly lit, reflective marble surface" + GLOBAL_QUALITY_SUFFIX,

            // Variant 1 – Gold and velvet editorial
            subject + " resting on a deep burgundy velvet surface, " +
            "surrounded by scattered gold leaf flakes and rose petals, " +
            "warm editorial lighting, luxury magazine spread, Vogue aesthetic, " +
            "shallow depth of field, golden hour ambient glow" + GLOBAL_QUALITY_SUFFIX,

            // Variant 2 – Minimalist frosted glass pedestal
            subject + " on a frosted white glass geometric pedestal, " +
            "clean white studio background with subtle gradient, " +
            "dramatic single overhead studio light, crystal clear reflections, " +
            "Dior skincare campaign style, minimalist luxury, cool-toned aesthetic" + GLOBAL_QUALITY_SUFFIX
        };

        return luxuryScenes[index % luxuryScenes.length];
    }

    // ─── Medical / Clinical Style ─────────────────────────────────────────────

    private String buildMedicalPrompt(String subject, int index) {
        String[] medicalScenes = {
            // Variant 0 – Clean lab environment
            subject + " centered on a clean white laboratory bench, " +
            "bright diffused clinical lighting, sterile white and light blue tones, " +
            "out-of-focus medical equipment in background, " +
            "pharmaceutical advertisement style, La Roche-Posay campaign aesthetic, " +
            "crisp sharp product detail, antiseptic clean environment" + GLOBAL_QUALITY_SUFFIX,

            // Variant 1 – Scientific minimal
            subject + " on a pristine white acrylic surface, " +
            "clean gradient background from white to soft blue, " +
            "scientific minimalism, Avène dermatologist aesthetic, " +
            "perfect soft studio lighting, medical precision, " +
            "subtle reflection in acrylic surface" + GLOBAL_QUALITY_SUFFIX,

            // Variant 2 – Nature + science fusion
            subject + " surrounded by fresh aloe vera leaves and white flowers, " +
            "bright airy natural light, white background, " +
            "clinical-organic aesthetic, CeraVe campaign style, " +
            "natural ingredients flat lay composition, clean and fresh" + GLOBAL_QUALITY_SUFFIX
        };

        return medicalScenes[index % medicalScenes.length];
    }

    // ─── Influencer / TikTok Style ────────────────────────────────────────────

    private String buildInfluencerPrompt(String subject, int index) {
        String[] influencerScenes = {
            // Variant 0 – Morning bathroom aesthetic
            subject + " next to a filled glass of water with lemon slices, " +
            "cozy bathroom shelf, morning soft sunlight through window, " +
            "warm pastel tones, TikTok skincare routine aesthetic, " +
            "lifestyle influencer flat lay, cozy home vibe, " +
            "blurred plants in background" + GLOBAL_QUALITY_SUFFIX,

            // Variant 1 – Aesthetic pastel table
            subject + " on a beige linen textured surface, " +
            "surrounded by eucalyptus leaves and a small ceramic tray, " +
            "warm morning light casting soft shadows, " +
            "Pinterest aesthetic, Instagram worthy, neutral tones, " +
            "lifestyle product photography" + GLOBAL_QUALITY_SUFFIX,

            // Variant 2 – Outdoor golden hour
            subject + " on a white wooden outdoor table, " +
            "golden hour sunlight, bokeh green nature background, " +
            "summer lifestyle ad, happy fresh aesthetic, " +
            "influencer marketing visual, trendy and vibrant" + GLOBAL_QUALITY_SUFFIX
        };

        return influencerScenes[index % influencerScenes.length];
    }

    // ─── Cinematic / Commercial Style (Leonardo AI Optimized) ─────────────────

    private String buildCinematicPrompt(String subject, int index) {
        String[] cinematicScenes = {
            // Variant 0 – Hero shot with volumetric light rays
            subject + " centered in a dark cinematic studio, " +
            "dramatic volumetric light rays cutting through smoke/mist from above, " +
            "deep teal and gold color palette, cinematic split lighting, " +
            "product hero shot style, Lamborghini ad aesthetic, " +
            "hyper-realistic product photography, intense atmosphere" + LEONARDO_QUALITY_SUFFIX,

            // Variant 1 – Neon cyberpunk luxury
            subject + " on a reflective dark surface, " +
            "surrounded by bokeh neon lights in purple and gold, " +
            "futuristic luxury aesthetic, cyberpunk color grading, " +
            "Apple product launch aesthetic, dark background with glowing accents, " +
            "perfect reflections on the surface" + LEONARDO_QUALITY_SUFFIX,

            // Variant 2 – Outdoor cinematic golden hour
            subject + " in an outdoor cinematic setting, " +
            "stunning golden hour sunset in background, lens flare, " +
            "bokeh nature scene, dramatic sky with warm orange and pink clouds, " +
            "Perfume commercial aesthetic, outdoor luxury lifestyle, " +
            "shot on RED Cinema camera, film grain, anamorphic lens" + LEONARDO_QUALITY_SUFFIX
        };

        return cinematicScenes[index % cinematicScenes.length];
    }
}
