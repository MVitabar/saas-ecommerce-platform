import { api, APIError } from "encore.dev/api";
import { cartDB } from "./db";
import { productDB } from "../product/db";
import type { AddToCartRequest, CartResponse } from "./types";

// Adds an item to the cart.
export const addItem = api<AddToCartRequest, CartResponse>(
  { expose: true, method: "POST", path: "/cart/items" },
  async (req) => {
    // Get or create cart
    let cart = await cartDB.queryRow<{
      id: number;
      session_id: string;
      customer_email: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM carts WHERE session_id = ${req.sessionId}
    `;

    if (!cart) {
      cart = await cartDB.queryRow<{
        id: number;
        session_id: string;
        customer_email: string | null;
        created_at: Date;
        updated_at: Date;
      }>`
        INSERT INTO carts (session_id, customer_email)
        VALUES (${req.sessionId}, ${req.customerEmail || null})
        RETURNING *
      `;
    }

    if (!cart) {
      throw APIError.internal("failed to create cart");
    }

    // Get product details
    const product = await productDB.queryRow<{
      id: number;
      price: number;
      inventory: number;
      is_active: boolean;
    }>`
      SELECT id, price, inventory, is_active FROM products WHERE id = ${req.productId}
    `;

    if (!product) {
      throw APIError.notFound("product not found");
    }

    if (!product.is_active) {
      throw APIError.invalidArgument("product is not available");
    }

    if (product.inventory < req.quantity) {
      throw APIError.invalidArgument("insufficient inventory");
    }

    // Check if item already exists in cart
    const existingItem = await cartDB.queryRow<{
      id: number;
      quantity: number;
    }>`
      SELECT id, quantity FROM cart_items 
      WHERE cart_id = ${cart.id} AND product_id = ${req.productId} 
      AND variant_data = ${JSON.stringify(req.variantData || null)}
    `;

    let cartItem;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + req.quantity;
      if (product.inventory < newQuantity) {
        throw APIError.invalidArgument("insufficient inventory for requested quantity");
      }

      cartItem = await cartDB.queryRow`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = NOW()
        WHERE id = ${existingItem.id}
        RETURNING *
      `;
    } else {
      // Add new item
      cartItem = await cartDB.queryRow`
        INSERT INTO cart_items (cart_id, product_id, store_id, quantity, price_at_time, variant_data)
        VALUES (${cart.id}, ${req.productId}, ${req.storeId}, ${req.quantity}, ${product.price}, ${JSON.stringify(req.variantData || null)})
        RETURNING *
      `;
    }

    // Get updated cart with all items
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
