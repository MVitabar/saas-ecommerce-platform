import { api, APIError } from "encore.dev/api";
import { cartDB } from "./db";
import type { CartResponse } from "./types";

// Retrieves a cart by session ID.
export const get = api<{ sessionId: string }, CartResponse>(
  { expose: true, method: "GET", path: "/cart/:sessionId" },
  async ({ sessionId }) => {
    const cart = await cartDB.queryRow<{
      id: number;
      session_id: string;
      customer_email: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM carts WHERE session_id = ${sessionId}
    `;

    if (!cart) {
      throw APIError.notFound("cart not found");
    }

    const cartItems = await cartDB.queryAll<{
      id: number;
      cart_id: number;
      product_id: number;
      store_id: number;
      quantity: number;
      price_at_time: number;
      variant_data: any;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM cart_items WHERE cart_id = ${cart.id}
    `;

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

    return {
      cart: {
        id: cart.id,
        sessionId: cart.session_id,
        customerEmail: cart.customer_email || undefined,
        items: cartItems.map(item => ({
          id: item.id,
          cartId: item.cart_id,
          productId: item.product_id,
          storeId: item.store_id,
          quantity: item.quantity,
          priceAtTime: item.price_at_time,
          variantData: item.variant_data,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        totalAmount,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at,
      }
    };
  }
);
