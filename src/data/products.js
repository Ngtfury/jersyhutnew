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
    image: "https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/5829b963-ba08-493c-9b38-5ef854f206ea/1786289541562_0.jpg",
    description: "Heavyweight boxy streetwear football jerseys."
  },
  {
    id: "tshirts",
    name: "TSHIRTS",
    path: "/collections/tshirts",
    image: "https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/c7b2ff7a-fdc7-47fd-b2c3-4786acc1c245/1786289573397_0.jpg",
    description: "Minimal football warmup & graphic lifestyle tees."
  }
];
