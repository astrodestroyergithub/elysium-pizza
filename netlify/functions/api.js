/**
 * Elysium Pizza — Netlify Serverless REST API + NeonDB Integration (ep_ Prefix Edition)
 * All database tables, views, columns, indexes, and internal JS variables are prefixed
 * with `ep_` to prevent any naming collision in shared PostgreSQL databases.
 *
 * Exposes public & admin-authenticated CORS-enabled endpoints:
 *   GET, POST, PUT, DELETE /api/menu
 *   GET, POST, PUT, DELETE /api/orders
 *   GET, POST, PUT, DELETE /api/blogs
 *   GET, POST, PUT, DELETE /api/testimonials
 *   GET, POST, PUT, DELETE /api/contacts
 *   GET, POST, DELETE      /api/newsletter
 *   GET, PUT               /api/settings
 *   GET                    /api/analytics  (queries ep_vw_order_revenue_summary & ep_vw_crm_overview)
 *   POST                   /api/auth/login
 */

const { neon } = require('@neondatabase/serverless');

const ep_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Username, X-Admin-Password, X-Ep-Admin-Username, X-Ep-Admin-Password',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json; charset=utf-8'
};

function ep_respond(ep_statusCode, ep_payload) {
  return {
    statusCode: ep_statusCode,
    headers: ep_CORS_HEADERS,
    body: JSON.stringify(ep_payload)
  };
}

function ep_verifyAdmin(ep_event, ep_bodyObj = {}) {
  const ep_expectedUser = process.env.EP_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'elysium_admin';
  const ep_expectedPass = process.env.EP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Elysium@2026';

  const ep_headers = ep_event.headers || {};
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

  let ep_authUser = ep_headerUser || ep_bodyObj.ep_username || ep_bodyObj.username;
  let ep_authPass = ep_headerPass || ep_bodyObj.ep_password || ep_bodyObj.password;

  const ep_authHeader = ep_headers['authorization'] || ep_headers['Authorization'] || '';
  if (ep_authHeader.startsWith('Basic ')) {
    try {
      const ep_decoded = Buffer.from(ep_authHeader.slice(6), 'base64').toString('utf8');
      const [ep_u, ep_p] = ep_decoded.split(':');
      ep_authUser = ep_authUser || ep_u;
      ep_authPass = ep_authPass || ep_p;
    } catch (_) {}
  }

  return ep_authUser === ep_expectedUser && ep_authPass === ep_expectedPass;
}

// Normalizers so both `ep_`-prefixed DB columns and clean frontend/API properties are returned
function ep_normalizeMenuRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_item_id,
    name: r.ep_item_name,
    category: r.ep_category,
    price: r.ep_price,
    calories: r.ep_calories,
    prep_time: r.ep_prep_time,
    is_veg: r.ep_is_veg,
    is_spicy: r.ep_is_spicy,
    is_bestseller: r.ep_is_bestseller,
    rating: r.ep_rating,
    reviews_count: r.ep_reviews_count,
    description: r.ep_description,
    ingredients: r.ep_ingredients,
    image_key: r.ep_image_key,
    available: r.ep_available,
    created_at: r.ep_created_at
  };
}

function ep_normalizeOrderRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.ep_order_id,
    customer_name: r.ep_customer_name,
    customer_phone: r.ep_customer_phone,
    customer_email: r.ep_customer_email,
    delivery_type: r.ep_delivery_type,
    address: r.ep_address,
    items: r.ep_items_json,
    subtotal: r.ep_subtotal,
    discount_amount: r.ep_discount_amount,
    tax_amount: r.ep_tax_amount,
    delivery_charge: r.ep_delivery_charge,
    total_amount: r.ep_total_amount,
    payment_method: r.ep_payment_method,
    status: r.ep_order_status,
    special_notes: r.ep_special_notes,
    created_at: r.ep_created_at
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
    featured: r.ep_featured,
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
    rating: r.ep_rating,
    comment: r.ep_comment,
    verified: r.ep_verified,
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
  };
}

function ep_normalizeSettingsRow(r) {
  if (!r) return null;
  return {
    ...r,
    active_festival: r.ep_active_festival,
    banner_enabled: r.ep_banner_enabled,
    banner_title: r.ep_banner_title,
    banner_subtitle: r.ep_banner_subtitle,
    promo_code: r.ep_promo_code,
    discount_percent: r.ep_discount_percent,
    delivery_fee: r.ep_delivery_fee,
    free_delivery_threshold: r.ep_free_delivery_threshold,
    updated_at: r.ep_updated_at
  };
}

async function ep_ensureSchema(ep_sql) {
  await ep_sql`
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
      ep_rating NUMERIC(3,2) NOT NULL DEFAULT 4.85,
      ep_reviews_count INTEGER NOT NULL DEFAULT 120,
      ep_description TEXT NOT NULL,
      ep_ingredients TEXT NOT NULL,
      ep_image_key VARCHAR(255) NOT NULL,
      ep_available BOOLEAN NOT NULL DEFAULT TRUE,
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
      ep_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
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
}

exports.handler = async (ep_event) => {
  if (ep_event.httpMethod === 'OPTIONS') {
    return ep_respond(200, { ok: true, cors: 'enabled', schema_prefix: 'ep_' });
  }

  const ep_rawPath = (ep_event.path || '')
    .replace(/^\/\.netlify\/functions\/api\/?/, '')
    .replace(/^\/api\/?/, '');
  const ep_segments = ep_rawPath.split('/').filter(Boolean);
  const ep_resource = ep_segments[0] || 'status';
  const ep_resourceId = ep_segments[1] || null;
  const ep_method = ep_event.httpMethod;

  let ep_body = {};
  if (ep_event.body) {
    try {
      ep_body = JSON.parse(ep_event.body);
    } catch (_) {
      return ep_respond(400, { error: 'Invalid JSON request payload' });
    }
  }

  // 1. Admin Authentication Endpoint
  if (ep_resource === 'auth' && ep_resourceId === 'login' && ep_method === 'POST') {
    if (ep_verifyAdmin(ep_event, ep_body)) {
      return ep_respond(200, {
        authenticated: true,
        ep_role: 'administrator',
        message: 'Welcome to Elysium Pizza Management Suite'
      });
    }
    return ep_respond(401, {
      authenticated: false,
      error: 'Invalid ADMIN_USERNAME or ADMIN_PASSWORD credentials'
    });
  }

  const ep_dbUrl = process.env.EP_DATABASE_URL || process.env.DATABASE_URL;
  if (!ep_dbUrl) {
    return ep_respond(503, {
      error: 'DATABASE_URL (or EP_DATABASE_URL) environment variable is not configured on Netlify.',
      fallback: true
    });
  }

  try {
    const ep_sql = neon(ep_dbUrl);
    await ep_ensureSchema(ep_sql);

    // 2. MENU ITEMS CRUD (/api/menu -> table: ep_menu_items, view: ep_vw_active_menu_catalog)
    if (ep_resource === 'menu') {
      if (ep_method === 'GET') {
        const ep_rows = ep_resourceId
          ? await ep_sql`SELECT * FROM ep_menu_items WHERE ep_item_id = ${ep_resourceId}`
          : await ep_sql`SELECT * FROM ep_menu_items ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeMenuRow);
        return ep_respond(200, { ep_table: 'ep_menu_items', data: ep_data, count: ep_data.length });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required for modifying ep_menu_items' });
      }
      if (ep_method === 'POST') {
        const ep_id = ep_body.ep_item_id || ep_body.id || `ep_item_${Date.now()}`;
        const ep_name = ep_body.ep_item_name || ep_body.name;
        const ep_cat = ep_body.ep_category || ep_body.category || 'Signature Pizzas';
        const ep_price = Number(ep_body.ep_price ?? ep_body.price ?? 499);
        const ep_cal = Number(ep_body.ep_calories ?? ep_body.calories ?? 720);
        const ep_prep = ep_body.ep_prep_time || ep_body.prep_time || '18-22 mins';
        const ep_veg = Boolean(ep_body.ep_is_veg ?? ep_body.is_veg ?? true);
        const ep_spicy = Boolean(ep_body.ep_is_spicy ?? ep_body.is_spicy ?? false);
        const ep_best = Boolean(ep_body.ep_is_bestseller ?? ep_body.is_bestseller ?? false);
        const ep_rate = Number(ep_body.ep_rating ?? ep_body.rating ?? 4.9);
        const ep_revs = Number(ep_body.ep_reviews_count ?? ep_body.reviews_count ?? 45);
        const ep_desc = ep_body.ep_description ?? ep_body.description ?? '';
        const ep_ing = ep_body.ep_ingredients ?? ep_body.ingredients ?? '';
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
        return ep_respond(201, { ep_table: 'ep_menu_items', data: ep_normalizeMenuRow(ep_rows[0]) });
      }
      if (ep_method === 'PUT' && ep_resourceId) {
        const ep_rows = await ep_sql`
          UPDATE ep_menu_items
          SET ep_item_name = ${ep_body.ep_item_name || ep_body.name},
              ep_category = ${ep_body.ep_category || ep_body.category},
              ep_price = ${Number(ep_body.ep_price ?? ep_body.price)},
              ep_calories = ${Number(ep_body.ep_calories ?? ep_body.calories ?? 720)},
              ep_prep_time = ${ep_body.ep_prep_time || ep_body.prep_time || '18-22 mins'},
              ep_is_veg = ${Boolean(ep_body.ep_is_veg ?? ep_body.is_veg)},
              ep_is_spicy = ${Boolean(ep_body.ep_is_spicy ?? ep_body.is_spicy)},
              ep_is_bestseller = ${Boolean(ep_body.ep_is_bestseller ?? ep_body.is_bestseller)},
              ep_description = ${ep_body.ep_description ?? ep_body.description ?? ''},
              ep_ingredients = ${ep_body.ep_ingredients ?? ep_body.ingredients ?? ''},
              ep_image_key = ${ep_body.ep_image_key || ep_body.image_key || 'hero_margherita'},
              ep_available = ${(ep_body.ep_available ?? ep_body.available) !== false}
          WHERE ep_item_id = ${ep_resourceId}
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_menu_items', data: ep_normalizeMenuRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE' && ep_resourceId) {
        await ep_sql`DELETE FROM ep_menu_items WHERE ep_item_id = ${ep_resourceId}`;
        return ep_respond(200, { ep_table: 'ep_menu_items', deleted: ep_resourceId });
      }
    }

    // 3. ORDERS CRUD (/api/orders -> table: ep_orders)
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
        const ep_rows = await ep_sql`
          INSERT INTO ep_orders (
            ep_order_id, ep_customer_name, ep_customer_phone, ep_customer_email,
            ep_delivery_type, ep_address, ep_items_json, ep_subtotal,
            ep_discount_amount, ep_tax_amount, ep_delivery_charge, ep_total_amount,
            ep_payment_method, ep_order_status, ep_special_notes
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_customer_name || ep_body.customer_name},
            ${ep_body.ep_customer_phone || ep_body.customer_phone},
            ${ep_body.ep_customer_email || ep_body.customer_email || ''},
            ${ep_body.ep_delivery_type || ep_body.delivery_type || 'Delivery'},
            ${ep_body.ep_address || ep_body.address || ''},
            ${JSON.stringify(ep_body.ep_items_json || ep_body.items || [])}::jsonb,
            ${Number(ep_body.ep_subtotal ?? ep_body.subtotal ?? 0)},
            ${Number(ep_body.ep_discount_amount ?? ep_body.discount_amount ?? 0)},
            ${Number(ep_body.ep_tax_amount ?? ep_body.tax_amount ?? 0)},
            ${Number(ep_body.ep_delivery_charge ?? ep_body.delivery_charge ?? 0)},
            ${Number(ep_body.ep_total_amount ?? ep_body.total_amount ?? 0)},
            ${ep_body.ep_payment_method || ep_body.payment_method || 'UPI / Instant Pay'},
            ${ep_body.ep_order_status || ep_body.status || 'Hand-Stretching 72h Dough'},
            ${ep_body.ep_special_notes || ep_body.special_notes || ''}
          )
          RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_orders', data: ep_normalizeOrderRow(ep_rows[0]) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to update or delete ep_orders' });
      }
      if (ep_method === 'PUT' && ep_resourceId) {
        const ep_statusVal = ep_body.ep_order_status || ep_body.status;
        const ep_rows = await ep_sql`
          UPDATE ep_orders SET ep_order_status = ${ep_statusVal} WHERE ep_order_id = ${ep_resourceId} RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_orders', data: ep_normalizeOrderRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE' && ep_resourceId) {
        await ep_sql`DELETE FROM ep_orders WHERE ep_order_id = ${ep_resourceId}`;
        return ep_respond(200, { ep_table: 'ep_orders', deleted: ep_resourceId });
      }
    }

    // 4. BLOG POSTS CRUD (/api/blogs -> table: ep_blog_posts)
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
            ${ep_body.ep_author_role || ep_body.author_role || 'Head Pizzaiolo'},
            ${ep_body.ep_read_time || ep_body.read_time || '5 min read'},
            ${ep_body.ep_published_date || ep_body.published_date || 'Oct 30, 2026'},
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
            ep_excerpt = EXCLUDED.ep_excerpt,
            ep_content = EXCLUDED.ep_content,
            ep_image_key = EXCLUDED.ep_image_key,
            ep_featured = EXCLUDED.ep_featured
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_blog_posts', data: ep_normalizeBlogRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE' && ep_resourceId) {
        await ep_sql`DELETE FROM ep_blog_posts WHERE ep_blog_id = ${ep_resourceId}`;
        return ep_respond(200, { ep_table: 'ep_blog_posts', deleted: ep_resourceId });
      }
    }

    // 5. TESTIMONIALS CRUD (/api/testimonials -> table: ep_testimonials)
    if (ep_resource === 'testimonials') {
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_testimonials ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeTestimonialRow);
        return ep_respond(200, { ep_table: 'ep_testimonials', data: ep_data, count: ep_data.length });
      }
      if (ep_method === 'POST') {
        const ep_id = ep_body.ep_testimonial_id || ep_body.id || `ep_rev_${Date.now()}`;
        const ep_rows = await ep_sql`
          INSERT INTO ep_testimonials (
            ep_testimonial_id, ep_guest_name, ep_guest_location, ep_ordered_item, ep_rating, ep_comment, ep_verified
          )
          VALUES (
            ${ep_id},
            ${ep_body.ep_guest_name || ep_body.guest_name},
            ${ep_body.ep_guest_location || ep_body.guest_location || 'Kolkata'},
            ${ep_body.ep_ordered_item || ep_body.ordered_item || 'Truffle & Burrata Gold'},
            ${Number(ep_body.ep_rating ?? ep_body.rating ?? 5)},
            ${ep_body.ep_comment || ep_body.comment},
            TRUE
          )
          RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_testimonials', data: ep_normalizeTestimonialRow(ep_rows[0]) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to edit or delete ep_testimonials' });
      }
      if (ep_method === 'PUT' && ep_resourceId) {
        const ep_rows = await ep_sql`
          UPDATE ep_testimonials
          SET ep_guest_name = ${ep_body.ep_guest_name || ep_body.guest_name},
              ep_guest_location = ${ep_body.ep_guest_location || ep_body.guest_location},
              ep_ordered_item = ${ep_body.ep_ordered_item || ep_body.ordered_item},
              ep_rating = ${Number(ep_body.ep_rating ?? ep_body.rating ?? 5)},
              ep_comment = ${ep_body.ep_comment || ep_body.comment}
          WHERE ep_testimonial_id = ${ep_resourceId}
          RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_testimonials', data: ep_normalizeTestimonialRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE' && ep_resourceId) {
        await ep_sql`DELETE FROM ep_testimonials WHERE ep_testimonial_id = ${ep_resourceId}`;
        return ep_respond(200, { ep_table: 'ep_testimonials', deleted: ep_resourceId });
      }
    }

    // 6. CONTACTS & INQUIRIES CRUD (/api/contacts -> table: ep_contacts)
    if (ep_resource === 'contacts') {
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
            ${ep_body.ep_party_size || ep_body.party_size || 'N/A'},
            ${ep_body.ep_message || ep_body.message},
            'New Inquiry'
          )
          RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_contacts', data: ep_normalizeContactRow(ep_rows[0]) });
      }
      if (!ep_verifyAdmin(ep_event, ep_body)) {
        return ep_respond(401, { error: 'Admin authentication required to view or manage ep_contacts' });
      }
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_contacts ORDER BY ep_created_at DESC`;
        const ep_data = ep_rows.map(ep_normalizeContactRow);
        return ep_respond(200, { ep_table: 'ep_contacts', data: ep_data, count: ep_data.length });
      }
      if (ep_method === 'PUT' && ep_resourceId) {
        const ep_statusVal = ep_body.ep_inquiry_status || ep_body.status || 'Resolved';
        const ep_rows = await ep_sql`
          UPDATE ep_contacts SET ep_inquiry_status = ${ep_statusVal} WHERE ep_contact_id = ${ep_resourceId} RETURNING *;
        `;
        return ep_respond(200, { ep_table: 'ep_contacts', data: ep_normalizeContactRow(ep_rows[0]) });
      }
      if (ep_method === 'DELETE' && ep_resourceId) {
        await ep_sql`DELETE FROM ep_contacts WHERE ep_contact_id = ${ep_resourceId}`;
        return ep_respond(200, { ep_table: 'ep_contacts', deleted: ep_resourceId });
      }
    }

    // 7. FESTIVE BANNERS, DISCOUNTS & THEME SETTINGS (/api/settings -> table: ep_site_settings)
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
            ${ep_body.ep_banner_title || ep_body.banner_title},
            ${ep_body.ep_banner_subtitle || ep_body.banner_subtitle},
            ${ep_body.ep_promo_code || ep_body.promo_code},
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

    // 8. NEWSLETTER SUBSCRIBERS (/api/newsletter -> table: ep_newsletter_subscribers)
    if (ep_resource === 'newsletter') {
      if (ep_method === 'POST') {
        const ep_email = ep_body.ep_subscriber_email || ep_body.email;
        const ep_rows = await ep_sql`
          INSERT INTO ep_newsletter_subscribers (ep_subscriber_email) VALUES (${ep_email})
          ON CONFLICT (ep_subscriber_email) DO NOTHING RETURNING *;
        `;
        return ep_respond(201, { ep_table: 'ep_newsletter_subscribers', subscribed: true, data: ep_rows[0] || { ep_subscriber_email: ep_email } });
      }
      if (ep_method === 'GET') {
        const ep_rows = await ep_sql`SELECT * FROM ep_newsletter_subscribers ORDER BY ep_subscribed_at DESC`;
        return ep_respond(200, { ep_table: 'ep_newsletter_subscribers', data: ep_rows });
      }
    }

    // 9. ANALYTICS VIEWS ENDPOINT (/api/analytics -> queries ep_vw_order_revenue_summary & ep_vw_crm_overview)
    if (ep_resource === 'analytics' && ep_method === 'GET') {
      const ep_rev = await ep_sql`SELECT * FROM ep_vw_order_revenue_summary`;
      const ep_crm = await ep_sql`SELECT * FROM ep_vw_crm_overview`;
      return ep_respond(200, {
        ep_views: ['ep_vw_order_revenue_summary', 'ep_vw_crm_overview', 'ep_vw_active_menu_catalog'],
        ep_revenue_summary: ep_rev[0] || {},
        ep_crm_overview: ep_crm[0] || {}
      });
    }

    return ep_respond(200, {
      service: 'Elysium Pizza Public & Admin REST API (ep_ Namespace Edition)',
      ep_schema_prefix: 'ep_',
      ep_tables: [
        'ep_site_settings',
        'ep_menu_items',
        'ep_orders',
        'ep_blog_posts',
        'ep_testimonials',
        'ep_contacts',
        'ep_newsletter_subscribers'
      ],
      ep_views: [
        'ep_vw_active_menu_catalog',
        'ep_vw_order_revenue_summary',
        'ep_vw_crm_overview'
      ],
      endpoints: [
        '/api/menu',
        '/api/orders',
        '/api/blogs',
        '/api/testimonials',
        '/api/contacts',
        '/api/settings',
        '/api/newsletter',
        '/api/analytics'
      ]
    });
  } catch (ep_err) {
    return ep_respond(500, { error: ep_err.message });
  }
};
