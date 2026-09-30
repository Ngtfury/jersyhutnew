'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function EditorialBanner() {
  return (
    <section className="editorial-banner-section" aria-label="Editorial Campaign Banner">
      <img
        src="/images/editorial-banner.jpg"
        alt="Jersey Hut Football Heritage"
        className="editorial-banner-img"
        loading="lazy"
      />
      <div className="editorial-banner-overlay" />

      <div className="editorial-banner-content">
        <span className="editorial-banner-tag">LIMITED ARCHIVE EDITION</span>
        <h2 className="editorial-banner-title">
          EVERY JERSEY<br />
          HAS A STORY.
        </h2>
        <p className="editorial-banner-desc">
          Crafted for the stadium terraces, styled for modern city life. Uncompromising quality meets pure football heritage.
        </p>
        <Link
          href="/collections/half-sleeves"
          className="btn btn-white"
          style={{ marginTop: '0.8rem' }}
          id="editorial-banner-cta"
        >
          SHOP THE ARCHIVE
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
