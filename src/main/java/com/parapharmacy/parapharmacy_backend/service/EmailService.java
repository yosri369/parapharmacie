package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.entity.Order;
import com.parapharmacy.parapharmacy_backend.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

	private final JavaMailSender mailSender;

	@Value("${app.mail.from}")
	private String mailFrom;

	@Value("${app.mail.from-name}")
	private String mailFromName;

	public void sendOrderConfirmationEmail(Order order) {
		try {
			String subject = "Order Confirmation - Order #" + order.getId();
			String htmlContent = buildOrderConfirmationHtml(order);
			sendHtmlEmail(order.getUser().getEmail(), subject, htmlContent);
			log.info("Order confirmation email sent to: {}", order.getUser().getEmail());
		} catch (Exception e) {
			log.error("Failed to send order confirmation email", e);
		}
	}

	public void sendPaymentConfirmedEmail(Order order, Payment payment) {
		try {
			String subject = "Payment Confirmed - Order #" + order.getId();
			String htmlContent = buildPaymentConfirmedHtml(order, payment);
			sendHtmlEmail(order.getUser().getEmail(), subject, htmlContent);
			log.info("Payment confirmation email sent to: {}", order.getUser().getEmail());
		} catch (Exception e) {
			log.error("Failed to send payment confirmation email", e);
		}
	}

	public void sendPasswordResetEmail(String email, String token) {
		try {
			String subject = "Password Reset Request - Pharma Alyosr";
			String resetUrl = "http://localhost:51101/auth/reset-password?token=" + token;
			String htmlContent = buildPasswordResetHtml(resetUrl);
			sendHtmlEmail(email, subject, htmlContent);
			log.info("Password reset email sent to: {}. Reset Link: {}", email, resetUrl);
		} catch (Exception e) {
			log.error("Failed to send password reset email. Reset Link: {}", "http://localhost:51101/auth/reset-password?token=" + token, e);
		}
	}

	private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
		MimeMessage mimeMessage = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

		try {
			helper.setFrom(mailFrom, mailFromName);
		} catch (java.io.UnsupportedEncodingException e) {
			throw new MessagingException("Failed to set sender address", e);
		}
		helper.setTo(to);
		helper.setSubject(subject);
		helper.setText(htmlContent, true);

		mailSender.send(mimeMessage);
	}

	private String buildOrderConfirmationHtml(Order order) {
		StringBuilder html = new StringBuilder();
		html.append("<!DOCTYPE html>");
		html.append("<html>");
		html.append("<head>");
		html.append("<meta charset='UTF-8'>");
		html.append("<style>");
		html.append("body { font-family: Arial, sans-serif; color: #333; }");
		html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
		html.append(".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }");
		html.append(".section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }");
		html.append(".items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }");
		html.append(".items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }");
		html.append(".items-table th { background-color: #f2f2f2; font-weight: bold; }");
		html.append(".total { font-size: 18px; font-weight: bold; color: #4CAF50; text-align: right; margin: 15px 0; }");
		html.append(".button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }");
		html.append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }");
		html.append("</style>");
		html.append("</head>");
		html.append("<body>");
		html.append("<div class='container'>");
		html.append("<div class='header'>");
		html.append("<h1>Order Confirmation</h1>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<p>Dear ").append(order.getUser().getFirstName() != null ? order.getUser().getFirstName() : "Customer").append(",</p>");
		html.append("<p>Thank you for your order! We're excited to serve you.</p>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Order Details</h3>");
		html.append("<p><strong>Order ID:</strong> #").append(order.getId()).append("</p>");
		html.append("<p><strong>Order Date:</strong> ").append(order.getCreatedAt()).append("</p>");
		html.append("<p><strong>Status:</strong> ").append(order.getStatus()).append("</p>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Items Ordered</h3>");
		html.append("<table class='items-table'>");
		html.append("<tr>");
		html.append("<th>Product</th>");
		html.append("<th>Quantity</th>");
		html.append("<th>Price</th>");
		html.append("<th>Subtotal</th>");
		html.append("</tr>");

		order.getItems().forEach(item -> {
			html.append("<tr>");
			html.append("<td>").append(item.getProduct().getName()).append("</td>");
			html.append("<td>").append(item.getQuantity()).append("</td>");
			html.append("<td>").append(item.getUnitPrice()).append(" TND</td>");
			html.append("<td>").append(item.getSubtotal()).append(" TND</td>");
			html.append("</tr>");
		});

		html.append("</table>");
		html.append("<div class='total'>Total: ").append(order.getTotalAmount()).append(" TND</div>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Shipping Address</h3>");
		html.append("<p>");
		html.append(order.getShippingFirstName()).append(" ").append(order.getShippingLastName()).append("<br>");
		html.append(order.getShippingAddress()).append("<br>");
		html.append(order.getShippingCity()).append(", ").append(order.getShippingCountry()).append("<br>");
		html.append("Phone: ").append(order.getShippingPhone());
		html.append("</p>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<p><strong>Next Step:</strong> Please complete your payment to confirm this order.</p>");
		if (order.getPayment() != null && order.getPayment().getPaymentLink() != null) {
			html.append("<center>");
			html.append("<a href='").append(order.getPayment().getPaymentLink()).append("' class='button'>Complete Payment</a>");
			html.append("</center>");
		}
		html.append("</div>");

		html.append("<div class='footer'>");
		html.append("<p>If you have any questions, please contact our support team.</p>");
		html.append("<p>&copy; 2026 Parapharmacy. All rights reserved.</p>");
		html.append("</div>");

		html.append("</div>");
		html.append("</body>");
		html.append("</html>");

		return html.toString();
	}

	private String buildPaymentConfirmedHtml(Order order, Payment payment) {
		StringBuilder html = new StringBuilder();
		html.append("<!DOCTYPE html>");
		html.append("<html>");
		html.append("<head>");
		html.append("<meta charset='UTF-8'>");
		html.append("<style>");
		html.append("body { font-family: Arial, sans-serif; color: #333; }");
		html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
		html.append(".header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px; }");
		html.append(".success { color: #4CAF50; font-size: 18px; text-align: center; margin: 20px 0; }");
		html.append(".section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }");
		html.append(".items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }");
		html.append(".items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }");
		html.append(".items-table th { background-color: #f2f2f2; font-weight: bold; }");
		html.append(".total { font-size: 18px; font-weight: bold; color: #2196F3; text-align: right; margin: 15px 0; }");
		html.append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }");
		html.append("</style>");
		html.append("</head>");
		html.append("<body>");
		html.append("<div class='container'>");
		html.append("<div class='header'>");
		html.append("<h1>Payment Confirmed</h1>");
		html.append("</div>");

		html.append("<div class='success'>");
		html.append("✓ Your payment has been successfully processed!");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Payment Receipt</h3>");
		html.append("<p><strong>Order ID:</strong> #").append(order.getId()).append("</p>");
		html.append("<p><strong>Transaction ID:</strong> ").append(payment.getKonnectTransactionId()).append("</p>");
		html.append("<p><strong>Amount Paid:</strong> ").append(payment.getAmount()).append(" TND</p>");
		html.append("<p><strong>Payment Date:</strong> ").append(payment.getCompletedAt()).append("</p>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Order Summary</h3>");
		html.append("<table class='items-table'>");
		html.append("<tr>");
		html.append("<th>Product</th>");
		html.append("<th>Quantity</th>");
		html.append("<th>Price</th>");
		html.append("<th>Subtotal</th>");
		html.append("</tr>");

		order.getItems().forEach(item -> {
			html.append("<tr>");
			html.append("<td>").append(item.getProduct().getName()).append("</td>");
			html.append("<td>").append(item.getQuantity()).append("</td>");
			html.append("<td>").append(item.getUnitPrice()).append(" TND</td>");
			html.append("<td>").append(item.getSubtotal()).append(" TND</td>");
			html.append("</tr>");
		});

		html.append("</table>");
		html.append("<div class='total'>Total: ").append(order.getTotalAmount()).append(" TND</div>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<h3>Shipping Address</h3>");
		html.append("<p>");
		html.append(order.getShippingFirstName()).append(" ").append(order.getShippingLastName()).append("<br>");
		html.append(order.getShippingAddress()).append("<br>");
		html.append(order.getShippingCity()).append(", ").append(order.getShippingCountry()).append("<br>");
		html.append("Phone: ").append(order.getShippingPhone());
		html.append("</p>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<p>Your order is now being processed and will be shipped soon. You will receive a tracking number via email.</p>");
		html.append("</div>");

		html.append("<div class='footer'>");
		html.append("<p>Thank you for your purchase! If you have any questions, please contact our support team.</p>");
		html.append("<p>&copy; 2026 Parapharmacy. All rights reserved.</p>");
		html.append("</div>");

		html.append("</div>");
		html.append("</body>");
		html.append("</html>");

		return html.toString();
	}

	private String buildPasswordResetHtml(String resetUrl) {
		StringBuilder html = new StringBuilder();
		html.append("<!DOCTYPE html>");
		html.append("<html>");
		html.append("<head>");
		html.append("<meta charset='UTF-8'>");
		html.append("<style>");
		html.append("body { font-family: Arial, sans-serif; color: #333; }");
		html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
		html.append(".header { background-color: #0891b2; color: white; padding: 20px; text-align: center; border-radius: 5px; }");
		html.append(".section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }");
		html.append(".button { display: inline-block; background-color: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }");
		html.append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }");
		html.append("</style>");
		html.append("</head>");
		html.append("<body>");
		html.append("<div class='container'>");
		html.append("<div class='header'>");
		html.append("<h1>Password Reset Request</h1>");
		html.append("</div>");

		html.append("<div class='section'>");
		html.append("<p>You recently requested to reset your password for your Pharma Alyosr account.</p>");
		html.append("<p>Click the button below to reset it. This link is valid for 24 hours.</p>");
		html.append("<a href='").append(resetUrl).append("' class='button'>Reset Password</a>");
		html.append("<p>If you did not request a password reset, please ignore this email.</p>");
		html.append("</div>");

		html.append("<div class='footer'>");
		html.append("<p>If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>");
		html.append("<p>").append(resetUrl).append("</p>");
		html.append("<p>&copy; 2026 Pharma Alyosr. All rights reserved.</p>");
		html.append("</div>");

		html.append("</div>");
		html.append("</body>");
		html.append("</html>");

		return html.toString();
	}
}
