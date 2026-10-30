-- =============================================================================
-- Elysium Pizza — Complete Cleanup + Fresh Schema & Seed Script (NeonDB / PostgreSQL)
-- Namespace Prefix: ep_
--
-- Instructions:
-- Paste this entire script into the NeonDB SQL Editor and click "Run".
-- 1. CLEANUP: Safely drops all previous `ep_vw_*` views, `ep_idx_*` indexes,
--    and `ep_*` tables with CASCADE so there are zero schema or column conflicts.
--    (Pre-existing non-`ep_` tables in your database are never touched.)
-- 2. FRESH SCHEMA: Creates all 8 `ep_*` tables, 5 `ep_idx_*` indexes, and
--    3 `ep_vw_*` analytical views from scratch.
-- 3. FRESH SEED: Populates all initial storefront settings, 10 menu items,
--    3 combo boxes, 3 blog posts, 4 guest reviews, 2 sample orders,
--    2 customer inquiries, and 2 newsletter subscribers.
-- =============================================================================

-- =============================================================================
-- STEP 1: CLEANUP EXISTING ELYSIUM PIZZA (ep_*) VIEWS, INDEXES & TABLES
-- =============================================================================
DROP VIEW IF EXISTS ep_vw_crm_overview CASCADE;
DROP VIEW IF EXISTS ep_vw_order_revenue_summary CASCADE;
DROP VIEW IF EXISTS ep_vw_active_menu_catalog CASCADE;

DROP INDEX IF EXISTS ep_idx_contacts_status;
DROP INDEX IF EXISTS ep_idx_orders_created_at;
DROP INDEX IF EXISTS ep_idx_orders_status;
DROP INDEX IF EXISTS ep_idx_menu_available;
DROP INDEX IF EXISTS ep_idx_menu_category;

DROP TABLE IF EXISTS ep_newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS ep_contacts CASCADE;
DROP TABLE IF EXISTS ep_testimonials CASCADE;
DROP TABLE IF EXISTS ep_blog_posts CASCADE;
DROP TABLE IF EXISTS ep_orders CASCADE;
DROP TABLE IF EXISTS ep_combo_deals CASCADE;
DROP TABLE IF EXISTS ep_menu_items CASCADE;
DROP TABLE IF EXISTS ep_site_settings CASCADE;

-- =============================================================================
-- STEP 2: CREATE FRESH TABLES (ep_*), INDEXES (ep_idx_*), AND VIEWS (ep_vw_*)
-- =============================================================================

-- 1. Site & Festive Theme Configuration Table
CREATE TABLE ep_site_settings (
    ep_setting_id INTEGER PRIMARY KEY DEFAULT 1,
    ep_active_festival VARCHAR(64) NOT NULL DEFAULT 'default',
    ep_banner_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ep_banner_title VARCHAR(255) NOT NULL DEFAULT 'Warm out of the brick oven: Flat 15% savings on all handcrafted orders today!',
    ep_banner_subtitle VARCHAR(500) NOT NULL DEFAULT 'Apply code ELYSIUM15 at checkout or enjoy complimentary Garlic Herb Knots on orders over ₹799.',
    ep_promo_code VARCHAR(64) NOT NULL DEFAULT 'ELYSIUM15',
    ep_discount_percent INTEGER NOT NULL DEFAULT 15,
    ep_delivery_fee INTEGER NOT NULL DEFAULT 49,
    ep_free_delivery_threshold INTEGER NOT NULL DEFAULT 699,
    ep_store_phone VARCHAR(64) NOT NULL DEFAULT '+91 (033) 4802-9100',
    ep_store_email VARCHAR(128) NOT NULL DEFAULT 'concierge@elysiumpizza.com',
    ep_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Artisanal Pizza & Food Menu Catalog Table
CREATE TABLE ep_menu_items (
    ep_item_id VARCHAR(64) PRIMARY KEY,
    ep_item_name VARCHAR(160) NOT NULL,
    ep_category VARCHAR(64) NOT NULL,
    ep_price INTEGER NOT NULL,
    ep_calories INTEGER NOT NULL DEFAULT 740,
    ep_prep_time VARCHAR(32) NOT NULL DEFAULT '18-22 mins',
    ep_is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    ep_is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
    ep_is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    ep_rating NUMERIC(3,2) NOT NULL DEFAULT 4.90,
    ep_reviews_count INTEGER NOT NULL DEFAULT 120,
    ep_description TEXT NOT NULL,
    ep_ingredients TEXT NOT NULL,
    ep_image_key VARCHAR(255) NOT NULL,
    ep_available BOOLEAN NOT NULL DEFAULT TRUE,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Signature Feast Boxes & Combo Deals Table
CREATE TABLE ep_combo_deals (
    ep_combo_id VARCHAR(64) PRIMARY KEY,
    ep_combo_name VARCHAR(160) NOT NULL,
    ep_badge VARCHAR(64) NOT NULL DEFAULT 'FAMILY FEAST BOX',
    ep_serves VARCHAR(64) NOT NULL DEFAULT 'Serves 3-4 Guests',
    ep_original_price INTEGER NOT NULL,
    ep_combo_price INTEGER NOT NULL,
    ep_description TEXT NOT NULL,
    ep_items_summary TEXT NOT NULL,
    ep_image_key VARCHAR(255) NOT NULL,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Orders & Live Oven Tracker Table
CREATE TABLE ep_orders (
    ep_order_id VARCHAR(64) PRIMARY KEY,
    ep_customer_name VARCHAR(160) NOT NULL,
    ep_customer_phone VARCHAR(64) NOT NULL,
    ep_customer_email VARCHAR(160) DEFAULT '',
    ep_delivery_type VARCHAR(32) NOT NULL DEFAULT 'Delivery',
    ep_address TEXT NOT NULL,
    ep_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ep_subtotal INTEGER NOT NULL DEFAULT 0,
    ep_discount_amount INTEGER NOT NULL DEFAULT 0,
    ep_tax_amount INTEGER NOT NULL DEFAULT 0,
    ep_delivery_charge INTEGER NOT NULL DEFAULT 0,
    ep_total_amount INTEGER NOT NULL DEFAULT 0,
    ep_payment_method VARCHAR(64) NOT NULL DEFAULT 'UPI / Instant Pay',
    ep_order_status VARCHAR(64) NOT NULL DEFAULT 'Hand-Stretching 72h Dough',
    ep_special_notes TEXT DEFAULT '',
    ep_pizzaiolo VARCHAR(128) NOT NULL DEFAULT 'Chef Marco Bellini',
    ep_rider VARCHAR(128) NOT NULL DEFAULT 'Arjun Das (EV Express)',
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Culinary Journal (Blog Posts) Table
CREATE TABLE ep_blog_posts (
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

-- 6. Verified Guest Testimonials Table
CREATE TABLE ep_testimonials (
    ep_testimonial_id VARCHAR(64) PRIMARY KEY,
    ep_guest_name VARCHAR(128) NOT NULL,
    ep_guest_location VARCHAR(128) NOT NULL,
    ep_ordered_item VARCHAR(160) NOT NULL,
    ep_rating INTEGER NOT NULL DEFAULT 5 CHECK (ep_rating BETWEEN 1 AND 5),
    ep_comment TEXT NOT NULL,
    ep_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Customer Contacts & Catering Inquiries Table
CREATE TABLE ep_contacts (
    ep_contact_id VARCHAR(64) PRIMARY KEY,
    ep_full_name VARCHAR(160) NOT NULL,
    ep_email VARCHAR(160) NOT NULL,
    ep_phone VARCHAR(64) DEFAULT '',
    ep_topic VARCHAR(128) NOT NULL,
    ep_party_size VARCHAR(64) DEFAULT 'Standard',
    ep_message TEXT NOT NULL,
    ep_inquiry_status VARCHAR(48) NOT NULL DEFAULT 'New Inquiry',
    ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Golden Crust Society Newsletter Subscribers Table
CREATE TABLE ep_newsletter_subscribers (
    ep_subscriber_id SERIAL PRIMARY KEY,
    ep_subscriber_email VARCHAR(160) UNIQUE NOT NULL,
    ep_subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conflict-Free Indexes (ep_idx_*)
CREATE INDEX ep_idx_menu_category ON ep_menu_items (ep_category);
CREATE INDEX ep_idx_menu_available ON ep_menu_items (ep_available);
CREATE INDEX ep_idx_orders_status ON ep_orders (ep_order_status);
CREATE INDEX ep_idx_orders_created_at ON ep_orders (ep_created_at DESC);
CREATE INDEX ep_idx_contacts_status ON ep_contacts (ep_inquiry_status);

-- Conflict-Free Analytical Views (ep_vw_*)
CREATE VIEW ep_vw_active_menu_catalog AS
SELECT
    ep_item_id, ep_item_name, ep_category, ep_price, ep_calories, ep_prep_time,
    ep_is_veg, ep_is_spicy, ep_is_bestseller, ep_rating, ep_reviews_count,
    ep_description, ep_ingredients, ep_image_key, ep_created_at
FROM ep_menu_items
WHERE ep_available = TRUE
ORDER BY ep_is_bestseller DESC, ep_rating DESC;

CREATE VIEW ep_vw_order_revenue_summary AS
SELECT
    COUNT(ep_order_id) AS ep_total_orders_count,
    COALESCE(SUM(ep_total_amount), 0) AS ep_gross_revenue,
    COALESCE(ROUND(AVG(ep_total_amount), 2), 0) AS ep_avg_order_value,
    COUNT(ep_order_id) FILTER (WHERE ep_order_status NOT IN ('Delivered Warm', 'Cancelled')) AS ep_active_kitchen_orders
FROM ep_orders;

CREATE VIEW ep_vw_crm_overview AS
SELECT
    (SELECT COUNT(*) FROM ep_testimonials) AS ep_total_reviews,
    (SELECT COALESCE(ROUND(AVG(ep_rating), 2), 5.00) FROM ep_testimonials) AS ep_avg_guest_rating,
    (SELECT COUNT(*) FROM ep_contacts WHERE ep_inquiry_status = 'New Inquiry') AS ep_open_inquiries,
    (SELECT COUNT(*) FROM ep_newsletter_subscribers) AS ep_total_subscribers;

-- =============================================================================
-- STEP 3: SEED PRE-EXISTING STOREFRONT DATA INTO FRESH TABLES
-- =============================================================================

-- 3A. Seed Default Festive & Storefront Settings
INSERT INTO ep_site_settings (
    ep_setting_id, ep_active_festival, ep_banner_enabled, ep_banner_title,
    ep_banner_subtitle, ep_promo_code, ep_discount_percent, ep_delivery_fee, ep_free_delivery_threshold
) VALUES (
    1, 'default', TRUE,
    'Warm out of the brick oven: Flat 15% savings on all handcrafted orders today!',
    'Apply code ELYSIUM15 at checkout or enjoy complimentary Garlic Herb Knots on orders over ₹799.',
    'ELYSIUM15', 15, 49, 699
);

-- 3B. Seed 10 Artisanal Menu Dishes
INSERT INTO ep_menu_items (
    ep_item_id, ep_item_name, ep_category, ep_price, ep_calories, ep_prep_time,
    ep_is_veg, ep_is_spicy, ep_is_bestseller, ep_rating, ep_reviews_count,
    ep_description, ep_ingredients, ep_image_key, ep_available
) VALUES
(
    'pizza-margherita-regina', 'San Marzano Margherita Regina', 'Signature Pizzas', 449, 690, '15-18 mins',
    TRUE, FALSE, TRUE, 4.95, 418,
    '72-hour cold-fermented sourdough crust topped with crushed San Marzano DOP tomatoes, creamy Fior di Latte mozzarella, sweet garden basil, and extra-virgin olive oil.',
    'San Marzano Tomatoes, Fior di Latte, Fresh Basil, Cold-Pressed Olive Oil, Sea Salt',
    'hero_margherita', TRUE
),
(
    'pizza-truffle-burrata', 'Truffle & Creamy Burrata Gold', 'Gourmet Specials', 649, 820, '18-22 mins',
    TRUE, FALSE, TRUE, 4.98, 356,
    'Velvety roasted garlic bianco base crowned with whole torn Pugliese burrata, sautéed wild chanterelle & shiitake mushrooms, shaved black summer truffle, and lemon thyme.',
    'Fresh Burrata, Black Truffle Shavings, Wild Mushrooms, Roasted Garlic Cream, Thyme',
    'truffle_burrata', TRUE
),
(
    'pizza-diavola-honey', 'Crispy Cup Pepperoni & Hot Honey', 'Signature Pizzas', 589, 880, '16-20 mins',
    FALSE, TRUE, TRUE, 4.94, 512,
    'Artisanal charred cups of smoked pepperoni, aged provolone & mozzarella, crushed Calabrian chili flakes, finished with a ribbon of wildflower hot honey.',
    'Smoked Cup Pepperoni, Aged Mozzarella, Calabrian Chili, Wildflower Hot Honey, Basil',
    'spicy_pepperoni_honey', TRUE
),
(
    'pizza-mediterranean-pan', 'Mediterranean Sunlit Garden Pan', 'Signature Pizzas', 519, 740, '18-22 mins',
    TRUE, FALSE, FALSE, 4.89, 274,
    'Baked in our seasoned cast-iron pan for a golden crispy base with roasted red & yellow bell peppers, Kalamata olives, sun-dried tomatoes, baby spinach, and Greek feta.',
    'Roasted Bell Peppers, Kalamata Olives, Sun-Dried Tomatoes, Greek Feta, Baby Spinach',
    'mediterranean_veggie', TRUE
),
(
    'pizza-smoked-bbq-chicken', 'Smoked Hickory BBQ Chicken Stuffed Crust', 'Gourmet Specials', 629, 920, '20-24 mins',
    FALSE, FALSE, TRUE, 4.92, 389,
    'Golden three-cheese stuffed crust loaded with chargrilled hickory BBQ chicken breast, caramelized red onions, sweet golden corn, smoked gouda, and fresh cilantro.',
    'Chargrilled BBQ Chicken, Stuffed Cheese Crust, Smoked Gouda, Red Onions, Sweet Corn',
    'bbq_chicken_supreme', TRUE
),
(
    'pizza-paneer-tikka-royale', 'Tandoori Malai Paneer & Pickled Onion', 'Gourmet Specials', 549, 790, '17-21 mins',
    TRUE, TRUE, TRUE, 4.91, 310,
    'Clay-oven spiced malai paneer cubes, chargrilled capsicum, crunchy pickled red onions, mint-coriander drizzle, and molten mozzarella on our signature pan crust.',
    'Malai Paneer Tikka, Charred Capsicum, Pickled Red Onion, Mint Chutney Drizzle, Mozzarella',
    'mediterranean_veggie', TRUE
),
(
    'melt-truffle-mushroom', 'Crispy Parmesan Folded Pizza Melt', 'Crispy Melts & Pastas', 329, 560, '12-15 mins',
    TRUE, FALSE, FALSE, 4.86, 198,
    'Crispy folded thin-crust handheld melt packed with three-cheese blend, roasted mushrooms, caramelized onions, and herbed parmesan crust—served with warm marinara dip.',
    'Three-Cheese Blend, Roasted Mushrooms, Caramelized Onions, Herb Parmesan Crust, Marinara Dip',
    'truffle_burrata', TRUE
),
(
    'pasta-baked-mac-arrabbiata', 'Wood-Fired Penne Arrabbiata Gratin', 'Crispy Melts & Pastas', 369, 610, '14-18 mins',
    TRUE, TRUE, FALSE, 4.87, 164,
    'Bronze-die penne tossed in slow-simmered spicy San Marzano tomato & garlic sauce, topped with fresh burrata cream and baked golden in our brick oven.',
    'Bronze-Die Penne, Spicy San Marzano Sauce, Roasted Garlic, Burrata Cream, Fresh Basil',
    'hero_margherita', TRUE
),
(
    'sides-garlic-herb-knots', 'Artisanal Garlic Parmesan Bread Knots (6 Pcs)', 'Artisanal Sides', 219, 480, '10-12 mins',
    TRUE, FALSE, TRUE, 4.96, 440,
    'Hand-tied 72-hour sourdough knots brushed generously with roasted garlic herb butter, aged Parmigiano-Reggiano, and served with warm basil marinara.',
    'Sourdough Knots, Roasted Garlic Butter, Aged Parmesan, Fresh Parsley, Marinara Dip',
    'garlic_knots_lava_cake', TRUE
),
(
    'dessert-molten-lava-cake', 'Belgian Dark Chocolate Molten Lava Cake', 'Desserts & Drinks', 249, 510, '10-12 mins',
    TRUE, FALSE, TRUE, 4.97, 392,
    'Warm, freshly baked 70% Belgian couverture chocolate cake with a flowing molten ganache center, dusted with vanilla bean sugar and served with fresh raspberries.',
    '70% Belgian Chocolate, Cultured Butter, Vanilla Bean Sugar, Fresh Raspberries, Mint',
    'garlic_knots_lava_cake', TRUE
);

-- 3C. Seed 3 Signature Combo Feast Boxes
INSERT INTO ep_combo_deals (
    ep_combo_id, ep_combo_name, ep_badge, ep_serves, ep_original_price, ep_combo_price,
    ep_description, ep_items_summary, ep_image_key
) VALUES
(
    'combo-triple-treat-box', 'The Elysium Triple Treat Box', 'MOST POPULAR FAMILY BOX', 'Serves 4–5 Guests', 1599, 1199,
    '2 Medium Signature Pizzas of your choice + 6 Garlic Herb Bread Knots with Marinara + 1 Warm Belgian Chocolate Molten Lava Cake.',
    '2x Medium Pizzas + 6pc Garlic Knots + Molten Lava Cake', 'garlic_knots_lava_cake'
),
(
    'combo-gourmet-duo-feast', 'Sunlit Gourmet Date-Night Duo', 'COUPLE''S FAVOURITE', 'Serves 2–3 Guests', 1099, 849,
    '1 Medium Truffle & Burrata or Pepperoni Hot Honey Pizza + 1 Crispy Parmesan Melt + 6 Garlic Herb Knots.',
    '1x Gourmet Pizza + 1x Crispy Melt + 6pc Garlic Knots', 'truffle_burrata'
),
(
    'combo-grand-party-fiesta', 'Grand Wood-Fired Party Fiesta', 'CELEBRATION PACK', 'Serves 7–8 Guests', 2699, 1999,
    '3 Large Signature & Gourmet Pizzas + 12 Garlic Parmesan Bread Knots + 2 Wood-Fired Pastas + 2 Belgian Molten Lava Cakes.',
    '3x Large Pizzas + 12pc Knots + 2x Pastas + 2x Lava Cakes', 'spicy_pepperoni_honey'
);

-- 3D. Seed 3 Culinary Journal Blog Posts
INSERT INTO ep_blog_posts (
    ep_blog_id, ep_title, ep_category, ep_author, ep_author_role, ep_read_time,
    ep_published_date, ep_excerpt, ep_content, ep_image_key, ep_featured
) VALUES
(
    'blog-72-hour-fermentation',
    'Why We Cold-Ferment Our Sourdough for 72 Full Hours',
    'Culinary Craft', 'Chef Marco Bellini', 'Master Pizzaiolo & Co-Founder', '4 min read', 'October 24, 2026',
    'Discover how slow cold fermentation unlocks airy honeycomb crusts, complex artisanal aromas, and effortless digestibility in every slice we bake.',
    'At Elysium Pizza, we believe great pizza begins three days before the oven is even lit. Unlike rushed commercial doughs that rely on heavy yeast and sugar, our dough is mixed with stone-milled Italian Tipo 00 flour, high-mineral spring water, sea salt, and our 18-year-old natural levain starter. Over 72 hours in our temperature-controlled maturation cellar at 4°C, natural enzymes gently break down complex starches and gluten networks. When the hand-stretched disc meets the 485°C volcanic stone floor of our brick oven, the trapped micro-bubbles expand rapidly into a crisp, leopard-spotted cornicione that stays light, fragrant, and wonderfully digestible.',
    'hero_margherita', TRUE
),
(
    'blog-truffle-burrata-pairing',
    'From Puglia to Your Table: Crafting the Truffle & Burrata Gold',
    'Ingredient Stories', 'Chef Ananya Sen', 'Culinary Director', '5 min read', 'October 18, 2026',
    'How fresh stracciatella-filled burrata, wild forest mushrooms, and aromatic black truffle create our most requested white pizza.',
    'White pizzas—or Pizza Bianca—demand extraordinary balance because there is no acidity from tomato sauce to hide behind. For our Truffle & Burrata Gold, we begin with a delicate roasted garlic and Parmigiano-Reggiano cream base. We bake the crust with sautéed chanterelle and shiitake mushrooms, and only after the pizza emerges blistering hot from the wood-fired oven do we crown it with cool, creamy burrata and shaved black summer truffles. The contrast between the warm, crispy crust and the cool, cascading stracciatella cream creates a truly unforgettable bite.',
    'truffle_burrata', FALSE
),
(
    'blog-hot-honey-revolution',
    'Sweet Meets Heat: The Story Behind Our Calabrian Hot Honey Drizzle',
    'Flavour Notes', 'Rohan Chatterjee', 'Artisanal Sauce Curator', '3 min read', 'October 10, 2026',
    'We infuse raw multiflora wildflower honey with sun-dried red chilies to create the ultimate counterpoint to savoury cupped pepperoni.',
    'Every great culinary tradition celebrates the marriage of sweet, savoury, and spicy. In our kitchen, we gently warm raw wildflower honey with crushed Calabrian chilies and a splash of aged apple cider vinegar. Drizzled over crispy, charred pepperoni cups and bubbling mozzarella right before serving, the floral sweetness rounds out the smoky spice and keeps you reaching for the next slice.',
    'spicy_pepperoni_honey', FALSE
);

-- 3E. Seed 4 Verified Guest Testimonials
INSERT INTO ep_testimonials (
    ep_testimonial_id, ep_guest_name, ep_guest_location, ep_ordered_item, ep_rating, ep_comment, ep_verified
) VALUES
(
    'rev-101', 'Arundhati Mukherjee', 'Ballygunge, Kolkata', 'Truffle & Creamy Burrata Gold', 5,
    'Hands down the finest crust in the city! It arrived steaming hot in 24 minutes, and the burrata was so fresh and creamy. The Triple Treat Box is our family''s Friday night ritual now.',
    TRUE
),
(
    'rev-102', 'Vikramaditya Roy', 'Salt Lake Sector V', 'Crispy Cup Pepperoni & Hot Honey', 5,
    'The balance of smoky pepperoni cups with the wildflower hot honey drizzle is pure magic. You can genuinely taste the 72-hour fermented sourdough difference—light, crisp, and zero heaviness.',
    TRUE
),
(
    'rev-103', 'Sneha & Kabir Bose', 'Park Street, Kolkata', 'The Elysium Triple Treat Box', 5,
    'Ordered for our anniversary dinner at home. The garlic parmesan knots and Belgian molten lava cake were restaurant-grade perfection. Loved tracking every stage from dough stretching to delivery!',
    TRUE
),
(
    'rev-104', 'Devansh Sengupta', 'New Town Action Area I', 'Custom Crafted Pan Pizza', 5,
    'The Custom Pizza Studio let me build my dream stuffed-crust pie with smoked gouda, olives, and sun-dried tomatoes. Super intuitive website and super fast delivery!',
    TRUE
);

-- 3F. Seed 2 Pre-Existing Customer Orders
INSERT INTO ep_orders (
    ep_order_id, ep_customer_name, ep_customer_phone, ep_customer_email, ep_delivery_type,
    ep_address, ep_items_json, ep_subtotal, ep_discount_amount, ep_tax_amount,
    ep_delivery_charge, ep_total_amount, ep_payment_method, ep_order_status, ep_special_notes,
    ep_pizzaiolo, ep_rider
) VALUES
(
    'ELY-849201', 'Arundhati Mukherjee', '+91 98301 44210', 'arundhati.m@example.com', 'Delivery',
    '42B Lovelock Place, Ballygunge, Kolkata 700019',
    '[{"name": "Truffle & Creamy Burrata Gold (Medium 12-inch, Hand-Tossed)", "qty": 1, "price": 649}, {"name": "Artisanal Garlic Parmesan Bread Knots (6 Pcs)", "qty": 1, "price": 219}]'::jsonb,
    868, 130, 37, 0, 775, 'UPI / Instant Pay', 'Baking in Wood-Fired Oven', 'Extra fresh basil leaves please',
    'Chef Marco Bellini', 'Arjun Das (EV Express)'
),
(
    'ELY-849178', 'Siddharth Verma', '+91 98312 88904', 'siddharth.v@example.com', 'Delivery',
    'Tower 4, Apt 11C, Urbana, Kolkata 700107',
    '[{"name": "The Elysium Triple Treat Box", "qty": 1, "price": 1199}]'::jsonb,
    1199, 180, 51, 0, 1070, 'Card on Delivery', 'Out for Hot-Box Delivery', 'Ring doorbell on arrival',
    'Chef Ananya Sen', 'Rakesh Mondal (EV Express)'
);

-- 3G. Seed 2 Customer Contact & Catering Inquiries
INSERT INTO ep_contacts (
    ep_contact_id, ep_full_name, ep_email, ep_phone, ep_topic, ep_party_size, ep_message, ep_inquiry_status
) VALUES
(
    'inq-301', 'Priyanka Chatterjee', 'priyanka.c@avenirmedia.in', '+91 98309 11234',
    'Private Event & Office Catering', '45 Guests',
    'We would love to book live pizza catering and 15 Triple Treat Boxes for our Diwali office celebration next Friday at Park Street.',
    'New Inquiry'
),
(
    'inq-302', 'Rishabh Agarwal', 'rishabh.ag@gmail.com', '+91 90071 55412',
    'Table Reservation', '12 Guests',
    'Looking to reserve the sunlit garden terrace table this Sunday evening at 7:30 PM with a pre-ordered custom truffle pizza spread.',
    'Confirmed'
);

-- 3H. Seed 2 Newsletter Subscribers
INSERT INTO ep_newsletter_subscribers (ep_subscriber_email) VALUES
('arundhati.m@example.com'),
('vikram.roy@example.com');
