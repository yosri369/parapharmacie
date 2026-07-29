package com.parapharmacy.parapharmacy_backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private String status;
    private String shippingFirstName;
    private String shippingLastName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private String shippingPhone;
    private String notes;
    private LocalDateTime createdAt;
    private String paymentLink;
    private String appliedPromoCode;
    private java.math.BigDecimal discountAmount;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemDTO {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
