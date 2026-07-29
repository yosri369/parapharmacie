package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.*;
import com.parapharmacy.parapharmacy_backend.entity.*;
import com.parapharmacy.parapharmacy_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private final PurchaseRequestRepository requestRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public List<PurchaseRequestDto> getAllRequests() {
        return requestRepository.findAllByOrderByOrderDateDesc().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PurchaseRequestDto> getRequestsBySupplier(Long supplierId) {
        return requestRepository.findBySupplierId(supplierId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PurchaseRequestDto createRequest(CreatePurchaseRequestDto dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        PurchaseRequest request = new PurchaseRequest();
        request.setSupplier(supplier);
        request.setOrderDate(LocalDateTime.now());
        request.setExpectedDeliveryDate(LocalDateTime.now().plusDays(supplier.getEstimatedDeliveryDays()));
        request.setStatus(PurchaseRequestStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        for (CreatePurchaseRequestDto.ItemPayload itemPayload : dto.getItems()) {
            Product product = productRepository.findById(itemPayload.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemPayload.getProductId()));

            PurchaseRequestItem item = new PurchaseRequestItem();
            item.setPurchaseRequest(request);
            item.setProduct(product);
            item.setQuantity(itemPayload.getQuantity());
            item.setUnitPrice(itemPayload.getUnitPrice());

            request.getItems().add(item);
            total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        request.setTotalAmount(total);
        request = requestRepository.save(request);
        return mapToDto(request);
    }

    @Transactional
    public PurchaseRequestDto updateStatus(Long id, PurchaseRequestStatus newStatus) {
        PurchaseRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Request not found"));

        if (newStatus == PurchaseRequestStatus.DELIVERED && request.getStatus() != PurchaseRequestStatus.DELIVERED) {
            request.setActualDeliveryDate(LocalDateTime.now());

            for (PurchaseRequestItem item : request.getItems()) {
                String batchNumber = "PO-" + request.getId() + "-" + item.getProduct().getId();
                inventoryService.addStock(
                    item.getProduct().getId(),
                    batchNumber,
                    request.getSupplier().getName(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    LocalDate.now().plusYears(2)   // default 2-year expiry; admin can adjust later
                );
            }
        }

        request.setStatus(newStatus);
        request = requestRepository.save(request);
        return mapToDto(request);
    }

    private PurchaseRequestDto mapToDto(PurchaseRequest req) {
        PurchaseRequestDto dto = new PurchaseRequestDto();
        dto.setId(req.getId());
        dto.setOrderDate(req.getOrderDate());
        dto.setExpectedDeliveryDate(req.getExpectedDeliveryDate());
        dto.setActualDeliveryDate(req.getActualDeliveryDate());
        dto.setStatus(req.getStatus());
        dto.setTotalAmount(req.getTotalAmount());
        
        SupplierDto sDto = new SupplierDto();
        sDto.setId(req.getSupplier().getId());
        sDto.setName(req.getSupplier().getName());
        dto.setSupplier(sDto);
        
        List<PurchaseRequestItemDto> itemsDto = req.getItems().stream().map(i -> {
            PurchaseRequestItemDto iDto = new PurchaseRequestItemDto();
            iDto.setId(i.getId());
            iDto.setProductId(i.getProduct().getId());
            iDto.setProductName(i.getProduct().getName());
            iDto.setQuantity(i.getQuantity());
            iDto.setUnitPrice(i.getUnitPrice());
            return iDto;
        }).collect(Collectors.toList());
        dto.setItems(itemsDto);
        
        return dto;
    }
}
