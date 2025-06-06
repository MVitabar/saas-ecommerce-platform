ALTER TABLE products ADD COLUMN brand TEXT;
ALTER TABLE products ADD COLUMN sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN weight DECIMAL(10,3);
ALTER TABLE products ADD COLUMN dimensions JSONB;
ALTER TABLE products ADD COLUMN attributes JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN variants JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN tags TEXT[];
ALTER TABLE products ADD COLUMN meta_title TEXT;
ALTER TABLE products ADD COLUMN meta_description TEXT;
ALTER TABLE products ADD COLUMN seo_keywords TEXT[];
ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN total_reviews INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN total_sales INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN discount_type TEXT CHECK (discount_type IN ('none', 'percentage', 'fixed'));
ALTER TABLE products ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN discount_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN discount_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN min_order_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN max_order_quantity INTEGER;
ALTER TABLE products ADD COLUMN shipping_class TEXT DEFAULT 'standard';
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued'));

-- Update price column to use cents
ALTER TABLE products ALTER COLUMN price TYPE BIGINT USING (price * 100);

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_seo_keywords ON products USING GIN(seo_keywords);
