export interface CreatePaymentIntentRequest {
  orderId: number;
  amount: number; // Amount in cents
  currency: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  orderId: number;
}

export interface CreateSubscriptionRequest {
  userId: number;
  priceId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
}
