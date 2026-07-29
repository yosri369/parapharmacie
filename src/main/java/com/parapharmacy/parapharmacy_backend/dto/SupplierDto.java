package com.parapharmacy.parapharmacy_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SupplierDto {
    private Long id;
    private String name;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private Integer estimatedDeliveryDays;
    private LocalDateTime createdAt;
}
