import { api, APIError } from "encore.dev/api";
import { orderDB } from "../order/db";
import type { ConfirmPaymentRequest, ConfirmPaymentResponse } from "./types";

// Confirms a payment and updates the order status.
export const confirmPayment = api<ConfirmPaymentRequest, ConfirmPaymentResponse>(
  { expose: true, method: "POST", path: "/payment/confirm" },
  async (req) => {
    try {
      // Update order status to paid
      await orderDB.exec`
        UPDATE orders 
        SET status = 'paid', stripe_payment_intent_id = ${req.paymentIntentId}, updated_at = NOW()
        WHERE id = ${req.orderId}
      `;

      return {
        success: true,
        orderId: req.orderId,
      };
    } catch (error) {
      throw APIError.internal("failed to confirm payment");
    }
  }
);
