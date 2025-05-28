export interface SearchResult {
  id: number;
  entityType: 'product' | 'store' | 'category';
  entityId: number;
  title: string;
  description?: string;
  keywords: string[];
  tags: string[];
  categoryPath: string[];
  price?: number;
  rating?: number;
  storeId?: number;
  relevanceScore: number;
}

export interface SearchRequest {
  query: string;
  entityType?: 'product' | 'store' | 'category';
  storeId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    tags: { name: string; count: number }[];
  };
}
