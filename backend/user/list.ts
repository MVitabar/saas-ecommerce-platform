import { api } from "encore.dev/api";
import { userDB } from "./db";
import type { UsersListResponse } from "./types";

// Retrieves all users (admin only).
export const list = api<void, UsersListResponse>(
  { expose: true, method: "GET", path: "/users" },
  async () => {
    const users = await userDB.queryAll<{
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
      SELECT * FROM users ORDER BY created_at DESC
    `;

    return {
      users: users.map(user => ({
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
      }))
    };
  }
);
