import { api } from "encore.dev/api";
import { storeDB } from "./db";
import type { StoresListResponse } from "./types";

// Retrieves all stores for a specific user.
export const listByUser = api<{ userId: number }, StoresListResponse>(
  { expose: true, method: "GET", path: "/stores/user/:userId" },
  async ({ userId }) => {
    const stores = await storeDB.queryAll<{
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
      SELECT * FROM stores WHERE user_id = ${userId} ORDER BY created_at DESC
    `;

    return {
      stores: stores.map(store => ({
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
      }))
    };
  }
);
