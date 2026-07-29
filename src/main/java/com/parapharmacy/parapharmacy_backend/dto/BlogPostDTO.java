package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BlogPostDTO {
    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String imageUrl;
    private String category;
    private String authorName;
    private String authorAvatar;
    private boolean published;
    private Integer readTimeMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
}
