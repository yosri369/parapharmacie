package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.OrderDTO;
import com.parapharmacy.parapharmacy_backend.dto.PlaceOrderRequest;
import com.parapharmacy.parapharmacy_backend.dto.PaymentInitiateResponse;
import com.parapharmacy.parapharmacy_backend.entity.*;
import com.parapharmacy.parapharmacy_backend.repository.CartRepository;
import com.parapharmacy.parapharmacy_backend.repository.OrderRepository;
import com.parapharmacy.parapharmacy_backend.repository.PaymentRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import com.parapharmacy.parapharmacy_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final KonnectService konnectService;
    private final EmailService emailService;
    private final PromoCodeService promoCodeService;
    private final PdfInvoiceService pdfInvoiceService;

    public List<OrderDTO> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toDTO).toList();
    }

    public OrderDTO getOrderById(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }

    public String getInvoiceHtml(Long orderId, String currentUserEmail, boolean isAdmin) {
        return pdfInvoiceService.generateInvoiceHtml(orderId, currentUserEmail, isAdmin);
    }

    public OrderDTO placeOrder(User user, PlaceOrderRequest req) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PlaceOrderRequest.OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }
            BigDecimal price = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(price)
                    .subtotal(subtotal)
                    .build();
            items.add(item);
            total = total.add(subtotal);
        }

        // Apply promo code if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedPromoCode = null;
        if (req.getPromoCode() != null && !req.getPromoCode().isBlank()) {
            try {
                var promoDTO = promoCodeService.validate(req.getPromoCode(), total);
                discountAmount = promoDTO.getDiscountAmount();
                appliedPromoCode = req.getPromoCode().toUpperCase().trim();
                total = total.subtract(discountAmount).max(BigDecimal.ZERO);
                promoCodeService.incrementUsage(appliedPromoCode);
            } catch (RuntimeException e) {
                throw new RuntimeException("Code promo: " + e.getMessage());
            }
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .discountAmount(discountAmount)
                .appliedPromoCode(appliedPromoCode)
                .status(OrderStatus.PENDING)
                .shippingFirstName(req.getShippingFirstName())
                .shippingLastName(req.getShippingLastName())
                .shippingAddress(req.getShippingAddress())
                .shippingCity(req.getShippingCity())
                .shippingCountry(req.getShippingCountry())
                .shippingPhone(req.getShippingPhone())
                .notes(req.getNotes())
                .build();
        order = orderRepository.save(order);
        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        orderRepository.save(order);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(total);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        PaymentInitiateResponse paymentResponse = konnectService.createPayment(total, order.getId(), user.getEmail());
        if (paymentResponse != null) {
            payment.setPaymentLink(paymentResponse.getPaymentLink());
            payment.setKonnectTransactionId(paymentResponse.getTransactionId());
            paymentRepository.save(payment);
        } else {
            log.error("Failed to create payment link for order ID: {}", order.getId());
        }

        OrderDTO orderDTO = toDTO(order);
        if (paymentResponse != null) {
            orderDTO.setPaymentLink(paymentResponse.getPaymentLink());
        }
        return orderDTO;
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toDTO).toList();
    }

    public OrderDTO updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.valueOf(status));
        return toDTO(orderRepository.save(order));
    }

    private OrderDTO toDTO(Order o) {
        List<OrderDTO.OrderItemDTO> itemDTOs = o.getItems().stream().map(i ->
            OrderDTO.OrderItemDTO.builder()
                .productId(i.getProduct().getId())
                .productName(i.getProduct().getName())
                .productImage(i.getProduct().getImageUrl())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .subtotal(i.getSubtotal())
                .build()
        ).toList();

        String paymentLink = null;
        if (o.getPayment() != null) {
            paymentLink = o.getPayment().getPaymentLink();
        }

        return OrderDTO.builder()
                .id(o.getId())
                .userId(o.getUser().getId())
                .userEmail(o.getUser().getEmail())
                .items(itemDTOs)
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .shippingFirstName(o.getShippingFirstName())
                .shippingLastName(o.getShippingLastName())
                .shippingAddress(o.getShippingAddress())
                .shippingCity(o.getShippingCity())
                .shippingCountry(o.getShippingCountry())
                .shippingPhone(o.getShippingPhone())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .paymentLink(paymentLink)
                .appliedPromoCode(o.getAppliedPromoCode())
                .discountAmount(o.getDiscountAmount())
                .build();
    }

    /** Full analytics payload for the admin dashboard */
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");

        // Revenue per day (last 30 days)
        List<Map<String, Object>> revenueChart = orderRepository.revenueByDay(thirtyDaysAgo)
                .stream().map(row -> Map.<String, Object>of(
                        "date",    row[0].toString(),
                        "revenue", row[1]
                )).toList();

        // Orders per day (last 30 days)
        List<Map<String, Object>> ordersChart = orderRepository.orderCountByDay(thirtyDaysAgo)
                .stream().map(row -> Map.<String, Object>of(
                        "date",  row[0].toString(),
                        "count", row[1]
                )).toList();

        // Top 10 best-selling products
        List<Map<String, Object>> topProducts = orderRepository
                .topSellingProducts(PageRequest.of(0, 10))
                .stream().map(row -> Map.<String, Object>of(
                        "name",     row[0],
                        "id",       row[1],
                        "quantity", row[2],
                        "revenue",  row[3]
                )).toList();

        // Orders by status
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (Object[] row : orderRepository.countByStatusAll()) {
            statusBreakdown.put(row[0].toString(), (Long) row[1]);
        }

        // Total revenue
        BigDecimal totalRevenue = orderRepository.totalRevenue();

        // Low stock alerts (stock <= 5)
        List<Map<String, Object>> lowStock = orderRepository
                .findLowStockProducts(5, PageRequest.of(0, 20))
                .stream().map(p -> Map.<String, Object>of(
                        "id",       p.getId(),
                        "name",     p.getName(),
                        "stock",    p.getStock(),
                        "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : ""
                )).toList();

        // Summary counts
        long totalOrders = orderRepository.count();

        // Revenue by Category
        List<Map<String, Object>> revenueByCategory = orderRepository.revenueByCategory()
                .stream().map(row -> Map.<String, Object>of(
                        "category", row[0].toString(),
                        "revenue",  row[1]
                )).toList();

        // User Growth
        List<Map<String, Object>> userGrowth = userRepository.userGrowthByDay()
                .stream().map(row -> Map.<String, Object>of(
                        "date",  row[0].toString(),
                        "count", row[1]
                )).toList();

        return Map.of(
                "totalOrders",       totalOrders,
                "totalRevenue",      totalRevenue,
                "revenueChart",      revenueChart,
                "ordersChart",       ordersChart,
                "topProducts",       topProducts,
                "statusBreakdown",   statusBreakdown,
                "lowStockAlerts",    lowStock,
                "revenueByCategory", revenueByCategory,
                "userGrowth",        userGrowth
        );
    }
}

