import { api, APIError } from "encore.dev/api";
import { stripeSecretKey } from "./stripe_config";
import type { CancelSubscriptionRequest, CancelSubscriptionResponse } from "./types";

// Cancels a Stripe subscription.
export const cancelSubscription = api<CancelSubscriptionRequest, CancelSubscriptionResponse>(
  { expose: true, method: "POST", path: "/payment/subscription/cancel" },
  async (req) => {
    try {
      // Note: In a real implementation, you would use the Stripe SDK
      // For this example, we'll simulate the response
      
      // Here you would typically:
      // const stripe = new Stripe(stripeSecretKey());
      // await stripe.subscriptions.update(req.subscriptionId, {
      //   cancel_at_period_end: true
      // });

      return {
        success: true,
      };
    } catch (error) {
      throw APIError.internal("failed to cancel subscription");
    }
  }
);
