/**
 * Elysium Pizza — Netlify Serverless REST API + NeonDB Integration
 * Exposes public & admin-authenticated CORS-enabled endpoints:
 *   GET, POST, PUT, DELETE /api/menu
 *   GET, POST, PUT, DELETE /api/orders
 *   GET, POST, PUT, DELETE /api/blogs
 *   GET, POST, PUT, DELETE /api/testimonials
 *   GET, POST, PUT, DELETE /api/contacts
 *   GET, POST, DELETE      /api/newsletter
 *   GET, PUT               /api/settings
 *   POST                   /api/auth/login
 */

const { neon } = require('@neondatabase/serverless');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Username, X-Admin-Password',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json; charset=utf-8'
};

function respond(statusCode, payload) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload)
  };
}

function verifyAdmin(event, bodyObj = {}) {
  const expectedUser = process.env.ADMIN_USERNAME || 'elysium_admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'Elysium@2026';

  const headers = event.headers || {};
  const headerUser = headers['x-admin-username'] || headers['X-Admin-Username'];
  const headerPass = headers['x-admin-password'] || headers['X-Admin-Password'];

  let authUser = headerUser || bodyObj.username;
  let authPass = headerPass || bodyObj.password;

  const authHeader = headers['authorization'] || headers['Authorization'] || '';
  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
      const [u, p] = decoded.split(':');
      authUser = authUser || u;
      authPass = authPass || p;
    } catch (_) {}
  }

  return authUser === expectedUser && authPass === expectedPass;
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      active_festival VARCHAR(64) NOT NULL DEFAULT 'default',
      banner_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      banner_title VARCHAR(255) NOT NULL DEFAULT 'Sunlit Artisanal Feast — Hand-Stretched 72-Hour Dough',
      banner_subtitle VARCHAR(500) NOT NULL DEFAULT 'Enjoy complimentary garlic herb knots on orders above ₹799 or use code ELYSIUM15 for 15% off.',
      promo_code VARCHAR(64) NOT NULL DEFAULT 'ELYSIUM15',
      discount_percent INTEGER NOT NULL DEFAULT 15,
      delivery_fee INTEGER NOT NULL DEFAULT 49,
      free_delivery_threshold INTEGER NOT NULL DEFAULT 699,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
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
      image_key VARCHAR(255) NOT NULL,
      available BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
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
  `;
  await sql`
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
      image_key VARCHAR(255) NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id VARCHAR(64) PRIMARY KEY,
      guest_name VARCHAR(128) NOT NULL,
      guest_location VARCHAR(128) NOT NULL,
      ordered_item VARCHAR(160) NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
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
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(160) UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

exports.handler = async (event) => {
  // Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, { ok: true, cors: 'enabled' });
  }

  const rawPath = (event.path || '')
    .replace(/^\/\.netlify\/functions\/api\/?/, '')
    .replace(/^\/api\/?/, '');
  const segments = rawPath.split('/').filter(Boolean);
  const resource = segments[0] || 'status';
  const resourceId = segments[1] || null;
  const method = event.httpMethod;

  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (_) {
      return respond(400, { error: 'Invalid JSON request payload' });
    }
  }

  // 1. Admin Authentication Endpoint
  if (resource === 'auth' && resourceId === 'login' && method === 'POST') {
    if (verifyAdmin(event, body)) {
      return respond(200, {
        authenticated: true,
        role: 'administrator',
        message: 'Welcome to Elysium Pizza Management Suite'
      });
    }
    return respond(401, {
      authenticated: false,
      error: 'Invalid ADMIN_USERNAME or ADMIN_PASSWORD credentials'
    });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return respond(503, {
      error: 'DATABASE_URL environment variable is not configured on Netlify.',
      fallback: true
    });
  }

  try {
    const sql = neon(dbUrl);
    await ensureSchema(sql);

    // 2. MENU ITEMS CRUD (/api/menu)
    if (resource === 'menu') {
      if (method === 'GET') {
        const rows = resourceId
          ? await sql`SELECT * FROM menu_items WHERE id = ${resourceId}`
          : await sql`SELECT * FROM menu_items ORDER BY created_at DESC`;
        return respond(200, { data: rows, count: rows.length });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required for modifying menu items' });
      }
      if (method === 'POST') {
        const id = body.id || `item_${Date.now()}`;
        const rows = await sql`
          INSERT INTO menu_items (id, name, category, price, calories, prep_time, is_veg, is_spicy, is_bestseller, rating, reviews_count, description, ingredients, image_key, available)
          VALUES (${id}, ${body.name}, ${body.category}, ${Number(body.price)}, ${Number(body.calories || 720)}, ${body.prep_time || '18-22 mins'}, ${Boolean(body.is_veg)}, ${Boolean(body.is_spicy)}, ${Boolean(body.is_bestseller)}, ${Number(body.rating || 4.9)}, ${Number(body.reviews_count || 45)}, ${body.description || ''}, ${body.ingredients || ''}, ${body.image_key || 'hero_margherita.jpg'}, ${body.available !== false})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            calories = EXCLUDED.calories,
            prep_time = EXCLUDED.prep_time,
            is_veg = EXCLUDED.is_veg,
            is_spicy = EXCLUDED.is_spicy,
            is_bestseller = EXCLUDED.is_bestseller,
            description = EXCLUDED.description,
            ingredients = EXCLUDED.ingredients,
            image_key = EXCLUDED.image_key,
            available = EXCLUDED.available
          RETURNING *;
        `;
        return respond(201, { data: rows[0] });
      }
      if (method === 'PUT' && resourceId) {
        const rows = await sql`
          UPDATE menu_items
          SET name = ${body.name},
              category = ${body.category},
              price = ${Number(body.price)},
              calories = ${Number(body.calories || 720)},
              prep_time = ${body.prep_time || '18-22 mins'},
              is_veg = ${Boolean(body.is_veg)},
              is_spicy = ${Boolean(body.is_spicy)},
              is_bestseller = ${Boolean(body.is_bestseller)},
              description = ${body.description || ''},
              ingredients = ${body.ingredients || ''},
              image_key = ${body.image_key || 'hero_margherita.jpg'},
              available = ${body.available !== false}
          WHERE id = ${resourceId}
          RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
      if (method === 'DELETE' && resourceId) {
        await sql`DELETE FROM menu_items WHERE id = ${resourceId}`;
        return respond(200, { deleted: resourceId });
      }
    }

    // 3. ORDERS CRUD (/api/orders)
    if (resource === 'orders') {
      if (method === 'GET') {
        const rows = resourceId
          ? await sql`SELECT * FROM orders WHERE id = ${resourceId}`
          : await sql`SELECT * FROM orders ORDER BY created_at DESC`;
        return respond(200, { data: rows, count: rows.length });
      }
      if (method === 'POST') {
        const id = body.id || `ELY-${Math.floor(100000 + Math.random() * 900000)}`;
        const rows = await sql`
          INSERT INTO orders (id, customer_name, customer_phone, customer_email, delivery_type, address, items_json, subtotal, discount_amount, tax_amount, delivery_charge, total_amount, payment_method, status, special_notes)
          VALUES (${id}, ${body.customer_name}, ${body.customer_phone}, ${body.customer_email || ''}, ${body.delivery_type || 'Delivery'}, ${body.address || ''}, ${JSON.stringify(body.items || [])}::jsonb, ${Number(body.subtotal || 0)}, ${Number(body.discount_amount || 0)}, ${Number(body.tax_amount || 0)}, ${Number(body.delivery_charge || 0)}, ${Number(body.total_amount || 0)}, ${body.payment_method || 'UPI / Instant Pay'}, ${body.status || 'Hand-Stretching Dough'}, ${body.special_notes || ''})
          RETURNING *;
        `;
        return respond(201, { data: rows[0] });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required to update or delete orders' });
      }
      if (method === 'PUT' && resourceId) {
        const rows = await sql`
          UPDATE orders SET status = ${body.status} WHERE id = ${resourceId} RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
      if (method === 'DELETE' && resourceId) {
        await sql`DELETE FROM orders WHERE id = ${resourceId}`;
        return respond(200, { deleted: resourceId });
      }
    }

    // 4. BLOG POSTS CRUD (/api/blogs)
    if (resource === 'blogs') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`;
        return respond(200, { data: rows, count: rows.length });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required for blog management' });
      }
      if (method === 'POST' || method === 'PUT') {
        const id = resourceId || body.id || `blog_${Date.now()}`;
        const rows = await sql`
          INSERT INTO blog_posts (id, title, category, author, author_role, read_time, published_date, excerpt, content, image_key, featured)
          VALUES (${id}, ${body.title}, ${body.category || 'Culinary Craft'}, ${body.author || 'Chef Marco Bellini'}, ${body.author_role || 'Head Pizzaiolo'}, ${body.read_time || '5 min read'}, ${body.published_date || 'Oct 30, 2026'}, ${body.excerpt || ''}, ${body.content || ''}, ${body.image_key || 'hero_margherita.jpg'}, ${Boolean(body.featured)})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            author = EXCLUDED.author,
            author_role = EXCLUDED.author_role,
            read_time = EXCLUDED.read_time,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            image_key = EXCLUDED.image_key,
            featured = EXCLUDED.featured
          RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
      if (method === 'DELETE' && resourceId) {
        await sql`DELETE FROM blog_posts WHERE id = ${resourceId}`;
        return respond(200, { deleted: resourceId });
      }
    }

    // 5. TESTIMONIALS CRUD (/api/testimonials)
    if (resource === 'testimonials') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
        return respond(200, { data: rows, count: rows.length });
      }
      if (method === 'POST') {
        const id = body.id || `rev_${Date.now()}`;
        const rows = await sql`
          INSERT INTO testimonials (id, guest_name, guest_location, ordered_item, rating, comment, verified)
          VALUES (${id}, ${body.guest_name}, ${body.guest_location || 'Kolkata'}, ${body.ordered_item || 'Truffle & Burrata Gold'}, ${Number(body.rating || 5)}, ${body.comment}, TRUE)
          RETURNING *;
        `;
        return respond(201, { data: rows[0] });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required to edit or delete testimonials' });
      }
      if (method === 'PUT' && resourceId) {
        const rows = await sql`
          UPDATE testimonials
          SET guest_name = ${body.guest_name},
              guest_location = ${body.guest_location},
              ordered_item = ${body.ordered_item},
              rating = ${Number(body.rating || 5)},
              comment = ${body.comment}
          WHERE id = ${resourceId}
          RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
      if (method === 'DELETE' && resourceId) {
        await sql`DELETE FROM testimonials WHERE id = ${resourceId}`;
        return respond(200, { deleted: resourceId });
      }
    }

    // 6. CONTACTS & INQUIRIES CRUD (/api/contacts)
    if (resource === 'contacts') {
      if (method === 'POST') {
        const id = body.id || `inq_${Date.now()}`;
        const rows = await sql`
          INSERT INTO contacts (id, full_name, email, phone, topic, party_size, message, status)
          VALUES (${id}, ${body.full_name}, ${body.email}, ${body.phone || ''}, ${body.topic || 'General Feedback'}, ${body.party_size || 'N/A'}, ${body.message}, 'New Inquiry')
          RETURNING *;
        `;
        return respond(201, { data: rows[0] });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required to view or manage customer contacts' });
      }
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
        return respond(200, { data: rows, count: rows.length });
      }
      if (method === 'PUT' && resourceId) {
        const rows = await sql`
          UPDATE contacts SET status = ${body.status || 'Resolved'} WHERE id = ${resourceId} RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
      if (method === 'DELETE' && resourceId) {
        await sql`DELETE FROM contacts WHERE id = ${resourceId}`;
        return respond(200, { deleted: resourceId });
      }
    }

    // 7. FESTIVE BANNERS, DISCOUNTS & THEME SETTINGS (/api/settings)
    if (resource === 'settings') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM site_settings ORDER BY id ASC LIMIT 1`;
        return respond(200, { data: rows[0] || null });
      }
      if (!verifyAdmin(event, body)) {
        return respond(401, { error: 'Admin authentication required to update festive theme & site settings' });
      }
      if (method === 'PUT' || method === 'POST') {
        const rows = await sql`
          INSERT INTO site_settings (id, active_festival, banner_enabled, banner_title, banner_subtitle, promo_code, discount_percent, delivery_fee, free_delivery_threshold, updated_at)
          VALUES (1, ${body.active_festival || 'default'}, ${body.banner_enabled !== false}, ${body.banner_title}, ${body.banner_subtitle}, ${body.promo_code}, ${Number(body.discount_percent || 15)}, ${Number(body.delivery_fee || 49)}, ${Number(body.free_delivery_threshold || 699)}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            active_festival = EXCLUDED.active_festival,
            banner_enabled = EXCLUDED.banner_enabled,
            banner_title = EXCLUDED.banner_title,
            banner_subtitle = EXCLUDED.banner_subtitle,
            promo_code = EXCLUDED.promo_code,
            discount_percent = EXCLUDED.discount_percent,
            delivery_fee = EXCLUDED.delivery_fee,
            free_delivery_threshold = EXCLUDED.free_delivery_threshold,
            updated_at = NOW()
          RETURNING *;
        `;
        return respond(200, { data: rows[0] });
      }
    }

    // 8. NEWSLETTER SUBSCRIBERS (/api/newsletter)
    if (resource === 'newsletter') {
      if (method === 'POST') {
        const rows = await sql`
          INSERT INTO newsletter_subscribers (email) VALUES (${body.email})
          ON CONFLICT (email) DO NOTHING RETURNING *;
        `;
        return respond(201, { subscribed: true, data: rows[0] || { email: body.email } });
      }
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`;
        return respond(200, { data: rows });
      }
    }

    return respond(200, {
      service: 'Elysium Pizza Public & Admin REST API',
      status: 'operational',
      endpoints: ['/api/menu', '/api/orders', '/api/blogs', '/api/testimonials', '/api/contacts', '/api/settings', '/api/newsletter']
    });
  } catch (err) {
    return respond(500, { error: err.message });
  }
};
