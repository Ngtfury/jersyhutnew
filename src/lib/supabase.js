import { createClient } from '@supabase/supabase-js';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slqlcbunigxchefasznq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Normalizes product data from Supabase snake_case to frontend camelCase
 */
export function normalizeProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    original_price: row.original_price ? Number(row.original_price) : undefined,
    category: row.category,
    secondaryCategory: row.secondary_category || row.secondaryCategory,
    badge: row.badge,
    color: row.color,
    sizes: row.sizes || ['S', 'M', 'L', 'XL', '2XL'],
    stock_per_size: row.stock_per_size || { S: 5, M: 5, L: 5, XL: 5, '2XL': 5 },
    images: Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : ['/images/placeholder-jersey.jpg'],
    player: row.player,
    team: row.team,
    country: row.country,
    edition: row.edition,
    material: row.material,
    isBestSeller: Boolean(row.is_best_seller ?? row.isBestSeller),
    featured: Boolean(row.featured),
    description: row.description || '',
    created_at: row.created_at,
  };
}

/**
 * Fetches all products. If Supabase is connected, queries public.products.
 * Otherwise gracefully returns the local mock/seed database.
 */
export async function getProducts() {
  if (!supabase) {
    return FALLBACK_PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query error, falling back to local dataset:', error.message);
      return FALLBACK_PRODUCTS;
    }

    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Uploads an image file to Supabase Storage bucket 'products'
 * Returns the public URL string
 */
export async function uploadProductImage(file, productId = 'general') {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${productId}/${Date.now()}_${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Adds a new product to Supabase
 */
export async function createProduct(productData) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  }

  const payload = {
    name: productData.name,
    price: Number(productData.price),
    original_price: productData.original_price ? Number(productData.original_price) : null,
    category: productData.category,
    secondary_category: productData.secondaryCategory || null,
    badge: productData.badge || null,
    color: productData.color || null,
    sizes: productData.sizes || ['S', 'M', 'L', 'XL', '2XL'],
    stock_per_size: productData.stock_per_size || {},
    images: productData.images || [],
    player: productData.player || null,
    team: productData.team || null,
    country: productData.country || null,
    edition: productData.edition || null,
    material: productData.material || null,
    is_best_seller: Boolean(productData.isBestSeller),
    featured: Boolean(productData.featured),
    description: productData.description || null,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data);
}

/**
 * Updates an existing product in Supabase
 */
export async function updateProduct(id, productData) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  }

  const payload = {
    name: productData.name,
    price: Number(productData.price),
    original_price: productData.original_price ? Number(productData.original_price) : null,
    category: productData.category,
    secondary_category: productData.secondaryCategory || null,
    badge: productData.badge || null,
    color: productData.color || null,
    sizes: productData.sizes || ['S', 'M', 'L', 'XL', '2XL'],
    stock_per_size: productData.stock_per_size || {},
    images: productData.images || [],
    player: productData.player || null,
    team: productData.team || null,
    country: productData.country || null,
    edition: productData.edition || null,
    material: productData.material || null,
    is_best_seller: Boolean(productData.isBestSeller),
    featured: Boolean(productData.featured),
    description: productData.description || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data);
}

/**
 * Deletes a product from Supabase
 */
export async function deleteProduct(id) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * ===================================================================
 * SITE BANNERS & COVER IMAGES (HOME HERO & CATEGORY COVERS)
 * ===================================================================
 */

export const DEFAULT_HERO_BANNER = {
  id: 'hero',
  image_url: '/images/hero.jpg',
  brand_tag: 'JERSEY HUT',
  season_tag: 'SEASON 2026',
  title: 'ROAD\nTO\nGLORY',
  subtitle: 'FOOTBALL. CULTURE. IDENTITY.',
  explore_link: '/collections/half-sleeves',
  explore_text: 'EXPLORE NOW',
  shop_link: '/collections/full-sleeves',
  shop_text: 'SHOP JERSEYS',
};

export const DEFAULT_CATEGORY_COVERS = [
  {
    id: 'cover_full_sleeves',
    category_id: 'full-sleeves',
    name: 'FULL SLEEVES',
    path: '/collections/full-sleeves',
    image_url: '/images/category-full-sleeves.jpg',
    description: 'Long sleeve tactical & lifestyle football kits.',
  },
  {
    id: 'cover_half_sleeves',
    category_id: 'half-sleeves',
    name: 'HALF SLEEVES',
    path: '/collections/half-sleeves',
    image_url: '/images/category-half-sleeves.jpg',
    description: 'Classic matchday & heritage half sleeve shirts.',
  },
  {
    id: 'cover_oversized',
    category_id: 'oversized',
    name: 'OVERSIZED',
    path: '/collections/oversized',
    image_url: 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/5829b963-ba08-493c-9b38-5ef854f206ea/1786289541562_0.jpg',
    description: 'Heavyweight boxy streetwear football jerseys.',
  },
  {
    id: 'cover_tshirts',
    category_id: 'tshirts',
    name: 'TSHIRTS',
    path: '/collections/tshirts',
    image_url: 'https://jleqlgqxheygghnrluvc.supabase.co/storage/v1/object/public/products/c7b2ff7a-fdc7-47fd-b2c3-4786acc1c245/1786289573397_0.jpg',
    description: 'Minimal football warmup & graphic lifestyle tees.',
  },
];

export async function uploadBannerImage(file, bannerKey = 'hero') {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `banners/${bannerKey}_${Date.now()}_${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function getHeroBanner() {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('jerseyhut_hero_banner');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
  }

  if (!supabase) return DEFAULT_HERO_BANNER;

  try {
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('id', 'hero')
      .maybeSingle();

    if (!error && data) {
      const banner = {
        id: data.id,
        image_url: data.image_url || DEFAULT_HERO_BANNER.image_url,
        brand_tag: data.tagline || DEFAULT_HERO_BANNER.brand_tag,
        season_tag: data.meta?.season_tag || DEFAULT_HERO_BANNER.season_tag,
        title: data.title || DEFAULT_HERO_BANNER.title,
        subtitle: data.subtitle || DEFAULT_HERO_BANNER.subtitle,
        explore_link: data.link_url || DEFAULT_HERO_BANNER.explore_link,
        explore_text: data.meta?.explore_text || DEFAULT_HERO_BANNER.explore_text,
        shop_link: data.meta?.shop_link || DEFAULT_HERO_BANNER.shop_link,
        shop_text: data.meta?.shop_text || DEFAULT_HERO_BANNER.shop_text,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('jerseyhut_hero_banner', JSON.stringify(banner));
      }
      return banner;
    }
  } catch (err) {
    console.warn('Could not fetch hero banner from Supabase:', err);
  }

  return DEFAULT_HERO_BANNER;
}

export async function saveHeroBanner(bannerData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jerseyhut_hero_banner', JSON.stringify(bannerData));
  }

  if (!supabase) return bannerData;

  const payload = {
    id: 'hero',
    title: bannerData.title,
    subtitle: bannerData.subtitle,
    tagline: bannerData.brand_tag,
    image_url: bannerData.image_url,
    link_url: bannerData.explore_link,
    meta: {
      season_tag: bannerData.season_tag,
      explore_text: bannerData.explore_text,
      shop_link: bannerData.shop_link,
      shop_text: bannerData.shop_text,
    },
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('site_banners')
      .upsert(payload);

    if (error) {
      console.warn('Notice: site_banners table may not be created yet in Supabase. Stored locally.', error.message);
    }
  } catch (err) {
    console.warn('Save hero banner error:', err);
  }

  return bannerData;
}

export async function getCategoryCovers() {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('jerseyhut_category_covers');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
  }

  if (!supabase) return DEFAULT_CATEGORY_COVERS;

  try {
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .like('id', 'cover_%');

    if (!error && data && data.length > 0) {
      const merged = DEFAULT_CATEGORY_COVERS.map(def => {
        const found = data.find(d => d.id === def.id);
        if (!found) return def;
        return {
          ...def,
          image_url: found.image_url || def.image_url,
          name: found.title || def.name,
          description: found.description || def.description,
          path: found.link_url || def.path,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('jerseyhut_category_covers', JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch category covers from Supabase:', err);
  }

  return DEFAULT_CATEGORY_COVERS;
}

export async function saveCategoryCovers(covers) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jerseyhut_category_covers', JSON.stringify(covers));
  }

  if (!supabase) return covers;

  const payloads = covers.map(c => ({
    id: c.id,
    title: c.name,
    description: c.description,
    image_url: c.image_url,
    link_url: c.path,
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await supabase
      .from('site_banners')
      .upsert(payloads);

    if (error) {
      console.warn('Notice: site_banners table may not be created yet in Supabase. Stored locally.', error.message);
    }
  } catch (err) {
    console.warn('Save category covers error:', err);
  }

  return covers;
}
