import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import type { CreateUserRequest, UserResponse } from "./types";

// Creates a new user account.
export const create = api<CreateUserRequest, UserResponse>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    // Check if user already exists
    const existingUser = await userDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;
    
    if (existingUser) {
      throw APIError.alreadyExists("user with this email already exists");
    }

    const user = await userDB.queryRow<{
      id: number;
      email: string;
      name: string;
      role: string;
      subscription_plan: string;
      stripe_customer_id: string | null;
      subscription_status: string;
      subscription_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO users (email, name)
      VALUES (${req.email}, ${req.name})
      RETURNING *
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'user' | 'admin',
        subscriptionPlan: user.subscription_plan as 'free' | 'basic' | 'pro' | 'enterprise',
        stripeCustomerId: user.stripe_customer_id || undefined,
        subscriptionStatus: user.subscription_status as 'active' | 'inactive' | 'canceled' | 'past_due',
        subscriptionId: user.subscription_id || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    };
  }
);
