export interface Store {
  id: number;
  userId: number;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  domain?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreRequest {
  userId: number;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  domain?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  domain?: string;
  isActive?: boolean;
}

export interface StoreResponse {
  store: Store;
}

export interface StoresListResponse {
  stores: Store[];
}
