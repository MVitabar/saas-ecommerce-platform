import { api, APIError } from "encore.dev/api";
import { orderDB } from "./db";
import { productDB } from "../product/db";
import type { CreateOrderRequest, OrderResponse } from "./types";

// Creates a new order.
export const create = api<CreateOrderRequest, OrderResponse>(
  { expose: true, method: "POST", path: "/orders" },
  async (req) => {
    if (req.items.length === 0) {
      throw APIError.invalidArgument("order must contain at least one item");
    }

    // Start transaction
    const tx = await orderDB.begin();
    
    try {
      // Fetch product details and calculate total
      let totalAmount = 0;
      const orderItems: Array<{
        productId: number;
        productName: string;
        productPrice: number;
        quantity: number;
      }> = [];

      for (const item of req.items) {
        const product = await productDB.queryRow<{
          id: number;
          name: string;
          price: number;
          inventory: number;
          is_active: boolean;
        }>`
          SELECT id, name, price, inventory, is_active 
          FROM products 
          WHERE id = ${item.productId}
        `;

        if (!product) {
          throw APIError.notFound(`product with id ${item.productId} not found`);
        }

        if (!product.is_active) {
          throw APIError.invalidArgument(`product ${product.name} is not available`);
        }

        if (product.inventory < item.quantity) {
          throw APIError.invalidArgument(`insufficient inventory for product ${product.name}`);
        }

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
        });

        totalAmount += product.price * item.quantity;
      }

      // Create order
      const order = await tx.queryRow<{
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
        INSERT INTO orders (store_id, customer_email, customer_name, total_amount, shipping_address)
        VALUES (${req.storeId}, ${req.customerEmail}, ${req.customerName}, ${totalAmount}, ${JSON.stringify(req.shippingAddress || null)})
        RETURNING *
      `;

      if (!order) {
        throw APIError.internal("failed to create order");
      }

      // Create order items
      const items: Array<{
        id: number;
        order_id: number;
        product_id: number;
        product_name: string;
        product_price: number;
        quantity: number;
        created_at: Date;
      }> = [];

      for (const item of orderItems) {
        const orderItem = await tx.queryRow<{
          id: number;
          order_id: number;
          product_id: number;
          product_name: string;
          product_price: number;
          quantity: number;
          created_at: Date;
        }>`
          INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
          VALUES (${order.id}, ${item.productId}, ${item.productName}, ${item.productPrice}, ${item.quantity})
          RETURNING *
        `;

        if (orderItem) {
          items.push(orderItem);
        }

        // Update product inventory
        await productDB.exec`
          UPDATE products 
          SET inventory = inventory - ${item.quantity}
          WHERE id = ${item.productId}
        `;
      }

      await tx.commit();

      return {
        order: {
          id: order.id,
          storeId: order.store_id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          totalAmount: order.total_amount,
          status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled',
          stripePaymentIntentId: order.stripe_payment_intent_id || undefined,
          shippingAddress: order.shipping_address || undefined,
          items: items.map(item => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            productName: item.product_name,
            productPrice: item.product_price,
            quantity: item.quantity,
            createdAt: item.created_at,
          })),
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        }
      };
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
);
