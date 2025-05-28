import { api, APIError } from "encore.dev/api";
import { productDB } from "./db";
import type { CreateProductRequest, ProductResponse } from "./types";

// Creates a new product for a store.
export const create = api<CreateProductRequest, ProductResponse>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    if (req.price < 0) {
      throw APIError.invalidArgument("price must be non-negative");
    }

    if (req.inventory < 0) {
      throw APIError.invalidArgument("inventory must be non-negative");
    }

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
      INSERT INTO products (store_id, name, description, price, image_url, inventory)
      VALUES (${req.storeId}, ${req.name}, ${req.description || null}, ${req.price}, ${req.imageUrl || null}, ${req.inventory})
      RETURNING *
    `;

    if (!product) {
      throw APIError.internal("failed to create product");
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
