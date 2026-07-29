package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.MarketingCampaignRequest;
import com.parapharmacy.parapharmacy_backend.entity.GenerationTask;
import com.parapharmacy.parapharmacy_backend.entity.Product;
import com.parapharmacy.parapharmacy_backend.repository.GenerationTaskRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MarketingStudioService {

    private final ProductRepository productRepository;
    private final GenerationTaskRepository taskRepository;
    private final FalAiService falAiService;
    private final LeonardoAiService leonardoAiService;
    private final PromptEngineeringService promptEngineeringService;
    private final WebSocketNotificationService wsService;
    private final Executor aiGenerationExecutor;

    public MarketingStudioService(
            ProductRepository productRepository,
            GenerationTaskRepository taskRepository,
            FalAiService falAiService,
            LeonardoAiService leonardoAiService,
            PromptEngineeringService promptEngineeringService,
            WebSocketNotificationService wsService,
            @Qualifier("aiGenerationExecutor") Executor aiGenerationExecutor) {
        this.productRepository = productRepository;
        this.taskRepository = taskRepository;
        this.falAiService = falAiService;
        this.leonardoAiService = leonardoAiService;
        this.promptEngineeringService = promptEngineeringService;
        this.wsService = wsService;
        this.aiGenerationExecutor = aiGenerationExecutor;
    }

    /**
     * Enqueues generation tasks and returns their tracking UUIDs.
     * The actual generation happens asynchronously.
     */
    public List<UUID> enqueueCampaignGeneration(MarketingCampaignRequest request) {
        Product product = productRepository.findByIdWithCategory(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        log.info("Queueing marketing campaign for product: {} | Style: {} | Format: {}",
                product.getName(), request.getStyle(), request.getFormat());

        String origUrl = request.getCustomImageUrl() != null && !request.getCustomImageUrl().trim().isEmpty()
                ? request.getCustomImageUrl()
                : product.getImageUrl();

        if (origUrl == null || origUrl.trim().isEmpty()) {
            throw new RuntimeException("Veuillez uploader une image ou utiliser un produit avec une image valide.");
        }

        List<UUID> taskIds = new ArrayList<>();

        for (int i = 0; i < request.getNumberOfVariants(); i++) {
            // 1. Generate Product Cutout via Cloudinary if applicable, else fall back to original
            String productCutoutUrl = origUrl;
            if (origUrl.contains("/upload/")) {
                String[] parts = origUrl.split("/upload/");
                String transformation = "e_background_removal,c_pad,w_800,h_800";
                productCutoutUrl = parts[0] + "/upload/" + transformation + "/" + parts[1];
            }

            // 2. Build the task entity
            GenerationTask task = GenerationTask.builder()
                    .productId(product.getId())
                    .style(request.getStyle())
                    .format(request.getFormat())
                    .variantIndex(i)
                    .status(GenerationTask.GenerationStatus.PENDING)
                    .sourceImageUrl(origUrl)
                    .cutoutUrl(productCutoutUrl)
                    .build();

            task = taskRepository.save(task);
            final UUID savedTaskId = task.getId();
            taskIds.add(savedTaskId);

            // 3. Fire the async worker on the dedicated thread pool
            // We wrap in a try-catch so one variant failure doesn't affect others
            final String finalCutoutUrl = productCutoutUrl;
            CompletableFuture.runAsync(() -> {
                processGenerationTask(savedTaskId, product, finalCutoutUrl);
            }, aiGenerationExecutor);
        }

        return taskIds;
    }

    /**
     * The async worker that actually calls the AI and updates the DB / WebSocket.
     */
    public void processGenerationTask(UUID taskId, Product product, String cutoutUrl) {
        GenerationTask task = taskRepository.findById(taskId).orElseThrow();
        try {
            // IMPORTANT: Wait 2.5 seconds for the Angular client to subscribe to the
            // WebSocket topic before we send the first progress event.
            // Without this, STOMP messages sent immediately are lost (no subscriber yet).
            Thread.sleep(2500);

            // 1. Update status to PROCESSING
            task.setStatus(GenerationTask.GenerationStatus.PROCESSING);
            taskRepository.save(task);
            wsService.sendProgress(taskId, "Détourage du produit...", 10, "PROCESSING");

            // Check AI engine priority: Leonardo > Fal.ai > Mock
            if (leonardoAiService.isConfigured()) {
                runWithLeonardo(task, product, cutoutUrl, taskId);
            } else if (falAiService.isConfigured()) {
                runWithFalAi(task, product, cutoutUrl, taskId);
            } else {
                log.warn("No AI API key configured. Using mock FLUX generation.");
                simulateMockGeneration(task, product, cutoutUrl);
            }

        } catch (Exception e) {
            log.error("Task {} failed: {}", taskId, e.getMessage(), e);
            task.setStatus(GenerationTask.GenerationStatus.FAILED);
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
            wsService.sendError(taskId, e.getMessage());
        }
    }

    private void runWithLeonardo(GenerationTask task, Product product, String cutoutUrl, UUID taskId) throws Exception {
        wsService.sendProgress(taskId, "Génération des prompts IA (Leonardo)...", 12, "PROCESSING");
        String prompt = promptEngineeringService.buildPositivePrompt(
                product.getName(), product.getBrand(), task.getStyle(), task.getVariantIndex());
        String negativePrompt = promptEngineeringService.buildNegativePrompt();
        task.setGeneratedPrompt(prompt);
        taskRepository.save(task);

        int width = 1024, height = 1024;
        if ("Instagram Story".equalsIgnoreCase(task.getFormat())) { height = 1280; }
        else if ("Facebook Post".equalsIgnoreCase(task.getFormat())) { width = 1200; height = 628; }

        byte[] cutoutBytes = null;
        String initImageId = null;

        try {
            wsService.sendProgress(taskId, "Téléchargement du produit détouré...", 20, "PROCESSING");
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            cutoutBytes = restTemplate.getForObject(cutoutUrl, byte[].class);
        } catch (Exception e) {
            log.error("Failed to download product cutout image from: " + cutoutUrl, e);
            // Graceful fallback: we will proceed with text-to-image without guidance if downloading fails
        }

        if (cutoutBytes != null && cutoutBytes.length > 0) {
            try {
                wsService.sendProgress(taskId, "Préparation du téléversement vers Leonardo...", 30, "PROCESSING");
                // Request init-image upload destination from Leonardo AI
                Map<String, String> uploadDetails = leonardoAiService.getPresignedUploadUrl("png");
                initImageId = uploadDetails.get("id");
                String uploadUrl = uploadDetails.get("url");
                String fieldsJson = uploadDetails.get("fields");

                wsService.sendProgress(taskId, "Téléversement du produit vers l'IA...", 40, "PROCESSING");
                // Perform S3 multipart upload
                leonardoAiService.uploadImageToS3(uploadUrl, fieldsJson, cutoutBytes);
            } catch (Exception e) {
                log.error("Failed to upload product cutout to Leonardo AI, falling back to text-only generation", e);
                // Graceful fallback: proceed with text-to-image without guidance
            }
        }

        wsService.sendProgress(taskId, "Rendu Leonardo AI (PhotoReal v2)...", 55, "PROCESSING");
        boolean useCinematic = "cinematic".equalsIgnoreCase(task.getStyle());
        String resultUrl = leonardoAiService.generateImage(prompt, negativePrompt, width, height, useCinematic, initImageId);

        wsService.sendProgress(taskId, "Génération du texte marketing...", 85, "PROCESSING");
        finalizeTask(task, product, resultUrl, cutoutUrl, taskId);
    }

    private void runWithFalAi(GenerationTask task, Product product, String cutoutUrl, UUID taskId) throws Exception {
        wsService.sendProgress(taskId, "Génération des prompts IA (SDXL)...", 20, "PROCESSING");
        String prompt = promptEngineeringService.buildPositivePrompt(
                product.getName(), product.getBrand(), task.getStyle(), task.getVariantIndex());
        String negativePrompt = promptEngineeringService.buildNegativePrompt();
        task.setGeneratedPrompt(prompt);
        taskRepository.save(task);

        int width = 1080, height = 1080;
        if ("Instagram Story".equalsIgnoreCase(task.getFormat())) { height = 1350; }
        else if ("Facebook Post".equalsIgnoreCase(task.getFormat())) { width = 1200; height = 630; }

        wsService.sendProgress(taskId, "Rendu AI de la scène (SDXL)...", 40, "PROCESSING");
        String resultUrl = falAiService.generateImage(prompt, negativePrompt, null, width, height);

        wsService.sendProgress(taskId, "Génération du texte marketing...", 85, "PROCESSING");
        finalizeTask(task, product, resultUrl, cutoutUrl, taskId);
    }

    private void finalizeTask(GenerationTask task, Product product, String resultUrl, String cutoutUrl, UUID taskId) {
        String headline = generateHeadline(product, task.getStyle(), task.getVariantIndex());
        String caption = generateCaption(product, task.getStyle(), task.getVariantIndex());
        List<String> hashtags = generateHashtags(product, task.getStyle());

        task.setHeadline(headline);
        task.setCaption(caption);
        task.setHashtags(String.join(" ", hashtags));
        task.setResultImageUrl(resultUrl);
        task.setStatus(GenerationTask.GenerationStatus.COMPLETED);
        taskRepository.save(task);

        wsService.sendCompletion(taskId, resultUrl, headline, caption, String.join(" ", hashtags), cutoutUrl);
    }

    private void simulateMockGeneration(GenerationTask task, Product product, String cutoutUrl) throws InterruptedException {
        // Stagger generation variants to prevent concurrent API rate limiting (402 Payment Required) from Pollinations.ai
        int staggerDelay = task.getVariantIndex() * 4000;
        if (staggerDelay > 0) {
            log.info("Staggering mock generation variant {} by {}ms to avoid rate limit", task.getVariantIndex(), staggerDelay);
            Thread.sleep(staggerDelay);
        }

        wsService.sendProgress(task.getId(), "Génération du prompt Nano-Banana...", 20, "PROCESSING");
        
        String prompt = promptEngineeringService.buildPositivePrompt(
                product.getName(), product.getBrand(), task.getStyle(), task.getVariantIndex());
        task.setGeneratedPrompt(prompt);
        taskRepository.save(task);
        
        Thread.sleep(1000);
        wsService.sendProgress(task.getId(), "Rendu de la scène en cours (FLUX)...", 55, "PROCESSING");
        
        int width = 1080;
        int height = 1080;
        if ("Instagram Story".equalsIgnoreCase(task.getFormat())) {
            height = 1350;
        } else if ("Facebook Post".equalsIgnoreCase(task.getFormat())) {
            width = 1200;
            height = 630;
        }
        
        String encodedPrompt = "";
        try {
            encodedPrompt = java.net.URLEncoder.encode(prompt, java.nio.charset.StandardCharsets.UTF_8.toString())
                    .replace("+", "%20");
        } catch (Exception e) {
            encodedPrompt = prompt.replaceAll("\\s+", "%20");
        }
        
        // Call Pollinations.ai using the state-of-the-art FLUX model for stunning photorealistic quality!
        String pollinationsUrl = "https://image.pollinations.ai/p/" + encodedPrompt 
                + "?width=" + width + "&height=" + height + "&nologo=true&private=true&model=flux&seed=" 
                + (System.currentTimeMillis() + task.getVariantIndex() * 100);
        
        // Proxy the external image through our backend to bypass browser CORS restrictions perfectly
        String proxiedUrl = pollinationsUrl;
        try {
            proxiedUrl = "http://localhost:8081/api/admin/marketing/proxy-image?url=" 
                    + java.net.URLEncoder.encode(pollinationsUrl, java.nio.charset.StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            log.error("Failed to encode proxy url", e);
        }

        Thread.sleep(1500);
        wsService.sendProgress(task.getId(), "Composition finale et texte...", 80, "PROCESSING");
        
        String headline = generateHeadline(product, task.getStyle(), task.getVariantIndex());
        String caption = generateCaption(product, task.getStyle(), task.getVariantIndex());
        List<String> hashtags = generateHashtags(product, task.getStyle());

        task.setHeadline(headline);
        task.setCaption(caption);
        task.setHashtags(String.join(" ", hashtags));
        task.setResultImageUrl(proxiedUrl);
        task.setStatus(GenerationTask.GenerationStatus.COMPLETED);
        taskRepository.save(task);

        wsService.sendCompletion(task.getId(), proxiedUrl, headline, caption, String.join(" ", hashtags), cutoutUrl);
    }

    // --- Text Generation methods remain the same ---

    private String generateHeadline(Product product, String style, int index) {
        switch (style.toLowerCase()) {
            case "medical":
                String[] medHeadlines = {"L'Innovation Clinique", "Efficacité Prouvée", "Agissez Naturellement!"};
                return medHeadlines[index % medHeadlines.length];
            case "luxury":
                String[] luxHeadlines = {"L'Élégance Absolue", "Prestige & Beauté", "Le Soin Premium"};
                return luxHeadlines[index % luxHeadlines.length];
            case "cinematic":
                String[] cinHeadlines = {"L'Icône du Moment", "Redéfinissez le Luxe", "Au-Delà du Possible"};
                return cinHeadlines[index % cinHeadlines.length];
            case "influencer":
            default:
                String[] infHeadlines = {"Mon Secret Beauté ✨", "Glow Up Alert! 💖", "Indispensable de l'Été"};
                return infHeadlines[index % infHeadlines.length];
        }
    }

    private String generateCaption(Product product, String style, int index) {
        String name = product.getName();
        String brand = product.getBrand() != null ? product.getBrand() : "notre marque";
        
        switch (style.toLowerCase()) {
            case "medical":
                String[] medCaptions = {
                    "🩺 L'innovation dermatologique au service de votre peau. Découvrez " + name + " par " + brand + ". Une formule cliniquement prouvée pour des résultats optimaux.",
                    "🔬 La science rencontre la nature. " + name + " a été développé par des experts pour cibler vos besoins spécifiques en toute sécurité.",
                    "✅ Testé dermatologiquement, approuvé par les experts. Donnez à votre corps le soin qu'il mérite avec " + name + "."
                };
                return medCaptions[index % medCaptions.length];
                
            case "luxury":
                String[] luxCaptions = {
                    "✨ L'élégance absolue à l'état pur. Redéfinissez votre routine beauté avec " + name + " par " + brand + ". Parce que vous méritez l'excellence.",
                    "💎 Un secret de beauté précieux. Plongez dans une expérience sensorielle luxueuse avec le nouveau " + name + ".",
                    "🌟 L'art du soin premium. " + name + " combine des ingrédients rares pour un résultat sublime et inégalé."
                };
                return luxCaptions[index % luxCaptions.length];

            case "cinematic":
                String[] cinCaptions = {
                    "🎬 Une vision. Une icône. " + name + " par " + brand + " — pour ceux qui refusent l'ordinaire. Rejoignez le mouvement.",
                    "⚡ Le futur du soin est là. " + name + " repousse les limites de la performance cosmétique. Osez la différence.",
                    "🌅 Né pour briller. " + name + " — une œuvre d'art au service de votre peau. Découvrez l'expérience ultime par " + brand + "."
                };
                return cinCaptions[index % cinCaptions.length];
                
            case "influencer":
            default:
                String[] infCaptions = {
                    "OMG 😍 Mon nouveau coup de cœur de chez " + brand + " ! Le " + name + " est incroyable, vous devez absolument le tester ! ✨👇",
                    "✨ Glow up alert ! ✨ Je ne peux plus me passer du " + name + " dans ma morning routine. Le résultat est ouf ! 💖",
                    "C'est la pépite du mois ! 💫 Le " + name + " est enfin dispo et croyez-moi, il va vite être en rupture de stock ! 🏃‍♀️💨"
                };
                return infCaptions[index % infCaptions.length];
        }
    }

    private List<String> generateHashtags(Product product, String style) {
        List<String> tags = new ArrayList<>();
        tags.add("#" + product.getName().replaceAll("\\s+", ""));
        if (product.getBrand() != null) {
            tags.add("#" + product.getBrand().replaceAll("\\s+", ""));
        }
        
        if (product.getCategory() != null) {
            tags.add("#" + product.getCategory().getName().replaceAll("\\s+", ""));
        }

        switch (style.toLowerCase()) {
            case "medical":
                tags.addAll(Arrays.asList("#SoinDermatologique", "#SanteBeauté", "#Clinique", "#Pharmacie"));
                break;
            case "luxury":
                tags.addAll(Arrays.asList("#PremiumCare", "#LuxeBeauté", "#SoinsPrestige", "#Elegance"));
                break;
            case "cinematic":
                tags.addAll(Arrays.asList("#CinematicBeauty", "#LeonardoAI", "#NanoBanana", "#HeroShot", "#LuxuryAd"));
                break;
            case "influencer":
            default:
                tags.addAll(Arrays.asList("#MustHave", "#RoutineBeauté", "#GlowUp", "#CoupDeCoeur"));
                break;
        }
        return tags;
    }
}
