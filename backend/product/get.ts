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
      category_id: number | null;
      name: string;
      description: string | null;
      brand: string | null;
      sku: string | null;
      price: number;
      weight: number | null;
      dimensions: any;
      attributes: any;
      variants: any;
      images: any;
      tags: string[];
      meta_title: string | null;
      meta_description: string | null;
      seo_keywords: string[];
      rating: number;
      total_reviews: number;
      total_sales: number;
      inventory: number;
      featured: boolean;
      discount_type: string;
      discount_value: number;
      discount_start_date: Date | null;
      discount_end_date: Date | null;
      min_order_quantity: number;
      max_order_quantity: number | null;
      shipping_class: string;
      status: string;
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
        categoryId: product.category_id || undefined,
        name: product.name,
        description: product.description || undefined,
        brand: product.brand || undefined,
        sku: product.sku || undefined,
        price: product.price,
        weight: product.weight || undefined,
        dimensions: product.dimensions || undefined,
        attributes: product.attributes || {},
        variants: product.variants || [],
        images: product.images || [],
        imageUrl: (product.images && product.images[0]) || undefined,
        tags: product.tags || [],
        metaTitle: product.meta_title || undefined,
        metaDescription: product.meta_description || undefined,
        seoKeywords: product.seo_keywords || [],
        rating: product.rating,
        totalReviews: product.total_reviews,
        totalSales: product.total_sales,
        inventory: product.inventory,
        featured: product.featured,
        discountType: product.discount_type as 'none' | 'percentage' | 'fixed',
        discountValue: product.discount_value,
        discountStartDate: product.discount_start_date || undefined,
        discountEndDate: product.discount_end_date || undefined,
        minOrderQuantity: product.min_order_quantity,
        maxOrderQuantity: product.max_order_quantity || undefined,
        shippingClass: product.shipping_class,
        status: product.status as 'active' | 'inactive' | 'out_of_stock' | 'discontinued',
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }
    };
  }
);
