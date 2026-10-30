# Elysium Pizza — Full-Stack Artisanal Pizzeria Platform (Netlify + NeonDB)

**Elysium Pizza** is a responsive, light-themed full-stack pizzeria ordering platform, custom pizza studio, live order tracker, culinary blog, and administrative management suite designed for seamless deployment on **Netlify** with **NeonDB Serverless PostgreSQL**.

## ✨ Key Highlights

- **Sunlit Artisanal Light Theme**: Designed exclusively with warm ivory, crisp white, and terracotta-gold accents—free of dark shades—and responsive across mobile, tablet, and desktop screens.
- **Natural Customer Experience**: Zero technical jargon (no database, latency, API, or stack references) appears on the customer-facing interface.
- **Pizza Hut-Inspired + Elevated Ordering Features**:
  - Signature Box Meals & Combo Deals
  - Interactive 4-Step Custom Pizza Studio (Crust, Size, Sauce/Drizzle, Toppings, Live Nutrition & Price Calculator)
  - Full Categorized Menu with HD Food Photography, Dietary Filters (Veg, Non-Veg, Spicy, Bestsellers), Search, and Quick Size/Crust Selection
  - Interactive Cart Drawer with Auto-Applied Festive Discounts, Promo Codes, Delivery/Carryout Toggle, and Multi-Step Checkout
  - Real-Time 5-Stage Oven-to-Door Order Tracker
  - *The Elysium Journal* (Culinary Blog), Verified Guest Testimonials, Contact/Catering Concierge, and Newsletter Rewards Club
- **Root SVG Favicon (`/favicon.svg`)**: Custom vector crest displayed beside the browser title.
- **Protected Admin Portal & Festive Theme Engine**:
  - Authenticated via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables
  - Full CRUD for Menu Items, Orders, Blog Posts, Testimonials, Contacts, and Newsletter Subscribers
  - Festive Season Customizer with instant presets for **Diwali**, **Holi**, **Christmas**, **Eid**, and **Default Sunlit**, updating banners, discount percentages, promo codes, and light festive color accents
  - **Admin-Only Extensive Documentation & Developer API Hub** (visible exclusively after admin sign-in)
- **Public & Protected CORS-Enabled REST APIs**:
  - Hosted at `/api/*` via Netlify Functions (`netlify/functions/api.js`) with `Access-Control-Allow-Origin: *` so external developers and third-party apps can consume `GET`, `POST`, `PUT`, and `DELETE` endpoints.

## 🚀 Quick Deployment to Netlify

1. **Push or Upload** this folder to your Git repository or drag-and-drop into Netlify.
2. **Configure Environment Variables** in **Netlify Dashboard → Site Configuration → Environment Variables**:
   - `DATABASE_URL`: Your NeonDB PostgreSQL connection string (`postgresql://...`)
   - `ADMIN_USERNAME`: Your chosen administrator username (default fallback: `elysium_admin`)
   - `ADMIN_PASSWORD`: Your chosen administrator password (default fallback: `Elysium@2026`)
3. **Initialize Database (Optional)**: The serverless function automatically creates tables if they do not exist, or you can run `db/schema.sql` directly in the NeonDB SQL Editor.
