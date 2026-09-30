/**
 * PRODUCTS CATALOG
 * Powered by live Supabase Database.
 * When the database is cleared or empty, PRODUCTS is [] so no hardcoded mock jerseys linger.
 * Full initial seed backup is stored in src/data/seed_products.js & supabase-schema.sql
 */
export const PRODUCTS = [];

export const CATEGORIES = [
  {
    id: "full-sleeves",
    name: "FULL SLEEVES",
    path: "/collections/full-sleeves",
    image: "/images/category-full-sleeves.jpg",
    description: "Long sleeve tactical & lifestyle football kits."
  },
  {
    id: "half-sleeves",
    name: "HALF SLEEVES",
    path: "/collections/half-sleeves",
    image: "/images/category-half-sleeves.jpg",
    description: "Classic matchday & heritage half sleeve shirts."
  },
  {
    id: "oversized",
    name: "OVERSIZED",
    path: "/collections/oversized",
    image: "/images/category-oversized.jpg",
    description: "Heavyweight boxy streetwear football jerseys."
  },
  {
    id: "tshirts",
    name: "TSHIRTS",
    path: "/collections/tshirts",
    image: "/images/category-tshirts.jpg",
    description: "Minimal football warmup & graphic lifestyle tees."
  }
];
