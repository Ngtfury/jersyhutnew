'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return (
    <section className="brand-story-section" aria-label="Brand Story">
      <div className="container">
        <div className="brand-story-grid">
          <div className="brand-story-content">
            <span className="heading-sub">OUR MANIFESTO</span>
            <h2 className="brand-story-title">
              THE GAME IS MORE<br />
              THAN 90 MINUTES.
            </h2>
            <p className="brand-story-text">
              Jersey Hut is built for people who don’t just watch football — they live it.
              Every jersey represents a club, a player, a memory, an iconic season, and a living piece of football history.
            </p>
            <p className="brand-story-text" style={{ marginTop: '-0.5rem' }}>
              We merge authentic sports culture with international streetwear sensibilities, engineering durable, breathable fabrics that honor the sport's greatest traditions while redefining modern casual style.
            </p>
            <Link
              href="/pages/about-us"
              className="btn-underline"
              id="brand-story-about-cta"
            >
              ABOUT JERSEY HUT
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="brand-story-image-box">
            <img
              src="/images/category-half-sleeves.jpg"
              alt="Jersey Hut Football Lifestyle"
              className="brand-story-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
