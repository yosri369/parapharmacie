package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewDTO {
    private Long id;
    private Long productId;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private Integer rating;
    private String title;
    private String comment;
    private boolean verified;
    private LocalDateTime createdAt;
}
