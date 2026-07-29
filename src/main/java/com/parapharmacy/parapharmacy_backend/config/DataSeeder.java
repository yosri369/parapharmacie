package com.parapharmacy.parapharmacy_backend.config;

import com.parapharmacy.parapharmacy_backend.entity.*;
import com.parapharmacy.parapharmacy_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository        userRepository;
    private final CategoryRepository    categoryRepository;
    private final ProductRepository     productRepository;
    private final BlogPostRepository    blogPostRepository;
    private final PasswordEncoder       passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("🌱 Seeding database...");

        // ── Users ────────────────────────────────────────────────────────────
        User admin = userRepository.findByEmail("admin@pharmaalyosr.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .firstName("Admin").lastName("Alyosr")
                .email("admin@pharmaalyosr.com").password(passwordEncoder.encode("Admin2024!"))
                .age(35).gender("Male")
                .role(Role.ROLE_ADMIN).build())
        );

        if (!userRepository.existsByEmail("sophie@example.com")) {
            userRepository.save(User.builder()
                .firstName("Sophie").lastName("Martin")
                .email("sophie@example.com").password(passwordEncoder.encode("User2024!"))
                .age(28).gender("Female")
                .role(Role.ROLE_USER).build());
        }

        if (categoryRepository.count() > 0) {
            log.info("✅ Database already contains products/categories. Skipping content seed.");
            return;
        }

        // ── Categories ───────────────────────────────────────────────────────
        Category skincare = categoryRepository.save(Category.builder()
                .name("Skincare").slug("skincare")
                .description("Premium skincare for radiant, healthy skin")
                .imageUrl("https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80")
                .icon("✨").active(true).build());

        Category haircare = categoryRepository.save(Category.builder()
                .name("Hair Care").slug("hair-care")
                .description("Nourishing hair care solutions for every hair type")
                .imageUrl("https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=500&q=80")
                .icon("💇").active(true).build());

        Category supplements = categoryRepository.save(Category.builder()
                .name("Supplements").slug("supplements")
                .description("Vitamins, minerals, and wellness supplements")
                .imageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80")
                .icon("💊").active(true).build());

        Category babycare = categoryRepository.save(Category.builder()
                .name("Baby Care").slug("baby-care")
                .description("Gentle, safe products for your little ones")
                .imageUrl("https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80")
                .icon("👶").active(true).build());

        categoryRepository.save(Category.builder()
                .name("Hygiene").slug("hygiene")
                .description("Daily hygiene essentials for the whole family")
                .imageUrl("https://images.unsplash.com/photo-1607619662634-3ac55ec0e216?auto=format&fit=crop&w=500&q=80")
                .icon("🧼").active(true).build());

        Category wellness = categoryRepository.save(Category.builder()
                .name("Wellness").slug("wellness")
                .description("Holistic wellness products for body and mind")
                .imageUrl("https://images.unsplash.com/photo-1563974318767-a1fc07727589?auto=format&fit=crop&w=500&q=80")
                .icon("🌿").active(true).build());

        // ── Products ─────────────────────────────────────────────────────────
        productRepository.saveAll(List.of(
            Product.builder().name("Hydra Glow Serum").slug("hydra-glow-serum")
                .description("Deeply hydrating hyaluronic acid serum with vitamin C for radiant, plump skin.")
                .price(new BigDecimal("38.90")).salePrice(new BigDecimal("29.90"))
                .stock(85).imageUrl("https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80")
                .category(skincare).brand("VitaNova").rating(4.8).reviewCount(124)
                .featured(true).onSale(true).active(true).build(),

            Product.builder().name("Rose Petal Moisturizer").slug("rose-petal-moisturizer")
                .description("Rich, velvety moisturizer enriched with rose extract and ceramides. 24-hour hydration.")
                .price(new BigDecimal("42.50")).stock(60)
                .imageUrl("https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80")
                .category(skincare).brand("Lumière").rating(4.7).reviewCount(89)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("SPF 50+ Sunscreen").slug("spf-50-sunscreen")
                .description("Broad spectrum UVA/UVB protection with a lightweight, non-greasy finish.")
                .price(new BigDecimal("24.90")).stock(120)
                .imageUrl("https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=500&q=80")
                .category(skincare).brand("SolàCare").rating(4.6).reviewCount(203)
                .featured(false).onSale(false).active(true).build(),

            Product.builder().name("Retinol Night Repair Cream").slug("retinol-night-repair")
                .description("Powerful anti-aging night cream with 0.5% retinol, peptides, and niacinamide.")
                .price(new BigDecimal("55.00")).salePrice(new BigDecimal("44.00"))
                .stock(40).imageUrl("https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=500&q=80")
                .category(skincare).brand("DermScience").rating(4.9).reviewCount(67)
                .featured(true).onSale(true).active(true).build(),

            Product.builder().name("Argan Oil Repair Mask").slug("argan-oil-repair-mask")
                .description("Intensive weekly treatment with pure Moroccan argan oil. Restores shine and eliminates frizz.")
                .price(new BigDecimal("29.90")).stock(75)
                .imageUrl("https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=500&q=80")
                .category(haircare).brand("Kérama").rating(4.7).reviewCount(156)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("Scalp Balance Shampoo").slug("scalp-balance-shampoo")
                .description("Gentle sulfate-free shampoo that balances oily roots while moisturizing dry ends.")
                .price(new BigDecimal("18.50")).salePrice(new BigDecimal("14.90"))
                .stock(95).imageUrl("https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=500&q=80")
                .category(haircare).brand("PureRoots").rating(4.5).reviewCount(88)
                .featured(false).onSale(true).active(true).build(),

            Product.builder().name("Vitamine D3 2000 UI").slug("vitamine-d3-2000ui")
                .description("High-potency vitamin D3 for immune support, bone health, and mood. 90 capsules.")
                .price(new BigDecimal("19.90")).stock(200)
                .imageUrl("https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=500&q=80")
                .category(supplements).brand("NutraPure").rating(4.8).reviewCount(312)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("Omega-3 Fish Oil").slug("omega-3-fish-oil")
                .description("Ultra-pure omega-3 EPA & DHA from wild-caught fish. Supports heart, brain, and joint health.")
                .price(new BigDecimal("28.50")).salePrice(new BigDecimal("22.90"))
                .stock(150).imageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80")
                .category(supplements).brand("OceanLife").rating(4.6).reviewCount(178)
                .featured(false).onSale(true).active(true).build(),

            Product.builder().name("Collagen Beauty Complex").slug("collagen-beauty-complex")
                .description("Marine collagen peptides with biotin, vitamin C, and zinc for skin, hair, and nails.")
                .price(new BigDecimal("44.90")).stock(80)
                .imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80")
                .category(supplements).brand("VitaNova").rating(4.9).reviewCount(95)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("Gentle Baby Body Wash").slug("gentle-baby-body-wash")
                .description("Ultra-soft cleansing wash for newborns and babies. No tears, hypoallergenic, 98% natural.")
                .price(new BigDecimal("14.90")).stock(110)
                .imageUrl("https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80")
                .category(babycare).brand("PureBaby").rating(4.9).reviewCount(224)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("Baby Protective Balm").slug("baby-protective-balm")
                .description("Protective zinc-based balm for diaper rash prevention. Fragrance-free, pediatrician tested.")
                .price(new BigDecimal("11.90")).salePrice(new BigDecimal("9.50"))
                .stock(130).imageUrl("https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80")
                .category(babycare).brand("PureBaby").rating(4.7).reviewCount(167)
                .featured(false).onSale(true).active(true).build(),

            Product.builder().name("Lavender Relaxation Oil").slug("lavender-relaxation-oil")
                .description("Pure therapeutic-grade lavender essential oil for aromatherapy, massage, and sleep.")
                .price(new BigDecimal("22.00")).stock(65)
                .imageUrl("https://images.unsplash.com/photo-1545239351-cefa43af60f3?auto=format&fit=crop&w=500&q=80")
                .category(wellness).brand("ArômeNature").rating(4.8).reviewCount(143)
                .featured(true).onSale(false).active(true).build(),

            Product.builder().name("Magnesium Glycinate 400mg").slug("magnesium-glycinate-400mg")
                .description("High absorption magnesium for stress relief, muscle relaxation, and quality sleep. 60 capsules.")
                .price(new BigDecimal("26.90")).stock(98)
                .imageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80")
                .category(wellness).brand("NutraPure").rating(4.7).reviewCount(209)
                .featured(false).onSale(false).active(true).build()
        ));

        // ── Blog Posts ───────────────────────────────────────────────────────
        blogPostRepository.saveAll(List.of(
            BlogPost.builder()
                .title("5 Morning Rituals for Glowing Skin")
                .slug("5-morning-rituals-glowing-skin")
                .excerpt("Start your day with these simple but powerful skincare steps that dermatologists swear by.")
                .content("""
                    ## The Foundation of Radiant Skin\n\nYour morning skincare routine sets the tone for your entire day. Dermatologists agree that consistency is more important than complexity.\n\n### 1. Gentle Cleansing\nStart with a mild, pH-balanced cleanser. Avoid harsh soaps that strip your skin's natural moisture barrier.\n\n### 2. Vitamin C Serum\nApply a vitamin C serum while skin is still slightly damp. This antioxidant fights free radicals and brightens your complexion over time.\n\n### 3. Hydrating Moisturizer\nLock in moisture with a lightweight gel cream. Look for hyaluronic acid and ceramides as key ingredients.\n\n### 4. SPF — Non-Negotiable\nSunscreen is the single most effective anti-aging product. Apply SPF 30+ every day, even when it's cloudy.\n\n### 5. Facial Massage\nA 2-minute lymphatic drainage massage boosts circulation and gives skin that natural glow.\n\n> **Pro tip**: Consistency over 30 days will show visible results. Stick with it!
                    """)
                .imageUrl("https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80")
                .category("Skincare")
                .authorName("Dr. Claire Martin")
                .readTimeMinutes(4)
                .published(true)
                .publishedAt(LocalDateTime.now().minusDays(5))
                .author(admin)
                .build(),

            BlogPost.builder()
                .title("The Truth About Collagen Supplements")
                .slug("truth-about-collagen-supplements")
                .excerpt("Collagen is everywhere, but does it actually work? We review the science behind the hype.")
                .content("""
                    ## What Is Collagen?\n\nCollagen is the most abundant protein in the human body, forming the structural foundation of skin, joints, and bones. After age 25, production declines by approximately 1% per year.\n\n## Do Collagen Supplements Work?\n\nRecent clinical studies suggest that hydrolyzed collagen peptides (molecular weight < 5,000 Da) are bioavailable and can:\n- Improve skin elasticity by up to 12% after 12 weeks\n- Reduce joint pain in athletes by 20%\n- Support nail strength and hair thickness\n\n## What to Look For\n\n### Marine vs. Bovine\nMarine collagen (Type I) is most bioavailable for skin. Bovine collagen (Types I & III) benefits skin and joints.\n\n### Key Co-factors\nAlways choose a formula with **Vitamin C** — it's essential for collagen synthesis. Biotin and zinc also help.\n\n## Our Recommendation\n\nThe VitaNova Collagen Beauty Complex combines 5,000mg of marine collagen with vitamin C, biotin, and zinc for comprehensive support.\n\n> Results vary. Minimum 8–12 weeks of daily use required for visible skin benefits.
                    """)
                .imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80")
                .category("Supplements")
                .authorName("Dr. Ahmed Bensalem")
                .readTimeMinutes(5)
                .published(true)
                .publishedAt(LocalDateTime.now().minusDays(12))
                .author(admin)
                .build(),

            BlogPost.builder()
                .title("How to Build a Minimalist Haircare Routine")
                .slug("minimalist-haircare-routine")
                .excerpt("Less is more when it comes to hair. Discover the 3 essential products for every hair type.")
                .content("""
                    ## Why Minimalism Works for Hair\n\nOver-loading your hair with products can cause build-up, weigh strands down, and disrupt your scalp's natural oil balance. A streamlined routine is often more effective.\n\n## The 3-Product Rule\n\n### 1. The Right Shampoo\nChoose a sulfate-free shampoo matched to your scalp type (oily, balanced, or dry). Wash 2–3 times per week maximum.\n\n### 2. A Nourishing Conditioner\nApply from mid-lengths to ends. Leave for 2–3 minutes. For curly or damaged hair, a weekly deep conditioning mask provides extra repair.\n\n### 3. Heat Protection\nIf you use heat tools, a lightweight thermal protectant spray is non-negotiable. Apply before blow-drying or styling.\n\n## Bonus: Scalp Care\n\nA healthy scalp is the foundation of healthy hair. Consider a weekly scalp massage with a few drops of argan oil to stimulate circulation.\n\n## What to Skip\n\n- Daily dry shampoo (causes long-term build-up)\n- Multiple overlapping styling products\n- Alcohol-based hairsprays (drying)\n\n> **The golden rule**: Give any new routine at least 4 weeks before judging results. Hair cycles are slow!
                    """)
                .imageUrl("https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80")
                .category("Hair Care")
                .authorName("Leila Benali")
                .readTimeMinutes(4)
                .published(true)
                .publishedAt(LocalDateTime.now().minusDays(20))
                .author(admin)
                .build(),

            BlogPost.builder()
                .title("Vitamin D Deficiency: Signs, Risks & How to Fix It")
                .slug("vitamin-d-deficiency-signs-risks")
                .excerpt("An estimated 1 billion people worldwide are deficient in vitamin D. Are you one of them?")
                .content("""
                    ## Why Vitamin D Matters\n\nVitamin D isn't just a vitamin — it's a hormone that influences over 200 genes in the body. It's essential for:\n- Immune function\n- Bone mineralisation\n- Mood regulation (linked to serotonin)\n- Cardiovascular health\n\n## Signs of Deficiency\n\n- Persistent fatigue that doesn't improve with sleep\n- Bone or muscle pain\n- Frequent infections or slow recovery\n- Low mood or seasonal depression\n- Hair loss\n\n## Who Is at Risk?\n\n- People who spend limited time outdoors\n- Dark skin tones (melanin reduces D synthesis)\n- Those living above 35° latitude in winter\n- Overweight individuals (D is fat-soluble and can be sequestered)\n\n## How Much Do You Need?\n\nFor most adults, **2,000 IU daily** is the evidence-backed maintenance dose. Those deficient may require 4,000–5,000 IU under medical supervision.\n\n## Our Pick\n\nVitaNova Vitamin D3 2,000 IU uses cholecalciferol (the most bioavailable form) with olive oil for optimal absorption.\n\n> Always consult your doctor before starting supplementation.
                    """)
                .imageUrl("https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800&q=80")
                .category("Supplements")
                .authorName("Dr. Ahmed Bensalem")
                .readTimeMinutes(6)
                .published(true)
                .publishedAt(LocalDateTime.now().minusDays(30))
                .author(admin)
                .build()
        ));

        log.info("✅ Seeded: {} users | {} categories | {} products | {} blog posts",
                userRepository.count(), categoryRepository.count(),
                productRepository.count(), blogPostRepository.count());
    }
}
