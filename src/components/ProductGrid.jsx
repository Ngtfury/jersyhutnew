'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#888' }}>
        <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
          No jerseys found in this collection.
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
