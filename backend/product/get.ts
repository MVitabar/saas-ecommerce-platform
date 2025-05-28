import { api, APIError } from "encore.dev/api";
import { productDB } from "./db";
import type { ProductResponse } from "./types";

// Retrieves a product by ID.
export const get = api<{ id: number }, ProductResponse>(
  { expose: true, method: "GET", path: "/products/:id" },
  async ({ id }) => {
    const product = await productDB.queryRow<{
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
      SELECT * FROM products WHERE id = ${id}
    `;

    if (!product) {
      throw APIError.notFound("product not found");
    }

    return {
      product: {
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
      }
    };
  }
);
