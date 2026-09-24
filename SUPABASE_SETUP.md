# Supabase Database & Storage Setup Guide — Jersey Hut

Complete instructions to connect your **Supabase Database** and **Supabase Storage Bucket** for image uploads and manage products through the **/admin** dashboard.

---

## 📋 Table of Contents
1. [Create Supabase Project](#1-create-supabase-project)
2. [Execute SQL Schema & Seed Data](#2-execute-sql-schema--seed-data)
3. [Verify Storage Bucket](#3-verify-storage-bucket)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Using the /admin Dashboard](#5-using-the-admin-dashboard)
6. [Deploying with Supabase on Vercel](#6-deploying-with-supabase-on-vercel)

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and log in or sign up.
2. Click **"New Project"**.
3. Fill in:
   - **Name**: `jerseyhut`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the region closest to your customers (e.g. `ap-south-1` Mumbai or `ap-southeast-1` Singapore).
4. Click **"Create new project"** and wait ~1 minute for setup to complete.

---

## 2. Execute SQL Schema & Seed Data

All tables, Row Level Security (RLS) policies, storage bucket rules, and initial 22-jersey seed data are provided in [`supabase-schema.sql`](./supabase-schema.sql).

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar (icon `>_`).
2. Click **"New Query"**.
3. Open [`supabase-schema.sql`](./supabase-schema.sql) in your project, copy the entire file contents, and paste them into the SQL Editor.
4. Click **"Run"** (or press `Ctrl + Enter`).
5. You should see `Success. No rows returned` or a row count confirmation.

### What This SQL Creates:
- **`public.products`**: Complete schema for jersey catalog (UUID, title, price, original_price, category, secondary_category, badge, color, sizes array, stock_per_size jsonb, images array, player, team, country, edition, material, is_best_seller, featured, description).
- **`public.orders`**: Complete schema for checkout and customer orders.
- **Row Level Security (RLS)**: Public read policies and authenticated/anon write policies.
- **Storage Bucket `products`**: Automatically initializes the bucket and sets public access policies.
- **22 Official Kits Seeded**: Instantly populates your database with all kits and their CDN images.

---

## 3. Verify Storage Bucket

1. In Supabase Dashboard, click on **Storage** in the left sidebar.
2. You will see the bucket named **`products`**.
3. Ensure **Public Bucket** is toggled **ON** (the SQL script already configures this).
4. Newly uploaded jersey images from `/admin` will be stored here in subfolders by product ID (`<productId>/<timestamp>_<filename>`).

---

## 4. Configure Environment Variables

1. In Supabase Dashboard, navigate to **Project Settings** (gear icon) > **API**.
2. Find the following keys:
   - **Project URL** (e.g. `https://your-project-id.supabase.co`)
   - **Project API Keys** -> `anon` `public` key
3. Open or create `.env.local` in your project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart your local dev server:
   ```bash
   npm run dev
   ```

---

## 5. Using the /admin Dashboard

Access the admin dashboard at:
👉 **[http://localhost:3000/admin](http://localhost:3000/admin)**

### Features:
1. **Manage Inventory Tab**:
   - Live grid view of all products with image, title, category, and price.
   - Live search by product name, category, or player.
   - Quick category filter tags (`ALL`, `BEST SELLERS`, `FULL SLEEVES`, `HALF SLEEVES`, `OVERSIZED`, `TSHIRTS`).
   - **Edit** button: Loads product details into the form for updates.
   - **Delete** button: Deletes product directly with prompt confirmation.
2. **Add New Product Tab**:
   - **Product Images**: Dashed `+ Upload` button uploads directly to your Supabase `products` bucket with thumbnail previews and remove button.
   - **Product Name**, **Current Price (Rs)**, **Original Price (Rs)**.
   - **Category Dropdown**: `BEST SELLERS`, `FULL SLEEVES`, `HALF SLEEVES`, `OVERSIZED`, `TSHIRTS`.
   - **Badge (Optional)**: `e.g. SAVE 28%`.
   - **Color (For AI Stylist)** dropdown.
   - **Inventory Stock & Availability**: Checkboxes and quantity inputs for sizes `S`, `M`, `L`, `XL`, `2XL`.
   - **Additional Details Accordion**: Player, Team, Edition, Material, and Description.
   - **Add / Update Product** button with loading indicator.

---

## 6. Deploying with Supabase on Vercel

When deploying to Vercel:
1. In your [Vercel Dashboard](https://vercel.com), select your project.
2. Go to **Settings** > **Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
4. Redeploy — your live site and `/admin` will now interact with your Supabase database globally!
