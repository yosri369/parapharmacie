package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.OrderDTO;
import com.parapharmacy.parapharmacy_backend.dto.PlaceOrderRequest;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, user));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(@AuthenticationPrincipal User user,
                                                @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(user, req));
    }

    @GetMapping(value = "/{id}/invoice", produces = "text/html;charset=UTF-8")
    public ResponseEntity<String> getInvoice(@AuthenticationPrincipal User user, @PathVariable Long id) {
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ROLE_ADMIN");
        String html = orderService.getInvoiceHtml(id, user.getEmail(), isAdmin);
        return ResponseEntity.ok(html);
    }
}
