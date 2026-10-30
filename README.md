# Elysium Pizza — Full-Stack Artisanal Pizzeria Platform (Netlify + NeonDB `ep_` Namespace Edition)

**Elysium Pizza** is a responsive, light-themed full-stack pizzeria ordering platform, custom pizza studio, live order tracker, culinary blog, and administrative management suite designed for seamless deployment on **Netlify** with **NeonDB Serverless PostgreSQL**.

## 🛡️ Conflict-Free `ep_` Database Namespace

Every single PostgreSQL table, view, column, index, constraint, and JavaScript state/backend variable is uniquely prefixed with `ep_` so you can safely execute `db/schema.sql` inside an existing shared NeonDB database without any naming collisions:

- **Tables (`ep_*`)**:
  - `ep_site_settings` (`ep_setting_id`, `ep_active_festival`, `ep_banner_enabled`, `ep_banner_title`, `ep_banner_subtitle`, `ep_promo_code`, `ep_discount_percent`, `ep_delivery_fee`, `ep_free_delivery_threshold`, `ep_store_phone`, `ep_store_email`, `ep_updated_at`)
  - `ep_menu_items` (`ep_item_id`, `ep_item_name`, `ep_category`, `ep_price`, `ep_calories`, `ep_prep_time`, `ep_is_veg`, `ep_is_spicy`, `ep_is_bestseller`, `ep_rating`, `ep_reviews_count`, `ep_description`, `ep_ingredients`, `ep_image_key`, `ep_available`, `ep_created_at`)
  - `ep_orders` (`ep_order_id`, `ep_customer_name`, `ep_customer_phone`, `ep_customer_email`, `ep_delivery_type`, `ep_address`, `ep_items_json`, `ep_subtotal`, `ep_discount_amount`, `ep_tax_amount`, `ep_delivery_charge`, `ep_total_amount`, `ep_payment_method`, `ep_order_status`, `ep_special_notes`, `ep_created_at`)
  - `ep_blog_posts` (`ep_blog_id`, `ep_title`, `ep_category`, `ep_author`, `ep_author_role`, `ep_read_time`, `ep_published_date`, `ep_excerpt`, `ep_content`, `ep_image_key`, `ep_featured`, `ep_created_at`)
  - `ep_testimonials` (`ep_testimonial_id`, `ep_guest_name`, `ep_guest_location`, `ep_ordered_item`, `ep_rating`, `ep_comment`, `ep_verified`, `ep_created_at`)
  - `ep_contacts` (`ep_contact_id`, `ep_full_name`, `ep_email`, `ep_phone`, `ep_topic`, `ep_party_size`, `ep_message`, `ep_inquiry_status`, `ep_created_at`)
  - `ep_newsletter_subscribers` (`ep_subscriber_id`, `ep_subscriber_email`, `ep_subscribed_at`)
- **Views (`ep_vw_*`)**:
  - `ep_vw_active_menu_catalog`
  - `ep_vw_order_revenue_summary`
  - `ep_vw_crm_overview`
- **Indexes (`ep_idx_*`)**:
  - `ep_idx_menu_category`, `ep_idx_menu_available`, `ep_idx_orders_status`, `ep_idx_orders_created_at`, `ep_idx_contacts_status`

## 🚀 Quick Deployment to Netlify

1. **Push or Upload** this folder to your Git repository or drag-and-drop into Netlify.
2. **Configure Environment Variables** in **Netlify Dashboard → Site Configuration → Environment Variables**:
   - `DATABASE_URL` (or `EP_DATABASE_URL`): Your NeonDB PostgreSQL connection string (`postgresql://...`)
   - `ADMIN_USERNAME` (or `EP_ADMIN_USERNAME`): Your chosen administrator username (default fallback: `elysium_admin`)
   - `ADMIN_PASSWORD` (or `EP_ADMIN_PASSWORD`): Your chosen administrator password (default fallback: `Elysium@2026`)
3. **Execute `db/schema.sql`**: Run `db/schema.sql` in the NeonDB SQL Editor (or let `netlify/functions/api.js` auto-initialize the `ep_*` tables and views on first request).
