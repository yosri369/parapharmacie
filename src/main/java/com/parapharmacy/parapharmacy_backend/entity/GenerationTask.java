package com.parapharmacy.parapharmacy_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks a single AI poster generation task.
 * One campaign generates multiple GenerationTask entries (one per variant).
 */
@Entity
@Table(name = "generation_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerationTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Which product this is for
    private Long productId;

    // The style requested (luxury, medical, influencer)
    private String style;

    // The format (Instagram Post, etc.)
    private String format;

    // Variant index (0, 1, 2)
    private int variantIndex;

    // Enum: PENDING, PROCESSING, COMPLETED, FAILED
    @Enumerated(EnumType.STRING)
    private GenerationStatus status;

    // URL of the source product image (Cloudinary)
    @Column(columnDefinition = "TEXT")
    private String sourceImageUrl;

    // The cutout URL (Cloudinary background removal)
    @Column(columnDefinition = "TEXT")
    private String cutoutUrl;

    // The final AI-generated poster URL (Cloudinary)
    @Column(columnDefinition = "TEXT")
    private String resultImageUrl;

    // The prompt sent to fal.ai
    @Column(columnDefinition = "TEXT")
    private String generatedPrompt;

    // The fal.ai request ID for polling
    private String falRequestId;

    // Human-readable error if status == FAILED
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    // AI-generated marketing copy
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(columnDefinition = "TEXT")
    private String hashtags;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum GenerationStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
