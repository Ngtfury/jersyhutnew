'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductGrid from './ProductGrid';
import { getProducts, getCategories, DEFAULT_CATEGORIES } from '../lib/supabase';
import { Package } from 'lucide-react';

export default function BestSellers() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState("FULL SLEEVES");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setAllProducts(Array.isArray(prods) ? prods : []);
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.addEventListener('jerseyhut_categories_updated', fetchData);
    window.addEventListener('storage', fetchData);

    return () => {
      window.removeEventListener('jerseyhut_categories_updated', fetchData);
      window.removeEventListener('storage', fetchData);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeTab) return [];
    return allProducts.filter(p => {
      if (activeTab === "OVERSIZED T") {
        return p.category === "OVERSIZED T" || p.category === "OVERSIZED";
      }
      return p.category === activeTab || p.category?.toUpperCase() === activeTab?.toUpperCase();
    });
  }, [activeTab, allProducts]);

  return (
    <section className="bestsellers-section new-popular-section" aria-label="New and Popular Kits">
      <div className="container">
        <div className="bestsellers-header new-popular-header">
          <h2 className="new-popular-title">NEW AND POPULAR</h2>
          
          <div className="bestsellers-tabs new-popular-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id || cat.name}
                role="tab"
                aria-selected={activeTab === cat.name}
                onClick={() => setActiveTab(cat.name)}
                className={`box-tab-btn ${activeTab === cat.name ? 'active' : ''}`}
                id={`tab-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ minHeight: '120px' }}>
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#71717a' }}>
              <Package size={36} color="#a1a1aa" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700, color: '#000000', marginBottom: '0.4rem' }}>
                No kits added in {activeTab}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888888', maxWidth: '380px', margin: '0 auto' }}>
                Your database is connected and empty. Add new jerseys in the <Link href="/admin" style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}>Admin Dashboard</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
