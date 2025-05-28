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

    // Check if SKU is unique (if being updated)
    if (updates.sku) {
      const existingProduct = await productDB.queryRow`
        SELECT id FROM products WHERE sku = ${updates.sku} AND id != ${id}
      `;
      
      if (existingProduct) {
        throw APIError.alreadyExists("product with this SKU already exists");
      }
    }

    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Handle backward compatibility for isActive
    if (updates.isActive !== undefined) {
      updates.status = updates.isActive ? 'active' : 'inactive';
    }

    // Handle images array (backward compatibility)
    if (updates.images !== undefined || updates.imageUrl !== undefined) {
      let images = updates.images || [];
      if (updates.imageUrl && !images.includes(updates.imageUrl)) {
        images = [updates.imageUrl, ...images];
      }
      setParts.push(`images = $${paramIndex++}`);
      values.push(JSON.stringify(images));
    }

    // Update all other fields
    const fieldMappings = {
      categoryId: 'category_id',
      name: 'name',
      description: 'description',
      brand: 'brand',
      sku: 'sku',
      price: 'price',
      weight: 'weight',
      dimensions: 'dimensions',
      attributes: 'attributes',
      variants: 'variants',
      tags: 'tags',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description',
      seoKeywords: 'seo_keywords',
      inventory: 'inventory',
      featured: 'featured',
      discountType: 'discount_type',
      discountValue: 'discount_value',
      discountStartDate: 'discount_start_date',
      discountEndDate: 'discount_end_date',
      minOrderQuantity: 'min_order_quantity',
      maxOrderQuantity: 'max_order_quantity',
      shippingClass: 'shipping_class',
      status: 'status',
    };

    Object.entries(fieldMappings).forEach(([jsField, dbField]) => {
      if (updates[jsField as keyof UpdateProductRequest] !== undefined) {
        let value = updates[jsField as keyof UpdateProductRequest];
        
        // Handle JSON fields
        if (['dimensions', 'attributes', 'variants'].includes(jsField)) {
          value = JSON.stringify(value);
        }
        
        setParts.push(`${dbField} = $${paramIndex++}`);
        values.push(value);
      }
    });

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
    }>(query, ...values);

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
        isActive: product.status === 'active',
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }
    };
  }
);
