package com.parapharmacy.parapharmacy_backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private String icon;
    private boolean active;
    private Long parentId;
    private String parentName;
    private int productCount;
}
