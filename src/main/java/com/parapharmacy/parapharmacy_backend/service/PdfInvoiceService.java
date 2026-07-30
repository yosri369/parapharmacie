package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.entity.Order;
import com.parapharmacy.parapharmacy_backend.entity.OrderItem;
import com.parapharmacy.parapharmacy_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfInvoiceService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public String generateInvoiceHtml(Long orderId, String currentUserEmail, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        if (!isAdmin && !order.getUser().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new RuntimeException("Accès refusé à cette facture");
        }

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = order.getCreatedAt() != null ? order.getCreatedAt().format(dateFmt) : "";

        BigDecimal subtotal = BigDecimal.ZERO;
        StringBuilder itemsHtml = new StringBuilder();

        for (OrderItem item : order.getItems()) {
            subtotal = subtotal.add(item.getSubtotal());
            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <strong style="color: #0f172a; display: block;">%s</strong>
                        <span style="color: #64748b; font-size: 12px;">%s</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155;">%d</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155;">%.2f TND</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">%.2f TND</td>
                </tr>
            """,
            escapeHtml(item.getProduct().getName()),
            escapeHtml(item.getProduct().getBrand() != null ? item.getProduct().getBrand() : "PharmaAlyosr"),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getSubtotal()
            ));
        }

        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : subtotal.subtract(discount);
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("50")) >= 0 ? BigDecimal.ZERO : new BigDecimal("7.00");

        return String.format("""
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Facture #%d - PharmaAlyosr</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header-table { width: 100%%; margin-bottom: 30px; }
                    .logo { font-size: 26px; font-weight: 800; color: #071a12; text-decoration: none; }
                    .logo span { color: #16a34a; }
                    .badge { background: #f0fdf4; color: #16a34a; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; border: 1px solid #bbf7d0; display: inline-block; }
                    .info-grid { width: 100%%; margin-bottom: 30px; border-collapse: collapse; }
                    .info-grid td { width: 50%%; vertical-align: top; }
                    .section-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                    .items-table { width: 100%%; border-collapse: collapse; margin-bottom: 30px; }
                    .items-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
                    .totals-table { width: 300px; margin-left: auto; border-collapse: collapse; }
                    .totals-table td { padding: 8px 12px; text-align: right; }
                    .grand-total { font-size: 18px; font-weight: 800; color: #16a34a; border-top: 2px solid #e2e8f0; }
                    .footer { margin-top: 40px; pt-20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
                    @media print {
                        body { padding: 0; }
                        .invoice-box { border: none; box-shadow: none; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <table class="header-table">
                        <tr>
                            <td>
                                <div class="logo">Pharma<span>Alyosr</span></div>
                                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Parapharmacie & Produits de Bien-être</div>
                                <div style="color: #94a3b8; font-size: 12px;">Tunis, Tunisie · contact@pharmaalyosr.tn</div>
                            </td>
                            <td style="text-align: right;">
                                <h1 style="margin: 0; font-size: 24px; color: #0f172a;">FACTURE</h1>
                                <div style="color: #64748b; font-size: 14px; font-weight: bold; margin-top: 4px;">N° FA-%06d</div>
                                <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Date: %s</div>
                                <div style="margin-top: 8px;"><span class="badge">PAYÉE / CONFIRMÉE</span></div>
                            </td>
                        </tr>
                    </table>

                    <table class="info-grid">
                        <tr>
                            <td>
                                <div class="section-title">Facturé à :</div>
                                <div style="font-weight: bold; color: #0f172a; font-size: 15px;">%s %s</div>
                                <div style="color: #475569; font-size: 13px; margin-top: 2px;">%s</div>
                                <div style="color: #475569; font-size: 13px;">%s, %s</div>
                                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">📞 %s</div>
                                <div style="color: #64748b; font-size: 13px;">✉️ %s</div>
                            </td>
                            <td style="text-align: right;">
                                <div class="section-title">Mode de Paiement :</div>
                                <div style="font-weight: bold; color: #0f172a; font-size: 14px;">Paiement Sécurisé Konnect / Monétique</div>
                                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Livraison Express 24-48h</div>
                            </td>
                        </tr>
                    </table>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Désignation</th>
                                <th style="text-align: center;">Qté</th>
                                <th style="text-align: right;">Prix unitaire</th>
                                <th style="text-align: right;">Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>

                    <table class="totals-table">
                        <tr>
                            <td style="color: #64748b;">Sous-total HT:</td>
                            <td style="font-weight: bold; color: #0f172a;">%.2f TND</td>
                        </tr>
                        %s
                        <tr>
                            <td style="color: #64748b;">Frais de livraison:</td>
                            <td style="font-weight: bold; color: #0f172a;">%s</td>
                        </tr>
                        <tr class="grand-total">
                            <td>Total TTC:</td>
                            <td>%.2f TND</td>
                        </tr>
                    </table>

                    <div class="footer">
                        Merci pour votre confiance ! Pour toute assistance, contactez-nous à support@pharmaalyosr.tn<br>
                        PharmaAlyosr S.A.R.L - Matrice Fiscale / MF: 1748293/A/M/000
                    </div>
                </div>
            </body>
            </html>
        """,
        order.getId(),
        order.getId(),
        formattedDate,
        escapeHtml(order.getShippingFirstName()),
        escapeHtml(order.getShippingLastName()),
        escapeHtml(order.getShippingAddress()),
        escapeHtml(order.getShippingCity()),
        escapeHtml(order.getShippingCountry()),
        escapeHtml(order.getShippingPhone()),
        escapeHtml(order.getUser().getEmail()),
        itemsHtml.toString(),
        subtotal,
        discount.compareTo(BigDecimal.ZERO) > 0 ? String.format("<tr><td style=\"color: #16a34a;\">Réduction Code Promo (%s):</td><td style=\"font-weight: bold; color: #16a34a;\">-%.2f TND</td></tr>", escapeHtml(order.getAppliedPromoCode()), discount) : "",
        shipping.compareTo(BigDecimal.ZERO) == 0 ? "Gratuit" : String.format("%.2f TND", shipping),
        total
        );
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
