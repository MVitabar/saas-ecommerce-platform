import { api, APIError } from "encore.dev/api";
import { storeDB } from "./db";
import type { StoreResponse } from "./types";

// Retrieves a store by slug.
export const getBySlug = api<{ slug: string }, StoreResponse>(
  { expose: true, method: "GET", path: "/stores/slug/:slug" },
  async ({ slug }) => {
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
      SELECT * FROM stores WHERE slug = ${slug} AND is_active = true
    `;

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
