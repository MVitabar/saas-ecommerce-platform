import { api, APIError } from "encore.dev/api";
import { storeDB } from "./db";
import type { UpdateStoreRequest, StoreResponse } from "./types";

// Updates a store's information.
export const update = api<{ id: number } & UpdateStoreRequest, StoreResponse>(
  { expose: true, method: "PUT", path: "/stores/:id" },
  async ({ id, ...updates }) => {
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
    if (updates.slug !== undefined) {
      // Check if new slug is already taken
      const existingStore = await storeDB.queryRow`
        SELECT id FROM stores WHERE slug = ${updates.slug} AND id != ${id}
      `;
      
      if (existingStore) {
        throw APIError.alreadyExists("store with this slug already exists");
      }
      
      setParts.push(`slug = $${paramIndex++}`);
      values.push(updates.slug);
    }
    if (updates.logoUrl !== undefined) {
      setParts.push(`logo_url = $${paramIndex++}`);
      values.push(updates.logoUrl);
    }
    if (updates.domain !== undefined) {
      setParts.push(`domain = $${paramIndex++}`);
      values.push(updates.domain);
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
      UPDATE stores 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const store = await storeDB.rawQueryRow<{
      id: number;
      user_id: number;
      name: string;
      description: string | null;
      slug: string;
      logo_url: string | null;
      domain: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!store) {
      throw APIError.notFound("store not found");
    }

    return {
      store: {
        id: store.id,
        userId: store.user_id,
        name: store.name,
        description: store.description || undefined,
        slug: store.slug,
        logoUrl: store.logo_url || undefined,
        domain: store.domain || undefined,
        isActive: store.is_active,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
      }
    };
  }
);
