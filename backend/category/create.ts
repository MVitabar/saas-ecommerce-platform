import { api, APIError } from "encore.dev/api";
import { categoryDB } from "./db";
import type { CreateCategoryRequest, CategoryResponse } from "./types";

// Creates a new category.
export const create = api<CreateCategoryRequest, CategoryResponse>(
  { expose: true, method: "POST", path: "/categories" },
  async (req) => {
    // Check if slug is already taken
    const existingCategory = await categoryDB.queryRow`
      SELECT id FROM categories WHERE slug = ${req.slug}
    `;
    
    if (existingCategory) {
      throw APIError.alreadyExists("category with this slug already exists");
    }

    const category = await categoryDB.queryRow<{
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
      INSERT INTO categories (name, slug, description, parent_id, image_url, icon_url, sort_order, meta_title, meta_description)
      VALUES (${req.name}, ${req.slug}, ${req.description || null}, ${req.parentId || null}, ${req.imageUrl || null}, ${req.iconUrl || null}, ${req.sortOrder || 0}, ${req.metaTitle || null}, ${req.metaDescription || null})
      RETURNING *
    `;

    if (!category) {
      throw APIError.internal("failed to create category");
    }

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        parentId: category.parent_id || undefined,
        imageUrl: category.image_url || undefined,
        iconUrl: category.icon_url || undefined,
        sortOrder: category.sort_order,
        isActive: category.is_active,
        metaTitle: category.meta_title || undefined,
        metaDescription: category.meta_description || undefined,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }
    };
  }
);
