CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT,
  product_id BIGINT,
  page_type TEXT NOT NULL CHECK (page_type IN ('home', 'store', 'product', 'category', 'search')),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  clicked_product_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversion_events (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view_product', 'add_to_cart', 'start_checkout', 'complete_purchase')),
  product_id BIGINT,
  order_id BIGINT,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_views_store_id ON page_views(store_id);
CREATE INDEX idx_page_views_product_id ON page_views(product_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX idx_conversion_events_store_id ON conversion_events(store_id);
CREATE INDEX idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at);
