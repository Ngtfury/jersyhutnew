'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useModals } from '../app/providers';
import { getCategories, DEFAULT_CATEGORIES } from '../lib/supabase';

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const { openSearch } = useSearch();
  const { openAccount } = useModals();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 44 });
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const loadNavCategories = () => {
      getCategories().then(data => {
        if (data && data.length > 0) setCategories(data);
      }).catch(console.error);
    };

    loadNavCategories();
    window.addEventListener('jerseyhut_categories_updated', loadNavCategories);
    window.addEventListener('storage', loadNavCategories);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('jerseyhut_categories_updated', loadNavCategories);
      window.removeEventListener('storage', loadNavCategories);
    };
  }, []);

  // Simple countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: "HOME", path: "/" },
    ...categories.map(c => {
      const slug = c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const path = (slug === 'oversized-t' || slug === 'oversized') ? '/collections/oversized' : `/collections/${slug}`;
      return {
        label: c.name,
        path: path,
      };
    }),
    { label: "ABOUT US", path: "/pages/about-us" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="announcement-bar" suppressHydrationWarning>
          <div className="countdown" suppressHydrationWarning>
            <span>SALE ENDS IN:</span>
            <span>00d</span> :
            <span suppressHydrationWarning>{mounted ? String(countdown.hours).padStart(2, '0') : '23'}h</span> :
            <span suppressHydrationWarning>{mounted ? String(countdown.minutes).padStart(2, '0') : '59'}m</span> :
            <span suppressHydrationWarning>{mounted ? String(countdown.seconds).padStart(2, '0') : '44'}s</span>
          </div>
          <button 
            onClick={() => setShowAnnouncement(false)} 
            style={{ color: 'rgba(255,255,255,0.5)', padding: '2px', cursor: 'pointer' }}
            aria-label="Close Announcement"
            suppressHydrationWarning
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Mobile Left: Hamburger menu */}
          <div className="hamburger-btn">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="action-btn"
              suppressHydrationWarning
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Desktop Left: JERSEY HUT Logo */}
          <Link 
            href="/" 
            className="header-logo"
            aria-label="Jersey Hut Home"
          >
            JERSEY HUT
            <span className="header-logo-accent"></span>
          </Link>

          {/* Desktop Center: Navigation */}
          <nav className="header-nav" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Utilities: Search, Account, Cart */}
          <div className="header-actions">
            <button 
              onClick={openSearch}
              className="action-btn"
              aria-label="Search Jerseys"
              suppressHydrationWarning
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            <button 
              onClick={openAccount}
              className="action-btn"
              aria-label="Customer Account"
              suppressHydrationWarning
            >
              <User size={19} strokeWidth={1.8} />
            </button>

            <button 
              onClick={openCart}
              className="action-btn"
              aria-label={`Shopping Bag containing ${totalCount} items`}
              suppressHydrationWarning
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              {totalCount > 0 && (
                <span className="cart-badge">{totalCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span className="header-logo" style={{ fontSize: '1.1rem' }}>
            JERSEY HUT
          </span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{ color: '#fff', padding: '0.5rem' }}
            suppressHydrationWarning
          >
            <X size={24} />
          </button>
        </div>

        <ul className="mobile-nav-links">
          {navLinks.map((item) => (
            <li key={item.path} className="mobile-nav-item">
              <Link
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-nav-footer">
          <button 
            onClick={() => { setMobileMenuOpen(false); openSearch(); }}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            suppressHydrationWarning
          >
            <Search size={18} />
            Search Catalog
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); openAccount(); }}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            suppressHydrationWarning
          >
            <User size={18} />
            My Account
          </button>
        </div>
      </div>
    </>
  );
}
