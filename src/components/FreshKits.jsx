'use client';

import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FreshKits() {
  const scrollRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProducts().then(data => {
      setAllProducts(Array.isArray(data) ? data : []);
      setLoaded(true);
    }).catch(err => {
      console.error(err);
      setLoaded(true);
    });
  }, []);

  const freshKits = allProducts.filter(p => p.featured || p.badge === 'NEW').slice(0, 8);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If products are loaded and there are no fresh kits, don't show the empty section
  if (loaded && freshKits.length === 0) {
    return null;
  }

  if (!loaded && allProducts.length === 0) {
    return null;
  }

  return (
    <section className="freshkits-section" aria-label="Fresh Kits">
      <div className="container">
        <div className="freshkits-header">
          <div>
            <span className="heading-sub">CURATED DROPS</span>
            <h2 className="heading-section" style={{ marginTop: '0.4rem' }}>FRESH KITS</h2>
          </div>

          <div className="carousel-scroll-controls">
            <button
              onClick={() => scroll('left')}
              className="scroll-ctrl-btn"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="scroll-ctrl-btn"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="freshkits-carousel" ref={scrollRef}>
          {freshKits.map((product) => (
            <div key={product.id} className="carousel-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
