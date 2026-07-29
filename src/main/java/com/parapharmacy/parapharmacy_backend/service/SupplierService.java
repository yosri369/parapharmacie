package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.SupplierDto;
import com.parapharmacy.parapharmacy_backend.entity.Supplier;
import com.parapharmacy.parapharmacy_backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SupplierDto getSupplierById(Long id) {
        Supplier s = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        return mapToDto(s);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier s = new Supplier();
        s.setName(dto.getName());
        s.setContactName(dto.getContactName());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        s.setEstimatedDeliveryDays(dto.getEstimatedDeliveryDays() != null ? dto.getEstimatedDeliveryDays() : 7);
        s = supplierRepository.save(s);
        return mapToDto(s);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier s = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        s.setName(dto.getName());
        s.setContactName(dto.getContactName());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        if(dto.getEstimatedDeliveryDays() != null) s.setEstimatedDeliveryDays(dto.getEstimatedDeliveryDays());
        s = supplierRepository.save(s);
        return mapToDto(s);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    private SupplierDto mapToDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setContactName(s.getContactName());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        dto.setEstimatedDeliveryDays(s.getEstimatedDeliveryDays());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
