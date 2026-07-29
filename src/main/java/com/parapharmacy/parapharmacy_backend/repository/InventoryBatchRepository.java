package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {
    
    // Find active batches for a product (quantity > 0) ordered by expiration date (FIFO)
    List<InventoryBatch> findByProductIdAndQuantityGreaterThanOrderByExpirationDateAsc(Long productId, Integer quantity);

    List<InventoryBatch> findByProductId(Long productId);

    // Find batches expiring before a certain date with remaining quantity
    @Query("SELECT b FROM InventoryBatch b WHERE b.expirationDate <= :date AND b.quantity > 0 ORDER BY b.expirationDate ASC")
    List<InventoryBatch> findExpiringBatches(@Param("date") LocalDate date);
}
