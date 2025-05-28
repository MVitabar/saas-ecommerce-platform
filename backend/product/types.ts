export interface Product {
  id: number;
  storeId: number;
  categoryId?: number;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  price: number; // Price in cents
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  attributes?: Record<string, any>;
  variants?: ProductVariant[];
  images: string[];
  imageUrl?: string; // Main image for backward compatibility
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords: string[];
  rating: number;
  totalReviews: number;
  totalSales: number;
  inventory: number;
  featured: boolean;
  discountType: 'none' | 'percentage' | 'fixed';
  discountValue: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  shippingClass: string;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isActive: boolean; // Backward compatibility
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price?: number;
  sku?: string;
  inventory?: number;
  images?: string[];
}

export interface CreateProductRequest {
  storeId: number;
  categoryId?: number;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  price: number; // Price in cents
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  attributes?: Record<string, any>;
  variants?: ProductVariant[];
  images?: string[];
  imageUrl?: string; // Backward compatibility
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  inventory: number;
  featured?: boolean;
  discountType?: 'none' | 'percentage' | 'fixed';
  discountValue?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  shippingClass?: string;
}

export interface UpdateProductRequest {
  categoryId?: number;
  name?: string;
  description?: string;
  brand?: string;
  sku?: string;
  price?: number; // Price in cents
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  attributes?: Record<string, any>;
  variants?: ProductVariant[];
  images?: string[];
  imageUrl?: string; // Backward compatibility
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  inventory?: number;
  featured?: boolean;
  discountType?: 'none' | 'percentage' | 'fixed';
  discountValue?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  shippingClass?: string;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isActive?: boolean; // Backward compatibility
}

export interface ProductResponse {
  product: Product;
}

export interface ProductsListResponse {
  products: Product[];
  totalCount?: number;
  filters?: {
    categories: { id: number; name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    tags: { name: string; count: number }[];
  };
}

export interface ProductSearchRequest {
  storeId?: number;
  categoryId?: number;
  query?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'rating' | 'sales' | 'newest';
  limit?: number;
  offset?: number;
}
