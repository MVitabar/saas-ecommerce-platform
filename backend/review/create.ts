import { api, APIError } from "encore.dev/api";
import { reviewDB } from "./db";
import type { CreateReviewRequest, ReviewResponse } from "./types";

// Creates a new product review.
export const create = api<CreateReviewRequest, ReviewResponse>(
  { expose: true, method: "POST", path: "/reviews" },
  async (req) => {
    if (req.rating < 1 || req.rating > 5) {
      throw APIError.invalidArgument("rating must be between 1 and 5");
    }

    const review = await reviewDB.queryRow<{
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
      INSERT INTO reviews (product_id, store_id, customer_email, customer_name, rating, title, comment, images)
      VALUES (${req.productId}, ${req.storeId}, ${req.customerEmail}, ${req.customerName}, ${req.rating}, ${req.title || null}, ${req.comment || null}, ${JSON.stringify(req.images || [])})
      RETURNING *
    `;

    if (!review) {
      throw APIError.internal("failed to create review");
    }

    return {
      review: {
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
      }
    };
  }
);
