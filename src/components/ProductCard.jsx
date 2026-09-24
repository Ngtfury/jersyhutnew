'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
    addToCart(product, defaultSize, 1);
  };

  const hasSecondImage = product.images && product.images.length > 1;

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card"
      id={`product-card-${product.id}`}
    >
      <div className="product-image-box">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />

        {hasSecondImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="product-img-secondary"
            loading="lazy"
          />
        )}

        <button
          onClick={handleQuickAdd}
          className="quick-add-btn"
          aria-label={`Quick add ${product.name} to cart`}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingBag size={13} /> QUICK ADD
          </span>
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>
        <div className="product-prices">
          <span className="current-price">₹{product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="original-price">₹{product.original_price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
