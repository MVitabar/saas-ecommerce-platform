export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  storeId: number;
  quantity: number;
  priceAtTime: number;
  variantData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: number;
  sessionId: string;
  customerEmail?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  sessionId: string;
  productId: number;
  storeId: number;
  quantity: number;
  customerEmail?: string;
  variantData?: any;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
}

export interface CartResponse {
  cart: Cart;
}
