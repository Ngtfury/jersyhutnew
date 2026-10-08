-- ===================================================================
-- JERSEY HUT — COMPLETE SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 14+ / Supabase 2024-2026
-- ===================================================================

-- 0. Enable UUID Extension (built into modern Postgres, added defensively)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- 1. TABLES SETUP
-- ===================================================================

-- 1.1 Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  min_order_quantity INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL,
  secondary_category TEXT,
  badge TEXT,
  color TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', '2XL'],
  stock_per_size JSONB DEFAULT '{"S": 5, "M": 5, "L": 5, "XL": 5, "2XL": 5}'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::text[],
  player TEXT,
  team TEXT,
  year TEXT,
  version TEXT, -- EMBROIDERY / SUBLIMATION / MASTER QUALITY / PLAYER VERSION
  kit_type TEXT, -- HOME / AWAY / THIRD / SPECIAL
  country TEXT,
  edition TEXT,
  material TEXT,
  is_best_seller BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  description TEXT,
  -- Vendor tracking & stock management
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_price NUMERIC,
  min_stock_alert INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- In case tables were previously created without these columns, alter them safely:
-- (Safe non-destructive production migrations)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS primary_color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS secondary_color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock_alert INTEGER DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS version TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS kit_type TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 10;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_team ON public.products (team);
CREATE INDEX IF NOT EXISTS idx_products_year ON public.products (year);
CREATE INDEX IF NOT EXISTS idx_products_version ON public.products (version);
CREATE INDEX IF NOT EXISTS idx_products_kit_type ON public.products (kit_type);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products (vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products (is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- 1.4 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);

-- 1.5 Site Banners Table (For Hero Banner and Category Covers)
CREATE TABLE IF NOT EXISTS public.site_banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  tagline TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  description TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;
CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================================
-- 2. ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ===================================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- 2.1 Vendors Policies
DROP POLICY IF EXISTS "Allow public read vendors" ON public.vendors;
CREATE POLICY "Allow public read vendors" ON public.vendors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert vendors" ON public.vendors;
CREATE POLICY "Allow anon insert vendors" ON public.vendors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update vendors" ON public.vendors;
CREATE POLICY "Allow anon update vendors" ON public.vendors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete vendors" ON public.vendors;
CREATE POLICY "Allow anon delete vendors" ON public.vendors FOR DELETE USING (true);

-- 2.2 Categories Policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert categories" ON public.categories;
CREATE POLICY "Allow anon insert categories" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update categories" ON public.categories;
CREATE POLICY "Allow anon update categories" ON public.categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete categories" ON public.categories;
CREATE POLICY "Allow anon delete categories" ON public.categories FOR DELETE USING (true);

-- 2.3 Products Policies
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
CREATE POLICY "Allow anon insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
CREATE POLICY "Allow anon update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;
CREATE POLICY "Allow anon delete products" ON public.products FOR DELETE USING (true);

-- 2.4 Orders Policies
DROP POLICY IF EXISTS "Allow anyone to create orders" ON public.orders;
CREATE POLICY "Allow anyone to create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update orders" ON public.orders;
CREATE POLICY "Allow anon update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete orders" ON public.orders;
CREATE POLICY "Allow anon delete orders" ON public.orders FOR DELETE USING (true);

-- 2.5 Site Banners Policies
DROP POLICY IF EXISTS "Allow public read site_banners" ON public.site_banners;
CREATE POLICY "Allow public read site_banners" ON public.site_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert site_banners" ON public.site_banners;
CREATE POLICY "Allow anon insert site_banners" ON public.site_banners FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update site_banners" ON public.site_banners;
CREATE POLICY "Allow anon update site_banners" ON public.site_banners FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete site_banners" ON public.site_banners;
CREATE POLICY "Allow anon delete site_banners" ON public.site_banners FOR DELETE USING (true);

-- ===================================================================
-- 3. SUPABASE STORAGE BUCKET & POLICIES
-- ===================================================================

-- Create public storage bucket 'products'
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for 'products' bucket
DROP POLICY IF EXISTS "Public bucket read" ON storage.objects;
CREATE POLICY "Public bucket read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
CREATE POLICY "Allow public image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public image updates" ON storage.objects;
CREATE POLICY "Allow public image updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public image deletes" ON storage.objects;
CREATE POLICY "Allow public image deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');

-- ===================================================================
-- 4. DEFAULT SEED DATA
-- ===================================================================

-- 4.1 Default Categories Seed (Main 4 Categories)
INSERT INTO public.categories (name, slug, description)
VALUES
  ('FULL SLEEVES', 'full-sleeves', 'Long sleeve tactical & lifestyle football kits.'),
  ('HALF SLEEVES', 'half-sleeves', 'Classic matchday & heritage half sleeve shirts.'),
  ('OVERSIZED T', 'oversized-t', 'Heavyweight boxy streetwear football jerseys.'),
  ('TSHIRTS', 'tshirts', 'Minimal football warmup & graphic lifestyle tees.')
ON CONFLICT (name) DO NOTHING;

-- 4.2 Default Site Banners & Category Covers Seed
INSERT INTO public.site_banners (id, title, subtitle, tagline, image_url, link_url, description, meta)
VALUES
  (
    'hero',
    E'ROAD\nTO\nGLORY',
    'FOOTBALL. CULTURE. IDENTITY.',
    'JERSEY HUT',
    '/images/hero.jpg',
    '/collections/half-sleeves',
    'Main homepage hero editorial banner',
    '{"season_tag": "SEASON 2026", "explore_text": "EXPLORE NOW", "shop_link": "/collections/full-sleeves", "shop_text": "SHOP JERSEYS"}'::jsonb
  ),
  (
    'cover_full_sleeves',
    'FULL SLEEVES',
    NULL,
    NULL,
    '/images/category-full-sleeves.jpg',
    '/collections/full-sleeves',
    'Long sleeve tactical & lifestyle football kits.',
    '{"category_id": "full-sleeves"}'::jsonb
  ),
  (
    'cover_half_sleeves',
    'HALF SLEEVES',
    NULL,
    NULL,
    '/images/category-half-sleeves.jpg',
    '/collections/half-sleeves',
    'Classic matchday & heritage half sleeve shirts.',
    '{"category_id": "half-sleeves"}'::jsonb
  ),
  (
    'cover_oversized',
    'OVERSIZED T',
    NULL,
    NULL,
    '/images/category-oversized.jpg',
    '/collections/oversized',
    'Heavyweight boxy streetwear football jerseys.',
    '{"category_id": "oversized-t"}'::jsonb
  ),
  (
    'cover_tshirts',
    'TSHIRTS',
    NULL,
    NULL,
    '/images/category-tshirts.jpg',
    '/collections/tshirts',
    'Minimal football warmup & graphic lifestyle tees.',
    '{"category_id": "tshirts"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
