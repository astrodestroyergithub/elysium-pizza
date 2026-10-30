-- Elysium Pizza — NeonDB Serverless PostgreSQL Schema & Initial Seed Data
-- Run this script in your NeonDB SQL Editor or let the Netlify Function auto-initialize it.

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    active_festival VARCHAR(64) NOT NULL DEFAULT 'default',
    banner_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    banner_title VARCHAR(255) NOT NULL DEFAULT 'Sunlit Artisanal Feast — Hand-Stretched 72-Hour Dough',
    banner_subtitle VARCHAR(500) NOT NULL DEFAULT 'Enjoy complimentary garlic herb knots on orders above ₹799 or use code ELYSIUM15 for 15% off.',
    promo_code VARCHAR(64) NOT NULL DEFAULT 'ELYSIUM15',
    discount_Percent INTEGER NOT NULL DEFAULT 15,
    delivery_fee INTEGER NOT NULL DEFAULT 49,
    free_delivery_threshold INTEGER NOT NULL DEFAULT 699,
    store_phone VARCHAR(64) NOT NULL DEFAULT '+91 (033) 4802-9100',
    store_email VARCHAR(128) NOT NULL DEFAULT 'concierge@elysiumpizza.com',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(64) NOT NULL,
    price INTEGER NOT NULL,
    calories INTEGER NOT NULL DEFAULT 740,
    prep_time VARCHAR(32) NOT NULL DEFAULT '18-22 mins',
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
    is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.85,
    reviews_count INTEGER NOT NULL DEFAULT 120,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    image_key VARCHAR(128) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    customer_email VARCHAR(160),
    delivery_type VARCHAR(32) NOT NULL DEFAULT 'Delivery',
    address TEXT NOT NULL,
    items_json JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    delivery_charge INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    payment_method VARCHAR(64) NOT NULL DEFAULT 'UPI / Instant Pay',
    status VARCHAR(64) NOT NULL DEFAULT 'Hand-Stretching Dough',
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    author VARCHAR(128) NOT NULL,
    author_role VARCHAR(128) NOT NULL,
    read_time VARCHAR(32) NOT NULL,
    published_date VARCHAR(64) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_key VARCHAR(128) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(64) PRIMARY KEY,
    guest_name VARCHAR(128) NOT NULL,
    guest_location VARCHAR(128) NOT NULL,
    ordered_item VARCHAR(160) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(64),
    topic VARCHAR(128) NOT NULL,
    party_size VARCHAR(64),
    message TEXT NOT NULL,
    status VARCHAR(48) NOT NULL DEFAULT 'New Inquiry',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(160) UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
