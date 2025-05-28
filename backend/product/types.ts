export interface Product {
  id: number;
  storeId: number;
  name: string;
  description?: string;
  price: number; // Price in cents
  imageUrl?: string;
  inventory: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  storeId: number;
  name: string;
  description?: string;
  price: number; // Price in cents
  imageUrl?: string;
  inventory: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number; // Price in cents
  imageUrl?: string;
  inventory?: number;
  isActive?: boolean;
}

export interface ProductResponse {
  product: Product;
}

export interface ProductsListResponse {
  products: Product[];
}
