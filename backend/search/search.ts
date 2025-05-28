import { api } from "encore.dev/api";
import { searchDB } from "./db";
import type { SearchRequest, SearchResponse } from "./types";

// Performs a full-text search across products, stores, and categories.
export const search = api<SearchRequest, SearchResponse>(
  { expose: true, method: "POST", path: "/search" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereConditions = ["is_active = true"];
    let params: any[] = [];
    let paramIndex = 1;

    // Add search query condition
    if (req.query) {
      whereConditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex})`);
      params.push(req.query);
      paramIndex++;
    }

    // Add entity type filter
    if (req.entityType) {
      whereConditions.push(`entity_type = $${paramIndex}`);
      params.push(req.entityType);
      paramIndex++;
    }

    // Add store filter
    if (req.storeId) {
      whereConditions.push(`store_id = $${paramIndex}`);
      params.push(req.storeId);
      paramIndex++;
    }

    // Add price filters
    if (req.minPrice !== undefined) {
      whereConditions.push(`price >= $${paramIndex}`);
      params.push(req.minPrice * 100); // Convert to cents
      paramIndex++;
    }

    if (req.maxPrice !== undefined) {
      whereConditions.push(`price <= $${paramIndex}`);
      params.push(req.maxPrice * 100); // Convert to cents
      paramIndex++;
    }

    // Add rating filter
    if (req.minRating !== undefined) {
      whereConditions.push(`rating >= $${paramIndex}`);
      params.push(req.minRating);
      paramIndex++;
    }

    // Add tags filter
    if (req.tags && req.tags.length > 0) {
      whereConditions.push(`tags && $${paramIndex}`);
      params.push(req.tags);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderBy = "created_at DESC";
    if (req.sortBy) {
      switch (req.sortBy) {
        case 'relevance':
          if (req.query) {
            orderBy = `ts_rank(search_vector, plainto_tsquery('english', $1)) DESC, created_at DESC`;
          }
          break;
        case 'price_asc':
          orderBy = "price ASC NULLS LAST";
          break;
        case 'price_desc':
          orderBy = "price DESC NULLS LAST";
          break;
        case 'rating':
          orderBy = "rating DESC NULLS LAST";
          break;
        case 'newest':
          orderBy = "created_at DESC";
          break;
      }
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Get search results
    const selectClause = req.query && req.sortBy === 'relevance' 
      ? `*, ts_rank(search_vector, plainto_tsquery('english', $1)) as relevance_score`
      : `*, 1.0 as relevance_score`;

    const query = `
      SELECT ${selectClause}
      FROM search_indexes 
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const results = await searchDB.rawQueryAll<{
      id: number;
      entity_type: string;
      entity_id: number;
      title: string;
      description: string | null;
      keywords: string[];
      tags: string[];
      category_path: string[];
      price: number | null;
      rating: number | null;
      store_id: number | null;
      relevance_score: number;
    }>(query, ...params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM search_indexes 
      WHERE ${whereClause}
    `;

    const countResult = await searchDB.rawQueryRow<{ total: number }>(
      countQuery, 
      ...params.slice(0, -2) // Remove limit and offset
    );

    const totalCount = countResult?.total || 0;

    // Get facets (simplified version)
    const facets = {
      categories: [],
      priceRanges: [],
      tags: [],
    };

    return {
      results: results.map(result => ({
        id: result.id,
        entityType: result.entity_type as 'product' | 'store' | 'category',
        entityId: result.entity_id,
        title: result.title,
        description: result.description || undefined,
        keywords: result.keywords || [],
        tags: result.tags || [],
        categoryPath: result.category_path || [],
        price: result.price ? result.price / 100 : undefined,
        rating: result.rating || undefined,
        storeId: result.store_id || undefined,
        relevanceScore: result.relevance_score,
      })),
      totalCount,
      facets,
    };
  }
);
