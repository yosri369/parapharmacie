package com.parapharmacy.parapharmacy_backend.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlaceOrderRequest {
    private String shippingFirstName;
    private String shippingLastName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private String shippingPhone;
    private String notes;
    private String promoCode;
    private List<OrderItemRequest> items;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
