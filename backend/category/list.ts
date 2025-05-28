import { api } from "encore.dev/api";
import { categoryDB } from "./db";
import type { CategoriesListResponse } from "./types";

// Retrieves all categories with hierarchical structure.
export const list = api<void, CategoriesListResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const categories = await categoryDB.queryAll<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      parent_id: number | null;
      image_url: string | null;
      icon_url: string | null;
      sort_order: number;
      is_active: boolean;
      meta_title: string | null;
      meta_description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name
    `;

    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create all category objects
    categories.forEach(cat => {
      const category = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || undefined,
        parentId: cat.parent_id || undefined,
        imageUrl: cat.image_url || undefined,
        iconUrl: cat.icon_url || undefined,
        sortOrder: cat.sort_order,
        isActive: cat.is_active,
        metaTitle: cat.meta_title || undefined,
        metaDescription: cat.meta_description || undefined,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
        children: [],
      };
      categoryMap.set(cat.id, category);
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return { categories: rootCategories };
  }
);
