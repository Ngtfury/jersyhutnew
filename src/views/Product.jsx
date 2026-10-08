'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useModals } from '../app/providers';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { getProducts } from '../lib/supabase';
import ProductGrid from '../components/ProductGrid';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Shield,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Product({ productId }) {
  const { addToCart } = useCart();
  const { openSizeChart } = useModals();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('details'); // 'details' | 'shipping' | 'returns'
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setAllProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const product = useMemo(() => {
    return allProducts.find(p => p.id === productId) || null;
  }, [allProducts, productId]);

  // Ensure Team is ALWAYS present (smart extraction fallback so it never displays N/A)
  const displayTeam = useMemo(() => {
    if (product?.team && product.team.trim()) return product.team.trim();
    if (product?.country && product.country.trim()) return product.country.trim();
    const name = product?.name || '';
    const knownClubs = [
      'Real Madrid', 'Barcelona', 'Barca', 'Manchester United', 'Man United',
      'Manchester City', 'Man City', 'Arsenal', 'Chelsea', 'Liverpool',
      'Bayern Munich', 'Bayern', 'PSG', 'Paris Saint-Germain', 'Juventus',
      'AC Milan', 'Inter Milan', 'Inter', 'Borussia Dortmund', 'Dortmund',
      'Atletico Madrid', 'Tottenham', 'Spurs', 'Ajax', 'Portugal', 'Argentina',
      'Brazil', 'France', 'Germany', 'Spain', 'England', 'Italy', 'Japan',
      'Netherlands', 'India', 'Al Nassr', 'Inter Miami'
    ];
    for (const club of knownClubs) {
      if (new RegExp(`\\b${club}\\b`, 'i').test(name)) {
        return club;
      }
    }
    return 'Official Club Edition';
  }, [product]);

  // Ensure Year is formatted
  const displayYear = useMemo(() => {
    if (product?.year && product.year.trim()) return product.year.trim();
    const match = product?.name?.match(/\b(19\d\d|20\d\d(-\d{2})?)\b/);
    return match ? match[0] : '2025-26';
  }, [product]);

  // Ensure Kit Type (Home/Away) is formatted
  const kitInfo = useMemo(() => {
    const raw = (product?.kit_type || product?.kitType || '').toUpperCase();
    if (raw.includes('HOME')) return { label: 'HOME KIT', param: 'HOME' };
    if (raw.includes('AWAY')) return { label: 'AWAY KIT', param: 'AWAY' };
    if (raw.includes('THIRD')) return { label: 'THIRD KIT', param: 'THIRD' };
    if (raw.includes('FOURTH')) return { label: 'FOURTH KIT', param: 'FOURTH' };
    if (raw.includes('SPECIAL')) return { label: 'SPECIAL EDITION', param: 'SPECIAL' };
    
    // Fallback based on product name
    const n = (product?.name || '').toLowerCase();
    if (n.includes('away')) return { label: 'AWAY KIT', param: 'AWAY' };
    if (n.includes('third')) return { label: 'THIRD KIT', param: 'THIRD' };
    if (n.includes('fourth')) return { label: 'FOURTH KIT', param: 'FOURTH' };
    return { label: 'HOME KIT', param: 'HOME' };
  }, [product]);

  // Ensure Quality / Version is formatted
  const displayVersion = useMemo(() => {
    return product?.version || 'MASTER QUALITY';
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product) return null;
    if (product.original_price && product.original_price > product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return null;
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || p.player === product.player))
      .slice(0, 4);
  }, [allProducts, product]);

  const handleAddToCart = () => {
    if (product) addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (product) addToCart(product, selectedSize, quantity);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleAccordion = (section) => {
    setOpenAccordion(prev => prev === section ? null : section);
  };

  if (!product) {
    return (
      <main style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.9rem', color: '#888' }}>
            {loading ? 'Loading Product...' : 'Product Not Found in Inventory.'}
          </p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '90vh', padding: '2.5rem 0 6rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#000' }}>HOME</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link
            href={`/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ color: '#000' }}
          >
            {product.category}
          </Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#666', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Product Detail Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(2rem, 5vw, 4.5rem)',
          alignItems: 'start'
        }}>
          {/* LEFT: Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Main Stage Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 5',
              backgroundColor: '#f7f7f7',
              overflow: 'hidden'
            }}>
              {product.badge && (
                <span className="product-badge" style={{ top: 16, right: 16, fontSize: '0.7rem', padding: '0.3rem 0.8rem' }}>
                  {product.badge}
                </span>
              )}
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 0.4s ease'
                }}
              />
            </div>

            {/* Thumbnail switcher if multiple images */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: '75px',
                      aspectRatio: '4 / 5',
                      border: selectedImageIndex === index ? '2px solid #000' : '1px solid #e0e0e0',
                      padding: 0,
                      backgroundColor: '#f7f7f7',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Bar: Brand, Category, Share */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
                JERSEY HUT • {product.category}
              </span>
              <button
                onClick={handleShare}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', cursor: 'pointer' }}
                title="Share link"
              >
                {copiedLink ? <Check size={14} color="#008a00" /> : <Share2 size={14} />}
                {copiedLink ? "COPIED" : "SHARE"}
              </button>
            </div>

            {/* Title */}
            <h1 className="heading-section" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', lineHeight: 1.15 }}>
              {product.name}
            </h1>

            {/* Jersey Specs Hyperlink Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '-0.75rem' }}>
              <Link
                href={`/collections/all?team=${encodeURIComponent(displayTeam)}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}
                title={`Explore all ${displayTeam} jerseys`}
              >
                <Shield size={11} color="#38bdf8" /> {displayTeam}
              </Link>

              <Link
                href={`/collections/all?year=${encodeURIComponent(product.year || displayYear)}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  backgroundColor: '#f4f4f5',
                  color: '#18181b',
                  border: '1px solid #e4e4e7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}
                title={`Explore all ${displayYear} kits`}
              >
                <Calendar size={11} /> {displayYear}
              </Link>

              <Link
                href={`/collections/all?kit_type=${encodeURIComponent(kitInfo.param)}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  backgroundColor: '#f4f4f5',
                  color: '#18181b',
                  border: '1px solid #e4e4e7',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}
                title={`Explore all ${kitInfo.label}s`}
              >
                {kitInfo.label}
              </Link>

              <Link
                href={`/collections/all?version=${encodeURIComponent(displayVersion)}`}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  backgroundColor: '#e5ff00',
                  color: '#000000',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}
                title={`Explore all ${displayVersion} jerseys`}
              >
                <Sparkles size={11} /> {displayVersion}
              </Link>
            </div>

            {/* Pricing & Savings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{product.price}</span>
              {product.original_price && (
                <span style={{ fontSize: '1.1rem', color: '#8e8e93', textDecoration: 'line-through' }}>
                  ₹{product.original_price}
                </span>
              )}
              {discountPercent && (
                <span style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem'
                }}>
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.72rem', color: '#777', marginTop: '-0.8rem' }}>
              Tax included. Free express shipping on orders above ₹999.
            </p>

            <div style={{ width: '100%', height: '1px', backgroundColor: '#e5e5e5' }} />

            {/* Size Selector & Size Chart Trigger */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  SELECT SIZE
                </span>
                <button
                  type="button"
                  onClick={openSizeChart}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', textDecoration: 'underline', color: '#000', cursor: 'pointer' }}
                >
                  <Ruler size={13} />
                  SIZE GUIDE
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {["S", "M", "L", "XL", "2XL"].map((size) => {
                  const stock = product.stock_per_size?.[size];
                  const isOutOfStock = stock === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: '54px',
                        height: '42px',
                        padding: '0 0.8rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        border: isSelected ? '2px solid #000' : '1px solid #ccc',
                        backgroundColor: isSelected ? '#000' : isOutOfStock ? '#fafafa' : '#fff',
                        color: isSelected ? '#fff' : isOutOfStock ? '#aaa' : '#000',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        textDecoration: isOutOfStock ? 'line-through' : 'none'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {product.stock_per_size?.[selectedSize] > 0 && product.stock_per_size[selectedSize] <= 3 && (
                <p style={{ fontSize: '0.72rem', color: '#c00', marginTop: '0.6rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  ⚡ Only {product.stock_per_size[selectedSize]} left in size {selectedSize} — order soon!
                </p>
              )}
            </div>

            {/* Quantity Selector & CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Quantity */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #000',
                  height: '48px',
                  width: '120px'
                }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ flex: 1, height: '100%', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ flex: 1, height: '100%', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '48px' }}
                  id="add-to-cart-btn"
                >
                  <ShoppingBag size={16} />
                  ADD TO CART
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                onClick={handleBuyNow}
                className="btn btn-secondary"
                style={{ width: '100%', height: '46px' }}
                id="buy-now-btn"
              >
                BUY IT NOW
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Guarantees Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '1rem 0',
              borderTop: '1px solid #e5e5e5',
              borderBottom: '1px solid #e5e5e5',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              <div>
                <Truck size={18} style={{ margin: '0 auto 0.3rem', color: '#000' }} />
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fast Delivery</span>
                <span style={{ fontSize: '0.65rem', color: '#777' }}>3-5 Days across India</span>
              </div>
              <div>
                <RotateCcw size={18} style={{ margin: '0 auto 0.3rem', color: '#000' }} />
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>7-Day Returns</span>
                <span style={{ fontSize: '0.65rem', color: '#777' }}>Hassle-free guarantee</span>
              </div>
              <div>
                <ShieldCheck size={18} style={{ margin: '0 auto 0.3rem', color: '#000' }} />
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>100% Verified</span>
                <span style={{ fontSize: '0.65rem', color: '#777' }}>Quality Dotknit Fabric</span>
              </div>
            </div>

            {/* Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e5e5e5' }}>
              {/* Product Specifications */}
              <div style={{ borderBottom: '1px solid #e5e5e5' }}>
                <button
                  onClick={() => toggleAccordion('details')}
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <span>PRODUCT SPECIFICATIONS & DETAILS</span>
                  {openAccordion === 'details' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordion === 'details' && (
                  <div style={{ paddingBottom: '1.25rem', fontSize: '0.8125rem', color: '#444', lineHeight: 1.6 }}>
                    
                    {/* 1. Main Description Paragraph & Contextual Hyperlinks */}
                    <div style={{ marginBottom: '1.25rem', lineHeight: 1.75 }}>
                      {product.description && (
                        <p style={{ marginBottom: '0.85rem', color: '#27272a' }}>
                          {product.description}
                        </p>
                      )}

                      {/* Styled contextual paragraph with direct hyperlinks */}
                      <div style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderLeft: '3px solid #000',
                        borderRadius: '0 4px 4px 0',
                        fontSize: '0.8125rem',
                        color: '#374151'
                      }}>
                        Official matchday specification{' '}
                        <Link
                          href={`/collections/all?kit_type=${encodeURIComponent(kitInfo.param)}`}
                          style={{ fontWeight: 700, color: '#000', textDecoration: 'underline' }}
                        >
                          {kitInfo.label}
                        </Link>{' '}
                        for{' '}
                        <Link
                          href={`/collections/all?team=${encodeURIComponent(displayTeam)}`}
                          style={{ fontWeight: 700, color: '#000', textDecoration: 'underline' }}
                        >
                          {displayTeam}
                        </Link>{' '}
                        ({' '}
                        <Link
                          href={`/collections/all?year=${encodeURIComponent(product.year || displayYear)}`}
                          style={{ fontWeight: 700, color: '#000', textDecoration: 'underline' }}
                        >
                          {displayYear}
                        </Link>{' '}
                        Season), tailored in premium{' '}
                        <Link
                          href={`/collections/all?version=${encodeURIComponent(displayVersion)}`}
                          style={{ fontWeight: 700, color: '#000', backgroundColor: '#e5ff00', padding: '1px 5px', textDecoration: 'underline' }}
                        >
                          {displayVersion}
                        </Link>{' '}
                        construction.
                      </div>
                    </div>

                    {/* 2. Interactive Hyperlink Spec Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.65rem',
                      marginBottom: '1.5rem',
                      backgroundColor: '#f4f4f5',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e4e4e7'
                    }}>
                      <Link
                        href={`/collections/all?team=${encodeURIComponent(displayTeam)}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#ffffff',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '4px',
                          border: '1px solid #e4e4e7',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', color: '#71717a', textTransform: 'uppercase' }}>
                          Team / Club
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {displayTeam} <ArrowRight size={12} />
                        </span>
                      </Link>

                      <Link
                        href={`/collections/all?year=${encodeURIComponent(product.year || displayYear)}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#ffffff',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '4px',
                          border: '1px solid #e4e4e7',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', color: '#71717a', textTransform: 'uppercase' }}>
                          Season / Year
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {displayYear} <ArrowRight size={12} />
                        </span>
                      </Link>

                      <Link
                        href={`/collections/all?kit_type=${encodeURIComponent(kitInfo.param)}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#ffffff',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '4px',
                          border: '1px solid #e4e4e7',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', color: '#71717a', textTransform: 'uppercase' }}>
                          Kit Type
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {kitInfo.label} <ArrowRight size={12} />
                        </span>
                      </Link>

                      <Link
                        href={`/collections/all?version=${encodeURIComponent(displayVersion)}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#ffffff',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '4px',
                          border: '1px solid #e4e4e7',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', color: '#71717a', textTransform: 'uppercase' }}>
                          Quality / Craft
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {displayVersion} <ArrowRight size={12} />
                        </span>
                      </Link>
                    </div>

                    {/* 3. Technical Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <span style={{ color: '#888' }}>PLAYER:</span>
                      <strong style={{ color: '#000' }}>{product.player || 'N/A'}</strong>

                      <span style={{ color: '#888' }}>CLUB / TEAM:</span>
                      <Link
                        href={`/collections/all?team=${encodeURIComponent(displayTeam)}`}
                        style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        {displayTeam}
                      </Link>

                      <span style={{ color: '#888' }}>SEASON / YEAR:</span>
                      <Link
                        href={`/collections/all?year=${encodeURIComponent(product.year || displayYear)}`}
                        style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        {displayYear}
                      </Link>

                      <span style={{ color: '#888' }}>KIT TYPE:</span>
                      <Link
                        href={`/collections/all?kit_type=${encodeURIComponent(kitInfo.param)}`}
                        style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        {kitInfo.label}
                      </Link>

                      <span style={{ color: '#888' }}>QUALITY / VERSION:</span>
                      <Link
                        href={`/collections/all?version=${encodeURIComponent(displayVersion)}`}
                        style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        {displayVersion}
                      </Link>

                      <span style={{ color: '#888' }}>EDITION:</span>
                      <strong style={{ color: '#000' }}>{product.edition || 'CLASSIC MATCHDAY'}</strong>

                      <span style={{ color: '#888' }}>MATERIAL:</span>
                      <strong style={{ color: '#000' }}>{product.material || 'PREMIUM DOTKNIT POLYESTER'}</strong>

                      <span style={{ color: '#888' }}>COLORWAY:</span>
                      <strong style={{ color: '#000' }}>
                        {product.primaryColor ? `${product.primaryColor}${product.secondaryColor ? ' / ' + product.secondaryColor : ''}` : (product.color || 'OFFICIAL PALETTE')}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div style={{ borderBottom: '1px solid #e5e5e5' }}>
                <button
                  onClick={() => toggleAccordion('shipping')}
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <span>SHIPPING & DELIVERY</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordion === 'shipping' && (
                  <div style={{ paddingBottom: '1.25rem', fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                    <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li>Orders dispatched within 24 hours of payment verification.</li>
                      <li>Free express tracked shipping across India for all carts over ₹999.</li>
                      <li>Estimated delivery: Metro cities 2-3 business days; rest of India 4-5 business days.</li>
                      <li>Live SMS & WhatsApp tracking link sent immediately upon shipment.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Returns & Exchange */}
              <div style={{ borderBottom: '1px solid #e5e5e5' }}>
                <button
                  onClick={() => toggleAccordion('returns')}
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <span>7-DAY RETURNS & SIZE EXCHANGES</span>
                  {openAccordion === 'returns' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordion === 'returns' && (
                  <div style={{ paddingBottom: '1.25rem', fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                    <p>
                      If your jersey doesn't fit exactly as you hoped, we offer a hassle-free 7-day exchange or refund guarantee. Just retain original tags and packaging, and message our support team on WhatsApp for prompt doorstep pickup.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED KITS SECTION */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5.5rem', paddingTop: '3.5rem', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="heading-sub">YOU MIGHT ALSO LIKE</span>
              <h2 className="heading-section" style={{ marginTop: '0.4rem' }}>RELATED JERSEYS</h2>
            </div>
            <ProductGrid
              products={relatedProducts}
            />
          </div>
        )}
      </div>
    </main>
  );
}
