package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.entity.*;
import com.parapharmacy.parapharmacy_backend.repository.InventoryBatchRepository;
import com.parapharmacy.parapharmacy_backend.repository.InventoryTransactionRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryBatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void addStock(Long productId, String batchNumber, String supplier, BigDecimal purchasePrice, Integer quantity, LocalDate expirationDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        InventoryBatch batch = InventoryBatch.builder()
                .product(product)
                .batchNumber(batchNumber)
                .supplier(supplier)
                .purchasePrice(purchasePrice)
                .quantity(quantity)
                .expirationDate(expirationDate)
                .build();
        
        batch = batchRepository.save(batch);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .batch(batch)
                .type(TransactionType.IN)
                .quantity(quantity)
                .reason("Manual stock addition")
                .build();
        
        transactionRepository.save(transaction);

        // Update cached total
        product.setStock(product.getStock() + quantity);
        if (purchasePrice != null) {
            product.setPurchasePrice(purchasePrice); // Update to latest purchase price
        }
        productRepository.save(product);
    }

    @Transactional
    public void deductStock(Long productId, Integer quantityToDeduct, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantityToDeduct) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        // FIFO: Get active batches ordered by expiration date
        List<InventoryBatch> activeBatches = batchRepository.findByProductIdAndQuantityGreaterThanOrderByExpirationDateAsc(productId, 0);

        int remainingToDeduct = quantityToDeduct;

        for (InventoryBatch batch : activeBatches) {
            if (remainingToDeduct <= 0) break;

            int deductFromThisBatch = Math.min(batch.getQuantity(), remainingToDeduct);
            
            batch.setQuantity(batch.getQuantity() - deductFromThisBatch);
            batchRepository.save(batch);

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(product)
                    .batch(batch)
                    .type(TransactionType.OUT)
                    .quantity(deductFromThisBatch)
                    .reason(reason)
                    .build();
            transactionRepository.save(transaction);

            remainingToDeduct -= deductFromThisBatch;
        }

        if (remainingToDeduct > 0) {
            // This shouldn't happen if product.stock was accurate, but just in case
            log.warn("Stock deduction completed but couldn't deduct {} items from batches for product {}", remainingToDeduct, productId);
        }

        product.setStock(product.getStock() - quantityToDeduct);
        productRepository.save(product);
    }

    @Transactional
    public void adjustStock(Long productId, Long batchId, TransactionType type, Integer quantity, String reason) {
        if (type == TransactionType.IN || type == TransactionType.OUT) {
            throw new RuntimeException("Use addStock or deductStock for normal IN/OUT operations");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        InventoryBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (type == TransactionType.DAMAGED) {
            if (batch.getQuantity() < quantity) {
                throw new RuntimeException("Not enough quantity in batch to mark as damaged");
            }
            batch.setQuantity(batch.getQuantity() - quantity);
            product.setStock(product.getStock() - quantity);
        } else if (type == TransactionType.RETURN) {
            batch.setQuantity(batch.getQuantity() + quantity);
            product.setStock(product.getStock() + quantity);
        }

        batchRepository.save(batch);
        productRepository.save(product);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .batch(batch)
                .type(type)
                .quantity(quantity)
                .reason(reason)
                .build();
        transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAlerts() {
        // Low Stock
        List<Map<String, Object>> lowStock = new ArrayList<>();
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            if (p.getStock() <= p.getMinStockLevel()) {
                lowStock.add(Map.of(
                    "id", p.getId(),
                    "name", p.getName(),
                    "stock", p.getStock(),
                    "minStockLevel", p.getMinStockLevel()
                ));
            }
        }

        // Expiring Soon (within 30 days)
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        List<InventoryBatch> expiringBatches = batchRepository.findExpiringBatches(thirtyDaysFromNow);
        List<Map<String, Object>> expiring = expiringBatches.stream().map(b -> Map.<String, Object>of(
                "batchId", b.getId(),
                "batchNumber", b.getBatchNumber(),
                "productId", b.getProduct().getId(),
                "productName", b.getProduct().getName(),
                "quantity", b.getQuantity(),
                "expirationDate", b.getExpirationDate()
        )).toList();

        // Not Selling (45 days)
        LocalDateTime fortyFiveDaysAgo = LocalDateTime.now().minusDays(45);
        List<Object[]> notSellingRaw = transactionRepository.findProductsWithoutTransactionsSince(TransactionType.OUT.name(), fortyFiveDaysAgo);
        List<Map<String, Object>> notSelling = notSellingRaw.stream().map(row -> Map.<String, Object>of(
                "id", row[0],
                "name", row[1]
        )).toList();

        return Map.of(
            "lowStock", lowStock,
            "expiring", expiring,
            "notSelling", notSelling
        );
    }

    @Transactional(readOnly = true)
    public String exportStockCsv() {
        StringBuilder csv = new StringBuilder();
        // Use UTF-8 BOM to ensure Excel opens it correctly with accents
        csv.append('\uFEFF');
        csv.append("ID,Nom du Produit,Categorie,Marque,Stock Global,Seuil d'alerte,Prix de Vente,Statut\n");
        
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String status = p.getStock() <= p.getMinStockLevel() ? "Alerte Stock Faible" : "Normal";
            String categoryName = p.getCategory() != null ? p.getCategory().getName() : "N/A";
            
            csv.append(p.getId()).append(",");
            csv.append("\"").append(p.getName() != null ? p.getName().replace("\"", "\"\"") : "").append("\",");
            csv.append("\"").append(categoryName.replace("\"", "\"\"")).append("\",");
            csv.append("\"").append(p.getBrand() != null ? p.getBrand().replace("\"", "\"\"") : "N/A").append("\",");
            csv.append(p.getStock()).append(",");
            csv.append(p.getMinStockLevel()).append(",");
            csv.append(p.getPrice()).append(",");
            csv.append("\"").append(status).append("\"\n");
        }
        
        return csv.toString();
    }
}
