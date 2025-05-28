ALTER TABLE products ADD COLUMN category_id BIGINT;

CREATE INDEX idx_products_category_id ON products(category_id);
