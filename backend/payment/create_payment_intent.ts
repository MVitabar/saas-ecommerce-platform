import { api, APIError } from "encore.dev/api";
import { stripeSecretKey } from "./stripe_config";
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "./types";

// Creates a Stripe payment intent for an order.
export const createPaymentIntent = api<CreatePaymentIntentRequest, CreatePaymentIntentResponse>(
  { expose: true, method: "POST", path: "/payment/intent" },
  async (req) => {
    try {
      // Note: In a real implementation, you would use the Stripe SDK
      // For this example, we'll simulate the response
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

      // Here you would typically:
      // const stripe = new Stripe(stripeSecretKey());
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: req.amount,
      //   currency: req.currency,
      //   metadata: { orderId: req.orderId.toString() }
      // });

      return {
        clientSecret,
        paymentIntentId,
      };
    } catch (error) {
      throw APIError.internal("failed to create payment intent");
    }
  }
);
