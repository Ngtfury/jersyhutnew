'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../lib/supabase';
import { SlidersHorizontal, ChevronDown, X, Shield, Calendar, Sparkles } from 'lucide-react';

export default function Collection({ categorySlug }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting and core filters
  const [sortBy, setSortBy] = useState('featured');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterPlayer, setFilterPlayer] = useState('all');

  // Spec filters from query params
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterKitType, setFilterKitType] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');

  // Load products from Supabase
  useEffect(() => {
    setLoading(true);
    getProducts()
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync state with URL search params
  useEffect(() => {
    if (!searchParams) return;
    setFilterTeam(searchParams.get('team') || 'all');
    setFilterYear(searchParams.get('year') || 'all');
    setFilterKitType(searchParams.get('kit_type') || 'all');
    setFilterVersion(searchParams.get('version') || 'all');
  }, [searchParams]);

  // Helper to update URL search params
  const updateQueryParam = (key, value) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const clearSpecFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('team');
    params.delete('year');
    params.delete('kit_type');
    params.delete('version');
    const query = params.toString() ? `?${params.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
    setFilterTeam('all');
    setFilterYear('all');
    setFilterKitType('all');
    setFilterVersion('all');
  };

  // Derive unique spec options from current database products
  const availableTeams = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => {
      if (p.team?.trim()) set.add(p.team.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const availableYears = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => {
      if (p.year?.trim()) set.add(p.year.trim());
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allProducts]);

  const availableKitTypes = useMemo(() => [
    { id: 'HOME', label: 'Home Kit' },
    { id: 'AWAY', label: 'Away Kit' },
    { id: 'THIRD', label: 'Third Kit' },
    { id: 'SPECIAL', label: 'Special Edition' },
  ], []);

  const availableVersions = useMemo(() => [
    'MASTER QUALITY',
    'SUBLIMATION',
    'EMBROIDERY',
    'PLAYER VERSION'
  ], []);

  // Match category slug to title and description, taking spec filters into account
  const collectionInfo = useMemo(() => {
    const isAll = !categorySlug || categorySlug === 'all';

    // If specific team filter is active:
    if (filterTeam !== 'all') {
      return {
        title: `${filterTeam.toUpperCase()} JERSEYS`,
        categoryName: isAll ? 'ALL' : categorySlug.replace(/-/g, ' ').toUpperCase(),
        description: `Explore authentic match shirts, heritage kits, and lifestyle apparel for ${filterTeam}.`
      };
    }

    // If specific year filter is active:
    if (filterYear !== 'all') {
      return {
        title: `${filterYear.toUpperCase()} SEASON JERSEYS`,
        categoryName: isAll ? 'ALL' : categorySlug.replace(/-/g, ' ').toUpperCase(),
        description: `Official football kits and shirts from the ${filterYear} football season.`
      };
    }

    // If specific kit type is active:
    if (filterKitType !== 'all') {
      const label = filterKitType === 'HOME' ? 'HOME KITS' : filterKitType === 'AWAY' ? 'AWAY KITS' : `${filterKitType.toUpperCase()} KITS`;
      return {
        title: label,
        categoryName: isAll ? 'ALL' : categorySlug.replace(/-/g, ' ').toUpperCase(),
        description: `Browse all official ${filterKitType.toLowerCase()} matchday shirts and player kits.`
      };
    }

    // If specific quality version is active:
    if (filterVersion !== 'all') {
      return {
        title: `${filterVersion.toUpperCase()} EDITION`,
        categoryName: isAll ? 'ALL' : categorySlug.replace(/-/g, ' ').toUpperCase(),
        description: `High-performance football jerseys crafted in premium ${filterVersion} standard.`
      };
    }

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
      case 'all':
      case undefined:
        return {
          title: "ALL JERSEYS & ARCHIVE",
          categoryName: "ALL",
          description: "Explore our complete archive of authentic club & international kits, retro grails, and streetwear silhouettes."
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
  }, [categorySlug, filterTeam, filterYear, filterKitType, filterVersion]);

  // Filter products by category AND specs
  const filteredProducts = useMemo(() => {
    const isAll = !categorySlug || categorySlug === 'all';
    let list = isAll ? [...allProducts] : allProducts.filter(p => {
      if (collectionInfo.categoryName === 'OVERSIZED T') {
        return p.category === 'OVERSIZED T' || p.category === 'OVERSIZED';
      }
      return p.category === collectionInfo.categoryName || 
             p.category?.toLowerCase() === collectionInfo.categoryName?.toLowerCase() ||
             p.secondaryCategory === collectionInfo.categoryName;
    });

    // Team Filter
    if (filterTeam !== 'all') {
      const q = filterTeam.toLowerCase().trim();
      list = list.filter(p => {
        const matchTeam = p.team && p.team.toLowerCase().includes(q);
        const matchName = p.name && p.name.toLowerCase().includes(q);
        const matchCountry = p.country && p.country.toLowerCase().includes(q);
        return matchTeam || matchName || matchCountry;
      });
    }

    // Year Filter
    if (filterYear !== 'all') {
      const q = filterYear.toLowerCase().trim();
      list = list.filter(p => {
        const matchYear = p.year && p.year.toLowerCase().includes(q);
        const matchName = p.name && p.name.toLowerCase().includes(q);
        return matchYear || matchName;
      });
    }

    // Kit Type Filter
    if (filterKitType !== 'all') {
      const target = filterKitType.toUpperCase();
      list = list.filter(p => {
        const kt = (p.kit_type || p.kitType || '').toUpperCase();
        if (target === 'HOME') return kt.includes('HOME') || (!kt && p.name?.toLowerCase().includes('home'));
        if (target === 'AWAY') return kt.includes('AWAY') || (!kt && p.name?.toLowerCase().includes('away'));
        if (target === 'THIRD') return kt.includes('THIRD') || (!kt && p.name?.toLowerCase().includes('third'));
        if (target === 'SPECIAL') return kt.includes('SPECIAL') || (!kt && p.name?.toLowerCase().includes('special'));
        return kt === target;
      });
    }

    // Quality / Version Filter
    if (filterVersion !== 'all') {
      const target = filterVersion.toUpperCase();
      list = list.filter(p => {
        const v = (p.version || '').toUpperCase();
        return v.includes(target) || target.includes(v) || (!v && p.name?.toLowerCase().includes(target.toLowerCase()));
      });
    }

    // Availability Filter
    if (filterAvailability === 'in_stock') {
      list = list.filter(p => {
        if (!p.stock_per_size) return true;
        const totalStock = Object.values(p.stock_per_size).reduce((a, b) => a + b, 0);
        return totalStock > 0;
      });
    }

    // Price Filter
    if (filterPrice === 'under_500') {
      list = list.filter(p => p.price <= 500);
    } else if (filterPrice === 'above_500') {
      list = list.filter(p => p.price > 500);
    }

    // Player Filter
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
  }, [allProducts, categorySlug, collectionInfo, filterTeam, filterYear, filterKitType, filterVersion, filterAvailability, filterPrice, filterPlayer, sortBy]);

  // Unique players in this collection
  const availablePlayers = useMemo(() => {
    const players = new Set();
    allProducts.forEach(p => {
      if (p.player?.trim()) players.add(p.player.trim());
    });
    return Array.from(players);
  }, [allProducts]);

  const hasActiveFilters = filterTeam !== 'all' || filterYear !== 'all' || filterKitType !== 'all' || filterVersion !== 'all';

  const filterPillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease'
  };

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '1.2rem' }}>
          <Link href="/" style={{ color: '#000' }}>HOME</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/collections/all" style={{ color: '#000' }}>COLLECTIONS</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#000', fontWeight: 600 }}>{collectionInfo.title}</span>
        </div>

        {/* Title & Description */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="heading-section" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '0.6rem' }}>
            {collectionInfo.title}
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem', maxWidth: '650px', lineHeight: 1.6 }}>
            {collectionInfo.description}
          </p>
        </div>

        {/* Active Spec Filters Bar */}
        {hasActiveFilters && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#f8f8f8',
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444' }}>
              APPLIED FILTERS:
            </span>

            {filterTeam !== 'all' && (
              <button
                onClick={() => { setFilterTeam('all'); updateQueryParam('team', null); }}
                style={filterPillStyle}
                title="Remove team filter"
              >
                <Shield size={11} /> TEAM: {filterTeam} <X size={12} />
              </button>
            )}

            {filterYear !== 'all' && (
              <button
                onClick={() => { setFilterYear('all'); updateQueryParam('year', null); }}
                style={filterPillStyle}
                title="Remove year filter"
              >
                <Calendar size={11} /> YEAR: {filterYear} <X size={12} />
              </button>
            )}

            {filterKitType !== 'all' && (
              <button
                onClick={() => { setFilterKitType('all'); updateQueryParam('kit_type', null); }}
                style={filterPillStyle}
                title="Remove kit type filter"
              >
                KIT: {filterKitType} <X size={12} />
              </button>
            )}

            {filterVersion !== 'all' && (
              <button
                onClick={() => { setFilterVersion('all'); updateQueryParam('version', null); }}
                style={{ ...filterPillStyle, backgroundColor: '#000', color: '#e5ff00' }}
                title="Remove version filter"
              >
                <Sparkles size={11} /> {filterVersion} <X size={12} />
              </button>
            )}

            <button
              onClick={clearSpecFilters}
              style={{
                fontSize: '0.6875rem',
                textDecoration: 'underline',
                color: '#dc2626',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 'auto',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            
            {/* Team Filter */}
            {availableTeams.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>Team:</span>
                <select
                  value={filterTeam}
                  onChange={(e) => {
                    setFilterTeam(e.target.value);
                    updateQueryParam('team', e.target.value);
                  }}
                  style={{
                    border: filterTeam !== 'all' ? '1.5px solid #000' : '1px solid #e0e0e0',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    background: '#fff',
                    fontWeight: filterTeam !== 'all' ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Teams</option>
                  {availableTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year Filter */}
            {availableYears.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>Year:</span>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    updateQueryParam('year', e.target.value);
                  }}
                  style={{
                    border: filterYear !== 'all' ? '1.5px solid #000' : '1px solid #e0e0e0',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    background: '#fff',
                    fontWeight: filterYear !== 'all' ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Seasons</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Kit Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Kit:</span>
              <select
                value={filterKitType}
                onChange={(e) => {
                  setFilterKitType(e.target.value);
                  updateQueryParam('kit_type', e.target.value);
                }}
                style={{
                  border: filterKitType !== 'all' ? '1.5px solid #000' : '1px solid #e0e0e0',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  fontWeight: filterKitType !== 'all' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Kits</option>
                {availableKitTypes.map(k => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </div>

            {/* Quality / Version Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Version:</span>
              <select
                value={filterVersion}
                onChange={(e) => {
                  setFilterVersion(e.target.value);
                  updateQueryParam('version', e.target.value);
                }}
                style={{
                  border: filterVersion !== 'all' ? '1.5px solid #000' : '1px solid #e0e0e0',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  fontWeight: filterVersion !== 'all' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Editions</option>
                {availableVersions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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

        {/* Product Grid or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Loading jerseys archive...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed #e0e0e0', borderRadius: '4px', maxWidth: '520px', margin: '2rem auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              No Jerseys Found
            </h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              No jerseys currently match your active filters. Try clearing filters to see all available stock.
            </p>
            <button
              onClick={clearSpecFilters}
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.6rem 1.5rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </main>
  );
}
