CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- Price in cents
  image_url TEXT,
  inventory INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_is_active ON products(is_active);
