'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../context/SearchContext';
import { Search, X } from 'lucide-react';

export default function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, searchQuery, setSearchQuery, searchResults, closeSearch } = useSearch();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const popularSearches = [
    "Messi",
    "Ronaldo",
    "Mbappe",
    "Real Madrid",
    "Barcelona",
    "Argentina",
    "Full Sleeves",
    "Oversized",
    "Arsenal"
  ];

  const handleProductClick = (productId) => {
    closeSearch();
    router.push(`/product/${productId}`);
  };

  return (
    <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div className="search-header">
        <Search size={24} style={{ color: 'rgba(255,255,255,0.7)' }} />
        <input
          ref={inputRef}
          type="text"
          className="search-input-field"
          placeholder="SEARCH PLAYERS, CLUBS, NATIONS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search query"
        />
        <button
          onClick={closeSearch}
          style={{ color: '#fff', padding: '0.5rem', cursor: 'pointer' }}
          aria-label="Close search"
        >
          <X size={24} />
        </button>
      </div>

      <div className="search-results-box">
        {searchQuery.trim() === '' ? (
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>
              POPULAR SEARCHES
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '1.25rem' }}>
              {searchResults.length} {searchResults.length === 1 ? 'RESULT' : 'RESULTS'} FOR "{searchQuery.toUpperCase()}"
            </span>
            <div className="search-results-grid">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <div style={{ width: '100%', aspectRatio: '4/5', backgroundColor: '#111', overflow: 'hidden' }}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>
                      {product.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.78rem' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>₹{product.price}</span>
                      {product.original_price && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                          ₹{product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.5)' }}>
            <p style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              No kits matching "{searchQuery}". Try searching "Messi", "Portugal", "Full Sleeves", or "Madrid".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
