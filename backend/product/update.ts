import { api, APIError } from "encore.dev/api";
import { productDB } from "./db";
import type { UpdateProductRequest, ProductResponse } from "./types";

// Updates a product's information.
export const update = api<{ id: number } & UpdateProductRequest, ProductResponse>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async ({ id, ...updates }) => {
    if (updates.price !== undefined && updates.price < 0) {
      throw APIError.invalidArgument("price must be non-negative");
    }

    if (updates.inventory !== undefined && updates.inventory < 0) {
      throw APIError.invalidArgument("inventory must be non-negative");
    }

    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      setParts.push(`price = $${paramIndex++}`);
      values.push(updates.price);
    }
    if (updates.imageUrl !== undefined) {
      setParts.push(`image_url = $${paramIndex++}`);
      values.push(updates.imageUrl);
    }
    if (updates.inventory !== undefined) {
      setParts.push(`inventory = $${paramIndex++}`);
      values.push(updates.inventory);
    }
    if (updates.isActive !== undefined) {
      setParts.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    setParts.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE products 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const product = await productDB.rawQueryRow<{
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
    }>(query, ...values);

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
