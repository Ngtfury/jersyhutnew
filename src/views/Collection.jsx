'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { getProducts } from '../lib/supabase';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function Collection({ categorySlug }) {
  const [allProducts, setAllProducts] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterPlayer, setFilterPlayer] = useState('all');

  useEffect(() => {
    getProducts().then(data => {
      setAllProducts(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  // Match category slug to title and category data
  const collectionInfo = useMemo(() => {
    switch (categorySlug) {
      case 'full-sleeves':
        return {
          title: "FULL SLEEVES",
          categoryName: "FULL SLEEVES",
          description: "Long sleeve football kits crafted for supreme seasonal comfort and sleek terrace aesthetics."
        };
      case 'oversized':
      case 'oversized-t':
        return {
          title: "OVERSIZED T",
          categoryName: "OVERSIZED T",
          description: "Contemporary boxy streetwear cuts with heavyweight fabric and dropped shoulder tailoring."
        };
      case 'tshirts':
        return {
          title: "TSHIRTS",
          categoryName: "TSHIRTS",
          description: "Minimalist football graphic tees and lightweight warmup shirts."
        };
      case 'half-sleeves':
        return {
          title: "HALF SLEEVES",
          categoryName: "HALF SLEEVES",
          description: "Classic matchday half sleeve jerseys celebrating the greatest clubs, players, and tournaments."
        };
      default: {
        const formatted = categorySlug ? categorySlug.replace(/-/g, ' ').toUpperCase() : 'JERSEYS';
        return {
          title: formatted,
          categoryName: formatted,
          description: `Curated ${formatted} edition kits from Jersey Hut.`
        };
      }
    }
  }, [categorySlug]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter(p => {
      if (collectionInfo.categoryName === 'OVERSIZED T') {
        return p.category === 'OVERSIZED T' || p.category === 'OVERSIZED';
      }
      return p.category === collectionInfo.categoryName || 
             p.category?.toLowerCase() === collectionInfo.categoryName?.toLowerCase();
    });

    if (list.length === 0) {
      list = allProducts.filter(p => p.secondaryCategory === collectionInfo.categoryName);
    }

    if (filterAvailability === 'in_stock') {
      list = list.filter(p => {
        if (!p.stock_per_size) return true;
        const totalStock = Object.values(p.stock_per_size).reduce((a, b) => a + b, 0);
        return totalStock > 0;
      });
    }

    if (filterPrice === 'under_500') {
      list = list.filter(p => p.price <= 500);
    } else if (filterPrice === 'above_500') {
      list = list.filter(p => p.price > 500);
    }

    if (filterPlayer !== 'all') {
      list = list.filter(p => p.player && p.player.toLowerCase().includes(filterPlayer.toLowerCase()));
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [allProducts, collectionInfo, filterAvailability, filterPrice, filterPlayer, sortBy]);

  // Unique players in this collection
  const availablePlayers = useMemo(() => {
    const players = new Set();
    allProducts.filter(p => p.category === collectionInfo.categoryName).forEach(p => {
      if (p.player) players.add(p.player);
    });
    return Array.from(players);
  }, [allProducts, collectionInfo]);

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '1.2rem' }}>
          <Link href="/" style={{ color: '#000' }}>HOME</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>COLLECTIONS</span>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#000', fontWeight: 600 }}>{collectionInfo.title}</span>
        </div>

        {/* Title & Description */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="heading-section" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '0.6rem' }}>
            {collectionInfo.title}
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem', maxWidth: '600px', lineHeight: 1.6 }}>
            {collectionInfo.description}
          </p>
        </div>

        {/* Minimalist Filter & Sort Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 0',
          borderTop: '1px solid #e5e5e5',
          borderBottom: '1px solid #e5e5e5',
          marginBottom: '2.5rem'
        }}>
          {/* Left Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
            {/* Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Stock:</span>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock Only</option>
              </select>
            </div>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Price:</span>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Prices</option>
                <option value="under_500">₹499 & Under</option>
                <option value="above_500">Above ₹500</option>
              </select>
            </div>

            {/* Player Filter if multiple */}
            {availablePlayers.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>Player:</span>
                <select
                  value={filterPlayer}
                  onChange={(e) => setFilterPlayer(e.target.value)}
                  style={{
                    border: '1px solid #e0e0e0',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Players</option>
                  {availablePlayers.map(player => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Item Count & Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#666', letterSpacing: '0.08em' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'kit' : 'kits'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
        />
      </div>
    </main>
  );
}
