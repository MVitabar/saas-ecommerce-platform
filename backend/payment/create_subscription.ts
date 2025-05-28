import { api, APIError } from "encore.dev/api";
import { stripeSecretKey } from "./stripe_config";
import { userDB } from "../user/db";
import type { CreateSubscriptionRequest, CreateSubscriptionResponse } from "./types";

// Creates a Stripe subscription for a user.
export const createSubscription = api<CreateSubscriptionRequest, CreateSubscriptionResponse>(
  { expose: true, method: "POST", path: "/payment/subscription" },
  async (req) => {
    try {
      // Get user details
      const user = await userDB.queryRow<{
        id: number;
        email: string;
        stripe_customer_id: string | null;
      }>`
        SELECT id, email, stripe_customer_id FROM users WHERE id = ${req.userId}
      `;

      if (!user) {
        throw APIError.notFound("user not found");
      }

      // Note: In a real implementation, you would use the Stripe SDK
      // For this example, we'll simulate the response
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clientSecret = `${subscriptionId}_secret_${Math.random().toString(36).substr(2, 9)}`;

      // Here you would typically:
      // const stripe = new Stripe(stripeSecretKey());
      // 
      // let customerId = user.stripe_customer_id;
      // if (!customerId) {
      //   const customer = await stripe.customers.create({
      //     email: user.email,
      //     metadata: { userId: user.id.toString() }
      //   });
      //   customerId = customer.id;
      //   
      //   await userDB.exec`
      //     UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}
      //   `;
      // }
      //
      // const subscription = await stripe.subscriptions.create({
      //   customer: customerId,
      //   items: [{ price: req.priceId }],
      //   payment_behavior: 'default_incomplete',
      //   expand: ['latest_invoice.payment_intent'],
      // });

      return {
        subscriptionId,
        clientSecret,
      };
    } catch (error) {
      throw APIError.internal("failed to create subscription");
    }
  }
);
