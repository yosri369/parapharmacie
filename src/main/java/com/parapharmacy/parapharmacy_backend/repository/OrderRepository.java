package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(com.parapharmacy.parapharmacy_backend.entity.OrderStatus status);

    /** Revenue per day for the last N days */
    @Query("SELECT CAST(o.createdAt AS date), SUM(o.totalAmount) FROM Order o " +
           "WHERE o.createdAt >= :from AND o.status IN ('PAID','DELIVERED','SHIPPED') " +
           "GROUP BY CAST(o.createdAt AS date) ORDER BY CAST(o.createdAt AS date) ASC")
    List<Object[]> revenueByDay(@Param("from") LocalDateTime from);

    /** Orders count per day for the last N days */
    @Query("SELECT CAST(o.createdAt AS date), COUNT(o) FROM Order o " +
           "WHERE o.createdAt >= :from " +
           "GROUP BY CAST(o.createdAt AS date) ORDER BY CAST(o.createdAt AS date) ASC")
    List<Object[]> orderCountByDay(@Param("from") LocalDateTime from);

    /** Total revenue from paid orders */
    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.status IN ('PAID','DELIVERED','SHIPPED')")
    java.math.BigDecimal totalRevenue();

    /** Best-selling products: product name, total qty sold */
    @Query("SELECT i.product.name, i.product.id, SUM(i.quantity) as qty, SUM(i.subtotal) as rev " +
           "FROM OrderItem i JOIN i.order o " +
           "WHERE o.status IN ('PAID','DELIVERED','SHIPPED') " +
           "GROUP BY i.product.id, i.product.name ORDER BY qty DESC")
    List<Object[]> topSellingProducts(org.springframework.data.domain.Pageable pageable);

    /** Orders by status count */
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusAll();

    /** Low stock products (stock <= 5, active) */
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= :threshold ORDER BY p.stock ASC")
    List<com.parapharmacy.parapharmacy_backend.entity.Product> findLowStockProducts(
        @Param("threshold") int threshold,
        org.springframework.data.domain.Pageable pageable);

    /** Revenue by category */
    @Query("SELECT c.name, COALESCE(SUM(i.subtotal), 0) " +
           "FROM OrderItem i JOIN i.order o JOIN i.product p JOIN p.category c " +
           "WHERE o.status IN ('PAID','DELIVERED','SHIPPED') " +
           "GROUP BY c.name")
    List<Object[]> revenueByCategory();
}
