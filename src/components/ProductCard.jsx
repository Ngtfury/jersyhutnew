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

  const displayTeam = product.team?.trim() || product.country?.trim() || (() => {
    const name = product.name || '';
    const knownClubs = [
      'Real Madrid', 'Barcelona', 'Barca', 'Manchester United', 'Man United',
      'Manchester City', 'Man City', 'Arsenal', 'Chelsea', 'Liverpool',
      'Bayern Munich', 'Bayern', 'PSG', 'Juventus', 'AC Milan', 'Inter Milan',
      'Borussia Dortmund', 'Dortmund', 'Atletico Madrid', 'Tottenham', 'Ajax',
      'Portugal', 'Argentina', 'Brazil', 'France', 'Germany', 'Spain', 'England'
    ];
    for (const club of knownClubs) {
      if (new RegExp(`\\b${club}\\b`, 'i').test(name)) return club;
    }
    return null;
  })();

  const hasSecondImage = product.images && product.images.length > 1;

  const metaItems = [
    displayTeam,
    product.year,
    product.kit_type === 'HOME' ? 'HOME' : product.kit_type === 'AWAY' ? 'AWAY' : product.kit_type === 'THIRD' ? 'THIRD' : product.kit_type === 'FOURTH' ? 'FOURTH' : product.kit_type
  ].filter(Boolean);

  const mainImage = product.images?.[0] || '/images/placeholder-jersey.jpg';

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
          src={mainImage}
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
        {metaItems.length > 0 && (
          <span style={{ fontSize: '0.6875rem', color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
            {metaItems.join(' • ')}
          </span>
        )}
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
