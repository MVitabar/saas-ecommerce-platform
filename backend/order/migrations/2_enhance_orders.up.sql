ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE orders ADD COLUMN subtotal BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tax_amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN shipping_amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN notes TEXT;
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN shipping_method TEXT;
ALTER TABLE orders ADD COLUMN estimated_delivery_date DATE;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN refund_amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN refund_reason TEXT;

-- Generate order numbers
UPDATE orders SET order_number = 'ORD-' || LPAD(id::TEXT, 8, '0') WHERE order_number IS NULL;

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_coupon_code ON orders(coupon_code);
