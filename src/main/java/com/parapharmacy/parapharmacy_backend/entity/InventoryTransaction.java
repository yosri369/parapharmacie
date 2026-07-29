package com.parapharmacy.parapharmacy_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id") // Nullable (e.g., when removing without specifying batch, though we should try to specify it)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private InventoryBatch batch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Integer quantity; // Always positive. Type indicates direction.

    private String reason; // e.g., "Order #123", "Expired", "Damaged in transit"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
