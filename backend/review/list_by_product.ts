import { api } from "encore.dev/api";
import { reviewDB } from "./db";
import type { ReviewsListResponse } from "./types";

// Retrieves all approved reviews for a product.
export const listByProduct = api<{ productId: number }, ReviewsListResponse>(
  { expose: true, method: "GET", path: "/reviews/product/:productId" },
  async ({ productId }) => {
    const reviews = await reviewDB.queryAll<{
      id: number;
      product_id: number;
      store_id: number;
      customer_email: string;
      customer_name: string;
      rating: number;
      title: string | null;
      comment: string | null;
      images: any;
      verified_purchase: boolean;
      helpful_count: number;
      status: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM reviews 
      WHERE product_id = ${productId} AND status = 'approved'
      ORDER BY created_at DESC
    `;

    const stats = await reviewDB.queryRow<{
      total_count: number;
      average_rating: number;
    }>`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews 
      WHERE product_id = ${productId} AND status = 'approved'
    `;

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        productId: review.product_id,
        storeId: review.store_id,
        customerEmail: review.customer_email,
        customerName: review.customer_name,
        rating: review.rating,
        title: review.title || undefined,
        comment: review.comment || undefined,
        images: review.images || [],
        verifiedPurchase: review.verified_purchase,
        helpfulCount: review.helpful_count,
        status: review.status as 'pending' | 'approved' | 'rejected',
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      })),
      totalCount: stats?.total_count || 0,
      averageRating: stats?.average_rating || 0,
    };
  }
);
