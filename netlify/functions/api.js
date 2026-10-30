/**
 * Elysium Pizza — Netlify Serverless REST API + NeonDB Integration (ep_ Namespace Edition)
 *
 * Features:
 * - Conflict-free `ep_` prefix across all PostgreSQL tables, columns, indexes, and views
 * - Automatic schema initialization AND automatic pre-existing data seeding on first run
 * - Resilient routing supporting both `/api/<resource>/<id>` and query parameters `?resource=...&id=...`
 * - Full CORS headers (`Access-Control-Allow-Origin: *`) for external developers
 * - Full CRUD (GET, POST, PUT, DELETE) for:
 *     /api/bootstrap     (loads all storefront & admin tables from NeonDB in one call)
 *     /api/menu          (ep_menu_items)
 *     /api/combos        (ep_combo_deals)
 *     /api/orders        (ep_orders)
 *     /api/blogs         (ep_blog_posts)
 *     /api/testimonials  (ep_testimonials)
 *     /api/contacts      (ep_contacts)
 *     /api/newsletter    (ep_newsletter_subscribers)
 *     /api/settings      (ep_site_settings)
 *     /api/analytics     (ep_vw_order_revenue_summary, ep_vw_crm_overview, ep_vw_active_menu_catalog)
 *     /api/auth/login    (validates ADMIN_USERNAME & ADMIN_PASSWORD)
 */

const { neon } = require('@neondatabase/serverless');

const ep_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Username, X-Admin-Password, X-Ep-Admin-Username, X-Ep-Admin-Password',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Content-Type': 'application/json; charset=utf-8'
};

function ep_respond(ep_statusCode, ep_payload) {
  return {
    statusCode: ep_statusCode,
    headers: ep_CORS_HEADERS,
    body: JSON.stringify(ep_payload)
  };
}

function ep_cleanEnv(val) {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '');
}

function ep_verifyAdmin(ep_event, ep_bodyObj = {}) {
  const ep_envUser = ep_cleanEnv(process.env.EP_ADMIN_USERNAME || process.env.ADMIN_USERNAME);
  const ep_envPass = ep_cleanEnv(process.env.EP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD);

  const ep_headers = ep_event.headers || {};
  const ep_qs = ep_event.queryStringParameters || {};

  const ep_headerUser =
    ep_headers['x-ep-admin-username'] ||
    ep_headers['X-Ep-Admin-Username'] ||
    ep_headers['x-admin-username'] ||
    ep_headers['X-Admin-Username'];
  const ep_headerPass =
    ep_headers['x-ep-admin-password'] ||
    ep_headers['X-Ep-Admin-Password'] ||
    ep_headers['x-admin-password'] ||
    ep_headers['X-Admin-Password'];

  let ep_authUser = ep_headerUser || ep_bodyObj.ep_admin_username || ep_bodyObj.ep_username || ep_bodyObj.username || ep_qs.ep_user;
  let ep_authPass = ep_headerPass || ep_bodyObj.ep_admin_password || ep_bodyObj.ep_password || ep_bodyObj.password || ep_qs.ep_pass;

  const ep_authHeader = ep_headers['authorization'] || ep_headers['Authorization'] || '';
  if (ep_authHeader.startsWith('Basic ')) {
    try {
      const ep_decoded = Buffer.from(ep_authHeader.slice(6), 'base64').toString('utf8');
      const ep_colonIdx = ep_decoded.indexOf(':');
      if (ep_colonIdx !== -1) {
        ep_authUser = ep_authUser || ep_decoded.slice(0, ep_colonIdx);
        ep_authPass = ep_authPass || ep_decoded.slice(ep_colonIdx + 1);
      }
    } catch (_) {}
  }

  ep_authUser = ep_cleanEnv(ep_authUser);
  ep_authPass = ep_cleanEnv(ep_authPass);

  if (!ep_authUser || !ep_authPass) return false;

  // Match configured Netlify environment variables if set
  if (ep_envUser && ep_envPass && ep_authUser === ep_envUser && ep_authPass === ep_envPass) {
    return true;
  }

  // Also support the default manager credentials so demo/initial testing works out-of-the-box
  if (ep_authUser === 'elysium_admin' && ep_authPass === 'Elysium@2026') {
    return true;
  }

  return false;
}

// Row Normalizers (expose both ep_* columns and clean frontend keys)
function ep_normalizeMenuRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_item_id,
    name: r.ep_item_name,
    category: r.ep_category,
    price: Number(r.ep_price),
    calories: Number(r.ep_calories),
    prep_time: r.ep_prep_time,
    is_veg: Boolean(r.ep_is_veg),
    is_spicy: Boolean(r.ep_is_spicy),
    is_bestseller: Boolean(r.ep_is_bestseller),
    rating: Number(r.ep_rating),
    reviews_count: Number(r.ep_reviews_count),
    description: r.ep_description,
    ingredients: r.ep_ingredients,
    image_key: r.ep_image_key,
    available: Boolean(r.ep_available),
    created_at: r.ep_created_at
  };
}

function ep_normalizeComboRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_combo_id,
    name: r.ep_combo_name,
    badge: r.ep_badge,
    serves: r.ep_serves,
    original_price: Number(r.ep_original_price),
    price: Number(r.ep_combo_price),
    description: r.ep_description,
    items_summary: r.ep_items_summary,
    image_key: r.ep_image_key,
    created_at: r.ep_created_at
  };
}

function ep_normalizeOrderRow(r) {
  if (!r) return null;
  let parsedItems = r.ep_items_json;
  if (typeof parsedItems === 'string') {
    try {
      parsedItems = JSON.parse(parsedItems);
    } catch (_) {
      parsedItems = [];
    }
  }
  return {
    ...r,
    id: r.ep_order_id,
    customer_name: r.ep_customer_name,
    customer_phone: r.ep_customer_phone,
    customer_email: r.ep_customer_email,
    delivery_type: r.ep_delivery_type,
    address: r.ep_address,
    items: Array.isArray(parsedItems) ? parsedItems : [],
    subtotal: Number(r.ep_subtotal),
    discount_amount: Number(r.ep_discount_amount),
    tax_amount: Number(r.ep_tax_amount),
    delivery_charge: Number(r.ep_delivery_charge),
    total_amount: Number(r.ep_total_amount),
    payment_method: r.ep_payment_method,
    status: r.ep_order_status,
    special_notes: r.ep_special_notes,
    pizzaiolo: r.ep_pizzaiolo || 'Chef Marco Bellini',
    rider: r.ep_rider || 'Arjun Das (EV Express)',
    created_at: r.ep_created_at
      ? new Date(r.ep_created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Recent'
  };
}

function ep_normalizeBlogRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_blog_id,
    title: r.ep_title,
    category: r.ep_category,
    author: r.ep_author,
    author_role: r.ep_author_role,
    read_time: r.ep_read_time,
    published_date: r.ep_published_date,
    excerpt: r.ep_excerpt,
    content: r.ep_content,
    image_key: r.ep_image_key,
    featured: Boolean(r.ep_featured),
    created_at: r.ep_created_at
  };
}

function ep_normalizeTestimonialRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_testimonial_id,
    guest_name: r.ep_guest_name,
    guest_location: r.ep_guest_location,
    ordered_item: r.ep_ordered_item,
    rating: Number(r.ep_rating),
    comment: r.ep_comment,
    verified: Boolean(r.ep_verified),
    created_at: r.ep_created_at
  };
}

function ep_normalizeContactRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_contact_id,
    full_name: r.ep_full_name,
    email: r.ep_email,
    phone: r.ep_phone,
    topic: r.ep_topic,
    party_size: r.ep_party_size,
    message: r.ep_message,
    status: r.ep_inquiry_status,
    created_at: r.ep_created_at
      ? new Date(r.ep_created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Recent'
  };
}

function ep_normalizeSettingsRow(r) {
  if (!r) return null;
  return {
    ...r,
    active_festival: r.ep_active_festival,
    banner_enabled: Boolean(r.ep_banner_enabled),
    banner_title: r.ep_banner_title,
    banner_subtitle: r.ep_banner_subtitle,
    promo_code: r.ep_promo_code,
    discount_percent: Number(r.ep_discount_percent),
    delivery_fee: Number(r.ep_delivery_fee),
    free_delivery_threshold: Number(r.ep_free_delivery_threshold),
    store_phone: r.ep_store_phone,
    store_email: r.ep_store_email,
    updated_at: r.ep_updated_at
  };
}

let ep_schemaInitializedInWarmContainer = false;

async function ep_dropAllEpObjects(ep_sql) {
  await ep_sql`DROP VIEW IF EXISTS ep_vw_crm_overview CASCADE`;
  await ep_sql`DROP VIEW IF EXISTS ep_vw_order_revenue_summary CASCADE`;
  await ep_sql`DROP VIEW IF EXISTS ep_vw_active_menu_catalog CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_newsletter_subscribers CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_contacts CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_testimonials CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_blog_posts CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_orders CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_combo_deals CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_menu_items CASCADE`;
  await ep_sql`DROP TABLE IF EXISTS ep_site_settings CASCADE`;
}

async function ep_ensureSchemaAndSeed(ep_sql, ep_forceCleanup = false) {
  if (ep_schemaInitializedInWarmContainer && !ep_forceCleanup) return;

  if (ep_forceCleanup) {
    await ep_dropAllEpObjects(ep_sql);
  } else {
    // Check if an older incomplete schema exists (e.g., missing ep_combo_deals or missing ep_pizzaiolo in ep_orders)
    try {
      const ep_colCheck = await ep_sql`
        SELECT COUNT(*)::int AS cnt
        FROM information_schema.columns
        WHERE table_name = 'ep_orders' AND column_name = 'ep_pizzaiolo'
      `;
      const ep_ordersTableCheck = await ep_sql`
        SELECT COUNT(*)::int AS cnt
        FROM information_schema.tables
        WHERE table_name = 'ep_orders'
      `;
      if ((ep_ordersTableCheck[0]?.cnt || 0) > 0 && (ep_colCheck[0]?.cnt || 0) === 0) {
        await ep_dropAllEpObjects(ep_sql);
      }
    } catch (_) {}
  }

  // 1. Create Conflict-Free ep_* Tables
  await ep_sql`
    CREATE TABLE IF NOT EXISTS ep_site_settings (
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
  `;

  await ep_sql`
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
      ep_rating NUMERIC(3,2) NOT NULL DEFAULT 4.90,
      ep_reviews_count INTEGER NOT NULL DEFAULT 120,
      ep_description TEXT NOT NULL,
      ep_ingredients TEXT NOT NULL,
      ep_image_key VARCHAR(255) NOT NULL,
      ep_available BOOLEAN NOT NULL DEFAULT TRUE,
      ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await ep_sql`
    CREATE TABLE IF NOT EXISTS ep_combo_deals (
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
  `;

  await ep_sql`
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
      ep_pizzaiolo VARCHAR(128) NOT NULL DEFAULT 'Chef Marco Bellini',
      ep_rider VARCHAR(128) NOT NULL DEFAULT 'Arjun Das (EV Express)',
      ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Ensure ep_pizzaiolo and ep_rider columns exist if ep_orders was created by an earlier schema version
  try {
    await ep_sql`ALTER TABLE ep_orders ADD COLUMN IF NOT EXISTS ep_pizzaiolo VARCHAR(128) NOT NULL DEFAULT 'Chef Marco Bellini'`;
    await ep_sql`ALTER TABLE ep_orders ADD COLUMN IF NOT EXISTS ep_rider VARCHAR(128) NOT NULL DEFAULT 'Arjun Das (EV Express)'`;
  } catch (_) {}

  await ep_sql`
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
  `;

  await ep_sql`
    CREATE TABLE IF NOT EXISTS ep_testimonials (
      ep_testimonial_id VARCHAR(64) PRIMARY KEY,
      ep_guest_name VARCHAR(128) NOT NULL,
      ep_guest_location VARCHAR(128) NOT NULL,
      ep_ordered_item VARCHAR(160) NOT NULL,
      ep_rating INTEGER NOT NULL DEFAULT 5,
      ep_comment TEXT NOT NULL,
      ep_verified BOOLEAN NOT NULL DEFAULT TRUE,
      ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await ep_sql`
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
  `;

  await ep_sql`
    CREATE TABLE IF NOT EXISTS ep_newsletter_subscribers (
      ep_subscriber_id SERIAL PRIMARY KEY,
      ep_subscriber_email VARCHAR(160) UNIQUE NOT NULL,
      ep_subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 2. Create Conflict-Free Analytical Views (ep_vw_*)
  await ep_sql`DROP VIEW IF EXISTS ep_vw_crm_overview CASCADE`;
  await ep_sql`DROP VIEW IF EXISTS ep_vw_order_revenue_summary CASCADE`;
  await ep_sql`DROP VIEW IF EXISTS ep_vw_active_menu_catalog CASCADE`;
  await ep_sql`
    CREATE OR REPLACE VIEW ep_vw_active_menu_catalog AS
    SELECT
      ep_item_id, ep_item_name, ep_category, ep_price, ep_calories, ep_prep_time,
      ep_is_veg, ep_is_spicy, ep_is_bestseller, ep_rating, ep_reviews_count,
      ep_description, ep_ingredients, ep_image_key, ep_created_at
    FROM ep_menu_items
    WHERE ep_available = TRUE
    ORDER BY ep_is_bestseller DESC, ep_rating DESC;
  `;

  await ep_sql`
    CREATE OR REPLACE VIEW ep_vw_order_revenue_summary AS
    SELECT
      COUNT(ep_order_id) AS ep_total_orders_count,
      COALESCE(SUM(ep_total_amount), 0) AS ep_gross_revenue,
      COALESCE(ROUND(AVG(ep_total_amount), 2), 0) AS ep_avg_order_value,
      COUNT(ep_order_id) FILTER (WHERE ep_order_status NOT IN ('Delivered Warm', 'Cancelled')) AS ep_active_kitchen_orders
    FROM ep_orders;
  `;

  await ep_sql`
    CREATE OR REPLACE VIEW ep_vw_crm_overview AS
    SELECT
      (SELECT COUNT(*) FROM ep_testimonials) AS ep_total_reviews,
      (SELECT COALESCE(ROUND(AVG(ep_rating), 2), 5.00) FROM ep_testimonials) AS ep_avg_guest_rating,
      (SELECT COUNT(*) FROM ep_contacts WHERE ep_inquiry_status = 'New Inquiry') AS ep_open_inquiries,
      (SELECT COUNT(*) FROM ep_newsletter_subscribers) AS ep_total_subscribers;
  `;

  // 3. Auto-Seed Pre-Existing Data if tables are empty
  const ep_settingsCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_site_settings`;
  if ((ep_settingsCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_site_settings (
        ep_setting_id, ep_active_festival, ep_banner_enabled, ep_banner_title,
        ep_banner_subtitle, ep_promo_code, ep_discount_percent, ep_delivery_fee, ep_free_delivery_threshold
      ) VALUES (
        1, 'default', TRUE,
        'Warm out of the brick oven: Flat 15% savings on all handcrafted orders today!',
        'Apply code ELYSIUM15 at checkout or enjoy complimentary Garlic Herb Knots on orders over ₹799.',
        'ELYSIUM15', 15, 49, 699
      ) ON CONFLICT (ep_setting_id) DO NOTHING;
    `;
  }

  const ep_menuCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_menu_items`;
  if ((ep_menuCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_menu_items (
        ep_item_id, ep_item_name, ep_category, ep_price, ep_calories, ep_prep_time,
        ep_is_veg, ep_is_spicy, ep_is_bestseller, ep_rating, ep_reviews_count,
        ep_description, ep_ingredients, ep_image_key, ep_available
      ) VALUES
      ('pizza-margherita-regina', 'San Marzano Margherita Regina', 'Signature Pizzas', 449, 690, '15-18 mins', TRUE, FALSE, TRUE, 4.95, 418, '72-hour cold-fermented sourdough crust topped with crushed San Marzano DOP tomatoes, creamy Fior di Latte mozzarella, sweet garden basil, and extra-virgin olive oil.', 'San Marzano Tomatoes, Fior di Latte, Fresh Basil, Cold-Pressed Olive Oil, Sea Salt', 'hero_margherita', TRUE),
      ('pizza-truffle-burrata', 'Truffle & Creamy Burrata Gold', 'Gourmet Specials', 649, 820, '18-22 mins', TRUE, FALSE, TRUE, 4.98, 356, 'Velvety roasted garlic bianco base crowned with whole torn Pugliese burrata, sautéed wild chanterelle & shiitake mushrooms, shaved black summer truffle, and lemon thyme.', 'Fresh Burrata, Black Truffle Shavings, Wild Mushrooms, Roasted Garlic Cream, Thyme', 'truffle_burrata', TRUE),
      ('pizza-diavola-honey', 'Crispy Cup Pepperoni & Hot Honey', 'Signature Pizzas', 589, 880, '16-20 mins', FALSE, TRUE, TRUE, 4.94, 512, 'Artisanal charred cups of smoked pepperoni, aged provolone & mozzarella, crushed Calabrian chili flakes, finished with a ribbon of wildflower hot honey.', 'Smoked Cup Pepperoni, Aged Mozzarella, Calabrian Chili, Wildflower Hot Honey, Basil', 'spicy_pepperoni_honey', TRUE),
      ('pizza-mediterranean-pan', 'Mediterranean Sunlit Garden Pan', 'Signature Pizzas', 519, 740, '18-22 mins', TRUE, FALSE, FALSE, 4.89, 274, 'Baked in our seasoned cast-iron pan for a golden crispy base with roasted red & yellow bell peppers, Kalamata olives, sun-dried tomatoes, baby spinach, and Greek feta.', 'Roasted Bell Peppers, Kalamata Olives, Sun-Dried Tomatoes, Greek Feta, Baby Spinach', 'mediterranean_veggie', TRUE),
      ('pizza-smoked-bbq-chicken', 'Smoked Hickory BBQ Chicken Stuffed Crust', 'Gourmet Specials', 629, 920, '20-24 mins', FALSE, FALSE, TRUE, 4.92, 389, 'Golden three-cheese stuffed crust loaded with chargrilled hickory BBQ chicken breast, caramelized red onions, sweet golden corn, smoked gouda, and fresh cilantro.', 'Chargrilled BBQ Chicken, Stuffed Cheese Crust, Smoked Gouda, Red Onions, Sweet Corn', 'bbq_chicken_supreme', TRUE),
      ('pizza-paneer-tikka-royale', 'Tandoori Malai Paneer & Pickled Onion', 'Gourmet Specials', 549, 790, '17-21 mins', TRUE, TRUE, TRUE, 4.91, 310, 'Clay-oven spiced malai paneer cubes, chargrilled capsicum, crunchy pickled red onions, mint-coriander drizzle, and molten mozzarella on our signature pan crust.', 'Malai Paneer Tikka, Charred Capsicum, Pickled Red Onion, Mint Chutney Drizzle, Mozzarella', 'mediterranean_veggie', TRUE),
      ('melt-truffle-mushroom', 'Crispy Parmesan Folded Pizza Melt', 'Crispy Melts & Pastas', 329, 560, '12-15 mins', TRUE, FALSE, FALSE, 4.86, 198, 'Crispy folded thin-crust handheld melt packed with three-cheese blend, roasted mushrooms, caramelized onions, and herbed parmesan crust—served with warm marinara dip.', 'Three-Cheese Blend, Roasted Mushrooms, Caramelized Onions, Herb Parmesan Crust, Marinara Dip', 'truffle_burrata', TRUE),
      ('pasta-baked-mac-arrabbiata', 'Wood-Fired Penne Arrabbiata Gratin', 'Crispy Melts & Pastas', 369, 610, '14-18 mins', TRUE, TRUE, FALSE, 4.87, 164, 'Bronze-die penne tossed in slow-simmered spicy San Marzano tomato & garlic sauce, topped with fresh burrata cream and baked golden in our brick oven.', 'Bronze-Die Penne, Spicy San Marzano Sauce, Roasted Garlic, Burrata Cream, Fresh Basil', 'hero_margherita', TRUE),
      ('sides-garlic-herb-knots', 'Artisanal Garlic Parmesan Bread Knots (6 Pcs)', 'Artisanal Sides', 219, 480, '10-12 mins', TRUE, FALSE, TRUE, 4.96, 440, 'Hand-tied 72-hour sourdough knots brushed generously with roasted garlic herb butter, aged Parmigiano-Reggiano, and served with warm basil marinara.', 'Sourdough Knots, Roasted Garlic Butter, Aged Parmesan, Fresh Parsley, Marinara Dip', 'garlic_knots_lava_cake', TRUE),
      ('dessert-molten-lava-cake', 'Belgian Dark Chocolate Molten Lava Cake', 'Desserts & Drinks', 249, 510, '10-12 mins', TRUE, FALSE, TRUE, 4.97, 392, 'Warm, freshly baked 70% Belgian couverture chocolate cake with a flowing molten ganache center, dusted with vanilla bean sugar and served with fresh raspberries.', '70% Belgian Chocolate, Cultured Butter, Vanilla Bean Sugar, Fresh Raspberries, Mint', 'garlic_knots_lava_cake', TRUE)
      ON CONFLICT (ep_item_id) DO NOTHING;
    `;
  }

  const ep_comboCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_combo_deals`;
  if ((ep_comboCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_combo_deals (
        ep_combo_id, ep_combo_name, ep_badge, ep_serves, ep_original_price, ep_combo_price,
        ep_description, ep_items_summary, ep_image_key
      ) VALUES
      ('combo-triple-treat-box', 'The Elysium Triple Treat Box', 'MOST POPULAR FAMILY BOX', 'Serves 4–5 Guests', 1599, 1199, '2 Medium Signature Pizzas of your choice + 6 Garlic Herb Bread Knots with Marinara + 1 Warm Belgian Chocolate Molten Lava Cake.', '2x Medium Pizzas + 6pc Garlic Knots + Molten Lava Cake', 'garlic_knots_lava_cake'),
      ('combo-gourmet-duo-feast', 'Sunlit Gourmet Date-Night Duo', 'COUPLE''S FAVOURITE', 'Serves 2–3 Guests', 1099, 849, '1 Medium Truffle & Burrata or Pepperoni Hot Honey Pizza + 1 Crispy Parmesan Melt + 6 Garlic Herb Knots.', '1x Gourmet Pizza + 1x Crispy Melt + 6pc Garlic Knots', 'truffle_burrata'),
      ('combo-grand-party-fiesta', 'Grand Wood-Fired Party Fiesta', 'CELEBRATION PACK', 'Serves 7–8 Guests', 2699, 1999, '3 Large Signature & Gourmet Pizzas + 12 Garlic Parmesan Bread Knots + 2 Wood-Fired Pastas + 2 Belgian Molten Lava Cakes.', '3x Large Pizzas + 12pc Knots + 2x Pastas + 2x Lava Cakes', 'spicy_pepperoni_honey')
      ON CONFLICT (ep_combo_id) DO NOTHING;
    `;
  }

  const ep_blogCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_blog_posts`;
  if ((ep_blogCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_blog_posts (
        ep_blog_id, ep_title, ep_category, ep_author, ep_author_role, ep_read_time,
        ep_published_date, ep_excerpt, ep_content, ep_image_key, ep_featured
      ) VALUES
      ('blog-72-hour-fermentation', 'Why We Cold-Ferment Our Sourdough for 72 Full Hours', 'Culinary Craft', 'Chef Marco Bellini', 'Master Pizzaiolo & Co-Founder', '4 min read', 'October 24, 2026', 'Discover how slow cold fermentation unlocks airy honeycomb crusts, complex artisanal aromas, and effortless digestibility in every slice we bake.', 'At Elysium Pizza, we believe great pizza begins three days before the oven is even lit. Unlike rushed commercial doughs that rely on heavy yeast and sugar, our dough is mixed with stone-milled Italian Tipo 00 flour, high-mineral spring water, sea salt, and our 18-year-old natural levain starter.\n\nOver 72 hours in our temperature-controlled maturation cellar at 4°C, natural enzymes gently break down complex starches and gluten networks. When the hand-stretched disc meets the 485°C volcanic stone floor of our brick oven, the trapped micro-bubbles expand rapidly into a crisp, leopard-spotted cornicione that stays light, fragrant, and wonderfully digestible.', 'hero_margherita', TRUE),
      ('blog-truffle-burrata-pairing', 'From Puglia to Your Table: Crafting the Truffle & Burrata Gold', 'Ingredient Stories', 'Chef Ananya Sen', 'Culinary Director', '5 min read', 'October 18, 2026', 'How fresh stracciatella-filled burrata, wild forest mushrooms, and aromatic black truffle create our most requested white pizza.', 'White pizzas—or Pizza Bianca—demand extraordinary balance because there is no acidity from tomato sauce to hide behind. For our Truffle & Burrata Gold, we begin with a delicate roasted garlic and Parmigiano-Reggiano cream base.\n\nWe bake the crust with sautéed chanterelle and shiitake mushrooms, and only after the pizza emerges blistering hot from the wood-fired oven do we crown it with cool, creamy burrata and shaved black summer truffles. The contrast between the warm, crispy crust and the cool, cascading stracciatella cream creates a truly unforgettable bite.', 'truffle_burrata', FALSE),
      ('blog-hot-honey-revolution', 'Sweet Meets Heat: The Story Behind Our Calabrian Hot Honey Drizzle', 'Flavour Notes', 'Rohan Chatterjee', 'Artisanal Sauce Curator', '3 min read', 'October 10, 2026', 'We infuse raw multiflora wildflower honey with sun-dried red chilies to create the ultimate counterpoint to savoury cupped pepperoni.', 'Every great culinary tradition celebrates the marriage of sweet, savoury, and spicy. In our kitchen, we gently warm raw wildflower honey with crushed Calabrian chilies and a splash of aged apple cider vinegar.\n\nDrizzled over crispy, charred pepperoni cups and bubbling mozzarella right before serving, the floral sweetness rounds out the smoky spice and keeps you reaching for the next slice.', 'spicy_pepperoni_honey', FALSE)
      ON CONFLICT (ep_blog_id) DO NOTHING;
    `;
  }

  const ep_revCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_testimonials`;
  if ((ep_revCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_testimonials (
        ep_testimonial_id, ep_guest_name, ep_guest_location, ep_ordered_item, ep_rating, ep_comment, ep_verified
      ) VALUES
      ('rev-101', 'Arundhati Mukherjee', 'Ballygunge, Kolkata', 'Truffle & Creamy Burrata Gold', 5, 'Hands down the finest crust in the city! It arrived steaming hot in 24 minutes, and the burrata was so fresh and creamy. The Triple Treat Box is our family''s Friday night ritual now.', TRUE),
      ('rev-102', 'Vikramaditya Roy', 'Salt Lake Sector V', 'Crispy Cup Pepperoni & Hot Honey', 5, 'The balance of smoky pepperoni cups with the wildflower hot honey drizzle is pure magic. You can genuinely taste the 72-hour fermented sourdough difference—light, crisp, and zero heaviness.', TRUE),
      ('rev-103', 'Sneha & Kabir Bose', 'Park Street, Kolkata', 'The Elysium Triple Treat Box', 5, 'Ordered for our anniversary dinner at home. The garlic parmesan knots and Belgian molten lava cake were restaurant-grade perfection. Loved tracking every stage from dough stretching to delivery!', TRUE),
      ('rev-104', 'Devansh Sengupta', 'New Town Action Area I', 'Custom Crafted Pan Pizza', 5, 'The Custom Pizza Studio let me build my dream stuffed-crust pie with smoked gouda, olives, and sun-dried tomatoes. Super intuitive website and super fast delivery!', TRUE)
      ON CONFLICT (ep_testimonial_id) DO NOTHING;
    `;
  }

  const ep_ordCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_orders`;
  if ((ep_ordCount[0]?.cnt || 0) === 0) {
    const ep_seedOrder1 = JSON.stringify([
      { name: 'Truffle & Creamy Burrata Gold (Medium 12", Hand-Tossed)', qty: 1, price: 649 },
      { name: 'Artisanal Garlic Parmesan Bread Knots (6 Pcs)', qty: 1, price: 219 }
    ]);
    const ep_seedOrder2 = JSON.stringify([
      { name: 'The Elysium Triple Treat Box', qty: 1, price: 1199 }
    ]);
    await ep_sql`
      INSERT INTO ep_orders (
        ep_order_id, ep_customer_name, ep_customer_phone, ep_customer_email, ep_delivery_type,
        ep_address, ep_items_json, ep_subtotal, ep_discount_amount, ep_tax_amount,
        ep_delivery_charge, ep_total_amount, ep_payment_method, ep_order_status, ep_special_notes,
        ep_pizzaiolo, ep_rider
      ) VALUES
      ('ELY-849201', 'Arundhati Mukherjee', '+91 98301 44210', 'arundhati.m@example.com', 'Delivery', '42B Lovelock Place, Ballygunge, Kolkata 700019', ${ep_seedOrder1}::jsonb, 868, 130, 37, 0, 775, 'UPI / Instant Pay', 'Baking in Wood-Fired Oven', 'Extra fresh basil leaves please', 'Chef Marco Bellini', 'Arjun Das (EV Express)'),
      ('ELY-849178', 'Siddharth Verma', '+91 98312 88904', 'siddharth.v@example.com', 'Delivery', 'Tower 4, Apt 11C, Urbana, Kolkata 700107', ${ep_seedOrder2}::jsonb, 1199, 180, 51, 0, 1070, 'Card on Delivery', 'Out for Hot-Box Delivery', 'Ring doorbell on arrival', 'Chef Ananya Sen', 'Rakesh Mondal (EV Express)')
      ON CONFLICT (ep_order_id) DO NOTHING;
    `;
  }

  const ep_inqCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_contacts`;
  if ((ep_inqCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_contacts (
        ep_contact_id, ep_full_name, ep_email, ep_phone, ep_topic, ep_party_size, ep_message, ep_inquiry_status
      ) VALUES
      ('inq-301', 'Priyanka Chatterjee', 'priyanka.c@avenirmedia.in', '+91 98309 11234', 'Private Event & Office Catering', '45 Guests', 'We would love to book live pizza catering and 15 Triple Treat Boxes for our Diwali office celebration next Friday at Park Street.', 'New Inquiry'),
      ('inq-302', 'Rishabh Agarwal', 'rishabh.ag@gmail.com', '+91 90071 55412', 'Table Reservation', '12 Guests', 'Looking to reserve the sunlit garden terrace table this Sunday evening at 7:30 PM with a pre-ordered custom truffle pizza spread.', 'Confirmed')
      ON CONFLICT (ep_contact_id) DO NOTHING;
    `;
  }

  const ep_subCount = await ep_sql`SELECT COUNT(*)::int AS cnt FROM ep_newsletter_subscribers`;
  if ((ep_subCount[0]?.cnt || 0) === 0) {
    await ep_sql`
      INSERT INTO ep_newsletter_subscribers (ep_subscriber_email) VALUES
      ('arundhati.m@example.com'),
      ('vikram.roy@example.com')
      ON CONFLICT (ep_subscriber_email) DO NOTHING;
    `;
  }

  ep_schemaInitializedInWarmContainer = true;
}

function ep_extractRoute(ep_event) {
  const ep_qs = ep_event.queryStringParameters || {};
  let ep_pathStr = ep_event.path || '';
  if ((!ep_pathStr || ep_pathStr === '/.netlify/functions/api') && ep_event.rawUrl) {
    try {
      ep_pathStr = new URL(ep_event.rawUrl).pathname;
    } catch (_) {}
  }
  const ep_cleaned = ep_pathStr
    .replace(/^\/\.netlify\/functions\/api\/?/, '')
    .replace(/^\/api\/?/, '');
  const ep_segments = ep_cleaned.split('/').filter(Boolean);
  const ep_resource = ep_qs.resource || ep_segments[0] || 'status';
  const ep_resourceId = ep_qs.id || ep_segments[1] || null;
  return { ep_resource, ep_resourceId };
}

exports.handler = async (ep_event) => {
  if (ep_event.httpMethod === 'OPTIONS') {
    return ep_respond(200, { ok: true, cors: 'enabled', ep_schema_prefix: 'ep_' });
  }

  const { ep_resource, ep_resourceId } = ep_extractRoute(ep_event);
  const ep_method = ep_event.httpMethod;

  let ep_body = {};
  if (ep_event.body) {
    try {
      const ep_rawBody = ep_event.isBase64Encoded
        ? Buffer.from(ep_event.body, 'base64').toString('utf8')
        : ep_event.body;
      ep_body = JSON.parse(ep_rawBody);
    } catch (_) {
      return ep_respond(400, { error: 'Invalid JSON request payload' });
    }
  }

  // 1. Admin Login Verification Endpoint (/api/auth/login)
  if ((ep_resource === 'auth' && ep_resourceId === 'login') || ep_resource === 'login') {
    if (ep_verifyAdmin(ep_event, ep_body)) {
      return ep_respond(200, {
        authenticated: true,
        ep_role: 'administrator',
        message: 'Authenticated with Elysium Pizza Management Suite'
      });
    }
    return ep_respond(401, {
      authenticated: false,
      error: 'Invalid ADMIN_USERNAME or ADMIN_PASSWORD credentials'
    });
  }

  const ep_dbUrl = ep_cleanEnv(process.env.EP_DATABASE_URL || process.env.DATABASE_URL);
  if (!ep_dbUrl) {
    return ep_respond(503, {
      error: 'DATABASE_URL (or EP_DATABASE_URL) environment variable is not configured in Netlify Site Settings.',
      fallback: true
    });
  }

  try {
    const ep_sql = neon(ep_dbUrl);
    await ep_ensureSchemaAndSeed(ep_sql);

    // 1B. CLEANUP & FRESH SEED ENDPOINT (/api/reset-db)
    if (ep_resource === 'reset-db' && ep_method === 'POST') {
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to reset and re-seed NeonDB' });
      }
      await ep_ensureSchemaAndSeed(ep_sql, true);
      return ep_respond(200, {
        reset: true,
        message: 'Cleaned up all ep_* views/tables and executed fresh schema + seed scripts.'
      });
    }

    // 2. BOOTSTRAP ALL DATA IN ONE CALL (/api/bootstrap)
    if (ep_resource === 'bootstrap' && ep_method === 'GET') {
      const [
        ep_settingsRows,
        ep_menuRows,
        ep_comboRows,
        ep_blogRows,
        ep_revRows,
        ep_orderRows,
        ep_contactRows,
        ep_subRows
      ] = await Promise.all([
        ep_sql`SELECT * FROM ep_site_settings ORDER BY ep_setting_id ASC LIMIT 1`,
        ep_sql`SELECT * FROM ep_menu_items ORDER BY ep_created_at ASC`,
        ep_sql`SELECT * FROM ep_combo_deals ORDER BY ep_created_at ASC`,
        ep_sql`SELECT * FROM ep_blog_posts ORDER BY ep_created_at DESC`,
        ep_sql`SELECT * FROM ep_testimonials ORDER BY ep_created_at DESC`,
        ep_sql`SELECT * FROM ep_orders ORDER BY ep_created_at DESC`,
        ep_sql`SELECT * FROM ep_contacts ORDER BY ep_created_at DESC`,
        ep_sql`SELECT * FROM ep_newsletter_subscribers ORDER BY ep_subscribed_at DESC`
      ]);

      return ep_respond(200, {
        ep_database_connected: true,
        ep_schema_prefix: 'ep_',
        settings: ep_normalizeSettingsRow(ep_settingsRows[0]),
        menu: ep_menuRows.map(ep_normalizeMenuRow),
        combos: ep_comboRows.map(ep_normalizeComboRow),
        blogs: ep_blogRows.map(ep_normalizeBlogRow),
        testimonials: ep_revRows.map(ep_normalizeTestimonialRow),
        orders: ep_orderRows.map(ep_normalizeOrderRow),
        contacts: ep_contactRows.map(ep_normalizeContactRow),
        subscribers: ep_subRows.map((s) => ({
          id: s.ep_subscriber_id,
          email: s.ep_subscriber_email,
          subscribed_at: s.ep_subscribed_at
            ? new Date(s.ep_subscribed_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })
            : 'Subscribed'
        }))
      });
    }

    // 3. MENU ITEMS CRUD (/api/menu -> ep_menu_items)
    if (ep_resource === 'menu') {
      if (ep_method === 'GET') {
        const ep_rows = ep_resourceId
          ? await ep_sql`SELECT * FROM ep_menu_items WHERE ep_item_id = ${ep_resourceId}`
          : await ep_sql`SELECT * FROM ep_menu_items ORDER BY ep_created_at ASC`;
        const ep_data = ep_rows.map(ep_normalizeMenuRow);
        return ep_respond(200, { ep_table: 'ep_menu_items', data: ep_data, count: ep_data.length });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to modify ep_menu_items' });
      }
      if (ep_method === 'POST' || ep_method === 'PUT') {
        const ep_id = ep_resourceId || ep_body.ep_item_id || ep_body.id || `ep_item_${Date.now()}`;
        const ep_name = ep_body.ep_item_name || ep_body.name;
        const ep_cat = ep_body.ep_category || ep_body.category || 'Signature Pizzas';
        const ep_price = Number(ep_body.ep_price ?? ep_body.price ?? 499);
        const ep_cal = Number(ep_body.ep_calories ?? ep_body.calories ?? 740);
        const ep_prep = ep_body.ep_prep_time || ep_body.prep_time || '18-22 mins';
        const ep_veg = Boolean(ep_body.ep_is_veg ?? ep_body.is_veg ?? true);
        const ep_spicy = Boolean(ep_body.ep_is_spicy ?? ep_body.is_spicy ?? false);
        const ep_best = Boolean(ep_body.ep_is_bestseller ?? ep_body.is_bestseller ?? false);
        const ep_rate = Number(ep_body.ep_rating ?? ep_body.rating ?? 4.95);
        const ep_revs = Number(ep_body.ep_reviews_count ?? ep_body.reviews_count ?? 88);
        const ep_desc = ep_body.ep_description ?? ep_body.description ?? '';
        const ep_ing = ep_body.ep_ingredients ?? ep_body.ingredients ?? 'Artisanal Sourdough, Fior di Latte, Fresh Herbs';
        const ep_img = ep_body.ep_image_key || ep_body.image_key || 'hero_margherita';
        const ep_avail = (ep_body.ep_available ?? ep_body.available) !== false;

        const ep_rows = await ep_sql`
          INSERT INTO ep_menu_items (
            ep_item_id, ep_item_name, ep_category, ep_price, ep_calories, ep_prep_time,
            ep_is_veg, ep_is_spicy, ep_is_bestseller, ep_rating, ep_reviews_count,
            ep_description, ep_ingredients, ep_image_key, ep_available
          )
          VALUES (
            ${ep_id}, ${ep_name}, ${ep_cat}, ${ep_price}, ${ep_cal}, ${ep_prep},
            ${ep_veg}, ${ep_spicy}, ${ep_best}, ${ep_rate}, ${ep_revs},
            ${ep_desc}, ${ep_ing}, ${ep_img}, ${ep_avail}
          )
          ON CONFLICT (ep_item_id) DO UPDATE SET
            ep_item_name = EXCLUDED.ep_item_name,
            ep_category = EXCLUDED.ep_category,
            ep_price = EXCLUDED.ep_price,
            ep_calories = EXCLUDED.ep_calories,
            ep_prep_time = EXCLUDED.ep_prep_time,
            ep_is_veg = EXCLUDED.ep_is_veg,
            ep_is_spicy = EXCLUDED.ep_is_spicy,
            ep_is_bestseller = EXCLUDED.ep_is_bestseller,
            ep_description = EXCLUDED.ep_description,
            ep_ingredients = EXCLUDED.ep_ingredients,
            ep_image_key = EXCLUDED.ep_image_key,
            ep_available = EXCLUDED.ep_available
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_menu_items', data: ep_normalizeMenuRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        const ep_targetId = ep_resourceId || ep_body.ep_item_id || ep_body.id;
        await ep_sql`DELETE FROM ep_menu_items WHERE ep_item_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_menu_items', deleted: ep_targetId });
      }
    }

    // 4. COMBO DEALS CRUD (/api/combos -> ep_combo_deals)
    if (ep_resource === 'combos') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_combo_deals ORDER BY ep_created_at ASC`;
        return ep_respond(200, { ep_table: 'ep_combo_deals', data: ep_rows.map(ep_normalizeComboRow) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to modify ep_combo_deals' });
      }
      if (ep_method === 'POST' || ep_method === 'PUT') {
        const ep_id = ep_resourceId || ep_body.ep_combo_id || ep_body.id || `ep_combo_${Date.now()}`;
        const ep_rows = await ep_sql`
          INSERT INTO ep_combo_deals (
            ep_combo_id, ep_combo_name, ep_badge, ep_serves, ep_original_price,
            ep_combo_price, ep_description, ep_items_summary, ep_image_key
          ) VALUES (
            ${ep_id},
            ${ep_body.ep_combo_name || ep_body.name},
            ${ep_body.ep_badge || ep_body.badge || 'FAMILY FEAST BOX'},
            ${ep_body.ep_serves || ep_body.serves || 'Serves 3–4 Guests'},
            ${Number(ep_body.ep_original_price ?? ep_body.original_price ?? 1499)},
            ${Number(ep_body.ep_combo_price ?? ep_body.price ?? 1099)},
            ${ep_body.ep_description || ep_body.description || ''},
            ${ep_body.ep_items_summary || ep_body.items_summary || ''},
            ${ep_body.ep_image_key || ep_body.image_key || 'garlic_knots_lava_cake'}
          )
          ON CONFLICT (ep_combo_id) DO UPDATE SET
            ep_combo_name = EXCLUDED.ep_combo_name,
            ep_badge = EXCLUDED.ep_badge,
            ep_serves = EXCLUDED.ep_serves,
            ep_original_price = EXCLUDED.ep_original_price,
            ep_combo_price = EXCLUDED.ep_combo_price,
            ep_description = EXCLUDED.ep_description,
            ep_items_summary = EXCLUDED.ep_items_summary,
            ep_image_key = EXCLUDED.ep_image_key
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_combo_deals', data: ep_normalizeComboRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        const ep_targetId = ep_resourceId || ep_body.ep_combo_id || ep_body.id;
        await ep_sql`DELETE FROM ep_combo_deals WHERE ep_combo_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_combo_deals', deleted: ep_targetId });
      }
    }

    // 5. ORDERS CRUD (/api/orders -> ep_orders)
    if (ep_resource === 'orders') {
      if (ep_method === 'GET') {
        const ep_rows = ep_resourceId
          ? await ep_sql`SELECT * FROM ep_orders WHERE ep_order_id = ${ep_resourceId}`
          : await ep_sql`SELECT * FROM ep_orders ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeOrderRow);
        return ep_respond(200, { ep_table: 'ep_orders', data: ep_data, count: ep_data.length });
      }
      if (ep_method === 'POST') {
        const ep_id = ep_body.ep_order_id || ep_body.id || `ELY-${Math.floor(100000 + Math.random() * 900000)}`;
        const ep_itemsPayload = JSON.stringify(ep_body.ep_items_json || ep_body.items || []);
        const ep_rows = await ep_sql`
          INSERT INTO ep_orders (
            ep_order_id, ep_customer_name, ep_customer_phone, ep_customer_email,
            ep_delivery_type, ep_address, ep_items_json, ep_subtotal,
            ep_discount_amount, ep_tax_amount, ep_delivery_charge, ep_total_amount,
            ep_payment_method, ep_order_status, ep_special_notes, ep_pizzaiolo, ep_rider
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_customer_name || ep_body.customer_name || 'Valued Guest'},
            ${ep_body.ep_customer_phone || ep_body.customer_phone || ''},
            ${ep_body.ep_customer_email || ep_body.customer_email || ''},
            ${ep_body.ep_delivery_type || ep_body.delivery_type || 'Delivery'},
            ${ep_body.ep_address || ep_body.address || ''},
            ${ep_itemsPayload}::jsonb,
            ${Number(ep_body.ep_subtotal ?? ep_body.subtotal ?? 0)},
            ${Number(ep_body.ep_discount_amount ?? ep_body.discount_amount ?? 0)},
            ${Number(ep_body.ep_tax_amount ?? ep_body.tax_amount ?? 0)},
            ${Number(ep_body.ep_delivery_charge ?? ep_body.delivery_charge ?? 0)},
            ${Number(ep_body.ep_total_amount ?? ep_body.total_amount ?? 0)},
            ${ep_body.ep_payment_method || ep_body.payment_method || 'UPI / Instant Pay'},
            ${ep_body.ep_order_status || ep_body.status || 'Hand-Stretching 72h Dough'},
            ${ep_body.ep_special_notes || ep_body.special_notes || ''},
            ${ep_body.ep_pizzaiolo || ep_body.pizzaiolo || 'Chef Marco Bellini'},
            ${ep_body.ep_rider || ep_body.rider || 'Arjun Das (EV Express)'}
          )
          ON CONFLICT (ep_order_id) DO UPDATE SET
            ep_order_status = EXCLUDED.ep_order_status
          RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_orders', data: ep_normalizeOrderRow(ep_rows[0]) });
      }
      if (ep_method === 'PUT') {
        const ep_targetId = ep_resourceId || ep_body.ep_order_id || ep_body.id;
        const ep_statusVal = ep_body.ep_order_status || ep_body.status;
        const ep_rows = await ep_sql`
          UPDATE ep_orders SET ep_order_status = ${ep_statusVal} WHERE ep_order_id = ${ep_targetId} RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_orders', data: ep_normalizeOrderRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        if (!ep_verifyAdmin(ep_event, ep_body)) {
          return ep_respond(401, { error: 'Admin authentication required to delete ep_orders' });
        }
        const ep_targetId = ep_resourceId || ep_body.ep_order_id || ep_body.id;
        await ep_sql`DELETE FROM ep_orders WHERE ep_order_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_orders', deleted: ep_targetId });
      }
    }

    // 6. BLOG POSTS CRUD (/api/blogs -> ep_blog_posts)
    if (ep_resource === 'blogs') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_blog_posts ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeBlogRow);
        return ep_respond(200, { ep_table: 'ep_blog_posts', data: ep_data, count: ep_data.length });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required for ep_blog_posts management' });
      }
      if (ep_method === 'POST' || ep_method === 'PUT') {
        const ep_id = ep_resourceId || ep_body.ep_blog_id || ep_body.id || `ep_blog_${Date.now()}`;
        const ep_rows = await ep_sql`
          INSERT INTO ep_blog_posts (
            ep_blog_id, ep_title, ep_category, ep_author, ep_author_role,
            ep_read_time, ep_published_date, ep_excerpt, ep_content, ep_image_key, ep_featured
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_title || ep_body.title},
            ${ep_body.ep_category || ep_body.category || 'Culinary Craft'},
            ${ep_body.ep_author || ep_body.author || 'Chef Marco Bellini'},
            ${ep_body.ep_author_role || ep_body.author_role || 'Elysium Culinary Team'},
            ${ep_body.ep_read_time || ep_body.read_time || '4 min read'},
            ${ep_body.ep_published_date || ep_body.published_date || 'October 30, 2026'},
            ${ep_body.ep_excerpt || ep_body.excerpt || ''},
            ${ep_body.ep_content || ep_body.content || ''},
            ${ep_body.ep_image_key || ep_body.image_key || 'hero_margherita'},
            ${Boolean(ep_body.ep_featured ?? ep_body.featured)}
          )
          ON CONFLICT (ep_blog_id) DO UPDATE SET
            ep_title = EXCLUDED.ep_title,
            ep_category = EXCLUDED.ep_category,
            ep_author = EXCLUDED.ep_author,
            ep_author_role = EXCLUDED.ep_author_role,
            ep_read_time = EXCLUDED.ep_read_time,
            ep_published_date = EXCLUDED.ep_published_date,
            ep_excerpt = EXCLUDED.ep_excerpt,
            ep_content = EXCLUDED.ep_content,
            ep_image_key = EXCLUDED.ep_image_key,
            ep_featured = EXCLUDED.ep_featured
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_blog_posts', data: ep_normalizeBlogRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        const ep_targetId = ep_resourceId || ep_body.ep_blog_id || ep_body.id;
        await ep_sql`DELETE FROM ep_blog_posts WHERE ep_blog_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_blog_posts', deleted: ep_targetId });
      }
    }

    // 7. TESTIMONIALS CRUD (/api/testimonials -> ep_testimonials)
    if (ep_resource === 'testimonials') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_testimonials ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeTestimonialRow);
        return ep_respond(200, { ep_table: 'ep_testimonials', data: ep_data, count: ep_data.length });
      }
      if (ep_method === 'POST' || ep_method === 'PUT') {
        const ep_id = ep_resourceId || ep_body.ep_testimonial_id || ep_body.id || `ep_rev_${Date.now()}`;
        const ep_rows = await ep_sql`
          INSERT INTO ep_testimonials (
            ep_testimonial_id, ep_guest_name, ep_guest_location, ep_ordered_item, ep_rating, ep_comment, ep_verified
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_guest_name || ep_body.guest_name},
            ${ep_body.ep_guest_location || ep_body.guest_location || 'Kolkata'},
            ${ep_body.ep_ordered_item || ep_body.ordered_item || 'Truffle & Creamy Burrata Gold'},
            ${Number(ep_body.ep_rating ?? ep_body.rating ?? 5)},
            ${ep_body.ep_comment || ep_body.comment},
            TRUE
          )
          ON CONFLICT (ep_testimonial_id) DO UPDATE SET
            ep_guest_name = EXCLUDED.ep_guest_name,
            ep_guest_location = EXCLUDED.ep_guest_location,
            ep_ordered_item = EXCLUDED.ep_ordered_item,
            ep_rating = EXCLUDED.ep_rating,
            ep_comment = EXCLUDED.ep_comment
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_testimonials', data: ep_normalizeTestimonialRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        if (!ep_verifyAdmin(ep_event, ep_body)) {
          return ep_respond(401, { error: 'Admin authentication required to delete ep_testimonials' });
        }
        const ep_targetId = ep_resourceId || ep_body.ep_testimonial_id || ep_body.id;
        await ep_sql`DELETE FROM ep_testimonials WHERE ep_testimonial_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_testimonials', deleted: ep_targetId });
      }
    }

    // 8. CONTACTS & INQUIRIES CRUD (/api/contacts -> ep_contacts)
    if (ep_resource === 'contacts') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_contacts ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeContactRow);
        return ep_respond(200, { ep_table: 'ep_contacts', data: ep_data, count: ep_data.length });
      }
      if (ep_method === 'POST') {
        const ep_id = ep_body.ep_contact_id || ep_body.id || `ep_inq_${Date.now()}`;
        const ep_rows = await ep_sql`
          INSERT INTO ep_contacts (
            ep_contact_id, ep_full_name, ep_email, ep_phone, ep_topic, ep_party_size, ep_message, ep_inquiry_status
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_full_name || ep_body.full_name},
            ${ep_body.ep_email || ep_body.email},
            ${ep_body.ep_phone || ep_body.phone || ''},
            ${ep_body.ep_topic || ep_body.topic || 'General Feedback'},
            ${ep_body.ep_party_size || ep_body.party_size || 'Standard'},
            ${ep_body.ep_message || ep_body.message},
            ${ep_body.ep_inquiry_status || ep_body.status || 'New Inquiry'}
          )
          ON CONFLICT (ep_contact_id) DO UPDATE SET
            ep_full_name = EXCLUDED.ep_full_name,
            ep_email = EXCLUDED.ep_email,
            ep_phone = EXCLUDED.ep_phone,
            ep_topic = EXCLUDED.ep_topic,
            ep_party_size = EXCLUDED.ep_party_size,
            ep_message = EXCLUDED.ep_message,
            ep_inquiry_status = EXCLUDED.ep_inquiry_status
          RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_contacts', data: ep_normalizeContactRow(ep_rows[0]) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to update or delete ep_contacts' });
      }
      if (ep_method === 'PUT') {
        const ep_targetId = ep_resourceId || ep_body.ep_contact_id || ep_body.id;
        const ep_statusVal = ep_body.ep_inquiry_status || ep_body.status || 'Resolved';
        const ep_rows = await ep_sql`
          UPDATE ep_contacts
          SET ep_inquiry_status = ${ep_statusVal},
              ep_full_name = COALESCE(${ep_body.ep_full_name || ep_body.full_name || null}, ep_full_name),
              ep_email = COALESCE(${ep_body.ep_email || ep_body.email || null}, ep_email),
              ep_topic = COALESCE(${ep_body.ep_topic || ep_body.topic || null}, ep_topic),
              ep_message = COALESCE(${ep_body.ep_message || ep_body.message || null}, ep_message)
          WHERE ep_contact_id = ${ep_targetId}
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_contacts', data: ep_normalizeContactRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE') {
        const ep_targetId = ep_resourceId || ep_body.ep_contact_id || ep_body.id;
        await ep_sql`DELETE FROM ep_contacts WHERE ep_contact_id = ${ep_targetId}`;
        return ep_respond(200, { ep_table: 'ep_contacts', deleted: ep_targetId });
      }
    }

    // 9. FESTIVE BANNERS, DISCOUNTS & THEME SETTINGS (/api/settings -> ep_site_settings)
    if (ep_resource === 'settings') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_site_settings ORDER BY ep_setting_id ASC LIMIT 1`;
        return ep_respond(200, { ep_table: 'ep_site_settings', data: ep_normalizeSettingsRow(ep_rows[0]) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to update ep_site_settings' });
      }
      if (ep_method === 'PUT' || ep_method === 'POST') {
        const ep_rows = await ep_sql`
          INSERT INTO ep_site_settings (
            ep_setting_id, ep_active_festival, ep_banner_enabled, ep_banner_title,
            ep_banner_subtitle, ep_promo_code, ep_discount_percent, ep_delivery_fee,
            ep_free_delivery_threshold, ep_updated_at
          )
          VALUES (
            1,
            ${ep_body.ep_active_festival || ep_body.active_festival || 'default'},
            ${(ep_body.ep_banner_enabled ?? ep_body.banner_enabled) !== false},
            ${ep_body.ep_banner_title || ep_body.banner_title || ''},
            ${ep_body.ep_banner_subtitle || ep_body.banner_subtitle || ''},
            ${ep_body.ep_promo_code || ep_body.promo_code || 'ELYSIUM15'},
            ${Number(ep_body.ep_discount_percent ?? ep_body.discount_percent ?? 15)},
            ${Number(ep_body.ep_delivery_fee ?? ep_body.delivery_fee ?? 49)},
            ${Number(ep_body.ep_free_delivery_threshold ?? ep_body.free_delivery_threshold ?? 699)},
            NOW()
          )
          ON CONFLICT (ep_setting_id) DO UPDATE SET
            ep_active_festival = EXCLUDED.ep_active_festival,
            ep_banner_enabled = EXCLUDED.ep_banner_enabled,
            ep_banner_title = EXCLUDED.ep_banner_title,
            ep_banner_subtitle = EXCLUDED.ep_banner_subtitle,
            ep_promo_code = EXCLUDED.ep_promo_code,
            ep_discount_percent = EXCLUDED.ep_discount_percent,
            ep_delivery_fee = EXCLUDED.ep_delivery_fee,
            ep_free_delivery_threshold = EXCLUDED.ep_free_delivery_threshold,
            ep_updated_at = NOW()
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_site_settings', data: ep_normalizeSettingsRow(ep_rows[0]) });
      }
    }

    // 10. NEWSLETTER SUBSCRIBERS (/api/newsletter -> ep_newsletter_subscribers)
    if (ep_resource === 'newsletter') {
      if (ep_method === 'POST') {
        const ep_email = ep_body.ep_subscriber_email || ep_body.email;
        const ep_rows = await ep_sql`
          INSERT INTO ep_newsletter_subscribers (ep_subscriber_email) VALUES (${ep_email})
          ON CONFLICT (ep_subscriber_email) DO UPDATE SET ep_subscribed_at = NOW()
          RETURNING *;
        `;
        return ep_respond(201, {
          ep_table: 'ep_newsletter_subscribers',
          subscribed: true,
          data: {
            id: ep_rows[0]?.ep_subscriber_id,
            email: ep_rows[0]?.ep_subscriber_email || ep_email,
            subscribed_at: 'Today'
          }
        });
      }
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_newsletter_subscribers ORDER BY ep_subscribed_at DESC`;
        return ep_respond(200, {
          ep_table: 'ep_newsletter_subscribers',
          data: ep_rows.map((s) => ({
            id: s.ep_subscriber_id,
            email: s.ep_subscriber_email,
            subscribed_at: s.ep_subscribed_at
              ? new Date(s.ep_subscribed_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })
              : 'Subscribed'
          }))
        });
      }
      if (ep_method === 'DELETE') {
        const ep_targetEmail = ep_resourceId || ep_body.email;
        await ep_sql`DELETE FROM ep_newsletter_subscribers WHERE ep_subscriber_email = ${ep_targetEmail}`;
        return ep_respond(200, { ep_table: 'ep_newsletter_subscribers', deleted: ep_targetEmail });
      }
    }

    // 11. ANALYTICS VIEWS ENDPOINT (/api/analytics)
    if (ep_resource === 'analytics' && ep_method === 'GET') {
      const [ep_rev, ep_crm, ep_activeMenu] = await Promise.all([
        ep_sql`SELECT * FROM ep_vw_order_revenue_summary`,
        ep_sql`SELECT * FROM ep_vw_crm_overview`,
        ep_sql`SELECT COUNT(*)::int AS active_dishes FROM ep_vw_active_menu_catalog`
      ]);
      return ep_respond(200, {
        ep_views: ['ep_vw_order_revenue_summary', 'ep_vw_crm_overview', 'ep_vw_active_menu_catalog'],
        ep_revenue_summary: ep_rev[0] || {},
        ep_crm_overview: ep_crm[0] || {},
        ep_active_catalog_count: ep_activeMenu[0]?.active_dishes || 0
      });
    }

    return ep_respond(200, {
      service: 'Elysium Pizza Public & Admin REST API (ep_ Namespace Edition)',
      ep_schema_prefix: 'ep_',
      ep_database_connected: true,
      endpoints: [
        '/api/bootstrap',
        '/api/menu',
        '/api/combos',
        '/api/orders',
        '/api/blogs',
        '/api/testimonials',
        '/api/contacts',
        '/api/settings',
        '/api/newsletter',
        '/api/analytics',
        '/api/auth/login'
      ]
    });
  } catch (ep_err) {
    return ep_respond(500, { error: ep_err.message });
  }
};
