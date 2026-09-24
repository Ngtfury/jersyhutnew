'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '90vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ color: '#000' }}>HOME</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#000', fontWeight: 600 }}>ABOUT US</span>
        </div>

        {/* Hero Editorial Header */}
        <div style={{ maxWidth: '820px', marginBottom: '4.5rem' }}>
          <span className="heading-sub">JERSEY HUT MANIFESTO</span>
          <h1 className="heading-display" style={{ marginTop: '0.8rem', marginBottom: '1.5rem' }}>
            THE GAME IS MORE<br />
            THAN 90 MINUTES.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#333' }}>
            Jersey Hut is built for people who don’t just watch football — they live it. Every jersey represents a club, a player, a memory, a season, and a piece of football history.
          </p>
        </div>

        {/* Two Column Section: Imagery + Heritage */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(2rem, 5vw, 4.5rem)',
          alignItems: 'center',
          marginBottom: '5rem'
        }}>
          <div style={{ width: '100%', aspectRatio: '4/5', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
            <img
              src="/images/hero.jpg"
              alt="Jersey Hut Football Culture"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 className="heading-section">
              BRIDGING THE PITCH & THE STREETS
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555' }}>
              Founded out of a deep reverence for the beautiful game, Jersey Hut bridges European football fashion with India’s vibrant streetwear revolution. We realized that true football fans were tired of inflated prices, low-grade knockoffs, and limited availability.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555' }}>
              We obsessed over every detail: from sourcing high-density micro-dotknit polyester that wicks sweat during fierce summer five-a-side matches, to ensuring collar ribs and silicone crest badges withstand years of wear.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e5e5'
            }}>
              <div>
                <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', display: 'block' }}>50K+</strong>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777' }}>Jerseys Shipped</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', display: 'block' }}>4.9 / 5</strong>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777' }}>Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div style={{
          backgroundColor: '#f7f7f5',
          padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem)',
          marginBottom: '5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="heading-sub">OUR CORE COMMITMENT</span>
            <h2 className="heading-section" style={{ marginTop: '0.4rem' }}>ENGINEERED FOR THE FANS</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Award size={28} color="#000" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ARCHIVAL AUTHENTICITY
              </h3>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#666' }}>
                Every retro drop and new release accurately reproduces historic fonts, sponsor placements, and badge textures so you wear the history with pride.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <ShieldCheck size={28} color="#000" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                AFFORDABLE LUXURY
              </h3>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#666' }}>
                Premium football kits shouldn’t cost an arm and a leg. We deliver top-tier match and fan version garments directly to your doorstep at unmatched value.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Heart size={28} color="#000" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                COMMUNITY FIRST
              </h3>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#666' }}>
                From weekly screenings in Mumbai and Bengaluru to local tournament sponsorships, Jersey Hut reinvests in the grassroots heartbeat of Indian football.
              </p>
            </div>
          </div>
        </div>

        {/* CTA to Explore */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 className="heading-section" style={{ marginBottom: '1rem' }}>READY TO FIND YOUR KIT?</h2>
          <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Browse our full range of long sleeves, short sleeves, and limited oversized streetwear jerseys.
          </p>
          <Link
            href="/collections/half-sleeves"
            className="btn btn-primary"
            style={{ padding: '1rem 2.2rem' }}
          >
            EXPLORE THE STORE
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
