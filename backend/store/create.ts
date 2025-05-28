import { api, APIError } from "encore.dev/api";
import { storeDB } from "./db";
import type { CreateStoreRequest, StoreResponse } from "./types";

// Creates a new store for a user.
export const create = api<CreateStoreRequest, StoreResponse>(
  { expose: true, method: "POST", path: "/stores" },
  async (req) => {
    // Check if slug is already taken
    const existingStore = await storeDB.queryRow`
      SELECT id FROM stores WHERE slug = ${req.slug}
    `;
    
    if (existingStore) {
      throw APIError.alreadyExists("store with this slug already exists");
    }

    const store = await storeDB.queryRow<{
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
    }>`
      INSERT INTO stores (user_id, name, description, slug, logo_url, domain)
      VALUES (${req.userId}, ${req.name}, ${req.description || null}, ${req.slug}, ${req.logoUrl || null}, ${req.domain || null})
      RETURNING *
    `;

    if (!store) {
      throw APIError.internal("failed to create store");
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
