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

    // Check if SKU is unique (if provided)
    if (req.sku) {
      const existingProduct = await productDB.queryRow`
        SELECT id FROM products WHERE sku = ${req.sku}
      `;
      
      if (existingProduct) {
        throw APIError.alreadyExists("product with this SKU already exists");
      }
    }

    // Prepare images array (backward compatibility)
    let images = req.images || [];
    if (req.imageUrl && !images.includes(req.imageUrl)) {
      images = [req.imageUrl, ...images];
    }

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
      INSERT INTO products (
        store_id, category_id, name, description, brand, sku, price, weight, dimensions,
        attributes, variants, images, tags, meta_title, meta_description, seo_keywords,
        inventory, featured, discount_type, discount_value, discount_start_date, discount_end_date,
        min_order_quantity, max_order_quantity, shipping_class
      )
      VALUES (
        ${req.storeId}, ${req.categoryId || null}, ${req.name}, ${req.description || null}, 
        ${req.brand || null}, ${req.sku || null}, ${req.price}, ${req.weight || null}, 
        ${JSON.stringify(req.dimensions || null)}, ${JSON.stringify(req.attributes || {})}, 
        ${JSON.stringify(req.variants || [])}, ${JSON.stringify(images)}, 
        ${req.tags || []}, ${req.metaTitle || null}, ${req.metaDescription || null}, 
        ${req.seoKeywords || []}, ${req.inventory}, ${req.featured || false}, 
        ${req.discountType || 'none'}, ${req.discountValue || 0}, 
        ${req.discountStartDate || null}, ${req.discountEndDate || null}, 
        ${req.minOrderQuantity || 1}, ${req.maxOrderQuantity || null}, 
        ${req.shippingClass || 'standard'}
      )
      RETURNING *
    `;

    if (!product) {
      throw APIError.internal("failed to create product");
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
