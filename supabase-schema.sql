-- ===================================================================
-- JERSEY HUT — SUPABASE DATABASE SCHEMA & INITIAL DATA SEED
-- ===================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL,
  secondary_category TEXT,
  badge TEXT,
  color TEXT,
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', '2XL'],
  stock_per_size JSONB DEFAULT '{"S": 5, "M": 5, "L": 5, "XL": 5, "2XL": 5}'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::text[],
  player TEXT,
  team TEXT,
  country TEXT,
  edition TEXT,
  material TEXT,
  is_best_seller BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Orders Table
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
);

-- 3. Create Site Banners Table (For Hero and Category Cover Images)
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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Site Banners Policies
DROP POLICY IF EXISTS "Allow public read site_banners" ON public.site_banners;
CREATE POLICY "Allow public read site_banners" ON public.site_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert site_banners" ON public.site_banners;
CREATE POLICY "Allow anon insert site_banners" ON public.site_banners FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update site_banners" ON public.site_banners;
CREATE POLICY "Allow anon update site_banners" ON public.site_banners FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete site_banners" ON public.site_banners;
CREATE POLICY "Allow anon delete site_banners" ON public.site_banners FOR DELETE USING (true);

-- 4. Create RLS Policies for Products
-- Allow anyone to read active products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

-- Allow insert/update/delete for admin operations (anon key enabled for quick demo/admin access)
DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
CREATE POLICY "Allow anon insert products"
  ON public.products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
CREATE POLICY "Allow anon update products"
  ON public.products FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;
CREATE POLICY "Allow anon delete products"
  ON public.products FOR DELETE
  USING (true);

-- 5. Create RLS Policies for Orders
DROP POLICY IF EXISTS "Allow anyone to create orders" ON public.orders;
CREATE POLICY "Allow anyone to create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders"
  ON public.orders FOR SELECT
  USING (true);

-- 6. Storage Bucket Configuration for Product Images
-- Note: Make sure the 'products' bucket exists in your Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read of images
DROP POLICY IF EXISTS "Public bucket read" ON storage.objects;
CREATE POLICY "Public bucket read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Allow image uploads
DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
CREATE POLICY "Allow public image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

-- Allow image updates & deletions
DROP POLICY IF EXISTS "Allow public image updates" ON storage.objects;
CREATE POLICY "Allow public image updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public image deletes" ON storage.objects;
CREATE POLICY "Allow public image deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');

-- 7. Seed Initial Products Data
INSERT INTO public.products (
  id, name, price, original_price, category, secondary_category, badge, color,
  sizes, stock_per_size, images, player, team, country, edition, material,
  is_best_seller, featured, description
) VALUES
  ('7b1a68a8-727f-4e31-8ea6-898f9bd6813f', 'MBAPPE | FRANCE WC 26 HOME', 499, 899, 'HALF SLEEVES', 'BEST SELLERS', 'BEST SELLER', 'Blue', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":5,"M":8,"L":12,"XL":6,"2XL":3}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/7b1a68a8-727f-4e31-8ea6-898f9bd6813f/1786289581791_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/7b1a68a8-727f-4e31-8ea6-898f9bd6813f/1786289582511_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/7b1a68a8-727f-4e31-8ea6-898f9bd6813f/1786289583230_2.jpg'], 'MBAPPE', 'FRANCE', 'FRANCE', 'WORLD CUP 2026 HOME', 'DOTKNIT AERO-COOL', true, true, 'Official France World Cup 2026 home jersey featuring Kylian Mbappé''s iconic #10 styling. Crafted with micro-perforated breathable dotknit performance fabric tailored for matchday intensity and everyday streetwear aesthetics.'),
  ('d4f1d1dd-007e-478b-b8aa-b44fd8892c3e', 'MBAPPE | REAL MADRID 2025 - 26 AWAY', 499, 1099, 'FULL SLEEVES', 'BEST SELLERS', 'NEW', 'Orange / Blue', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":4,"M":6,"L":10,"XL":5,"2XL":2}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d4f1d1dd-007e-478b-b8aa-b44fd8892c3e/1786289584046_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d4f1d1dd-007e-478b-b8aa-b44fd8892c3e/1786289584744_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d4f1d1dd-007e-478b-b8aa-b44fd8892c3e/1786289585377_2.jpg'], 'MBAPPE', 'REAL MADRID', 'SPAIN', '2025 - 26 AWAY FULL SLEEVE', 'PREMIUM DRI-POLYMER', true, true, 'The long-awaited Real Madrid away kit with full sleeves. Engineered with premium ribbed cuffs, woven crest detailing, and moisture-wicking technology.'),
  ('f5eb2a6b-4765-4bd3-8fe2-afaf83da4d71', 'CR7 | PORTUGAL WC SPECIAL EDITION', 499, 1099, 'HALF SLEEVES', 'BEST SELLERS', 'NEW', 'White', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":6,"M":14,"L":20,"XL":8,"2XL":5}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/f5eb2a6b-4765-4bd3-8fe2-afaf83da4d71/1786289591927_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/f5eb2a6b-4765-4bd3-8fe2-afaf83da4d71/1786289592734_1.jpg'], 'CRISTIANO RONALDO', 'PORTUGAL', 'PORTUGAL', 'WORLD CUP SPECIAL COMMEMORATIVE', 'DOTKNIT ULTRA', true, true, 'Commemorative World Cup special kit celebrating the legendary Portugal #7. Clean white editorial silhouette accented with iconic Portuguese detailing.'),
  ('ed786f67-29b9-4f70-a1d0-66aeb7980eb2', 'KANE | BAYERN MUNICH 2026 - 27 HOME', 499, 1099, 'HALF SLEEVES', 'BEST SELLERS', 'NEW', 'Red', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":5,"M":9,"L":14,"XL":7,"2XL":4}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ed786f67-29b9-4f70-a1d0-66aeb7980eb2/1786289589062_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ed786f67-29b9-4f70-a1d0-66aeb7980eb2/1786289589679_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ed786f67-29b9-4f70-a1d0-66aeb7980eb2/1786289590399_2.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ed786f67-29b9-4f70-a1d0-66aeb7980eb2/1786289591112_3.jpg'], 'HARRY KANE', 'BAYERN MUNICH', 'GERMANY', '2026 - 27 HOME', 'DOTKNIT', true, true, 'Bavarian pride meets modern engineering. The latest Bayern Munich home edition with custom Harry Kane name and numbering.'),
  ('e7fd3830-94d7-49f5-96e6-d1fcb3766156', 'SAKA | ARSENAL 2026 - 27 AWAY', 499, 1099, 'HALF SLEEVES', NULL, 'NEW', 'Black / Red', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":7,"M":12,"L":15,"XL":9,"2XL":3}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/e7fd3830-94d7-49f5-96e6-d1fcb3766156/1786289587636_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/e7fd3830-94d7-49f5-96e6-d1fcb3766156/1786289588347_1.jpg'], 'BUKAYO SAKA', 'ARSENAL', 'ENGLAND', '2026 - 27 AWAY', 'DOTKNIT', false, true, 'The Gunners bold away statement kit. Ultra-sharp contrast piping, high ventilation panels, and Bukayo Saka''s signature #7 print.'),
  ('fd086da4-1eca-466f-a41e-0eb0acc7dc2a', 'CR7 | PORTUGAL 2016 EUROS FINAL HOME', 499, 1099, 'HALF SLEEVES', NULL, 'CLASSIC', 'Red', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":3,"M":8,"L":11,"XL":4,"2XL":2}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/fd086da4-1eca-466f-a41e-0eb0acc7dc2a/1786289586298_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/fd086da4-1eca-466f-a41e-0eb0acc7dc2a/1786289586912_1.jpg'], 'CRISTIANO RONALDO', 'PORTUGAL', 'PORTUGAL', 'EURO 2016 FINAL PARIS', 'VINTAGE AEROWEAVE', false, true, 'The historic kit from Portugal''s golden night in Paris. Classic deep crimson body with vibrant turquoise accents and European Champions legacy badge.'),
  ('c7b2ff7a-fdc7-47fd-b2c3-4786acc1c245', 'ARGENTINA | PRE MATCH KIT', 499, 1099, 'TSHIRTS', 'BEST SELLERS', 'NEW', 'Multi / Sun Yellow', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":47,"M":8,"L":2,"XL":7,"2XL":45}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/c7b2ff7a-fdc7-47fd-b2c3-4786acc1c245/1786289573397_0.jpg'], 'TEAM ARGENTINA', 'ARGENTINA', 'ARGENTINA', 'PRE MATCH WARMUP', 'LIGHTWEIGHT DOTKNIT', true, true, 'Bold warmup t-shirt worn before major international fixtures. Featuring dynamic geometric graphics, embroidered AFA 3-star badge, and relaxed casual fit.'),
  ('660e41ee-cc45-4386-9e79-b56396b9303c', 'MESSI | ARGENTINA VYPER EDITION', 499, 1099, 'OVERSIZED', 'BEST SELLERS', 'EXCLUSIVE', 'White / Albiceleste', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":2,"M":5,"L":3,"XL":4,"2XL":1}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/660e41ee-cc45-4386-9e79-b56396b9303c/1786289570568_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/660e41ee-cc45-4386-9e79-b56396b9303c/1786289571145_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/660e41ee-cc45-4386-9e79-b56396b9303c/1786289571858_2.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/660e41ee-cc45-4386-9e79-b56396b9303c/1786289572678_3.jpg'], 'LIONEL MESSI', 'ARGENTINA', 'ARGENTINA', 'VYPER STREETWEAR OVERSIZED', 'HEAVYWEIGHT COTTON-POLY BLEND', true, true, 'An oversized streetwear interpretation of the World Champions kit. Tailored with dropped shoulders, a wider boxy cut, and high-density chest typography.'),
  ('5829b963-ba08-493c-9b38-5ef854f206ea', 'CR7 | PORTUGAL PANTHER EDITION', 599, 1199, 'OVERSIZED', 'BEST SELLERS', 'LIMITED', 'Black / Crimson', ARRAY['M', 'L', 'XL'], '{"M":15,"L":8,"XL":4}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/5829b963-ba08-493c-9b38-5ef854f206ea/1786289541562_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/5829b963-ba08-493c-9b38-5ef854f206ea/1786289542372_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/5829b963-ba08-493c-9b38-5ef854f206ea/1786289543188_2.jpg'], 'CRISTIANO RONALDO', 'PORTUGAL', 'PORTUGAL', 'BLACK PANTHER SPECIAL CUT', 'MATTE JACQUARD KNIT', true, true, 'Street-inspired oversized silhouette with matte jacquard animal print weaving. Engineered for football purists who value high-fashion streetwear presentation.'),
  ('915a94c2-adca-4260-980a-a7e8ec7a195a', 'MEXICO | WORLD CUP 26 HOME', 499, 1099, 'HALF SLEEVES', NULL, 'NEW', 'Green', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":2,"M":2,"L":2,"XL":1,"2XL":2}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/915a94c2-adca-4260-980a-a7e8ec7a195a/1786289579743_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/915a94c2-adca-4260-980a-a7e8ec7a195a/1786289580360_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/915a94c2-adca-4260-980a-a7e8ec7a195a/1786289580977_2.jpg'], 'MEXICO SQUAD', 'MEXICO', 'MEXICO', 'WORLD CUP 2026 HOME', 'DOTKNIT', false, false, 'Aztec-inspired feather patterns woven seamlessly into rich forest green breathable fabric. The definitive North American World Cup home edition.'),
  ('3c6efff6-dbeb-4344-a04d-7cef683c4dc0', 'MESSI | BARCELONA 2017 - 2018 THIRD', 499, 899, 'HALF SLEEVES', NULL, 'HOT', 'Deep Maroon / Camo', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":5,"M":5,"L":4,"XL":5,"2XL":5}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/3c6efff6-dbeb-4344-a04d-7cef683c4dc0/1786289578205_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/3c6efff6-dbeb-4344-a04d-7cef683c4dc0/1786289578825_1.jpg'], 'LIONEL MESSI', 'FC BARCELONA', 'SPAIN', '2017 - 18 THIRD', 'VAPORMATCH POLYESTER', false, true, 'Rare and sought-after geometric camo third jersey from Messi''s mesmerizing 2017/18 domestic double-winning campaign in Catalonia.'),
  ('745e73cf-69d2-41d8-9b42-71d2b101fa17', 'MALDINI | ITALY TIRO SPECIAL', 599, 699, 'HALF SLEEVES', NULL, 'LEGEND', 'Azzurro / Green', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":2,"M":2,"L":1,"XL":0,"2XL":2}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/745e73cf-69d2-41d8-9b42-71d2b101fa17/1786289576260_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/745e73cf-69d2-41d8-9b42-71d2b101fa17/1786289576877_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/745e73cf-69d2-41d8-9b42-71d2b101fa17/1786289577510_2.jpg'], 'PAOLO MALDINI', 'ITALY', 'ITALY', 'TIRO SPECIAL EDITION', 'SILK-TOUCH DOTKNIT', false, false, 'Dedicated to the greatest defender the game has ever seen. Italian sartorial excellence meets football heritage in this limited Tiro collection kit.'),
  ('d1a34655-f5ae-48b5-b982-39a2dc89980d', 'GERRARD | LIVERPOOL 2006 - 2007 HOME', 599, 1099, 'HALF SLEEVES', NULL, 'RETRO', 'Liverpool Red', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":2,"M":1,"L":2,"XL":2,"2XL":0}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d1a34655-f5ae-48b5-b982-39a2dc89980d/1786289574318_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d1a34655-f5ae-48b5-b982-39a2dc89980d/1786289574931_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/d1a34655-f5ae-48b5-b982-39a2dc89980d/1786289575568_2.jpg'], 'STEVEN GERRARD', 'LIVERPOOL FC', 'ENGLAND', '2006 - 2007 ATHENS HOME', 'RETRO CLIMACOOL', false, false, 'The iconic Carlsberg kit worn during Liverpool''s unforgettable European campaign. Bold white polo collar, yellow Liverbird crest, and Gerrard #8 on the back.'),
  ('57341ebe-8019-4068-9e52-38c098f36ba0', 'SACHIN | INDIA WC 1999 HOME', 599, 1099, 'TSHIRTS', 'BEST SELLERS', 'LEGEND', 'Sky Blue / Yellow', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":2,"M":2,"L":2,"XL":2,"2XL":1}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/57341ebe-8019-4068-9e52-38c098f36ba0/1786289568377_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/57341ebe-8019-4068-9e52-38c098f36ba0/1786289569099_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/57341ebe-8019-4068-9e52-38c098f36ba0/1786289569811_2.jpg'], 'SACHIN TENDULKAR', 'INDIA', 'INDIA', '1999 VINTAGE STRIPES', 'TEXTURED COTTON PIQUE', true, true, 'The timeless 1999 diagonal black-yellow sash on sky blue kit. A crown jewel in Indian sports culture, built with premium breathable fabric.'),
  ('fe3a70ad-1364-4a88-a6c7-7b0c057399c4', 'GERMANY | WC 26 HOME PREMIUM', 499, 1099, 'HALF SLEEVES', NULL, 'NEW', 'White / Tricolor', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":1,"M":1,"L":0,"XL":0,"2XL":0}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/fe3a70ad-1364-4a88-a6c7-7b0c057399c4/1786289565921_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/fe3a70ad-1364-4a88-a6c7-7b0c057399c4/1786289566544_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/fe3a70ad-1364-4a88-a6c7-7b0c057399c4/1786289567557_2.jpg'], 'GERMANY TEAM', 'GERMANY', 'GERMANY', 'WORLD CUP 2026', 'DOTKNIT', false, false, 'Minimalist German precision. Modern optical gradient shoulders running black to red to gold over an immaculate matte white body.'),
  ('909b2a9a-534e-427a-9d95-e66c2c0cfc74', 'MESSI | ARGENTINA TRAINING KIT', 599, 1099, 'TSHIRTS', 'BEST SELLERS', 'NEW', 'White / Navy', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":5,"M":5,"L":4,"XL":5,"2XL":5}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/909b2a9a-534e-427a-9d95-e66c2c0cfc74/1786289539097_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/909b2a9a-534e-427a-9d95-e66c2c0cfc74/1786289539810_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/909b2a9a-534e-427a-9d95-e66c2c0cfc74/1786289540702_2.jpg'], 'LIONEL MESSI', 'ARGENTINA', 'ARGENTINA', 'EZEIZA TRAINING COMPLEX', 'PRO TECH TEE', true, true, 'Ultra-clean training silhouette worn during camp preparation. Streamlined cut with heat-applied AFA 3-star seal and gold Messi signature detail.'),
  ('e0c96d59-ba00-46b6-9154-67755c2e8f36', 'MESSI | ARGENTINA WC 26 HOME', 499, 999, 'HALF SLEEVES', NULL, 'PREMIUM', 'Sky Blue / White', ARRAY['M', 'L', 'XL', '2XL'], '{"M":5,"L":5,"XL":2,"2XL":1}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/e0c96d59-ba00-46b6-9154-67755c2e8f36/1786289543905_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/e0c96d59-ba00-46b6-9154-67755c2e8f36/1786289544520_1.jpg'], 'LIONEL MESSI', 'ARGENTINA', 'ARGENTINA', 'WORLD CUP 2026 TITLE DEFENSE', 'DOTKNIT', false, true, 'The definitive Albiceleste home kit for Messi''s title-defense campaign. 3 gold stars, Sol de Mayo sun crest at nape, and classic vertical stripes.'),
  ('60c3d5cb-697b-4af4-ba69-0b070ddf77e0', 'BECKHAM | MANCHESTER UNITED 1998 - 1999 HOME', 599, 1199, 'HALF SLEEVES', NULL, 'HOT', 'Manchester Red', ARRAY['S', 'M', 'L'], '{"S":3,"M":7,"L":5}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/60c3d5cb-697b-4af4-ba69-0b070ddf77e0/1786289561135_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/60c3d5cb-697b-4af4-ba69-0b070ddf77e0/1786289561825_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/60c3d5cb-697b-4af4-ba69-0b070ddf77e0/1786289562441_2.jpg'], 'DAVID BECKHAM', 'MANCHESTER UNITED', 'ENGLAND', 'TREBLE WINNERS 1999', 'HEAVYWEIGHT VINTAGE MESH', false, true, 'The holy grail of football shirts: the 1999 Treble-winning kit featuring David Beckham''s fabled #7, zippered collar, and Umbro diamond sleeves.'),
  ('76316edd-2bb7-4bae-bc14-2f689f8b705d', 'LAMINE YAMAL | SPAIN WC 26 AWAY', 499, 999, 'HALF SLEEVES', NULL, 'NEW', 'Pearl White / Solar Yellow', ARRAY['M', 'L', 'XL'], '{"M":15,"L":8,"XL":4}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/76316edd-2bb7-4bae-bc14-2f689f8b705d/1786289556803_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/76316edd-2bb7-4bae-bc14-2f689f8b705d/1786289557338_1.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/76316edd-2bb7-4bae-bc14-2f689f8b705d/1786289558037_2.jpg'], 'LAMINE YAMAL', 'SPAIN', 'SPAIN', 'WORLD CUP 2026 AWAY', 'DOTKNIT', false, true, 'The jersey of football''s next global superstar. Lamine Yamal''s electric Spain away kit with neon yellow accents and crisp pearl white fabric.'),
  ('771ff6f3-a9f1-4ba1-a34d-5b6ffb75c67d', 'NEYMAR | BRAZIL WC 26 HOME', 499, 999, 'HALF SLEEVES', NULL, 'CLASSIC', 'Canary Yellow', ARRAY['S', 'M', 'L', 'XL', '2XL'], '{"S":22,"M":22,"L":22,"XL":22,"2XL":22}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/771ff6f3-a9f1-4ba1-a34d-5b6ffb75c67d/1786289552712_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/771ff6f3-a9f1-4ba1-a34d-5b6ffb75c67d/1786289553429_1.jpg'], 'NEYMAR JR', 'BRAZIL', 'BRAZIL', 'WORLD CUP 2026 HOME', 'CANARINHO DOTKNIT', false, true, 'The iconic yellow of the Seleção. Modern tonal jaguar rosette embossing throughout the body, green collar trims, and Neymar Jr. #10.'),
  ('ff29ad3f-224d-45f2-92f6-cedc5478d455', 'OZIL | ARSENAL RETRO SPECIAL', 499, 999, 'HALF SLEEVES', NULL, 'PREMIUM', 'Black / Rose Gold', ARRAY['M', 'L', 'XL', '2XL'], '{"M":5,"L":5,"XL":2,"2XL":1}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ff29ad3f-224d-45f2-92f6-cedc5478d455/1786289559500_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/ff29ad3f-224d-45f2-92f6-cedc5478d455/1786289560188_1.jpg'], 'MESUT OZIL', 'ARSENAL', 'ENGLAND', 'NORTH LONDON RETRO', 'PREMIUM MATTE POLY', false, false, 'Sleek blackout kit with rose gold metallic foil branding honoring the assist maestro Mesut Özil. An understated aesthetic perfection.'),
  ('649db391-58f2-432d-aa6c-a1ae1f3fa5fe', 'PEDRI | SPAIN WC 26 AWAY', 499, 999, 'HALF SLEEVES', NULL, 'SALE', 'Navy / Turquoise', ARRAY['M', 'L'], '{"M":20,"L":15}'::jsonb, ARRAY['https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/649db391-58f2-432d-aa6c-a1ae1f3fa5fe/1786289545861_0.jpg', 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/649db391-58f2-432d-aa6c-a1ae1f3fa5fe/1786289546476_1.jpg'], 'PEDRI', 'SPAIN', 'SPAIN', 'WORLD CUP 2026 AWAY', 'DOTKNIT', false, false, 'Spain away match jersey bearing the #8 of midfield maestro Pedri. Featuring lightweight ventilation panels and comfortable athletic fit.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  category = EXCLUDED.category,
  secondary_category = EXCLUDED.secondary_category,
  badge = EXCLUDED.badge,
  color = EXCLUDED.color,
  sizes = EXCLUDED.sizes,
  stock_per_size = EXCLUDED.stock_per_size,
  images = EXCLUDED.images,
  player = EXCLUDED.player,
  team = EXCLUDED.team,
  country = EXCLUDED.country,
  edition = EXCLUDED.edition,
  material = EXCLUDED.material,
  is_best_seller = EXCLUDED.is_best_seller,
  featured = EXCLUDED.featured,
  description = EXCLUDED.description;
