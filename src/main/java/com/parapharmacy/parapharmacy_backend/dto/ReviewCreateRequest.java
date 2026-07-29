package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Data;

import jakarta.validation.constraints.*;

@Data
public class ReviewCreateRequest {

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 100)
    private String title;

    @Size(max = 1000)
    private String comment;
}
