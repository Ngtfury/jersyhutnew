'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductGrid from './ProductGrid';
import { getProducts } from '../lib/supabase';
import { Package } from 'lucide-react';

export default function BestSellers() {
  const [activeTab, setActiveTab] = useState("FULL SLEEVES");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setAllProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: "FULL SLEEVES", label: "FULL SLEEVES", filterCategory: "FULL SLEEVES" },
    { id: "HALF SLEEVES", label: "HALF SLEEVES", filterCategory: "HALF SLEEVES" },
    { id: "OVERSIZED T", label: "OVERSIZED T", filterCategory: "OVERSIZED" },
    { id: "TSHIRTS", label: "TSHIRTS", filterCategory: "TSHIRTS" },
  ];

  const filteredProducts = useMemo(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (!current) return [];
    return allProducts.filter(p => p.category === current.filterCategory);
  }, [activeTab, allProducts]);

  return (
    <section className="bestsellers-section new-popular-section" aria-label="New and Popular Kits">
      <div className="container">
        <div className="bestsellers-header new-popular-header">
          <h2 className="new-popular-title">NEW AND POPULAR</h2>
          
          <div className="bestsellers-tabs new-popular-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`box-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                id={`tab-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {tab.label}
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
