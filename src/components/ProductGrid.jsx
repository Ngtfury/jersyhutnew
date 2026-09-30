'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#71717a' }}>
        <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 600, color: '#18181b', marginBottom: '0.4rem' }}>
          No jerseys found
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>
          Check back soon for new club and national team kit drops.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
