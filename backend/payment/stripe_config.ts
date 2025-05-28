import { secret } from "encore.dev/config";

export const stripeSecretKey = secret("StripeSecretKey");
export const stripeWebhookSecret = secret("StripeWebhookSecret");
