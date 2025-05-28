export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number; // Price in cents
  quantity: number;
  createdAt: Date;
}

export interface Order {
  id: number;
  storeId: number;
  customerEmail: string;
  customerName: string;
  totalAmount: number; // Total in cents
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  stripePaymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  storeId: number;
  customerEmail: string;
  customerName: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress?: ShippingAddress;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  stripePaymentIntentId?: string;
}

export interface OrderResponse {
  order: Order;
}

export interface OrdersListResponse {
  orders: Order[];
}
