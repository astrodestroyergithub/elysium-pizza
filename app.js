/* ==========================================================================
   Elysium Pizza — Complete Interactive Application & Admin Suite
   Customer UI: 100% Natural Pizzeria Experience (Zero Tech Jargon)
   Admin Portal: Protected Management + Festive Engine + Admin-Only API Docs
   ========================================================================== */

const IMAGE_MAP = {
  hero_margherita: "assets/hero_margherita.jpg",
  truffle_burrata: "assets/truffle_burrata.jpg",
  spicy_pepperoni_honey: "assets/spicy_pepperoni_honey.jpg",
  mediterranean_veggie: "assets/mediterranean_veggie.jpg",
  bbq_chicken_supreme: "assets/bbq_chicken_supreme.jpg",
  garlic_knots_lava_cake: "assets/garlic_knots_lava_cake.jpg"
};

const FESTIVAL_PRESETS = {
  default: {
    active_festival: "default",
    label: "Sunlit Artisanal (Default)",
    season_tag: "ARTISANAL WOOD-FIRED KITCHEN",
    banner_enabled: true,
    banner_title: "Warm out of the brick oven: Flat 15% savings on all handcrafted orders today!",
    banner_subtitle: "Apply code ELYSIUM15 at checkout or enjoy complimentary Garlic Herb Knots on orders over ₹799.",
    promo_code: "ELYSIUM15",
    discount_percent: 15,
    delivery_fee: 49,
    free_delivery_threshold: 699
  },
  diwali: {
    active_festival: "diwali",
    label: "Diwali — Festival of Lights",
    season_tag: "SHUBH DIWALI CELEBRATION FEAST",
    banner_enabled: true,
    banner_title: "Illuminate Your Celebrations — Diwali Royal Family Feast at 25% Off!",
    banner_subtitle: "Celebrate the Festival of Lights with wood-fired gourmet pizzas & molten desserts. Use code DIWALI25.",
    promo_code: "DIWALI25",
    discount_percent: 25,
    delivery_fee: 0,
    free_delivery_threshold: 499
  },
  holi: {
    active_festival: "holi",
    label: "Holi — Festival of Colors",
    season_tag: "VIBRANT HOLI GATHERING SPECIAL",
    banner_enabled: true,
    banner_title: "Splash of Flavors! 20% Off All Party Boxes & Colourful Garden Pies for Holi!",
    banner_subtitle: "Gather your friends and family with our vibrant Mediterranean & Burrata specials. Code: HOLI20.",
    promo_code: "HOLI20",
    discount_percent: 20,
    delivery_fee: 29,
    free_delivery_threshold: 599
  },
  christmas: {
    active_festival: "christmas",
    label: "Christmas — Winter Jubilee",
    season_tag: "CHRISTMAS WINTER JUBILEE FEAST",
    banner_enabled: true,
    banner_title: "Season of Joy & Warmth — 30% Off Holiday Stuffed-Crust Feasts & Lava Cakes!",
    banner_subtitle: "Share the warmth of our brick oven this Christmas season with code XMAS30 on every order.",
    promo_code: "XMAS30",
    discount_percent: 30,
    delivery_fee: 0,
    free_delivery_threshold: 499
  },
  eid: {
    active_festival: "eid",
    label: "Eid — Royal Dastarkhwan Feast",
    season_tag: "EID MUBARAK ROYAL SHARING MENU",
    banner_enabled: true,
    banner_title: "Eid Mubarak! 25% Off Grand Sharing Boxes & Chargrilled Specials!",
    banner_subtitle: "Celebrate togetherness with our signature smoked chicken, burrata & garlic knot sharing platters. Code: EIDFEAST.",
    promo_code: "EIDFEAST",
    discount_percent: 25,
    delivery_fee: 0,
    free_delivery_threshold: 549
  }
};

const INITIAL_MENU = [
  {
    id: "pizza-margherita-regina",
    name: "San Marzano Margherita Regina",
    category: "Signature Pizzas",
    price: 449,
    calories: 690,
    prep_time: "15-18 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: true,
    rating: 4.95,
    reviews_count: 418,
    description: "72-hour cold-fermented sourdough crust topped with crushed San Marzano DOP tomatoes, creamy Fior di Latte mozzarella, sweet garden basil, and extra-virgin olive oil.",
    ingredients: "San Marzano Tomatoes, Fior di Latte, Fresh Basil, Cold-Pressed Olive Oil, Sea Salt",
    image_key: "hero_margherita",
    available: true
  },
  {
    id: "pizza-truffle-burrata",
    name: "Truffle & Creamy Burrata Gold",
    category: "Gourmet Specials",
    price: 649,
    calories: 820,
    prep_time: "18-22 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: true,
    rating: 4.98,
    reviews_count: 356,
    description: "Velvety roasted garlic bianco base crowned with whole torn Pugliese burrata, sautéed wild chanterelle & shiitake mushrooms, shaved black summer truffle, and lemon thyme.",
    ingredients: "Fresh Burrata, Black Truffle Shavings, Wild Mushrooms, Roasted Garlic Cream, Thyme",
    image_key: "truffle_burrata",
    available: true
  },
  {
    id: "pizza-diavola-honey",
    name: "Crispy Cup Pepperoni & Hot Honey",
    category: "Signature Pizzas",
    price: 589,
    calories: 880,
    prep_time: "16-20 mins",
    is_veg: false,
    is_spicy: true,
    is_bestseller: true,
    rating: 4.94,
    reviews_count: 512,
    description: "Artisanal charred cups of smoked pepperoni, aged provolone & mozzarella, crushed Calabrian chili flakes, finished with a ribbon of wildflower hot honey.",
    ingredients: "Smoked Cup Pepperoni, Aged Mozzarella, Calabrian Chili, Wildflower Hot Honey, Basil",
    image_key: "spicy_pepperoni_honey",
    available: true
  },
  {
    id: "pizza-mediterranean-pan",
    name: "Mediterranean Sunlit Garden Pan",
    category: "Signature Pizzas",
    price: 519,
    calories: 740,
    prep_time: "18-22 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: false,
    rating: 4.89,
    reviews_count: 274,
    description: "Baked in our seasoned cast-iron pan for a golden crispy base with roasted red & yellow bell peppers, Kalamata olives, sun-dried tomatoes, baby spinach, and Greek feta.",
    ingredients: "Roasted Bell Peppers, Kalamata Olives, Sun-Dried Tomatoes, Greek Feta, Baby Spinach",
    image_key: "mediterranean_veggie",
    available: true
  },
  {
    id: "pizza-smoked-bbq-chicken",
    name: "Smoked Hickory BBQ Chicken Stuffed Crust",
    category: "Gourmet Specials",
    price: 629,
    calories: 920,
    prep_time: "20-24 mins",
    is_veg: false,
    is_spicy: false,
    is_bestseller: true,
    rating: 4.92,
    reviews_count: 389,
    description: "Golden three-cheese stuffed crust loaded with chargrilled hickory BBQ chicken breast, caramelized red onions, sweet golden corn, smoked gouda, and fresh cilantro.",
    ingredients: "Chargrilled BBQ Chicken, Stuffed Cheese Crust, Smoked Gouda, Red Onions, Sweet Corn",
    image_key: "bbq_chicken_supreme",
    available: true
  },
  {
    id: "pizza-paneer-tikka-royale",
    name: "Tandoori Malai Paneer & Pickled Onion",
    category: "Gourmet Specials",
    price: 549,
    calories: 790,
    prep_time: "17-21 mins",
    is_veg: true,
    is_spicy: true,
    is_bestseller: true,
    rating: 4.91,
    reviews_count: 310,
    description: "Clay-oven spiced malai paneer cubes, chargrilled capsicum, crunchy pickled red onions, mint-coriander drizzle, and molten mozzarella on our signature pan crust.",
    ingredients: "Malai Paneer Tikka, Charred Capsicum, Pickled Red Onion, Mint Chutney Drizzle, Mozzarella",
    image_key: "mediterranean_veggie",
    available: true
  },
  {
    id: "melt-truffle-mushroom",
    name: "Crispy Parmesan Folded Pizza Melt",
    category: "Crispy Melts & Pastas",
    price: 329,
    calories: 560,
    prep_time: "12-15 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: false,
    rating: 4.86,
    reviews_count: 198,
    description: "Crispy folded thin-crust handheld melt packed with three-cheese blend, roasted mushrooms, caramelized onions, and herbed parmesan crust—served with warm marinara dip.",
    ingredients: "Three-Cheese Blend, Roasted Mushrooms, Caramelized Onions, Herb Parmesan Crust, Marinara Dip",
    image_key: "truffle_burrata",
    available: true
  },
  {
    id: "pasta-baked-mac-arrabbiata",
    name: "Wood-Fired Penne Arrabbiata Gratin",
    category: "Crispy Melts & Pastas",
    price: 369,
    calories: 610,
    prep_time: "14-18 mins",
    is_veg: true,
    is_spicy: true,
    is_bestseller: false,
    rating: 4.87,
    reviews_count: 164,
    description: "Bronze-die penne tossed in slow-simmered spicy San Marzano tomato & garlic sauce, topped with fresh burrata cream and baked golden in our brick oven.",
    ingredients: "Bronze-Die Penne, Spicy San Marzano Sauce, Roasted Garlic, Burrata Cream, Fresh Basil",
    image_key: "hero_margherita",
    available: true
  },
  {
    id: "sides-garlic-herb-knots",
    name: "Artisanal Garlic Parmesan Bread Knots (6 Pcs)",
    category: "Artisanal Sides",
    price: 219,
    calories: 480,
    prep_time: "10-12 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: true,
    rating: 4.96,
    reviews_count: 440,
    description: "Hand-tied 72-hour sourdough knots brushed generously with roasted garlic herb butter, aged Parmigiano-Reggiano, and served with warm basil marinara.",
    ingredients: "Sourdough Knots, Roasted Garlic Butter, Aged Parmesan, Fresh Parsley, Marinara Dip",
    image_key: "garlic_knots_lava_cake",
    available: true
  },
  {
    id: "dessert-molten-lava-cake",
    name: "Belgian Dark Chocolate Molten Lava Cake",
    category: "Desserts & Drinks",
    price: 249,
    calories: 510,
    prep_time: "10-12 mins",
    is_veg: true,
    is_spicy: false,
    is_bestseller: true,
    rating: 4.97,
    reviews_count: 392,
    description: "Warm, freshly baked 70% Belgian couverture chocolate cake with a flowing molten ganache center, dusted with vanilla bean sugar and served with fresh raspberries.",
    ingredients: "70% Belgian Chocolate, Cultured Butter, Vanilla Bean Sugar, Fresh Raspberries, Mint",
    image_key: "garlic_knots_lava_cake",
    available: true
  }
];

const SIGNATURE_COMBOS = [
  {
    id: "combo-triple-treat-box",
    name: "The Elysium Triple Treat Box",
    badge: "MOST POPULAR FAMILY BOX",
    serves: "Serves 4–5 Guests",
    original_price: 1599,
    price: 1199,
    description: "2 Medium Signature Pizzas of your choice + 6 Garlic Herb Bread Knots with Marinara + 1 Warm Belgian Chocolate Molten Lava Cake.",
    image_key: "garlic_knots_lava_cake",
    items_summary: "2x Medium Pizzas + 6pc Garlic Knots + Molten Lava Cake"
  },
  {
    id: "combo-gourmet-duo-feast",
    name: "Sunlit Gourmet Date-Night Duo",
    badge: "COUPLE'S FAVOURITE",
    serves: "Serves 2–3 Guests",
    original_price: 1099,
    price: 849,
    description: "1 Medium Truffle & Burrata or Pepperoni Hot Honey Pizza + 1 Crispy Parmesan Melt + 6 Garlic Herb Knots.",
    image_key: "truffle_burrata",
    items_summary: "1x Gourmet Pizza + 1x Crispy Melt + 6pc Garlic Knots"
  },
  {
    id: "combo-grand-party-fiesta",
    name: "Grand Wood-Fired Party Fiesta",
    badge: "CELEBRATION PACK",
    serves: "Serves 7–8 Guests",
    original_price: 2699,
    price: 1999,
    description: "3 Large Signature & Gourmet Pizzas + 12 Garlic Parmesan Bread Knots + 2 Wood-Fired Pastas + 2 Belgian Molten Lava Cakes.",
    image_key: "spicy_pepperoni_honey",
    items_summary: "3x Large Pizzas + 12pc Knots + 2x Pastas + 2x Lava Cakes"
  }
];

const INITIAL_BLOGS = [
  {
    id: "blog-72-hour-fermentation",
    title: "Why We Cold-Ferment Our Sourdough for 72 Full Hours",
    category: "Culinary Craft",
    author: "Chef Marco Bellini",
    author_role: "Master Pizzaiolo & Co-Founder",
    read_time: "4 min read",
    published_date: "October 24, 2026",
    excerpt: "Discover how slow cold fermentation unlocks airy honeycomb crusts, complex artisanal aromas, and effortless digestibility in every slice we bake.",
    content: "At Elysium Pizza, we believe great pizza begins three days before the oven is even lit. Unlike rushed commercial doughs that rely on heavy yeast and sugar, our dough is mixed with stone-milled Italian Tipo 00 flour, high-mineral spring water, sea salt, and our 18-year-old natural levain starter.\n\nOver 72 hours in our temperature-controlled maturation cellar at 4°C, natural enzymes gently break down complex starches and gluten networks. When the hand-stretched disc meets the 485°C volcanic stone floor of our brick oven, the trapped micro-bubbles expand rapidly into a crisp, leopard-spotted cornicione that stays light, fragrant, and wonderfully digestible.",
    image_key: "hero_margherita",
    featured: true
  },
  {
    id: "blog-truffle-burrata-pairing",
    title: "From Puglia to Your Table: Crafting the Truffle & Burrata Gold",
    category: "Ingredient Stories",
    author: "Chef Ananya Sen",
    author_role: "Culinary Director",
    read_time: "5 min read",
    published_date: "October 18, 2026",
    excerpt: "How fresh stracciatella-filled burrata, wild forest mushrooms, and aromatic black truffle create our most requested white pizza.",
    content: "White pizzas—or Pizza Bianca—demand extraordinary balance because there is no acidity from tomato sauce to hide behind. For our Truffle & Burrata Gold, we begin with a delicate roasted garlic and Parmigiano-Reggiano cream base.\n\nWe bake the crust with sautéed chanterelle and shiitake mushrooms, and only after the pizza emerges blistering hot from the wood-fired oven do we crown it with cool, creamy burrata and shaved black summer truffles. The contrast between the warm, crispy crust and the cool, cascading stracciatella cream creates a truly unforgettable bite.",
    image_key: "truffle_burrata",
    featured: false
  },
  {
    id: "blog-hot-honey-revolution",
    title: "Sweet Meets Heat: The Story Behind Our Calabrian Hot Honey Drizzle",
    category: "Flavour Notes",
    author: "Rohan Chatterjee",
    author_role: "Artisanal Sauce Curator",
    read_time: "3 min read",
    published_date: "October 10, 2026",
    excerpt: "We infuse raw multiflora wildflower honey with sun-dried red chilies to create the ultimate counterpoint to savoury cupped pepperoni.",
    content: "Every great culinary tradition celebrates the marriage of sweet, savoury, and spicy. In our kitchen, we gently warm raw wildflower honey with crushed Calabrian chilies and a splash of aged apple cider vinegar.\n\nDrizzled over crispy, charred pepperoni cups and bubbling mozzarella right before serving, the floral sweetness rounds out the smoky spice and keeps you reaching for the next slice.",
    image_key: "spicy_pepperoni_honey",
    featured: false
  }
];

const INITIAL_TESTIMONIALS = [
  {
    id: "rev-101",
    guest_name: "Arundhati Mukherjee",
    guest_location: "Ballygunge, Kolkata",
    ordered_item: "Truffle & Creamy Burrata Gold",
    rating: 5,
    comment: "Hands down the finest crust in the city! It arrived steaming hot in 24 minutes, and the burrata was so fresh and creamy. The Triple Treat Box is our family's Friday night ritual now.",
    verified: true
  },
  {
    id: "rev-102",
    guest_name: "Vikramaditya Roy",
    guest_location: "Salt Lake Sector V",
    ordered_item: "Crispy Cup Pepperoni & Hot Honey",
    rating: 5,
    comment: "The balance of smoky pepperoni cups with the wildflower hot honey drizzle is pure magic. You can genuinely taste the 72-hour fermented sourdough difference—light, crisp, and zero heaviness.",
    verified: true
  },
  {
    id: "rev-103",
    guest_name: "Sneha & Kabir Bose",
    guest_location: "Park Street, Kolkata",
    ordered_item: "The Elysium Triple Treat Box",
    rating: 5,
    comment: "Ordered for our anniversary dinner at home. The garlic parmesan knots and Belgian molten lava cake were restaurant-grade perfection. Loved tracking every stage from dough stretching to delivery!",
    verified: true
  },
  {
    id: "rev-104",
    guest_name: "Devansh Sengupta",
    guest_location: "New Town Action Area I",
    ordered_item: "Custom Crafted Pan Pizza",
    rating: 5,
    comment: "The Custom Pizza Studio let me build my dream stuffed-crust pie with smoked gouda, olives, and sun-dried tomatoes. Super intuitive website and super fast delivery!",
    verified: true
  }
];

const INITIAL_ORDERS = [
  {
    id: "ELY-849201",
    customer_name: "Arundhati Mukherjee",
    customer_phone: "+91 98301 44210",
    customer_email: "arundhati.m@example.com",
    delivery_type: "Delivery",
    address: "42B Lovelock Place, Ballygunge, Kolkata 700019",
    items: [
      { name: "Truffle & Creamy Burrata Gold (Medium 12\", Hand-Tossed)", qty: 1, price: 649 },
      { name: "Artisanal Garlic Parmesan Bread Knots (6 Pcs)", qty: 1, price: 219 }
    ],
    subtotal: 868,
    discount_amount: 130,
    tax_amount: 37,
    delivery_charge: 0,
    total_amount: 775,
    payment_method: "UPI / Instant Pay",
    status: "Baking in Wood-Fired Oven",
    created_at: "Today, 12 mins ago",
    pizzaiolo: "Chef Marco Bellini",
    rider: "Arjun Das (EV Express)"
  },
  {
    id: "ELY-849178",
    customer_name: "Siddharth Verma",
    customer_phone: "+91 98312 88904",
    customer_email: "siddharth.v@example.com",
    delivery_type: "Delivery",
    address: "Tower 4, Apt 11C, Urbana, Kolkata 700107",
    items: [
      { name: "The Elysium Triple Treat Box", qty: 1, price: 1199 }
    ],
    subtotal: 1199,
    discount_amount: 180,
    tax_amount: 51,
    delivery_charge: 0,
    total_amount: 1070,
    payment_method: "Card on Delivery",
    status: "Out for Hot-Box Delivery",
    created_at: "Today, 26 mins ago",
    pizzaiolo: "Chef Ananya Sen",
    rider: "Rakesh Mondal (EV Express)"
  }
];

const INITIAL_CONTACTS = [
  {
    id: "inq-301",
    full_name: "Priyanka Chatterjee",
    email: "priyanka.c@avenirmedia.in",
    phone: "+91 98309 11234",
    topic: "Private Event & Office Catering",
    party_size: "45 Guests",
    message: "We would love to book live pizza catering and 15 Triple Treat Boxes for our Diwali office celebration next Friday at Park Street.",
    status: "New Inquiry",
    created_at: "2 hours ago"
  },
  {
    id: "inq-302",
    full_name: "Rishabh Agarwal",
    email: "rishabh.ag@gmail.com",
    phone: "+91 90071 55412",
    topic: "Birthday Table Reservation",
    party_size: "12 Guests",
    message: "Looking to reserve the sunlit garden terrace table this Sunday evening at 7:30 PM with a pre-ordered custom truffle pizza spread.",
    status: "Confirmed",
    created_at: "Yesterday"
  }
];

const ORDER_STAGES = [
  "Order Confirmed",
  "Hand-Stretching 72h Dough",
  "Baking in Wood-Fired Oven",
  "Quality & Fresh Basil Check",
  "Out for Hot-Box Delivery",
  "Delivered Warm"
];

// Safe LocalStorage Helpers
function loadStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

// Application Reactive State
const state = {
  settings: loadStorage("ely_settings_v2", { ...FESTIVAL_PRESETS.default }),
  menu: loadStorage("ely_menu_v2", INITIAL_MENU),
  blogs: loadStorage("ely_blogs_v2", INITIAL_BLOGS),
  testimonials: loadStorage("ely_testimonials_v2", INITIAL_TESTIMONIALS),
  orders: loadStorage("ely_orders_v2", INITIAL_ORDERS),
  contacts: loadStorage("ely_contacts_v2", INITIAL_CONTACTS),
  subscribers: loadStorage("ely_subscribers_v2", [
    { email: "arundhati.m@example.com", subscribed_at: "Oct 25, 2026" },
    { email: "vikram.roy@example.com", subscribed_at: "Oct 28, 2026" }
  ]),
  cart: loadStorage("ely_cart_v2", [
    {
      cartId: "cart-init-1",
      id: "pizza-truffle-burrata",
      name: "Truffle & Creamy Burrata Gold",
      meta: "Medium 12\" • Hand-Tossed 72h Sourdough",
      price: 649,
      qty: 1,
      image_key: "truffle_burrata"
    }
  ]),
  orderMode: "Delivery", // Delivery | Carryout | Dine-In
  selectedOutlet: "Park Street Flagship Kitchen",
  activeCategory: "All Items",
  searchQuery: "",
  vegOnly: false,
  spicyOnly: false,
  bestsellerOnly: false,
  sortBy: "featured",
  cardSelections: {}, // per-item size & crust choices
  customPizza: {
    crust: { name: "Hand-Tossed 72h Sourdough", price: 0, cal: 240 },
    size: { name: "Medium 12\" (6 Slices)", price: 429, cal: 380 },
    sauce: { name: "San Marzano Classic Marinara", price: 0, cal: 45 },
    drizzle: { name: "Wildflower Hot Honey Drizzle", price: 49, cal: 40 },
    toppings: ["Fresh Torn Burrata", "Roasted Wild Mushrooms", "Sweet Garden Basil"]
  },
  activeTrackerOrderId: "ELY-849201",
  isAdminAuthenticated: false,
  adminCredentials: { username: "", password: "" },
  activeAdminTab: "overview",
  editingMenuId: null,
  editingBlogId: null,
  editingTestimonialId: null
};

const TOPPING_CATALOG = [
  { name: "Fresh Torn Burrata", price: 89, cal: 95, veg: true },
  { name: "Roasted Wild Mushrooms", price: 69, cal: 35, veg: true },
  { name: "Smoked Cup Pepperoni", price: 99, cal: 120, veg: false },
  { name: "Chargrilled BBQ Chicken", price: 99, cal: 110, veg: false },
  { name: "Malai Paneer Tikka", price: 79, cal: 90, veg: true },
  { name: "Kalamata Olives", price: 59, cal: 40, veg: true },
  { name: "Sun-Dried Tomatoes", price: 69, cal: 35, veg: true },
  { name: "Caramelized Red Onions", price: 49, cal: 30, veg: true },
  { name: "Greek Feta Crumbles", price: 69, cal: 70, veg: true },
  { name: "Sweet Garden Basil", price: 29, cal: 10, veg: true }
];

function resolveImage(keyOrUrl) {
  if (!keyOrUrl) return IMAGE_MAP.hero_margherita;
  if (IMAGE_MAP[keyOrUrl]) return IMAGE_MAP[keyOrUrl];
  if (keyOrUrl.startsWith("http") || keyOrUrl.startsWith("data:") || keyOrUrl.startsWith("assets/") ) {
    return keyOrUrl;
  }
  return IMAGE_MAP.hero_margherita;
}

// Toast Notification Helper (Never uses alert!)
window.showToast = function(title, subtitle = "", tone = "brand") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const borderClass = tone === "emerald" ? "border-emerald-300 bg-emerald-50/95" : "border-rose-200 bg-white/95";
  const badgeColor = tone === "emerald" ? "bg-emerald-600" : "btn-brand";
  toast.className = `flex items-start gap-3 p-4 rounded-2xl border ${borderClass} shadow-lg transition-all duration-300 max-w-sm`;
  toast.innerHTML = `
    <span class="w-7 h-7 rounded-full ${badgeColor} text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-slate-800">${title}</p>
      ${subtitle ? `<p class="text-xs text-slate-600 mt-0.5">${subtitle}</p>` : ""}
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 260);
  }, 3400);
};

// Apply Festive Theme & Banner to Document
function applyFestiveThemeToDOM() {
  const s = state.settings;
  document.body.setAttribute("data-festival", s.active_festival || "default");

  const ribbon = document.getElementById("festive-ribbon-bar");
  const titleEl = document.getElementById("festive-banner-title");
  const subEl = document.getElementById("festive-banner-subtitle");
  const codePill = document.getElementById("festive-promo-code-pill");
  const heroSeasonTag = document.getElementById("hero-season-tag");
  const heroDiscountBadge = document.getElementById("hero-discount-badge");

  if (ribbon) {
    ribbon.style.display = s.banner_enabled ? "block" : "none";
  }
  if (titleEl) titleEl.textContent = s.banner_title;
  if (subEl) subEl.textContent = s.banner_subtitle;
  if (codePill) codePill.textContent = `${s.promo_code} • ${s.discount_percent}% OFF`;

  const presetInfo = FESTIVAL_PRESETS[s.active_festival] || FESTIVAL_PRESETS.default;
  if (heroSeasonTag) {
    heroSeasonTag.textContent = presetInfo.season_tag;
  }
  if (heroDiscountBadge) {
    heroDiscountBadge.textContent = `${s.discount_percent}% Festive Savings (${s.promo_code})`;
  }
}

// Navigation / View Switcher
window.navigateToSection = function(sectionId) {
  const adminView = document.getElementById("admin-portal-view");
  const customerView = document.getElementById("customer-main-view");
  if (adminView && customerView) {
    adminView.classList.add("hidden");
    customerView.classList.remove("hidden");
  }
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const mobileMenu = document.getElementById("mobile-nav-drawer");
  if (mobileMenu) mobileMenu.classList.add("hidden");
};

window.toggleMobileNav = function() {
  const mobileMenu = document.getElementById("mobile-nav-drawer");
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden");
  }
};

// Order Mode (Delivery / Carryout / Dine-In)
window.setOrderMode = function(mode) {
  state.orderMode = mode;
  ["Delivery", "Carryout", "Dine-In"].forEach((m) => {
    const btn = document.getElementById(`mode-btn-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold btn-brand shadow-sm";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900";
      }
    }
  });
  const outletLabel = document.getElementById("active-mode-summary");
  if (outletLabel) {
    outletLabel.textContent = `${mode} • ${state.selectedOutlet}`;
  }
  renderCartDrawer();
  showToast(`${mode} Mode Selected`, `Serving from ${state.selectedOutlet}`);
};

window.changeKitchenOutlet = function(outletName) {
  state.selectedOutlet = outletName;
  const outletLabel = document.getElementById("active-mode-summary");
  if (outletLabel) {
    outletLabel.textContent = `${state.orderMode} • ${state.selectedOutlet}`;
  }
  showToast("Kitchen Updated", `Switched to ${outletName}`);
};

// Copy Promo Code Helper
window.copyActivePromoCode = function() {
  const code = state.settings.promo_code || "ELYSIUM15";
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    } else {
      const temp = document.createElement("textarea");
      temp.value = code;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
  } catch (_) {}
  showToast(`Promo Code ${code} Copied!`, `Automatically gives ${state.settings.discount_percent}% off in your cart.`, "emerald");
};

// Render Signature Combos (Pizza Hut Box Deals Elevated)
function renderComboDeals() {
  const grid = document.getElementById("combo-deals-grid");
  if (!grid) return;
  grid.innerHTML = SIGNATURE_COMBOS.map((combo) => {
    const savings = combo.original_price - combo.price;
    return `
      <div class="surface-card overflow-hidden flex flex-col justify-between">
        <div>
          <div class="relative h-48 overflow-hidden bg-amber-50">
            <img src="${resolveImage(combo.image_key)}" alt="${combo.name}" class="w-full h-full object-cover max-w-full" />
            <div class="absolute top-3 left-3 flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold badge-brand shadow-sm">${combo.badge}</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-emerald-700 border border-emerald-200">Save ₹${savings}</span>
            </div>
          </div>
          <div class="p-5">
            <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>${combo.serves}</span>
              <span class="text-amber-600 font-semibold">★ 4.95 Guest Favourite</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">${combo.name}</h3>
            <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">${combo.description}</p>
            <div class="mt-3 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 font-medium">
              Includes: ${combo.items_summary}
            </div>
          </div>
        </div>
        <div class="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
          <div>
            <span class="text-xs text-slate-400 line-through">₹${combo.original_price}</span>
            <div class="text-xl font-extrabold text-slate-900">₹${combo.price}</div>
          </div>
          <button onclick="addComboToCart('${combo.id}')" class="px-4 py-2.5 rounded-xl text-sm font-semibold btn-brand">
            + Add Box Deal
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.addComboToCart = function(comboId) {
  const combo = SIGNATURE_COMBOS.find((c) => c.id === comboId);
  if (!combo) return;
  addItemToCartObject({
    id: combo.id,
    name: combo.name,
    meta: combo.items_summary,
    price: combo.price,
    image_key: combo.image_key
  });
};

// Render Menu Categories & Cards
function renderMenuSection() {
  const categories = ["All Items", "Signature Pizzas", "Gourmet Specials", "Crispy Melts & Pastas", "Artisanal Sides", "Desserts & Drinks"];
  const catContainer = document.getElementById("menu-category-pills");
  if (catContainer) {
    catContainer.innerHTML = categories.map((cat) => {
      const active = state.activeCategory === cat;
      return `
        <button onclick="setMenuCategory('${cat}')" class="px-4 py-2 rounded-full text-sm transition-all ${
          active
            ? "btn-brand font-semibold shadow-sm"
            : "bg-white border border-slate-200 text-slate-700 hover:border-rose-300 font-medium"
        }">
          ${cat}
        </button>
      `;
    }).join("");
  }

  let filtered = state.menu.filter((item) => item.available !== false);
  if (state.activeCategory !== "All Items") {
    filtered = filtered.filter((item) => item.category === state.activeCategory);
  }
  if (state.vegOnly) {
    filtered = filtered.filter((item) => item.is_veg);
  }
  if (state.spicyOnly) {
    filtered = filtered.filter((item) => item.is_spicy);
  }
  if (state.bestsellerOnly) {
    filtered = filtered.filter((item) => item.is_bestseller);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients.toLowerCase().includes(q)
    );
  }

  if (state.sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === "rating") {
    filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  const countEl = document.getElementById("menu-results-count");
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} handcrafted dish${filtered.length === 1 ? "" : "es"}`;
  }

  const grid = document.getElementById("menu-items-grid");
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full surface-card p-10 text-center">
        <p class="text-lg font-bold text-slate-800">No dishes match your current filters</p>
        <p class="text-sm text-slate-500 mt-1">Try clearing your search or toggling off dietary filters to see all wood-fired creations.</p>
        <button onclick="resetMenuFilters()" class="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold btn-brand">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((item) => {
    const isPizza = item.category.includes("Pizza") || item.category.includes("Gourmet");
    const sel = state.cardSelections[item.id] || { size: "Medium 12\"", crust: "Hand-Tossed 72h", extraPrice: 0 };
    const finalPrice = Number(item.price) + Number(sel.extraPrice || 0);

    return `
      <div class="surface-card overflow-hidden flex flex-col justify-between">
        <div>
          <div class="relative h-52 overflow-hidden bg-orange-50/50">
            <img src="${resolveImage(item.image_key)}" alt="${item.name}" class="w-full h-full object-cover max-w-full transition-transform duration-500 hover:scale-105" />
            <div class="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-white/95 shadow-sm ${
                item.is_veg ? "text-emerald-700 border border-emerald-200" : "text-rose-700 border border-rose-200"
              }">
                <span class="w-2 h-2 rounded-full ${item.is_veg ? "bg-emerald-600" : "bg-rose-600"}"></span>
                ${item.is_veg ? "Pure Veg" : "Chef's Non-Veg"}
              </span>
              ${
                item.is_bestseller
                  ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold badge-brand shadow-sm">★ Bestseller</span>`
                  : ""
              }
              ${
                item.is_spicy
                  ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">🌶️ Spiced</span>`
                  : ""
              }
            </div>
            <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 text-slate-700 text-xs font-semibold shadow-sm">
              ⏱ ${item.prep_time} • ${item.calories} kcal
            </div>
          </div>

          <div class="p-5">
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span class="font-medium text-brand">${item.category}</span>
              <span class="font-semibold text-amber-600">★ ${item.rating} (${item.reviews_count})</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 leading-snug">${item.name}</h3>
            <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">${item.description}</p>
            <p class="text-xs text-slate-500 mt-2"><strong class="text-slate-700">Key Ingredients:</strong> ${item.ingredients}</p>

            ${
              isPizza
                ? `
              <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 uppercase">Size</label>
                  <select onchange="updateCardOption('${item.id}', 'size', this.value)" class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-medium text-slate-800">
                    <option value="Personal 8 inch" ${sel.size === "Personal 8 inch" ? "selected" : ""}>Personal 8" (-₹90)</option>
                    <option value="Medium 12 inch" ${sel.size === "Medium 12 inch" || sel.size === "Medium 12\"" ? "selected" : ""}>Medium 12" (Base)</option>
                    <option value="Large 16 inch" ${sel.size === "Large 16 inch" ? "selected" : ""}>Large 16" (+₹180)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 uppercase">Crust</label>
                  <select onchange="updateCardOption('${item.id}', 'crust', this.value)" class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-medium text-slate-800">
                    <option value="Hand-Tossed 72h" ${sel.crust === "Hand-Tossed 72h" ? "selected" : ""}>Hand-Tossed 72h</option>
                    <option value="Golden Pan Crust" ${sel.crust === "Golden Pan Crust" ? "selected" : ""}>Golden Pan (+₹40)</option>
                    <option value="Cheese Stuffed Crust" ${sel.crust === "Cheese Stuffed Crust" ? "selected" : ""}>Stuffed Crust (+₹110)</option>
                    <option value="Thin Roman Crisp" ${sel.crust === "Thin Roman Crisp" ? "selected" : ""}>Thin Roman Crisp</option>
                  </select>
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100">
          <div>
            <span class="text-xs text-slate-500 font-medium">Artisanal Price</span>
            <div class="text-xl font-extrabold text-slate-900">₹${finalPrice}</div>
          </div>
          <button onclick="addMenuItemToCart('${item.id}')" class="px-4 py-2.5 rounded-xl text-sm font-semibold btn-brand">
            + Add to Order
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.updateCardOption = function(itemId, field, value) {
  const current = state.cardSelections[itemId] || { size: "Medium 12 inch", crust: "Hand-Tossed 72h", extraPrice: 0 };
  current[field] = value;
  let delta = 0;
  if (current.size === "Personal 8 inch") delta -= 90;
  if (current.size === "Large 16 inch") delta += 180;
  if (current.crust === "Golden Pan Crust") delta += 40;
  if (current.crust === "Cheese Stuffed Crust") delta += 110;
  current.extraPrice = delta;
  state.cardSelections[itemId] = current;
  renderMenuSection();
};

window.setMenuCategory = function(cat) {
  state.activeCategory = cat;
  renderMenuSection();
};

window.handleMenuSearch = function(val) {
  state.searchQuery = val;
  renderMenuSection();
};

window.toggleDietaryFilter = function(filterName) {
  if (filterName === "veg") state.vegOnly = !state.vegOnly;
  if (filterName === "spicy") state.spicyOnly = !state.spicyOnly;
  if (filterName === "bestseller") state.bestsellerOnly = !state.bestsellerOnly;

  const vegBtn = document.getElementById("filter-btn-veg");
  const spicyBtn = document.getElementById("filter-btn-spicy");
  const bestBtn = document.getElementById("filter-btn-bestseller");

  if (vegBtn) {
    vegBtn.className = state.vegOnly
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
      : "px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200";
  }
  if (spicyBtn) {
    spicyBtn.className = state.spicyOnly
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
      : "px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200";
  }
  if (bestBtn) {
    bestBtn.className = state.bestsellerOnly
      ? "px-3.5 py-2 rounded-xl text-xs font-bold badge-brand border border-rose-300"
      : "px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200";
  }
  renderMenuSection();
};

window.handleMenuSort = function(val) {
  state.sortBy = val;
  renderMenuSection();
};

window.resetMenuFilters = function() {
  state.activeCategory = "All Items";
  state.searchQuery = "";
  state.vegOnly = false;
  state.spicyOnly = false;
  state.bestsellerOnly = false;
  state.sortBy = "featured";
  const searchInput = document.getElementById("menu-search-input");
  if (searchInput) searchInput.value = "";
  toggleDietaryFilter("");
  renderMenuSection();
};

window.addMenuItemToCart = function(itemId) {
  const item = state.menu.find((m) => m.id === itemId);
  if (!item) return;
  const isPizza = item.category.includes("Pizza") || item.category.includes("Gourmet");
  const sel = state.cardSelections[item.id] || { size: "Medium 12\"", crust: "Hand-Tossed 72h", extraPrice: 0 };
  const finalPrice = Number(item.price) + Number(sel.extraPrice || 0);
  const meta = isPizza ? `${sel.size} • ${sel.crust}` : item.category;

  addItemToCartObject({
    id: item.id,
    name: item.name,
    meta,
    price: finalPrice,
    image_key: item.image_key
  });
};

// Custom Pizza Studio (Interactive 4-Step Builder)
function renderCustomPizzaStudio() {
  const c = state.customPizza;
  const toppingObjects = TOPPING_CATALOG.filter((t) => c.toppings.includes(t.name));
  const toppingsPrice = toppingObjects.reduce((acc, t) => acc + t.price, 0);
  const toppingsCal = toppingObjects.reduce((acc, t) => acc + t.cal, 0);

  const totalPrice = c.size.price + c.crust.price + c.sauce.price + c.drizzle.price + toppingsPrice;
  const totalCalories = c.size.cal + c.crust.cal + c.sauce.cal + c.drizzle.cal + toppingsCal;

  const priceEl = document.getElementById("studio-live-price");
  const calEl = document.getElementById("studio-live-calories");
  const summaryEl = document.getElementById("studio-live-summary");
  const toppingsGrid = document.getElementById("studio-toppings-grid");
  const visualBadges = document.getElementById("studio-visual-toppings");

  if (priceEl) priceEl.textContent = `₹${totalPrice}`;
  if (calEl) calEl.textContent = `${totalCalories} kcal`;
  if (summaryEl) {
    summaryEl.textContent = `${c.size.name} • ${c.crust.name} • ${c.sauce.name} • ${c.drizzle.name}`;
  }
  if (visualBadges) {
    visualBadges.innerHTML = c.toppings.length
      ? c.toppings.map((t) => `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm border border-amber-200">${t}</span>`).join("")
      : `<span class="text-xs text-amber-900 font-medium">Cheese & Sauce Base (Select toppings on the right)</span>`;
  }

  if (toppingsGrid) {
    toppingsGrid.innerHTML = TOPPING_CATALOG.map((top) => {
      const active = c.toppings.includes(top.name);
      return `
        <button type="button" onclick="toggleStudioTopping('${top.name}')" class="p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
          active
            ? "bg-rose-50/90 border-rose-400 text-slate-900 shadow-sm"
            : "bg-white border-slate-200 text-slate-700 hover:border-amber-300"
        }">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${top.veg ? "bg-emerald-600" : "bg-rose-600"}"></span>
              <span class="text-xs font-bold">${top.name}</span>
            </div>
            <span class="text-[11px] text-slate-500">+₹${top.price} • ${top.cal} kcal</span>
          </div>
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            active ? "btn-brand" : "bg-slate-100 text-slate-400"
          }">${active ? "✓" : "+"}</span>
        </button>
      `;
    }).join("");
  }
}

window.setStudioOption = function(type, name, price, cal) {
  state.customPizza[type] = { name, price: Number(price), cal: Number(cal) };
  renderCustomPizzaStudio();
};

window.toggleStudioTopping = function(toppingName) {
  const list = state.customPizza.toppings;
  const idx = list.indexOf(toppingName);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(toppingName);
  }
  renderCustomPizzaStudio();
};

window.addCustomStudioPizzaToCart = function() {
  const c = state.customPizza;
  const toppingObjects = TOPPING_CATALOG.filter((t) => c.toppings.includes(t.name));
  const toppingsPrice = toppingObjects.reduce((acc, t) => acc + t.price, 0);
  const totalPrice = c.size.price + c.crust.price + c.sauce.price + c.drizzle.price + toppingsPrice;
  const topList = c.toppings.length ? c.toppings.join(", ") : "Classic Fior di Latte Cheese";

  addItemToCartObject({
    id: `custom-pie-${Date.now()}`,
    name: "Chef's Custom Studio Pizza",
    meta: `${c.size.name} • ${c.crust.name} • ${c.sauce.name} • Toppings: ${topList}`,
    price: totalPrice,
    image_key: "hero_margherita"
  });
};

// Cart Management & Drawer
function addItemToCartObject(itemObj) {
  const existing = state.cart.find((c) => c.id === itemObj.id && c.meta === itemObj.meta);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      cartId: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      id: itemObj.id,
      name: itemObj.name,
      meta: itemObj.meta,
      price: Number(itemObj.price),
      qty: 1,
      image_key: itemObj.image_key || "hero_margherita"
    });
  }
  saveStorage("ely_cart_v2", state.cart);
  renderCartDrawer();
  showToast(`Added ${itemObj.name}`, `${itemObj.meta} • ₹${itemObj.price}`);
}

window.updateCartQty = function(cartId, delta) {
  const item = state.cart.find((c) => c.cartId === cartId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((c) => c.cartId !== cartId);
  }
  saveStorage("ely_cart_v2", state.cart);
  renderCartDrawer();
};

window.toggleCartDrawer = function(forceOpen) {
  const drawer = document.getElementById("cart-drawer-modal");
  if (!drawer) return;
  if (typeof forceOpen === "boolean") {
    drawer.classList.toggle("hidden", !forceOpen);
  } else {
    drawer.classList.toggle("hidden");
  }
  renderCartDrawer();
};

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discPct = Number(state.settings.discount_percent || 0);
  const discountAmount = Math.round((subtotal * discPct) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const gstTax = Math.round(afterDiscount * 0.05);
  const threshold = Number(state.settings.free_delivery_threshold || 699);
  const baseDelivery = state.orderMode === "Delivery" ? Number(state.settings.delivery_fee || 49) : 0;
  const deliveryCharge = subtotal === 0 || afterDiscount >= threshold ? 0 : baseDelivery;
  const grandTotal = afterDiscount + gstTax + deliveryCharge;

  return { subtotal, discPct, discountAmount, gstTax, deliveryCharge, grandTotal };
}

function renderCartDrawer() {
  const totalCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById("header-cart-count");
  if (badge) badge.textContent = String(totalCount);

  const itemsList = document.getElementById("cart-items-container");
  const totalsBox = document.getElementById("cart-totals-summary");
  if (!itemsList || !totalsBox) return;

  if (state.cart.length === 0) {
    itemsList.innerHTML = `
      <div class="text-center py-12 px-4">
        <div class="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-2xl">🍕</div>
        <h4 class="text-base font-bold text-slate-800 mt-3">Your Warm Oven Basket is Empty</h4>
        <p class="text-xs text-slate-500 mt-1">Explore our wood-fired pizzas, Triple Treat boxes, or craft your own pie in the Studio.</p>
      </div>
    `;
    totalsBox.innerHTML = "";
    return;
  }

  itemsList.innerHTML = state.cart.map((item) => `
    <div class="flex items-center gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-200/60">
      <img src="${resolveImage(item.image_key)}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover shrink-0 border border-amber-200" />
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-bold text-slate-900 truncate">${item.name}</h4>
        <p class="text-xs text-slate-500 line-clamp-1">${item.meta}</p>
        <div class="text-sm font-extrabold text-brand mt-1">₹${item.price * item.qty}</div>
      </div>
      <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
        <button onclick="updateCartQty('${item.cartId}', -1)" class="w-6 h-6 rounded text-slate-700 hover:bg-slate-100 font-bold">-</button>
        <span class="text-xs font-bold text-slate-900 w-5 text-center">${item.qty}</span>
        <button onclick="updateCartQty('${item.cartId}', 1)" class="w-6 h-6 rounded text-slate-700 hover:bg-slate-100 font-bold">+</button>
      </div>
    </div>
  `).join("");

  const { subtotal, discPct, discountAmount, gstTax, deliveryCharge, grandTotal } = calculateCartTotals();
  totalsBox.innerHTML = `
    <div class="space-y-2 text-sm border-t border-slate-200 pt-4">
      <div class="flex justify-between text-slate-600">
        <span>Basket Subtotal</span>
        <span class="font-semibold text-slate-800">₹${subtotal}</span>
      </div>
      <div class="flex justify-between text-emerald-700 font-medium">
        <span>Festive Privilege (${state.settings.promo_code} • ${discPct}% Off)</span>
        <span>-₹${discountAmount}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Culinary GST (5%)</span>
        <span>₹${gstTax}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Hot-Box Delivery (${state.orderMode})</span>
        <span>${deliveryCharge === 0 ? `<strong class="text-emerald-700">FREE</strong>` : `₹${deliveryCharge}`}</span>
      </div>
      <div class="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
        <span>Total Payable</span>
        <span class="text-brand text-lg">₹${grandTotal}</span>
      </div>
    </div>
  `;
}

// Checkout Flow (Persists to state + attempts Netlify /api/orders POST)
window.submitCustomerOrder = async function(event) {
  if (event) event.preventDefault();
  if (state.cart.length === 0) {
    showToast("Your Basket is Empty", "Please add a pizza or box meal before placing an order.");
    return;
  }

  const name = (document.getElementById("checkout-name")?.value || "").trim();
  const phone = (document.getElementById("checkout-phone")?.value || "").trim();
  const email = (document.getElementById("checkout-email")?.value || "").trim();
  const address = (document.getElementById("checkout-address")?.value || "").trim();
  const payment = document.getElementById("checkout-payment")?.value || "UPI / Instant Pay";
  const notes = (document.getElementById("checkout-notes")?.value || "").trim();

  if (!name || !phone || !address) {
    showToast("Complete Delivery Details", "Please provide your name, phone number, and delivery address.");
    return;
  }

  const totals = calculateCartTotals();
  const newOrderId = `ELY-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    id: newOrderId,
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    delivery_type: state.orderMode,
    address,
    items: state.cart.map((c) => ({ name: `${c.name} (${c.meta})`, qty: c.qty, price: c.price })),
    subtotal: totals.subtotal,
    discount_amount: totals.discountAmount,
    tax_amount: totals.gstTax,
    delivery_charge: totals.deliveryCharge,
    total_amount: totals.grandTotal,
    payment_method: payment,
    status: "Hand-Stretching 72h Dough",
    special_notes: notes,
    created_at: "Just Now",
    pizzaiolo: "Chef Marco Bellini",
    rider: "Assigning EV Hot-Box Rider"
  };

  state.orders.unshift(newOrder);
  saveStorage("ely_orders_v2", state.orders);
  state.activeTrackerOrderId = newOrderId;
  state.cart = [];
  saveStorage("ely_cart_v2", state.cart);

  // Non-blocking sync to Netlify Function when hosted on Netlify
  try {
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder)
    }).catch(() => {});
  } catch (_) {}

  renderCartDrawer();
  renderOrderTracker();
  toggleCartDrawer(false);
  navigateToSection("tracker-section");
  showToast(`Order ${newOrderId} Confirmed!`, "Our pizzaiolos have begun hand-stretching your 72-hour dough.", "emerald");
};

// Live 5-Stage Order Tracker
function renderOrderTracker() {
  const order = state.orders.find((o) => o.id === state.activeTrackerOrderId) || state.orders[0];
  const container = document.getElementById("live-order-tracker-card");
  if (!container || !order) return;

  const currentStageIdx = Math.max(0, ORDER_STAGES.indexOf(order.status));

  container.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-amber-200/70">
      <div>
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="px-3 py-1 rounded-full text-xs font-bold badge-brand">ORDER #${order.id}</span>
          <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">● Live Kitchen Feed</span>
          <span class="text-xs text-slate-500">${order.created_at} • ${order.delivery_type}</span>
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-2">${order.customer_name} — ${order.status}</h3>
        <p class="text-xs text-slate-600 mt-0.5">Destination: ${order.address}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="text-xs font-semibold text-slate-600">Switch Order:</label>
        <select onchange="selectTrackedOrder(this.value)" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800">
          ${state.orders.map((o) => `<option value="${o.id}" ${o.id === order.id ? "selected" : ""}>#${o.id} — ${o.customer_name} (₹${o.total_amount})</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
      ${ORDER_STAGES.map((stageName, idx) => {
        const done = idx <= currentStageIdx;
        const current = idx === currentStageIdx;
        return `
          <div class="p-3.5 rounded-2xl border transition-all ${
            current
              ? "bg-rose-50/90 border-rose-400 shadow-sm"
              : done
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-slate-50/70 border-slate-200 opacity-65"
          }">
            <div class="flex items-center justify-between mb-1.5">
              <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                current ? "btn-brand" : done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
              }">${done ? "✓" : idx + 1}</span>
              <span class="text-[11px] font-semibold ${current ? "text-brand" : done ? "text-emerald-700" : "text-slate-400"}">
                ${current ? "Active Now" : done ? "Completed" : "Upcoming"}
              </span>
            </div>
            <p class="text-xs font-bold text-slate-800 leading-snug">${stageName}</p>
          </div>
        `;
      }).join("")}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70">
      <div>
        <span class="text-[11px] font-bold uppercase text-slate-400">Master Pizzaiolo</span>
        <p class="text-sm font-bold text-slate-800 mt-0.5">${order.pizzaiolo || "Chef Marco Bellini"}</p>
        <p class="text-xs text-slate-500">485°C Wood-Fired Brick Oven #2</p>
      </div>
      <div>
        <span class="text-[11px] font-bold uppercase text-slate-400">Ordered Creations</span>
        <p class="text-xs font-semibold text-slate-800 mt-0.5">${(order.items || []).map((i) => `${i.qty}x ${i.name}`).join(" • ")}</p>
      </div>
      <div class="flex items-center justify-between md:justify-end gap-4">
        <div>
          <span class="text-[11px] font-bold uppercase text-slate-400">Total Paid (${order.payment_method})</span>
          <p class="text-lg font-extrabold text-brand">₹${order.total_amount}</p>
        </div>
        <button onclick="advanceTrackerStageDemo('${order.id}')" class="px-3.5 py-2 rounded-xl text-xs font-semibold btn-outline-brand">
          Simulate Next Oven Stage →
        </button>
      </div>
    </div>
  `;
}

window.selectTrackedOrder = function(orderId) {
  state.activeTrackerOrderId = orderId;
  renderOrderTracker();
};

window.advanceTrackerStageDemo = function(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;
  const idx = ORDER_STAGES.indexOf(order.status);
  const nextIdx = (idx + 1) % ORDER_STAGES.length;
  order.status = ORDER_STAGES[nextIdx];
  saveStorage("ely_orders_v2", state.orders);
  renderOrderTracker();
  showToast(`Order #${order.id} Updated`, `Current Stage: ${order.status}`, "emerald");
};

// Blog Section & Reader Modal
function renderBlogSection() {
  const grid = document.getElementById("blog-posts-grid");
  if (!grid) return;
  grid.innerHTML = state.blogs.map((post) => `
    <article class="surface-card overflow-hidden flex flex-col justify-between">
      <div>
        <div class="relative h-48 overflow-hidden bg-amber-50">
          <img src="${resolveImage(post.image_key)}" alt="${post.title}" class="w-full h-full object-cover max-w-full" />
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm">
            ${post.category}
          </span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>${post.published_date}</span>
            <span>•</span>
            <span>${post.read_time}</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 leading-snug">${post.title}</h3>
          <p class="text-sm text-slate-600 mt-2 leading-relaxed">${post.excerpt}</p>
        </div>
      </div>
      <div class="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-800">${post.author}</p>
          <p class="text-[11px] text-slate-500">${post.author_role}</p>
        </div>
        <button onclick="openBlogReaderModal('${post.id}')" class="px-3.5 py-2 rounded-xl text-xs font-semibold btn-outline-brand">
          Read Story →
        </button>
      </div>
    </article>
  `).join("");
}

window.openBlogReaderModal = function(blogId) {
  const post = state.blogs.find((b) => b.id === blogId);
  const modal = document.getElementById("blog-reader-modal");
  const content = document.getElementById("blog-reader-content");
  if (!post || !modal || !content) return;

  content.innerHTML = `
    <div class="relative h-64 rounded-2xl overflow-hidden mb-5">
      <img src="${resolveImage(post.image_key)}" alt="${post.title}" class="w-full h-full object-cover max-w-full" />
      <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold badge-brand shadow-sm">${post.category}</span>
    </div>
    <div class="flex items-center gap-3 text-xs text-slate-500 mb-2">
      <span class="font-semibold text-slate-800">${post.author} (${post.author_role})</span>
      <span>•</span>
      <span>${post.published_date}</span>
      <span>•</span>
      <span>${post.read_time}</span>
    </div>
    <h2 class="text-2xl font-extrabold text-slate-900">${post.title}</h2>
    <div class="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
      ${post.content.split("\n\n").map((p) => `<p>${p}</p>`).join("")}
    </div>
  `;
  modal.classList.remove("hidden");
};

window.closeBlogReaderModal = function() {
  const modal = document.getElementById("blog-reader-modal");
  if (modal) modal.classList.add("hidden");
};

// Testimonials Section & Guest Review Submission
function renderTestimonialsSection() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;
  grid.innerHTML = state.testimonials.map((t) => `
    <div class="surface-card p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-amber-500 text-sm font-bold">${"★".repeat(Number(t.rating || 5))}</div>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Verified Diner
          </span>
        </div>
        <p class="text-sm text-slate-700 italic leading-relaxed">"${t.comment}"</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-slate-900">${t.guest_name}</p>
          <p class="text-xs text-slate-500">${t.guest_location}</p>
        </div>
        <span class="text-xs font-semibold text-brand bg-rose-50 px-2.5 py-1 rounded-lg">${t.ordered_item}</span>
      </div>
    </div>
  `).join("");
}

window.submitGuestTestimonial = function(event) {
  if (event) event.preventDefault();
  const name = (document.getElementById("review-guest-name")?.value || "").trim();
  const location = (document.getElementById("review-guest-location")?.value || "").trim();
  const dish = (document.getElementById("review-ordered-dish")?.value || "").trim();
  const rating = Number(document.getElementById("review-rating")?.value || 5);
  const comment = (document.getElementById("review-comment")?.value || "").trim();

  if (!name || !comment) {
    showToast("Complete Your Review", "Please enter your name and tasting notes.");
    return;
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    guest_name: name,
    guest_location: location || "Kolkata",
    ordered_item: dish || "San Marzano Margherita Regina",
    rating,
    comment,
    verified: true
  };

  state.testimonials.unshift(newReview);
  saveStorage("ely_testimonials_v2", state.testimonials);

  try {
    fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview)
    }).catch(() => {});
  } catch (_) {}

  document.getElementById("guest-review-form")?.reset();
  renderTestimonialsSection();
  showToast("Thank You for Your Review!", "Your tasting note has been published to our guest wall.", "emerald");
};

// Contact Us & Catering Inquiry Submission
window.submitContactInquiry = function(event) {
  if (event) event.preventDefault();
  const full_name = (document.getElementById("contact-name")?.value || "").trim();
  const email = (document.getElementById("contact-email")?.value || "").trim();
  const phone = (document.getElementById("contact-phone")?.value || "").trim();
  const topic = document.getElementById("contact-topic")?.value || "Private Event & Catering";
  const party_size = (document.getElementById("contact-party")?.value || "").trim();
  const message = (document.getElementById("contact-message")?.value || "").trim();

  if (!full_name || !email || !message) {
    showToast("Missing Details", "Please fill in your name, email address, and inquiry message.");
    return;
  }

  const inquiry = {
    id: `inq-${Date.now()}`,
    full_name,
    email,
    phone,
    topic,
    party_size: party_size || "Standard",
    message,
    status: "New Inquiry",
    created_at: "Just Now"
  };

  state.contacts.unshift(inquiry);
  saveStorage("ely_contacts_v2", state.contacts);

  try {
    fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry)
    }).catch(() => {});
  } catch (_) {}

  document.getElementById("customer-contact-form")?.reset();
  showToast("Inquiry Received!", "Our hospitality concierge will reach out within 30 minutes.", "emerald");
};

// Newsletter Subscription
window.submitNewsletterSignup = function(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById("newsletter-email-input");
  const email = (emailInput?.value || "").trim();
  if (!email || !email.includes("@")) {
    showToast("Valid Email Required", "Please enter your email address to join The Golden Crust Society.");
    return;
  }

  if (!state.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    state.subscribers.unshift({ email, subscribed_at: "Today" });
    saveStorage("ely_subscribers_v2", state.subscribers);
  }

  try {
    fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    }).catch(() => {});
  } catch (_) {}

  if (emailInput) emailInput.value = "";
  showToast("Welcome to The Golden Crust Society!", `Use your member privilege code ${state.settings.promo_code} for ${state.settings.discount_percent}% off!`, "emerald");
};

/* ==========================================================================
   PROTECTED ADMIN PORTAL & FESTIVE ENGINE & EXTENSIVE DOCUMENTATION
   ========================================================================== */

window.openAdminPortalModal = function() {
  if (state.isAdminAuthenticated) {
    showAdminPortalView();
    return;
  }
  const modal = document.getElementById("admin-login-modal");
  if (modal) modal.classList.remove("hidden");
};

window.closeAdminLoginModal = function() {
  const modal = document.getElementById("admin-login-modal");
  if (modal) modal.classList.add("hidden");
};

window.fillDemoAdminCredentials = function() {
  const u = document.getElementById("admin-username-input");
  const p = document.getElementById("admin-password-input");
  if (u) u.value = "elysium_admin";
  if (p) p.value = "Elysium@2026";
  showToast("Credentials Pre-filled", "Click 'Sign In to Management Suite' to enter the Admin Portal.");
};

window.handleAdminLoginSubmit = async function(event) {
  if (event) event.preventDefault();
  const username = (document.getElementById("admin-username-input")?.value || "").trim();
  const password = (document.getElementById("admin-password-input")?.value || "").trim();

  if (!username || !password) {
    showToast("Credentials Required", "Please enter both ADMIN_USERNAME and ADMIN_PASSWORD.");
    return;
  }

  let verified = false;
  // First try Netlify serverless endpoint (/api/auth/login)
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.authenticated) verified = true;
    }
  } catch (_) {}

  // Fallback verification for local / Canvas preview
  if (!verified && username === "elysium_admin" && password === "Elysium@2026") {
    verified = true;
  }

  if (!verified) {
    showToast("Authentication Failed", "Invalid ADMIN_USERNAME or ADMIN_PASSWORD. Use the Demo button to test locally.");
    return;
  }

  state.isAdminAuthenticated = true;
  state.adminCredentials = { username, password };
  closeAdminLoginModal();
  showAdminPortalView();
  showToast("Admin Session Active", "Welcome to the Elysium Pizza Management & Documentation Suite.", "emerald");
};

function showAdminPortalView() {
  const adminView = document.getElementById("admin-portal-view");
  const customerView = document.getElementById("customer-main-view");
  if (adminView && customerView) {
    customerView.classList.add("hidden");
    adminView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderAdminPortal();
  }
}

window.exitAdminPortalToSite = function() {
  const adminView = document.getElementById("admin-portal-view");
  const customerView = document.getElementById("customer-main-view");
  if (adminView && customerView) {
    adminView.classList.add("hidden");
    customerView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

window.logoutAdminSession = function() {
  state.isAdminAuthenticated = false;
  state.adminCredentials = { username: "", password: "" };
  exitAdminPortalToSite();
  showToast("Signed Out", "You have logged out of the Admin Portal.");
};

window.switchAdminTab = function(tabName) {
  state.activeAdminTab = tabName;
  renderAdminPortal();
};

function renderAdminPortal() {
  if (!state.isAdminAuthenticated) return;

  const tabs = [
    { id: "overview", label: "📊 Overview & KPIs" },
    { id: "festive", label: "🎉 Festive Banners & Theme" },
    { id: "menu", label: "🍕 Menu CRUD (${state.menu.length})" },
    { id: "orders", label: "🛵 Customer Orders (${state.orders.length})" },
    { id: "blogs", label: "📰 Blog Posts (${state.blogs.length})" },
    { id: "crm", label: "💬 Testimonials & Contacts" },
    { id: "docs", label: "📘 Admin Guide & CORS API Docs" }
  ];

  const tabBar = document.getElementById("admin-tabs-navigation");
  if (tabBar) {
    tabBar.innerHTML = [
      { id: "overview", label: "📊 Overview" },
      { id: "festive", label: "🎉 Festive Theme & Discounts" },
      { id: "menu", label: `🍕 Menu Items (${state.menu.length})` },
      { id: "orders", label: `🛵 Live Orders (${state.orders.length})` },
      { id: "blogs", label: `📰 Blog Posts (${state.blogs.length})` },
      { id: "crm", label: `💬 Reviews & Contacts (${state.testimonials.length + state.contacts.length})` },
      { id: "docs", label: "📘 Admin Aid & CORS API Docs" }
    ].map((t) => `
      <button onclick="switchAdminTab('${t.id}')" class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
        state.activeAdminTab === t.id
          ? "btn-brand shadow-sm"
          : "bg-white text-slate-700 border border-slate-200 hover:border-rose-300"
      }">
        ${t.label}
      </button>
    `).join("");
  }

  const panes = ["overview", "festive", "menu", "orders", "blogs", "crm", "docs"];
  panes.forEach((p) => {
    const el = document.getElementById(`admin-pane-${p}`);
    if (el) {
      el.classList.toggle("hidden", p !== state.activeAdminTab);
    }
  });

  // 1. Overview KPIs
  const totalRev = state.orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const kpiBox = document.getElementById("admin-kpi-cards");
  if (kpiBox) {
    kpiBox.innerHTML = `
      <div class="surface-card p-5">
        <span class="text-xs font-bold uppercase text-slate-400">Gross Order Revenue</span>
        <div class="text-2xl font-extrabold text-slate-900 mt-1">₹${totalRev.toLocaleString("en-IN")}</div>
        <span class="text-xs text-emerald-700 font-semibold mt-1 inline-block">Across ${state.orders.length} active & fulfilled orders</span>
      </div>
      <div class="surface-card p-5">
        <span class="text-xs font-bold uppercase text-slate-400">Active Festive Theme</span>
        <div class="text-xl font-extrabold text-brand mt-1 capitalize">${state.settings.active_festival} (${state.settings.discount_percent}% Off)</div>
        <span class="text-xs text-slate-500 mt-1 inline-block">Promo Code: <strong>${state.settings.promo_code}</strong></span>
      </div>
      <div class="surface-card p-5">
        <span class="text-xs font-bold uppercase text-slate-400">Active Menu Dishes</span>
        <div class="text-2xl font-extrabold text-slate-900 mt-1">${state.menu.length} Items</div>
        <span class="text-xs text-slate-500 mt-1 inline-block">${state.menu.filter((m) => m.is_veg).length} Pure Veg • ${state.menu.filter((m) => !m.is_veg).length} Non-Veg</span>
      </div>
      <div class="surface-card p-5">
        <span class="text-xs font-bold uppercase text-slate-400">Community & CRM</span>
        <div class="text-2xl font-extrabold text-slate-900 mt-1">${state.testimonials.length} Reviews • ${state.contacts.length} Inquiries</div>
        <span class="text-xs text-emerald-700 font-semibold mt-1 inline-block">${state.subscribers.length} Newsletter Members</span>
      </div>
    `;
  }

  // 2. Populate Festive Form Values
  const festSelect = document.getElementById("admin-festival-select");
  const bannerToggle = document.getElementById("admin-banner-enabled");
  const bannerTitle = document.getElementById("admin-banner-title");
  const bannerSub = document.getElementById("admin-banner-subtitle");
  const promoCode = document.getElementById("admin-promo-code");
  const discRate = document.getElementById("admin-discount-rate");
  const delFee = document.getElementById("admin-delivery-fee");
  const freeThresh = document.getElementById("admin-free-threshold");

  if (festSelect) festSelect.value = state.settings.active_festival || "default";
  if (bannerToggle) bannerToggle.checked = state.settings.banner_enabled !== false;
  if (bannerTitle) bannerTitle.value = state.settings.banner_title || "";
  if (bannerSub) bannerSub.value = state.settings.banner_subtitle || "";
  if (promoCode) promoCode.value = state.settings.promo_code || "ELYSIUM15";
  if (discRate) discRate.value = state.settings.discount_percent || 15;
  if (delFee) delFee.value = state.settings.delivery_fee ?? 49;
  if (freeThresh) freeThresh.value = state.settings.free_delivery_threshold ?? 699;

  // 3. Populate Menu CRUD Table
  const menuTable = document.getElementById("admin-menu-table-body");
  if (menuTable) {
    menuTable.innerHTML = state.menu.map((item) => `
      <tr class="border-b border-slate-100 hover:bg-amber-50/30">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <img src="${resolveImage(item.image_key)}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover border border-slate-200" />
            <div>
              <div class="font-bold text-slate-900 text-sm">${item.name}</div>
              <div class="text-xs text-slate-500">${item.category} • ${item.calories} kcal</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-extrabold text-slate-900 text-sm">₹${item.price}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
            item.is_veg ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }">${item.is_veg ? "Pure Veg" : "Non-Veg"}</span>
          ${item.is_bestseller ? `<span class="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold badge-brand">★ Top</span>` : ""}
        </td>
        <td class="py-3 px-4 text-right space-x-1.5">
          <button onclick="loadMenuItemIntoForm('${item.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100">Edit</button>
          <button onclick="deleteAdminMenuItem('${item.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  // 4. Populate Admin Orders Table
  const ordersTable = document.getElementById("admin-orders-list");
  if (ordersTable) {
    ordersTable.innerHTML = state.orders.map((ord) => `
      <div class="surface-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold badge-brand">#${ord.id}</span>
            <span class="font-bold text-slate-900 text-sm">${ord.customer_name} (${ord.customer_phone})</span>
            <span class="text-xs text-slate-500">• ${ord.delivery_type} • ${ord.payment_method}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1"><strong>Address:</strong> ${ord.address}</p>
          <p class="text-xs text-slate-700 mt-1"><strong>Items:</strong> ${(ord.items || []).map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="text-right">
            <span class="text-xs text-slate-400 block">Total Paid</span>
            <span class="text-base font-extrabold text-brand">₹${ord.total_amount}</span>
          </div>
          <select onchange="updateAdminOrderStatus('${ord.id}', this.value)" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
            ${ORDER_STAGES.map((st) => `<option value="${st}" ${st === ord.status ? "selected" : ""}>${st}</option>`).join("")}
            <option value="Cancelled" ${ord.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
          <button onclick="deleteAdminOrder('${ord.id}')" class="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Delete</button>
        </div>
      </div>
    `).join("");
  }

  // 5. Populate Admin Blog List
  const blogList = document.getElementById("admin-blogs-list");
  if (blogList) {
    blogList.innerHTML = state.blogs.map((b) => `
      <div class="surface-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="${resolveImage(b.image_key)}" alt="${b.title}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
          <div>
            <span class="text-[11px] font-bold text-brand uppercase">${b.category} • ${b.published_date}</span>
            <h4 class="text-sm font-bold text-slate-900">${b.title}</h4>
            <p class="text-xs text-slate-500">By ${b.author} (${b.read_time})</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="loadBlogIntoAdminForm('${b.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">Edit</button>
          <button onclick="deleteAdminBlogPost('${b.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Delete</button>
        </div>
      </div>
    `).join("");
  }

  // 6. Populate Admin Testimonials & Contacts CRM
  const revList = document.getElementById("admin-testimonials-list");
  if (revList) {
    revList.innerHTML = state.testimonials.map((t) => `
      <div class="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-xs">${t.guest_name} (${t.guest_location})</span>
            <span class="text-amber-500 text-xs font-bold">${"★".repeat(Number(t.rating || 5))}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">"${t.comment}"</p>
        </div>
        <button onclick="deleteAdminTestimonial('${t.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">Delete</button>
      </div>
    `).join("");
  }

  const contactList = document.getElementById("admin-contacts-list");
  if (contactList) {
    contactList.innerHTML = state.contacts.map((c) => `
      <div class="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
              c.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : "badge-brand"
            }">${c.status}</span>
            <span class="font-bold text-slate-900 text-xs">${c.full_name} (${c.email})</span>
            <span class="text-xs text-slate-500">• ${c.topic} (${c.party_size})</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">${c.message}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="toggleAdminContactStatus('${c.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${c.status === "Resolved" ? "Reopen" : "Mark Resolved"}
          </button>
          <button onclick="deleteAdminContact('${c.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Delete</button>
        </div>
      </div>
    `).join("");
  }
}

// Admin Festive Preset Selection & Save
window.applyFestivalPresetInAdmin = function(festivalKey) {
  const preset = FESTIVAL_PRESETS[festivalKey] || FESTIVAL_PRESETS.default;
  state.settings = { ...preset };
  saveStorage("ely_settings_v2", state.settings);
  applyFestiveThemeToDOM();
  renderAdminPortal();
  renderCartDrawer();
  showToast(`Applied ${preset.label}`, `Website theme, banner & ${preset.discount_percent}% discount (${preset.promo_code}) are now live!`, "emerald");
};

window.saveCustomFestiveSettings = function(event) {
  if (event) event.preventDefault();
  state.settings = {
    active_festival: document.getElementById("admin-festival-select")?.value || "default",
    banner_enabled: Boolean(document.getElementById("admin-banner-enabled")?.checked),
    banner_title: (document.getElementById("admin-banner-title")?.value || "").trim(),
    banner_subtitle: (document.getElementById("admin-banner-subtitle")?.value || "").trim(),
    promo_code: (document.getElementById("admin-promo-code")?.value || "ELYSIUM15").trim().toUpperCase(),
    discount_percent: Number(document.getElementById("admin-discount-rate")?.value || 15),
    delivery_fee: Number(document.getElementById("admin-delivery-fee")?.value || 49),
    free_delivery_threshold: Number(document.getElementById("admin-free-threshold")?.value || 699)
  };

  saveStorage("ely_settings_v2", state.settings);
  applyFestiveThemeToDOM();
  renderCartDrawer();
  renderAdminPortal();

  try {
    fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Username": state.adminCredentials.username,
        "X-Admin-Password": state.adminCredentials.password
      },
      body: JSON.stringify(state.settings)
    }).catch(() => {});
  } catch (_) {}

  showToast("Festive Settings Published!", `Active Theme: ${state.settings.active_festival.toUpperCase()} (${state.settings.discount_percent}% Off)`, "emerald");
};

// Admin Menu CRUD Handlers
window.loadMenuItemIntoForm = function(itemId) {
  const item = state.menu.find((m) => m.id === itemId);
  if (!item) return;
  state.editingMenuId = item.id;
  document.getElementById("admin-menu-name").value = item.name;
  document.getElementById("admin-menu-category").value = item.category;
  document.getElementById("admin-menu-price").value = item.price;
  document.getElementById("admin-menu-calories").value = item.calories;
  document.getElementById("admin-menu-prep").value = item.prep_time;
  document.getElementById("admin-menu-image").value = item.image_key;
  document.getElementById("admin-menu-ingredients").value = item.ingredients;
  document.getElementById("admin-menu-desc").value = item.description;
  document.getElementById("admin-menu-veg").checked = Boolean(item.is_veg);
  document.getElementById("admin-menu-spicy").checked = Boolean(item.is_spicy);
  document.getElementById("admin-menu-best").checked = Boolean(item.is_bestseller);
  const submitBtn = document.getElementById("admin-menu-submit-btn");
  if (submitBtn) submitBtn.textContent = "Update Dish in Catalog";
  showToast(`Editing ${item.name}`, "Modify the fields above and click Update.");
};

window.resetAdminMenuForm = function() {
  state.editingMenuId = null;
  document.getElementById("admin-menu-form")?.reset();
  const submitBtn = document.getElementById("admin-menu-submit-btn");
  if (submitBtn) submitBtn.textContent = "+ Save Dish to Menu";
};

window.saveAdminMenuItem = function(event) {
  if (event) event.preventDefault();
  const name = (document.getElementById("admin-menu-name")?.value || "").trim();
  const category = document.getElementById("admin-menu-category")?.value || "Signature Pizzas";
  const price = Number(document.getElementById("admin-menu-price")?.value || 499);
  const calories = Number(document.getElementById("admin-menu-calories")?.value || 740);
  const prep_time = (document.getElementById("admin-menu-prep")?.value || "18-22 mins").trim();
  const image_key = document.getElementById("admin-menu-image")?.value || "hero_margherita";
  const ingredients = (document.getElementById("admin-menu-ingredients")?.value || "").trim();
  const description = (document.getElementById("admin-menu-desc")?.value || "").trim();
  const is_veg = Boolean(document.getElementById("admin-menu-veg")?.checked);
  const is_spicy = Boolean(document.getElementById("admin-menu-spicy")?.checked);
  const is_bestseller = Boolean(document.getElementById("admin-menu-best")?.checked);

  if (!name || !description) {
    showToast("Required Dish Fields", "Please enter the dish name and culinary description.");
    return;
  }

  const id = state.editingMenuId || `item-${Date.now()}`;
  const dishObj = {
    id,
    name,
    category,
    price,
    calories,
    prep_time,
    is_veg,
    is_spicy,
    is_bestseller,
    rating: 4.95,
    reviews_count: 88,
    description,
    ingredients: ingredients || "Artisanal Sourdough, Fior di Latte, Fresh Herbs",
    image_key,
    available: true
  };

  const existingIdx = state.menu.findIndex((m) => m.id === id);
  if (existingIdx >= 0) {
    state.menu[existingIdx] = dishObj;
  } else {
    state.menu.unshift(dishObj);
  }

  saveStorage("ely_menu_v2", state.menu);
  renderMenuSection();
  renderAdminPortal();
  resetAdminMenuForm();

  try {
    fetch("/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Username": state.adminCredentials.username,
        "X-Admin-Password": state.adminCredentials.password
      },
      body: JSON.stringify(dishObj)
    }).catch(() => {});
  } catch (_) {}

  showToast(`Saved "${name}"`, "Menu catalog and public GET /api/menu endpoint updated.", "emerald");
};

window.deleteAdminMenuItem = function(itemId) {
  state.menu = state.menu.filter((m) => m.id !== itemId);
  saveStorage("ely_menu_v2", state.menu);
  renderMenuSection();
  renderAdminPortal();
  showToast("Dish Removed", "The item was deleted from the menu catalog.");
};

// Admin Order Handlers
window.updateAdminOrderStatus = function(orderId, newStatus) {
  const ord = state.orders.find((o) => o.id === orderId);
  if (!ord) return;
  ord.status = newStatus;
  saveStorage("ely_orders_v2", state.orders);
  renderOrderTracker();
  renderAdminPortal();
  showToast(`Order #${orderId} Updated`, `Status set to "${newStatus}"`, "emerald");
};

window.deleteAdminOrder = function(orderId) {
  state.orders = state.orders.filter((o) => o.id !== orderId);
  saveStorage("ely_orders_v2", state.orders);
  renderOrderTracker();
  renderAdminPortal();
  showToast("Order Record Removed", `Deleted order #${orderId}`);
};

// Admin Blog Handlers
window.loadBlogIntoAdminForm = function(blogId) {
  const b = state.blogs.find((x) => x.id === blogId);
  if (!b) return;
  state.editingBlogId = b.id;
  document.getElementById("admin-blog-title").value = b.title;
  document.getElementById("admin-blog-category").value = b.category;
  document.getElementById("admin-blog-author").value = b.author;
  document.getElementById("admin-blog-image").value = b.image_key;
  document.getElementById("admin-blog-excerpt").value = b.excerpt;
  document.getElementById("admin-blog-content").value = b.content;
  showToast(`Editing "${b.title}"`, "Make your edits and click Save Article.");
};

window.saveAdminBlogPost = function(event) {
  if (event) event.preventDefault();
  const title = (document.getElementById("admin-blog-title")?.value || "").trim();
  const category = (document.getElementById("admin-blog-category")?.value || "Culinary Craft").trim();
  const author = (document.getElementById("admin-blog-author")?.value || "Chef Marco Bellini").trim();
  const image_key = document.getElementById("admin-blog-image")?.value || "hero_margherita";
  const excerpt = (document.getElementById("admin-blog-excerpt")?.value || "").trim();
  const content = (document.getElementById("admin-blog-content")?.value || "").trim();

  if (!title || !content) {
    showToast("Missing Blog Fields", "Please provide an article title and full story body.");
    return;
  }

  const id = state.editingBlogId || `blog-${Date.now()}`;
  const blogObj = {
    id,
    title,
    category,
    author,
    author_role: "Elysium Culinary Team",
    read_time: "4 min read",
    published_date: "October 30, 2026",
    excerpt: excerpt || content.slice(0, 140) + "...",
    content,
    image_key,
    featured: false
  };

  const idx = state.blogs.findIndex((b) => b.id === id);
  if (idx >= 0) {
    state.blogs[idx] = blogObj;
  } else {
    state.blogs.unshift(blogObj);
  }

  state.editingBlogId = null;
  document.getElementById("admin-blog-form")?.reset();
  saveStorage("ely_blogs_v2", state.blogs);
  renderBlogSection();
  renderAdminPortal();
  showToast("Journal Article Published", `"${title}" is now live in The Elysium Journal.`, "emerald");
};

window.deleteAdminBlogPost = function(blogId) {
  state.blogs = state.blogs.filter((b) => b.id !== blogId);
  saveStorage("ely_blogs_v2", state.blogs);
  renderBlogSection();
  renderAdminPortal();
  showToast("Blog Article Deleted", "Removed from The Elysium Journal.");
};

// Admin CRM (Testimonials & Contacts)
window.deleteAdminTestimonial = function(revId) {
  state.testimonials = state.testimonials.filter((t) => t.id !== revId);
  saveStorage("ely_testimonials_v2", state.testimonials);
  renderTestimonialsSection();
  renderAdminPortal();
  showToast("Review Deleted", "Removed guest review from the wall.");
};

window.toggleAdminContactStatus = function(inqId) {
  const c = state.contacts.find((x) => x.id === inqId);
  if (!c) return;
  c.status = c.status === "Resolved" ? "New Inquiry" : "Resolved";
  saveStorage("ely_contacts_v2", state.contacts);
  renderAdminPortal();
  showToast("Inquiry Updated", `Marked as ${c.status}`, "emerald");
};

window.deleteAdminContact = function(inqId) {
  state.contacts = state.contacts.filter((x) => x.id !== inqId);
  saveStorage("ely_contacts_v2", state.contacts);
  renderAdminPortal();
  showToast("Inquiry Deleted", "Removed contact message.");
};

// Admin-Only Interactive CORS API Endpoint Tester
window.runAdminApiSimulator = function(method, endpoint) {
  const out = document.getElementById("admin-api-simulator-output");
  if (!out) return;

  let payload = {};
  if (endpoint === "/api/menu") {
    payload = {
      status: 200,
      cors_headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Content-Type": "application/json; charset=utf-8"
      },
      count: state.menu.length,
      data: state.menu.slice(0, 3)
    };
  } else if (endpoint === "/api/orders") {
    payload = {
      status: 200,
      cors_headers: { "Access-Control-Allow-Origin": "*" },
      count: state.orders.length,
      data: state.orders
    };
  } else if (endpoint === "/api/settings") {
    payload = {
      status: 200,
      cors_headers: { "Access-Control-Allow-Origin": "*" },
      data: state.settings
    };
  } else if (endpoint === "/api/blogs") {
    payload = {
      status: 200,
      cors_headers: { "Access-Control-Allow-Origin": "*" },
      count: state.blogs.length,
      data: state.blogs
    };
  }

  out.textContent = `// HTTP ${method} ${endpoint}\n` + JSON.stringify(payload, null, 2);
  showToast(`Tested ${method} ${endpoint}`, "CORS headers and JSON response rendered below.", "emerald");
};

// Initialize Application on Load
function initElysiumApp() {
  applyFestiveThemeToDOM();
  renderComboDeals();
  renderMenuSection();
  renderCustomPizzaStudio();
  renderCartDrawer();
  renderOrderTracker();
  renderBlogSection();
  renderTestimonialsSection();
}

window.addEventListener("DOMContentLoaded", initElysiumApp);
