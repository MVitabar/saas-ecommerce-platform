import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import type { UpdateUserRequest, UserResponse } from "./types";

// Updates a user's information.
export const update = api<{ id: number } & UpdateUserRequest, UserResponse>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async ({ id, ...updates }) => {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.subscriptionPlan !== undefined) {
      setParts.push(`subscription_plan = $${paramIndex++}`);
      values.push(updates.subscriptionPlan);
    }
    if (updates.subscriptionStatus !== undefined) {
      setParts.push(`subscription_status = $${paramIndex++}`);
      values.push(updates.subscriptionStatus);
    }
    if (updates.stripeCustomerId !== undefined) {
      setParts.push(`stripe_customer_id = $${paramIndex++}`);
      values.push(updates.stripeCustomerId);
    }
    if (updates.subscriptionId !== undefined) {
      setParts.push(`subscription_id = $${paramIndex++}`);
      values.push(updates.subscriptionId);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    setParts.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const user = await userDB.rawQueryRow<{
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
    }>(query, ...values);

    if (!user) {
      throw APIError.notFound("user not found");
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
