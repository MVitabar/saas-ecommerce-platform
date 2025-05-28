import { api } from "encore.dev/api";
import { productDB } from "./db";
import type { ProductsListResponse } from "./types";

// Retrieves all active products for a specific store (public endpoint).
export const listActiveByStore = api<{ storeId: number }, ProductsListResponse>(
  { expose: true, method: "GET", path: "/products/store/:storeId/active" },
  async ({ storeId }) => {
    const products = await productDB.queryAll<{
      id: number;
      store_id: number;
      name: string;
      description: string | null;
      price: number;
      image_url: string | null;
      inventory: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM products 
      WHERE store_id = ${storeId} AND is_active = true AND inventory > 0
      ORDER BY created_at DESC
    `;

    return {
      products: products.map(product => ({
        id: product.id,
        storeId: product.store_id,
        name: product.name,
        description: product.description || undefined,
        price: product.price,
        imageUrl: product.image_url || undefined,
        inventory: product.inventory,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }))
    };
  }
);
