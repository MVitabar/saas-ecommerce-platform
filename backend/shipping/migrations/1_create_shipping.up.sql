CREATE TABLE shipping_zones (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL,
  states TEXT[],
  postal_codes TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE shipping_methods (
  id BIGSERIAL PRIMARY KEY,
  shipping_zone_id BIGINT NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('flat_rate', 'free', 'weight_based', 'price_based')),
  cost DECIMAL(10,2) DEFAULT 0,
  min_weight DECIMAL(10,3),
  max_weight DECIMAL(10,3),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipping_zones_store_id ON shipping_zones(store_id);
CREATE INDEX idx_shipping_methods_zone_id ON shipping_methods(shipping_zone_id);
