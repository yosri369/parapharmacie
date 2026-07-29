package com.parapharmacy.parapharmacy_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** INFO | PROMO | ALERT */
    @Column(nullable = false)
    @Builder.Default
    private String type = "INFO";

    /** Optional link URL */
    private String linkUrl;

    /** Optional link label */
    private String linkLabel;

    @Column(nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
