import { api } from "encore.dev/api";
import { orderDB } from "./db";
import type { OrdersListResponse } from "./types";

// Retrieves all orders for a specific store.
export const listByStore = api<{ storeId: number }, OrdersListResponse>(
  { expose: true, method: "GET", path: "/orders/store/:storeId" },
  async ({ storeId }) => {
    const orders = await orderDB.queryAll<{
      id: number;
      store_id: number;
      customer_email: string;
      customer_name: string;
      total_amount: number;
      status: string;
      stripe_payment_intent_id: string | null;
      shipping_address: any;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM orders WHERE store_id = ${storeId} ORDER BY created_at DESC
    `;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await orderDB.queryAll<{
          id: number;
          order_id: number;
          product_id: number;
          product_name: string;
          product_price: number;
          quantity: number;
          created_at: Date;
        }>`
          SELECT * FROM order_items WHERE order_id = ${order.id} ORDER BY id
        `;

        return {
          id: order.id,
          storeId: order.store_id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          totalAmount: order.total_amount * 100, // Convert to cents for frontend
          status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled',
          stripePaymentIntentId: order.stripe_payment_intent_id || undefined,
          shippingAddress: order.shipping_address || undefined,
          items: items.map(item => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            productName: item.product_name,
            productPrice: item.product_price * 100, // Convert to cents for frontend
            quantity: item.quantity,
            createdAt: item.created_at,
          })),
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        };
      })
    );

    return { orders: ordersWithItems };
  }
);
