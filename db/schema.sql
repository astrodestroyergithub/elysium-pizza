-- =============================================================================
-- Elysium Pizza — Conflict-Free NeonDB PostgreSQL Schema (Prefix: ep_)
-- Every table, column, constraint, index, and view is uniquely prefixed with
-- "ep_" to guarantee zero naming collisions in shared/existing databases.
-- =============================================================================

-- 1. Site & Festive Theme Configuration Table
CREATE TABLE IF NOT EXISTS ep_site_settings (
    ep_setting_id SERIAL PRIMARY KEY,
    ep_active_festival VARCHAR(64) NOT NULL DEFAULT 'default',
    ep_banner_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ep_banner_title VARCHAR(255) NOT NULL DEFAULT 'Sunlit Artisanal Feast — Hand-Stretched 72-Hour Dough',
    ep_banner_subtitle VARCHAR(500) NOT NULL DEFAULT 'Enjoy complimentary garlic herb knots on orders above ₹799 or use code ELYSIUM15 for 15% off.',
    ep_promo_code VARCHAR(64) NOT NULL DEFAULT 'ELYSIUM15',
    ep_discount_percent INTEGER NOT NULL DEFAULT 15,
    ep_delivery_fee INTEGER NOT NULL DEFAULT 49,
    ep_free_delivery_threshold INTEGER NOT NULL DEFAULT 699,
    ep_store_phone VARCHAR(64) NOT NULL DEFAULT '+91 (033) 4802-9100',
    ep_store_email VARCHAR(128) NOT NULL DEFAULT 'concierge@elysiumpizza.com',
    ep_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Artisanal Pizza & Food Menu Catalog Table
CREATE TABLE IF NOT EXISTS ep_menu_items (
    ep_item_id VARCHAR(64) PRIMARY KEY,
    ep_item_name VARCHAR(160) NOT NULL,
    ep_category VARCHAR(64) NOT NULL,
    ep_price INTEGER NOT NULL,
    ep_calories INTEGER NOT NULL DEFAULT 740,
    ep_prep_time VARCHAR(32) NOT NULL DEFAULT '18-22 mins',
    ep_is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    ep_is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
    ep_is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    ep_rating NUMERIC(3,2) NOT NULL DEFAULT 4.85,
    ep_reviews_count INTEGER NOT NULL DEFAULT 120,
    ep_description TEXT NOT NULL,
    ep_ingredients TEXT NOT NULL,
    ep_image_key VARCHAR(255) NOT NULL,
    ep_available BOOLEAN NOT NULL DEFAULT TRUE,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customer Orders & Live Oven Tracker Table
CREATE TABLE IF NOT EXISTS ep_orders (
    ep_order_id VARCHAR(64) PRIMARY KEY,
    ep_customer_name VARCHAR(160) NOT NULL,
    ep_customer_phone VARCHAR(64) NOT NULL,
    ep_customer_email VARCHAR(160),
    ep_delivery_type VARCHAR(32) NOT NULL DEFAULT 'Delivery',
    ep_address TEXT NOT NULL,
    ep_items_json JSONB NOT NULL,
    ep_subtotal INTEGER NOT NULL,
    ep_discount_amount INTEGER NOT NULL DEFAULT 0,
    ep_tax_amount INTEGER NOT NULL DEFAULT 0,
    ep_delivery_charge INTEGER NOT NULL DEFAULT 0,
    ep_total_amount INTEGER NOT NULL,
    ep_payment_method VARCHAR(64) NOT NULL DEFAULT 'UPI / Instant Pay',
    ep_order_status VARCHAR(64) NOT NULL DEFAULT 'Hand-Stretching 72h Dough',
    ep_special_notes TEXT,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Culinary Journal (Blog Posts) Table
CREATE TABLE IF NOT EXISTS ep_blog_posts (
    ep_blog_id VARCHAR(64) PRIMARY KEY,
    ep_title VARCHAR(255) NOT NULL,
    ep_category VARCHAR(64) NOT NULL,
    ep_author VARCHAR(128) NOT NULL,
    ep_author_role VARCHAR(128) NOT NULL,
    ep_read_time VARCHAR(32) NOT NULL,
    ep_published_date VARCHAR(64) NOT NULL,
    ep_excerpt TEXT NOT NULL,
    ep_content TEXT NOT NULL,
    ep_image_key VARCHAR(255) NOT NULL,
    ep_featured BOOLEAN NOT NULL DEFAULT FALSE,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Verified Guest Testimonials Table
CREATE TABLE IF NOT EXISTS ep_testimonials (
    ep_testimonial_id VARCHAR(64) PRIMARY KEY,
    ep_guest_name VARCHAR(128) NOT NULL,
    ep_guest_location VARCHAR(128) NOT NULL,
    ep_ordered_item VARCHAR(160) NOT NULL,
    ep_rating INTEGER NOT NULL DEFAULT 5 CHECK (ep_rating BETWEEN 1 AND 5),
    ep_comment TEXT NOT NULL,
    ep_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Customer Contacts & Catering Inquiries Table
CREATE TABLE IF NOT EXISTS ep_contacts (
    ep_contact_id VARCHAR(64) PRIMARY KEY,
    ep_full_name VARCHAR(160) NOT NULL,
    ep_email VARCHAR(160) NOT NULL,
    ep_phone VARCHAR(64),
    ep_topic VARCHAR(128) NOT NULL,
    ep_party_size VARCHAR(64),
    ep_message TEXT NOT NULL,
    ep_inquiry_status VARCHAR(48) NOT NULL DEFAULT 'New Inquiry',
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Golden Crust Society Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS ep_newsletter_subscribers (
    ep_subscriber_id SERIAL PRIMARY KEY,
    ep_subscriber_email VARCHAR(160) UNIQUE NOT NULL,
    ep_subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Conflict-Free Indexes (Prefix: ep_idx_)
-- =============================================================================
CREATE INDEX IF NOT EXISTS ep_idx_menu_category ON ep_menu_items (ep_category);
CREATE INDEX IF NOT EXISTS ep_idx_menu_available ON ep_menu_items (ep_available);
CREATE INDEX IF NOT EXISTS ep_idx_orders_status ON ep_orders (ep_order_status);
CREATE INDEX IF NOT EXISTS ep_idx_orders_created_at ON ep_orders (ep_created_at DESC);
CREATE INDEX IF NOT EXISTS ep_idx_contacts_status ON ep_contacts (ep_inquiry_status);

-- =============================================================================
-- Conflict-Free Analytical & Reporting Views (Prefix: ep_vw_)
-- =============================================================================

-- View 1: Active Menu Catalog View
CREATE OR REPLACE VIEW ep_vw_active_menu_catalog AS
SELECT
    ep_item_id,
    ep_item_name,
    ep_category,
    ep_price,
    ep_calories,
    ep_prep_time,
    ep_is_veg,
    ep_is_spicy,
    ep_is_bestseller,
    ep_rating,
    ep_reviews_count,
    ep_description,
    ep_ingredients,
    ep_image_key,
    ep_created_at
FROM ep_menu_items
WHERE ep_available = TRUE
ORDER BY ep_is_bestseller DESC, ep_rating DESC;

-- View 2: Order Revenue & Fulfilment KPI Summary View
CREATE OR REPLACE VIEW ep_vw_order_revenue_summary AS
SELECT
    COUNT(ep_order_id) AS ep_total_orders_count,
    COALESCE(SUM(ep_total_amount), 0) AS ep_gross_revenue,
    COALESCE(ROUND(AVG(ep_total_amount), 2), 0) AS ep_avg_order_value,
    COUNT(ep_order_id) FILTER (WHERE ep_order_status NOT IN ('Delivered Warm', 'Cancelled')) AS ep_active_kitchen_orders
FROM ep_orders;

-- View 3: Community & CRM Snapshot View
CREATE OR REPLACE VIEW ep_vw_crm_overview AS
SELECT
    (SELECT COUNT(*) FROM ep_testimonials) AS ep_total_reviews,
    (SELECT COALESCE(ROUND(AVG(ep_rating), 2), 5.00) FROM ep_testimonials) AS ep_avg_guest_rating,
    (SELECT COUNT(*) FROM ep_contacts WHERE ep_inquiry_status = 'New Inquiry') AS ep_open_inquiries,
    (SELECT COUNT(*) FROM ep_newsletter_subscribers) AS ep_total_subscribers;
