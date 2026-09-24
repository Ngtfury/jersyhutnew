'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getHeroBanner, DEFAULT_HERO_BANNER } from '../lib/supabase';

export default function Hero() {
  const [banner, setBanner] = useState(DEFAULT_HERO_BANNER);

  useEffect(() => {
    getHeroBanner().then(data => {
      if (data) setBanner(data);
    }).catch(console.error);
  }, []);

  return (
    <section className="hero-section" aria-label="Hero Campaign">
      <div className="hero-background-wrapper">
        <img
          src={banner.image_url || '/images/hero.jpg'}
          alt={banner.title || "Jersey Hut Football Fashion Campaign"}
          className="hero-image"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-text-block">
          <div className="hero-brand-tag">
            <span>{banner.brand_tag || 'JERSEY HUT'}</span>
            <span style={{ width: 6, height: 6, backgroundColor: '#e5ff00' }}></span>
            <span>{banner.season_tag || 'SEASON 2026'}</span>
          </div>

          <h1 className="hero-title" style={{ whiteSpace: 'pre-line' }}>
            {banner.title || 'ROAD TO GLORY'}
          </h1>

          <p className="hero-subtitle">
            {banner.subtitle || 'FOOTBALL. CULTURE. IDENTITY.'}
          </p>

          <div className="hero-divider" />

          <div className="hero-actions">
            <Link
              href={banner.explore_link || '/collections/half-sleeves'}
              className="btn btn-primary"
              id="hero-explore-btn"
            >
              {banner.explore_text || 'EXPLORE NOW'}
              <ArrowRight size={14} />
            </Link>
            <Link
              href={banner.shop_link || '/collections/full-sleeves'}
              className="btn btn-secondary"
              id="hero-shop-jerseys-btn"
            >
              {banner.shop_text || 'SHOP JERSEYS'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
