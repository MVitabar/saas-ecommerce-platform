CREATE TABLE search_indexes (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'store', 'category')),
  entity_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  tags TEXT[],
  category_path TEXT[],
  price BIGINT,
  rating DECIMAL(3,2),
  store_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Create full-text search index
CREATE INDEX idx_search_indexes_search_vector ON search_indexes USING GIN(search_vector);
CREATE INDEX idx_search_indexes_entity_type ON search_indexes(entity_type);
CREATE INDEX idx_search_indexes_store_id ON search_indexes(store_id);
CREATE INDEX idx_search_indexes_price ON search_indexes(price);
CREATE INDEX idx_search_indexes_rating ON search_indexes(rating);
CREATE INDEX idx_search_indexes_keywords ON search_indexes USING GIN(keywords);
CREATE INDEX idx_search_indexes_tags ON search_indexes USING GIN(tags);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.keywords, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER search_vector_update 
  BEFORE INSERT OR UPDATE ON search_indexes
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
