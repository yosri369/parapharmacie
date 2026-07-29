package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.InventoryTransaction;
import com.parapharmacy.parapharmacy_backend.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    
    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    // Find products that have NO transactions of a specific type since a given date (used for "Not Selling" alert)
    @Query(value = "SELECT p.id, p.name FROM products p " +
           "WHERE p.id NOT IN (" +
           "  SELECT DISTINCT t.product_id FROM inventory_transactions t " +
           "  WHERE t.type = :type AND t.created_at >= :date" +
           ")", nativeQuery = true)
    List<Object[]> findProductsWithoutTransactionsSince(@Param("type") String type, @Param("date") LocalDateTime date);
}
