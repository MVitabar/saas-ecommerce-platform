export interface Review {
  id: number;
  productId: number;
  storeId: number;
  customerEmail: string;
  customerName: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  productId: number;
  storeId: number;
  customerEmail: string;
  customerName: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewResponse {
  review: Review;
}

export interface ReviewsListResponse {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
}
