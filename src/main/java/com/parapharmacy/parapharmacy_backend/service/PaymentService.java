package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.PaymentDTO;
import com.parapharmacy.parapharmacy_backend.entity.*;
import com.parapharmacy.parapharmacy_backend.repository.OrderRepository;
import com.parapharmacy.parapharmacy_backend.repository.PaymentRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;
	private final ProductRepository productRepository;
	private final CartService cartService;
	private final InventoryService inventoryService;

	@Transactional
	public void confirmPayment(String konnectTransactionId) {
		Optional<Payment> paymentOpt = paymentRepository.findByKonnectTransactionId(konnectTransactionId);

		if (paymentOpt.isEmpty()) {
			log.warn("Payment not found for transaction ID: {}", konnectTransactionId);
			return;
		}

		Payment payment = paymentOpt.get();

		if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
			log.info("Payment already confirmed for transaction ID: {}", konnectTransactionId);
			return;
		}

		Order order = payment.getOrder();

		payment.setPaymentStatus(PaymentStatus.COMPLETED);
		payment.setCompletedAt(LocalDateTime.now());
		paymentRepository.save(payment);

		order.setStatus(OrderStatus.CONFIRMED);
		order.setPaymentConfirmedAt(LocalDateTime.now());
		orderRepository.save(order);

		deductInventory(order);
		clearCart(order);

		log.info("Payment confirmed for order ID: {}", order.getId());
	}

	@Transactional
	public void cancelPayment(Order order) {
		Optional<Payment> paymentOpt = paymentRepository.findByOrderId(order.getId());

		if (paymentOpt.isEmpty()) {
			return;
		}

		Payment payment = paymentOpt.get();
		payment.setPaymentStatus(PaymentStatus.FAILED);
		paymentRepository.save(payment);

		order.setStatus(OrderStatus.CANCELLED);
		orderRepository.save(order);

		log.info("Payment cancelled for order ID: {}", order.getId());
	}

	public PaymentDTO getPaymentStatus(Long orderId) {
		Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);

		if (paymentOpt.isEmpty()) {
			return null;
		}

		Payment payment = paymentOpt.get();
		return mapToDTO(payment);
	}

	private void deductInventory(Order order) {
		for (OrderItem item : order.getItems()) {
			try {
				inventoryService.deductStock(
					item.getProduct().getId(), 
					item.getQuantity(), 
					"Payment confirmed for Order #" + order.getId()
				);
			} catch (RuntimeException e) {
				log.error("Failed to deduct inventory for product ID {} in Order #{}: {}", 
					item.getProduct().getId(), order.getId(), e.getMessage());
			}
		}
		log.info("Inventory deducted for order ID: {}", order.getId());
	}

	private void clearCart(Order order) {
		cartService.clearCart(order.getUser());
		log.info("Cart cleared for user ID: {}", order.getUser().getId());
	}

	private PaymentDTO mapToDTO(Payment payment) {
		PaymentDTO dto = new PaymentDTO();
		dto.setId(payment.getId());
		dto.setOrderId(payment.getOrder().getId());
		dto.setAmount(payment.getAmount());
		dto.setPaymentStatus(payment.getPaymentStatus());
		dto.setKonnectTransactionId(payment.getKonnectTransactionId());
		dto.setPaymentLink(payment.getPaymentLink());
		dto.setCreatedAt(payment.getCreatedAt());
		dto.setCompletedAt(payment.getCompletedAt());
		return dto;
	}
}
