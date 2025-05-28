export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due';
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  subscriptionPlan?: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due';
  stripeCustomerId?: string;
  subscriptionId?: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersListResponse {
  users: User[];
}
