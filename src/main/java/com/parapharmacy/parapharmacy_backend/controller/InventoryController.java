package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.InventoryDTOs.*;
import com.parapharmacy.parapharmacy_backend.entity.InventoryBatch;
import com.parapharmacy.parapharmacy_backend.repository.InventoryBatchRepository;
import com.parapharmacy.parapharmacy_backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryBatchRepository batchRepository;

    @PostMapping("/stock")
    public ResponseEntity<?> addStock(@RequestBody AddStockRequest request) {
        inventoryService.addStock(
                request.getProductId(),
                request.getBatchNumber(),
                request.getSupplier(),
                request.getPurchasePrice(),
                request.getQuantity(),
                request.getExpirationDate()
        );
        return ResponseEntity.ok(Map.of("message", "Stock added successfully"));
    }

    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody AdjustStockRequest request) {
        inventoryService.adjustStock(
                request.getProductId(),
                request.getBatchId(),
                request.getType(),
                request.getQuantity(),
                request.getReason()
        );
        return ResponseEntity.ok(Map.of("message", "Stock adjusted successfully"));
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAlerts() {
        return ResponseEntity.ok(inventoryService.getAlerts());
    }

    @GetMapping("/batches/{productId}")
    public ResponseEntity<List<InventoryBatch>> getProductBatches(@PathVariable Long productId) {
        // Return active batches for display in the admin panel
        List<InventoryBatch> batches = batchRepository.findByProductId(productId);
        return ResponseEntity.ok(batches);
    }

    @GetMapping(value = "/export/stock", produces = "text/csv")
    public ResponseEntity<String> exportStockCsv() {
        String csvData = inventoryService.exportStockCsv();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"stock_report.csv\"")
                .body(csvData);
    }
}
