package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.CreatePurchaseRequestDto;
import com.parapharmacy.parapharmacy_backend.dto.PurchaseRequestDto;
import com.parapharmacy.parapharmacy_backend.dto.SupplierDto;
import com.parapharmacy.parapharmacy_backend.entity.PurchaseRequestStatus;
import com.parapharmacy.parapharmacy_backend.service.PurchaseRequestService;
import com.parapharmacy.parapharmacy_backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class SupplierController {

    private final SupplierService supplierService;
    private final PurchaseRequestService purchaseRequestService;

    // --- Suppliers ---

    @GetMapping
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @PostMapping
    public ResponseEntity<SupplierDto> createSupplier(@RequestBody SupplierDto dto) {
        return ResponseEntity.ok(supplierService.createSupplier(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> updateSupplier(@PathVariable Long id, @RequestBody SupplierDto dto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok().build();
    }

    // --- Purchase Requests ---

    @GetMapping("/requests")
    public ResponseEntity<List<PurchaseRequestDto>> getAllPurchaseRequests() {
        return ResponseEntity.ok(purchaseRequestService.getAllRequests());
    }

    @GetMapping("/{supplierId}/requests")
    public ResponseEntity<List<PurchaseRequestDto>> getRequestsBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(purchaseRequestService.getRequestsBySupplier(supplierId));
    }

    @PostMapping("/requests")
    public ResponseEntity<PurchaseRequestDto> createPurchaseRequest(@RequestBody CreatePurchaseRequestDto dto) {
        return ResponseEntity.ok(purchaseRequestService.createRequest(dto));
    }

    @PatchMapping("/requests/{id}/status")
    public ResponseEntity<PurchaseRequestDto> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PurchaseRequestStatus status = PurchaseRequestStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(purchaseRequestService.updateStatus(id, status));
    }
}
